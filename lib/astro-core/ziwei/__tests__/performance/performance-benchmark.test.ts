/**
 * 性能基准测试
 * Performance Benchmark Tests for ZiWei Core
 */

import {
  calculateYearGanZhi,
  calculateLifePalace,
  calculateBodyPalace,
  calculateFiveElementsBureauDetail,
  calculateZiweiPosition,
  getPalaceRelationships,
  getTrinityPalaces,
  getComprehensiveTimeInfo,
  ZiweiAPI
} from '../../index'

// 性能测试配置
const PERFORMANCE_CONFIG = {
  singleQueryTarget: 100,    // 单次查询目标时间 (ms)
  batchQueryTarget: 500,     // 批量查询目标时间 (ms)
  concurrentUsers: 100,      // 并发用户数
  iterations: 1000,          // 迭代次数
  warmupIterations: 10      // 预热迭代次数
}

// 性能测试工具类
class PerformanceMonitor {
  private startTime: number = 0
  private measurements: number[] = []
  
  start(): void {
    this.startTime = performance.now()
  }
  
  end(): number {
    const duration = performance.now() - this.startTime
    this.measurements.push(duration)
    return duration
  }
  
  getStats() {
    const sorted = [...this.measurements].sort((a, b) => a - b)
    const len = sorted.length
    
    return {
      min: sorted[0],
      max: sorted[len - 1],
      mean: sorted.reduce((a, b) => a + b, 0) / len,
      median: sorted[Math.floor(len / 2)],
      p95: sorted[Math.floor(len * 0.95)],
      p99: sorted[Math.floor(len * 0.99)],
      count: len
    }
  }
  
  reset(): void {
    this.measurements = []
  }
}

// 测试数据生成器
function generateTestData(count: number) {
  const testData = []
  const baseYear = 1950
  const yearRange = 100
  
  for (let i = 0; i < count; i++) {
    testData.push({
      year: baseYear + Math.floor(Math.random() * yearRange),
      month: Math.floor(Math.random() * 12) + 1,
      day: Math.floor(Math.random() * 28) + 1,
      hour: Math.floor(Math.random() * 12) + 1,
      gender: Math.random() > 0.5 ? 'male' : 'female' as 'male' | 'female'
    })
  }
  
  return testData
}

