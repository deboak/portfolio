import { Router } from 'express';
import { requireAuth } from '../auth/index.js';
import { notificationController } from './notification.module.js';
export const notificationRouter = Router();
notificationRouter.get('/notifications/stream', requireAuth, notificationController.stream);
