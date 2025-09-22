/**
 * 紫微斗数时间计算功能
 * Time-based Calculations for ZiWei DouShu
 */

/* eslint-disable max-lines, max-params, @typescript-eslint/consistent-type-assertions */

import { 
  STEMS, 
  BRANCHES, 
  MAJOR_PERIOD_START_AGE,
  PALACE_NAMES,
  type Stem,
  type Branch
} from './constants'

// Constants to avoid magic numbers
const GAN_ZHI_YEAR_OFFSET = 4
const PALACE_COUNT = 12
const STEM_COUNT = 10
const MAJOR_PERIOD_DURATION = 10
const CHINESE_AGE_OFFSET = 1
const MAJOR_PERIOD_END_OFFSET = 9
const MS_PER_DAY = 24 * 60 * 60 * 1000 // eslint-disable-line @typescript-eslint/no-magic-numbers
const DEFAULT_YANG_START_AGE = 6
const DEFAULT_YIN_START_AGE = 5
const DEFAULT_MINOR_LIMIT_START = 4

/**
 * 图表上下文接口 - 减少函数参数数量
 */
export interface IChartContext {
  birthDate: Date
  gender: 'male' | 'female'
  yearStem: Stem
  yearBranch: Branch
  fiveElementsBureau: string
  lifePalaceIndex: number
}

/**
 * 计算年龄
 * Calculate age from birth date to target date
 */
export function calculateAge(birthDate: Date, targetDate: Date): number {
  const birthYear = birthDate.getFullYear()
  const targetYear = targetDate.getFullYear()
  const birthMonth = birthDate.getMonth()
  const targetMonth = targetDate.getMonth()
  const birthDay = birthDate.getDate()
  const targetDay = targetDate.getDate()
  
  let age = targetYear - birthYear
  
  // 如果还没过生日，年龄减1
  if (targetMonth < birthMonth || (targetMonth === birthMonth && targetDay < birthDay)) {
    age--
  }
  
  return Math.max(0, age)
}

/**
 * 大运期信息
 */
export interface IMajorPeriodInfo {
  periodNumber: number      // 第几个大运（1-12）
  startAge: number          // 起始年龄
  endAge: number           // 结束年龄
  palaceIndex: number      // 大运所在宫位索引
  palaceName: string       // 大运宫位名称
  stem: string            // 大运天干
  branch: string          // 大运地支
  startYear: number       // 起始年份
  endYear: number         // 结束年份
}

/**
 * 计算大运年龄和方向
 */
function calculateMajorPeriodDirection(chartContext: IChartContext): {
  startAge: number
  isForward: boolean
  stemIndex: number
} {
  const stemIndex = STEMS.indexOf(chartContext.yearStem)
  if (stemIndex === -1) {
    throw new Error(`Invalid year stem: ${chartContext.yearStem}`)
  }
  const isYangYear = stemIndex % 2 === 0

  const majorPeriodKey = chartContext.fiveElementsBureau.replace('_', '_')
  const [yangStartAge, yinStartAge] = MAJOR_PERIOD_START_AGE[majorPeriodKey] ?? [DEFAULT_YANG_START_AGE, DEFAULT_YIN_START_AGE]

  let startAge: number
  let isForward: boolean
  if ((isYangYear && chartContext.gender === 'male') || (!isYangYear && chartContext.gender === 'female')) {
    // 阳男或阴女，顺行
    startAge = yangStartAge
    isForward = true
  } else {
    // 阴男或阳女，逆行
    startAge = yinStartAge
    isForward = false
  }

  return { startAge, isForward, stemIndex }
}

/**
 * 计算大运宫位和干支
 */
function calculateMajorPeriodPalace(
  lifePalaceIndex: number,
  periodNumber: number,
  isForward: boolean,
  stemIndex: number
): { palaceIndex: number; stem: string; branch: string } {
  let palaceIndex: number
  if (isForward) {
    palaceIndex = (lifePalaceIndex + periodNumber - 1) % PALACE_COUNT
  } else {
    palaceIndex = (lifePalaceIndex - periodNumber + 1 + PALACE_COUNT) % PALACE_COUNT
  }

  const branch = BRANCHES[palaceIndex]
  const stemIdx = (stemIndex + palaceIndex) % STEM_COUNT
  const stem = STEMS[stemIdx]

  return { palaceIndex, stem, branch }
}

