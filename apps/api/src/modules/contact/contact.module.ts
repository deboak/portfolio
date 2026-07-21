import { prisma } from '../../lib/prisma.js';
import { contactQueue, outgoingWebhookQueue } from '../jobs/index.js';
import { notificationService } from '../notifications/index.js';
import { ContactController } from './contact.controller.js';
import { ContactRepository } from './contact.repository.js';
import { ContactService } from './contact.service.js';
const repository = new ContactRepository(prisma);
export const contactService = new ContactService(
  repository,
  contactQueue,
  outgoingWebhookQueue,
  (event) => notificationService.publish(event),
);
export const contactController = new ContactController(contactService);
