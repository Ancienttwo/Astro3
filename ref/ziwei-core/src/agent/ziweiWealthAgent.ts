import type { ZiWeiHookChart, HookPalaceInfo, HookStarInfo, HookBirthInfo } from '../types/hook-format-types'
import { BRANCH_NAMES } from '../types/hook-format-types'
import {
  analyzeWealthStructure,
  buildWealthInputFromHook,
  PALACE_ORDER,
  type PalaceIdentifier,
} from '../analysis/wealth'
import { FLYING_PALACE_SIHUA } from '../constants/master-stars'
import { PERIOD_FINANCE_TABLE, FLOW_ROUTES } from '../analysis/fortune-rules'

const WEALTH_FOCUS_PALACES = new Set<PalaceIdentifier>(['命宫', '财帛宫', '官禄宫', '田宅宫', '福德宫', '疾厄宫'])

const ROLE_HINTS: Record<string, string> = {
  内宫: '内宫→资源回流自我或家庭',
  外宫: '外宫→能量向外扩散，需控管流失',
  阳宫: '阳宫→主动拓展、执行节奏偏快',
  阴宫: '阴宫→宜守成蓄势或稳扎稳打',
  体宫: '体宫→财富体质与底盘',
  用宫: '用宫→财富应用与对外动线',
}

interface WealthPromptOptions {
  targetChars?: number
}

interface PeriodEntry {
  period: number
  palace: HookPalaceInfo
  branch: string
}

interface LandingInfo {
  palaceName: string
  branch: string
  star: string
  hostMainStars: string
}

interface TransformSummary {
  text: string
  target: PalaceIdentifier | null
}

type SihuaLetter = 'A' | 'B' | 'C' | 'D'

const LETTER_LABEL: Record<SihuaLetter, string> = { A: '禄', B: '权', C: '科', D: '忌' }

function clampTargetChars(val?: number): number {
  if (!val) return 1500
  const rounded = Math.round(val)
  return Math.min(1800, Math.max(1200, rounded))
}

function normalizePalaceName(name?: string): string {
  if (!name) return ''
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.endsWith('宫') ? trimmed : `${trimmed}宫`
}

