import crypto from 'node:crypto';
import type { Queue } from 'bullmq';
import { AppError } from '../../lib/errors.js';
import type { WebhookReplayRepository } from './webhook.repository.js';
import { verifyWebhookSignature } from './webhook.signature.js';
type IncomingEvent = {
  id: string;
  type: string;
  data: Record<string, unknown>;
};
export class WebhookService {
  constructor(
    private readonly repository: WebhookReplayRepository,
    private readonly queue: Pick<Queue, 'add'>,
    private readonly secret: string | undefined,
    private readonly toleranceSeconds: number,
  ) {}
  async receive(input: {
    provider: string;
    event: IncomingEvent;
    timestamp: string;
    signature: string;
    rawBody: Buffer;
  }) {
    if (!this.secret)
      throw new AppError(503, 'Incoming webhooks are not configured', 'WEBHOOK_NOT_CONFIGURED');
    if (
      !verifyWebhookSignature({
        secret: this.secret,
        timestamp: input.timestamp,
        signature: input.signature,
        rawBody: input.rawBody,
        toleranceSeconds: this.toleranceSeconds,
      })
    )
      throw new AppError(401, 'Invalid or expired webhook signature', 'INVALID_WEBHOOK_SIGNATURE');
    const replayKey = `webhook:received:${input.provider}:${input.event.id}`;
    const accepted = await this.repository.reserve(replayKey);
    if (!accepted) return { duplicate: true };
    try {
      await this.queue.add(
        'process-event',
        {
          provider: input.provider,
          event: input.event,
          receivedAt: new Date().toISOString(),
        },
        {
          jobId: `webhook-${crypto.createHash('sha256').update(`${input.provider}:${input.event.id}`).digest('hex')}`,
        },
      );
    } catch (error) {
      await this.repository.release(replayKey);
      throw error;
    }
    return { duplicate: false };
  }
}
