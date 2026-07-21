import { cache } from '../../lib/cache.js';
import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import { AnalyticsController } from './analytics.controller.js';
import { AnalyticsService } from './analytics.service.js';
export const analyticsService = new AnalyticsService(prisma, redis, cache);
export const analyticsController = new AnalyticsController(analyticsService);
