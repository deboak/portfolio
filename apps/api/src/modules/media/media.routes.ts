import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireCsrf } from '../auth/index.js';
import { mediaController } from './media.module.js';
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024, files: 1 },
});
export const resumeRouter = Router();
resumeRouter.get('/resume', mediaController.resume);
resumeRouter.get('/media/:id', mediaController.view);
export const mediaRouter = Router();
mediaRouter.use(requireAuth);
mediaRouter.get('/media', mediaController.list);
mediaRouter.post('/media', requireCsrf, upload.single('media'), mediaController.upload);
