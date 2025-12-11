import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
console.log(REDIS_PASSWORD, REDIS_HOST, REDIS_PORT);
if (!REDIS_HOST || !REDIS_PORT) {
  throw new Error('Redis configuration is missing');
}

const redis = new Redis({
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT),
  password: REDIS_PASSWORD,
  username: 'default',
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 5000);
    console.warn(`Retrying Redis connection in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: null,
});

redis.on('connect', () => console.info('Connected to Redis'));
redis.on('error', (err: Error) => console.error('Redis Error:', err));
redis.on('close', () => console.warn('Redis Connection Closed'));

const disconnectRedis = async (): Promise<void> => {
  await redis.quit();
  console.info('Redis Disconnected Gracefully');
};

export { redis, disconnectRedis };
