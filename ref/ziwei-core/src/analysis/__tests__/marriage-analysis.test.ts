import { analyzeMarriageFromHook } from '../marriage-analysis'
import type { HookPalaceInfo, HookStarInfo, ZiWeiHookChart } from '../../types/hook-format-types'
import { BRANCH_NAMES } from '../../types/hook-format-types'
import { PALACE_ORDER, type PalaceIdentifier } from '../wealth'

function createStar(name: string, markers: string[] = []): HookStarInfo {
  return { name, brightness: '平', type: markers }
}

function createPalace(branch: string, branchIndex: number, palaceName: PalaceIdentifier, stars: HookStarInfo[]): HookPalaceInfo {
  const ages = Array.from({ length: 10 }, (_, idx) => 5 + idx * 12)
  return {
    branch,
    branchIndex,
    stem: '甲',
    palaceName,
    'mainStars&sihuaStars': stars,
    'auxiliaryStars&sihuaStars': [],
    minorStars: [],
    fleetingYears: ages,
    majorPeriod: {
      period: branchIndex + 1,
      startAge: ages[0] ?? 5,
      endAge: (ages[0] ?? 5) + 9,
      startYear: 2000 + branchIndex * 10,
      endYear: 2000 + branchIndex * 10 + 9,
    },
    minorPeriod: ages,
  }
}

function createTestChart(overrides: Partial<Record<PalaceIdentifier, HookStarInfo[]>>): ZiWeiHookChart {
  const chart: Partial<ZiWeiHookChart> = {
    birthInfo: {
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      gender: 'female',
      isLunar: false,
      yearStem: '庚',
      yearBranch: '午',
      yearGanzhi: '庚午',
      monthLunar: 11,
      dayLunar: 15,
      hourBranch: 6,
      isLeapMonth: false,
    },
    八字: '庚午 戊子 甲子 辛未',
    八字起运: '1岁2个月上运',
    八字大运: '己丑 庚寅 辛卯 壬辰',
    命主: '贪狼',
    身主: '太阴',
    斗君: '寅',
    五行局: { name: '水二局', 局数: '2' },
  }

  const palaceToBranch = new Map<PalaceIdentifier, string>()

  BRANCH_NAMES.forEach((branch, index) => {
    const palaceName = PALACE_ORDER[index]
    const stars = overrides[palaceName] ?? []
    const palaceInfo = createPalace(branch, index, palaceName, stars)
    ;(chart as any)[branch] = palaceInfo
    palaceToBranch.set(palaceName, branch)
  })

  chart.命宫 = palaceToBranch.get('命宫') ?? '子'
  chart.身宫 = palaceToBranch.get('田宅宫') ?? '戌'
  chart.来因宫 = '夫妻宫'
  chart.generatedAt = new Date().toISOString()
  chart.version = 'test'

  return chart as ZiWeiHookChart
}

describe('analyzeMarriageFromHook', () => {
  it('produces風險警示與正向提示', () => {
    const chart = createTestChart({
      命宫: [createStar('紫微', ['A', 'D'])],
      夫妻宫: [createStar('贪狼', ['A', 'C']), createStar('左辅')],
      财帛宫: [createStar('文昌', ['C']), createStar('廉贞', ['D'])],
      交友宫: [createStar('右弼'), createStar('化科', ['xD'])],
    })

    const result = analyzeMarriageFromHook(chart)

    expect(result.meta.palaceIndexMap[1]).toBe('命宫')
    expect(result.meta.letterMeanings.A).toContain('缘起')

    const risk = result.riskFindings.find((item) => item.rule === '命宫-AD')
    expect(risk).toBeDefined()
    expect(risk?.severity).toBe('high')

    const positive = result.positiveHighlights.find(
      (item) => item.palace === '夫妻宫' && item.combination === 'AC',
    )
    expect(positive).toBeDefined()
    expect(positive?.summary).toContain('良性桃花')

    const nobleRisk = result.riskFindings.find((item) => item.rule === '贵人星干扰')
    expect(nobleRisk).toBeDefined()
  })
})
