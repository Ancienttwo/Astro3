import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 生产环境连接池配置
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // 更安全的认证流程
  },
  global: {
    headers: {
      'x-my-custom-header': 'astro2-optimized',
      'x-client-info': 'astro2-web-client',
    },
  },
  // 连接池配置
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// 服务端专用客户端（用于高并发场景）
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    // 服务端连接池配置
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'astro2-admin-client',
      },
    },
  }
)

// 只读客户端（用于查询密集型操作）
export const supabaseReadonly = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-client-info': 'astro2-readonly-client',
    },
  },
})

// 连接池工具函数
export class ConnectionPool {
  private static instance: ConnectionPool
  private connections: Map<string, any> = new Map()
  private maxConnections = 10
  private activeConnections = 0

  static getInstance(): ConnectionPool {
    if (!ConnectionPool.instance) {
      ConnectionPool.instance = new ConnectionPool()
    }
    return ConnectionPool.instance
  }

  async getConnection(type: 'read' | 'write' | 'admin' = 'read'): Promise<any> {
    const key = `${type}_${Date.now()}`
    
    if (this.activeConnections >= this.maxConnections) {
      // 等待连接释放
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.getConnection(type)
    }

    let client
    switch (type) {
      case 'admin':
        client = supabaseAdmin
        break
      case 'write':
        client = supabase
        break
      default:
        client = supabaseReadonly
    }

    this.connections.set(key, client)
    this.activeConnections++
    
    return {
      client,
      release: () => {
        this.connections.delete(key)
        this.activeConnections--
      }
    }
  }

  getActiveConnections(): number {
    return this.activeConnections
  }

  getConnectionStats() {
    return {
      active: this.activeConnections,
      max: this.maxConnections,
      total: this.connections.size
    }
  }
}

// 数据库性能监控工具
export class DatabaseMetrics {
  private static queryTimes: number[] = []
  private static errorCount = 0
  private static successCount = 0

  static recordQuery(startTime: number, endTime: number, success: boolean) {
    const duration = endTime - startTime
    this.queryTimes.push(duration)
    
    if (success) {
      this.successCount++
    } else {
      this.errorCount++
    }

    // 保持最近1000条记录
    if (this.queryTimes.length > 1000) {
      this.queryTimes.shift()
    }
  }

  static getMetrics() {
    const totalQueries = this.successCount + this.errorCount
    const avgQueryTime = this.queryTimes.length > 0 
      ? this.queryTimes.reduce((sum, time) => sum + time, 0) / this.queryTimes.length 
      : 0

    return {
      totalQueries,
      successCount: this.successCount,
      errorCount: this.errorCount,
      errorRate: totalQueries > 0 ? (this.errorCount / totalQueries) * 100 : 0,
      avgQueryTime: Math.round(avgQueryTime),
      recentQueryTimes: this.queryTimes.slice(-10)
    }
  }

  static reset() {
    this.queryTimes = []
    this.errorCount = 0
    this.successCount = 0
  }
}

// 优化的查询包装器
export async function optimizedQuery<T>(
  queryFn: () => Promise<T>,
  options: {
    timeout?: number
    retries?: number
    cacheKey?: string
    cacheTTL?: number
  } = {}
): Promise<T> {
  const { timeout = 10000, retries = 3 } = options
  const startTime = Date.now()
  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // 创建超时Promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), timeout)
      })

      // 执行查询
      const result = await Promise.race([queryFn(), timeoutPromise])
      
      // 记录成功指标
      DatabaseMetrics.recordQuery(startTime, Date.now(), true)
      
      return result
    } catch (error) {
      lastError = error as Error
      console.warn(`Query attempt ${attempt + 1} failed:`, error)
      
      // 最后一次尝试时记录失败指标
      if (attempt === retries - 1) {
        DatabaseMetrics.recordQuery(startTime, Date.now(), false)
      }
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError || new Error('Unknown query error')
}

// 批量操作优化
export class BatchProcessor {
  private static instance: BatchProcessor
  private batches: Map<string, any[]> = new Map()
  private batchTimers: Map<string, NodeJS.Timeout> = new Map()
  private readonly batchSize = 100
  private readonly batchDelay = 100 // ms

  static getInstance(): BatchProcessor {
    if (!BatchProcessor.instance) {
      BatchProcessor.instance = new BatchProcessor()
    }
    return BatchProcessor.instance
  }

  async addToBatch<T>(
    batchKey: string,
    item: T,
    processor: (items: T[]) => Promise<void>
  ): Promise<void> {
    // 获取或创建批次
    if (!this.batches.has(batchKey)) {
      this.batches.set(batchKey, [])
    }

    const batch = this.batches.get(batchKey)!
    batch.push(item)

    // 清除现有定时器
    const existingTimer = this.batchTimers.get(batchKey)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 检查是否达到批次大小
    if (batch.length >= this.batchSize) {
      await this.processBatch(batchKey, processor)
    } else {
      // 设置延迟处理
      const timer = setTimeout(() => {
        this.processBatch(batchKey, processor)
      }, this.batchDelay)
      
      this.batchTimers.set(batchKey, timer)
    }
  }

  private async processBatch<T>(
    batchKey: string,
    processor: (items: T[]) => Promise<void>
  ): Promise<void> {
    const batch = this.batches.get(batchKey)
    if (!batch || batch.length === 0) return

    try {
      await processor([...batch])
      console.log(`Processed batch ${batchKey} with ${batch.length} items`)
    } catch (error) {
      console.error(`Batch processing failed for ${batchKey}:`, error)
    } finally {
      // 清理批次
      this.batches.set(batchKey, [])
      const timer = this.batchTimers.get(batchKey)
      if (timer) {
        clearTimeout(timer)
        this.batchTimers.delete(batchKey)
      }
    }
  }
}

// 导出优化的查询函数
export async function optimizedSelect<T = any>(
  tableName: string,
  options: {
    select?: string
    filters?: Record<string, any>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
    offset?: number
    useReadonly?: boolean
  } = {}
): Promise<{ data: T[] | null; error: any }> {
  const {
    select = '*',
    filters = {},
    orderBy,
    limit,
    offset,
    useReadonly = true
  } = options

  return optimizedQuery(async () => {
    const client = useReadonly ? supabaseReadonly : supabase
    let query = client.from(tableName).select(select)

    // 应用过滤器
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value)
      } else {
        query = query.eq(key, value)
      }
    })

    // 应用排序
    if (orderBy) {
      query = query.order(orderBy.column, { ascending: orderBy.ascending })
    }

    // 应用分页
    if (limit) {
      query = query.limit(limit)
    }
    if (offset) {
      query = query.range(offset, offset + (limit || 50) - 1)
    }

    return await query
  }) as any
}

// 导出默认客户端（向后兼容）
export { supabase as default } 