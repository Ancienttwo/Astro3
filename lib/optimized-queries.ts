// 优化后的查询函数 - 集成缓存和性能监控
import { DatabaseRouter, DatabaseOperations, OperationType } from './database-pool';
import { CacheManager } from './redis-cache';

/**
 * 优化的用户积分查询
 */
export class OptimizedQueries {
  /**
   * 获取Web2用户积分（缓存优先）
   */
  static async getWeb2UserPoints(userId: string) {
    // 1. 尝试从缓存获取
    const cached = await CacheManager.getWeb2Points(userId);
    if (cached) {
      return {
        success: true,
        data: cached,
        source: 'cache'
      };
    }

    // 2. 从数据库获取
    try {
      const data = await DatabaseOperations.getUserPoints(userId, 'web2');
      
      // 3. 缓存结果
      if (data) {
        await CacheManager.setWeb2Points(userId, {
          points_balance: data.points_balance,
          consecutive_days: data.consecutive_days,
          last_checkin_date: data.last_checkin_date,
          total_earned: data.total_earned
        });
      }

      return {
        success: true,
        data,
        source: 'database'
      };
    } catch (error) {
      console.error('Error fetching Web2 user points:', error);
      return {
        success: false,
        error: error.message,
        source: 'database'
      };
    }
  }

  /**
   * 获取Web3用户积分（缓存优先）
   */
  static async getWeb3UserPoints(walletAddress: string) {
    walletAddress = walletAddress.toLowerCase();
    
    // 1. 尝试从缓存获取
    const cached = await CacheManager.getWeb3Points(walletAddress);
    if (cached) {
      return {
        success: true,
        data: cached,
        source: 'cache'
      };
    }

    // 2. 从数据库获取
    try {
      const data = await DatabaseOperations.getUserPoints(walletAddress, 'web3');
      
      // 3. 缓存结果
      if (data) {
        await CacheManager.setWeb3Points(walletAddress, {
          chain_points_balance: data.chain_points_balance,
          airdrop_weight: data.airdrop_weight,
          consecutive_days: data.consecutive_days,
          last_checkin_date: data.last_checkin_date,
          total_chain_earned: data.total_chain_earned,
          total_bnb_spent: data.total_bnb_spent
        });
      }

      return {
        success: true,
        data,
        source: 'database'
      };
    } catch (error) {
      console.error('Error fetching Web3 user points:', error);
      return {
        success: false,
        error: error.message,
        source: 'database'
      };
    }
  }

  /**
   * 获取排行榜（缓存优先）
   */
  static async getLeaderboard(category: string = 'total', limit: number = 100, offset: number = 0) {
    // 1. 尝试从缓存获取
    const cacheKey = `${category}_${limit}_${offset}`;
    const cached = await CacheManager.getLeaderboard(cacheKey);
    if (cached) {
      return {
        success: true,
        data: cached,
        source: 'cache'
      };
    }

    // 2. 从数据库获取
    try {
      const data = await DatabaseOperations.getLeaderboard(limit, offset);
      
      // 3. 缓存结果
      if (data) {
        await CacheManager.setLeaderboard(cacheKey, data);
      }

      return {
        success: true,
        data,
        source: 'database'
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return {
        success: false,
        error: error.message,
        source: 'database'
      };
    }
  }

  /**
   * 获取空投资格（缓存优先）
   */
  static async getAirdropEligibility(walletAddress: string) {
    walletAddress = walletAddress.toLowerCase();
    
    // 1. 尝试从缓存获取
    const cached = await CacheManager.getAirdropEligibility(walletAddress);
    if (cached) {
      return {
        success: true,
        data: cached,
        source: 'cache'
      };
    }

    // 2. 从数据库获取
    try {
      const result = await DatabaseRouter.executeRead(async (client) => {
        const { data, error } = await client
          .from('airdrop_eligibility')
          .select('*')
          .eq('wallet_address', walletAddress)
          .eq('is_eligible', true)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      });

      // 3. 缓存结果
      if (result) {
        await CacheManager.setAirdropEligibility(walletAddress, {
          total_weight: result.total_weight,
          checkin_weight: result.checkin_weight,
          activity_weight: result.activity_weight,
          estimated_tokens: result.estimated_tokens,
          is_eligible: result.is_eligible,
          tier: this.getTierFromWeight(result.total_weight)
        });
      }

      return {
        success: true,
        data: result,
        source: 'database'
      };
    } catch (error) {
      console.error('Error fetching airdrop eligibility:', error);
      return {
        success: false,
        error: error.message,
        source: 'database'
      };
    }
  }

  /**
   * 批量获取用户数据（用于导出功能）
   */
  static async getBatchUserData(
    filters: {
      userType?: 'web2' | 'web3';
      minWeight?: number;
      limit?: number;
      offset?: number;
    } = {}
  ) {
    const { userType = 'web3', minWeight = 0, limit = 1000, offset = 0 } = filters;

    try {
      return await DatabaseRouter.executeRead(async (client) => {
        if (userType === 'web3') {
          // 使用物化视图获取Web3用户数据
          const { data, error } = await client
            .from('mv_web3_leaderboard')
            .select('*')
            .gte('total_weight', minWeight)
            .range(offset, offset + limit - 1);
          
          if (error) throw error;
          return data;
        } else {
          // Web2用户数据
          const { data, error } = await client
            .from('user_points_web2')
            .select(`
              user_id,
              points_balance,
              total_earned,
              consecutive_days,
              last_checkin_date,
              max_consecutive_days
            `)
            .gte('points_balance', minWeight)
            .order('points_balance', { ascending: false })
            .range(offset, offset + limit - 1);
          
          if (error) throw error;
          return data;
        }
      });
    } catch (error) {
      console.error('Error fetching batch user data:', error);
      throw error;
    }
  }

  /**
   * 获取用户签到历史（分页优化）
   */
  static async getUserCheckinHistory(
    userId: string, 
    userType: 'web2' | 'web3',
    limit: number = 30,
    offset: number = 0
  ) {
    try {
      return await DatabaseRouter.executeRead(async (client) => {
        const tableName = userType === 'web2' 
          ? 'checkin_records_web2_partitioned' 
          : 'checkin_records_web3_partitioned';
        
        const idField = userType === 'web2' ? 'user_id' : 'wallet_address';
        const userIdValue = userType === 'web3' ? userId.toLowerCase() : userId;

        const { data, error } = await client
          .from(tableName)
          .select('*')
          .eq(idField, userIdValue)
          .order('checkin_date', { ascending: false })
          .range(offset, offset + limit - 1);
        
        if (error) throw error;
        return data;
      });
    } catch (error) {
      console.error('Error fetching user checkin history:', error);
      throw error;
    }
  }

  /**
   * 获取今日签到统计
   */
  static async getTodayCheckinStats() {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      return await DatabaseRouter.executeRead(async (client) => {
        // 使用并行查询提高性能
        const [web2Stats, web3Stats] = await Promise.all([
          client
            .from('checkin_records_web2')
            .select('count', { count: 'exact' })
            .eq('checkin_date', today),
          
          client
            .from('checkin_records_web3')
            .select('count', { count: 'exact' })
            .eq('checkin_date', today)
        ]);

        if (web2Stats.error) throw web2Stats.error;
        if (web3Stats.error) throw web3Stats.error;

        return {
          web2_checkins: web2Stats.count || 0,
          web3_checkins: web3Stats.count || 0,
          total_checkins: (web2Stats.count || 0) + (web3Stats.count || 0),
          date: today
        };
      });
    } catch (error) {
      console.error('Error fetching today checkin stats:', error);
      throw error;
    }
  }

