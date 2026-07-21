import { Queue } from 'bullmq';
import { jobConnection } from './job.connection.js';

const defaults = {
  attempts: 4,
  backoff: { type: 'exponential' as const, delay: 2_000 },
  removeOnComplete: { age: 86_400, count: 1_000 },
  removeOnFail: false,
};
export const contactQueue = new Queue('contact-email', {
  connection: jobConnection,
  defaultJobOptions: defaults,
});
export const imageQueue = new Queue('image-processing', {
  connection: jobConnection,
  defaultJobOptions: defaults,
});
export const digestQueue = new Queue('weekly-digest', {
  connection: jobConnection,
  defaultJobOptions: defaults,
});
export const outgoingWebhookQueue = new Queue('outgoing-webhook', {
  connection: jobConnection,
  defaultJobOptions: defaults,
});
export const incomingWebhookQueue = new Queue('incoming-webhook', {
  connection: jobConnection,
  defaultJobOptions: defaults,
});
export const deadLetterQueue = new Queue('dead-letter', {
  connection: jobConnection,
});

export async function scheduleRecurringJobs() {
  await digestQueue.add(
    'weekly-digest',
    {},
    {
      jobId: 'weekly-digest',
      repeat: { pattern: '0 8 * * 1', tz: 'Africa/Lagos' },
    },
  );
}

export async function closeQueues() {
  await Promise.all([
    contactQueue.close(),
    imageQueue.close(),
    digestQueue.close(),
    outgoingWebhookQueue.close(),
    incomingWebhookQueue.close(),
    deadLetterQueue.close(),
  ]);
}
