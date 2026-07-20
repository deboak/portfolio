import type { CookieOptions, Request, Response } from 'express';
import type { RequestHandler } from 'express';
import { env } from '../../config/env.js';
import { AppError } from '../../lib/errors.js';
import { authService } from './auth.service.js';
import type { LoginInput } from './auth.schemas.js';

const REFRESH_COOKIE = 'refresh_token';
const secure = env.NODE_ENV === 'production';
const sameSite: CookieOptions['sameSite'] = secure ? 'none' : 'strict';
const refreshOptions: CookieOptions = { httpOnly: true, secure, sameSite, path: '/api/v1/auth', maxAge: env.REFRESH_TOKEN_DAYS * 86_400_000 };
const csrfOptions: CookieOptions = { httpOnly: false, secure, sameSite, path: '/', maxAge: env.REFRESH_TOKEN_DAYS * 86_400_000 };
const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function sendSession(res: Response, session: Awaited<ReturnType<typeof authService.login>>) {
  res.cookie(REFRESH_COOKIE, session.refreshToken, refreshOptions);
  res.cookie('csrf_token', session.csrfToken, csrfOptions);
  res.json({ data: { accessToken: session.accessToken, csrfToken: session.csrfToken, admin: session.admin } });
}

export const authController = {
  csrf: asyncHandler(async (_req, res) => { const csrfToken = (await import('./token.service.js')).tokenService.csrf(); res.cookie('csrf_token', csrfToken, csrfOptions); res.json({ data: { csrfToken } }); }),
  login: asyncHandler(async (req, res) => sendSession(res, await authService.login(req.body as LoginInput))),
  refresh: asyncHandler(async (req: Request, res) => {
    const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!token) throw new AppError(401, 'Refresh session is missing', 'INVALID_REFRESH_TOKEN');
    sendSession(res, await authService.refresh(token));
  }),
  logout: asyncHandler(async (req, res) => {
    await authService.logout(req.cookies?.[REFRESH_COOKIE] as string | undefined);
    res.clearCookie(REFRESH_COOKIE, refreshOptions); res.clearCookie('csrf_token', csrfOptions); res.status(204).end();
  }),
  me: asyncHandler(async (req, res) => res.json({ data: { admin: req.user } }))
};
