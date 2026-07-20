import { Worker, type Job } from 'bullmq';
import { jobConnection } from './job.connection.js';
import { deadLetterQueue } from './job.queues.js';
import { processContact, processDigest, processImage } from './job.processors.js';
import { deliverContactWebhook } from '../webhooks/webhook.outgoing.js';
import { processIncomingWebhook } from '../webhooks/webhook.processor.js';

export function createWorkers(){
  const workers=[new Worker('contact-email',job=>processContact(job.data.submissionId as string),{connection:jobConnection,concurrency:5}),new Worker('image-processing',job=>processImage(job.data.assetId as string),{connection:jobConnection,concurrency:2}),new Worker('weekly-digest',()=>processDigest(),{connection:jobConnection,concurrency:1}),new Worker('outgoing-webhook',job=>deliverContactWebhook(job.data.submissionId as string),{connection:jobConnection,concurrency:5}),new Worker('incoming-webhook',job=>processIncomingWebhook(job.data.provider as string,job.data.event),{connection:jobConnection,concurrency:5})];
  for(const worker of workers)worker.on('failed',(job,error)=>void moveToDeadLetter(job,error));return workers;
}
async function moveToDeadLetter(job:Job|undefined,error:Error){if(!job||job.attemptsMade<4)return;await deadLetterQueue.add('failed',{queue:job.queueName,jobId:job.id,name:job.name,data:job.data,error:error.message,failedAt:new Date().toISOString()},{removeOnComplete:false});}
