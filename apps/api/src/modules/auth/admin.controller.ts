import type { RequestHandler } from 'express';
import { adminService } from './admin.service.js';
import type { CreateAdminInput } from './auth.schemas.js';
const asyncHandler=(handler:RequestHandler):RequestHandler=>(req,res,next)=>Promise.resolve(handler(req,res,next)).catch(next);
export const adminController={list:asyncHandler(async(_req,res)=>res.json({data:await adminService.list()})),create:asyncHandler(async(req,res)=>res.status(201).json({data:await adminService.create(req.body as CreateAdminInput)}))};
