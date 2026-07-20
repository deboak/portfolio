import type { RequestHandler } from 'express';
import { contentService } from './content.service.js';
import type { ListQuery, PostInput, ProjectInput } from './content.schemas.js';
import { analyticsService } from '../analytics/analytics.service.js';

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const sendPage=async(res:Parameters<RequestHandler>[1],load:()=>Promise<{id:string}[]>,limit:number)=>{const items=await load();const hasMore=items.length>limit;const data=hasMore?items.slice(0,limit):items;if(hasMore)res.setHeader('x-next-cursor',data.at(-1)!.id);res.setHeader('x-page-limit',String(limit));res.json({data,meta:{nextCursor:hasMore?data.at(-1)!.id:null,limit}})};

export const contentController = {
  listProjects: asyncHandler(async (req, res) => {const page=req.query as unknown as ListQuery;await sendPage(res,()=>contentService.projects(true,page),page.limit)}),
  listAllProjects: asyncHandler(async (req, res) => {const page=req.query as unknown as ListQuery;await sendPage(res,()=>contentService.projects(false,page),page.limit)}),
  getProject: asyncHandler(async (req, res) => { const data=await contentService.project(req.params.slug as string);void analyticsService.increment('project',data.id);res.json({data}); }),
  createProject: asyncHandler(async (req, res) => res.status(201).json({ data: await contentService.createProject(req.body as ProjectInput) })),
  updateProject: asyncHandler(async (req, res) => res.json({ data: await contentService.updateProject(req.params.id as string, req.body as ProjectInput) })),
  deleteProject: asyncHandler(async (req, res) => { await contentService.deleteProject(req.params.id as string); res.status(204).end(); }),
  listPosts: asyncHandler(async (req, res) => {const page=req.query as unknown as ListQuery;await sendPage(res,()=>contentService.posts(true,page),page.limit)}),
  listAllPosts: asyncHandler(async (req, res) => {const page=req.query as unknown as ListQuery;await sendPage(res,()=>contentService.posts(false,page),page.limit)}),
  getPost: asyncHandler(async (req, res) => { const data=await contentService.post(req.params.slug as string);void analyticsService.increment('post',data.id);res.json({data}); }),
  createPost: asyncHandler(async (req, res) => res.status(201).json({ data: await contentService.createPost(req.body as PostInput) })),
  updatePost: asyncHandler(async (req, res) => res.json({ data: await contentService.updatePost(req.params.id as string, req.body as PostInput) })),
  deletePost: asyncHandler(async (req, res) => { await contentService.deletePost(req.params.id as string); res.status(204).end(); })
};
