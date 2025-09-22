import type { BasicChartResult, FourPillars, HiddenStem, TenGodAnalysis, TenGodRelationship, StemBranchPair } from '../chart/types'
import type { StemName, BranchName, ElementName } from '../types'
import { STEM_ELEMENTS, BRANCH_ELEMENTS } from '../chart/constants'
import type { InputChart, OutputPayload, BuildOptions } from './yongshenToolkit'
import { buildOutput, renderMermaid, relationsToStructuralFactors } from './yongshenToolkit'

type TenGod = import('./yongshenToolkit').TenGod

type Branch = import('./yongshenToolkit').Branch
type TenGodHiddenItem = import('./yongshenToolkit').TenGodHiddenItem

interface RelationsPayload extends NonNullable<InputChart['relations']> {}
type StemRelations = NonNullable<RelationsPayload['stems']>
type HePairList = NonNullable<StemRelations['he_pairs']>

type PillarSlot = 'year' | 'month' | 'day' | 'hour'

const PILLAR_KEYS: PillarSlot[] = ['year', 'month', 'day', 'hour']

const getPillar = (pillars: FourPillars, key: PillarSlot): StemBranchPair => pillars[key]

const STEM_HE_CONFIG: Record<StemName, { pair: StemName; element: ElementName; pattern: string }> = {
  甲: { pair: '己', element: '土', pattern: '甲己合土' },
  乙: { pair: '庚', element: '金', pattern: '乙庚合金' },
  丙: { pair: '辛', element: '水', pattern: '丙辛合水' },
  丁: { pair: '壬', element: '木', pattern: '丁壬合木' },
  戊: { pair: '癸', element: '火', pattern: '戊癸合火' },
  己: { pair: '甲', element: '土', pattern: '甲己合土' },
  庚: { pair: '乙', element: '金', pattern: '乙庚合金' },
  辛: { pair: '丙', element: '水', pattern: '丙辛合水' },
  壬: { pair: '丁', element: '木', pattern: '丁壬合木' },
  癸: { pair: '戊', element: '火', pattern: '戊癸合火' },
}

const STEM_HE_FACTORS: Record<ElementName, { roots: BranchName[] }> = {
  木: { roots: ['寅', '卯'] },
  火: { roots: ['巳', '午'] },
  土: { roots: ['辰', '戌', '丑', '未'] },
  金: { roots: ['申', '酉'] },
  水: { roots: ['子', '亥'] },
}

const ELEMENT_CORE_STEMS: Record<ElementName, StemName[]> = {
  木: ['甲', '乙'],
  火: ['丙', '丁'],
  土: ['戊', '己'],
  金: ['庚', '辛'],
  水: ['壬', '癸'],
}

const BRANCH_LIUHE: Array<{ a: BranchName; b: BranchName; element: ElementName }> = [
  { a: '子', b: '丑', element: '土' },
  { a: '寅', b: '亥', element: '木' },
  { a: '卯', b: '戌', element: '火' },
  { a: '辰', b: '酉', element: '金' },
  { a: '巳', b: '申', element: '水' },
  { a: '午', b: '未', element: '土' },
]

const BRANCH_CHONG_PAIRS: Array<{ a: BranchName; b: BranchName }> = [
  { a: '子', b: '午' },
  { a: '丑', b: '未' },
  { a: '寅', b: '申' },
  { a: '卯', b: '酉' },
  { a: '辰', b: '戌' },
  { a: '巳', b: '亥' },
]

const BRANCH_PO_PAIRS: Array<{ a: BranchName; b: BranchName }> = [
  { a: '子', b: '酉' },
  { a: '午', b: '卯' },
  { a: '寅', b: '亥' },
  { a: '申', b: '巳' },
  { a: '辰', b: '丑' },
  { a: '戌', b: '未' },
]

