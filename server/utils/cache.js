import { createHash } from 'crypto';
import { createClient } from 'redis';

// 生成输入的唯一标识（缓存键）
export function getCacheKey(inputText) {
  return createHash('md5').update(inputText).digest('hex');
}

// Redis客户端
let redisClient = null;

// 初始化Redis客户端
export async function initRedisClient() {
  if (!redisClient) {
    try {
      // 尝试使用IPv4地址连接Redis
      redisClient = createClient({
        socket: {
          host: '127.0.0.1', // 强制使用IPv4
          port: 6379
        }
      });

      redisClient.on('error', (err) => {
        console.error('Redis 连接错误:', err);
      });

      await redisClient.connect();
      console.log('Redis 连接成功');
    } catch (error) {
      console.error('初始化Redis客户端失败:', error);
      // 如果Redis连接失败，使用内存缓存作为 fallback
      redisClient = createMemoryCache();
    }
  }
  return redisClient;
}

// 创建内存缓存作为Redis的 fallback
function createMemoryCache() {
  const cache = new Map();
  
  return {
    async get(key) {
      return cache.get(key) || null;
    },
    async setEx(key, expiration, value) {
      cache.set(key, value);
      // 模拟过期
      setTimeout(() => {
        cache.delete(key);
      }, expiration * 1000);
    },
    async connect() {
      console.log('使用内存缓存');
    }
  };
}

// 从缓存中获取数据
export async function getFromCache(key) {
  const client = await initRedisClient();
  return await client.get(key);
}

// 将数据存入缓存
export async function setToCache(key, value, expiration = 3600) {
  const client = await initRedisClient();
  await client.setEx(key, expiration, value);
}
