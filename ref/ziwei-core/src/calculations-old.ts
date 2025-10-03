/**
 * 紫微斗数计算工具函数 - 统一入口
 * Consolidated Calculator Entry Point for ZiWei DouShu
 * 
 * 本文件作为紫微斗数所有核心计算算法的统一入口，提供向后兼容性和完整的功能访问。
 * 底层实现基于模块化架构，按功能域分组组织在 ./calculations/ 目录中。
 * 
 * ## 📐 双重/三重数值体系设计标准
 * 
 * ### 基础双重数值 (Dual-Value)
 * - `value`: 计算意义数值 (用于显示，如"命宫"、"紫微"、"庙")
 * - `index`: 渲染意义数值 (用于处理，如0-11宫位索引)
 * 
 * ### 三重数值结构 (Triple-Value) - 宫位叠加场景
 * - `value`: 原始意义 (如"身宫"、"大财"、"年命")
 * - `index`: 渲染位置 (实际所在宫位索引)
 * - `name`: 叠加说明 (如"身宫在疾厄宫")
 * 
 * 需要三重数值的场景：身宫、主星、辅星、四化、大运、流年、来因宫
 * 
 * @version 2.0.0
 * @lastUpdated 2025-09-08
 * @architecture Modular design with unified entry point
 */

/**
 * 🗂️ 函数索引 (Function Index)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ## 📚 数据转换与预处理 (Data Conversion & Preprocessing)
 * ├── createBaZiParams()              - 从tyme4ts创建统一八字参数对象 ⭐ 推荐入口
 * └── calculateYearGanZhi()           - 计算年干支 [DEPRECATED: 使用tyme4ts]
 * 
 * ## 🏛️ 宫位计算 (Palace Calculations)
 * ├── calculateLifePalace()           - 计算命宫位置
 * ├── calculateBodyPalace()           - 计算身宫位置
 * ├── getPalaceName()                 - 获取宫位名称
 * └── calculateLaiyinPalace()         - 计算来因宫
 * 
 * ## 🌟 主星安星 (Main Star Placements)
 * ├── calculateZiweiPosition()        - 计算紫微星位置
 * ├── calculateTianfuPosition()       - 计算天府星位置
 * └── calculateMainStarPositions()    - 计算所有主星位置
 * 
 * ## ⭐ 辅星安星 (Auxiliary Star Placements)
 * ├── calculateAuxiliaryStarPositions() - 计算吉星位置 (文昌文曲左辅右弼等)
 * ├── calculateMaleficStarPositions()  - 计算煞星位置 (擎羊陀罗火铃空劫等)
 * ├── calculateRomanceStarPositions()  - 计算桃花星位置 (红鸾天喜天姚咸池)
 * └── calculateMinorStarPositions()    - 计算小星位置 (天官天福等)
 * 
 * ## 🔄 四化计算 (Four Transformations)
 * ├── calculateBirthYearSihua()       - 计算生年四化
 * ├── calculateFlyingPalaceSihua()    - 计算飞宫四化
 * └── calculateSelfTransformations()  - 计算自化 (宫干引发的四化)
 * 
 * ## 👑 命主身主 (Life & Body Masters)
 * ├── calculateMasters()              - 计算命主身主
 * └── getInnateDauPalaceIndex()       - 获取先天斗君宫位索引
 * 
 * ## 📅 运程计算 (Period Calculations)
 * ├── calculateMajorPeriodStartAge()  - 计算大运起运年龄
 * ├── calculateMajorPeriods()         - 计算大运信息
 * ├── calculateFleetingYears()        - 计算流年
 * └── calculateMinorPeriod()          - 计算小限
 * 
 * ## ⚡ 五行局 (Five Elements Bureau)
 * └── calculateFiveElementsBureauDetail() - 五行局详细信息（包含所有格式）
 * 
 * ## 🌟 星曜亮度 (Star Brightness)
 * ├── getStarBrightness()             - 获取星曜亮度值 ⭐ 推荐
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @usage 推荐使用模式：
 * ```typescript
 * import { Solar } from 'tyme4ts'
 * import { createBaZiParams } from './calculations'
 * 
 * const solar = Solar.fromYmd(1989, 2, 1)
 * const baziParams = createBaZiParams(solar, 0) // 统一数据入口
 * 
 * // 使用 baziParams 中的数据进行各种计算
 * const lifePalace = calculateLifePalace(baziParams.lunarMonth, baziParams.timeZhiIndex)
 * ```
 * 
 * @note
 * - ⭐ 标记为推荐使用的函数
 * - [DEPRECATED] 标记为即将废弃的函数
 * - 新项目请优先使用 createBaZiParams 作为数据入口
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📦 MODULAR IMPORTS - Re-export from specialized calculation modules
// ═══════════════════════════════════════════════════════════════════════════

// Re-export everything from modular calculation system
export * from './calculations'

// Direct imports from individual modules for consolidated functions
import { getStarBrightness } from './calculations/brightness-calculations'
import { calculateFiveElementsBureauDetail } from './calculations/bureau-calculations'
import { type BaZiParams } from './calculations/data-conversion'
import { calculateMasters } from './calculations/masters'
import {
  calculateLifePalace,
  calculateBodyPalace,
  getPalaceName
} from './calculations/palace-calculations'
import {
  calculateZiweiPosition,
  calculateTianfuPosition,
  calculateMainStarPositions,
  calculateAuxiliaryStarPositions,
  calculateMaleficStarPositions,
  calculateRomanceStarPositions
} from './calculations/star-placements'
import { calculateBirthYearSihua } from './calculations/transformations'
// Import constants for local helper functions
import {
  STEMS,
  BRANCHES,
  PALACE_NAMES,
  type StarBrightnessValue
} from './constants'

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CONSOLIDATED CALCULATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 获取先天斗君宫位索引
 * Get innate Dou Jun palace index
 * 
 * @param lifePalaceIndex 命宫索引
 * @param yearBranch 年支
 * @returns 先天斗君宫位索引
 */
