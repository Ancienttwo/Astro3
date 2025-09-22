import type { FourPillars, TenGodAnalysis } from '../chart/types'
import type { TenGodType, BranchName, ElementName } from '../types'
import { getPatternRuleConfig } from './pattern-rules'
import { detectCombinations } from './combinations'
import type {
  PatternAnalysisResult,
  PatternDetail,
  PatternEngineOptions,
  PatternUsage,
  SimplifiedCategoryBreakdown,
  TenGodStrengthEntry
} from './types'

const DEFAULT_OPTIONS: Required<PatternEngineOptions> = {
  includeCombinations: true,
  minimumStrengthThreshold: 1
}

const SIMPLIFIED_CATEGORIES: Array<{ label: string; type: SimplifiedCategoryBreakdown['type']; members: TenGodType[] }> = [
  { label: '比劫', type: '比劫', members: ['比肩', '劫财'] },
  { label: '食伤', type: '食伤', members: ['食神', '伤官'] },
  { label: '财格', type: '财格', members: ['正财', '偏财'] },
  { label: '官杀', type: '官杀', members: ['正官', '七杀'] },
  { label: '印格', type: '印格', members: ['正印', '偏印'] }
]

function sum(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0)
}

function toTenGodStrengthEntries(map: Map<TenGodType, number>): TenGodStrengthEntry[] {
  const total = sum(Array.from(map.values())) || 1
  return Array.from(map.entries())
    .map(([tenGod, strength]) => ({
      tenGod,
      strength,
      percentage: strength > 0 ? strength / total : 0
    }))
    .sort((a, b) => b.strength - a.strength)
}

function determineUsage(primary: TenGodType, tenGodStrengths: Map<TenGodType, number>): PatternUsage {
  const bodySupport = (tenGodStrengths.get('比肩') || 0) + (tenGodStrengths.get('劫财') || 0) + (tenGodStrengths.get('正印') || 0) + (tenGodStrengths.get('偏印') || 0)
  const outputAndWealth = (tenGodStrengths.get('食神') || 0) + (tenGodStrengths.get('伤官') || 0) + (tenGodStrengths.get('正财') || 0) + (tenGodStrengths.get('偏财') || 0)
  const official = (tenGodStrengths.get('正官') || 0) + (tenGodStrengths.get('七杀') || 0)

  const bodyStrong = bodySupport >= outputAndWealth + official * 0.6

  if (['比肩', '劫财', '正印', '偏印'].includes(primary)) {
    return bodyStrong ? 'favorable' : 'neutral'
  }
  if (['食神', '伤官', '正财', '偏财', '正官', '七杀'].includes(primary)) {
    return bodyStrong ? 'unfavorable' : 'favorable'
  }
  return 'neutral'
}

function buildPatternDetail(
  primaryTenGod: TenGodType,
  ruleName: string,
  description: string,
  usage: PatternUsage,
  supportingTenGods: TenGodType[],
  confidence: number
): PatternDetail {
  return {
    name: ruleName,
    primaryTenGod,
    supportingTenGods,
    usage,
    description,
    confidence
  }
}

function aggregateCategoryBreakdown(strengths: Map<TenGodType, number>): SimplifiedCategoryBreakdown[] {
  const entries: SimplifiedCategoryBreakdown[] = SIMPLIFIED_CATEGORIES.map((category) => {
    const strength = sum(category.members.map((tg) => strengths.get(tg) || 0))
    return {
      type: category.type,
      label: category.label,
      strength,
      percentage: 0
    }
  })

  const total = sum(entries.map((entry) => entry.strength)) || 1
  entries.forEach((entry) => {
    entry.percentage = entry.strength > 0 ? entry.strength / total : 0
  })

  return entries.sort((a, b) => b.percentage - a.percentage)
}

function extractBranches(fourPillars: FourPillars): BranchName[] {
  return [fourPillars.year.branch, fourPillars.month.branch, fourPillars.day.branch, fourPillars.hour.branch]
}

function extractElementFromTenGod(tenGod: TenGodType, dayElement: ElementName): ElementName | undefined {
  switch (tenGod) {
    case '比肩':
    case '劫财':
      return dayElement
    case '食神':
    case '伤官':
      return getGeneratedElement(dayElement)
    case '正财':
    case '偏财':
      return getControlledElement(dayElement)
    case '正官':
    case '七杀':
      return getControllingElement(dayElement)
    case '正印':
    case '偏印':
      return getGeneratingElement(dayElement)
    default:
      return undefined
  }
}

const FIVE_ELEMENT_CYCLE: ElementName[] = ['木', '火', '土', '金', '水']

function getGeneratedElement(element: ElementName): ElementName {
  const idx = FIVE_ELEMENT_CYCLE.indexOf(element)
  return FIVE_ELEMENT_CYCLE[(idx + 1) % 5]
}

function getGeneratingElement(element: ElementName): ElementName {
  const idx = FIVE_ELEMENT_CYCLE.indexOf(element)
  return FIVE_ELEMENT_CYCLE[(idx + 4) % 5]
}

