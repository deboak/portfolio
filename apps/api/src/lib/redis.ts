import { Redis } from 'ioredis';
import { env } from '../config/env.js';

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  connectTimeout: 1_500,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy: (attempt: number) => attempt <= 3 ? Math.min(attempt * 250, 1_000) : null
});

redis.on('error', (error: Error) => {
  if (env.NODE_ENV !== 'test') console.warn('Redis unavailable; using degraded behavior', error.message);
});

export async function connectRedis() {
  if (redis.status === 'ready') return true;
  try { await redis.connect(); return true; } catch { return false; }
}

export async function closeRedis() {
  if (redis.status === 'ready' || redis.status === 'connect') await redis.quit();
  else redis.disconnect();
}
