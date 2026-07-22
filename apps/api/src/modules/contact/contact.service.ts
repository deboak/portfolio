import type { Queue } from 'bullmq';
import { AppError } from '../../lib/errors.js';
import type { AdminNotification } from '../notifications/index.js';
import type { ContactRepository } from './contact.repository.js';
import type { ContactInput, ContactListQuery } from './contact.schemas.js';

type Notifier = (notification: AdminNotification) => Promise<void>;

export class ContactService {
  constructor(
    private readonly repository: ContactRepository,
    private readonly contactQueue: Pick<Queue, 'add'>,
    private readonly webhookQueue: Pick<Queue, 'add'>,
    private readonly notify: Notifier,
  ) {}

  async submit(data: ContactInput) {
    const item = await this.repository.create(data);
    try {
      await Promise.all([
        this.contactQueue.add(
          'send-contact-email',
          { submissionId: item.id },
          { jobId: `contact-email-${item.id}` },
        ),
        this.webhookQueue.add(
          'contact-submitted',
          { submissionId: item.id },
          { jobId: `contact-webhook-${item.id}` },
        ),
      ]);

      await this.notify({
        id: `contact-submitted-${item.id}`,
        type: 'contact.submitted',
        title: 'New contact message',
        message: `${item.name}: ${item.subject}`,
        createdAt: new Date().toISOString(),
        data: { submissionId: item.id },
      });

      return item;
    } catch {
      await this.repository.markQueueFailed(item.id);
      throw new AppError(
        503,
        'Message saved, but delivery is temporarily unavailable',
        'QUEUE_UNAVAILABLE',
      );
    }
  }

  async list(page: ContactListQuery) {
    const { items, total } = await this.repository.list(page);
    const hasMore = items.length > page.limit;
    const data = hasMore ? items.slice(0, page.limit) : items;
    return {
      items: data,
      meta: {
        total,
        limit: page.limit,
        nextCursor: hasMore ? data.at(-1)!.id : null,
      },
    };
  }

  async get(id: string) {
    const item = await this.repository.get(id);
    if (!item) throw new AppError(404, 'Contact submission not found', 'NOT_FOUND');
    return item;
  }
}
