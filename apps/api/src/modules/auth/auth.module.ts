import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { AdminRepository, AuthRepository } from './auth.repository.js';
import { AuthController } from './auth.controller.js';
import { createAuthMiddleware } from './auth.middleware.js';
import { AuthService } from './auth.service.js';
import { tokenService } from './token.service.js';
export const authService = new AuthService(
  new AuthRepository(prisma),
  tokenService,
  env.REFRESH_TOKEN_DAYS,
);
export const adminService = new AdminService(new AdminRepository(prisma));
export const authController = new AuthController(
  authService,
  tokenService,
  env.NODE_ENV === 'production',
  env.REFRESH_TOKEN_DAYS,
);
export const adminController = new AdminController(adminService);
export const { requireAuth, requireCsrf } = createAuthMiddleware(tokenService);
