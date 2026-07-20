import { closeRedis,connectRedis } from './lib/redis.js';
import { closeQueues, createWorkers, scheduleRecurringJobs } from './modules/jobs/index.js';
import { jobConnection } from './modules/jobs/job.connection.js';

await connectRedis();await scheduleRecurringJobs();const workers=createWorkers();console.info('BullMQ worker started');
const shutdown=async()=>{await Promise.all(workers.map(worker=>worker.close()));await closeQueues();jobConnection.disconnect();await closeRedis();process.exit(0)};
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