const BRANCH_HAI_PAIRS: Array<{ a: BranchName; b: BranchName; type: string }> = [
  { a: '子', b: '未', type: '子未害' },
  { a: '丑', b: '午', type: '丑午害' },
  { a: '寅', b: '巳', type: '寅巳害' },
  { a: '卯', b: '辰', type: '卯辰害' },
  { a: '申', b: '亥', type: '申亥害' },
  { a: '酉', b: '戌', type: '酉戌害' },
]

const BRANCH_XING_GROUPS: Array<{ set: BranchName[]; type: string }> = [
  { set: ['子', '卯'], type: '无礼之刑' },
  { set: ['寅', '巳', '申'], type: '寅巳申三刑' },
  { set: ['丑', '戌', '未'], type: '丑戌未三刑' },
  { set: ['辰'], type: '辰自刑' },
  { set: ['午'], type: '午自刑' },
  { set: ['酉'], type: '酉自刑' },
  { set: ['亥'], type: '亥自刑' },
]

const SANHE_GROUPS: Array<{ group: BranchName[]; element: ElementName }> = [
  { group: ['申', '子', '辰'], element: '水' },
  { group: ['亥', '卯', '未'], element: '木' },
  { group: ['寅', '午', '戌'], element: '火' },
  { group: ['巳', '酉', '丑'], element: '金' },
]

const HUI_GROUPS: Array<{ group: BranchName[]; element: ElementName }> = [
  { group: ['寅', '卯', '辰'], element: '木' },
  { group: ['巳', '午', '未'], element: '火' },
  { group: ['申', '酉', '戌'], element: '金' },
  { group: ['亥', '子', '丑'], element: '水' },
]

const LU_BRANCH: Record<StemName, BranchName> = {
  甲: '寅',
  乙: '卯',
  丙: '巳',
  丁: '午',
  戊: '巳',
  己: '午',
  庚: '申',
  辛: '酉',
  壬: '亥',
  癸: '子',
}

const SEASONAL_SUPPORT_MAP: Record<'春' | '夏' | '秋' | '冬' | '土月', Partial<Record<ElementName, number>>> = {
  春: { 木: 0.5, 火: 0.3, 水: 0.2, 土: -0.2, 金: -0.3 },
  夏: { 火: 0.5, 土: 0.2, 木: 0.1, 金: -0.2, 水: -0.4 },
  秋: { 金: 0.5, 水: 0.3, 土: 0.1, 木: -0.3, 火: -0.2 },
  冬: { 水: 0.5, 木: 0.2, 金: 0.1, 火: -0.3, 土: -0.2 },
  土月: { 土: 0.4, 金: 0.1, 水: 0.1, 木: -0.2, 火: -0.2 },
}

const CONTROL_ELEMENT_MAP: Record<ElementName, ElementName> = {
  木: '土',
  火: '金',
  土: '水',
  金: '木',
  水: '火',
}

const TENGOD_ALIAS: Record<string, TenGod> = {
  偏印: '偏印',
  正印: '正印',
  枭: '枭',
}

function uniq<T>(arr: Iterable<T>): T[] {
  return Array.from(new Set(arr))
}

function getHiddenStemMap(pillars: FourPillars): Record<string, HiddenStem & { host: BranchName; pillar: PillarSlot }> {
  const map: Record<string, HiddenStem & { host: BranchName; pillar: PillarSlot }> = {}
  PILLAR_KEYS.forEach((key) => {
    const pillar = getPillar(pillars, key)
    const hidden = pillar.hiddenStems || []
    hidden.forEach((hs, idx) => {
      map[`${key}:${hs.stem}:${idx}`] = { ...hs, host: pillar.branch, pillar: key }
    })
  })
  return map
}

