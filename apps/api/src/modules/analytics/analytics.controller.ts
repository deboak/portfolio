import type { RequestHandler } from 'express';
import type { AnalyticsService } from './analytics.service.js';
const wrap =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}
  stats = wrap(async (_req, res) => res.json({ data: await this.service.topContent() }));
}
