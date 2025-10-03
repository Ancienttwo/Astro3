/**
 * API格式转换器 - 把API数据转换成Hook标准格式
 * API Format Converter - Convert API data to standardized Hook format
 * 
 * @description 一次性完成所有数据转换，包括天干处理
 */

import type { ZiWeiCompleteChart, ZiWeiChartInput } from './complete-chart-types'

// API返回的原始数据格式（简化版）
interface ApiCalculatorResult {
  // 基础信息
  input: ZiWeiChartInput
  lifePalace: { lifePalaceBranch: string; lifePalaceBranchIndex: number }
  bodyPalace: { bodyPalaceBranch: string; bodyPalaceBranchIndex: number }
  laiyinPalace: { laiyinPalaceBranch: string; laiyinPalaceBranchIndex: number }
  fiveElementsBureau: string
  yearStem: string
  yearBranch: string
  yearGanZhi: string
  
  // 天干数组（0-11对应子丑寅卯...）
  palaceStems: string[]
  
  // 宫位数组格式
  palaces: Array<{
    name: string
    branch: string
    branchIndex: number
    palaceIndex: number
    stem: string
    stars: Array<{
      name: string
      category: string
      brightness?: string
      palace: string
      palaceBranch: string
      strength: number
      isMainStar: boolean
    }>
    mainStars: string[]
    auxiliaryStars: string[]
    minorStars: string[]
  }>
  
  // 其他数据
  lifeMaster: string
  bodyMaster: string
  douJun: string
  natalSihua?: ApiNatalSihua
  majorPeriods?: ApiMajorPeriod[]
  currentAge?: number
  fleetingYears?: ApiFleetingYear[]
  minorLimits?: ApiMinorLimit[]
}

/**
 * 地支索引映射
 * 0=子, 1=丑, 2=寅, 3=卯, 4=辰, 5=巳, 6=午, 7=未, 8=申, 9=酉, 10=戌, 11=亥
 */
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

/**
 * 宫位名称映射（按地支顺序）
 */
// 🔧 FIX: 统一使用标准简写格式（命宫保留"宫"字，其他简写）
const PALACE_NAMES = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '官禄', '田宅', '福德', '父母'
]

/**
 * API 数据结构接口
 */
export interface ApiNatalSihua {
  sihua: Array<{
    star: string
    type: string
    palace?: string
  }>
}

export interface ApiMajorPeriod {
  period: number
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  palaceIndex: number
  stem?: string
  branch?: string
}

export interface ApiFleetingYear {
  year: number
  age: number
  branch: string
  palaceIndex: number
}

export interface ApiMinorLimit {
  age: number
  palaceIndex: number
  branch: string
}

export interface ApiStar {
  name: string
  brightness?: string
  sihua?: string
  self_sihua?: string
}

/**
 * 转换后的宫位数据结构
 */
export interface ConvertedPalaceData {
  branch: string
  branchIndex: number
  stem: string
  palaceName: string
  mainStars: Array<{
    name: string
    bright: string
    sihua: string
    self_sihua: string
  }>
  auxiliaryStars: Array<{
    name: string
    bright: string
    sihua: string
    self_sihua: string
  }>
  minorStars: Array<{
    name: string
    bright: string
    sihua: string
    self_sihua: string
  }>
  fleetingYears: number[]
  majorPeriod: ApiMajorPeriod
  minorPeriod: number[]
  palaceStatus: {
    isEmpty: boolean
    isBorrowingStars: boolean
    strength: string
    conflictLevel: number
  }
}

/**
 * 五行局名称转换
 */
function convertFiveElementsBureau(apiValue: string) {
  const bureauMap: { [key: string]: { name: string; number: string } } = {
    'water_2': { name: '水二局', number: '2' },
    'wood_3': { name: '木三局', number: '3' },
    'metal_4': { name: '金四局', number: '4' },
    'earth_5': { name: '土五局', number: '5' },
    'fire_6': { name: '火六局', number: '6' }
  }
  return bureauMap[apiValue] || { name: '水二局', number: '2' }
}

/**
 * 星曜数据转换
 */
function convertStars(apiStars: ApiStar[]) {
  if (!Array.isArray(apiStars)) return []
  
  return apiStars.map(star => ({
    name: star.name || '',
    bright: star.brightness || '平',
    sihua: star.sihua || '', // 四化标记
    self_sihua: star.self_sihua || '' // 自化标记
  }))
}

/**
 * 大运信息生成（简化版）
 */
function generateMajorPeriod(branchIndex: number): ApiMajorPeriod {
  // 简化的大运计算，每个宫位10年
  const startAge = branchIndex * 10 + 6
  return {
    period: Math.floor(branchIndex / 10) + 1,
    startAge: startAge,
    endAge: startAge + 9,
    startYear: 2025 + startAge, // 基于当前年份
    endYear: 2025 + startAge + 9,
    palaceIndex: branchIndex
  }
}

/**
 * 流年数组生成
 */
function generateFleetingYears(branchIndex: number): number[] {
  const base = branchIndex + 5 // 从5岁开始
  return Array.from({ length: 10 }, (_, i) => base + i * 12)
}

/**
 * 主转换函数：API格式 → Hook格式
 * 
 * @param apiResult - API返回的原始数据
 * @returns 标准Hook格式数据
 */
