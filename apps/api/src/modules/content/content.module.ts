import { cache } from '../../lib/cache.js';
import { prisma } from '../../lib/prisma.js';
import { analyticsService } from '../analytics/index.js';
import { ContentController } from './content.controller.js';
import { PostRepository, ProjectRepository } from './content.repository.js';
import { ContentService } from './content.service.js';
export const contentService = new ContentService(
  new ProjectRepository(prisma),
  new PostRepository(prisma),
  cache,
);
export const contentController = new ContentController(contentService, analyticsService);
