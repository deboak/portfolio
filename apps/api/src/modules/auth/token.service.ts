import crypto from 'node:crypto';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.js';

type TokenClaims = JwtPayload & { sub: string; email: string; type: 'access' | 'refresh'; jti?: string };

export const tokenService = {
  access(admin: { id: string; email: string }) {
    return jwt.sign({ email: admin.email, type: 'access' }, env.JWT_ACCESS_SECRET, { subject: admin.id, expiresIn: env.ACCESS_TOKEN_TTL } as SignOptions);
  },
  refresh(admin: { id: string; email: string }, id: string) {
    return jwt.sign({ email: admin.email, type: 'refresh' }, env.JWT_REFRESH_SECRET, { subject: admin.id, jwtid: id, expiresIn: `${env.REFRESH_TOKEN_DAYS}d` });
  },
  verifyAccess(token: string) { return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenClaims; },
  verifyRefresh(token: string) { return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenClaims; },
  hash(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); },
  csrf() { return crypto.randomBytes(32).toString('hex'); }
};
