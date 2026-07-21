import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { imageQueue } from '../jobs/index.js';
import { MediaController } from './media.controller.js';
import { MediaRepository } from './media.repository.js';
import { MediaService } from './media.service.js';
import { signedDownload, uploadOriginal } from './media.storage.js';
export const mediaService = new MediaService(
  new MediaRepository(prisma),
  imageQueue,
  uploadOriginal,
  signedDownload,
  env.R2_RESUME_KEY,
  env.SIGNED_URL_TTL_SECONDS,
);
export const mediaController = new MediaController(mediaService);
