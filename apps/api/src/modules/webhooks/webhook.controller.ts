import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { redis } from '../../lib/redis.js';
import { incomingWebhookQueue } from '../jobs/index.js';
import { verifyWebhookSignature } from './webhook.signature.js';

export const webhookController = {
  async receive(req: Request, res: Response, next: NextFunction) {
    try {
      if (!env.INCOMING_WEBHOOK_SECRET) throw new AppError(503, 'Incoming webhooks are not configured', 'WEBHOOK_NOT_CONFIGURED');
      const timestamp = req.header('x-webhook-timestamp') ?? '';
      const signature = req.header('x-webhook-signature') ?? '';
      const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));
      if (!verifyWebhookSignature({ secret: env.INCOMING_WEBHOOK_SECRET, timestamp, signature, rawBody, toleranceSeconds: env.WEBHOOK_TOLERANCE_SECONDS })) throw new AppError(401, 'Invalid or expired webhook signature', 'INVALID_WEBHOOK_SIGNATURE');
      const replayKey = `webhook:received:${req.params.provider}:${req.body.id}`;
      const accepted = await redis.set(replayKey, '1', 'EX', 86_400, 'NX');
      if (!accepted) { res.status(200).json({ received: true, duplicate: true }); return; }
      try { await incomingWebhookQueue.add('process-event', { provider:req.params.provider, event:req.body, receivedAt:new Date().toISOString() }, { jobId:`webhook-${crypto.createHash('sha256').update(`${req.params.provider}:${req.body.id}`).digest('hex')}` }); }
      catch (error) { await redis.del(replayKey); throw error; }
      res.status(202).json({ received: true });
    } catch (error) { next(error); }
  },
};