function evalStemHePair(
  stems: Array<{ stem: StemName; pillar: PillarSlot }>,
  hiddenStems: StemName[],
  branches: BranchName[],
  monthBranch: BranchName,
): HePairList {
  const pairs: HePairList = []
  const branchSet = new Set(branches)
  const monthElement = BRANCH_ELEMENTS[monthBranch]
  const seen = new Set<string>()

  stems.forEach(({ stem, pillar }) => {
    const config = STEM_HE_CONFIG[stem]
    if (!config) return
    const signature = [stem, config.pair].sort().join('-')
    if (seen.has(signature)) return
    const hasPair = stems.some((item) => item.stem === config.pair)
    if (!hasPair) return

    const transformStems = ELEMENT_CORE_STEMS[config.element]
    const transformEvidence = stems.some((item) => transformStems.includes(item.stem))
      || hiddenStems.some((hs) => transformStems.includes(hs))
    
    const evidence = {
      hua_god: transformEvidence ? `${config.element}` : undefined,
      root: STEM_HE_FACTORS[config.element].roots.some((br) => branchSet.has(br)),
      season_support: monthElement === config.element,
    }
    const formed = Number(Boolean(evidence.hua_god)) + Number(evidence.root) + Number(evidence.season_support) >= 2
    pairs.push({
      a: stem,
      b: config.pair,
      type: '合',
      may_transform_to: config.element,
      evidence,
      formed,
    })
    seen.add(signature)
  })

  return pairs
}

function evalBranchPairs(
  branches: BranchName[],
): RelationsPayload['branches'] {
  const res: RelationsPayload['branches'] = {
    chong: [],
    xing: [],
    po: [],
    hai: [],
    liuhe: [],
    banhe: [],
    sanhe: [],
    hui: [],
    jue: [],
    others: [],
  }
  const combos = new Set(branches)
  const pairs = branches.flatMap((a, idx) => branches.slice(idx + 1).map((b) => ({ a, b })))

  const exists = (a: BranchName, b: BranchName, list: Array<{ a: BranchName; b: BranchName }>) =>
    list.some((item) =>
      (item.a === a && item.b === b) || (item.a === b && item.b === a)
    )

  pairs.forEach(({ a, b }) => {
    if (exists(a, b, BRANCH_CHONG_PAIRS)) {
      res.chong!.push({ a, b, type: `${a}${b}冲` })
    }
    if (exists(a, b, BRANCH_PO_PAIRS)) {
      res.po!.push({ a, b, type: `${a}${b}破` })
    }
    const hai = BRANCH_HAI_PAIRS.find((item) =>
      (item.a === a && item.b === b) || (item.a === b && item.b === a)
    )
    if (hai) {
      res.hai!.push({ a, b, type: hai.type })
    }
    const liuhe = BRANCH_LIUHE.find((item) =>
      (item.a === a && item.b === b) || (item.a === b && item.b === a)
    )
    if (liuhe) {
      res.liuhe!.push({ a, b, may_transform_to: liuhe.element, formed: true })
    }
  })

  SANHE_GROUPS.forEach(({ group, element }) => {
    const present = group.filter((br) => combos.has(br))
    if (present.length === 3) {
      res.sanhe!.push({ group, towards: element, formed: true })
    } else if (present.length === 2) {
      res.banhe!.push({ group: present, towards: element, formed: false })
    }
  })

  HUI_GROUPS.forEach(({ group, element }) => {
    const present = group.filter((br) => combos.has(br))
    if (present.length === 3) {
      res.hui!.push({ group, towards: element, formed: true })
    } else if (present.length === 2) {
      res.hui!.push({ group: present, towards: element, formed: false })
    }
  })

  BRANCH_XING_GROUPS.forEach(({ set, type }) => {
    const hits = set.filter((br) => combos.has(br))
    if (hits.length >= 2) {
      const [a, b] = hits
      res.xing!.push({ a, b, type })
    }
  })

  return res
}

