import type { ZiWeiHookChart, HookPalaceInfo, HookStarInfo, HookBirthInfo } from '../types/hook-format-types'
import { BRANCH_NAMES } from '../types/hook-format-types'
import {
  analyzeWealthStructure,
  buildWealthInputFromHook,
  PALACE_ORDER,
  type PalaceIdentifier,
  type WealthAnalysisResult,
} from '../analysis/wealth'
import { FLYING_PALACE_SIHUA } from '../constants/master-stars'
import { PERIOD_FINANCE_TABLE } from '../analysis/fortune-rules'

export type ZiweiAiFocus = 'analysis' | 'destiny' | 'life' | 'peach_blossom' | 'wealth'

interface BuildQueryOptions {
  focus?: ZiweiAiFocus
}

const PALACE_ALIASES = {
  命宫: ['命宫', '命'],
  迁移宫: ['迁移宫', '迁移', '迁'],
  财帛宫: ['财帛宫', '财帛', '财'],
  官禄宫: ['官禄宫', '官禄', '事业宫', '事业'],
  夫妻宫: ['夫妻宫', '夫妻'],
  子女宫: ['子女宫', '子女'],
  福德宫: ['福德宫', '福德'],
  交友宫: ['交友宫', '交友', '仆役'],
  田宅宫: ['田宅宫', '田宅'],
} as const

type PalaceAliasKey = keyof typeof PALACE_ALIASES

type SihuaLetter = 'A' | 'B' | 'C' | 'D'

const LETTER_LABELS: Record<SihuaLetter, string> = {
  A: '禄',
  B: '权',
  C: '科',
  D: '忌',
}

const LETTER_PAIR: Record<SihuaLetter, SihuaLetter> = {
  A: 'D',
  D: 'A',
  B: 'C',
  C: 'B',
}

const FOCUS_HINTS: Record<ZiweiAiFocus, string> = {
  analysis: '请总览命盘结构，聚焦最强的两到三个格局亮点，并结合现实咨询场景提出落地建议。',
  destiny: '请重点解释命宫、迁移、财帛、官禄四宫之间的向心/离心自化与生年四化关系，说明“命运之箭”的力道与调节策略。',
  life: '请深挖命宫主星、宫位三方四正与对宫互动，描绘个性底色与职场、情感、健康的实用提醒。',
  peach_blossom: '请围绕命宫、夫妻宫、子女宫、迁移宫、福德宫的桃花星与四化互动，分析感情机遇、潜在风险与现实相处建议。',
  wealth: '请结合命、财、官、田、福等宫位与禄权科忌流向，解读财富来源、现金流动与资产沉淀策略，并提出风险管理建议。',
}

const ROLE_HINTS: Record<string, string> = {
  内宫: '内宫→资源易回流自身或家庭',
  外宫: '外宫→能量向外扩散，需控管流失',
  阳宫: '阳宫→主动拓展、执行节奏偏快',
  阴宫: '阴宫→宜守成蓄势或稳扎稳打',
  体宫: '体宫→财务体质与底盘',
  用宫: '用宫→财务应用与对外动线',
}

const WEALTH_FOCUS_PALACES = new Set(['命宫', '财帛宫', '官禄宫', '田宅宫', '福德宫', '疾厄宫'])

function pad(num: number | undefined): string {
  if (typeof num !== 'number' || Number.isNaN(num)) return '--'
  return num.toString().padStart(2, '0')
}

function normalizePalaceName(name?: string): string {
  if (!name) return ''
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.endsWith('宫') ? trimmed : `${trimmed}宫`
}

function tryGetPalaceByBranch(chart: ZiWeiHookChart, branch?: string): HookPalaceInfo | null {
  if (!branch) return null
  const candidate = (chart as any)[branch] as HookPalaceInfo | undefined
  if (candidate && typeof candidate === 'object') return candidate
  return null
}

function findPalace(chart: ZiWeiHookChart, target: PalaceAliasKey): { palace: HookPalaceInfo | null; branch: string | null } {
  if (target === '命宫') {
    const branch = (chart as any)['命宫'] as string | undefined
    const palace = tryGetPalaceByBranch(chart, branch)
    if (palace) return { palace, branch: branch ?? null }
  }

  for (const branch of BRANCH_NAMES) {
    const palace = (chart as any)[branch] as HookPalaceInfo | undefined
    if (!palace) continue
    const name = normalizePalaceName((palace as any).palaceName || branch)
    const plain = name.replace(/宫$/, '')
    if (PALACE_ALIASES[target].some((alias) => alias === name || alias === plain)) {
      return { palace, branch }
    }
  }
  return { palace: null, branch: null }
}

