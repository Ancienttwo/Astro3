// 数据库查询优化工具
import { supabaseAdmin } from '@/lib/supabase'
import { getCache } from '@/lib/redis'

// 查询性能监控
class QueryPerformanceMonitor {
  private static metrics: Map<string, {
    totalTime: number
    count: number
    errors: number
    lastExecution: number
  }> = new Map()

  static recordQuery(queryName: string, duration: number, success: boolean) {
    const existing = this.metrics.get(queryName) || {
      totalTime: 0,
      count: 0,
      errors: 0,
      lastExecution: 0
    }

    existing.totalTime += duration
    existing.count += 1
    existing.lastExecution = Date.now()
    
    if (!success) {
      existing.errors += 1
    }

    this.metrics.set(queryName, existing)

    // 性能警告
    const avgTime = existing.totalTime / existing.count
    if (avgTime > 1000 && existing.count > 10) {
      console.warn(`🐌 慢查询警告: ${queryName} 平均耗时 ${avgTime.toFixed(0)}ms`)
    }
  }

  static getMetrics() {
    const results: Array<{
      queryName: string
      avgTime: number
      totalQueries: number
      errorRate: number
      lastExecution: string
    }> = []

    for (const [queryName, metrics] of this.metrics.entries()) {
      results.push({
        queryName,
        avgTime: Math.round(metrics.totalTime / metrics.count),
        totalQueries: metrics.count,
        errorRate: (metrics.errors / metrics.count) * 100,
        lastExecution: new Date(metrics.lastExecution).toISOString()
      })
    }

    return results.sort((a, b) => b.avgTime - a.avgTime)
  }
}

// 优化的数据库操作类
export class DatabaseOptimizer {
  private cache = getCache()

