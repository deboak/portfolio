import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { adminController, authController, requireAuth, requireCsrf } from './auth.module.js';
import { loginInput } from './auth.schemas.js';
import { createAdminInput } from './auth.schemas.js';
import { loginRateLimiter } from './auth.rate-limiter.js';

export const authRouter = Router();
authRouter.post('/login', loginRateLimiter, validate(loginInput), authController.login);
authRouter.get('/csrf', authController.csrf);
authRouter.post('/refresh', requireCsrf, authController.refresh);
authRouter.post('/logout', requireCsrf, authController.logout);
authRouter.get('/me', requireAuth, authController.me);

export const adminAuthRouter = Router();
adminAuthRouter.use(requireAuth);
adminAuthRouter.get('/admins', adminController.list);
adminAuthRouter.post('/admins', requireCsrf, validate(createAdminInput), adminController.create);
