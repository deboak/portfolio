import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { requireAuth, requireCsrf } from '../auth/index.js';
import { contentController } from './content.controller.js';
import { idParams, listQuery, postInput, projectInput, slugParams } from './content.schemas.js';

export const publicContentRouter = Router();
publicContentRouter.get('/projects', validate(listQuery), contentController.listProjects);
publicContentRouter.get('/projects/:slug', validate(slugParams), contentController.getProject);
publicContentRouter.get('/posts', validate(listQuery), contentController.listPosts);
publicContentRouter.get('/posts/:slug', validate(slugParams), contentController.getPost);

export const adminContentRouter = Router();
adminContentRouter.use(requireAuth);
adminContentRouter.get('/projects', validate(listQuery), contentController.listAllProjects);
adminContentRouter.post('/projects', requireCsrf, validate(projectInput), contentController.createProject);
adminContentRouter.put('/projects/:id', requireCsrf, validate(idParams.and(projectInput)), contentController.updateProject);
adminContentRouter.delete('/projects/:id', requireCsrf, validate(idParams), contentController.deleteProject);
adminContentRouter.get('/posts', validate(listQuery), contentController.listAllPosts);
adminContentRouter.post('/posts', requireCsrf, validate(postInput), contentController.createPost);
adminContentRouter.put('/posts/:id', requireCsrf, validate(idParams.and(postInput)), contentController.updatePost);
adminContentRouter.delete('/posts/:id', requireCsrf, validate(idParams), contentController.deletePost);
