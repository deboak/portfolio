import type { NextFunction,Request,Response } from 'express';
import { addNotificationClient } from './notification.service.js';

export async function streamNotifications(req:Request,res:Response,next:NextFunction){try{const remove=await addNotificationClient(res);res.status(200);res.setHeader('content-type','text/event-stream');res.setHeader('cache-control','no-cache, no-transform');res.setHeader('connection','keep-alive');res.setHeader('x-accel-buffering','no');res.flushHeaders();res.write(`event: connected\ndata: ${JSON.stringify({connected:true,at:new Date().toISOString()})}\n\n`);const heartbeat=setInterval(()=>res.write(`: heartbeat ${Date.now()}\n\n`),25_000);req.on('close',()=>{clearInterval(heartbeat);remove()})}catch(error){if(!res.headersSent)next(error);else res.end()}}
