import type { TenGodType } from '../types'
import type { PatternUsage } from './types'

export interface PatternRule {
  condition: TenGodType[]
  name: string
  description: string
  usage?: PatternUsage
}

export interface PatternRuleConfig {
  base: PatternRule
  variants: PatternRule[]
}

const rule = (condition: TenGodType[], name: string, description: string, usage: PatternUsage = 'neutral'): PatternRule => ({
  condition,
  name,
  description,
  usage
})

export const PATTERN_RULES: Record<TenGodType, PatternRuleConfig> = {
  '正财': {
    base: rule([], '正财格', '以正财为主，重视稳健与责任', 'favorable'),
    variants: [
      rule(['正官'], '财官格', '财生官旺，管理与资源兼具', 'favorable'),
      rule(['七杀'], '财杀格', '财旺生杀，执行力与魄力突出', 'neutral'),
      rule(['食神'], '食神生财格', '才华推动财运，善于经营', 'favorable'),
      rule(['伤官'], '伤官生财格', '创意驱动收入，适合创业', 'neutral'),
      rule(['正印'], '财印相争格', '财印双重，需平衡理想与现实', 'unfavorable')
    ]
  },
  '偏财': {
    base: rule([], '偏财格', '偏财为主，注重机会与灵活', 'neutral'),
    variants: [
      rule(['正官'], '财官相生格', '偏财扶官，善于资源整合', 'favorable'),
      rule(['七杀'], '财杀格', '财助七杀，执行果断', 'neutral'),
      rule(['食神'], '食神生财格', '才艺变现，副业机遇多', 'favorable'),
      rule(['伤官'], '伤官生财格', '创新拓展，善抓趋势', 'neutral')
    ]
  },
  '正官': {
    base: rule([], '正官格', '正官当令，恪守规则，重视秩序', 'favorable'),
    variants: [
      rule(['正财'], '财官格', '财养正官，富贵双全', 'favorable'),
      rule(['偏财'], '偏财官格', '偏财扶官，机会型领导', 'neutral'),
      rule(['正印'], '官印相生格', '官印双美，学识与责任兼备', 'favorable'),
      rule(['食神'], '食神制官格', '才华横溢但需遵循规则', 'unfavorable')
    ]
  },
  '七杀': {
    base: rule([], '七杀格', '七杀旺盛，决断力强，勇于突破', 'neutral'),
    variants: [
      rule(['正财'], '财杀格', '财生七杀，兼具执行与资源力', 'neutral'),
      rule(['偏财'], '偏财七杀格', '偏财助杀，冲劲十足', 'neutral'),
      rule(['食神'], '食神制杀格', '以柔克刚，内外兼修', 'favorable'),
      rule(['伤官'], '伤官驾杀格', '创新掌控局面，敢想敢为', 'neutral'),
      rule(['正印'], '印绶化杀格', '贵人助力，能化险为夷', 'favorable')
    ]
  },
  '正印': {
    base: rule([], '正印格', '正印护身，学识与气度兼具', 'favorable'),
    variants: [
      rule(['正官'], '官印相生格', '官印相扶，科甲显达', 'favorable'),
      rule(['七杀'], '印化七杀格', '印化杀气，压力即动力', 'neutral'),
      rule(['比肩'], '印比相生格', '印比并见，善于扶持团队', 'favorable')
    ]
  },
  '偏印': {
    base: rule([], '偏印格', '偏印主机谋，思维敏捷', 'neutral'),
    variants: [
      rule(['比肩'], '印比格', '偏印配比肩，自主独立', 'neutral'),
      rule(['劫财'], '印劫格', '偏印劫财，需防决策摇摆', 'unfavorable')
    ]
  },
  '食神': {
    base: rule([], '食神格', '食神当令，温润含蓄，重视创意', 'favorable'),
    variants: [
      rule(['正财'], '食神生财格', '食神生财，才华变现', 'favorable'),
      rule(['偏财'], '食神生财格', '副业机遇旺盛', 'favorable'),
      rule(['七杀'], '食神制杀格', '以柔克刚，善借人和', 'favorable'),
      rule(['正官'], '食神制官格', '才华受限，需守纪律', 'unfavorable')
    ]
  },
  '伤官': {
    base: rule([], '伤官格', '伤官主张表达，善突破', 'neutral'),
    variants: [
      rule(['正财'], '伤官生财格', '创意换收益，商业嗅觉强', 'favorable'),
      rule(['偏财'], '伤官偏财格', '灵感驱动市场机会', 'neutral'),
      rule(['七杀'], '伤官驾杀格', '叛逆成功，掌控风险', 'neutral'),
      rule(['正印'], '伤官配印格', '才情与资源并重', 'favorable')
    ]
  },
  '比肩': {
    base: rule([], '比肩格', '比肩旺，重视自立与伙伴', 'neutral'),
    variants: [
      rule(['正印'], '印比相生格', '印比相扶，贵人同行', 'favorable'),
      rule(['食神'], '比肩食神格', '团队协作，共享才华', 'neutral')
    ]
  },
  '劫财': {
    base: rule([], '劫财格', '劫财强，竞争意识突出', 'neutral'),
    variants: [
      rule(['伤官'], '劫财伤官格', '竞争与创意并重，变化多端', 'neutral'),
      rule(['偏印'], '枭劫格', '心思细腻，需防固执', 'unfavorable')
    ]
  }
}

export function getPatternRuleConfig(tenGod: TenGodType): PatternRuleConfig | null {
  return PATTERN_RULES[tenGod] || null
}
