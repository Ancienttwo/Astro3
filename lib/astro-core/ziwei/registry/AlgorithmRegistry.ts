import type { IZiWeiCompleteChart } from '../chart-generator'
import { generateCompleteZiWeiChart } from '../chart-generator'
import { createBaZiParams, type BaZiParams } from '../calculations/data-conversion'
import { solarToLunar, type ILunarDate, type ISolarDate } from '../lunar-utils'

export type AlgorithmType = 'ziwei' | 'lunar'

export type AlgorithmInput<T extends AlgorithmType> =
  T extends 'ziwei'
    ? BaZiParams | { solarTime: unknown; gender?: number }
    : T extends 'lunar'
      ? Date | string | ISolarDate
      : never

export type AlgorithmResult<T extends AlgorithmType> =
  T extends 'ziwei' ? IZiWeiCompleteChart :
  T extends 'lunar' ? ILunarCalendar :
  never

export interface ILunarCalendar {
  toSolar(): Date
  toLunar(date: Date | string): ILunarCalendar
  getYear(): number
  getMonth(): number
  getDay(): number
  getYearStem(): string
  getYearBranch(): string
  getMonthStem(): string
  getMonthBranch(): string
  getDayStem(): string
  getDayBranch(): string
  getTimeHour(): number
  getTimeBranch(): string
  isLeapMonth(): boolean
  toString(): string
}

export interface ICalculationOptions {
  enableCaching?: boolean
  locale?: string
  precision?: 'low' | 'medium' | 'high'
}

// Batch calculation helper types (readability and lint friendliness)
type BatchItemZiwei = { type: 'ziwei'; input: AlgorithmInput<'ziwei'>; options?: ICalculationOptions }
type BatchItemLunar = { type: 'lunar'; input: AlgorithmInput<'lunar'>; options?: ICalculationOptions }
type BatchItem = BatchItemZiwei | BatchItemLunar
type BatchResultZiwei = { type: 'ziwei'; result: AlgorithmResult<'ziwei'>; performance: number }
type BatchResultLunar = { type: 'lunar'; result: AlgorithmResult<'lunar'>; performance: number }
type BatchResult = BatchResultZiwei | BatchResultLunar

export class AlgorithmRegistry {
  private static ziweiService?: ZiWeiService
  private static lunarService?: LunarService

  static getZiWei(): ZiWeiService {
    if (!this.ziweiService) this.ziweiService = new ZiWeiService()
    return this.ziweiService
  }

  static getZiWeiStandardFormat(): ZiWeiService { return this.getZiWei() }
  static getLunar(): LunarService { if (!this.lunarService) this.lunarService = new LunarService(); return this.lunarService }

  static getAlgorithm(type: 'ziwei'): ZiWeiService
  static getAlgorithm(type: 'lunar'): LunarService
  static getAlgorithm(type: AlgorithmType): ZiWeiService | LunarService {
    return type === 'ziwei' ? this.getZiWei() : this.getLunar()
  }

  static async calculateBatch(
    calculations: ReadonlyArray<BatchItem>
  ): Promise<BatchResult[]> {
    const out: BatchResult[] = []
    for (const calc of calculations) {
      const t0 = Date.now()
      if (calc.type === 'ziwei') {
        const svc = this.getZiWei()
        const input = calc.input
        const ziResult = isSolarTimeInput(input)
          ? svc.calculateFromSolarTime(input.solarTime, input.gender ?? 0)
          : svc.calculateFromBaZi(input)
        out.push({ type: 'ziwei', result: ziResult, performance: Date.now() - t0 })
      } else {
        const svc = this.getLunar()
        const l = calc.input
        const lc = isSolarDateObject(l)
          ? svc.from(new Date(l.year, l.month - 1, l.day, l.hour ?? 0))
          : svc.from(l)
        out.push({ type: 'lunar', result: lc, performance: Date.now() - t0 })
      }
    }
    return out
  }

  static getPerformanceMetrics(): {
    totalInstances: number; algorithms: { algorithmType: string; initializationTime: number; instanceAge: number; isWarm: boolean }[]; memoryEstimate: number
  } {
    const algorithms: { algorithmType: string; initializationTime: number; instanceAge: number; isWarm: boolean }[] = []
    if (this.ziweiService) algorithms.push({ algorithmType: 'ziwei', initializationTime: 0, instanceAge: Date.now(), isWarm: true })
    if (this.lunarService) algorithms.push({ algorithmType: 'lunar', initializationTime: 0, instanceAge: Date.now(), isWarm: true })
    return { totalInstances: algorithms.length, algorithms, memoryEstimate: 0 }
  }

  static clearCache(): void { this.ziweiService = undefined; this.lunarService = undefined }

  static validateRegistry(): { isValid: boolean; availableAlgorithms: string[]; issues: string[] } {
    const available: string[] = []
    if (this.ziweiService) available.push('ziwei')
    if (this.lunarService) available.push('lunar')
    return { isValid: true, availableAlgorithms: available, issues: [] }
  }
}

class ZiWeiService {
  calculateFromBaZi(params: BaZiParams): IZiWeiCompleteChart { return generateCompleteZiWeiChart(params) }
  calculateFromSolarTime(solarTime: unknown, gender: number = 0): IZiWeiCompleteChart {
    const params = createBaZiParams(solarTime, gender)
    return this.calculateFromBaZi(params)
  }
}

class LunarService {
  from(date: Date | string): ILunarCalendar { return new SimpleLunarCalendar(typeof date === 'string' ? new Date(date) : date) }
}

class SimpleLunarCalendar implements ILunarCalendar {
  constructor(private readonly date: Date) {}
  private asISolar(): ISolarDate { return { year: this.date.getFullYear(), month: this.date.getMonth() + 1, day: this.date.getDate(), hour: this.date.getHours() } }
  private lunar(): ILunarDate { return solarToLunar(this.asISolar()) }
  toSolar(): Date { return new Date(this.date) }
  toLunar(date: Date | string): ILunarCalendar { return new SimpleLunarCalendar(typeof date === 'string' ? new Date(date) : date) }
  getYear(): number { return this.lunar().year }
  getMonth(): number { return this.lunar().month }
  getDay(): number { return this.lunar().day }
  getYearStem(): string { return this.lunar().yearGan }
  getYearBranch(): string { return this.lunar().yearZhi }
  getMonthStem(): string { return this.lunar().monthGan }
  getMonthBranch(): string { return this.lunar().monthZhi }
  getDayStem(): string { return this.lunar().dayGan }
  getDayBranch(): string { return this.lunar().dayZhi }
  getTimeHour(): number { return this.lunar().hour }
  getTimeBranch(): string { return this.lunar().hourZhi }
  isLeapMonth(): boolean { return this.lunar().isLeapMonth }
  toString(): string { const l = this.lunar(); return `${l.year}年${l.month}${l.isLeapMonth ? '(闰)' : ''}月${l.day}日 ${l.hourGan}${l.hourZhi}时` }
}

function isSolarDateObject(v: unknown): v is ISolarDate {
  return typeof v === 'object' && v !== null && 'year' in v && 'month' in v && 'day' in v
}

function isSolarTimeInput(v: unknown): v is { solarTime: unknown; gender?: number } {
  return typeof v === 'object' && v !== null && 'solarTime' in v
}
