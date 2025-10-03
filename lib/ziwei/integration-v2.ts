/**
 * Ziwei-Core Integration Adapter
 * 将 ref/ziwei-core 的算法适配到 Web UI 组件
 */

import type { ChartData, Period, Year, Month, Palace, Star } from '@/components/ziwei-v2/types'
import type { ZiWeiHookChart, HookCalculationInput } from '@/ref/ziwei-core/dist/types/hook-format-types'

// ==================== 算法集成导入 ====================
// 注意：使用编译后的 dist 目录
import { generateWebChart } from '@/ref/ziwei-core/dist/api/integrated-chart-api'

// ==================== 输入参数类型 ====================

export interface ZiweiCalculationInput {
  year: number
  month: number
  day: number
  hour: number
  minute?: number
  gender: 'male' | 'female'
  isLunar: boolean
  isLeapMonth?: boolean
  name?: string
}

// ==================== 核心集成函数 ====================

/**
 * 生成 Web UI 所需的紫微斗数图表数据
 *
 * @param input 计算输入参数
 * @returns Web UI 渲染所需的完整数据
 *
 * @example
 * ```typescript
 * const chartData = await generateWebZiweiChart({
 *   year: 1989,
 *   month: 1,
 *   day: 2,
 *   hour: 19,
 *   gender: 'female',
 *   isLunar: false
 * })
 * ```
 */
export async function generateWebZiweiChart(
  input: ZiweiCalculationInput
): Promise<ChartData> {
  try {
    // 调用 ziwei-core 算法
    const result = await generateWebChart({
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      gender: input.gender,
      isLunar: input.isLunar,
      isLeapMonth: input.isLeapMonth
    })

    // 转换 Hook 格式到 UI ChartData 格式
    return convertHookToChartData(result.hookChart, input)
  } catch (error) {
    console.error('Ziwei-core 算法执行失败，回退到 Mock 数据:', error)
    // 出错时回退到 Mock 数据
    return generateMockChartData(input)
  }
}

// ==================== Hook 格式转换器 ====================

/**
 * 将 ziwei-core 的 Hook 格式转换为 UI 组件所需的 ChartData 格式
 */
function convertHookToChartData(
  hookChart: ZiWeiHookChart,
  input: ZiweiCalculationInput
): ChartData {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

  // 获取命宫/身宫/来因宫的地支
  const lifePalaceBranch = hookChart.命宫
  const bodyPalaceBranch = hookChart.身宫
  const laiyinPalaceBranch = hookChart.来因宫

  // 转换 12 宫位数据
  const palaces: Palace[] = branches.map((branch) => {
    const hookPalace = hookChart[branch]

    // 合并主星和辅星（包含四化标记）
    const allStars: Star[] = []

    // 处理主星
    hookPalace['mainStars&sihuaStars']?.forEach((star) => {
      allStars.push(convertHookStarToStar(star, 'main'))
    })

    // 处理辅星
    hookPalace['auxiliaryStars&sihuaStars']?.forEach((star) => {
      allStars.push(convertHookStarToStar(star, 'auxiliary'))
    })

    // 处理小星
    hookPalace.minorStars?.forEach((star) => {
      allStars.push(convertHookStarToStar(star, 'default'))
    })

    return {
      branch,
      stem: hookPalace.stem,
      name: hookPalace.palaceName,
      stars: allStars,
      isBodyPalace: branch === bodyPalaceBranch,
      isLaiyinPalace: branch === laiyinPalaceBranch,
      dayunInfo: hookPalace.majorPeriod ? {
        name: `第${hookPalace.majorPeriod.period}运`,
        ageRange: `${hookPalace.majorPeriod.startAge}-${hookPalace.majorPeriod.endAge}岁`
      } : undefined,
      minorAges: hookPalace.minorPeriod || []
    }
  })

  // 构建中宫信息
  const centerInfo = {
    name: input.name || '用户',
    gender: input.gender === 'male' ? '男' : '女',
    birthDate: `${input.year}-${String(input.month).padStart(2, '0')}-${String(input.day).padStart(2, '0')}`,
    birthTime: `${String(input.hour).padStart(2, '0')}:${String(input.minute || 0).padStart(2, '0')}`,
    lunarDate: `${hookChart.birthInfo.yearGanzhi}年 ${hookChart.birthInfo.monthLunar}月 ${hookChart.birthInfo.dayLunar}日`,
    lunarTime: branches[hookChart.birthInfo.hourBranch] + '时',
    fiveElementsBureau: hookChart.五行局.name,
    masters: {
      life: hookChart.命主,
      body: hookChart.身主,
      ziDou: hookChart.斗君
    },
    yearGan: hookChart.birthInfo.yearStem,
    yearZhi: hookChart.birthInfo.yearBranch,
    monthGan: hookChart.八字.split(' ')[1]?.slice(0, 1) || '',
    monthZhi: hookChart.八字.split(' ')[1]?.slice(1, 2) || '',
    dayGan: hookChart.八字.split(' ')[2]?.slice(0, 1) || '',
    dayZhi: hookChart.八字.split(' ')[2]?.slice(1, 2) || '',
    hourGan: hookChart.八字.split(' ')[3]?.slice(0, 1) || '',
    hourZhi: hookChart.八字.split(' ')[3]?.slice(1, 2) || '',
    startLuck: hookChart.八字起运,
    majorPeriods8: extractMajorPeriods(hookChart)
  }

  // 生成大运选择器数据
  const periods: Period[] = centerInfo.majorPeriods8.map((p) => ({
    id: `period-${p.period}`,
    text: `第${p.period}运`,
    subtext: `${p.startAge}-${p.startAge + 9} ${p.stem}${p.branch}`,
    ageRange: `${p.startAge}-${p.startAge + 9}岁`,
    selected: false
  }))

  // 生成流年选择器数据
  const currentYear = new Date().getFullYear()
  const years: Year[] = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 5 + i
    const branchIdx = (year - 4) % 12
    const branch = branches[branchIdx >= 0 ? branchIdx : branchIdx + 12] as string
    return {
      id: `year-${year}`,
      text: `${year}年`,
      age: year - input.year,
      branch,
      selected: false
    }
  })

  // 生成流月选择器数据
  const months: Month[] = [
    '正月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '冬月', '腊月'
  ].map((text, index) => ({
    id: `month-${index + 1}`,
    text,
    selected: false
  }))

  return {
    palaces,
    centerInfo,
    periods,
    years,
    months
  }
}

