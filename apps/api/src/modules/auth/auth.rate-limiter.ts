import type { NextFunction, Request, Response } from 'express';
import { RateLimiterMemory, RateLimiterRedis, type RateLimiterRes } from 'rate-limiter-flexible';
import { redis } from '../../lib/redis.js';

const fallback = new RateLimiterMemory({ points: 10, duration: 15 * 60, blockDuration: 15 * 60 });
const limiter = new RateLimiterRedis({ storeClient: redis, keyPrefix: 'rate:login', points: 10, duration: 15 * 60, blockDuration: 15 * 60, insuranceLimiter: fallback });

export async function loginRateLimiter(req:Request,res:Response,next:NextFunction){
  try {await limiter.consume(req.ip??'unknown');next();}
  catch(value){const result=value as RateLimiterRes;const retry=Math.max(1,Math.ceil((result.msBeforeNext??60_000)/1000));res.setHeader('retry-after',retry);res.status(429).json({error:{code:'RATE_LIMITED',message:'Too many login attempts; try again later',requestId:req.id}});}
}