function buildTenGodMaps(tenGodAnalysis: TenGodAnalysis, pillars: FourPillars): {
  byStem: Record<string, TenGod>
  hiddenList: InputChart['ten_gods']['by_hidden']
} {
  const byStem: Record<string, TenGod> = {}
  const hiddenList: InputChart['ten_gods']['by_hidden'] = []
  const hiddenLookup = getHiddenStemMap(pillars)

  tenGodAnalysis.relationships.forEach((rel) => {
    const label = (TENGOD_ALIAS[rel.tenGod] || rel.tenGod) as TenGod
    if (!PILLAR_KEYS.includes(rel.pillar as PillarSlot)) return
    const pillarKey = rel.pillar as PillarSlot
    if (rel.targetType === 'stem') {
      byStem[rel.target as StemName] = label
    }
    if (rel.targetType === 'hiddenStem') {
      const entry = Object.entries(hiddenLookup).find(([, value]) => value.stem === rel.target && value.pillar === pillarKey)
      if (entry) {
        const [, hs] = entry
        hiddenList.push({
          host: hs.host as Branch,
          stem: hs.stem as StemName,
          god: label,
          weight: hs.weight,
        })
      }
    }
  })

  return { byStem, hiddenList }
}

function buildRooting(tenGodAnalysis: TenGodAnalysis, pillars: FourPillars): NonNullable<InputChart['strength']>['rooting'] {
  const rooting: Record<string, BranchName[]> = {}
  tenGodAnalysis.relationships.forEach((rel) => {
    if (!PILLAR_KEYS.includes(rel.pillar as PillarSlot)) return
    const branch = getPillar(pillars, rel.pillar as PillarSlot).branch
    if (rel.targetType === 'hiddenStem') {
      const tag = rel.tenGod
      if (!rooting[tag]) rooting[tag] = []
      if (!rooting[tag].includes(branch)) rooting[tag].push(branch)
    }
  })
  return rooting
}

function buildCandidateScope(pillars: FourPillars, tenGodAnalysis: TenGodAnalysis): string[] {
  const stems = PILLAR_KEYS.flatMap((key) => {
    const pillar = getPillar(pillars, key)
    return [pillar.stem, ...(pillar.hiddenStems || []).map((hs) => hs.stem)]
  })
  const branches = PILLAR_KEYS.map((key) => getPillar(pillars, key).branch)
  const extras = tenGodAnalysis.relationships.map((rel) => rel.element)
  return uniq([...stems, ...branches, ...extras])
}

function pickYongshenElement(fourPillars: FourPillars): ElementName {
  const counts = fourPillars.elementCount
  const entries = Object.entries(counts) as Array<[ElementName, number]>
  entries.sort((a, b) => a[1] - b[1])
  return (entries[0]?.[0] || '火')
}

function pickYongshenValue(
  yongshenElement: ElementName,
  pillars: FourPillars,
  dayMaster: StemName,
): string {
  const stems: StemName[] = []
  PILLAR_KEYS.forEach((key) => {
    const pillar = getPillar(pillars, key)
    if (pillar.stem !== dayMaster && STEM_ELEMENTS[pillar.stem] === yongshenElement) {
      stems.push(pillar.stem)
    }
    pillar.hiddenStems?.forEach((hs) => {
      if (hs.stem !== dayMaster && STEM_ELEMENTS[hs.stem] === yongshenElement) {
        stems.push(hs.stem)
      }
    })
  })
  if (stems.length > 0) return stems[0]
  const branch = PILLAR_KEYS
    .map((key) => getPillar(pillars, key).branch)
    .find((br) => BRANCH_ELEMENTS[br] === yongshenElement)
  if (branch) return branch
  return yongshenElement
}

function detectBlockers(tenGodAnalysis: TenGodAnalysis, branches: BranchName[], yongshenElement: ElementName): string[] {
  const counts = tenGodAnalysis.summary?.count || {}
  const blockers: string[] = []
  if ((counts['偏印'] || 0) + (counts['正印'] || 0) > 0) blockers.push('枭克食')
  if ((counts['劫财'] || 0) > 0) blockers.push('劫夺财')
  const hasKu = branches.some((br) => ['辰', '丑', '未', '戌'].includes(br))
  if (hasKu && (yongshenElement === '水' || yongshenElement === '金')) {
    blockers.push('财入辰库')
  }
  return uniq(blockers)
}

