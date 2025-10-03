/**
 * Chart Generator Helper Functions
 * 图表生成器辅助函数
 */

import { STEMS, type Stem, type StarBrightnessValue } from '../constants'

// Constants
export const NUM_PALACES = 12
export const OPPOSITE_PALACE_OFFSET = 6
export const YIN_BRANCH_INDEX = 2
export const BRIGHTNESS_NAMES = ['陷', '不', '平', '利', '得', '旺', '庙']
export const NUM_STEMS = 10

/**
 * Type guard for safer type checking
 */
export function isStem(value: string): value is Stem {
  // Check if value is one of the ten heavenly stems
  return value === '甲' || value === '乙' || value === '丙' || value === '丁' || 
         value === '戊' || value === '己' || value === '庚' || value === '辛' || 
         value === '壬' || value === '癸'
}

/**
 * 获取亮度名称 (标准七等级制)
 */
export function getBrightnessName(brightness: StarBrightnessValue): string {
  return BRIGHTNESS_NAMES[brightness] ?? '平'
}

/**
 * 从星曜Map中获取指定位置的星曜
 */
export function getStarsAtPosition(starMap: Map<string, number[]>, position: number): string[] {
  const stars: string[] = []
  starMap.forEach((positions, star) => {
    if (positions.includes(position)) {
      stars.push(star)
    }
  })
  return stars
}

/**
 * 计算干支配宫 - 五虎遁法
 */
export function calculateStemForBranch(branchIndex: number, yearStem: string): string {
  // Type check yearStem
  if (!isStem(yearStem)) {
    return '甲' // 默认值
  }
  // 五虎遁表：年干 -> 寅宫起始天干
  const wuHuDunTable: Record<Stem, Stem> = {
    '甲': '丙', '己': '丙',  // 甲己之年丙作首
    '乙': '戊', '庚': '戊',  // 乙庚之岁戊为头  
    '丙': '庚', '辛': '庚',  // 丙辛必定从庚起
    '丁': '壬', '壬': '壬',  // 丁壬壬位顺流行
    '戊': '甲', '癸': '甲'   // 戊癸之年甲寅宫
  }
  
  const yinStem = wuHuDunTable[yearStem]
  // yinStem is always defined because yearStem is validated
  // to be a valid Stem type through the type system
  
  const yinStemIndex = STEMS.indexOf(yinStem)
  if (yinStemIndex === -1) {
    return '甲' // 默认值
  }
  
  // 计算从寅宫(索引2)到目标宫的偏移量
  const offsetFromYin = (branchIndex - YIN_BRANCH_INDEX + NUM_PALACES) % NUM_PALACES
  
  // 应用五虎遁：从寅宫天干开始，按十天干循环
  const stemIndex = (yinStemIndex + offsetFromYin) % NUM_STEMS
  return STEMS[stemIndex] ?? '甲'
}

/**
 * 计算斗君位置 (用于排盘)
 * @param lunarMonth 农历月份 (1-12)
 * @param timeZhiIndex 时辰索引 (0-11)
 * @returns 斗君宫位索引
 */
export function calculateDouJun(lunarMonth: number, timeZhiIndex: number): number {
  // 斗君 = 正月起寅宫，顺数至生月，再从生月起子时，顺数至生时
  const monthPalaceIndex = (lunarMonth - 1 + YIN_BRANCH_INDEX) % NUM_PALACES
  return (monthPalaceIndex + timeZhiIndex) % NUM_PALACES
}