function getControlledElement(element: ElementName): ElementName {
  const map: Record<ElementName, ElementName> = {
    木: '土',
    火: '金',
    土: '水',
    金: '木',
    水: '火'
  }
  return map[element]
}

function getControllingElement(element: ElementName): ElementName {
  const map: Record<ElementName, ElementName> = {
    木: '金',
    火: '水',
    土: '木',
    金: '火',
    水: '土'
  }
  return map[element]
}

export class PatternEngine {
  static analyze(
    fourPillars: FourPillars,
    tenGodAnalysis: TenGodAnalysis | undefined,
    options?: PatternEngineOptions
  ): PatternAnalysisResult {
    const config = { ...DEFAULT_OPTIONS, ...(options || {}) }

    if (!tenGodAnalysis) {
      return {
        primary: null,
        tenGodRanking: [],
        simplifiedCategories: [],
        combinations: [],
        notes: ['十神分析数据缺失，无法生成格局分析']
      }
    }

    const aggregation = new Map<TenGodType, number>()
    const allTenGods: TenGodType[] = ['比肩', '劫财', '食神', '伤官', '正财', '偏财', '正官', '七杀', '正印', '偏印']
    allTenGods.forEach((tg) => aggregation.set(tg, 0))

    tenGodAnalysis.relationships.forEach((rel) => {
      const current = aggregation.get(rel.tenGod) || 0
      aggregation.set(rel.tenGod, current + (rel.strength || 0))
    })

    const ranking = toTenGodStrengthEntries(aggregation)
    const primaryEntry = ranking[0]

    const notes: string[] = []
    if (!primaryEntry || primaryEntry.strength < config.minimumStrengthThreshold) {
      notes.push('十神强度分布过于平均，未能识别主导格局')
      return {
        primary: null,
        tenGodRanking: ranking,
        simplifiedCategories: aggregateCategoryBreakdown(aggregation),
        combinations: config.includeCombinations ? detectCombinations(extractBranches(fourPillars)) : [],
        notes
      }
    }

    const supportingTenGods = ranking.slice(1).filter((entry) => entry.strength >= config.minimumStrengthThreshold * 0.6).map((entry) => entry.tenGod)

    const primaryTenGod = primaryEntry.tenGod
    const ruleConfig = getPatternRuleConfig(primaryTenGod)

    let chosenName = `${primaryTenGod}格`
    let chosenDescription = `以${primaryTenGod}为主导的格局`
    let chosenUsage: PatternUsage = determineUsage(primaryTenGod, aggregation)

    if (ruleConfig) {
      const variant = ruleConfig.variants.find((candidate) => candidate.condition.every((tg) => supportingTenGods.includes(tg)))
      const match = variant ?? ruleConfig.base
      chosenName = match.name
      chosenDescription = match.description
      chosenUsage = match.usage ?? chosenUsage
    }

    const primaryDetail = buildPatternDetail(
      primaryTenGod,
      chosenName,
      chosenDescription,
      chosenUsage,
      supportingTenGods,
      Math.min(1, primaryEntry.percentage || 0)
    )

    let secondaryDetail: PatternDetail | undefined
    if (ranking[1] && ranking[1].strength >= config.minimumStrengthThreshold) {
      const secondaryTenGod = ranking[1].tenGod
      const secondaryRule = getPatternRuleConfig(secondaryTenGod)
      let secName = `${secondaryTenGod}格`
      let secDesc = `以${secondaryTenGod}为辅的格局`
      let secUsage: PatternUsage = determineUsage(secondaryTenGod, aggregation)
      if (secondaryRule) {
        const variant = secondaryRule.variants.find((candidate) => candidate.condition.some((tg) => supportingTenGods.includes(tg)))
        const match = variant ?? secondaryRule.base
        secName = match.name
        secDesc = match.description
        secUsage = match.usage ?? secUsage
      }
      secondaryDetail = buildPatternDetail(
        secondaryTenGod,
        secName,
        secDesc,
        secUsage,
        supportingTenGods,
        Math.min(1, ranking[1].percentage || 0)
      )
    }

    const simplifiedCategories = aggregateCategoryBreakdown(aggregation)

    const dayElement = (fourPillars.day.element || fourPillars.day.branchElement) as ElementName | undefined
    if (dayElement) {
      const primaryElement = extractElementFromTenGod(primaryTenGod, dayElement)
      if (primaryElement) {
        notes.push(`主导格局五行侧重 ${primaryElement}，请关注相关情境`) 
      }
    }

    const combinations = config.includeCombinations ? detectCombinations(extractBranches(fourPillars)) : []

    if (combinations.length) {
      notes.push(`检测到 ${combinations.length} 项地支组合，对格局有额外影响`)
    }

    return {
      primary: primaryDetail,
      secondary: secondaryDetail,
      tenGodRanking: ranking,
      simplifiedCategories,
      combinations,
      notes
    }
  }
}