export function getInnateDauPalaceIndex(lifePalaceIndex: number, yearBranch: string): number {
  const branchIndex = BRANCHES.indexOf(yearBranch)
  if (branchIndex === -1) {
    throw new Error(`Invalid year branch: ${yearBranch}`)
  }
  return (lifePalaceIndex + branchIndex) % 12
}

/**
 * 计算斗君位置 (用于排盘)
 * Calculate Dou Jun position for chart layout
 * 
 * @param lunarMonth 农历月份 (1-12)
 * @param timeZhiIndex 时辰索引 (0-11)
 * @returns 斗君宫位索引
 */
export function calculateDouJun(lunarMonth: number, timeZhiIndex: number): number {
  // 斗君 = 正月起寅宫，顺数至生月，再从生月起子时，顺数至生时
  const monthPalaceIndex = (lunarMonth - 1 + 2) % 12 // 正月在寅宫(索引2)
  return (monthPalaceIndex + timeZhiIndex) % 12
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 COMPREHENSIVE CHART GENERATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 综合排盘接口
 */
export interface IZiWeiCompleteChart {
  // 基础信息
  baziGanZhi: string
  baziDayun: string
  lifePalace: string
  bodyPalace: string
  laiyinPalace: string
  lifeMaster: string
  bodyMaster: string
  doujun: number
  fiveElementsBureau: {
    name: string
    number: string
  }
  
  // 宫位信息
  palaces: {
    name: string
    index: number
    branch: string
    stem: string
    mainStars: string[]
    auxiliaryStars: string[]
    maleficStars: string[]
    romanceStars: string[]
    brightness: Record<string, string>
    sihua: {
      lu: string[]
      quan: string[]
      ke: string[]
      ji: string[]
    }
  }[]
  
  // 四化分析
  sihuaAnalysis: {
    birthYearSihua: {
      stem: string
      transformations: {
        lu: string
        quan: string
        ke: string
        ji: string
      }
    }
  }
  
  // 元数据
  generatedAt: string
  version: string
}

/**
 * 生成完整紫微斗数排盘
 * Generate complete ZiWei DouShu chart
 * 
 * @param baziParams 八字参数对象
 * @returns 完整排盘结果
 */
export function generateCompleteZiWeiChart(baziParams: BaZiParams): IZiWeiCompleteChart {
  try {
    // 基础计算
    const lifePalaceIndex = calculateLifePalace(baziParams.lunarMonth, baziParams.timeZhiIndex)
    const bodyPalaceIndex = calculateBodyPalace(baziParams.lunarMonth, baziParams.timeZhiIndex)
    const fiveElementsBureau = calculateFiveElementsBureauDetail(
      baziParams.yearStem,
      baziParams.yearBranch,
      baziParams.lunarMonth,
      baziParams.timeZhiIndex
    )
    const masters = calculateMasters(baziParams.yearBranch)
    const lifeMaster = masters.lifeMaster
    const bodyMaster = masters.bodyMaster
    
    // 星曜计算
    const ziweiPosition = calculateZiweiPosition(fiveElementsBureau.code, baziParams.lunarDay)
    const tianfuPosition = calculateTianfuPosition(ziweiPosition)
    const mainStars = calculateMainStarPositions(ziweiPosition, tianfuPosition)
    const auxiliaryStars = calculateAuxiliaryStarPositions(
      baziParams.lunarMonth,
      baziParams.lunarDay,
      baziParams.timeZhiIndex,
      baziParams.yearStem,
      baziParams.yearBranch
    )
    const maleficStars = calculateMaleficStarPositions(
      baziParams.lunarMonth,
      baziParams.timeZhiIndex,
      baziParams.yearStem,
      baziParams.yearBranch
    )
    const romanceStars = calculateRomanceStarPositions(baziParams.yearBranch, baziParams.lunarMonth)
    
    // 四化计算
    const birthSihua = calculateBirthYearSihua(baziParams.yearStem)
    
    // 构建宫位信息
    const palaces = Array.from({ length: 12 }, (_, index) => {
      const stem = calculateStemForBranch(index, baziParams.yearStem)
      const branch = BRANCHES[index]
      
      // 收集该宫位的星曜
      const palaceMainStars = Object.entries(mainStars)
        .filter(([, pos]) => pos === index)
        .map(([star]) => star)
      
      const palaceAuxStars = Object.entries(auxiliaryStars)
        .filter(([, pos]) => pos === index)
        .map(([star]) => star)
      
      const palaceMaleficStars = Object.entries(maleficStars)
        .filter(([, pos]) => pos === index)
        .map(([star]) => star)
      
      const palaceRomanceStars = Object.entries(romanceStars)
        .filter(([, pos]) => pos === index)
        .map(([star]) => star)
      
      // 计算星曜亮度
      const brightness: Record<string, string> = {}
      const allStars = [...palaceMainStars, ...palaceAuxStars]
      allStars.forEach(star => {
        const brightnessValue = getStarBrightness(star, index)
        brightness[star] = getBrightnessName(brightnessValue)
      })
      
      // 四化信息
      const sihua = {
        lu: birthSihua.A === stem ? [birthSihua.A] : [],
        quan: birthSihua.B === stem ? [birthSihua.B] : [],
        ke: birthSihua.C === stem ? [birthSihua.C] : [],
        ji: birthSihua.D === stem ? [birthSihua.D] : []
      }
      
      return {
        name: PALACE_NAMES[index],
        index,
        branch,
        stem,
        mainStars: palaceMainStars,
        auxiliaryStars: palaceAuxStars,
        maleficStars: palaceMaleficStars,
        romanceStars: palaceRomanceStars,
        brightness,
        sihua
      }
    })
    
    // 构建完整结果
    const completeChart: ZiWeiCompleteChart = {
      baziGanZhi: `${baziParams.yearStem}${baziParams.yearBranch} ${baziParams.monthStem}${baziParams.monthBranch} ${baziParams.dayStem}${baziParams.dayBranch} ${baziParams.timeStem}${baziParams.timeBranch}`,
      baziDayun: baziParams.majorPeriods.map(period => 
        `${period.startAge}-${period.endAge}岁: ${period.stem}${period.branch}`
      ).join(', '),
      lifePalace: getPalaceName(lifePalaceIndex, lifePalaceIndex),
      bodyPalace: getPalaceName(bodyPalaceIndex, lifePalaceIndex), 
      laiyinPalace: PALACE_NAMES[(lifePalaceIndex + 6) % 12], // 来因宫在迁移宫位置
      lifeMaster,
      bodyMaster,
      doujun: calculateDouJun(baziParams.lunarMonth, baziParams.timeZhiIndex), // 使用农历月份和时辰索引
      fiveElementsBureau: {
        name: fiveElementsBureau.name,
        number: fiveElementsBureau.局数.toString()
      },
      palaces,
      sihuaAnalysis: {
        birthYearSihua: {
          stem: baziParams.yearStem,
          transformations: {
            lu: birthSihua.A || '',
            quan: birthSihua.B || '',
            ke: birthSihua.C || '',
            ji: birthSihua.D || ''
          }
        }
      },
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    }
    
    return completeChart
    
  } catch (error) {
    throw new Error(`ZiWei Chart generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🛠️ HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 辅助函数 - 获取亮度名称 (标准七等级制)
 */
function getBrightnessName(brightness: StarBrightnessValue): string {
  const names = ['陷', '不', '平', '利', '得', '旺', '庙']
  return names[brightness] || '平'
}

/**
 * 辅助函数 - 计算干支配宫 
 */
function calculateStemForBranch(branchIndex: number, yearStem: string): string {
  // 紫微斗数宫干用年干起寅宫的五虎遁法
  // 五虎遁表：年干 -> 寅宫起始天干
  const wuHuDunTable: Record<string, string> = {
    '甲': '丙', '己': '丙',  // 甲己之年丙作首
    '乙': '戊', '庚': '戊',  // 乙庚之岁戊为头  
    '丙': '庚', '辛': '庚',  // 丙辛必定从庚起
    '丁': '壬', '壬': '壬',  // 丁壬壬位顺流行
    '戊': '甲', '癸': '甲'   // 戊癸之年甲寅宫
  }
  
  const yinStem = wuHuDunTable[yearStem]
  if (!yinStem) return '甲' // 默认值
  
  const yinStemIndex = STEMS.indexOf(yinStem as typeof STEMS[number])
  
  // 计算从寅宫(索引2)到目标宫的偏移量
  const offsetFromYin = (branchIndex - 2 + 12) % 12
  
  // 应用五虎遁：从寅宫天干开始，按十天干循环
  const stemIndex = (yinStemIndex + offsetFromYin) % 10
  return STEMS[stemIndex]
}
