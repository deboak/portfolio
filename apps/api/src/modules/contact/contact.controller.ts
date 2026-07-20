import type { RequestHandler } from 'express';
import { contactService } from './contact.service.js';
import type { ContactInput } from './contact.schemas.js';
const asyncHandler=(handler:RequestHandler):RequestHandler=>(req,res,next)=>Promise.resolve(handler(req,res,next)).catch(next);
export const contactController={submit:asyncHandler(async(req,res)=>{const item=await contactService.submit(req.body as ContactInput);res.status(202).json({data:{id:item.id,status:item.status}})}),list:asyncHandler(async(_req,res)=>res.json({data:await contactService.list()}))};