/**
 * 转换 Hook 星曜格式到 UI Star 格式
 */
function convertHookStarToStar(
  hookStar: { name: string; brightness: string; type?: string[] },
  defaultType: Star['type']
): Star {
  // 解析四化标记（来自 type 数组）
  let sihuaOrigin: Star['sihuaOrigin'] = undefined
  let sihuaInward: Star['sihuaInward'] = undefined
  let sihuaOutward: Star['sihuaOutward'] = undefined

  hookStar.type?.forEach((t) => {
    // 生年四化: A/B/C/D 或 iA/iB/iC/iD
    if (t === 'A' || t === 'iA') sihuaOrigin = 'A'
    else if (t === 'B' || t === 'iB') sihuaOrigin = 'B'
    else if (t === 'C' || t === 'iC') sihuaOrigin = 'C'
    else if (t === 'D' || t === 'iD') sihuaOrigin = 'D'
    // 向心四化: iA/iB/iC/iD (已在上面处理)
    // 离心四化: xA/xB/xC/xD
    else if (t === 'xA') sihuaOutward = 'A'
    else if (t === 'xB') sihuaOutward = 'B'
    else if (t === 'xC') sihuaOutward = 'C'
    else if (t === 'xD') sihuaOutward = 'D'
  })

  // 推断星曜类型（基于星名）
  const starType = inferStarType(hookStar.name, defaultType)

  return {
    name: hookStar.name,
    type: starType,
    brightness: hookStar.brightness,
    sihuaOrigin,
    sihuaInward,
    sihuaOutward
  }
}

/**
 * 根据星名推断星曜类型
 */
