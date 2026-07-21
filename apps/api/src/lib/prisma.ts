import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

const databaseUrl = new URL(env.DATABASE_URL);
if (!databaseUrl.searchParams.has('connection_limit'))
  databaseUrl.searchParams.set('connection_limit', String(env.DATABASE_POOL_MAX));
if (!databaseUrl.searchParams.has('pool_timeout'))
  databaseUrl.searchParams.set('pool_timeout', String(env.DATABASE_POOL_TIMEOUT_SECONDS));

export const prisma = new PrismaClient({
  datasources: { db: { url: databaseUrl.toString() } },
});
