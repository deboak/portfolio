import { Redis } from 'ioredis';
import type { Response } from 'express';
import { env } from '../../config/env.js';
import { redis } from '../../lib/redis.js';

const channel = 'admin:notifications';
const clients = new Set<Response>();
let subscriber: Redis | null = null;
let starting: Promise<void> | null = null;

export type AdminNotification = { id:string; type:'contact.submitted'|'contact.updated'|'media.updated'|'system'; title:string; message:string; createdAt:string; data?:Record<string,unknown> };

async function startSubscriber() {
  if (subscriber?.status === 'ready') return;
  if (starting) return starting;
  starting=(async()=>{const connection=new Redis(env.REDIS_URL,{lazyConnect:true,connectTimeout:1_500,maxRetriesPerRequest:null,enableOfflineQueue:false});connection.on('error',error=>{if(env.NODE_ENV!=='test')console.warn('Notification subscriber unavailable',error.message)});await connection.connect();await connection.subscribe(channel);connection.on('message',(_channel,message)=>{for(const client of clients)client.write(`event: notification\ndata: ${message}\n\n`)});subscriber=connection})().finally(()=>{starting=null});
  return starting;
}

export async function addNotificationClient(response:Response){await startSubscriber();clients.add(response);return()=>clients.delete(response)}
export async function publishNotification(notification:AdminNotification){try{await redis.publish(channel,JSON.stringify(notification))}catch(error){if(env.NODE_ENV!=='test')console.warn('Live notification skipped',error instanceof Error?error.message:error)}}
export async function closeNotificationHub(){for(const client of clients)client.end();clients.clear();if(subscriber){const connection=subscriber;subscriber=null;await connection.quit().catch(()=>connection.disconnect())}}
