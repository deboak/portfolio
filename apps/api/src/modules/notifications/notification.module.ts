import { env } from '../../config/env.js';
import { redis } from '../../lib/redis.js';
import { NotificationController } from './notification.controller.js';
import { NotificationService } from './notification.service.js';
export const notificationService = new NotificationService(redis, env.REDIS_URL, env.NODE_ENV);
export const notificationController = new NotificationController(notificationService);
export const publishNotification = notificationService.publish.bind(notificationService);
export const closeNotificationHub = notificationService.close.bind(notificationService);