  // 带缓存的查询
  async cachedQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>,
    cacheKey: string,
    ttl: number = 300 // 5分钟默认缓存
  ): Promise<T> {
    const startTime = Date.now()
    
    try {
      // 尝试从缓存获取
      const cached = await this.cache.get(cacheKey)
      if (cached) {
        try {
          const result = JSON.parse(cached)
          QueryPerformanceMonitor.recordQuery(`${queryName}:cache`, Date.now() - startTime, true)
          return result
        } catch (error) {
          console.warn('缓存解析失败:', error)
        }
      }

      // 执行查询
      const result = await queryFn()
      
      // 缓存结果
      if (result !== null && result !== undefined) {
        try {
          await this.cache.set(cacheKey, JSON.stringify(result), ttl)
        } catch (error) {
          console.warn('缓存设置失败:', error)
        }
      }

      QueryPerformanceMonitor.recordQuery(queryName, Date.now() - startTime, true)
      return result
    } catch (error) {
      QueryPerformanceMonitor.recordQuery(queryName, Date.now() - startTime, false)
      throw error
    }
  }

  // 批量插入优化
  async batchInsert<T>(
    table: string,
    data: T[],
    batchSize: number = 100
  ): Promise<T[]> {
    const startTime = Date.now()
    const results: T[] = []
    
    try {
      // 分批处理
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        
        const { data: batchResult, error } = await supabaseAdmin
          .from(table)
          .insert(batch)
          .select()
        
        if (error) {
          console.error(`批量插入失败 (batch ${Math.floor(i / batchSize) + 1}):`, error)
          throw error
        }
        
        if (batchResult) {
          results.push(...batchResult)
        }
      }

      QueryPerformanceMonitor.recordQuery(`batchInsert:${table}`, Date.now() - startTime, true)
      return results
    } catch (error) {
      QueryPerformanceMonitor.recordQuery(`batchInsert:${table}`, Date.now() - startTime, false)
      throw error
    }
  }

  // 批量更新优化
  async batchUpdate<T>(
    table: string,
    updates: Array<{ id: string; data: Partial<T> }>,
    batchSize: number = 50
  ): Promise<void> {
    const startTime = Date.now()
    
    try {
      // 分批处理更新
      for (let i = 0; i < updates.length; i += batchSize) {
        const batch = updates.slice(i, i + batchSize)
        
        // 并行执行批次内的更新
        const promises = batch.map(({ id, data }) =>
          supabaseAdmin
            .from(table)
            .update(data)
            .eq('id', id)
        )
        
        const results = await Promise.allSettled(promises)
        
        // 检查失败的更新
        const failures = results.filter(result => result.status === 'rejected')
        if (failures.length > 0) {
          console.warn(`批量更新部分失败: ${failures.length}/${batch.length}`)
        }
      }

      QueryPerformanceMonitor.recordQuery(`batchUpdate:${table}`, Date.now() - startTime, true)
    } catch (error) {
      QueryPerformanceMonitor.recordQuery(`batchUpdate:${table}`, Date.now() - startTime, false)
      throw error
    }
  }

  // 优化的用户使用统计查询
  async getUserUsageOptimized(userId: string) {
    return this.cachedQuery(
      'getUserUsage',
      async () => {
        const { data, error } = await supabaseAdmin
          .from('user_usage')
          .select('*')
          .eq('user_id', userId)
          .single()
        
        if (error) throw error
        return data
      },
      `user_usage:${userId}`,
      60 // 1分钟缓存
    )
  }

  // 优化的用户命盘查询
  async getUserChartsOptimized(userId: string, limit: number = 20) {
    return this.cachedQuery(
      'getUserCharts',
      async () => {
        const { data, error } = await supabaseAdmin
          .from('user_charts')
          .select('id, name, birth_year, birth_month, birth_day, chart_type, category, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (error) throw error
        return data
      },
      `user_charts:${userId}:${limit}`,
      300 // 5分钟缓存
    )
  }

  // 优化的AI分析查询
  async getAnalysisTasksOptimized(
    userId: string, 
    status?: string, 
    limit: number = 10
  ) {
    const cacheKey = `analysis_tasks:${userId}:${status || 'all'}:${limit}`
    
    return this.cachedQuery(
      'getAnalysisTasks',
      async () => {
        let query = supabaseAdmin
          .from('analysis_tasks')
          .select('id, task_type, status, created_at, completed_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)
        
        if (status) {
          query = query.eq('status', status)
        }
        
        const { data, error } = await query
        if (error) throw error
        return data
      },
      cacheKey,
      180 // 3分钟缓存
    )
  }

  // 智能分页查询
  async paginatedQuery<T>(
    table: string,
    options: {
      userId?: string
      filters?: Record<string, any>
      orderBy?: string
      ascending?: boolean
      page: number
      limit: number
      select?: string
    }
  ): Promise<{
    data: T[]
    total: number
    hasMore: boolean
    nextPage: number | null
  }> {
    const { userId, filters, orderBy = 'created_at', ascending = false, page, limit, select = '*' } = options
    const offset = (page - 1) * limit
    
    const startTime = Date.now()
    
    try {
      // 构建查询
      let query = supabaseAdmin
        .from(table)
        .select(select, { count: 'exact' })
      
      if (userId) {
        query = query.eq('user_id', userId)
      }
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      query = query
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1)
      
      const { data, error, count } = await query
      
      if (error) throw error
      
      const total = count || 0
      const hasMore = offset + limit < total
      const nextPage = hasMore ? page + 1 : null
      
      QueryPerformanceMonitor.recordQuery(`paginatedQuery:${table}`, Date.now() - startTime, true)
      
      return {
        data: data || [],
        total,
        hasMore,
        nextPage
      }
    } catch (error) {
      QueryPerformanceMonitor.recordQuery(`paginatedQuery:${table}`, Date.now() - startTime, false)
      throw error
    }
  }

  // 缓存失效
  async invalidateCache(pattern: string) {
    try {
      // 这里可以实现模式匹配的缓存删除
      // 简化版本：删除特定键
      await this.cache.del(pattern)
    } catch (error) {
      console.warn('缓存失效失败:', error)
    }
  }

  // 批量缓存失效
  async invalidateCachesBatch(patterns: string[]) {
    try {
      await Promise.all(patterns.map(pattern => this.invalidateCache(pattern)))
    } catch (error) {
      console.warn('批量缓存失效失败:', error)
    }
  }

  // 预热缓存
  async warmupCache(userId: string) {
    try {
      // 预加载常用数据
      await Promise.all([
        this.getUserUsageOptimized(userId),
        this.getUserChartsOptimized(userId, 10),
        this.getAnalysisTasksOptimized(userId, 'completed', 5)
      ])
      console.log(`✅ 用户缓存预热完成: ${userId}`)
    } catch (error) {
      console.warn('缓存预热失败:', error)
    }
  }

  // 数据库健康检查
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    metrics: any
    recommendations: string[]
  }> {
    const startTime = Date.now()
    const recommendations: string[] = []
    
    try {
      // 简单查询测试
      const { error } = await supabaseAdmin
        .from('users')
        .select('id')
        .limit(1)
      
      if (error) {
        return {
          status: 'unhealthy',
          metrics: { responseTime: Date.now() - startTime },
          recommendations: ['数据库连接失败，请检查网络和配置']
        }
      }

      const responseTime = Date.now() - startTime
      const performanceMetrics = QueryPerformanceMonitor.getMetrics()
      
      // 性能评估
      let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
      
      if (responseTime > 1000) {
        status = 'degraded'
        recommendations.push('数据库响应时间较慢，建议检查网络连接')
      }
      
      const slowQueries = performanceMetrics.filter(m => m.avgTime > 2000)
      if (slowQueries.length > 0) {
        status = 'degraded'
        recommendations.push(`发现${slowQueries.length}个慢查询，建议优化`)
      }
      
      const highErrorRateQueries = performanceMetrics.filter(m => m.errorRate > 5)
      if (highErrorRateQueries.length > 0) {
        status = 'degraded'
        recommendations.push(`发现${highErrorRateQueries.length}个高错误率查询`)
      }

      return {
        status,
        metrics: {
          responseTime,
          totalQueries: performanceMetrics.reduce((sum, m) => sum + m.totalQueries, 0),
          avgResponseTime: performanceMetrics.reduce((sum, m) => sum + m.avgTime, 0) / performanceMetrics.length || 0,
          slowQueries: slowQueries.length,
          highErrorRateQueries: highErrorRateQueries.length
        },
        recommendations
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        metrics: { error: String(error) },
        recommendations: ['数据库健康检查失败，请联系管理员']
      }
    }
  }
}

// 单例实例
export const dbOptimizer = new DatabaseOptimizer()

// 导出性能监控
 