  /**
   * 获取系统统计概览
   */
  static async getSystemOverview() {
    try {
      return await DatabaseRouter.executeRead(async (client) => {
        // 并行查询多个统计数据
        const [
          totalWeb2Users,
          totalWeb3Users,
          totalWeb3Points,
          totalBNBCollected,
          topAirdropUser
        ] = await Promise.all([
          client
            .from('user_points_web2')
            .select('count', { count: 'exact' }),
          
          client
            .from('user_points_web3')
            .select('count', { count: 'exact' })
            .eq('is_active', true),
          
          client
            .from('user_points_web3')
            .select('chain_points_balance.sum()')
            .single(),
          
          client
            .from('user_points_web3')
            .select('total_bnb_spent.sum()')
            .single(),
          
          client
            .from('mv_web3_leaderboard')
            .select('wallet_address, total_weight')
            .limit(1)
            .single()
        ]);

        return {
          total_web2_users: totalWeb2Users.count || 0,
          total_web3_users: totalWeb3Users.count || 0,
          total_web3_points: totalWeb3Points.data?.sum || 0,
          total_bnb_collected: totalBNBCollected.data?.sum || 0,
          top_airdrop_user: topAirdropUser.data,
          last_updated: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error fetching system overview:', error);
      throw error;
    }
  }

  /**
   * 清除相关缓存
   */
  static async invalidateUserCache(userId: string, walletAddress?: string) {
    await CacheManager.clearUserCache(userId, walletAddress);
    
    // 清除相关的全局缓存
    if (walletAddress) {
      await CacheManager.clearGlobalCache();
    }
  }

  /**
   * 预热缓存
   */
  static async warmupCache() {
    try {
      // 预热热门数据
      console.log('Starting cache warmup...');
      
      // 1. 预热排行榜
      await this.getLeaderboard('total', 100, 0);
      
      // 2. 预热今日统计
      await this.getTodayCheckinStats();
      
      // 3. 预热系统概览
      await this.getSystemOverview();
      
      console.log('Cache warmup completed');
    } catch (error) {
      console.error('Cache warmup failed:', error);
    }
  }

  /**
   * 根据权重获取等级
   */
  private static getTierFromWeight(weight: number): string {
    if (weight >= 50) return 'Platinum';
    if (weight >= 30) return 'Gold';
    if (weight >= 15) return 'Silver';
    return 'Bronze';
  }
}

// 定期刷新物化视图（如果需要）
if (typeof window === 'undefined') {
  // 每小时刷新一次物化视图
  setInterval(async () => {
    try {
      await DatabaseRouter.executeWrite(async (client) => {
        await client.rpc('refresh_materialized_views');
      });
      console.log('Materialized views refreshed');
    } catch (error) {
      console.error('Failed to refresh materialized views:', error);
    }
  }, 3600000); // 1小时
}

export default OptimizedQueries;