describe('性能基准测试套件', () => {
  let monitor: PerformanceMonitor
  let api: ZiweiAPI
  
  beforeAll(() => {
    monitor = new PerformanceMonitor()
    api = new ZiweiAPI()
    
    // 预热
    console.log('开始预热...')
    const warmupData = generateTestData(PERFORMANCE_CONFIG.warmupIterations)
    warmupData.forEach(data => {
      api.getChart(data)
    })
    console.log('预热完成')
  })
  
  beforeEach(() => {
    monitor.reset()
  })
  
  describe('单功能性能测试', () => {
    it('年干支计算应该在1ms内完成', () => {
      for (let i = 0; i < PERFORMANCE_CONFIG.iterations; i++) {
        const year = 1900 + Math.floor(Math.random() * 200)
        
        monitor.start()
        calculateYearGanZhi(year)
        const duration = monitor.end()
        
        expect(duration).toBeLessThan(1)
      }
      
      const stats = monitor.getStats()
      console.log('年干支计算性能:', stats)
      expect(stats.p95).toBeLessThan(1)
    })
    
    it('命宫计算应该在1ms内完成', () => {
      for (let i = 0; i < PERFORMANCE_CONFIG.iterations; i++) {
        const month = Math.floor(Math.random() * 12) + 1
        const hour = Math.floor(Math.random() * 12) + 1
        
        monitor.start()
        calculateLifePalace(month, hour)
        const duration = monitor.end()
        
        expect(duration).toBeLessThan(1)
      }
      
      const stats = monitor.getStats()
      console.log('命宫计算性能:', stats)
      expect(stats.p95).toBeLessThan(1)
    })
    
    it('宫位关系查询应该在5ms内完成', () => {
      for (let i = 0; i < PERFORMANCE_CONFIG.iterations; i++) {
        const palaceIndex = Math.floor(Math.random() * 12)
        
        monitor.start()
        getPalaceRelationships(palaceIndex)
        const duration = monitor.end()
        
        expect(duration).toBeLessThan(5)
      }
      
      const stats = monitor.getStats()
      console.log('宫位关系查询性能:', stats)
      expect(stats.p95).toBeLessThan(5)
    })
  })
  
  describe('完整命盘计算性能测试', () => {
    it(`单次命盘计算应该在${PERFORMANCE_CONFIG.singleQueryTarget}ms内完成`, () => {
      const testData = generateTestData(100)
      
      testData.forEach(data => {
        monitor.start()
        const chart = api.getChart(data)
        const duration = monitor.end()
        
        expect(chart).toBeDefined()
        expect(duration).toBeLessThan(PERFORMANCE_CONFIG.singleQueryTarget)
      })
      
      const stats = monitor.getStats()
      console.log('单次命盘计算性能:', stats)
      
      expect(stats.mean).toBeLessThan(PERFORMANCE_CONFIG.singleQueryTarget)
      expect(stats.p95).toBeLessThan(PERFORMANCE_CONFIG.singleQueryTarget * 1.5)
    })
    
    it(`批量10个命盘计算应该在${PERFORMANCE_CONFIG.batchQueryTarget}ms内完成`, () => {
      const batchSize = 10
      const batches = Math.floor(100 / batchSize)
      
      for (let i = 0; i < batches; i++) {
        const batchData = generateTestData(batchSize)
        
        monitor.start()
        const charts = batchData.map(data => api.getChart(data))
        const duration = monitor.end()
        
        expect(charts).toHaveLength(batchSize)
        expect(duration).toBeLessThan(PERFORMANCE_CONFIG.batchQueryTarget)
      }
      
      const stats = monitor.getStats()
      console.log(`批量${batchSize}个命盘计算性能:`, stats)
      
      expect(stats.mean).toBeLessThan(PERFORMANCE_CONFIG.batchQueryTarget)
      expect(stats.p95).toBeLessThan(PERFORMANCE_CONFIG.batchQueryTarget * 1.5)
    })
  })
  
  describe('时间计算性能测试', () => {
    it('综合时间信息查询应该在10ms内完成', () => {
      const testCases = generateTestData(100).map(data => ({
        ...data,
        birthDate: new Date(data.year, data.month - 1, data.day),
        targetDate: new Date(2024, 11, 1),
        yearStem: '甲',
        yearBranch: '子',
        fiveElementsBureau: 'fire_6',
        lifePalaceIndex: 0
      }))
      
      testCases.forEach(testCase => {
        monitor.start()
        const timeInfo = getComprehensiveTimeInfo(
          testCase.birthDate,
          testCase.targetDate,
          testCase.gender,
          testCase.yearStem,
          testCase.yearBranch,
          testCase.fiveElementsBureau,
          testCase.lifePalaceIndex
        )
        const duration = monitor.end()
        
        expect(timeInfo).toBeDefined()
        expect(duration).toBeLessThan(10)
      })
      
      const stats = monitor.getStats()
      console.log('综合时间信息查询性能:', stats)
      
      expect(stats.mean).toBeLessThan(10)
      expect(stats.p95).toBeLessThan(15)
    })
  })
  
  describe('并发性能测试', () => {
    it(`应该能处理${PERFORMANCE_CONFIG.concurrentUsers}个并发请求`, async () => {
      const testData = generateTestData(PERFORMANCE_CONFIG.concurrentUsers)
      
      monitor.start()
      
      // 模拟并发请求
      const promises = testData.map(data => 
        new Promise((resolve) => {
          // 使用 setTimeout 模拟异步
          setTimeout(() => {
            const chart = api.getChart(data)
            resolve(chart)
          }, 0)
        })
      )
      
      const results = await Promise.all(promises)
      const totalDuration = monitor.end()
      
      expect(results).toHaveLength(PERFORMANCE_CONFIG.concurrentUsers)
      results.forEach(chart => {
        expect(chart).toBeDefined()
      })
      
      const avgTimePerRequest = totalDuration / PERFORMANCE_CONFIG.concurrentUsers
      console.log(`并发性能测试 - 总时间: ${totalDuration}ms, 平均每请求: ${avgTimePerRequest}ms`)
      
      // 并发请求的平均时间应该合理
      expect(avgTimePerRequest).toBeLessThan(50)
    })
  })
  
  describe('内存使用测试', () => {
    it('重复计算不应该导致内存泄漏', () => {
      const testData = generateTestData(10)
      const iterations = 100
      
      // 记录初始内存（如果可用）
      const initialMemory = (global as any).gc ? 
        process.memoryUsage().heapUsed : 0
      
      // 执行大量重复计算
      for (let i = 0; i < iterations; i++) {
        testData.forEach(data => {
          const chart = api.getChart(data)
          const relations = getPalaceRelationships(0)
          const trinity = getTrinityPalaces(0)
          // 不保存结果，让GC可以回收
        })
      }
      
      // 强制垃圾回收（如果可用）
      if ((global as any).gc) {
        (global as any).gc()
        
        const finalMemory = process.memoryUsage().heapUsed
        const memoryIncrease = finalMemory - initialMemory
        const memoryIncreaseMB = memoryIncrease / 1024 / 1024
        
        console.log(`内存增长: ${memoryIncreaseMB.toFixed(2)} MB`)
        
        // 内存增长应该在合理范围内（<50MB）
        expect(memoryIncreaseMB).toBeLessThan(50)
      }
    })
  })
  
  describe('算法复杂度验证', () => {
    it('算法应该具有O(1)或O(n)的时间复杂度', () => {
      const sizes = [10, 50, 100, 500, 1000]
      const times: number[] = []
      
      sizes.forEach(size => {
        const testData = generateTestData(size)
        
        const startTime = performance.now()
        testData.forEach(data => {
          calculateYearGanZhi(data.year)
          calculateLifePalace(data.month, data.hour)
          calculateBodyPalace(data.month, data.hour)
        })
        const duration = performance.now() - startTime
        
        times.push(duration / size) // 平均每个操作的时间
      })
      
      // 检查时间增长是否线性
      // 如果是O(1)，平均时间应该基本不变
      // 如果是O(n)，总时间应该线性增长，但平均时间应该稳定
      const avgTimes = times.map(t => parseFloat(t.toFixed(3)))
      console.log('不同数据量的平均操作时间:', avgTimes)
      
      // 计算时间增长率
      const growthRates = []
      for (let i = 1; i < avgTimes.length; i++) {
        growthRates.push(avgTimes[i] / avgTimes[i - 1])
      }
      
      console.log('时间增长率:', growthRates)
      
      // 增长率应该接近1（表示O(1)或O(n)）
      growthRates.forEach(rate => {
        expect(rate).toBeGreaterThan(0.5)
        expect(rate).toBeLessThan(2)
      })
    })
  })
  
  describe('性能回归测试', () => {
    const performanceBaseline = {
      yearGanZhi: 0.5,
      lifePalace: 0.5,
      palaceRelations: 3,
      fullChart: 50,
      timeInfo: 8
    }
    
    it('性能不应该低于基准线', () => {
      const testCount = 100
      const results: Record<string, number> = {}
      
      // 测试年干支计算
      monitor.reset()
      for (let i = 0; i < testCount; i++) {
        monitor.start()
        calculateYearGanZhi(2000 + i)
        monitor.end()
      }
      results.yearGanZhi = monitor.getStats().mean
      
      // 测试命宫计算
      monitor.reset()
      for (let i = 0; i < testCount; i++) {
        monitor.start()
        calculateLifePalace((i % 12) + 1, (i % 12) + 1)
        monitor.end()
      }
      results.lifePalace = monitor.getStats().mean
      
      // 测试宫位关系
      monitor.reset()
      for (let i = 0; i < testCount; i++) {
        monitor.start()
        getPalaceRelationships(i % 12)
        monitor.end()
      }
      results.palaceRelations = monitor.getStats().mean
      
      // 验证性能
      console.log('性能回归测试结果:', results)
      console.log('性能基准线:', performanceBaseline)
      
      expect(results.yearGanZhi).toBeLessThan(performanceBaseline.yearGanZhi * 1.2)
      expect(results.lifePalace).toBeLessThan(performanceBaseline.lifePalace * 1.2)
      expect(results.palaceRelations).toBeLessThan(performanceBaseline.palaceRelations * 1.2)
    })
  })
})