interface MarkerSummary {
  inward: Record<SihuaLetter, number>
  outward: Record<SihuaLetter, number>
  origin: Record<SihuaLetter, number>
}

function createEmptySummary(): MarkerSummary {
  return {
    inward: { A: 0, B: 0, C: 0, D: 0 },
    outward: { A: 0, B: 0, C: 0, D: 0 },
    origin: { A: 0, B: 0, C: 0, D: 0 },
  }
}

function collectMarkers(stars: HookStarInfo[]): MarkerSummary {
  const summary = createEmptySummary()
  for (const star of stars) {
    const types = Array.isArray(star?.type) ? star.type : []
    types.forEach((tag) => {
      if (/^i[ABCD]$/.test(tag)) {
        const key = tag.slice(1) as SihuaLetter
        summary.inward[key] += 1
      } else if (/^x[ABCD]$/.test(tag)) {
        const key = tag.slice(1) as SihuaLetter
        summary.outward[key] += 1
      } else if (/^[ABCD]$/.test(tag)) {
        const key = tag as SihuaLetter
        summary.origin[key] += 1
      }
    })
  }
  return summary
}

function formatMarkerSummary(summary: Record<SihuaLetter, number>, prefix: string): string {
  const parts: string[] = []
  const keys: SihuaLetter[] = ['A', 'B', 'C', 'D']
  for (const key of keys) {
    const count = summary[key]
    if (count > 0) parts.push(`${prefix}${key}×${count}`)
  }
  return parts.length ? parts.join('、') : '—'
}

function formatStar(star: HookStarInfo): string {
  const name = star?.name || '未知星曜'
  const brightness = star?.brightness || '平'
  const types = Array.isArray(star?.type) ? star.type : []
  const markers: string[] = []
  const origin = types.filter((tag) => /^[ABCD]$/.test(tag))
  const inward = types.filter((tag) => /^i[ABCD]$/.test(tag))
  const outward = types.filter((tag) => /^x[ABCD]$/.test(tag))
  if (origin.length) markers.push(...origin)
  if (inward.length) markers.push(...inward)
  if (outward.length) markers.push(...outward)
  const markerText = markers.length ? ` ${markers.join(' · ')}` : ''
  return `${name}(${brightness})${markerText}`
}

function formatStarGroup(stars: HookStarInfo[] | undefined): string {
  if (!stars || stars.length === 0) return '—'
  return stars.map(formatStar).join('；')
}

function toPalaceIdentifier(name?: string | null): PalaceIdentifier | null {
  if (!name) return null
  const normalized = normalizePalaceName(name)
  return (PALACE_ORDER.includes(normalized as PalaceIdentifier) ? normalized as PalaceIdentifier : null)
}

function mapRoleTags(tags: string[]): string {
  if (!tags.length) return '—'
  return tags
    .map((tag) => ROLE_HINTS[tag] || tag)
    .join(' / ')
}

function buildWealthStaticInsight(chart: ZiWeiHookChart): string[] {
  const input = buildWealthInputFromHook(chart)
  const analysis: WealthAnalysisResult = analyzeWealthStructure(input)
  const lines: string[] = []

  const roleLookup = new Map<PalaceIdentifier, string>()
  analysis.palaceRoles.forEach((role) => {
    if (WEALTH_FOCUS_PALACES.has(role.palace)) {
      roleLookup.set(role.palace, mapRoleTags(role.tags))
    }
  })

  const focusOrder: PalaceIdentifier[] = ['命宫', '财帛宫', '官禄宫', '田宅宫', '福德宫', '疾厄宫']
  focusOrder.forEach((palace) => {
    const summary = roleLookup.get(palace)
    if (summary) {
      lines.push(`- ${palace}：${summary}`)
    }
  })

  const comboLines = analysis.palaceCombinations
    .filter((combo) => WEALTH_FOCUS_PALACES.has(combo.palace))
    .slice(0, 4)
    .map((combo) => {
      const markerSummary = combo.markers.length ? `标记 ${combo.markers.join('/')}` : ''
      return `  · ${combo.palace}：${combo.combinations.join('；')}${markerSummary ? `（${markerSummary}）` : ''}`
    })

  if (comboLines.length) {
    lines.push('- 四化结构提示：')
    lines.push(...comboLines)
  }

  return lines.length ? lines : ['- 暂未解析到核心财富宫位信息']
}

