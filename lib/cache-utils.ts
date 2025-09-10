// 统一缓存键生成工具
import { createHash } from 'crypto'

// 缓存键生成器接口
interface CacheKeyGenerator {
  generateBaziKey(baziData: any): string
  generateZiweiKey(ziweiData: any): string
  generateDestinyArrowKey(arrowData: any): string
  generateSihuaKey(sihuaData: any): string
  generateAnalysisKey(type: string, data: any): string
}

// 高性能hash函数（使用crypto模块）
function fastHash(input: string): string {
  return createHash('md5').update(input).digest('hex').substring(0, 16)
}

// 简单hash函数（fallback）
function simpleHash(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  return Math.abs(hash).toString(36)
}

// 安全的对象序列化
function safeStringify(obj: any): string {
  try {
    // 排序对象键以确保一致性
    const sortedObj = sortObjectKeys(obj)
    return JSON.stringify(sortedObj)
  } catch (error) {
    console.warn('对象序列化失败，使用toString:', error)
    return String(obj)
  }
}

// 递归排序对象键
function sortObjectKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys).sort()
  }
  
  const sorted: any = {}
  Object.keys(obj)
    .sort()
    .forEach(key => {
      sorted[key] = sortObjectKeys(obj[key])
    })
  
  return sorted
}

// 提取星曜信息的标准化函数
function extractStarInfo(stars: any[]): string {
  if (!Array.isArray(stars)) return ''
  
  return stars
    .map(star => {
      const name = star.name || ''
      const brightness = star.brightness || ''
      const sihua = star.sihua || star.xiangXinSihua || star.liXinSihua || ''
      return `${name}${brightness}${sihua}`
    })
    .sort()
    .join(',')
}

// 缓存键生成器实现
class CacheKeyGeneratorImpl implements CacheKeyGenerator {
  // 生成八字缓存键
  generateBaziKey(baziData: any): string {
    try {
      if (!baziData) return 'empty_bazi'
      
      const keyData = {
        year: baziData.yearPillar || baziData.year || '',
        month: baziData.monthPillar || baziData.month || '',
        day: baziData.dayPillar || baziData.day || '',
        hour: baziData.hourPillar || baziData.hour || '',
        gender: baziData.gender || ''
      }
      
      const input = safeStringify(keyData)
      return `bazi_${fastHash(input)}`
    } catch (error) {
      console.error('生成八字缓存键失败:', error)
      return `bazi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // 生成紫微缓存键
  generateZiweiKey(ziweiData: any): string {
    try {
      if (!ziweiData) return 'empty_ziwei'
      
      const keyData = {
        birth: `${ziweiData.year}_${ziweiData.month}_${ziweiData.day}_${ziweiData.hour}`,
        gender: ziweiData.gender || '',
        ming: ziweiData.mingGong ? `${ziweiData.mingGong.heavenlyStem}${ziweiData.mingGong.branch}` : '',
        // 只包含关键宫位以减少键长度
        key_palaces: ['mingGong', 'caiPo', 'guanLu', 'qianYi']
          .map(palace => {
            const p = ziweiData[palace]
            return p ? `${p.heavenlyStem}${p.branch}` : ''
          })
          .join('|')
      }
      
      const input = safeStringify(keyData)
      return `ziwei_${fastHash(input)}`
    } catch (error) {
      console.error('生成紫微缓存键失败:', error)
      return `ziwei_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // 生成命运之箭缓存键（优化版）
  generateDestinyArrowKey(arrowData: any): string {
    try {
      if (!arrowData) return 'empty_arrow'
      
      const keyData = {
        ming: this.extractPalaceKey(arrowData.mingGong),
        cai: this.extractPalaceKey(arrowData.caiPo),
        guan: this.extractPalaceKey(arrowData.guanLu),
        qian: this.extractPalaceKey(arrowData.qianYi)
      }
      
      const input = safeStringify(keyData)
      return `arrow_${fastHash(input)}`
    } catch (error) {
      console.error('生成命运之箭缓存键失败:', error)
      return `arrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // 生成四化缓存键
  generateSihuaKey(sihuaData: any): string {
    try {
      if (!sihuaData) return 'empty_sihua'
      
      const keyData = {
        laiYin: sihuaData.laiYinGong?.name || '',
        positions: sihuaData.sihuaPositions ? {
          lu: sihuaData.sihuaPositions.lu?.palace || '',
          quan: sihuaData.sihuaPositions.quan?.palace || '',
          ke: sihuaData.sihuaPositions.ke?.palace || '',
          ji: sihuaData.sihuaPositions.ji?.palace || ''
        } : {}
      }
      
      const input = safeStringify(keyData)
      return `sihua_${fastHash(input)}`
    } catch (error) {
      console.error('生成四化缓存键失败:', error)
      return `sihua_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // 生成通用分析缓存键
  generateAnalysisKey(type: string, data: any): string {
    try {
      switch (type) {
        case 'tiekou_zhiduan':
        case 'yongshen_analysis':
          return this.generateBaziKey(data)
        case 'ziwei_reasoning':
          return this.generateZiweiKey(data)
        case 'sihua_reasoning':
          return this.generateSihuaKey(data)
        case 'destiny_arrow':
          return this.generateDestinyArrowKey(data)
        default:
          const input = safeStringify({ type, data })
          return `${type}_${fastHash(input)}`
      }
    } catch (error) {
      console.error('生成分析缓存键失败:', error)
      return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // 提取宫位关键信息
  private extractPalaceKey(palace: any): string {
    if (!palace) return ''
    
    const stem = palace.heavenlyStem || ''
    const branch = palace.branch || ''
    const stars = extractStarInfo(palace.stars || [])
    
    return `${stem}${branch}-${stars}`
  }
}

// 单例实例
const cacheKeyGenerator = new CacheKeyGeneratorImpl()

// 导出函数接口
export function generateBaziCacheKey(baziData: any): string {
  return cacheKeyGenerator.generateBaziKey(baziData)
}

export function generateZiweiCacheKey(ziweiData: any): string {
  return cacheKeyGenerator.generateZiweiKey(ziweiData)
}

export function generateDestinyArrowCacheKey(arrowData: any): string {
  return cacheKeyGenerator.generateDestinyArrowKey(arrowData)
}

export function generateSihuaCacheKey(sihuaData: any): string {
  return cacheKeyGenerator.generateSihuaKey(sihuaData)
}

export function generateAnalysisCacheKey(type: string, data: any): string {
  return cacheKeyGenerator.generateAnalysisKey(type, data)
}

// 缓存键前缀常量
export const CACHE_PREFIXES = {
  BAZI: 'bazi',
  ZIWEI: 'ziwei', 
  DESTINY_ARROW: 'arrow',
  SIHUA: 'sihua',
  TIEKOU: 'tiekou',
  YONGSHEN: 'yongshen',
  AI_ANALYSIS: 'ai_analysis'
} as const

// 缓存键验证
export function validateCacheKey(key: string): boolean {
  if (!key || typeof key !== 'string') return false
  if (key.length < 5 || key.length > 100) return false
  return /^[a-zA-Z0-9_-]+$/.test(key)
}

// 缓存键清理（移除无效字符）
export function sanitizeCacheKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 100)
}

// 批量生成缓存键
export function generateBatchCacheKeys(
  type: string, 
  dataArray: any[]
): { data: any; key: string }[] {
  return dataArray.map(data => ({
    data,
    key: generateAnalysisCacheKey(type, data)
  }))
}

// 导出类型
export type { CacheKeyGenerator } 