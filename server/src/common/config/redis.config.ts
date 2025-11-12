import Redis from 'ioredis';
const REDIS_URL = process.env.REDIS_URL;
if (!REDIS_URL) {
  throw new Error('Redis Connection Url is missing');
}

const redis = new Redis(REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 5000);
    console.warn(`Retrying Redis connection in ${delay}ms`);
    return delay;
  },
  maxRetriesPerRequest: null,
});

redis.on('connect', () => console.info('Connected to Redis'));
redis.on('error', (err) => console.error('Redis Error:', err));
redis.on('close', () => console.warn('Redis Connection Closed'));

const disconnectRedis = async () => {
  await redis.quit();
  console.info('Redis Disconnected Gracefully');
};

export { redis, disconnectRedis };