function toPalaceIdentifier(name?: string | null): PalaceIdentifier | null {
  if (!name) return null
  const normalized = normalizePalaceName(name)
  return PALACE_ORDER.includes(normalized as PalaceIdentifier) ? (normalized as PalaceIdentifier) : null
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

function collectPeriodEntries(chart: ZiWeiHookChart): PeriodEntry[] {
  const entries: PeriodEntry[] = []
  for (const branch of BRANCH_NAMES) {
    const palace = (chart as any)[branch] as HookPalaceInfo | undefined
    if (!palace?.majorPeriod) continue
    entries.push({ period: palace.majorPeriod.period, palace, branch })
  }
  return entries.sort((a, b) => a.period - b.period)
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

function findPeriodEntry(chart: ZiWeiHookChart, period: number): PeriodEntry | null {
  return collectPeriodEntries(chart).find((entry) => entry.period === period) ?? null
}

function gatherPalaceStars(palace: HookPalaceInfo | undefined): HookStarInfo[] {
  if (!palace) return []
  return [
    ...(((palace as any)['mainStars&sihuaStars'] as HookStarInfo[]) || []),
    ...(((palace as any)['auxiliaryStars&sihuaStars'] as HookStarInfo[]) || []),
    ...(((palace as any).minorStars as HookStarInfo[]) || []),
  ]
}

function formatStar(star: HookStarInfo): string {
  const name = star?.name || '未知星曜'
  const brightness = star?.brightness || '平'
  const types = Array.isArray(star?.type) ? star.type : []
  const markers = types.join(' · ')
  return markers ? `${name}(${brightness}) ${markers}` : `${name}(${brightness})`
}

function findStarLanding(chart: ZiWeiHookChart, starName: string): LandingInfo | null {
  if (!starName) return null
  for (const branch of BRANCH_NAMES) {
    const palace = (chart as any)[branch] as HookPalaceInfo | undefined
    if (!palace) continue
    const allStars = gatherPalaceStars(palace)
    const match = allStars.find((item) => item.name === starName)
    if (!match) continue
    const palaceName = normalizePalaceName((palace as any).palaceName || branch)
    const hostMainStars = ((palace as any)['mainStars&sihuaStars'] as HookStarInfo[] | undefined) || []
    return {
      palaceName,
      branch,
      star: formatStar(match),
      hostMainStars: hostMainStars.length ? hostMainStars.map(formatStar).join('；') : '—',
    }
  }
  return null
}

function summarizeTransform(letter: SihuaLetter, starName: string, landing: LandingInfo | null): TransformSummary {
  if (!starName) {
    return { text: `${LETTER_LABEL[letter]}(${letter})：当前天干未检索到对应星曜。`, target: null }
  }
  if (!landing) {
    return {
      text: `${LETTER_LABEL[letter]}(${letter})（${starName}）：暂未在命盘中找到落点，建议人工复核大运/流年。`,
      target: null,
    }
  }
  const target = toPalaceIdentifier(landing.palaceName)
  const hostSuffix = landing.hostMainStars && landing.hostMainStars !== '—' ? `｜所在宫主星 ${landing.hostMainStars}` : ''
  const text = `${LETTER_LABEL[letter]}(${letter})（${starName}）→ ${landing.palaceName} · ${landing.branch}宫（触发星：${landing.star}${hostSuffix}）`
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

function mapRoleTags(tags: string[]): string {
  if (!tags.length) return '—'
  return tags.map((tag) => ROLE_HINTS[tag] || tag).join(' / ')
}

function summarizePalaceMainStars(chart: ZiWeiHookChart, palace: PalaceIdentifier): string {
  const index = PALACE_ORDER.indexOf(palace)
  if (index < 0) return ''
  const branchKey = BRANCH_NAMES[index] as keyof ZiWeiHookChart
  const palaceInfo = chart[branchKey] as HookPalaceInfo | undefined
  if (!palaceInfo || typeof palaceInfo !== 'object') return ''
  const mainStars = (palaceInfo['mainStars&sihuaStars'] as HookStarInfo[] | undefined) ?? []
  const labels = mainStars
    .map((star) => {
      if (!star?.name) return ''
      const brightness = star.brightness && star.brightness !== '平' ? `(${star.brightness})` : ''
      return `${star.name}${brightness}`
    })
    .filter((value) => Boolean(value))
  if (!labels.length) return ''
  return labels.slice(0, 4).join('、')
}

function buildStaticInsights(chart: ZiWeiHookChart): string[] {
  const input = buildWealthInputFromHook(chart)
  const analysis = analyzeWealthStructure(input)
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
    if (!summary) return
    const starSummary = summarizePalaceMainStars(chart, palace)
    const suffix = starSummary ? ` ｜ 主星 ${starSummary}` : ''
    lines.push(`- ${palace}：${summary}${suffix}`)
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

  return lines.length ? lines : ['- 暂未解析到核心财富宫位信息。']
}

function buildDynamicInsights(chart: ZiWeiHookChart): string[] {
  const lines: string[] = []
  const currentPeriod = resolveActivePeriod(chart)
  if (!currentPeriod) return ['- 暂未匹配到当前大运区间，建议补全出生时间。']

  const wealthPeriodNumber = ((currentPeriod.period + 4 - 1) % 12) + 1
  const wealthPeriod = findPeriodEntry(chart, wealthPeriodNumber)
  if (!wealthPeriod) {
    return [
      `- 当前参考大运：${formatPeriodLabel(currentPeriod)}`,
      '- 未找到对应的大运财帛宫。',
    ]
  }

  const wealthStem = wealthPeriod.palace.stem || '—'
  const wealthMainStars = ((wealthPeriod.palace as any)['mainStars&sihuaStars'] as HookStarInfo[] | undefined) || []
  const mainStarsText = wealthMainStars.length ? wealthMainStars.map(formatStar).join('；') : '—'

  const header = `- 当前参考大运：${formatPeriodLabel(currentPeriod)}`
  const wealthLine = `- 大运财帛：${formatPeriodLabel(wealthPeriod)} ｜ 天干 ${wealthStem} ｜ 主星 ${mainStarsText}`

  const sihua = wealthStem ? FLYING_PALACE_SIHUA[wealthStem] : undefined
  if (!sihua) {
    return [header, wealthLine, '- 未检索到当前天干的飞化四象。']
  }

  const landingA = summarizeTransform('A', sihua.A, findStarLanding(chart, sihua.A))
  const landingB = summarizeTransform('B', sihua.B, findStarLanding(chart, sihua.B))
  const landingC = summarizeTransform('C', sihua.C, findStarLanding(chart, sihua.C))
  const landingD = summarizeTransform('D', sihua.D, findStarLanding(chart, sihua.D))

  const financeVerdict = landingD.target
    ? PERIOD_FINANCE_TABLE.find((row) => row.target === landingD.target)?.conclusion ?? null
    : null

  const result = [
    header,
    wealthLine,
    `- 禄源：${landingA.text}`,
    `- 权介：${landingB.text}`,
    `- 科衡：${landingC.text}`,
    `- 忌落：${landingD.text}`,
  ]

  if (financeVerdict) {
    result.push(`  · 忌象提示：${financeVerdict}`)
  }

  result.push('- 提示：禄=来龙，权=媒介，科=调和，忌=去脉，可据此推演现金流进出与风险节奏。')
  result.push(`- ${FLOW_ROUTES.source}`)
  result.push(`- ${FLOW_ROUTES.sink}`)
  result.push(`- ${FLOW_ROUTES.medium}`)
  result.push(`- ${FLOW_ROUTES.harmonizer}`)
  return result
}

export function buildZiweiWealthAgentPrompt(chart: ZiWeiHookChart, options: WealthPromptOptions = {}): string {
  const targetChars = clampTargetChars(options.targetChars)
  const staticInsights = buildStaticInsights(chart).join('\n')
  const dynamicInsights = buildDynamicInsights(chart).join('\n')

  const lines: string[] = []
  lines.push('### 核心身份')
  lines.push('你是紫微斗数领域的财富规划师，擅长把传统命理转化为现代财务策略。语气需温和务实，兼具专业与陪伴感。')
  lines.push('')
  lines.push('### 写作结构（请严格依序输出，使用自然段落）')
  lines.push('1. 《先天格局》：描述命、财、官、田、福、疾的财富体质，点明体用、聚散与禄权科忌结构。')
  lines.push('2. 《大运飞化》：根据当下大运财帛与飞禄权科忌落点，分析现金流方向、杠杆与潜在阻力。')
  lines.push('3. 《行动建议》：提出 3 条以内的执行建议，涵盖现金流管理、投资/职业策略与风险缓冲，务必结合上述洞察。')
  lines.push('')
  lines.push('### 输出要求')
  lines.push(`- 全文长度必须 ≥${targetChars} 字，如未达标须继续补写直至满足；理想在 ${Math.min(targetChars + 200, 1700)} 字左右。`)
  lines.push('- 《先天格局》《大运飞化》《行动建议》三部分各需至少 3 个自然段，每段不少于 4 句，并用首句点明主旨。')
  lines.push('- 避免使用项目符号或编号列表，统一以连贯段落呈现。')
  lines.push('- 每遇命理术语先说明含义，再连结到现实情境。')
  lines.push('- 指出可能的风险节点或需要补充资料的盲区，给出温和提醒。')
  lines.push('- 结尾加入一句正向鼓励，避免绝对化断语或夸大收益。')
  lines.push('')
  lines.push('### 先天财富体质梳理')
  lines.push(staticInsights)
  lines.push('')
  lines.push('### 大运财帛飞化脉络')
  lines.push(dynamicInsights)

  return lines.join('\n')
}

export default buildZiweiWealthAgentPrompt
