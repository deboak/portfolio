import type { RequestHandler } from 'express';
import type { ContactService } from './contact.service.js';
import type { ContactInput } from './contact.schemas.js';
const wrap =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
export class ContactController {
  constructor(private readonly service: ContactService) {}
  submit = wrap(async (req, res) => {
    const item = await this.service.submit(req.body as ContactInput);
    res.status(202).json({ data: { id: item.id, status: item.status } });
  });
  list = wrap(async (_req, res) => res.json({ data: await this.service.list() }));
}
