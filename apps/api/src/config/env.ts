import { resolve } from 'node:path';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ path: [resolve(process.cwd(), '.env'), resolve(process.cwd(), '../../.env')] });

const optionalEmail = z.preprocess(value => value === '' ? undefined : value, z.string().email().optional());
const optionalUrl = z.preprocess(value => value === '' ? undefined : value, z.string().url().optional());

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1).default('postgresql://portfolio:portfolio@localhost:5432/portfolio?schema=public'),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(50).default(10),
  DATABASE_POOL_TIMEOUT_SECONDS: z.coerce.number().int().min(1).max(60).default(10),
  REDIS_URL: z.string().min(1).default('redis://localhost:6379'),
  CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  VIEW_FLUSH_INTERVAL_MS: z.coerce.number().int().positive().default(60_000),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Portfolio <onboarding@resend.dev>'),
  ADMIN_NOTIFICATION_EMAIL: optionalEmail,
  SENTRY_DSN: optionalUrl,
  OUTGOING_WEBHOOK_URL: optionalUrl,
  OUTGOING_WEBHOOK_SECRET: z.preprocess(value => value === '' ? undefined : value, z.string().min(32).optional()),
  INCOMING_WEBHOOK_SECRET: z.preprocess(value => value === '' ? undefined : value, z.string().min(32).optional()),
  WEBHOOK_TOLERANCE_SECONDS: z.coerce.number().int().positive().default(300),
  R2_ENDPOINT: optionalUrl,
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_RESUME_KEY: z.string().min(1).optional(),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().int().min(60).max(900).default(300),
  RUN_WORKER_IN_API: z.string().transform(value=>value==='true').default('false'),
  WEB_ORIGIN: z.string().url().default('http://localhost:3001'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me-now'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(7)
});

export const env = schema.parse(process.env);
if (env.NODE_ENV === 'production' && (env.JWT_ACCESS_SECRET.startsWith('development-') || env.JWT_REFRESH_SECRET.startsWith('development-'))) {
  throw new Error('Production JWT secrets must be explicitly configured');
}
if (env.NODE_ENV === 'production' && !env.INCOMING_WEBHOOK_SECRET) throw new Error('INCOMING_WEBHOOK_SECRET is required in production');
if (env.NODE_ENV === 'production' && !env.WEB_ORIGIN.startsWith('https://')) throw new Error('WEB_ORIGIN must use HTTPS in production');
