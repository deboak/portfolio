import type { PrismaClient } from '@prisma/client';
import type { ContactInput, ContactListQuery } from './contact.schemas.js';

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
  async list(page: ContactListQuery) {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' },
        take: page.limit + 1,
        ...(page.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
      }),
      this.prisma.contactSubmission.count(),
    ]);
    return { items, total };
  }
  get(id: string) {
    return this.prisma.contactSubmission.findUnique({ where: { id } });
  }
}