function inferStarType(starName: string, fallback: Star['type']): Star['type'] {
  const mainStars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军']
  const auspiciousStars = ['文昌', '文曲', '左辅', '右弼', '天魁', '天钺', '禄存', '天马', '化禄', '化权', '化科']
  const maleficStars = ['擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '化忌']
  const peachStars = ['红鸾', '天喜', '咸池', '天姚']

  if (mainStars.includes(starName)) return 'main'
  if (auspiciousStars.includes(starName)) return 'auspicious'
  if (maleficStars.includes(starName)) return 'malefic'
  if (peachStars.includes(starName)) return 'peach'

  return fallback
}

/**
 * 从 Hook 数据中提取 8 个大运信息
 */
function extractMajorPeriods(hookChart: ZiWeiHookChart) {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  const periods: Array<{
    period: number
    stem: string
    branch: string
    tgStem: string
    tgBranch: string
    startAge: number
  }> = []

  branches.forEach((branch) => {
    const palace = hookChart[branch]
    if (palace.majorPeriod) {
      periods.push({
        period: palace.majorPeriod.period,
        stem: palace.stem,
        branch,
        tgStem: '待补充', // TODO: 计算十神
        tgBranch: '待补充',
        startAge: palace.majorPeriod.startAge
      })
    }
  })

  // 按起始年龄排序并取前8个
  return periods
    .sort((a, b) => a.startAge - b.startAge)
    .slice(0, 8)
}

// ==================== Mock 数据生成器（开发调试用）====================

function generateMockChartData(input: ZiweiCalculationInput): ChartData {
  const palaces = [
    {
      branch: '子',
      stem: '甲',
      name: '命宫',
      stars: [
        { name: '紫微', type: 'main' as const, brightness: '庙', sihuaOrigin: 'A' as const },
        { name: '天机', type: 'main' as const, brightness: '旺' },
        { name: '左辅', type: 'auxiliary' as const },
        { name: '文昌', type: 'auxiliary' as const, sihuaOrigin: 'C' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第1运', ageRange: '6-15岁' },
      minorAges: [1, 13, 25, 37, 49, 61, 73, 85, 97, 109]
    },
    {
      branch: '丑',
      stem: '乙',
      name: '兄弟宫',
      stars: [
        { name: '天同', type: 'main' as const, brightness: '利' },
        { name: '右弼', type: 'auxiliary' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第2运', ageRange: '16-25岁' }
    },
    {
      branch: '寅',
      stem: '丙',
      name: '夫妻宫',
      stars: [
        { name: '武曲', type: 'main' as const, brightness: '平' },
        { name: '天魁', type: 'auspicious' as const },
        { name: '红鸾', type: 'peach' as const }
      ],
      isBodyPalace: true,
      isLaiyinPalace: false,
      dayunInfo: { name: '第3运', ageRange: '26-35岁' }
    },
    {
      branch: '卯',
      stem: '丁',
      name: '子女宫',
      stars: [
        { name: '太阳', type: 'main' as const, brightness: '旺', sihuaOrigin: 'D' as const },
        { name: '天梁', type: 'main' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第4运', ageRange: '36-45岁' }
    },
    {
      branch: '辰',
      stem: '戊',
      name: '财帛宫',
      stars: [
        { name: '天府', type: 'main' as const, brightness: '庙' },
        { name: '禄存', type: 'auspicious' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第5运', ageRange: '46-55岁' }
    },
    {
      branch: '巳',
      stem: '己',
      name: '疾厄宫',
      stars: [
        { name: '太阴', type: 'main' as const, brightness: '陷' },
        { name: '文曲', type: 'auxiliary' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第6运', ageRange: '56-65岁' }
    },
    {
      branch: '午',
      stem: '庚',
      name: '迁移宫',
      stars: [
        { name: '贪狼', type: 'main' as const, brightness: '旺', sihuaOrigin: 'A' as const },
        { name: '天马', type: 'auspicious' as const }
      ],
      isBodyPalace: false,
      isLaiyinPalace: true,
      dayunInfo: { name: '第7运', ageRange: '66-75岁' }
    },
    {
      branch: '未',
      stem: '辛',
      name: '仆役宫',
      stars: [
        { name: '巨门', type: 'main' as const, brightness: '利', sihuaOrigin: 'A' as const },
        { name: '陀罗', type: 'malefic' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第8运', ageRange: '76-85岁' }
    },
    {
      branch: '申',
      stem: '壬',
      name: '官禄宫',
      stars: [
        { name: '天相', type: 'main' as const, brightness: '得' },
        { name: '擎羊', type: 'malefic' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第9运', ageRange: '86-95岁' }
    },
    {
      branch: '酉',
      stem: '癸',
      name: '田宅宫',
      stars: [
        { name: '七杀', type: 'main' as const, brightness: '旺' },
        { name: '地空', type: 'malefic' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第10运', ageRange: '96-105岁' }
    },
    {
      branch: '戌',
      stem: '甲',
      name: '福德宫',
      stars: [
        { name: '破军', type: 'main' as const, brightness: '平', sihuaOrigin: 'B' as const },
        { name: '地劫', type: 'malefic' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第11运', ageRange: '106-115岁' }
    },
    {
      branch: '亥',
      stem: '乙',
      name: '父母宫',
      stars: [
        { name: '廉贞', type: 'main' as const, brightness: '陷', sihuaOrigin: 'A' as const },
        { name: '天钺', type: 'auspicious' as const }
      ],
      isBodyPalace: false,
      dayunInfo: { name: '第12运', ageRange: '116-125岁' }
    }
  ]

  const centerInfo = {
    name: input.name || '测试用户',
    gender: input.gender === 'male' ? '男' : '女',
    birthDate: `${input.year}-${String(input.month).padStart(2, '0')}-${String(input.day).padStart(2, '0')}`,
    birthTime: `${String(input.hour).padStart(2, '0')}:${String(input.minute || 0).padStart(2, '0')}`,
    lunarDate: '己巳年 腊月 初二',
    lunarTime: '戌时',
    fiveElementsBureau: '水二局',
    masters: {
      life: '贪狼',
      body: '天相',
      ziDou: '辰宫'
    },
    yearGan: '己',
    yearZhi: '巳',
    monthGan: '丁',
    monthZhi: '丑',
    dayGan: '辛',
    dayZhi: '亥',
    hourGan: '戊',
    hourZhi: '戌',
    tenGods: {
      year: { stem: '劫财', branch: '正印' },
      month: { stem: '伤官', branch: '比肩' },
      day: { stem: '日主', branch: '正官' },
      hour: { stem: '正财', branch: '偏印' }
    },
    startLuck: '3年2个月起运',
    majorPeriods8: [
      { period: 1, stem: '丙', branch: '子', tgStem: '食神', tgBranch: '偏财', startAge: 6 },
      { period: 2, stem: '乙', branch: '亥', tgStem: '伤官', tgBranch: '正官', startAge: 16 },
      { period: 3, stem: '甲', branch: '戌', tgStem: '劫财', tgBranch: '偏印', startAge: 26 },
      { period: 4, stem: '癸', branch: '酉', tgStem: '正印', tgBranch: '正财', startAge: 36 },
      { period: 5, stem: '壬', branch: '申', tgStem: '偏印', tgBranch: '偏财', startAge: 46 },
      { period: 6, stem: '辛', branch: '未', tgStem: '正财', tgBranch: '正官', startAge: 56 },
      { period: 7, stem: '庚', branch: '午', tgStem: '偏财', tgBranch: '正印', startAge: 66 },
      { period: 8, stem: '己', branch: '巳', tgStem: '比肩', tgBranch: '正印', startAge: 76 }
    ]
  }

  const periods: Period[] = centerInfo.majorPeriods8.map((p) => ({
    id: `period-${p.period}`,
    text: `第${p.period}运`,
    subtext: `${p.startAge}-${p.startAge + 9} ${p.stem}${p.branch}`,
    ageRange: `${p.startAge}-${p.startAge + 9}岁`,
    selected: false
  }))

  const currentYear = new Date().getFullYear()
  const years: Year[] = Array.from({ length: 10 }, (_, i) => {
    const year = currentYear - 5 + i
    const branch = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'][
      (year - 4) % 12
    ]
    return {
      id: `year-${year}`,
      text: `${year}年`,
      age: year - input.year,
      branch,
      selected: false
    }
  })

  const months: Month[] = [
    '正月',
    '二月',
    '三月',
    '四月',
    '五月',
    '六月',
    '七月',
    '八月',
    '九月',
    '十月',
    '冬月',
    '腊月'
  ].map((text, index) => ({
    id: `month-${index + 1}`,
    text,
    selected: false
  }))

  return {
    palaces,
    centerInfo,
    periods,
    years,
    months
  }
}

// ==================== 辅助函数 ====================

/**
 * 从地支获取宫位索引（0-11）
 */
export function getBranchIndex(branch: string): number {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
  return branches.indexOf(branch)
}

/**
 * 计算宫位在4×4网格中的位置
 * 布局：巳午未申 / 辰○○酉 / 卯○○戌 / 寅丑子亥
 */
export function getPalaceGridPosition(branch: string): { row: number; col: number } {
  const gridMap: Record<string, { row: number; col: number }> = {
    巳: { row: 0, col: 0 },
    午: { row: 0, col: 1 },
    未: { row: 0, col: 2 },
    申: { row: 0, col: 3 },
    辰: { row: 1, col: 0 },
    酉: { row: 1, col: 3 },
    卯: { row: 2, col: 0 },
    戌: { row: 2, col: 3 },
    寅: { row: 3, col: 0 },
    丑: { row: 3, col: 1 },
    子: { row: 3, col: 2 },
    亥: { row: 3, col: 3 }
  }
  return gridMap[branch] || { row: 0, col: 0 }
}
