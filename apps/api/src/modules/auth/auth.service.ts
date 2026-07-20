import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/errors.js';
import { env } from '../../config/env.js';
import { tokenService } from './token.service.js';
import type { LoginInput } from './auth.schemas.js';

const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
const INVALID = 'Invalid email or password';
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);

async function issue(admin: { id: string; email: string }) {
  const id = crypto.randomUUID();
  const refreshToken = tokenService.refresh(admin, id);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 86_400_000);
  await prisma.refreshSession.create({ data: { id, adminId: admin.id, tokenHash: tokenService.hash(refreshToken), expiresAt } });
  return { accessToken: tokenService.access(admin), refreshToken, expiresAt, csrfToken: tokenService.csrf(), admin: { id: admin.id, email: admin.email } };
}

export const authService = {
  async login(input: LoginInput) {
    const admin = await prisma.admin.findUnique({ where: { email: input.email } });
    if (!admin) { await bcrypt.compare(input.password, DUMMY_HASH); throw new AppError(401, INVALID, 'INVALID_CREDENTIALS'); }
    if (admin.lockedUntil && admin.lockedUntil > new Date()) throw new AppError(423, 'Account temporarily locked', 'ACCOUNT_LOCKED');
    if (!(await bcrypt.compare(input.password, admin.passwordHash))) {
      const attempts = admin.failedLoginAttempts + 1;
      await prisma.admin.update({ where: { id: admin.id }, data: { failedLoginAttempts: attempts >= MAX_FAILURES ? 0 : attempts, lockedUntil: attempts >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null } });
      throw new AppError(401, INVALID, 'INVALID_CREDENTIALS');
    }
    await prisma.admin.update({ where: { id: admin.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
    return issue(admin);
  },
  async refresh(rawToken: string) {
    let claims;
    try { claims = tokenService.verifyRefresh(rawToken); } catch { throw new AppError(401, 'Refresh session is invalid', 'INVALID_REFRESH_TOKEN'); }
    if (claims.type !== 'refresh' || !claims.sub || !claims.jti) throw new AppError(401, 'Refresh session is invalid', 'INVALID_REFRESH_TOKEN');
    const session = await prisma.refreshSession.findUnique({ where: { id: claims.jti }, include: { admin: true } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.tokenHash !== tokenService.hash(rawToken)) {
      if (session) await prisma.refreshSession.updateMany({ where: { adminId: session.adminId, revokedAt: null }, data: { revokedAt: new Date() } });
      throw new AppError(401, 'Refresh session is invalid', 'INVALID_REFRESH_TOKEN');
    }
    await prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    return issue(session.admin);
  },
  async logout(rawToken?: string) {
    if (!rawToken) return;
    await prisma.refreshSession.updateMany({ where: { tokenHash: tokenService.hash(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }
};
