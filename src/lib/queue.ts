import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6380', {
  maxRetriesPerRequest: null
});

export const atsQueue = new Queue('atsQueue', { connection: connection as any });
