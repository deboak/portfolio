import type { PrismaClient } from '@prisma/client';
import type { Redis } from 'ioredis';
import type { cache } from '../../lib/cache.js';
export type ContentKind = 'project' | 'post';
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly redis: Redis,
    private readonly cacheStore: typeof cache,
  ) {}
  private viewKey(kind: ContentKind, id: string) {
    return `views:${kind}:${id}`;
  }
  private async redisKeys(pattern: string) {
    const keys: string[] = [];
    let cursor = '0';
    do {
      const [next, batch] = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = next;
      keys.push(...batch);
    } while (cursor !== '0');
    return keys;
  }
  async increment(kind: ContentKind, id: string) {
    try {
      await this.redis.incr(this.viewKey(kind, id));
    } catch {
      /* Deliberately skip views while Redis is unavailable. */
    }
  }
  async flushViews() {
    let locked = false;
    try {
      locked = (await this.redis.set('locks:view-flush', '1', 'PX', 55_000, 'NX')) === 'OK';
      if (!locked) return;
      for (const key of await this.redisKeys('views:*')) {
        const [, kind, id] = key.split(':');
        if (!id || (kind !== 'project' && kind !== 'post')) continue;
        const raw = await this.redis.getdel(key);
        const amount = Number(raw ?? 0);
        if (!Number.isSafeInteger(amount) || amount <= 0) continue;
        try {
          if (kind === 'project')
            await this.prisma.project.update({
              where: { id },
              data: { viewCount: { increment: amount } },
            });
          else
            await this.prisma.post.update({
              where: { id },
              data: { viewCount: { increment: amount } },
            });
        } catch {
          await this.redis.incrby(key, amount);
        }
      }
      await this.cacheStore.deleteByPrefix('analytics:top');
    } catch {
      /* A later interval retries. */
    } finally {
      if (locked) await this.redis.del('locks:view-flush').catch(() => 0);
    }
  }
  async topContent() {
    const cached = await this.cacheStore.get<unknown>('analytics:top');
    if (cached) return cached;
    const [projects, posts] = await Promise.all([
      this.prisma.project.findMany({
        where: { published: true },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true },
      }),
      this.prisma.post.findMany({
        where: { published: true },
        orderBy: { viewCount: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, viewCount: true },
      }),
    ]);
    const value = { projects, posts };
    await this.cacheStore.set('analytics:top', value, 60);
    return value;
  }
}
