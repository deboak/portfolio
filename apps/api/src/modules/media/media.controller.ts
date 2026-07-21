import type { RequestHandler } from 'express';
import type { MediaService } from './media.service.js';
const wrap =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
export class MediaController {
  constructor(private readonly service: MediaService) {}
  upload = wrap(async (req, res) =>
    res.status(202).json({ data: await this.service.upload(req.file) }),
  );
  list = wrap(async (_req, res) => res.json({ data: await this.service.list() }));
  resume = wrap(async (_req, res) => {
    res.setHeader('cache-control', 'no-store');
    res.json({ data: await this.service.resume() });
  });
}
