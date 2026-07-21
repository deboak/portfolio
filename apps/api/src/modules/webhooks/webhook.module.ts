import { env } from '../../config/env.js';
import { redis } from '../../lib/redis.js';
import { incomingWebhookQueue } from '../jobs/index.js';
import { WebhookController } from './webhook.controller.js';
import { WebhookReplayRepository } from './webhook.repository.js';
import { WebhookService } from './webhook.service.js';
export const webhookService = new WebhookService(
  new WebhookReplayRepository(redis),
  incomingWebhookQueue,
  env.INCOMING_WEBHOOK_SECRET,
  env.WEBHOOK_TOLERANCE_SECONDS,
);
export const webhookController = new WebhookController(webhookService);
