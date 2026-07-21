import type { PrismaClient } from '@prisma/client';
import type { ContactInput } from './contact.schemas.js';

export class ContactRepository {
  constructor(private readonly prisma: PrismaClient) {}
  create(data: ContactInput) {
    return this.prisma.contactSubmission.create({ data });
  }
  markQueueFailed(id: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status: 'FAILED', error: 'Queue unavailable' },
    });
  }
  list() {
    return this.prisma.contactSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
