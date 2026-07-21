import type { RequestHandler, Response } from 'express';
import type { AnalyticsService } from '../analytics/analytics.service.js';
import type { ContentService } from './content.service.js';
import type { ListQuery, PostInput, ProjectInput } from './content.schemas.js';
const wrap =
  (handler: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
async function sendPage(res: Response, load: () => Promise<{ id: string }[]>, limit: number) {
  const items = await load();
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, limit) : items;
  if (hasMore) res.setHeader('x-next-cursor', data.at(-1)!.id);
  res.setHeader('x-page-limit', String(limit));
  res.json({
    data,
    meta: { nextCursor: hasMore ? data.at(-1)!.id : null, limit },
  });
}
export class ContentController {
  constructor(
    private readonly service: ContentService,
    private readonly analytics: AnalyticsService,
  ) {}
  listProjects = wrap(async (req, res) => {
    const page = req.query as unknown as ListQuery;
    await sendPage(res, () => this.service.projects(true, page), page.limit);
  });
  listAllProjects = wrap(async (req, res) => {
    const page = req.query as unknown as ListQuery;
    await sendPage(res, () => this.service.projects(false, page), page.limit);
  });
  getProject = wrap(async (req, res) => {
    const data = await this.service.project(req.params.slug as string);
    void this.analytics.increment('project', data.id);
    res.json({ data });
  });
  createProject = wrap(async (req, res) =>
    res.status(201).json({
      data: await this.service.createProject(req.body as ProjectInput),
    }),
  );
  updateProject = wrap(async (req, res) =>
    res.json({
      data: await this.service.updateProject(req.params.id as string, req.body as ProjectInput),
    }),
  );
  deleteProject = wrap(async (req, res) => {
    await this.service.deleteProject(req.params.id as string);
    res.status(204).end();
  });
  listPosts = wrap(async (req, res) => {
    const page = req.query as unknown as ListQuery;
    await sendPage(res, () => this.service.posts(true, page), page.limit);
  });
  listAllPosts = wrap(async (req, res) => {
    const page = req.query as unknown as ListQuery;
    await sendPage(res, () => this.service.posts(false, page), page.limit);
  });
  getPost = wrap(async (req, res) => {
    const data = await this.service.post(req.params.slug as string);
    void this.analytics.increment('post', data.id);
    res.json({ data });
  });
  createPost = wrap(async (req, res) =>
    res.status(201).json({ data: await this.service.createPost(req.body as PostInput) }),
  );
  updatePost = wrap(async (req, res) =>
    res.json({
      data: await this.service.updatePost(req.params.id as string, req.body as PostInput),
    }),
  );
  deletePost = wrap(async (req, res) => {
    await this.service.deletePost(req.params.id as string);
    res.status(204).end();
  });
}
