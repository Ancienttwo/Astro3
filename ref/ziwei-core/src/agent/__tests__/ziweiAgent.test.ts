import { buildZiweiAgentQuery } from '../ziweiAgent'
import type { HookPalaceInfo, HookStarInfo, ZiWeiHookChart } from '../../types/hook-format-types'
import { BRANCH_NAMES } from '../../types/hook-format-types'

type PalaceStarConfig = Record<string, string[][]>

type BranchName = typeof BRANCH_NAMES[number]

interface BranchPalaceMapItem {
  branch: BranchName
  palaceName: string
}

const BRANCH_PALACE_MAP: BranchPalaceMapItem[] = [
  { branch: '子', palaceName: '命宫' },
  { branch: '丑', palaceName: '兄弟宫' },
  { branch: '寅', palaceName: '夫妻宫' },
  { branch: '卯', palaceName: '子女宫' },
  { branch: '辰', palaceName: '财帛宫' },
  { branch: '巳', palaceName: '疾厄宫' },
  { branch: '午', palaceName: '迁移宫' },
  { branch: '未', palaceName: '交友宫' },
  { branch: '申', palaceName: '官禄宫' },
  { branch: '酉', palaceName: '田宅宫' },
  { branch: '戌', palaceName: '福德宫' },
  { branch: '亥', palaceName: '父母宫' },
]

function createPalace(branch: BranchName, palaceName: string, starConfigs: string[][] = []): HookPalaceInfo {
  const makeStar = (types: string[], index: number): HookStarInfo => ({
    name: `${palaceName}星${index + 1}`,
    brightness: '平',
    type: types,
  })

  return {
    branch,
    branchIndex: BRANCH_NAMES.indexOf(branch),
    stem: '甲',
    palaceName,
    'mainStars&sihuaStars': starConfigs.map((types, index) => makeStar(types, index)),
    'auxiliaryStars&sihuaStars': [],
    minorStars: [],
    fleetingYears: [],
    majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 },
    minorPeriod: [],
  }
}

function createChart(config: Partial<PalaceStarConfig> = {}): ZiWeiHookChart {
  const chart: any = {
    birthInfo: {
      year: 1990,
      month: 1,
      day: 1,
      hour: 0,
      gender: 'female',
      isLunar: false,
      yearStem: '甲',
      yearBranch: '子',
      yearGanzhi: '甲子',
      monthLunar: 1,
      dayLunar: 1,
      hourBranch: 0,
    },
    八字: '甲子 乙丑 丙寅 丁卯',
    八字起运: '3岁8个月',
    八字大运: '庚寅',
    命宫: '子',
    身宫: '子',
    来因宫: '子',
    命主: '紫微',
    身主: '天魁',
    斗君: '寅',
    五行局: { name: '水二局', 局数: '2' },
    generatedAt: '2024-01-01T00:00:00Z',
  }

  for (const item of BRANCH_PALACE_MAP) {
    const stars = config[item.palaceName] ?? []
    chart[item.branch] = createPalace(item.branch, item.palaceName, stars)
  }

  return chart as ZiWeiHookChart
}

describe('buildZiweiAgentQuery - 桃花焦点', () => {
  it('提示平方破象与有终化无风险', () => {
    const chart = createChart({
      '夫妻宫': [['A']],
      '子女宫': [['C']],
      '福德宫': [['D', 'xD']],
      '田宅宫': [['B', 'xB']],
    })

    const prompt = buildZiweiAgentQuery(chart, { focus: 'peach_blossom' })

    expect(prompt).toContain('桃花关键宫位')
    expect(prompt).toContain('桃花破象检视')
    expect(prompt).toContain('由于 福德宫 出现 忌(D) + xD')
    expect(prompt).toContain('牵动 夫妻宫 的 禄(A)')
    expect(prompt).toContain('有终化无')
    expect(prompt).toContain('权(B) + xB')
  })

  it('无破象时给出安心提示', () => {
    const chart = createChart({
      '夫妻宫': [['A']],
      '子女宫': [['C']],
    })

    const prompt = buildZiweiAgentQuery(chart, { focus: 'peach_blossom' })

    expect(prompt).toContain('桃花破象检视')
    expect(prompt).toContain('未检测到平方破象或“有终化无”的明显征兆')
  })
})