function deriveJishen(tenGodAnalysis: TenGodAnalysis): string[] {
  const counts = tenGodAnalysis.summary?.count || {}
  const list: string[] = []
  if ((counts['偏印'] || 0) + (counts['正印'] || 0) > 0) list.push('枭')
  if ((counts['劫财'] || 0) > 0) list.push('劫')
  return uniq(list)
}

function buildReasoning(yongshen: string, yongshenElement: ElementName, monthBranch: BranchName, blockers: string[], structural: ReturnType<typeof relationsToStructuralFactors>): string {
  const parts: string[] = []
  if (blockers.includes('枭克食')) parts.push('先制枭复原食神链路')
  if (blockers.includes('劫夺财')) parts.push('再护财路避免劫夺')
  const monthElement = BRANCH_ELEMENTS[monthBranch]
  if (monthElement === '水' && yongshenElement === '火') parts.push('冬水不生木需火暖')
  if (structural.sanhe?.some((text) => text.includes('三合成局'))) parts.push('三合局提供背书')
  parts.push(`以${yongshen}(${yongshenElement})作用神贯通制化`)
  return parts.join('；')
}

function buildFourRules(blockers: string[]): BuildOptions['fourRulesOverride'] {
  return {
    cai_not_by_jie: !blockers.includes('劫夺财'),
  }
}

export interface YongshenAgentResult {
  input: InputChart
  payload: OutputPayload
  mermaid: string
  streamLines: string[]
}

export function deriveYongshenInput(chart: BasicChartResult): InputChart {
  const { input, fourPillars, tenGodAnalysis } = chart
  const stems = PILLAR_KEYS.map((key) => ({ stem: getPillar(fourPillars, key).stem, pillar: key }))
  const hiddenAggregate = PILLAR_KEYS.flatMap((key) =>
    (getPillar(fourPillars, key).hiddenStems || []).map((hs) => hs.stem as StemName)
  )
  const branches = PILLAR_KEYS.map((key) => getPillar(fourPillars, key).branch)
  const hePairs: HePairList = evalStemHePair(stems, hiddenAggregate, branches, fourPillars.month.branch)
  const relations: RelationsPayload = {
    stems: {
      he_pairs: hePairs,
      clash: [],
    },
    branches: evalBranchPairs(branches),
    twelve_stage: undefined,
    lu_mu_ku: (() => {
      const dayStem = fourPillars.day.stem
      const lu = LU_BRANCH[dayStem]
      const luList = branches.filter((br) => br === lu)
      const kuCandidates = branches.filter((br) => ['辰', '丑', '未', '戌'].includes(br))
      const dayElement = STEM_ELEMENTS[dayStem]
      const wealthElement = CONTROL_ELEMENT_MAP[dayElement]
      const enterKu = kuCandidates
        .filter((br) => BRANCH_ELEMENTS[br] === wealthElement)
        .map((br) => {
          const strength: '强' | '中' = kuCandidates.length > 1 ? '强' : '中'
          return { who: `财(${wealthElement})`, in: br as Branch, strength }
        })
      return {
        lu: luList as Branch[],
        ku: uniq(kuCandidates) as Branch[],
        enter_ku: enterKu,
      }
    })(),
  }

  const { byStem, hiddenList } = buildTenGodMaps(tenGodAnalysis, fourPillars)
  const seasonal = SEASONAL_SUPPORT_MAP[fourPillars.season]

  return {
    meta: {
      calendar: input.isLunar ? 'lunar' : 'solar',
      tz: input.timezone || 'Asia/Shanghai',
      month_branch: fourPillars.month.branch as Branch,
      data_quality: 'ok',
    },
    pillars: {
      year: {
        stem: fourPillars.year.stem,
        branch: fourPillars.year.branch,
        hidden_stems: (fourPillars.year.hiddenStems || []).map((hs) => hs.stem),
      },
      month: {
        stem: fourPillars.month.stem,
        branch: fourPillars.month.branch,
        hidden_stems: (fourPillars.month.hiddenStems || []).map((hs) => hs.stem),
      },
      day: {
        stem: fourPillars.day.stem,
        branch: fourPillars.day.branch,
        hidden_stems: (fourPillars.day.hiddenStems || []).map((hs) => hs.stem),
      },
      hour: {
        stem: fourPillars.hour.stem,
        branch: fourPillars.hour.branch,
        hidden_stems: (fourPillars.hour.hiddenStems || []).map((hs) => hs.stem),
      },
    },
    ten_gods: {
      day_master: fourPillars.day.stem,
      by_stem: byStem,
      by_hidden: hiddenList,
    },
    strength: {
      rooting: buildRooting(tenGodAnalysis, fourPillars),
      seasonal_support: seasonal,
      overall_bias: fourPillars.season === '冬' ? '偏寒' : fourPillars.season === '夏' ? '偏热' : '中和',
    },
    relations,
    flags: {
      transformation_candidates: hePairs.map((p: HePairList[number]) => ({
        pattern: `${p.a}${p.b}合${p.may_transform_to}`,
        valid: Boolean(p.formed),
        reason: p.formed ? '合化条件基本具备' : '合化条件欠缺',
      })),
      environment: {
        cold_hot: fourPillars.season === '冬' ? '寒' : fourPillars.season === '夏' ? '热' : '温',
        wet_dry: ['辰', '丑', '未', '戌'].includes(fourPillars.month.branch) ? '湿' : '平',
      },
    },
  }
}

