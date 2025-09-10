// Redis缓存策略 - 用户积分状态缓存
import Redis from 'ioredis';

// Redis连接配置
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 100,
  lazyConnect: true,
});

// 缓存键前缀
export const CACHE_KEYS = {
  // 用户积分缓存
  WEB2_POINTS: (userId: string) => `astrozi:web2:points:${userId}`,
  WEB3_POINTS: (walletAddress: string) => `astrozi:web3:points:${walletAddress.toLowerCase()}`,
  
  // 签到状态缓存
  CHECKIN_STATUS: (userId: string, date: string) => `astrozi:checkin:${userId}:${date}`,
  
  // 排行榜缓存
  LEADERBOARD: (category: string) => `astrozi:leaderboard:${category}`,
  
  // 空投资格缓存
  AIRDROP_ELIGIBILITY: (walletAddress: string) => `astrozi:airdrop:${walletAddress.toLowerCase()}`,
  
  // 商城商品缓存
  SHOP_ITEMS: (userType: string) => `astrozi:shop:items:${userType}`,
  
  // 统计数据缓存
  DAILY_STATS: (date: string) => `astrozi:stats:daily:${date}`,
  GLOBAL_STATS: () => `astrozi:stats:global`,
  
  // 速率限制
  RATE_LIMIT: (identifier: string, action: string) => `astrozi:rate:${action}:${identifier}`,
} as const;

// 缓存过期时间（秒）
export const CACHE_TTL = {
  USER_POINTS: 300,        // 5分钟 - 用户积分
  CHECKIN_STATUS: 3600,    // 1小时 - 签到状态
  LEADERBOARD: 1800,       // 30分钟 - 排行榜
  AIRDROP_DATA: 600,       // 10分钟 - 空投资格
  SHOP_ITEMS: 7200,        // 2小时 - 商城商品
  DAILY_STATS: 1800,       // 30分钟 - 每日统计
  GLOBAL_STATS: 600,       // 10分钟 - 全局统计
  RATE_LIMIT: 60,          // 1分钟 - 速率限制
} as const;

// 用户积分缓存接口
export interface CachedUserPoints {
  web2?: {
    points_balance: number;
    consecutive_days: number;
    last_checkin_date: string | null;
    total_earned: number;
  };
  web3?: {
    chain_points_balance: number;
    airdrop_weight: number;
    consecutive_days: number;
    last_checkin_date: string | null;
    total_chain_earned: number;
    total_bnb_spent: number;
  };
  cached_at: number;
}

// 空投资格缓存接口
export interface CachedAirdropEligibility {
  total_weight: number;
  checkin_weight: number;
  activity_weight: number;
  estimated_tokens: number;
  is_eligible: boolean;
  rank?: number;
  tier: string;
  cached_at: number;
}

/**
 * Redis缓存管理类
 */
