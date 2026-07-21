import type { RequestHandler } from 'express';
import type { AdminService } from './admin.service.js';
import type { CreateAdminInput } from './auth.schemas.js';
const wrap =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
export class AdminController {
  constructor(private readonly service: AdminService) {}
  list = wrap(async (_req, res) => res.json({ data: await this.service.list() }));
  create = wrap(async (req, res) =>
    res.status(201).json({ data: await this.service.create(req.body as CreateAdminInput) }),
  );
}
