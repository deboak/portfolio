import type { CookieOptions, RequestHandler, Response } from 'express';
import { AppError } from '../../lib/errors.js';
import type { AuthService } from './auth.service.js';
import type { LoginInput } from './auth.schemas.js';
import type { TokenService } from './token.service.js';
const wrap =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
export class AuthController {
  private readonly refreshCookie = 'refresh_token';
  private readonly refreshOptions: CookieOptions;
  private readonly csrfOptions: CookieOptions;
  constructor(
    private readonly service: AuthService,
    private readonly tokens: TokenService,
    production: boolean,
    refreshDays: number,
  ) {
    const sameSite: CookieOptions['sameSite'] = production ? 'none' : 'strict';
    this.refreshOptions = {
      httpOnly: true,
      secure: production,
      sameSite,
      path: '/api/v1/auth',
      maxAge: refreshDays * 86_400_000,
    };
    this.csrfOptions = {
      httpOnly: false,
      secure: production,
      sameSite,
      path: '/',
      maxAge: refreshDays * 86_400_000,
    };
  }
  private sendSession(res: Response, session: Awaited<ReturnType<AuthService['login']>>) {
    res.cookie(this.refreshCookie, session.refreshToken, this.refreshOptions);
    res.cookie('csrf_token', session.csrfToken, this.csrfOptions);
    res.json({
      data: {
        accessToken: session.accessToken,
        csrfToken: session.csrfToken,
        admin: session.admin,
      },
    });
  }
  csrf = wrap(async (_req, res) => {
    const csrfToken = this.tokens.csrf();
    res.cookie('csrf_token', csrfToken, this.csrfOptions);
    res.json({ data: { csrfToken } });
  });
  login = wrap(async (req, res) =>
    this.sendSession(res, await this.service.login(req.body as LoginInput)),
  );
  refresh = wrap(async (req, res) => {
    const token = req.cookies?.[this.refreshCookie] as string | undefined;
    if (!token) throw new AppError(401, 'Refresh session is missing', 'INVALID_REFRESH_TOKEN');
    this.sendSession(res, await this.service.refresh(token));
  });
  logout = wrap(async (req, res) => {
    await this.service.logout(req.cookies?.[this.refreshCookie] as string | undefined);
    res.clearCookie(this.refreshCookie, this.refreshOptions);
    res.clearCookie('csrf_token', this.csrfOptions);
    res.status(204).end();
  });
  me = wrap(async (req, res) => res.json({ data: { admin: req.user } }));
}
