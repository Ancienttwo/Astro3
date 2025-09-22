/**
 * Palace Builder Module
 * 宫位构建模块
 */

import { getStarBrightness } from '../calculations/brightness-calculations'
import type { BaZiParams } from '../calculations/data-conversion'
import { BRANCHES } from '../constants'
import { getPalaceName, calculateLifePalace } from '../calculations/palace-calculations'

import { 
  NUM_PALACES, 
  calculateStemForBranch, 
  getStarsAtPosition, 
  getBrightnessName 
} from './helpers'
import type { IPalaceInfo, IStarPositions } from './types'


/**
 * 构建单个宫位的四化信息
 */
function buildPalaceSihua(
  allStars: string[],
  birthSihua: { A: string | null; B: string | null; C: string | null; D: string | null }
): IPalaceInfo['sihua'] {
  return {
    lu: birthSihua.A && allStars.includes(birthSihua.A) ? [birthSihua.A] : [],
    quan: birthSihua.B && allStars.includes(birthSihua.B) ? [birthSihua.B] : [],
    ke: birthSihua.C && allStars.includes(birthSihua.C) ? [birthSihua.C] : [],
    ji: birthSihua.D && allStars.includes(birthSihua.D) ? [birthSihua.D] : []
  }
}

/**
 * 构建单个宫位的亮度信息
 */
function buildPalaceBrightness(allStars: string[], palaceIndex: number): Record<string, string> {
  const brightness: Record<string, string> = {}
  allStars.forEach(star => {
    const brightnessValue = getStarBrightness(star, palaceIndex)
    brightness[star] = getBrightnessName(brightnessValue)
  })
  return brightness
}

interface IPalaceBuildContext {
  baziParams: BaZiParams
  starPositions: IStarPositions
  birthSihua: { A: string | null; B: string | null; C: string | null; D: string | null }
  lifePalaceIndex: number
}

/**
 * 构建单个宫位信息
 */
function buildSinglePalace(index: number, context: IPalaceBuildContext): IPalaceInfo {
  const { baziParams, starPositions, birthSihua, lifePalaceIndex } = context
  // yearStem is validated to be Stem type in main chart generator
  const stem = calculateStemForBranch(index, baziParams.yearStem)
  const branch = BRANCHES[index] ?? '子'
  
  // 获取各类星曜
  const palaceMainStars = getStarsAtPosition(starPositions.mainStars, index)
  const palaceAuxStars = getStarsAtPosition(starPositions.auxiliaryStars, index)
  const palaceMaleficStars = getStarsAtPosition(starPositions.maleficStars, index)
  const palaceRomanceStars = getStarsAtPosition(starPositions.romanceStars, index)
  
  // 合并所有星曜
  const allStars = [
    ...palaceMainStars, 
    ...palaceAuxStars, 
    ...palaceMaleficStars, 
    ...palaceRomanceStars
  ]
  
  return {
    // 宫名必须是命宫定位后的相对函数：PALACE_NAMES[(index - lifeIndex + 12) % 12]
    name: getPalaceName(index, lifePalaceIndex),
    index,
    branch,
    stem,
    mainStars: palaceMainStars,
    auxiliaryStars: palaceAuxStars,
    maleficStars: palaceMaleficStars,
    romanceStars: palaceRomanceStars,
    brightness: buildPalaceBrightness(allStars, index),
    sihua: buildPalaceSihua(allStars, birthSihua)
  }
}

/**
 * 构建所有宫位信息
 */
export function buildPalaces(
  baziParams: BaZiParams,
  starPositions: IStarPositions,
  birthSihua: { A: string | null; B: string | null; C: string | null; D: string | null }
): IPalaceInfo[] {
  const context: IPalaceBuildContext = {
    baziParams,
    starPositions,
    birthSihua,
    lifePalaceIndex: calculateLifePalace(baziParams.lunarMonth, baziParams.timeZhiIndex)
  }
  
  const palaces: IPalaceInfo[] = []
  
  for (let i = 0; i < NUM_PALACES; i++) {
    palaces.push(buildSinglePalace(i, context))
  }
  
  return palaces
}
