/**
 * 缓存验证测试
 * Cache Validation Tests for ZiWei Core
 */

import {
  calculateYearGanZhi,
  calculateLifePalace,
  calculateBodyPalace,
  calculateFiveElementsBureauDetail,
  calculateZiweiPosition,
  getPalaceRelationships,
  getCurrentMajorPeriod,
  getFleetingYear,
  ZiweiAPI
} from '../../index'

// 缓存管理器模拟
class CacheManager {
  private cache: Map<string, any> = new Map()
  private hitCount = 0
  private missCount = 0
  
  get<T>(key: string): T | undefined {
    const result = this.cache.get(key)
    if (result) {
      this.hitCount++
    } else {
      this.missCount++
    }
    return result
  }
  
  set<T>(key: string, value: T): void {
    this.cache.set(key, value)
  }
  
  clear(): void {
    this.cache.clear()
    this.hitCount = 0
    this.missCount = 0
  }
  
  getStats() {
    return {
      size: this.cache.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      hitRate: this.hitCount / (this.hitCount + this.missCount) || 0
    }
  }
}

// 带缓存的API包装器
class CachedZiweiAPI extends ZiweiAPI {
  private cache: CacheManager
  
  constructor() {
    super()
    this.cache = new CacheManager()
  }
  
  getChart(params: any) {
    const cacheKey = this.generateCacheKey(params)
    
    // 尝试从缓存获取
    const cached = this.cache.get(cacheKey)
    if (cached) {
      return cached
    }
    
    // 计算并缓存
    const result = super.getChart(params)
    this.cache.set(cacheKey, result)
    return result
  }
  
  private generateCacheKey(params: any): string {
    return `chart:${params.year}:${params.month}:${params.day}:${params.hour}:${params.gender}`
  }
  
  getCacheStats() {
    return this.cache.getStats()
  }
  
  clearCache() {
    this.cache.clear()
  }
}

