import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth } from '../auth/index.js';
import { contactController } from './contact.controller.js';
import { contactRateLimiter } from './contact.rate-limiter.js';
import { contactInput } from './contact.schemas.js';
export const contactRouter=Router();contactRouter.post('/',validate(contactInput),contactRateLimiter,contactController.submit);
export const adminContactRouter=Router();adminContactRouter.use(requireAuth);adminContactRouter.get('/contacts',contactController.list);
