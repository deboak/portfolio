import type { NextFunction, Request, Response } from 'express';
import type { WebhookService } from './webhook.service.js';
export class WebhookController {
  constructor(private readonly service: WebhookService) {}
  receive = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.receive({
        provider: req.params.provider as string,
        event: req.body,
        timestamp: req.header('x-webhook-timestamp') ?? '',
        signature: req.header('x-webhook-signature') ?? '',
        rawBody: req.rawBody ?? Buffer.from(JSON.stringify(req.body)),
      });
      res.status(result.duplicate ? 200 : 202).json({
        received: true,
        ...(result.duplicate ? { duplicate: true } : {}),
      });
    } catch (error) {
      next(error);
    }
  };
}
