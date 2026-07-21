import { Redis } from 'ioredis';
import { env } from '../../config/env.js';

export const jobConnection = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});
jobConnection.on('error', (error) => console.error('Job Redis connection error', error.message));
