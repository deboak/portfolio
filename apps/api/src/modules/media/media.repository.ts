import type { PrismaClient } from '@prisma/client';
export class MediaRepository {
  constructor(private readonly prisma: PrismaClient) {}
  create(originalKey: string, contentType: string, ready = false) {
    return this.prisma.mediaAsset.create({
      data: { originalKey, contentType, status: ready ? 'READY' : 'PENDING' },
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
  byId(id: string) {
    return this.prisma.mediaAsset.findUnique({ where: { id } });
  }
}
