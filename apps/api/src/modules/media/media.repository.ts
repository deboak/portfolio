import type { PrismaClient } from '@prisma/client';
export class MediaRepository {
  constructor(private readonly prisma: PrismaClient) {}
  create(originalKey: string, contentType: string) {
    return this.prisma.mediaAsset.create({
      data: { originalKey, contentType },
    });
  }
  markQueueFailed(id: string) {
    return this.prisma.mediaAsset.update({
      where: { id },
      data: { status: 'FAILED', error: 'Queue unavailable' },
    });
  }
  list() {
    return this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
