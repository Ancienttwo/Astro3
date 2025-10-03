/**
 * 紫微斗数综合排盘生成器
 * Complete ZiWei DouShu Chart Generator
 * 
 * @description
 * 提供完整紫微斗数排盘生成功能，整合所有计算模块
 * Provides complete ZiWei DouShu chart generation by integrating all calculation modules
 * 
 * @module ChartGenerator
 * @version 2.0.0
 */

import { calculateFiveElementsBureauDetail } from './calculations/bureau-calculations'
import type { BaZiParams } from './calculations/data-conversion'
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
import { 
  NUM_PALACES, 
  OPPOSITE_PALACE_OFFSET, 
  isStem, 
  calculateDouJun 
} from './chart-generator/helpers'
import { buildPalaces } from './chart-generator/palace-builder'
import type { 
  IZiWeiCompleteChart, 
  IChartBasics, 
  IStarPositions, 
  IChartData 
} from './chart-generator/types'
import { PALACE_NAMES, BRANCHES } from './constants/basic-elements'

// Re-export types for external usage
export type { IZiWeiCompleteChart } from './chart-generator/types'
export { calculateDouJun } from './chart-generator/helpers'

/**
 * 计算基础信息
 */
function calculateChartBasics(baziParams: BaZiParams): IChartBasics {
  const lifePalaceIndex = calculateLifePalace(baziParams.lunarMonth, baziParams.timeZhiIndex)
  const bodyPalaceIndex = calculateBodyPalace(baziParams.lunarMonth, baziParams.timeZhiIndex)
  const fiveElementsBureau = calculateFiveElementsBureauDetail(
    baziParams.yearStem,
    baziParams.yearBranch,
    baziParams.lunarMonth,
    baziParams.timeZhiIndex
  )
  const { lifeMaster, bodyMaster } = calculateMasters(baziParams.yearBranch, BRANCHES[lifePalaceIndex])

  return { 
    lifePalaceIndex, 
    bodyPalaceIndex, 
    fiveElementsBureau, 
    lifeMaster, 
    bodyMaster 
  }
}

/**
 * 计算所有星曜位置
 */
function calculateAllStarPositions(baziParams: BaZiParams, bureauCode: string): IStarPositions {
  const ziweiPosition = calculateZiweiPosition(bureauCode, baziParams.lunarDay)
  const tianfuPosition = calculateTianfuPosition(ziweiPosition)
  
  return {
    mainStars: calculateMainStarPositions(ziweiPosition, tianfuPosition),
    auxiliaryStars: calculateAuxiliaryStarPositions(
      baziParams.lunarMonth,
      baziParams.lunarDay,
      baziParams.timeZhiIndex,
      baziParams.yearStem,
      baziParams.yearBranch
    ),
    maleficStars: calculateMaleficStarPositions(
      baziParams.lunarMonth,
      baziParams.timeZhiIndex,
      baziParams.yearStem,
      baziParams.yearBranch
    ),
    romanceStars: calculateRomanceStarPositions(baziParams.yearBranch, baziParams.lunarMonth)
  }
}

/**
 * 组装完整图表结果
 */
function assembleCompleteChart(
  baziParams: BaZiParams,
  chartData: IChartData
): IZiWeiCompleteChart {
  const { basics, palaces, birthSihua } = chartData
  
  // 计算来因宫：用五虎遁严格定位“与生年天干相同的宫干”所在的环型 index，再按命宫相对映射宫名
  const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const
  const wuHuDunStart: Record<string, string> = { '甲':'丙','己':'丙','乙':'戊','庚':'戊','丙':'庚','辛':'庚','丁':'壬','壬':'壬','戊':'甲','癸':'甲' }
  const startStem = wuHuDunStart[baziParams.yearStem] || '甲'
  const startIdx = STEMS.indexOf(startStem as any)
  const yearIdx = STEMS.indexOf(baziParams.yearStem as any)
  const k = (yearIdx - startIdx + 10) % 10
  const laiyinIndex = (2 + k) % 12 // 寅=2 起数
  const laiyinPalaceName = getPalaceName(laiyinIndex, basics.lifePalaceIndex)

  return {
    baziGanZhi: `${baziParams.yearStem}${baziParams.yearBranch} ${baziParams.monthStem}${baziParams.monthBranch} ${baziParams.dayStem}${baziParams.dayBranch} ${baziParams.timeStem}${baziParams.timeBranch}`,
    baziDayun: baziParams.majorPeriods.map(period => 
      `${period.startAge}-${period.endAge}岁: ${period.stem || ''}${period.branch || ''}`
    ).join(', '),
    lifePalace: getPalaceName(basics.lifePalaceIndex, basics.lifePalaceIndex),
    bodyPalace: getPalaceName(basics.bodyPalaceIndex, basics.lifePalaceIndex), 
    laiyinPalace: laiyinPalaceName,
    lifeMaster: basics.lifeMaster,
    bodyMaster: basics.bodyMaster,
    doujun: calculateDouJun(baziParams.lunarMonth, baziParams.timeZhiIndex),
    fiveElementsBureau: {
      name: basics.fiveElementsBureau.name,
      number: basics.fiveElementsBureau.局数.toString()
    },
    palaces,
    sihuaAnalysis: {
      birthYearSihua: {
        stem: baziParams.yearStem,
        transformations: {
          lu: birthSihua.A ?? '',
          quan: birthSihua.B ?? '',
          ke: birthSihua.C ?? '',
          ji: birthSihua.D ?? ''
        }
      }
    },
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  }
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
    // Validate input
    if (!isStem(baziParams.yearStem)) {
      throw new Error(`Invalid year stem: ${baziParams.yearStem}`)
    }

    // Calculate all components
    const basics = calculateChartBasics(baziParams)
    const starPositions = calculateAllStarPositions(baziParams, basics.fiveElementsBureau.code)
    const birthSihua = calculateBirthYearSihua(baziParams.yearStem)
    const palaces = buildPalaces(baziParams, starPositions, birthSihua)
    
    // Assemble final chart
    return assembleCompleteChart(baziParams, { 
      basics, 
      palaces, 
      birthSihua 
    })
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    throw new Error(`ZiWei Chart generation failed: ${errorMessage}`)
  }
}
