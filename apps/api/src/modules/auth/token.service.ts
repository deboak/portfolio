import crypto from 'node:crypto';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';
type TokenClaims = JwtPayload & {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
  jti?: string;
};
export class TokenService {
  constructor(
    private readonly accessSecret: string,
    private readonly refreshSecret: string,
    private readonly accessTtl: string,
    private readonly refreshDays: number,
  ) {}
  access(admin: { id: string; email: string }) {
    return jwt.sign({ email: admin.email, type: 'access' }, this.accessSecret, {
      subject: admin.id,
      expiresIn: this.accessTtl,
    } as SignOptions);
  }
  refresh(admin: { id: string; email: string }, id: string) {
    return jwt.sign({ email: admin.email, type: 'refresh' }, this.refreshSecret, {
      subject: admin.id,
      jwtid: id,
      expiresIn: `${this.refreshDays}d`,
    });
  }
  verifyAccess(token: string) {
    return jwt.verify(token, this.accessSecret) as TokenClaims;
  }
  verifyRefresh(token: string) {
    return jwt.verify(token, this.refreshSecret) as TokenClaims;
  }
  hash(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
  csrf() {
    return crypto.randomBytes(32).toString('hex');
  }
}
export const tokenService = new TokenService(
  env.JWT_ACCESS_SECRET,
  env.JWT_REFRESH_SECRET,
  env.ACCESS_TOKEN_TTL,
  env.REFRESH_TOKEN_DAYS,
);
