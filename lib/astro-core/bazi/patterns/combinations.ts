import type { BranchName, ElementName } from '../types'
import type { CombinationMatch } from './types'

type BranchTriple = [BranchName, BranchName, BranchName]
type BranchPair = [BranchName, BranchName]

const createMatch = (
  name: string,
  branches: BranchName[],
  element: ElementName | undefined,
  impact: CombinationMatch['impact'],
  description: string
): CombinationMatch => ({ name, branches, element, impact, description })

const SAN_HE: Array<{ branches: BranchTriple; element: ElementName; name: string; description: string }> = [
  { branches: ['申', '子', '辰'], element: '水', name: '申子辰三合水局', description: '申子辰三支齐聚，利于情绪柔和与资源整合' },
  { branches: ['寅', '午', '戌'], element: '火', name: '寅午戌三合火局', description: '寅午戌火势旺盛，激发行动力与影响力' },
  { branches: ['亥', '卯', '未'], element: '木', name: '亥卯未三合木局', description: '亥卯未木旺，强调成长与谋略' },
  { branches: ['巳', '酉', '丑'], element: '金', name: '巳酉丑三合金局', description: '巳酉丑成局，突出执行效率与规则意识' }
]

const LIU_HE: Array<{ pair: BranchPair; name: string; description: string; impact: CombinationMatch['impact'] }> = [
  { pair: ['子', '丑'], name: '子丑六合', description: '子丑相合，注重稳健与积累', impact: 'neutral' },
  { pair: ['寅', '亥'], name: '寅亥六合', description: '寅亥合木，扩展与理念并行', impact: 'favorable' },
  { pair: ['卯', '戌'], name: '卯戌六合', description: '卯戌合火，合作中带来热情与驱动力', impact: 'favorable' },
  { pair: ['辰', '酉'], name: '辰酉六合', description: '辰酉合金，强调秩序与明确目标', impact: 'neutral' },
  { pair: ['巳', '申'], name: '巳申六合', description: '巳申合水，灵活机变，需要平衡节奏', impact: 'neutral' },
  { pair: ['午', '未'], name: '午未六合', description: '午未合土，务实落实，但易滋生慵懒', impact: 'neutral' }
]

const SAN_HUI: Array<{ branches: BranchTriple; element: ElementName; name: string; description: string; impact?: CombinationMatch['impact'] }> = [
  { branches: ['亥', '子', '丑'], element: '水', name: '亥子丑三会水局', description: '水局齐会，强调智慧与流动性', impact: 'favorable' },
  { branches: ['寅', '卯', '辰'], element: '木', name: '寅卯辰三会木局', description: '木局相会，成长与策划并重', impact: 'favorable' },
  { branches: ['巳', '午', '未'], element: '火', name: '巳午未三会火局', description: '火局聚合，行动果决但需控躁进', impact: 'favorable' },
  { branches: ['申', '酉', '戌'], element: '金', name: '申酉戌三会金局', description: '金局相会，强调规则与实践', impact: 'neutral' }
]

const SAN_XING: Array<{ name: string; branches: BranchTriple; description: string }> = [
  { name: '寅巳申三刑', branches: ['寅', '巳', '申'], description: '三刑成局，易生压力与冲突，需要调和' },
  { name: '丑戌未三刑', branches: ['丑', '戌', '未'], description: '土刑结构，易有固执拖延，应留弹性' }
]

const ER_XING: Array<{ name: string; pair: BranchPair; description: string }> = [
  { name: '子卯相刑', pair: ['子', '卯'], description: '子卯相刑，情绪与价值观易冲突' },
  { name: '辰午相刑', pair: ['辰', '午'], description: '辰午相刑，计划与执行易出现不协调' },
  { name: '酉丑相刑', pair: ['酉', '丑'], description: '酉丑相刑，对秩序与利益分配需谨慎' }
]

const CHONG_PAIRS: Array<{ pair: BranchPair; name: string; description: string }> = [
  { pair: ['子', '午'], name: '子午冲', description: '子午相冲，情绪与节奏易起伏' },
  { pair: ['丑', '未'], name: '丑未冲', description: '丑未冲，资源与现实考量需平衡' },
  { pair: ['寅', '申'], name: '寅申冲', description: '寅申冲，进取与守成并存' },
  { pair: ['卯', '酉'], name: '卯酉冲', description: '卯酉冲，理念与执行需磨合' },
  { pair: ['辰', '戌'], name: '辰戌冲', description: '辰戌冲，规则与弹性拉扯' },
  { pair: ['巳', '亥'], name: '巳亥冲', description: '巳亥冲，理性与直觉交锋' }
]

const HAI_PAIRS: Array<{ pair: BranchPair; name: string; description: string }> = [
  { pair: ['子', '未'], name: '子未相害', description: '子未相害，合作中易有误解' },
  { pair: ['丑', '午'], name: '丑午相害', description: '丑午相害，节奏冲突需协调' },
  { pair: ['寅', '巳'], name: '寅巳相害', description: '寅巳相害，理念与执行易冲突' },
  { pair: ['卯', '辰'], name: '卯辰相害', description: '卯辰相害，计划执行需谨慎' },
  { pair: ['酉', '戌'], name: '酉戌相害', description: '酉戌相害，权责需厘清' },
  { pair: ['申', '亥'], name: '申亥相害', description: '申亥相害，外部关系需维护' }
]

function hasBranches(branches: BranchName[], required: BranchName[]): boolean {
  const set = new Set(branches)
  return required.every((b) => set.has(b))
}

function hasPair(branches: BranchName[], pair: BranchPair): boolean {
  const set = new Set(branches)
  return set.has(pair[0]) && set.has(pair[1])
}

export function detectCombinations(branches: BranchName[]): CombinationMatch[] {
  const matches: CombinationMatch[] = []

  for (const combo of SAN_HE) {
    if (hasBranches(branches, combo.branches)) {
      matches.push(createMatch(combo.name, combo.branches, combo.element, 'favorable', combo.description))
    }
  }

  for (const combo of SAN_HUI) {
    if (hasBranches(branches, combo.branches)) {
      matches.push(createMatch(combo.name, combo.branches, combo.element, combo.impact ?? 'favorable', combo.description))
    }
  }

  for (const pair of LIU_HE) {
    if (hasPair(branches, pair.pair)) {
      matches.push(createMatch(pair.name, pair.pair, undefined, pair.impact, pair.description))
    }
  }

  for (const pattern of SAN_XING) {
    if (hasBranches(branches, pattern.branches)) {
      matches.push(createMatch(pattern.name, pattern.branches, undefined, 'unfavorable', pattern.description))
    }
  }

  for (const pair of ER_XING) {
    if (hasPair(branches, pair.pair)) {
      matches.push(createMatch(pair.name, pair.pair, undefined, 'unfavorable', pair.description))
    }
  }

  for (const pair of CHONG_PAIRS) {
    if (hasPair(branches, pair.pair)) {
      matches.push(createMatch(pair.name, pair.pair, undefined, 'unfavorable', pair.description))
    }
  }

  for (const pair of HAI_PAIRS) {
    if (hasPair(branches, pair.pair)) {
      matches.push(createMatch(pair.name, pair.pair, undefined, 'unfavorable', pair.description))
    }
  }

  return matches
}