/**
 * 获取当前大运期
 * Get current major period (10-year fortune period)
 */
export function getCurrentMajorPeriod(
  chartContext: IChartContext,
  targetDate: Date
): IMajorPeriodInfo {
  const age = calculateAge(chartContext.birthDate, targetDate)
  
  const { startAge, isForward, stemIndex } = calculateMajorPeriodDirection(chartContext)
  
  // 计算当前是第几个大运
  const periodsSinceStart = Math.floor((age - startAge + MAJOR_PERIOD_DURATION) / MAJOR_PERIOD_DURATION)
  const periodNumber = Math.max(1, Math.min(PALACE_COUNT, periodsSinceStart))
  
  const { palaceIndex, stem, branch } = calculateMajorPeriodPalace(
    chartContext.lifePalaceIndex,
    periodNumber,
    isForward,
    stemIndex
  )
  
  // 计算该大运的起止年龄
  const periodStartAge = startAge + (periodNumber - 1) * MAJOR_PERIOD_DURATION
  const periodEndAge = periodStartAge + MAJOR_PERIOD_END_OFFSET
  
  // 计算起止年份
  const birthYear = chartContext.birthDate.getFullYear()
  const startYear = birthYear + periodStartAge
  const endYear = birthYear + periodEndAge

  return {
    periodNumber,
    startAge: periodStartAge,
    endAge: periodEndAge,
    palaceIndex,
    palaceName: PALACE_NAMES[palaceIndex] ?? '',
    stem,
    branch,
    startYear,
    endYear
  }
}

/**
 * 获取当前大运期（兼容版）
 * Get current major period (compatibility version)
 */
export function getCurrentMajorPeriodLegacy(
  birthDate: Date,
  targetDate: Date,
  gender: 'male' | 'female',
  yearStem: string,
  fiveElementsBureau: string,
  lifePalaceIndex: number
): IMajorPeriodInfo {
  const chartContext: IChartContext = {
    birthDate,
    gender,
    yearStem: yearStem as Stem,
    yearBranch: '' as Branch, // Not needed for major period
    fiveElementsBureau,
    lifePalaceIndex
  }
  
  return getCurrentMajorPeriod(chartContext, targetDate)
}

/**
 * 流年信息
 */
export interface IFleetingYearInfo {
  year: number            // 年份
  age: number            // 年龄
  stem: string           // 流年天干
  branch: string         // 流年地支
  ganZhi: string        // 流年干支
  palaceIndex: number   // 流年所在宫位
  palaceName: string    // 流年宫位名称
}

/**
 * 获取流年信息
 * Get fleeting year information
 * 
 * @param birthDate 出生日期
 * @param year 目标年份
 */
export function getFleetingYear(birthDate: Date, year: number): IFleetingYearInfo {
  const birthYear = birthDate.getFullYear()
  const age = year - birthYear
  
  // 计算流年干支
  const stemIndex = (year - GAN_ZHI_YEAR_OFFSET) % STEM_COUNT
  const branchIndex = (year - GAN_ZHI_YEAR_OFFSET) % PALACE_COUNT
  const stem = STEMS[stemIndex]
  const branch = BRANCHES[branchIndex]
  
  // 流年宫位（以地支索引为准）
  const palaceIndex = branchIndex
  
  // 简化版宫位名称（实际应该根据命盘布局）
  const palaceName = PALACE_NAMES[palaceIndex]
  
  return {
    year,
    age,
    stem,
    branch,
    ganZhi: stem + branch,
    palaceIndex,
    palaceName
  }
}

/**
 * 流月信息
 */
export interface IFleetingMonthInfo {
  year: number           // 年份
  month: number          // 月份 (1-12)
  stem: string          // 流月天干
  branch: string        // 流月地支
  ganZhi: string       // 流月干支
  palaceIndex: number  // 流月所在宫位
  palaceName: string   // 流月宫位名称
}

