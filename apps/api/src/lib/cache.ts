import { env } from '../config/env.js';
import { redis } from './redis.js';

async function safely<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try { return await operation(); } catch { return fallback; }
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await safely(() => redis.get(key), null);
    if (!value) return null;
    try { return JSON.parse(value) as T; } catch { return null; }
  },
  async set(key: string, value: unknown, ttl = env.CACHE_TTL_SECONDS) {
    await safely(() => redis.set(key, JSON.stringify(value), 'EX', ttl), null);
  },
  async deleteByPrefix(prefix: string) {
    const keys = await safely(async()=>{const found:string[]=[];let cursor='0';do{const[next,batch]=await redis.scan(cursor,'MATCH',`${prefix}*`,'COUNT',100);cursor=next;found.push(...batch)}while(cursor!=='0');return found}, [] as string[]);
    if (keys.length) await safely(() => redis.del(...keys), 0);
  }
};
