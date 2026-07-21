import type { PrismaClient } from '@prisma/client';
import { signWebhook } from './webhook.signature.js';
type Fetcher = typeof fetch;
export class OutgoingWebhookService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly url: string | undefined,
    private readonly secret: string | undefined,
    private readonly fetcher: Fetcher = fetch,
  ) {}
  async deliverContact(submissionId: string) {
    if (!this.url) return;
    const contact = await this.prisma.contactSubmission.findUniqueOrThrow({
      where: { id: submissionId },
    });
    const event = {
      id: contact.id,
      type: 'contact.submitted',
      data: {
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        message: contact.message,
        createdAt: contact.createdAt.toISOString(),
      },
    };
    const summary = `New portfolio contact from ${contact.name} (${contact.email}): ${contact.subject}`;
    const body = JSON.stringify({ text: summary, content: summary, event });
    const timestamp = String(Math.floor(Date.now() / 1000));
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'user-agent': 'portfolio-webhooks/1.0',
    };
    if (this.secret) {
      headers['x-webhook-timestamp'] = timestamp;
      headers['x-webhook-signature'] = signWebhook(this.secret, timestamp, body);
    }
    const response = await this.fetcher(this.url, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Outgoing webhook returned HTTP ${response.status}`);
  }
}
