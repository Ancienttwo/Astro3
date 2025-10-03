/**
 * 紫微斗数四化计算模块
 * Four Transformations (Sihua) Module for ZiWei DouShu
 * 
 * @description
 * 提供生年四化、飞宫四化等变化计算功能
 * Provides calculation functions for birth year sihua and flying palace sihua
 * 
 * @module Transformations
 * @version 2.0.0
 */

import { BIRTH_YEAR_SIHUA, FLYING_PALACE_SIHUA } from '../constants'

/**
 * 四化类型定义
 */
export interface SihuaTransformation {
  star: string
  type: string
  source?: string
}

/**
 * 计算生年四化
 * Calculate birth year Si Hua transformations
 * 
 * @param yearStem 年天干
 * @returns 四化对象 {A: 化禄, B: 化权, C: 化科, D: 化忌}
 */
export function calculateBirthYearSihua(yearStem: string): {
  A: string // 化禄
  B: string // 化权  
  C: string // 化科
  D: string // 化忌
} {
  return BIRTH_YEAR_SIHUA[yearStem] || { A: '', B: '', C: '', D: '' }
}

/**
 * 计算飞宫四化
 * Calculate flying palace Si Hua transformations
 * 
 * @param palaceStem 宫干
 * @param targetPalaceIndex 目标宫位索引
 * @param sourcePalaceIndex 源宫位索引  
 * @returns 四化变换数组
 */
export function calculateFlyingPalaceSihua(
  palaceStem: string,
  targetPalaceIndex: number,
  sourcePalaceIndex: number
): SihuaTransformation[] {
  const sihua = FLYING_PALACE_SIHUA[palaceStem]
  if (!sihua) return []

  const transformations: SihuaTransformation[] = []
  
  // 判断是向心还是离心
  const isInward = targetPalaceIndex === (sourcePalaceIndex + 6) % 12 // 对宫
  const prefix = isInward ? 'i' : 'x'
  
  // 添加四化
  if (sihua.A) transformations.push({ star: sihua.A, type: `${prefix}A` })
  if (sihua.B) transformations.push({ star: sihua.B, type: `${prefix}B` })
  if (sihua.C) transformations.push({ star: sihua.C, type: `${prefix}C` })
  if (sihua.D) transformations.push({ star: sihua.D, type: `${prefix}D` })
  
  return transformations
}

/**
 * 计算自化
 * Calculate self transformations (宫干引发的四化)
 * 
 * @param palaceStem 宫干
 * @param starsInPalace 该宫内的星曜列表
 * @returns 自化变换数组
 */
export function calculateSelfTransformations(
  palaceStem: string,
  starsInPalace: string[]
): SihuaTransformation[] {
  // 向后兼容：仅按本宫宫干（离心自化）计算
  return calculateSelfTransformationsDual(palaceStem, palaceStem, starsInPalace).map(t => ({
    star: t.star,
    type: t.type,
    source: palaceStem,
  }))
}

/**
 * 计算自化（双向）
 * - outward(离心): 使用本宫宫干
 * - inward(向心): 使用对宫(+6)宫干
 */
export function calculateSelfTransformationsDual(
  palaceStem: string,
  oppositePalaceStem: string,
  starsInPalace: string[]
): (SihuaTransformation & { direction: 'inward' | 'outward' })[] {
  const out: (SihuaTransformation & { direction: 'inward' | 'outward' })[] = []

  const check = (stem: string, direction: 'inward' | 'outward') => {
    const sihua = BIRTH_YEAR_SIHUA[stem]
    if (!sihua) return
    starsInPalace.forEach((star) => {
      if (sihua.A === star) out.push({ star, type: '自化禄', source: stem, direction })
      if (sihua.B === star) out.push({ star, type: '自化权', source: stem, direction })
      if (sihua.C === star) out.push({ star, type: '自化科', source: stem, direction })
      if (sihua.D === star) out.push({ star, type: '自化忌', source: stem, direction })
    })
  }

  // 先计算离心（本宫干），再计算向心（对宫干）
  check(palaceStem, 'outward')
  if (oppositePalaceStem && oppositePalaceStem !== palaceStem) check(oppositePalaceStem, 'inward')
  return out
}

/**
 * 获取四化星曜信息
 * Get Sihua star information
 * 
 * @param yearStem 年天干
 * @returns 详细的四化信息
 */
export function getSihuaStarInfo(yearStem: string): {
  chemicalLu: string    // 化禄
  chemicalQuan: string  // 化权
  chemicalKe: string    // 化科
  chemicalJi: string    // 化忌
} {
  const sihua = calculateBirthYearSihua(yearStem)
  
  return {
    chemicalLu: sihua.A,
    chemicalQuan: sihua.B,
    chemicalKe: sihua.C,
    chemicalJi: sihua.D
  }
}
