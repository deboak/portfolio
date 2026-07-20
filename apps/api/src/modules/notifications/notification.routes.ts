import { Router } from 'express';
import { requireAuth } from '../auth/index.js';
import { streamNotifications } from './notification.controller.js';
export const notificationRouter=Router();notificationRouter.get('/notifications/stream',requireAuth,streamNotifications);
