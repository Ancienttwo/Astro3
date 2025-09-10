import Redis from 'ioredis';

// Redis客户端单例
let redis: Redis | null = null;

// 获取Redis连接
export function getRedisClient(): Redis | null {
  // 如果没有配置Redis URL，返回null（降级到内存缓存）
  if (!process.env.REDIS_URL && !process.env.REDIS_CLOUD_URL) {
    console.warn('Redis URL not configured, falling back to in-memory cache');
    return null;
  }

  if (!redis) {
    try {
      const redisUrl = process.env.REDIS_URL || process.env.REDIS_CLOUD_URL;
      
      // 构建Redis配置
      let redisConfig: any = {
        // 连接配置
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 5, // 增加重试次数
        lazyConnect: true,
        
        // 连接池配置
        family: 4,
        keepAlive: true,
        
        // 重试配置
        retryConnectOnFailure: true,
        connectTimeout: 15000, // 增加连接超时时间
        commandTimeout: 10000, // 增加命令超时时间
        
        // 新增：连接重试配置
        retryDelayOnClusterDown: 300,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 5,
        
        // 新增：keepalive配置
        keepAlive: 30000,
        
        // 新增：断线重连配置
        autoResubscribe: true,
        autoResendUnfulfilledCommands: true,
      };

      // 如果有密码但是URL不包含密码，添加密码配置
      const redisPassword = process.env.REDIS_PASSWORD;
      if (redisPassword && !redisUrl.includes('@')) {
        redisConfig.password = redisPassword;
      }

      redis = new Redis(redisUrl, redisConfig);

      redis.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      redis.on('error', (err) => {
        console.error('❌ Redis connection error:', err.message);
        // 不要立即设置为null，让它重试
      });

      redis.on('close', () => {
        console.log('🔌 Redis connection closed');
        redis = null;
      });

    } catch (error) {
      console.error('❌ Failed to create Redis client:', error);
      redis = null;
    }
  }

  return redis;
}

// 缓存接口
export interface CacheInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

// Redis缓存实现
class RedisCache implements CacheInterface {
  private client: Redis;

  constructor(client: Redis) {
    this.client = client;
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl = 3600): Promise<void> {
    try {
      await this.client.setex(key, ttl, value);
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  async clear(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }
}

// 内存缓存实现（Redis不可用时的降级方案）
class MemoryCache implements CacheInterface {
  private cache = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, ttl = 3600): Promise<void> {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// 获取缓存实例（Redis优先，降级到内存缓存）
export function getCache(): CacheInterface {
  const redisClient = getRedisClient();
  
  if (redisClient) {
    return new RedisCache(redisClient);
  } else {
    return new MemoryCache();
  }
}

// 缓存键生成器
export const CacheKeys = {
  // 用户相关
  userUsage: (userId: string) => `user:usage:${userId}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
  
  // 命盘缓存
  charts: (userId: string) => `charts:${userId}`,
  chartDetail: (chartId: string) => `chart:${chartId}`,
  
  // AI分析缓存
  aiAnalysis: (chartId: string) => `ai:analysis:${chartId}`,
  
  // 系统缓存
  systemHealth: () => 'system:health',
  appConfig: () => 'app:config',
};

// 缓存装饰器函数
export function withCache<T>(
  cacheKey: string,
  ttl: number = 3600
) {
  return function(target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const cache = getCache();
      const key = typeof cacheKey === 'function' ? cacheKey(...args) : cacheKey;
      
      // 尝试从缓存获取
      const cached = await cache.get(key);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (error) {
          console.error('Cache parse error:', error);
        }
      }
      
      // 执行原方法
      const result = await method.apply(this, args);
      
      // 缓存结果
      if (result !== null && result !== undefined) {
        try {
          await cache.set(key, JSON.stringify(result), ttl);
        } catch (error) {
          console.error('Cache set error:', error);
        }
      }
      
      return result;
    };
  };
} 