/**
 * 获取流月信息
 * Get fleeting month information
 * 
 * @param birthDate 出生日期
 * @param year 年份
 * @param month 月份 (1-12)
 */
export function getFleetingMonth(
  _birthDate: Date,
  year: number,
  month: number
): IFleetingMonthInfo {
  // 计算年干支
  const yearStemIndex = (year - GAN_ZHI_YEAR_OFFSET) % STEM_COUNT
  const yearStem = STEMS[yearStemIndex]
  
  // 根据年干确定正月的天干（五虎遁）
  const monthStemStart = getMonthStemStart(yearStem)
  
  // 计算该月的天干
  const monthStemIndex = (monthStemStart + month - 1) % STEM_COUNT
  const monthStem = STEMS[monthStemIndex]
  
  // 月支固定：寅月为正月
  const monthBranchIndex = (month + 1) % PALACE_COUNT
  const monthBranch = BRANCHES[monthBranchIndex]
  
  // 流月宫位
  const palaceIndex = monthBranchIndex
  
  return {
    year,
    month,
    stem: monthStem,
    branch: monthBranch,
    ganZhi: monthStem + monthBranch,
    palaceIndex,
    palaceName: PALACE_NAMES[palaceIndex]
  }
}

/**
 * 根据年干获取正月天干起始位置（五虎遁）
 */
function getMonthStemStart(yearStem: string): number {
  const fiveTigerDun: Record<string, number> = {
    '甲': 2, '己': 2,  // 丙寅月
    '乙': 4, '庚': 4,  // 戊寅月
    '丙': 6, '辛': 6,  // 庚寅月
    '丁': 8, '壬': 8,  // 壬寅月
    '戊': 0, '癸': 0   // 甲寅月
  }
  
  return fiveTigerDun[yearStem] ?? 0
}

/**
 * 小限信息
 */
export interface IMinorLimitInfo {
  age: number           // 年龄
  palaceIndex: number   // 小限所在宫位索引
  palaceName: string    // 小限宫位名称
  branch: string        // 小限地支
}

/**
 * 获取小限信息
 * Get minor limit (annual fortune) information
 * 
 * @param birthDate 出生日期
 * @param targetDate 目标日期
 * @param gender 性别
 * @param yearBranch 年支
 */
/**
 * 计算小限起始位置
 */
function calculateMinorLimitStartPosition(yearBranch: Branch): number {
  const branchIndex = BRANCHES.indexOf(yearBranch)
  if (branchIndex === -1) {
    throw new Error(`Invalid year branch: ${yearBranch}`)
  }

  // 传统小限起始地支位置规则（虚岁1岁）
  const startPositions: Record<number, number> = {
    0: 10,  // 子年 -> 戌地支 (水三合局)
    1: 7,   // 丑年 -> 未地支 (金三合局)
    2: 4,   // 寅年 -> 辰地支 (火三合局)
    3: 1,   // 卯年 -> 丑地支 (木三合局)
    4: 10,  // 辰年 -> 戌地支 (水三合局)
    5: 7,   // 巳年 -> 未地支 (金三合局)
    6: 4,   // 午年 -> 辰地支 (火三合局)
    7: 1,   // 未年 -> 丑地支 (木三合局)
    8: 10,  // 申年 -> 戌地支 (水三合局)
    9: 7,   // 酉年 -> 未地支 (金三合局)
    10: 4,  // 戌年 -> 辰地支 (火三合局)
    11: 1   // 亥年 -> 丑地支 (木三合局)
  }

  return startPositions[branchIndex] ?? DEFAULT_MINOR_LIMIT_START
}

