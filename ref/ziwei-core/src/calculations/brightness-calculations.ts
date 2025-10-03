/**
 * 紫微斗数星曜亮度计算模块
 * Star Brightness Calculations Module for ZiWei DouShu
 * 
 * @description
 * 提供星曜亮度相关的计算功能
 * Provides calculation functions for star brightness
 * 
 * @module BrightnessCalculations
 * @version 2.0.0
 */

import { 
  STAR_BRIGHTNESS_TABLE, 
  BRIGHTNESS_LEVEL_MAP,
  type StarBrightnessValue 
} from '../constants'

/**
 * 获取星曜在指定宫位的亮度数值
 * Get star brightness value at specified palace position
 * 
 * @param starName 星曜名称 Star name
 * @param palaceIndex 宫位索引 (0-11, 对应子丑寅卯辰巳午未申酉戌亥)
 * @returns 亮度数值 (0-6: 陷不地平利得旺庙)
 */
export function getStarBrightness(starName: string, palaceIndex: number): StarBrightnessValue {
  const brightnessArray = STAR_BRIGHTNESS_TABLE[starName]
  if (!brightnessArray) {
    throw new Error(`[Brightness] Unknown star: ${starName}`)
  }
  if (palaceIndex < 0 || palaceIndex > 11) {
    throw new Error(`[Brightness] Invalid palace index: ${palaceIndex}`)
  }
  const brightnessLevel = brightnessArray[palaceIndex]
  if (!brightnessLevel) {
    throw new Error(`[Brightness] Missing level for ${starName} at index ${palaceIndex}`)
  }
  const mapped = BRIGHTNESS_LEVEL_MAP[brightnessLevel]
  if (mapped === undefined) {
    throw new Error(`[Brightness] Unknown level token: ${brightnessLevel}`)
  }
  return mapped
}

/**
 * 获取星曜亮度等级名称
 * Get star brightness level name
 * 
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 亮度等级名称 (庙、旺、得、利、平、不、陷)
 */
export function getStarBrightnessLevel(starName: string, palaceIndex: number): string {
  const brightnessArray = STAR_BRIGHTNESS_TABLE[starName]
  if (!brightnessArray) {
    throw new Error(`[Brightness] Unknown star: ${starName}`)
  }
  if (palaceIndex < 0 || palaceIndex > 11) {
    throw new Error(`[Brightness] Invalid palace index: ${palaceIndex}`)
  }
  const brightnessLevel = brightnessArray[palaceIndex]
  if (!brightnessLevel) {
    throw new Error(`[Brightness] Missing level for ${starName} at index ${palaceIndex}`)
  }
  return brightnessLevel
}

/**
 * 判断星曜是否入庙
 * Check if star is in temple (入庙)
 * 
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 是否入庙
 */
export function isStarInTemple(starName: string, palaceIndex: number): boolean {
  const brightnessLevel = getStarBrightnessLevel(starName, palaceIndex)
  return brightnessLevel === '庙'
}

/**
 * 判断星曜是否旺盛
 * Check if star is prosperous (旺)
 * 
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 是否旺盛
 */
export function isStarProsperous(starName: string, palaceIndex: number): boolean {
  const brightnessLevel = getStarBrightnessLevel(starName, palaceIndex)
  return brightnessLevel === '旺'
}

/**
 * 判断星曜是否失陷
 * Check if star is trapped (陷)
 * 
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 是否失陷
 */
export function isStarTrapped(starName: string, palaceIndex: number): boolean {
  const brightnessLevel = getStarBrightnessLevel(starName, palaceIndex)
  return brightnessLevel === '陷'
}

/**
 * 获取星曜亮度评分
 * Get star brightness score (0-6, 数值越高亮度越好)
 * 
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 亮度评分
 */
export function getStarBrightnessScore(starName: string, palaceIndex: number): number {
  return getStarBrightness(starName, palaceIndex)
}
