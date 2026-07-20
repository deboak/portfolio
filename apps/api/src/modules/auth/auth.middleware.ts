import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../lib/errors.js';
import { tokenService } from './token.service.js';

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) return next(new AppError(401, 'Authentication required', 'UNAUTHORIZED'));
  try {
    const claims = tokenService.verifyAccess(token);
    if (claims.type !== 'access' || !claims.sub) throw new Error('Invalid claims');
    req.user = { id: claims.sub, email: claims.email };
    next();
  } catch { next(new AppError(401, 'Access token is invalid or expired', 'UNAUTHORIZED')); }
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  const cookie = req.cookies?.csrf_token as string | undefined;
  const header = req.header('x-csrf-token');
  if (!cookie || !header || cookie.length !== header.length || !crypto.timingSafeEqual(Buffer.from(cookie), Buffer.from(header))) {
    return next(new AppError(403, 'CSRF validation failed', 'CSRF_INVALID'));
  }
  next();
}
