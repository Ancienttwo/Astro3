import type { BasicChartResult } from '../chart/types'
import type { TenGodHiddenItem } from './yongshenToolkit'
import { deriveYongshenInput } from './yongshenAgent'
import { relationsToStructuralFactors } from './yongshenToolkit'

const PILLAR_LABELS: Record<'year' | 'month' | 'day' | 'hour', { label: string; palace: string }> = {
  year: { label: '年柱', palace: '父母宫' },
  month: { label: '月柱', palace: '兄弟宫/事业根基' },
  day: { label: '日柱', palace: '夫妻宫' },
  hour: { label: '时柱', palace: '子女宫/晚运' },
}

function formatHiddenList(list: TenGodHiddenItem[] | undefined): string {
  if (!list?.length) return ''
  return list
    .map((item) => `${item.stem}${item.god ?? ''}${typeof item.weight === 'number' ? `(${item.weight.toFixed(1)})` : ''}`)
    .join('、')
}

function formatStructuralLines(structural: ReturnType<typeof relationsToStructuralFactors>): string[] {
  if (!structural) return []
  const result: string[] = []
  if (structural.stems_he?.length) result.push(`干合：${structural.stems_he.join('；')}`)
  if (structural.branches_chong?.length) result.push(`地支冲：${structural.branches_chong.join('；')}`)
  if (structural.branches_xing?.length) result.push(`地支刑：${structural.branches_xing.join('；')}`)
  if (structural.branches_pohai?.length) result.push(`破害：${structural.branches_pohai.join('；')}`)
  if (structural.sanhe?.length) result.push(`三合：${structural.sanhe.join('；')}`)
  if (structural.liuhe?.length) result.push(`六合：${structural.liuhe.join('；')}`)
  if (structural.banhe?.length) result.push(`半合：${structural.banhe.join('；')}`)
  if (structural.hui?.length) result.push(`会局：${structural.hui.join('；')}`)
  if (structural.lu_mu_ku?.length) result.push(`禄库：${structural.lu_mu_ku.join('；')}`)
  return result
}

function summariseShenSha(raw: BasicChartResult['shenSha']): string[] {
  if (!raw) return []
  const lines: string[] = []
  const anyResult = raw as any

  const importantList: any[] | undefined = Array.isArray(anyResult?.important) ? anyResult.important : undefined
  if (importantList?.length) {
    const names = importantList
      .map((item) => item?.info?.name || item?.detection?.name)
      .filter(Boolean)
    if (names.length) lines.push(`重要神煞：${Array.from(new Set(names)).join('、')}`)
  }

  const byGroup = anyResult?.byGroup
  if (byGroup && typeof byGroup === 'object') {
    const groupSummaries: string[] = []
    for (const [group, arr] of Object.entries(byGroup)) {
      if (!Array.isArray(arr) || !arr.length) continue
      const names = Array.from(new Set(arr.map((item: any) => item?.info?.name || item?.detection?.name).filter(Boolean)))
      if (names.length) groupSummaries.push(`${group}: ${names.join('、')}`)
    }
    if (groupSummaries.length) lines.push(`分组提示：${groupSummaries.join('；')}`)
  }

  const summary = anyResult?.overallAnalysis?.summary
  if (typeof summary === 'string' && summary.trim()) lines.push(`整体观：${summary.trim()}`)
  return lines
}

export function buildTiekouAgentQuery(chart: BasicChartResult): string {
  const input = deriveYongshenInput(chart)
  const structural = relationsToStructuralFactors(input.relations)

  const hiddenMap = new Map<string, TenGodHiddenItem[]>()
  input.ten_gods.by_hidden?.forEach((item) => {
    const arr = hiddenMap.get(item.host) || []
    arr.push(item)
    hiddenMap.set(item.host, arr)
  })

  const pillarLines = (['year', 'month', 'day', 'hour'] as const).map((slot) => {
    const pillar = input.pillars[slot]
    const meta = PILLAR_LABELS[slot]
    const stem = pillar?.stem ?? ''
    const branch = pillar?.branch ?? ''
    const stemGod = input.ten_gods.by_stem?.[stem]
    const hidden = formatHiddenList(hiddenMap.get(branch))
    const hiddenText = hidden ? ` | 藏干：${hidden}` : ''
    return `${meta.label}（${meta.palace}）：${stem}${branch}${stemGod ? `（${stemGod}）` : ''}${hiddenText}`
  })

  const tenGodTop = Object.entries(input.ten_gods.by_stem || {})
    .filter(([stem]) => stem !== input.ten_gods.day_master)
    .map(([stem, god]) => `${stem}${god}`)

  const tenGodHidden = Array.from(hiddenMap.values())
    .flat()
    .map((item) => `${item.host}:${item.stem}${item.god ?? ''}${typeof item.weight === 'number' ? `(${item.weight.toFixed(1)})` : ''}`)

  const structuralLines = formatStructuralLines(structural)
  const shenShaLines = summariseShenSha(chart.shenSha)

  const lines: string[] = []
  lines.push('【八字原局】')
  lines.push(...pillarLines)
  lines.push(`【日主】${input.ten_gods.day_master}`)
  if (tenGodTop.length) lines.push(`【十神透干】${tenGodTop.join('、')}`)
  if (tenGodHidden.length) lines.push(`【十神藏干】${tenGodHidden.join('；')}`)
  if (structuralLines.length) {
    lines.push('【结构特征】')
    lines.push(...structuralLines)
  }
  if (shenShaLines.length) {
    lines.push('【神煞提示】')
    lines.push(...shenShaLines)
  }
  lines.push('【命主背景】')
  lines.push(`性别：${chart.input.gender === 'female' ? '女命' : '男命'}；历法：${chart.input.isLunar ? '农历' : '公历'}；出生地：${chart.input.location?.name ?? '未提供'}`)
  return lines.filter(Boolean).join('\n')
}

