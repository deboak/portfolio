import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { signWebhook } from './webhook.signature.js';

export async function deliverContactWebhook(submissionId: string) {
  if (!env.OUTGOING_WEBHOOK_URL) return;
  const contact = await prisma.contactSubmission.findUniqueOrThrow({ where:{id:submissionId} });
  const event = { id:contact.id, type:'contact.submitted', data:{ name:contact.name, email:contact.email, subject:contact.subject, message:contact.message, createdAt:contact.createdAt.toISOString() } };
  const summary = `New portfolio contact from ${contact.name} (${contact.email}): ${contact.subject}`;
  // Slack reads `text`; Discord reads `content`. Generic consumers can use the complete event.
  const payload = { text:summary, content:summary, event };
  const body = JSON.stringify(payload);
  const timestamp = String(Math.floor(Date.now()/1000));
  const headers:Record<string,string> = {'content-type':'application/json','user-agent':'portfolio-webhooks/1.0'};
  if (env.OUTGOING_WEBHOOK_SECRET) { headers['x-webhook-timestamp']=timestamp; headers['x-webhook-signature']=signWebhook(env.OUTGOING_WEBHOOK_SECRET,timestamp,body); }
  const response = await fetch(env.OUTGOING_WEBHOOK_URL,{method:'POST',headers,body,signal:AbortSignal.timeout(10_000)});
  if (!response.ok) throw new Error(`Outgoing webhook returned HTTP ${response.status}`);
}
