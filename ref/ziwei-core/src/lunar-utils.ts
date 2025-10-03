/**
 * Internal lunar calendar utilities for ziwei-core
 * Using tyme4ts library for lunar calendar conversions
 */

import { 
  SolarTime,
  type LunarDay,
  type EightChar
} from 'tyme4ts'

export interface ILunarDate {
  year: number
  month: number
  day: number
  hour: number
  isLeapMonth: boolean
  yearGanZhi: string
  monthGanZhi: string
  dayGanZhi: string
  hourGanZhi: string
  yearGan: string
  yearZhi: string
  monthGan: string
  monthZhi: string
  dayGan: string
  dayZhi: string
  hourGan: string
  hourZhi: string
}

export interface ISolarDate {
  year: number
  month: number
  day: number
  hour: number
}


/**
 * Extract gan and zhi from a ganzhi string
 */
function extractGanZhi(ganZhi: string): { gan: string; zhi: string } {
  return {
    gan: ganZhi.charAt(0),
    zhi: ganZhi.charAt(1)
  }
}

/**
 * Create default lunar date for fallback scenarios
 */
function createDefaultLunarDate(solarDate: ISolarDate): ILunarDate {
  return {
    year: solarDate.year,
    month: solarDate.month,
    day: solarDate.day,
    hour: solarDate.hour,
    isLeapMonth: false,
    yearGanZhi: '甲子',
    monthGanZhi: '甲子',
    dayGanZhi: '甲子',
    hourGanZhi: '甲子',
    yearGan: '甲',
    yearZhi: '子',
    monthGan: '甲',
    monthZhi: '子',
    dayGan: '甲',
    dayZhi: '子',
    hourGan: '甲',
    hourZhi: '子'
  }
}

/**
 * Convert tyme4ts data to lunar date format
 */
function convertToLunarDate(
  solarTime: SolarTime,
  solarDate: ISolarDate
): ILunarDate {
  try {
    // Get lunar components
    const lunarDay: LunarDay = solarTime.getLunarDay()
    const lunarMonth = lunarDay.getLunarMonth()
    const lunarYear = lunarMonth.getLunarYear()
    const eightChar: EightChar = solarTime.getLunarHour().getEightChar()
    
    // Get GanZhi strings
    const yearGanZhi = eightChar.getYear().getName()
    const monthGanZhi = eightChar.getMonth().getName()
    const dayGanZhi = eightChar.getDay().getName()
    const hourGanZhi = eightChar.getHour().getName()
    
    return {
      year: lunarYear.getYear(),
      month: lunarMonth.getMonthWithLeap(),
      day: lunarDay.getDay(),
      hour: Math.floor(solarDate.hour / 2) * 2 + 1,
      isLeapMonth: lunarMonth.isLeap(),
      yearGanZhi,
      monthGanZhi,
      dayGanZhi,
      hourGanZhi,
      yearGan: extractGanZhi(yearGanZhi).gan,
      yearZhi: extractGanZhi(yearGanZhi).zhi,
      monthGan: extractGanZhi(monthGanZhi).gan,
      monthZhi: extractGanZhi(monthGanZhi).zhi,
      dayGan: extractGanZhi(dayGanZhi).gan,
      dayZhi: extractGanZhi(dayGanZhi).zhi,
      hourGan: extractGanZhi(hourGanZhi).gan,
      hourZhi: extractGanZhi(hourGanZhi).zhi
    }
  } catch {
    return createDefaultLunarDate(solarDate)
  }
}

/**
 * 公历转农历 - Internal implementation
 */
export const solarToLunar = (solarDate: ISolarDate): ILunarDate => {
  try {
    const solarTime = SolarTime.fromYmdHms(
      solarDate.year,
      solarDate.month,
      solarDate.day,
      solarDate.hour,
      0,
      0
    )
    
    return convertToLunarDate(solarTime, solarDate)
  } catch {
    return createDefaultLunarDate(solarDate)
  }
}

