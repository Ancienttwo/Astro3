// 数据库连接池配置 - 读写分离
import { createClient } from '@supabase/supabase-js';

// 主数据库配置（写操作）
const MASTER_DATABASE_CONFIG = {
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  options: {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'astrozi-master'
      }
    }
  }
};

// 只读副本配置（读操作）
const REPLICA_DATABASE_CONFIG = {
  url: process.env.SUPABASE_REPLICA_URL || process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_REPLICA_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  options: {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'x-application-name': 'astrozi-replica'
      }
    }
  }
};

// 连接池配置
const POOL_CONFIG = {
  maxConnections: parseInt(process.env.DB_POOL_MAX || '20'),
  minConnections: parseInt(process.env.DB_POOL_MIN || '5'),
  acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '600000'),
  reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000'),
};

// 创建数据库连接
export const supabaseMaster = createClient(
  MASTER_DATABASE_CONFIG.url,
  MASTER_DATABASE_CONFIG.key,
  MASTER_DATABASE_CONFIG.options
);

export const supabaseReplica = createClient(
  REPLICA_DATABASE_CONFIG.url,
  REPLICA_DATABASE_CONFIG.key,
  REPLICA_DATABASE_CONFIG.options
);

// 数据库操作类型枚举
export enum OperationType {
  READ = 'read',
  WRITE = 'write',
  CRITICAL_READ = 'critical_read' // 需要最新数据的读操作
}

/**
 * 数据库路由器 - 根据操作类型选择合适的数据库连接
 */
export class DatabaseRouter {
  /**
   * 获取数据库连接
   */
  static getConnection(operation: OperationType = OperationType.READ) {
    switch (operation) {
      case OperationType.WRITE:
      case OperationType.CRITICAL_READ:
        return supabaseMaster;
      case OperationType.READ:
      default:
        // 如果没有配置副本，使用主库
        return process.env.SUPABASE_REPLICA_URL ? supabaseReplica : supabaseMaster;
    }
  }

  /**
   * 执行读操作
   */
  static async executeRead<T>(
    operation: (client: typeof supabaseMaster) => Promise<T>,
    forceMaster: boolean = false
  ): Promise<T> {
    const client = forceMaster 
      ? supabaseMaster 
      : this.getConnection(OperationType.READ);
    
    try {
      return await operation(client);
    } catch (error) {
      // 如果副本失败，尝试主库
      if (!forceMaster && client === supabaseReplica) {
        console.warn('Replica failed, retrying on master:', error);
        return await operation(supabaseMaster);
      }
      throw error;
    }
  }

  /**
   * 执行写操作
   */
  static async executeWrite<T>(
    operation: (client: typeof supabaseMaster) => Promise<T>
  ): Promise<T> {
    const client = this.getConnection(OperationType.WRITE);
    return await operation(client);
  }

  /**
   * 执行事务操作
   */
  static async executeTransaction<T>(
    operations: ((client: typeof supabaseMaster) => Promise<any>)[]
  ): Promise<T[]> {
    const client = this.getConnection(OperationType.WRITE);
    
    // Supabase不直接支持事务，使用RPC函数处理
    // 或者使用数组操作确保原子性
    const results: T[] = [];
    
    for (const operation of operations) {
      try {
        const result = await operation(client);
        results.push(result);
      } catch (error) {
        // 事务回滚逻辑需要在具体业务中实现
        console.error('Transaction operation failed:', error);
        throw error;
      }
    }
    
    return results;
  }
}

/**
 * 数据库性能监控
 */
export class DatabaseMonitor {
  private static queryStats: Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    errors: number;
  }> = new Map();

  /**
   * 记录查询性能
   */
  static recordQuery(queryName: string, duration: number, error?: boolean) {
    const stats = this.queryStats.get(queryName) || {
      count: 0,
      totalTime: 0,
      avgTime: 0,
      errors: 0
    };

    stats.count++;
    stats.totalTime += duration;
    stats.avgTime = stats.totalTime / stats.count;
    
    if (error) {
      stats.errors++;
    }

    this.queryStats.set(queryName, stats);

    // 记录慢查询
    if (duration > 1000) { // 超过1秒
      console.warn(`Slow query detected: ${queryName} took ${duration}ms`);
    }
  }

  /**
   * 获取查询统计
   */
  static getQueryStats() {
    return Object.fromEntries(this.queryStats);
  }

  /**
   * 重置统计
   */
  static resetStats() {
    this.queryStats.clear();
  }

  /**
   * 包装查询以自动记录性能
   */
  static async monitorQuery<T>(
    queryName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    let error = false;

    try {
      const result = await operation();
      return result;
    } catch (err) {
      error = true;
      throw err;
    } finally {
      const duration = Date.now() - startTime;
      this.recordQuery(queryName, duration, error);
    }
  }
}