function formatHiddenList(list: TenGodHiddenItem[] | undefined): string {
  if (!list?.length) return ''
  return list
    .map((item) => `${item.stem}${item.god ?? ''}${typeof item.weight === 'number' ? `(${Number(item.weight).toFixed(1)})` : ''}`)
    .join('、')
}

export function buildYongshenAgentQuery(chart: BasicChartResult): string {
  const input = deriveYongshenInput(chart)
  const structural = relationsToStructuralFactors(input.relations)
  const hiddenByHost = new Map<string, TenGodHiddenItem[]>()
  input.ten_gods.by_hidden?.forEach((item) => {
    const list = hiddenByHost.get(item.host) || []
    list.push(item)
    hiddenByHost.set(item.host, list)
  })

  const pillarLines = PILLAR_KEYS.map((slot) => {
    const pillar = input.pillars[slot]
    if (!pillar) return ''
    const label =
      slot === 'year' ? '年柱' : slot === 'month' ? '月柱' : slot === 'day' ? '日柱' : '时柱'
    const stem = pillar.stem
    const branch = pillar.branch
    const stemGod = input.ten_gods.by_stem?.[stem]
    const hidden = formatHiddenList(hiddenByHost.get(branch) || [])
    const hiddenText = hidden ? `（藏干：${hidden}）` : ''
    const stemText = stemGod ? `${stem}${stemGod}` : stem
    return `${label}：${stemText}${branch}${hiddenText}`
  }).filter(Boolean)

  const tenGodLegend = input.ten_gods.by_stem
    ? Object.entries(input.ten_gods.by_stem)
        .map(([stem, god]) => `${stem}=${god}`)
        .join('，')
    : ''

  const seasonal = input.strength?.seasonal_support
  const seasonalText = seasonal
    ? Object.entries(seasonal)
        .map(([el, val]) => `${el}:${Number(val).toFixed(1)}`)
        .join('，')
    : ''

  const structuralLines: string[] = []
  if (structural?.stems_he?.length) structuralLines.push(`干合：${structural.stems_he.join('；')}`)
  if (structural?.branches_chong?.length)
    structuralLines.push(`地支冲：${structural.branches_chong.join('；')}`)
  if (structural?.branches_xing?.length)
    structuralLines.push(`地支刑：${structural.branches_xing.join('；')}`)
  if (structural?.branches_pohai?.length)
    structuralLines.push(`地支破害：${structural.branches_pohai.join('；')}`)
  if (structural?.sanhe?.length) structuralLines.push(`三合：${structural.sanhe.join('；')}`)
  if (structural?.liuhe?.length) structuralLines.push(`六合：${structural.liuhe.join('；')}`)
  if (structural?.banhe?.length) structuralLines.push(`半合：${structural.banhe.join('；')}`)
  if (structural?.hui?.length) structuralLines.push(`会局：${structural.hui.join('；')}`)
  if (structural?.lu_mu_ku?.length) structuralLines.push(`禄库：${structural.lu_mu_ku.join('；')}`)

  const env = input.flags?.environment
  const envText = env
    ? `寒热:${env.cold_hot ?? '平'}；湿燥:${env.wet_dry ?? '平'}`
    : ''

  const transformations = input.flags?.transformation_candidates?.length
    ? input.flags.transformation_candidates
        .map((item) => `${item.pattern}${item.valid ? '(可能成化)' : '(待判)'}`)
        .join('；')
    : ''

  const lines: string[] = []
  lines.push('【命盘结构数据】')
  lines.push(
    `【基础】历法:${input.meta.calendar}; 时区:${input.meta.tz}; 月令:${input.meta.month_branch}; 数据质量:${input.meta.data_quality}`,
  )
  lines.push('【四柱】')
  lines.push(...pillarLines)
  lines.push(`【日主】${input.ten_gods.day_master}`)
  if (tenGodLegend) lines.push(`【十神】${tenGodLegend}`)
  if (seasonalText) lines.push(`【势力倾向】${seasonalText}`)
  if (structuralLines.length) {
    lines.push('【结构因子】')
    lines.push(...structuralLines)
  }
  if (transformations) lines.push(`【合化提示】${transformations}`)
  if (envText) lines.push(`【环境】${envText}`)
  return lines.filter(Boolean).join('\n')
}

