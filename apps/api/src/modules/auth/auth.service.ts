import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { AppError } from '../../lib/errors.js';
import type { AuthRepository } from './auth.repository.js';
import type { LoginInput } from './auth.schemas.js';
import type { TokenService } from './token.service.js';
const MAX_FAILURES = 5,
  LOCK_MINUTES = 15,
  INVALID = 'Invalid email or password',
  DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12);
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokens: TokenService,
    private readonly refreshDays: number,
  ) {}
  private async issue(admin: { id: string; email: string }) {
    const id = crypto.randomUUID();
    const refreshToken = this.tokens.refresh(admin, id);
    const expiresAt = new Date(Date.now() + this.refreshDays * 86_400_000);
    await this.repository.createSession({
      id,
      adminId: admin.id,
      tokenHash: this.tokens.hash(refreshToken),
      expiresAt,
    });
    return {
      accessToken: this.tokens.access(admin),
      refreshToken,
      expiresAt,
      csrfToken: this.tokens.csrf(),
      admin: { id: admin.id, email: admin.email },
    };
  }
  async login(input: LoginInput) {
    const admin = await this.repository.findAdmin(input.email);
    if (!admin) {
      await bcrypt.compare(input.password, DUMMY_HASH);
      throw new AppError(401, INVALID, 'INVALID_CREDENTIALS');
    }
    if (admin.lockedUntil && admin.lockedUntil > new Date())
      throw new AppError(423, 'Account temporarily locked', 'ACCOUNT_LOCKED');
    if (!(await bcrypt.compare(input.password, admin.passwordHash))) {
      const attempts = admin.failedLoginAttempts + 1;
      await this.repository.updateFailures(
        admin.id,
        attempts >= MAX_FAILURES ? 0 : attempts,
        attempts >= MAX_FAILURES ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null,
      );
      throw new AppError(401, INVALID, 'INVALID_CREDENTIALS');
    }
    await this.repository.resetFailures(admin.id);
    return this.issue(admin);
  }
  async refresh(rawToken: string) {
    let claims;
    try {
      claims = this.tokens.verifyRefresh(rawToken);
    } catch {
      throw new AppError(401, 'Refresh session is invalid', 'INVALID_REFRESH_TOKEN');
    }
    if (claims.type !== 'refresh' || !claims.sub || !claims.jti)
      throw new AppError(401, 'Refresh session is invalid', 'INVALID_REFRESH_TOKEN');
    const session = await this.repository.findSession(claims.jti);
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.tokenHash !== this.tokens.hash(rawToken)
    ) {
      if (session) await this.repository.revokeAdminSessions(session.adminId);
      throw new AppError(401, 'Refresh session is invalid', 'INVALID_REFRESH_TOKEN');
    }
    await this.repository.revokeSession(session.id);
    return this.issue(session.admin);
  }
  async logout(rawToken?: string) {
    if (rawToken) await this.repository.revokeByHash(this.tokens.hash(rawToken));
  }
}
