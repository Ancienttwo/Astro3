/**
 * Type augmentation for tyme4ts library
 * 
 * The tyme4ts library has incomplete TypeScript definitions which cause
 * 'any' type issues. This module augmentation provides proper typing
 * for the methods we use, ensuring type safety without ESLint disables.
 */

import 'tyme4ts'

declare module 'tyme4ts' {
  // Forward declare interfaces to ensure they are available for augmentation
  interface LunarDay {}
  interface LunarMonth {}
  interface LunarYear {}
  interface LunarHour {}
  interface EightChar {}
  interface DecadeFortune {}
  interface ChildLimit {}
  interface EightCharDetail {}

  interface SolarTime {
    getLunarDay(): LunarDay
    getLunarHour(): LunarHour
  }

  interface LunarDay {
    getLunarMonth(): LunarMonth
    getDay(): number
  }

  interface LunarMonth {
    getLunarYear(): LunarYear
    isLeap(): boolean
    getMonthWithLeap(): number
  }

  interface LunarYear {
    getYear(): number
  }

  interface LunarHour {
    getEightChar(): EightChar
  }

  interface EightCharDetail {
    getName(): string
  }

  interface EightChar {
    getYear(): EightCharDetail
    getMonth(): EightCharDetail
    getDay(): EightCharDetail
    getHour(): EightCharDetail
  }

  interface ChildLimit {
    getStartDecadeFortune(): DecadeFortune
    getYearCount(): number
    isForward(): boolean
  }

  interface DecadeFortune {
    getName(): string
    getStartAge(): number
    getEndAge(): number
    next(n: number): DecadeFortune | null
  }
}