export function runYongshenAgent(chart: BasicChartResult): YongshenAgentResult {
  const input = deriveYongshenInput(chart)
  const { fourPillars, tenGodAnalysis } = chart
  const branches = PILLAR_KEYS.map((key) => getPillar(fourPillars, key).branch)
  const yongshenElement = pickYongshenElement(fourPillars)
  const yongshen = pickYongshenValue(yongshenElement, fourPillars, fourPillars.day.stem)
  const blockers = detectBlockers(tenGodAnalysis, branches, yongshenElement)
  const jishen = deriveJishen(tenGodAnalysis)
  const structural = relationsToStructuralFactors(input.relations)
  const reasoning = buildReasoning(yongshen, yongshenElement, fourPillars.month.branch, blockers, structural)
  const candidate_scope = buildCandidateScope(fourPillars, tenGodAnalysis)

  const payload = buildOutput(input, {
    endpoint: '官',
    yongshen,
    jishen,
    blockers,
    reasoning,
    candidate_scope,
    keyChainHint: '水→木',
    yongshenElement,
    fourRulesOverride: buildFourRules(blockers),
  })

  const mermaid = renderMermaid(payload)
  const streamLines: string[] = []
  streamLines.push(`用神判定：取${yongshen}（${yongshenElement}）以制${jishen.join('、') || '枭劫'}`)
  streamLines.push(`做功路径：${payload.layerA_do_gong.reasoning}`)
  streamLines.push(`调候方案：${payload.layerB_tiaohou.need ? payload.layerB_tiaohou.direction.join('/') : '无需额外调候'}`)
  streamLines.push(`格局评估：${payload.layerC_fit_and_grade.grade} · ${payload.layerC_fit_and_grade.notes}`)

  return { input, payload, mermaid, streamLines }
}

export function summarizeYongshen(payload: OutputPayload): string {
  return `用神：${payload.layerA_do_gong.yongshen}；调候：${payload.layerB_tiaohou.direction.join('/') || '不需'}；格局：${payload.layerC_fit_and_grade.grade}`
}
