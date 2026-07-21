import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { closeRedis, connectRedis } from './lib/redis.js';
import { startAnalyticsScheduler } from './modules/analytics/index.js';
import { closeQueues, createWorkers, scheduleRecurringJobs } from './modules/jobs/index.js';
import { jobConnection } from './modules/jobs/job.connection.js';
import { closeNotificationHub } from './modules/notifications/index.js';

await connectRedis();
const scheduler = startAnalyticsScheduler();
const workers = env.RUN_WORKER_IN_API ? (await scheduleRecurringJobs(), createWorkers()) : [];
const server = createApp().listen(env.PORT, () =>
  console.info(`API listening on http://localhost:${env.PORT}`),
);
const shutdown = async () => {
  clearInterval(scheduler);
  server.close(async () => {
    await Promise.all(workers.map((worker) => worker.close()));
    await closeNotificationHub();
    await closeQueues();
    jobConnection.disconnect();
    await Promise.all([prisma.$disconnect(), closeRedis()]);
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
