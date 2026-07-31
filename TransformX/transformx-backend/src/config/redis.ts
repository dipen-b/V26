import { createClient } from 'redis';

let redisClient: any;

export async function initializeRedis() {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err: any) => {
      console.error('Redis client error', err);
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
}

export function getRedis() {
  if (!redisClient) {
    throw new Error('Redis not initialized');
  }
  return redisClient;
}

export async function cacheGet(key: string) {
  const redis = getRedis();
  return redis.get(key);
}

export async function cacheSet(key: string, value: string, ttl?: number) {
  const redis = getRedis();
  if (ttl) {
    return redis.setEx(key, ttl, value);
  }
  return redis.set(key, value);
}

export async function cacheDel(key: string) {
  const redis = getRedis();
  return redis.del(key);
}

export async function cacheExists(key: string) {
  const redis = getRedis();
  return redis.exists(key);
}
