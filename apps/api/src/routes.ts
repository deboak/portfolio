import { Router } from 'express';
import { adminAuthRouter,authRouter } from './modules/auth/index.js';
import { adminContentRouter, publicContentRouter } from './modules/content/index.js';
import { analyticsRouter } from './modules/analytics/index.js';
import { adminContactRouter,contactRouter } from './modules/contact/index.js';
import { mediaRouter,resumeRouter } from './modules/media/index.js';
import { webhookRouter } from './modules/webhooks/index.js';
import { notificationRouter } from './modules/notifications/index.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ status: 'ok' }));
apiRouter.use(publicContentRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminContentRouter);
apiRouter.use('/admin', analyticsRouter);
apiRouter.use('/contact',contactRouter);
apiRouter.use(resumeRouter);
apiRouter.use('/webhooks',webhookRouter);
apiRouter.use('/admin',adminContactRouter);
apiRouter.use('/admin',mediaRouter);
apiRouter.use('/admin',adminAuthRouter);
apiRouter.use('/admin',notificationRouter);
