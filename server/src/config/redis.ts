import Redis from 'ioredis';
import { env } from './env';

let redisClient: Redis | null = null;

export const getRedisClient = (): Redis | null => {
  if (!redisClient && env.REDIS_URL) {
    try {
      redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't crash if Redis is unavailable
      });
      redisClient.on('error', (err) => {
        console.warn('[Redis] Connection warning:', err.message);
      });
    } catch {
      console.warn('[Redis] Redis not available, using in-memory job processing.');
      redisClient = null;
    }
  }
  return redisClient;
};
