import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { webhookController } from './webhook.controller.js';
import { webhookRateLimiter } from './webhook.rate-limiter.js';
import { webhookInput } from './webhook.schemas.js';

export const webhookRouter = Router();
webhookRouter.post('/:provider', webhookRateLimiter, validate(webhookInput), webhookController.receive);
