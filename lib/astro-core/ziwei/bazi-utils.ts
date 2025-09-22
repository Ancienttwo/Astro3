/**
 * BaZi (八字) utilities for Dayun calculations
 * Split from lunar-utils.ts to maintain proper file size and separation of concerns
 */

import { SolarTime, ChildLimit, type DecadeFortune, type Gender } from 'tyme4ts'

import type { ISolarDate } from './lunar-utils'

export interface IDayunPeriod {
  序号: number
  干支: string
  起始年龄: number
  结束年龄: number
  起始年份: number
  结束年份: number
}

export interface IDayunInfo {
  起运岁数: number
  顺逆: '顺' | '逆'
  运程: IDayunPeriod[]
}

/**
 * Build single dayun period from decade fortune
 */
function buildDayunPeriod(
  fortune: DecadeFortune,
  index: number,
  baseYear: number
): IDayunPeriod {
  return {
    序号: index + 1,
    干支: fortune.getName(),
    起始年龄: fortune.getStartAge(),
    结束年龄: fortune.getEndAge(),
    起始年份: baseYear + fortune.getStartAge(),
    结束年份: baseYear + fortune.getEndAge()
  }
}

/**
 * 获取八字大运信息 - Internal implementation
 * Get BaZi Dayun (Decade Fortune) information
 * 
 * @param solarDate Solar date for calculation
 * @param gender Gender for determining fortune direction
 * @returns Dayun information with periods
 */
export const getBaziDayun = (
  solarDate: ISolarDate, 
  gender: 'male' | 'female'
): IDayunInfo => {
  try {
    const solarTime = SolarTime.fromYmdHms(
      solarDate.year,
      solarDate.month,
      solarDate.day,
      solarDate.hour,
      0,
      0
    )
    
    const genderEnum: Gender = gender === 'male' ? 1 : 0
    const childLimit = ChildLimit.fromSolarTime(solarTime, genderEnum)
    const startAge = childLimit.getYearCount()
    const isForward = childLimit.isForward()
    
    // Build dayun periods
    const dayunList: IDayunPeriod[] = []
    const startFortune = childLimit.getStartDecadeFortune()
    let currentFortune: DecadeFortune | null = startFortune
    
    const MAX_PERIODS = 10
    for (let i = 0; i < MAX_PERIODS && currentFortune; i++) {
      dayunList.push(buildDayunPeriod(currentFortune, i, solarDate.year))
      currentFortune = currentFortune.next(1)
    }
    
    return {
      起运岁数: startAge,
      顺逆: isForward ? '顺' : '逆',
      运程: dayunList
    }
  } catch {
    return {
      起运岁数: 0,
      顺逆: '顺',
      运程: []
    }
  }
}