export function getMinorLimit(
  chartContext: Pick<IChartContext, 'birthDate' | 'gender' | 'yearBranch'>,
  targetDate: Date
): IMinorLimitInfo {
  // 小限使用传统中式年龄计算（出生即1岁）
  const westernAge = calculateAge(chartContext.birthDate, targetDate)
  const age = westernAge + CHINESE_AGE_OFFSET
  
  const startPalaceIndex = calculateMinorLimitStartPosition(chartContext.yearBranch)
  
  // 小限行进方向：只分男女，男顺行，女逆行
  let palaceIndex: number
  if (chartContext.gender === 'male') {
    // 男命一律顺行：虚岁1岁在起始位置
    palaceIndex = (startPalaceIndex + age - 1) % PALACE_COUNT
  } else {
    // 女命一律逆行：虚岁1岁在起始位置
    palaceIndex = (startPalaceIndex - age + 1 + PALACE_COUNT) % PALACE_COUNT
  }
  
  return {
    age,
    palaceIndex,
    palaceName: PALACE_NAMES[palaceIndex] ?? '',
    branch: BRANCHES[palaceIndex] ?? ''
  }
}

/**
 * 获取小限信息（兼容版）
 */
export function getMinorLimitLegacy(
  birthDate: Date,
  targetDate: Date,
  gender: 'male' | 'female',
  yearBranch: string
): IMinorLimitInfo {
  const chartContext = {
    birthDate,
    gender,
    yearBranch: yearBranch as Branch
  }
  
  return getMinorLimit(chartContext, targetDate)
}

/**
 * 时间跨度信息
 */
export interface ITimeSpanInfo {
  years: number
  months: number
  days: number
  totalDays: number
}

/**
 * 计算时间跨度
 * Calculate time span between two dates
 */
export function calculateTimeSpan(startDate: Date, endDate: Date): ITimeSpanInfo {
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY)
  
  let years = endDate.getFullYear() - startDate.getFullYear()
  let months = endDate.getMonth() - startDate.getMonth()
  let days = endDate.getDate() - startDate.getDate()
  
  if (days < 0) {
    months--
    const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0)
    days += lastMonth.getDate()
  }
  
  const MONTHS_IN_YEAR = 12
  if (months < 0) {
    years--
    months += MONTHS_IN_YEAR
  }
  
  return {
    years,
    months,
    days,
    totalDays
  }
}

/**
 * 验证日期有效性
 * Validate date
 */
export function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * 格式化干支
 * Format GanZhi (Stem-Branch)
 */
export function formatGanZhi(stem: string, branch: string): string {
  return `${stem}${branch}`
}

/**
 * 获取完整的时间查询结果
 * Get comprehensive time query result
 */
export interface IComprehensiveTimeInfo {
  currentAge: number
  majorPeriod: IMajorPeriodInfo
  fleetingYear: IFleetingYearInfo
  fleetingMonth: IFleetingMonthInfo
  minorLimit: IMinorLimitInfo
  timeSpan: ITimeSpanInfo
}

/**
 * 获取综合时间信息
 * Get comprehensive time information
 */
export function getComprehensiveTimeInfo(
  chartContext: IChartContext,
  targetDate: Date
): IComprehensiveTimeInfo {
  const age = calculateAge(chartContext.birthDate, targetDate)
  const targetYear = targetDate.getFullYear()
  const targetMonth = targetDate.getMonth() + 1
  
  return {
    currentAge: age,
    majorPeriod: getCurrentMajorPeriod(chartContext, targetDate),
    fleetingYear: getFleetingYear(chartContext.birthDate, targetYear),
    fleetingMonth: getFleetingMonth(chartContext.birthDate, targetYear, targetMonth),
    minorLimit: getMinorLimit(chartContext, targetDate),
    timeSpan: calculateTimeSpan(chartContext.birthDate, targetDate)
  }
}

/**
 * 获取综合时间信息（兼容版）
 */
export function getComprehensiveTimeInfoLegacy(
  birthDate: Date,
  targetDate: Date,
  gender: 'male' | 'female',
  yearStem: string,
  yearBranch: string,
  fiveElementsBureau: string,
  lifePalaceIndex: number
): IComprehensiveTimeInfo {
  const chartContext: IChartContext = {
    birthDate,
    gender,
    yearStem: yearStem as Stem,
    yearBranch: yearBranch as Branch,
    fiveElementsBureau,
    lifePalaceIndex
  }
  
  return getComprehensiveTimeInfo(chartContext, targetDate)
}