function computeAge(birth?: HookBirthInfo): number | null {
  if (!birth || typeof birth.year !== 'number') return null
  const month = typeof birth.month === 'number' ? birth.month : 1
  const day = typeof birth.day === 'number' ? birth.day : 1
  const birthDate = new Date(Date.UTC(birth.year, Math.max(0, month - 1), Math.max(1, day)))
  if (Number.isNaN(birthDate.getTime())) return null
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear()
  const beforeBirthday =
    today.getUTCMonth() < birthDate.getUTCMonth() ||
    (today.getUTCMonth() === birthDate.getUTCMonth() && today.getUTCDate() < birthDate.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

interface PeriodEntry {
  period: number
  palace: HookPalaceInfo
  branch: string
}

function collectPeriodEntries(chart: ZiWeiHookChart): PeriodEntry[] {
  const entries: PeriodEntry[] = []
  for (const branch of BRANCH_NAMES) {
    const palace = (chart as any)[branch] as HookPalaceInfo | undefined
    if (!palace?.majorPeriod) continue
    entries.push({ period: palace.majorPeriod.period, palace, branch })
  }
  return entries.sort((a, b) => a.period - b.period)
}

function findPeriodEntry(chart: ZiWeiHookChart, period: number): PeriodEntry | null {
  const entries = collectPeriodEntries(chart)
  return entries.find((entry) => entry.period === period) ?? null
}

function resolveActivePeriod(chart: ZiWeiHookChart): PeriodEntry | null {
  const entries = collectPeriodEntries(chart)
  if (!entries.length) return null
  const age = computeAge(chart.birthInfo)
  if (age !== null && age !== undefined) {
    const match = entries.find((entry) => {
      const startAge = entry.palace.majorPeriod?.startAge
      const endAge = entry.palace.majorPeriod?.endAge
      return typeof startAge === 'number' && typeof endAge === 'number' && age >= startAge && age <= endAge
    })
    if (match) return match
  }
  return entries[0]
}

interface LandingInfo {
  palaceName: string
  branch: string
  star: string
  hostMainStars: string
}

function gatherPalaceStars(palace: HookPalaceInfo | undefined): HookStarInfo[] {
  if (!palace) return []
  return [
    ...(((palace as any)['mainStars&sihuaStars'] as HookStarInfo[]) || []),
    ...(((palace as any)['auxiliaryStars&sihuaStars'] as HookStarInfo[]) || []),
    ...(((palace as any).minorStars as HookStarInfo[]) || []),
  ]
}

function findStarLanding(chart: ZiWeiHookChart, starName: string): LandingInfo | null {
  if (!starName) return null
  for (const branch of BRANCH_NAMES) {
    const palace = (chart as any)[branch] as HookPalaceInfo | undefined
    if (!palace) continue
    const allStars = gatherPalaceStars(palace)
    const match = allStars.find((item) => item.name === starName)
    if (match) {
      const palaceName = normalizePalaceName((palace as any).palaceName || branch)
      const hostMainStars = formatStarGroup((palace as any)['mainStars&sihuaStars'] as HookStarInfo[] | undefined)
      return {
        palaceName,
        branch,
        star: formatStar(match),
        hostMainStars,
      }
    }
  }
  return null
}

interface TransformSummary {
  text: string
  target: PalaceIdentifier | null
}

function summarizeTransform(letter: 'A' | 'B' | 'C' | 'D', starName: string, landing: LandingInfo | null): TransformSummary {
  if (!starName) {
    return { text: `${letter}：当前天干未提供对应星曜。`, target: null }
  }
  if (!landing) {
    return { text: `${letter}（${starName}）：暂未找到落点，可人工复核流运。`, target: null }
  }
  const target = toPalaceIdentifier(landing.palaceName)
  const hostSuffix = landing.hostMainStars && landing.hostMainStars !== '—' ? `｜主星 ${landing.hostMainStars}` : ''
  const text = `${letter}（${starName}）→ ${landing.palaceName} · ${landing.branch}宫（触发星：${landing.star}${hostSuffix}）`
  return { text, target }
}

function formatPeriodLabel(entry: PeriodEntry | null): string {
  if (!entry) return '未知大运'
  const palaceName = normalizePalaceName((entry.palace as any).palaceName || entry.branch)
  const startAge = entry.palace.majorPeriod?.startAge
  const endAge = entry.palace.majorPeriod?.endAge
  const ageRange = typeof startAge === 'number' && typeof endAge === 'number'
    ? ` ｜ ${startAge}-${endAge} 岁`
    : ''
  return `第${entry.period}运 ${palaceName} · ${entry.branch}宫${ageRange}`
}

function buildWealthDynamicInsight(chart: ZiWeiHookChart): string[] {
  const lines: string[] = []
  const currentPeriod = resolveActivePeriod(chart)
  if (!currentPeriod) return ['- 暂未匹配到大运区间，建议补全出生信息。']

  const wealthPeriodNumber = ((currentPeriod.period + 4 - 1) % 12) + 1
  const wealthPeriod = findPeriodEntry(chart, wealthPeriodNumber)
  if (!wealthPeriod) {
    return [
      `- 当前参考大运：${formatPeriodLabel(currentPeriod)}`,
      '- 暂未找到对应的大运财帛宫。',
    ]
  }

  const wealthStem = wealthPeriod.palace.stem || '—'
  const wealthMainStars = formatStarGroup((wealthPeriod.palace as any)['mainStars&sihuaStars'] as HookStarInfo[] | undefined)
  const headerLine = `- 当前参考大运：${formatPeriodLabel(currentPeriod)}`
  const wealthLine = `- 大运财帛：${formatPeriodLabel(wealthPeriod)} ｜ 天干 ${wealthStem} ｜ 主星 ${wealthMainStars}`

  const sihua = wealthStem ? FLYING_PALACE_SIHUA[wealthStem] : undefined
  if (!sihua) {
    return [
      headerLine,
      wealthLine,
      '- 当前天干未检索到飞化四象，需人工复核。',
    ]
  }

  const landingA = summarizeTransform('A', sihua.A, findStarLanding(chart, sihua.A))
  const landingB = summarizeTransform('B', sihua.B, findStarLanding(chart, sihua.B))
  const landingC = summarizeTransform('C', sihua.C, findStarLanding(chart, sihua.C))
  const landingD = summarizeTransform('D', sihua.D, findStarLanding(chart, sihua.D))

  const financeVerdict = landingD.target
    ? PERIOD_FINANCE_TABLE.find((entry) => entry.target === landingD.target)?.conclusion ?? null
    : null

  const resultLines = [
    headerLine,
    wealthLine,
    `- 禄源：${landingA.text}`,
    `- 权介：${landingB.text}`,
    `- 科衡：${landingC.text}`,
    `- 忌落：${landingD.text}`,
  ]

  if (financeVerdict) {
    resultLines.push(`  · 忌象提示：${financeVerdict}`)
  }

  resultLines.push('- 提示：禄=来龙，权=媒介，科=调和，忌=去脉，可据此判断现金流进出与风险。')
  return resultLines
}

function describeLetter(letter: SihuaLetter): string {
  return `${LETTER_LABELS[letter]}(${letter})`
}

function listPalaceStars(palace: HookPalaceInfo | null): HookStarInfo[] {
  if (!palace) return []
  return [
    ...(((palace as any)['mainStars&sihuaStars'] as HookStarInfo[]) || []),
    ...(((palace as any)['auxiliaryStars&sihuaStars'] as HookStarInfo[]) || []),
    ...(((palace as any).minorStars as HookStarInfo[]) || []),
  ]
}

interface PalaceBlock {
  text: string
  markers: MarkerSummary
  hasData: boolean
  label: string
  branch: string | null
  rawName: string
}

function buildPalaceBlock(label: string, emoji: string, info: { palace: HookPalaceInfo | null; branch: string | null }): PalaceBlock {
  const palace = info.palace
  if (!palace) {
    return {
      text: `${emoji} ${label}：暂无数据`,
      markers: createEmptySummary(),
      hasData: false,
      label,
      branch: info.branch,
      rawName: label,
    }
  }
  const branch = palace.branch || info.branch || ''
  const stem = (palace as any).stem || '—'
  const mainStars = formatStarGroup((palace as any)['mainStars&sihuaStars'] as HookStarInfo[] | undefined)
  const auxiliaryStars = formatStarGroup((palace as any)['auxiliaryStars&sihuaStars'] as HookStarInfo[] | undefined)
  const minorStars = formatStarGroup((palace as any).minorStars as HookStarInfo[] | undefined)
  const combinedStars = listPalaceStars(palace)
  const markers = collectMarkers(combinedStars)
  const inward = formatMarkerSummary(markers.inward, 'i')
  const outward = formatMarkerSummary(markers.outward, 'x')
  const origin = formatMarkerSummary(markers.origin, '')
  const text = [
    `${emoji} ${label}：${branch || '未知'}宫 / 天干 ${stem}`,
    `  · 主星：${mainStars}`,
    `  · 辅星：${auxiliaryStars}`,
    `  · 杂耀：${minorStars}`,
    `  · 向心(i)：${inward}`,
    `  · 离心(x)：${outward}`,
    `  · 生年四化：${origin}`,
  ].join('\n')
  const rawName = normalizePalaceName((palace as any).palaceName || label)
  return {
    text,
    markers,
    hasData: true,
    label,
    branch,
    rawName,
  }
}

function genderLabel(gender?: string): string {
  if (!gender) return '未知'
  if (gender === 'male') return '男'
  if (gender === 'female') return '女'
  return gender
}

function gatherAllPalaceMarkers(chart: ZiWeiHookChart): Array<{ name: string; markers: MarkerSummary }> {
  const result: Array<{ name: string; markers: MarkerSummary }> = []
  for (const branch of BRANCH_NAMES) {
    const palace = (chart as any)[branch] as HookPalaceInfo | undefined
    if (!palace) continue
    const name = normalizePalaceName((palace as any).palaceName || branch)
    const markers = collectMarkers(listPalaceStars(palace))
    result.push({ name, markers })
  }
  return result
}

function analyzeSquareBreak(
  target: PalaceBlock,
  globalMarkers: Array<{ name: string; markers: MarkerSummary }>,
): string[] {
  const reasons: string[] = []
  const targetLetters = (['A', 'B', 'C', 'D'] as SihuaLetter[]).filter((letter) => target.markers.origin[letter] > 0)
  if (!targetLetters.length) return reasons

  for (const letter of targetLetters) {
    if (target.markers.outward[letter] > 0) {
      reasons.push(
        `${target.label}检测到 ${describeLetter(letter)} 与 x${letter} 同宫，自激易致“平方破象”，关系推进需留意反复。`,
      )
    }

    const partner = LETTER_PAIR[letter]
    const impactedPalaces = globalMarkers
      .filter((entry) => entry.name !== target.rawName)
      .filter((entry) => entry.markers.origin[partner] > 0 && entry.markers.outward[partner] > 0)
      .map((entry) => entry.name)

    if (impactedPalaces.length) {
      const palaceList = impactedPalaces.join('/')
      reasons.push(
        `由于 ${palaceList} 出现 ${describeLetter(partner)} + x${partner}，牵动 ${target.label} 的 ${describeLetter(letter)}，可能出现“有终化无”体验。`,
      )
    }
  }

  return reasons
}

export function buildZiweiAgentQuery(chart: ZiWeiHookChart, options: BuildQueryOptions = {}): string {
  const birthInfo = (chart as any)?.birthInfo as { year?: number; month?: number; day?: number; hour?: number; gender?: string; yearStem?: string; yearBranch?: string } | undefined
  const year = birthInfo?.year
  const month = birthInfo?.month
  const day = birthInfo?.day
  const hour = birthInfo?.hour
  const gender = genderLabel(birthInfo?.gender)
  const birthLine = year
    ? `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:00`
    : '未提供'

  const focusHint = options.focus ? FOCUS_HINTS[options.focus] : ''

  const lines: string[] = []
  lines.push('🔧 Prompt结构分解')
  lines.push('')
  lines.push('1. 基础信息')
  lines.push(`- 出生时间（公历）：${birthLine}`)
  if (birthInfo?.yearStem || birthInfo?.yearBranch) {
    lines.push(`- 生年干支：${(birthInfo?.yearStem || '')}${(birthInfo?.yearBranch || '')}`)
  }
  lines.push(`- 性别：${gender}`)
  lines.push('')

  let sectionIndex = 2

  if (options.focus === 'peach_blossom') {
    const couple = buildPalaceBlock('夫妻宫', '💞', findPalace(chart, '夫妻宫'))
    const children = buildPalaceBlock('子女宫', '👶', findPalace(chart, '子女宫'))
    const travel = buildPalaceBlock('迁移宫', '✈️', findPalace(chart, '迁移宫'))
    const fude = buildPalaceBlock('福德宫', '🪄', findPalace(chart, '福德宫'))
    const friends = buildPalaceBlock('交友宫', '🤝', findPalace(chart, '交友宫'))

    lines.push(`${sectionIndex}. 桃花关键宫位`)
    lines.push(couple.text)
    lines.push(children.text)
    lines.push(travel.text)
    lines.push(fude.text)
    lines.push(friends.text)
    sectionIndex += 1

    const globalMarkers = gatherAllPalaceMarkers(chart)
    const squareBreakReasons = [
      ...analyzeSquareBreak(couple, globalMarkers),
      ...analyzeSquareBreak(children, globalMarkers),
    ]

    lines.push('')
    lines.push(`${sectionIndex}. 桃花破象检视`)
    if (squareBreakReasons.length) {
      squareBreakReasons.forEach((reason) => lines.push(`- ${reason}`))
    } else {
      lines.push('- 未检测到平方破象或“有终化无”的明显征兆，可专注关系增温。')
    }
    sectionIndex += 1
    lines.push('')
  } else if (options.focus === 'wealth') {
    lines.push(`${sectionIndex}. 先天财务体质`)
    buildWealthStaticInsight(chart).forEach((line) => lines.push(line))
    sectionIndex += 1
    lines.push('')

    lines.push(`${sectionIndex}. 大财飞宫脉络`)
    buildWealthDynamicInsight(chart).forEach((line) => lines.push(line))
    sectionIndex += 1
    lines.push('')
  } else {
    const life = buildPalaceBlock('命宫', '🎯', findPalace(chart, '命宫'))
    const travel = buildPalaceBlock('迁移宫', '🏹', findPalace(chart, '迁移宫'))
    const wealth = buildPalaceBlock('财帛宫', '💰', findPalace(chart, '财帛宫'))
    const career = buildPalaceBlock('官禄宫', '🎖️', findPalace(chart, '官禄宫'))

    lines.push(`${sectionIndex}. 命运之箭四宫配置`)
    lines.push(life.text)
    lines.push(travel.text)
    lines.push(wealth.text)
    lines.push(career.text)
    sectionIndex += 1
    lines.push('')
  }

  lines.push(`${sectionIndex}. 星曜信息格式`)
  lines.push('- 星曜均以“名称(亮度)”呈现，若存在向心/离心或生年四化标记，会附加如 iA、xB、C 等代码。')
  lines.push('- 当列表返回“—”时表示该类别暂无星曜或未检测到对应标记。')
  lines.push('- 统计行中 i*/x*/A-D 代表向心、自化与生年四化次数，便于判断箭头强弱。')
  lines.push('')
  sectionIndex += 1
  lines.push(`${sectionIndex}. 分析指导原则`)
  lines.push('- 四化代码：A=禄、B=权、C=科、D=忌；前缀 i 表示向心自化，x 表示离心自化，无前缀表示生年四化。')
  lines.push('- 向心(i*)通常强化本宫自我驱动力；离心(x*)提示能量外泄；生年四化反映原生课题与稳定资源。')
  lines.push('- 请结合三方四正、对宫呼应与四化流向，提炼 2-3 个最关键的格局亮点或风险。')
  lines.push('- 建议落地到事业、财务、关系、健康等现代情境，语气亲切自然，并在结尾给出温和鼓励。')
  if (focusHint) {
    lines.push(`- 解读聚焦：${focusHint}`)
  }

  return lines.join('\n')
}
