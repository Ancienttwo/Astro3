import type { BranchName, ElementName, TenGodType } from '../types'

export type PatternUsage = 'favorable' | 'unfavorable' | 'neutral'

export interface TenGodStrengthEntry {
  tenGod: TenGodType
  strength: number
  percentage: number
}

export interface PatternDetail {
  name: string
  primaryTenGod: TenGodType
  supportingTenGods: TenGodType[]
  usage: PatternUsage
  description: string
  confidence: number
}

export interface CombinationMatch {
  name: string
  branches: BranchName[]
  element?: ElementName
  impact: PatternUsage
  description: string
}

export interface SimplifiedCategoryBreakdown {
  type: '比劫' | '食伤' | '财格' | '官杀' | '印格'
  label: string
  percentage: number
  strength: number
}

export interface PatternAnalysisResult {
  primary: PatternDetail | null
  secondary?: PatternDetail
  tenGodRanking: TenGodStrengthEntry[]
  simplifiedCategories: SimplifiedCategoryBreakdown[]
  combinations: CombinationMatch[]
  notes: string[]
}

export interface PatternEngineOptions {
  includeCombinations?: boolean
  minimumStrengthThreshold?: number
}
