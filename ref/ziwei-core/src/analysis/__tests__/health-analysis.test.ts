import { analyzeHealthFromHook } from '../health-analysis'
import type { HookPalaceInfo, HookStarInfo, ZiWeiHookChart } from '../../types/hook-format-types'
import { BRANCH_NAMES } from '../../types/hook-format-types'
import { PALACE_ORDER, type PalaceIdentifier } from '../wealth'

function createStar(name: string, markers: string[] = []): HookStarInfo {
  return {
    name,
    brightness: '平',
    type: markers,
  }
}

function createPalace(branch: string, branchIndex: number, palaceName: PalaceIdentifier, mainStars: HookStarInfo[]): HookPalaceInfo {
  const baseAges = Array.from({ length: 10 }, (_, idx) => 5 + idx * 12)
  return {
    branch,
    branchIndex,
    stem: '甲',
    palaceName,
    'mainStars&sihuaStars': mainStars,
    'auxiliaryStars&sihuaStars': [],
    minorStars: [],
    fleetingYears: baseAges,
    majorPeriod: {
      period: branchIndex + 1,
      startAge: baseAges[0] ?? 5,
      endAge: (baseAges[0] ?? 5) + 9,
      startYear: 2000 + branchIndex * 10,
      endYear: 2000 + branchIndex * 10 + 9,
    },
    minorPeriod: baseAges,
  }
}

function createTestChart(overrides: Partial<Record<PalaceIdentifier, HookStarInfo[]>>): ZiWeiHookChart {
  const chart: Partial<ZiWeiHookChart> = {
    birthInfo: {
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      gender: 'male',
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

  const branchByPalace = new Map<PalaceIdentifier, string>()

  BRANCH_NAMES.forEach((branch, index) => {
    const palaceName = PALACE_ORDER[index]
    const stars = overrides[palaceName] ?? []
    const info = createPalace(branch, index, palaceName, stars)
    ;(chart as any)[branch] = info
    branchByPalace.set(palaceName, branch)
  })

  chart.命宫 = branchByPalace.get('命宫') ?? '子'
  chart.身宫 = branchByPalace.get('田宅宫') ?? '戌'
  chart.来因宫 = '命宫'
  chart.generatedAt = new Date().toISOString()
  chart.version = 'test'

  return chart as ZiWeiHookChart
}

describe('analyzeHealthFromHook', () => {
  it('detects奴疾田链与化科缓解提示', () => {
    const chart = createTestChart({
      交友宫: [createStar('七杀', ['D'])],
      疾厄宫: [createStar('贪狼', ['xD', 'iC'])],
      田宅宫: [createStar('武曲', ['iD'])],
      福德宫: [createStar('太阴', ['C'])],
    })

    const result = analyzeHealthFromHook(chart)
    const chainFinding = result.riskFindings.find((finding) => finding.rule === '奴疾田忌象链')
    expect(chainFinding).toBeDefined()
    expect(chainFinding?.severity).toBe('high')
    expect(chainFinding?.relatedPalaces).toEqual(expect.arrayContaining(['交友宫', '疾厄宫', '田宅宫']))

    const mitigation = result.mitigationHints.find((hint) => hint.palace === '疾厄宫')
    expect(mitigation).toBeDefined()
    expect(mitigation?.letter).toBe('C')
    expect(mitigation?.summary).toContain('向心科：贪狼')

    const symptom = result.symptomHighlights.find(
      (item) => item.palace === '疾厄宫' && item.star === '贪狼',
    )
    expect(symptom).toBeDefined()
    expect(symptom?.organs.length).toBeGreaterThan(0)
  })

  it('识别命迁禄忌交会的意外风险', () => {
    const chart = createTestChart({
      命宫: [createStar('紫微', ['A', 'D'])],
      迁移宫: [createStar('太阳', ['A', 'xD'])],
    })

    const result = analyzeHealthFromHook(chart)
    const accident = result.riskFindings.find((finding) => finding.rule === '命迁禄忌交会')
    expect(accident).toBeDefined()
    expect(accident?.severity).toBe('high')

    const chainFinding = result.riskFindings.find((finding) => finding.rule === '奴疾田忌象链')
    expect(chainFinding).toBeUndefined()
    expect(result.mitigationHints.length).toBe(0)
  })
})
