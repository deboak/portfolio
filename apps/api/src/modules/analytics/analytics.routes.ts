import { Router } from 'express';
import { requireAuth } from '../auth/index.js';
import { analyticsController } from './analytics.module.js';
export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.get('/stats', analyticsController.stats);
