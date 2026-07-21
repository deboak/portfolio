import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { OutgoingWebhookService } from './webhook.outgoing.js';
export const outgoingWebhookService = new OutgoingWebhookService(
  prisma,
  env.OUTGOING_WEBHOOK_URL,
  env.OUTGOING_WEBHOOK_SECRET,
);
