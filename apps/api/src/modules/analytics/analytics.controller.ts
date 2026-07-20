import type { RequestHandler } from 'express';
import { analyticsService } from './analytics.service.js';
const asyncHandler=(handler:RequestHandler):RequestHandler=>(req,res,next)=>Promise.resolve(handler(req,res,next)).catch(next);
export const analyticsController={stats:asyncHandler(async(_req,res)=>res.json({data:await analyticsService.topContent()}))};
