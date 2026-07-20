import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../lib/errors.js';
import { contactQueue, outgoingWebhookQueue } from '../jobs/index.js';
import type { ContactInput } from './contact.schemas.js';
import { publishNotification } from '../notifications/index.js';

export const contactService={
  async submit(data:ContactInput){const item=await prisma.contactSubmission.create({data});try{await Promise.all([contactQueue.add('send-contact-email',{submissionId:item.id},{jobId:`contact-email-${item.id}`}),outgoingWebhookQueue.add('contact-submitted',{submissionId:item.id},{jobId:`contact-webhook-${item.id}`})]);await publishNotification({id:`contact-submitted-${item.id}`,type:'contact.submitted',title:'New contact message',message:`${item.name}: ${item.subject}`,createdAt:new Date().toISOString(),data:{submissionId:item.id}});return item}catch(error){await prisma.contactSubmission.update({where:{id:item.id},data:{status:'FAILED',error:'Queue unavailable'}});throw new AppError(503,'Message saved, but delivery is temporarily unavailable','QUEUE_UNAVAILABLE')}},
  list:()=>prisma.contactSubmission.findMany({orderBy:{createdAt:'desc'},take:100})
};