/**
 * 高级数据库操作封装
 */
export class DatabaseOperations {
  /**
   * 获取用户积分（优先使用缓存）
   */
  static async getUserPoints(userId: string, userType: 'web2' | 'web3') {
    return DatabaseMonitor.monitorQuery(`getUserPoints_${userType}`, async () => {
      return DatabaseRouter.executeRead(async (client) => {
        if (userType === 'web2') {
          const { data, error } = await client
            .from('user_points_web2')
            .select('*')
            .eq('user_id', userId)
            .single();
          
          if (error && error.code !== 'PGRST116') throw error;
          return data;
        } else {
          const { data, error } = await client
            .from('user_points_web3')
            .select('*')
            .eq('wallet_address', userId.toLowerCase())
            .single();
          
          if (error && error.code !== 'PGRST116') throw error;
          return data;
        }
      });
    });
  }

  /**
   * 获取排行榜（使用物化视图）
   */
  static async getLeaderboard(limit: number = 100, offset: number = 0) {
    return DatabaseMonitor.monitorQuery('getLeaderboard', async () => {
      return DatabaseRouter.executeRead(async (client) => {
        const { data, error } = await client
          .from('mv_web3_leaderboard')
          .select('*')
          .range(offset, offset + limit - 1);
        
        if (error) throw error;
        return data;
      });
    });
  }

  /**
   * 获取每日统计（使用物化视图）
   */
  static async getDailyStats(days: number = 30) {
    return DatabaseMonitor.monitorQuery('getDailyStats', async () => {
      return DatabaseRouter.executeRead(async (client) => {
        const { data, error } = await client
          .from('mv_daily_stats_summary')
          .select('*')
          .order('stat_date', { ascending: false })
          .limit(days);
        
        if (error) throw error;
        return data;
      });
    });
  }

  /**
   * 批量更新用户积分
   */
  static async batchUpdatePoints(updates: Array<{
    userId: string;
    userType: 'web2' | 'web3';
    pointsChange: number;
    reason: string;
  }>) {
    return DatabaseMonitor.monitorQuery('batchUpdatePoints', async () => {
      return DatabaseRouter.executeWrite(async (client) => {
        const results = [];
        
        for (const update of updates) {
          const tableName = update.userType === 'web2' 
            ? 'user_points_web2' 
            : 'user_points_web3';
          
          const pointsField = update.userType === 'web2'
            ? 'points_balance'
            : 'chain_points_balance';
          
          const idField = update.userType === 'web2'
            ? 'user_id'
            : 'wallet_address';
          
          const { data, error } = await client
            .from(tableName)
            .update({
              [pointsField]: client.rpc('increment', { amount: update.pointsChange }),
              updated_at: new Date().toISOString()
            })
            .eq(idField, update.userId)
            .select();
          
          if (error) throw error;
          results.push(data);
        }
        
        return results;
      });
    });
  }

  /**
   * 检查连接健康状态
   */
  static async healthCheck() {
    try {
      const masterCheck = DatabaseRouter.executeRead(async (client) => {
        const { data, error } = await client
          .from('user_points_web2')
          .select('count')
          .limit(1);
        return !error;
      }, true);

      const replicaCheck = process.env.SUPABASE_REPLICA_URL 
        ? DatabaseRouter.executeRead(async (client) => {
            const { data, error } = await client
              .from('user_points_web2')
              .select('count')
              .limit(1);
            return !error;
          })
        : Promise.resolve(true);

      const [masterHealthy, replicaHealthy] = await Promise.all([
        masterCheck,
        replicaCheck
      ]);

      return {
        master: masterHealthy,
        replica: replicaHealthy,
        overall: masterHealthy && replicaHealthy
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        master: false,
        replica: false,
        overall: false
      };
    }
  }
}

// 导出主要接口
export {
  supabaseMaster as supabaseAdmin,
  POOL_CONFIG
};

// 定期健康检查
if (typeof window === 'undefined') {
  setInterval(async () => {
    const health = await DatabaseOperations.healthCheck();
    if (!health.overall) {
      console.error('Database health check failed:', health);
    }
  }, 60000); // 每分钟检查一次
}