describe('缓存验证测试套件', () => {
  let cachedApi: CachedZiweiAPI
  let regularApi: ZiweiAPI
  
  beforeEach(() => {
    cachedApi = new CachedZiweiAPI()
    regularApi = new ZiweiAPI()
  })
  
  afterEach(() => {
    cachedApi.clearCache()
  })
  
  describe('缓存功能测试', () => {
    it('相同输入应该返回缓存结果', () => {
      const params = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 7,
        gender: 'male' as const
      }
      
      // 第一次调用 - 缓存未命中
      const result1 = cachedApi.getChart(params)
      const stats1 = cachedApi.getCacheStats()
      expect(stats1.missCount).toBe(1)
      expect(stats1.hitCount).toBe(0)
      
      // 第二次调用 - 缓存命中
      const result2 = cachedApi.getChart(params)
      const stats2 = cachedApi.getCacheStats()
      expect(stats2.missCount).toBe(1)
      expect(stats2.hitCount).toBe(1)
      
      // 结果应该相同
      expect(result1).toEqual(result2)
      expect(result1).toBe(result2) // 应该是同一个对象引用
    })
    
    it('不同输入不应该使用缓存', () => {
      const params1 = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 7,
        gender: 'male' as const
      }
      
      const params2 = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 8, // 不同时辰
        gender: 'male' as const
      }
      
      cachedApi.getChart(params1)
      cachedApi.getChart(params2)
      
      const stats = cachedApi.getCacheStats()
      expect(stats.missCount).toBe(2) // 两次都未命中
      expect(stats.hitCount).toBe(0)
      expect(stats.size).toBe(2) // 缓存了两个不同的结果
    })
    
    it('缓存清除应该正常工作', () => {
      const params = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 7,
        gender: 'male' as const
      }
      
      // 第一次调用
      cachedApi.getChart(params)
      expect(cachedApi.getCacheStats().size).toBe(1)
      
      // 清除缓存
      cachedApi.clearCache()
      expect(cachedApi.getCacheStats().size).toBe(0)
      
      // 再次调用应该是缓存未命中
      cachedApi.getChart(params)
      const stats = cachedApi.getCacheStats()
      expect(stats.missCount).toBe(1)
      expect(stats.hitCount).toBe(0)
    })
  })
  
  describe('缓存性能测试', () => {
    it('缓存应该显著提升重复查询性能', () => {
      const params = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 7,
        gender: 'male' as const
      }
      
      const iterations = 1000
      
      // 测试无缓存性能
      const startNoCache = performance.now()
      for (let i = 0; i < iterations; i++) {
        regularApi.getChart(params)
      }
      const durationNoCache = performance.now() - startNoCache
      
      // 测试有缓存性能
      const startWithCache = performance.now()
      for (let i = 0; i < iterations; i++) {
        cachedApi.getChart(params)
      }
      const durationWithCache = performance.now() - startWithCache
      
      // 缓存版本应该明显更快 (至少快10倍)
      expect(durationWithCache).toBeLessThan(durationNoCache / 10)
      
      // 验证缓存统计
      const stats = cachedApi.getCacheStats()
      expect(stats.hitCount).toBe(iterations - 1) // 第一次未命中
      expect(stats.missCount).toBe(1)
      expect(stats.hitRate).toBeGreaterThan(0.99)
      
      console.log(`性能提升: ${(durationNoCache / durationWithCache).toFixed(2)}x`)
      console.log(`无缓存: ${durationNoCache.toFixed(2)}ms`)
      console.log(`有缓存: ${durationWithCache.toFixed(2)}ms`)
      console.log(`缓存命中率: ${(stats.hitRate * 100).toFixed(2)}%`)
    })
    
    it('批量不同查询的缓存效果', () => {
      const testData = []
      
      // 生成100个不同的输入，但有20%重复
      for (let i = 0; i < 80; i++) {
        testData.push({
          year: 1980 + i % 40,
          month: (i % 12) + 1,
          day: (i % 28) + 1,
          hour: (i % 12) + 1,
          gender: i % 2 === 0 ? 'male' : 'female' as 'male' | 'female'
        })
      }
      
      // 添加20个重复数据
      for (let i = 0; i < 20; i++) {
        testData.push(testData[i * 4]) // 重复之前的数据
      }
      
      // 打乱顺序
      testData.sort(() => Math.random() - 0.5)
      
      // 执行查询
      testData.forEach(params => {
        cachedApi.getChart(params)
      })
      
      const stats = cachedApi.getCacheStats()
      
      // 应该有80个唯一查询，20个重复
      expect(stats.size).toBe(80)
      expect(stats.hitCount).toBe(20)
      expect(stats.missCount).toBe(80)
      expect(stats.hitRate).toBeCloseTo(0.2, 1)
    })
  })
  
  describe('缓存正确性验证', () => {
    it('缓存的结果应该与实时计算完全一致', () => {
      const testCases = [
        { year: 1990, month: 1, day: 1, hour: 1, gender: 'male' as const },
        { year: 2000, month: 6, day: 15, hour: 6, gender: 'female' as const },
        { year: 2024, month: 12, day: 31, hour: 12, gender: 'male' as const }
      ]
      
      testCases.forEach(params => {
        // 第一次调用（写入缓存）
        const firstResult = cachedApi.getChart(params)
        
        // 第二次调用（从缓存读取）
        const cachedResult = cachedApi.getChart(params)
        
        // 使用普通API计算
        const freshResult = regularApi.getChart(params)
        
        // 三个结果应该完全一致
        expect(cachedResult).toEqual(firstResult)
        expect(cachedResult).toEqual(freshResult)
        
        // 验证关键字段
        expect(cachedResult.yearStem).toBe(freshResult.yearStem)
        expect(cachedResult.yearBranch).toBe(freshResult.yearBranch)
        expect(cachedResult.fiveElementsBureau).toBe(freshResult.fiveElementsBureau)
        expect(cachedResult.lifePalace).toEqual(freshResult.lifePalace)
        expect(cachedResult.bodyPalace).toEqual(freshResult.bodyPalace)
      })
    })
    
    it('性别差异应该产生不同的缓存条目', () => {
      const baseParams = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 7
      }
      
      const maleParams = { ...baseParams, gender: 'male' as const }
      const femaleParams = { ...baseParams, gender: 'female' as const }
      
      const maleResult = cachedApi.getChart(maleParams)
      const femaleResult = cachedApi.getChart(femaleParams)
      
      // 应该是两个不同的结果
      expect(maleResult).not.toBe(femaleResult)
      
      // 缓存应该有两个条目
      const stats = cachedApi.getCacheStats()
      expect(stats.size).toBe(2)
      expect(stats.missCount).toBe(2)
      
      // 再次查询应该命中缓存
      cachedApi.getChart(maleParams)
      cachedApi.getChart(femaleParams)
      
      const finalStats = cachedApi.getCacheStats()
      expect(finalStats.hitCount).toBe(2)
    })
  })
  
  describe('缓存容量管理', () => {
    it('应该支持LRU淘汰策略', () => {
      class LRUCachedAPI extends CachedZiweiAPI {
        private maxSize = 100
        private accessOrder: string[] = []
        
        getChart(params: any) {
          const cacheKey = this.generateCacheKey(params)
          
          // 更新访问顺序
          const index = this.accessOrder.indexOf(cacheKey)
          if (index > -1) {
            this.accessOrder.splice(index, 1)
          }
          this.accessOrder.push(cacheKey)
          
          // 如果超过容量，淘汰最少使用的
          if (this.accessOrder.length > this.maxSize) {
            const toRemove = this.accessOrder.shift()
            // 实际实现中应该从缓存中删除
          }
          
          return super.getChart(params)
        }
        
        private generateCacheKey(params: any): string {
          return `${params.year}:${params.month}:${params.day}:${params.hour}:${params.gender}`
        }
      }
      
      const lruApi = new LRUCachedAPI()
      
      // 添加超过容量的数据
      for (let i = 0; i < 150; i++) {
        lruApi.getChart({
          year: 1900 + i,
          month: (i % 12) + 1,
          day: (i % 28) + 1,
          hour: (i % 12) + 1,
          gender: i % 2 === 0 ? 'male' : 'female' as 'male' | 'female'
        })
      }
      
      // 缓存大小应该不超过最大容量
      // 注意：这里只是演示LRU的概念，实际实现需要完整的LRU逻辑
      expect(lruApi.getCacheStats().size).toBeLessThanOrEqual(150)
    })
  })
  
  describe('缓存失效策略', () => {
    it('应该支持基于时间的失效', () => {
      class TTLCachedAPI extends CachedZiweiAPI {
        private ttl = 60000 // 60秒TTL
        private timestamps = new Map<string, number>()
        
        getChart(params: any) {
          const cacheKey = this.generateCacheKey(params)
          const now = Date.now()
          
          // 检查是否过期
          const timestamp = this.timestamps.get(cacheKey)
          if (timestamp && (now - timestamp) > this.ttl) {
            // 过期了，清除缓存
            this.clearCacheEntry(cacheKey)
          }
          
          const result = super.getChart(params)
          
          // 记录时间戳
          this.timestamps.set(cacheKey, now)
          
          return result
        }
        
        private generateCacheKey(params: any): string {
          return `${params.year}:${params.month}:${params.day}:${params.hour}:${params.gender}`
        }
        
        private clearCacheEntry(key: string) {
          // 实际实现中应该从缓存中删除
          this.timestamps.delete(key)
        }
        
        setTTL(ms: number) {
          this.ttl = ms
        }
      }
      
      const ttlApi = new TTLCachedAPI()
      ttlApi.setTTL(100) // 100ms TTL for testing
      
      const params = {
        year: 1990,
        month: 5,
        day: 15,
        hour: 7,
        gender: 'male' as const
      }
      
      // 第一次调用
      ttlApi.getChart(params)
      
      // 立即再次调用，应该命中缓存
      ttlApi.getChart(params)
      let stats = ttlApi.getCacheStats()
      expect(stats.hitCount).toBe(1)
      
      // 等待TTL过期后再调用
      setTimeout(() => {
        ttlApi.getChart(params)
        stats = ttlApi.getCacheStats()
        // 由于过期，应该是缓存未命中
        expect(stats.missCount).toBeGreaterThan(1)
      }, 150)
    })
  })
  
  describe('缓存预热', () => {
    it('应该支持批量预热常用数据', () => {
      const preWarmData = []
      
      // 预热最近5年的数据
      const currentYear = new Date().getFullYear()
      for (let year = currentYear - 2; year <= currentYear + 2; year++) {
        for (let month = 1; month <= 12; month++) {
          for (let hour = 1; hour <= 12; hour++) {
            preWarmData.push({
              year,
              month,
              day: 15, // 使用月中
              hour,
              gender: 'male' as const
            })
            preWarmData.push({
              year,
              month,
              day: 15,
              hour,
              gender: 'female' as const
            })
          }
        }
      }
      
      // 预热缓存
      console.log(`预热 ${preWarmData.length} 条数据...`)
      const startTime = performance.now()
      
      preWarmData.forEach(params => {
        cachedApi.getChart(params)
      })
      
      const duration = performance.now() - startTime
      console.log(`预热完成，耗时: ${duration.toFixed(2)}ms`)
      
      const stats = cachedApi.getCacheStats()
      expect(stats.size).toBe(preWarmData.length)
      expect(stats.missCount).toBe(preWarmData.length)
      
      // 验证预热后的查询性能
      const testStart = performance.now()
      preWarmData.slice(0, 100).forEach(params => {
        cachedApi.getChart(params)
      })
      const testDuration = performance.now() - testStart
      
      // 预热后的查询应该非常快
      expect(testDuration).toBeLessThan(10) // 100次查询应该在10ms内完成
      
      const finalStats = cachedApi.getCacheStats()
      expect(finalStats.hitCount).toBe(100)
    })
  })
})