export class CacheManager {
  /**
   * 获取Web2用户积分缓存
   */
  static async getWeb2Points(userId: string): Promise<CachedUserPoints['web2'] | null> {
    try {
      const cached = await redis.get(CACHE_KEYS.WEB2_POINTS(userId));
      if (cached) {
        const data = JSON.parse(cached);
        // 检查缓存是否过期
        if (Date.now() - data.cached_at < CACHE_TTL.USER_POINTS * 1000) {
          return data.web2;
        }
      }
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * 缓存Web2用户积分
   */
  static async setWeb2Points(userId: string, points: CachedUserPoints['web2']): Promise<void> {
    try {
      const cacheData: CachedUserPoints = {
        web2: points,
        cached_at: Date.now()
      };
      await redis.setex(
        CACHE_KEYS.WEB2_POINTS(userId),
        CACHE_TTL.USER_POINTS,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  /**
   * 获取Web3用户积分缓存
   */
  static async getWeb3Points(walletAddress: string): Promise<CachedUserPoints['web3'] | null> {
    try {
      const cached = await redis.get(CACHE_KEYS.WEB3_POINTS(walletAddress));
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.cached_at < CACHE_TTL.USER_POINTS * 1000) {
          return data.web3;
        }
      }
      return null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * 缓存Web3用户积分
   */
  static async setWeb3Points(walletAddress: string, points: CachedUserPoints['web3']): Promise<void> {
    try {
      const cacheData: CachedUserPoints = {
        web3: points,
        cached_at: Date.now()
      };
      await redis.setex(
        CACHE_KEYS.WEB3_POINTS(walletAddress),
        CACHE_TTL.USER_POINTS,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  /**
   * 检查今日签到状态
   */
  static async getCheckinStatus(userId: string): Promise<boolean | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const cached = await redis.get(CACHE_KEYS.CHECKIN_STATUS(userId, today));
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis get checkin status error:', error);
      return null;
    }
  }

  /**
   * 设置今日签到状态
   */
  static async setCheckinStatus(userId: string, hasCheckedIn: boolean): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      await redis.setex(
        CACHE_KEYS.CHECKIN_STATUS(userId, today),
        CACHE_TTL.CHECKIN_STATUS,
        JSON.stringify(hasCheckedIn)
      );
    } catch (error) {
      console.error('Redis set checkin status error:', error);
    }
  }

  /**
   * 获取排行榜缓存
   */
  static async getLeaderboard(category: string = 'total'): Promise<any[] | null> {
    try {
      const cached = await redis.get(CACHE_KEYS.LEADERBOARD(category));
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.cached_at < CACHE_TTL.LEADERBOARD * 1000) {
          return data.leaderboard;
        }
      }
      return null;
    } catch (error) {
      console.error('Redis get leaderboard error:', error);
      return null;
    }
  }

  /**
   * 缓存排行榜
   */
  static async setLeaderboard(category: string, leaderboard: any[]): Promise<void> {
    try {
      const cacheData = {
        leaderboard,
        cached_at: Date.now()
      };
      await redis.setex(
        CACHE_KEYS.LEADERBOARD(category),
        CACHE_TTL.LEADERBOARD,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Redis set leaderboard error:', error);
    }
  }

  /**
   * 获取空投资格缓存
   */
  static async getAirdropEligibility(walletAddress: string): Promise<CachedAirdropEligibility | null> {
    try {
      const cached = await redis.get(CACHE_KEYS.AIRDROP_ELIGIBILITY(walletAddress));
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.cached_at < CACHE_TTL.AIRDROP_DATA * 1000) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Redis get airdrop eligibility error:', error);
      return null;
    }
  }

  /**
   * 缓存空投资格
   */
  static async setAirdropEligibility(walletAddress: string, eligibility: Omit<CachedAirdropEligibility, 'cached_at'>): Promise<void> {
    try {
      const cacheData: CachedAirdropEligibility = {
        ...eligibility,
        cached_at: Date.now()
      };
      await redis.setex(
        CACHE_KEYS.AIRDROP_ELIGIBILITY(walletAddress),
        CACHE_TTL.AIRDROP_DATA,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Redis set airdrop eligibility error:', error);
    }
  }

  /**
   * 获取商城商品缓存
   */
  static async getShopItems(userType: string): Promise<any[] | null> {
    try {
      const cached = await redis.get(CACHE_KEYS.SHOP_ITEMS(userType));
      if (cached) {
        const data = JSON.parse(cached);
        if (Date.now() - data.cached_at < CACHE_TTL.SHOP_ITEMS * 1000) {
          return data.items;
        }
      }
      return null;
    } catch (error) {
      console.error('Redis get shop items error:', error);
      return null;
    }
  }

  /**
   * 缓存商城商品
   */
  static async setShopItems(userType: string, items: any[]): Promise<void> {
    try {
      const cacheData = {
        items,
        cached_at: Date.now()
      };
      await redis.setex(
        CACHE_KEYS.SHOP_ITEMS(userType),
        CACHE_TTL.SHOP_ITEMS,
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Redis set shop items error:', error);
    }
  }

  /**
   * 速率限制检查
   */
  static async checkRateLimit(identifier: string, action: string, limit: number = 10): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const key = CACHE_KEYS.RATE_LIMIT(identifier, action);
      const current = await redis.incr(key);
      
      if (current === 1) {
        await redis.expire(key, CACHE_TTL.RATE_LIMIT);
      }
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current)
      };
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return { allowed: true, remaining: 0 };
    }
  }

  /**
   * 清除用户相关缓存
   */
  static async clearUserCache(userId: string, walletAddress?: string): Promise<void> {
    try {
      const keys = [CACHE_KEYS.WEB2_POINTS(userId)];
      
      if (walletAddress) {
        keys.push(
          CACHE_KEYS.WEB3_POINTS(walletAddress),
          CACHE_KEYS.AIRDROP_ELIGIBILITY(walletAddress)
        );
      }
      
      // 清除签到状态缓存（最近7天）
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        keys.push(CACHE_KEYS.CHECKIN_STATUS(userId, dateStr));
      }
      
      await redis.del(...keys);
    } catch (error) {
      console.error('Redis clear user cache error:', error);
    }
  }

  /**
   * 清除全局缓存（排行榜、统计等）
   */
  static async clearGlobalCache(): Promise<void> {
    try {
      const pattern = 'astrozi:leaderboard:*';
      const keys = await redis.keys(pattern);
      
      keys.push(
        CACHE_KEYS.GLOBAL_STATS(),
        ...['web2', 'web3', 'both'].map(type => CACHE_KEYS.SHOP_ITEMS(type))
      );
      
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear global cache error:', error);
    }
  }

  /**
   * 获取缓存统计信息
   */
  static async getCacheStats(): Promise<any> {
    try {
      const info = await redis.info('memory');
      const dbSize = await redis.dbsize();
      
      return {
        connected: redis.status === 'ready',
        memory_usage: info,
        total_keys: dbSize,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Redis get cache stats error:', error);
      return null;
    }
  }
}

// 导出Redis实例供其他地方使用
export { redis };

// 优雅关闭Redis连接
process.on('SIGTERM', () => {
  redis.disconnect();
});

process.on('SIGINT', () => {
  redis.disconnect();
});