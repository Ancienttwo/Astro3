/**
 * 紫微斗数宫位关系查询功能
 * Palace Relationship Queries for ZiWei DouShu
 */

import { PALACE_NAMES } from './constants'

// Constants for palace relationship calculations
const OPPOSITE_PALACE_OFFSET = 6
const TRINITY_FIFTH_OFFSET = 4
const TRINITY_NINTH_OFFSET = 8
const SQUARE_FOURTH_OFFSET = 3
const SQUARE_SEVENTH_OFFSET = 6
const SQUARE_TENTH_OFFSET = 9
const ESSENCE_SIXTH_OFFSET = 5
const NUM_PALACES = 12

/**
 * 获取对宫位置 (Get Opposite Palace)
 * 对宫是相对180度的位置关系
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 对宫索引
 */
export function getOppositePalace(palaceIndex: number): number {
  if (!isValidPalaceIndex(palaceIndex)) {
    throw new Error(`Invalid palace index: ${palaceIndex}. Must be between 0 and 11.`)
  }
  
  // 对宫关系：相距6个位置
  return (palaceIndex + OPPOSITE_PALACE_OFFSET) % NUM_PALACES
}

/**
 * 获取三合宫位置 (Get Trinity Palaces)
 * 修正版：159关系 - 以输入宫位为基准，第1、5、9个位置形成三合
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 三合宫索引数组 [本宫, 第5宫, 第9宫]
 */
export function getTrinityPalaces(palaceIndex: number): number[] {
  if (!isValidPalaceIndex(palaceIndex)) {
    throw new Error(`Invalid palace index: ${palaceIndex}. Must be between 0 and 11.`)
  }
  
  const base = palaceIndex
  const fifth = (palaceIndex + TRINITY_FIFTH_OFFSET) % NUM_PALACES  // 第5个位置（索引+4）
  const ninth = (palaceIndex + TRINITY_NINTH_OFFSET) % NUM_PALACES  // 第9个位置（索引+8）
  
  return [base, fifth, ninth]
}

/**
 * 获取四正宫位置 (Get Square Palaces)
 * 修正版：1 4 7 10关系 - 以输入宫位为基准，第1、4、7、10个位置形成四正
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 四正宫索引数组 [本宫, 第4宫, 第7宫, 第10宫]
 */
export function getSquarePalaces(palaceIndex: number): number[] {
  if (!isValidPalaceIndex(palaceIndex)) {
    throw new Error(`Invalid palace index: ${palaceIndex}. Must be between 0 and 11.`)
  }
  
  const first = palaceIndex
  const fourth = (palaceIndex + SQUARE_FOURTH_OFFSET) % NUM_PALACES   // 第4个位置（索引+3）
  const seventh = (palaceIndex + SQUARE_SEVENTH_OFFSET) % NUM_PALACES  // 第7个位置（索引+6）
  const tenth = (palaceIndex + SQUARE_TENTH_OFFSET) % NUM_PALACES    // 第10个位置（索引+9）
  
  return [first, fourth, seventh, tenth]
}

/**
 * 获取本体宫位置 (Get Essence Palace)
 * 修正版：16关系 - 以输入宫位为基准，第1宫和第6宫形成本体关系
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 本体宫索引数组 [本宫, 第6宫]
 */
export function getEssencePalace(palaceIndex: number): number[] {
  if (!isValidPalaceIndex(palaceIndex)) {
    throw new Error(`Invalid palace index: ${palaceIndex}. Must be between 0 and 11.`)
  }
  
  const first = palaceIndex
  const sixth = (palaceIndex + ESSENCE_SIXTH_OFFSET) % NUM_PALACES    // 第6个位置（索引+5）
  
  return [first, sixth]
}

/**
 * 获取宫位关系的详细信息 (Get Palace Relationship Details)
 * @param palaceIndex 宫位索引 (0-11)
 * @returns 完整的宫位关系信息
 */
export interface IPalaceRelationships {
  basePalace: {
    index: number
    name: string
  }
  opposite: {
    index: number
    name: string
  }
  trinity: {
    index: number
    name: string
    position: '本宫' | '第5宫' | '第9宫'
  }[]
  square: {
    index: number
    name: string
    position: '本宫' | '第4宫' | '第7宫' | '第10宫'
  }[]
  essence: {
    index: number
    name: string
    position: '本宫' | '第6宫'
  }[]
}

export function getPalaceRelationships(palaceIndex: number): IPalaceRelationships {
  if (!isValidPalaceIndex(palaceIndex)) {
    throw new Error(`Invalid palace index: ${palaceIndex}. Must be between 0 and 11.`)
  }
  
  const oppositeIndex = getOppositePalace(palaceIndex)
  const trinityIndices = getTrinityPalaces(palaceIndex)
  const squareIndices = getSquarePalaces(palaceIndex)
  const essenceIndices = getEssencePalace(palaceIndex)
  
  return {
    basePalace: {
      index: palaceIndex,
      name: PALACE_NAMES[palaceIndex]
    },
    opposite: {
      index: oppositeIndex,
      name: PALACE_NAMES[oppositeIndex]
    },
    trinity: trinityIndices.map((index, pos) => ({
      index,
      name: PALACE_NAMES[index],
      position: pos === 0 ? '本宫' : pos === 1 ? '第5宫' : '第9宫'
    })),
    square: squareIndices.map((index, pos) => ({
      index,
      name: PALACE_NAMES[index],
      position: pos === 0 ? '本宫' : pos === 1 ? '第4宫' : pos === 2 ? '第7宫' : '第10宫'
    })),
    essence: essenceIndices.map((index, pos) => ({
      index,
      name: PALACE_NAMES[index],
      position: pos === 0 ? '本宫' : '第6宫'
    }))
  }
}

/**
 * 工具函数：验证宫位索引
 * @param palaceIndex 宫位索引
 * @returns 是否有效
 */
export function isValidPalaceIndex(palaceIndex: number): boolean {
  return Number.isInteger(palaceIndex) && palaceIndex >= 0 && palaceIndex < NUM_PALACES
}

/**
 * 工具函数：通过宫位名称获取索引
 * @param palaceName 宫位名称
 * @returns 宫位索引，未找到时返回-1
 */
export function getPalaceIndexByName(palaceName: string): number {
  if (!palaceName || typeof palaceName !== 'string') {
    throw new Error(`Invalid palace name: ${palaceName}. Must be a non-empty string.`)
  }
  
  const index = PALACE_NAMES.findIndex(name => name === palaceName)
  
  if (index === -1) {
    throw new Error(`Palace name not found: ${palaceName}. Valid names: ${PALACE_NAMES.join(', ')}`)
  }
  
  return index
}