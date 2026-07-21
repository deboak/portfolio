import type { Redis } from 'ioredis';
export class WebhookReplayRepository {
  constructor(private readonly redis: Redis) {}
  reserve(key: string) {
    return this.redis.set(key, '1', 'EX', 86_400, 'NX');
  }
  release(key: string) {
    return this.redis.del(key);
  }
}