export function convertApiToHookFormat(apiResult: ApiCalculatorResult): ZiWeiCompleteChart {
  console.log('🔄 [转换器] 开始转换API数据为Hook格式...')
  
  // 1. 基础信息转换
  const birthInfo = {
    solar: {
      year: apiResult.input.year,
      month: apiResult.input.month,
      day: apiResult.input.day,
      hour: apiResult.input.hour,
      gender: apiResult.input.gender,
      isLunar: apiResult.input.isLunar || false
    },
    lunar: {
      yearStem: apiResult.yearStem || '甲',
      yearBranch: apiResult.yearBranch || '子',
      yearGanzhi: apiResult.yearGanZhi || '甲子',
      monthLunar: apiResult.input.month, // 简化处理
      dayLunar: apiResult.input.day,
      hourBranch: BRANCHES[Math.floor(apiResult.input.hour / 2)] || '子',
      isLunar: apiResult.input.isLunar,
      isLeapMonth: apiResult.input.isLeapMonth
    }
  }
  
  // 2. 核心宫位信息
  const lifePalaceBranch = apiResult.lifePalace?.lifePalaceBranch || '子'
  const bodyPalaceBranch = apiResult.bodyPalace?.bodyPalaceBranch || '子'
  const laiyinPalaceBranch = apiResult.laiyinPalace?.laiyinPalaceBranch || '子'
  
  // 3. 五行局转换
  const fiveElementsBureau = convertFiveElementsBureau(apiResult.fiveElementsBureau)
  
  // 4. 🎯 关键：天干数据处理
  // 确保palaceStems有12个元素，如果不够用默认值填充
  const palaceStems = [...(apiResult.palaceStems || [])]
  while (palaceStems.length < 12) {
    palaceStems.push('甲') // 默认天干
  }
  
  console.log('🔧 [转换器] 天干数组:', palaceStems)
  
  // 5. 🏛️ 十二宫数据转换（重点：从数组转换为对象格式）
  const palaces: { [branchName: string]: ConvertedPalaceData } = {}
  
  // 遍历12个地支，构建完整宫位数据
  BRANCHES.forEach((branch, branchIndex) => {
    // 从API宫位数组中查找对应宫位
    const apiPalace = apiResult.palaces?.find(p => p.branch === branch) || null
    
    // 获取天干（关键：直接从palaceStems数组按索引获取）
    const stem = palaceStems[branchIndex] || '甲'
    
    // 确定宫位名称
    let palaceName = PALACE_NAMES[branchIndex]
    if (branch === lifePalaceBranch) palaceName = '命宫'
    else if (branch === bodyPalaceBranch) palaceName = '身宫'
    else if (branch === laiyinPalaceBranch) palaceName = '来因宫'
    
    // 处理星曜数据
    const allStars = apiPalace?.stars || []
    const mainStars = convertStars(allStars.filter(s => s.category === 'main'))
    const auxiliaryStars = convertStars(allStars.filter(s => s.category === 'auxiliary'))  
    const minorStars = convertStars(allStars.filter(s => s.category === 'minor'))
    
    // 构建宫位对象
    palaces[branch] = {
      branch,
      branchIndex,
      stem, // 🎯 关键：天干直接从数组获取
      palaceName,
      mainStars,
      auxiliaryStars,
      minorStars,
      fleetingYears: generateFleetingYears(branchIndex),
      majorPeriod: generateMajorPeriod(branchIndex),
      minorPeriod: generateFleetingYears(branchIndex), // 与流年相同
      
      // 宫位状态（简化版）
      palaceStatus: {
        isEmpty: mainStars.length === 0,
        isBorrowingStars: false,
        strength: mainStars.length > 0 ? 'normal' : 'weak',
        conflictLevel: 0
      }
    }
  })
  
  // 6. 四化分析（简化版）
  const sihuaAnalysis = {
    birthYearSihua: {
      stem: apiResult.yearStem || '甲',
      transformations: {
        lu: '廉贞', // TODO: 根据年干计算
        quan: '破军',
        ke: '武曲', 
        ji: '太阳'
      }
    }
  }
  
  // 7. 🎯 构建最终的Hook格式数据
  const convertedResult: ZiWeiCompleteChart = {
    // 基础出生信息
    birthInfo,
    
    // 八字系统
    bazi: '示例八字', // TODO: 从API获取
    baziQiyun: '示例起运', // TODO: 从API获取  
    baziDayun: '示例大运', // TODO: 从API获取
    
    // 命盘核心信息
    lifePalace: lifePalaceBranch,
    bodyPalace: bodyPalaceBranch,
    laiyinPalace: laiyinPalaceBranch,
    lifeMaster: apiResult.lifeMaster || '贪狼',
    bodyMaster: apiResult.bodyMaster || '天相',
    doujun: apiResult.douJun || '子',
    fiveElementsBureau,
    
    // 🏛️ 十二宫完整数据（按地支key的对象格式）
    palaces,
    
    // 四化分析
    sihuaAnalysis,
    
    // 元数据
    generatedAt: new Date().toISOString(),
    version: '1.0.0'
  }
  
  console.log('✅ [转换器] API → Hook格式转换完成')
  console.log('🏛️ [转换器] 宫位数据预览:', {
    总宫位数: Object.keys(palaces).length,
    命宫天干: palaces[lifePalaceBranch]?.stem,
    身宫天干: palaces[bodyPalaceBranch]?.stem,
    子宫数据: palaces['子']
  })
  
  return convertedResult
}

/**
 * 导出工具函数：直接获取天干
 */
export function getPalaceStem(palaceStems: string[], branchIndex: number): string {
  return palaceStems[branchIndex] || '甲'
}

/**
 * 导出工具函数：获取地支
 */
export function getBranchName(index: number): string {
  return BRANCHES[index] || '子'
}