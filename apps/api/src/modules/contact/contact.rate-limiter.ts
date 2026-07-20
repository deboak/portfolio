import type { NextFunction,Request,Response } from 'express';
import { RateLimiterMemory,RateLimiterRedis,type RateLimiterRes } from 'rate-limiter-flexible';
import { redis } from '../../lib/redis.js';
const fallback=new RateLimiterMemory({points:5,duration:3600});const limiter=new RateLimiterRedis({storeClient:redis,keyPrefix:'rate:contact',points:5,duration:3600,insuranceLimiter:fallback});
export async function contactRateLimiter(req:Request,res:Response,next:NextFunction){try{await limiter.consume(req.ip??'unknown');next()}catch(value){const result=value as RateLimiterRes;res.setHeader('retry-after',Math.max(1,Math.ceil((result.msBeforeNext??60_000)/1000)));res.status(429).json({error:{code:'RATE_LIMITED',message:'Too many messages; try again later',requestId:req.id}})}}
