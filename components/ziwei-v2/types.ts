/**
 * 紫微斗数 Web 版本类型定义
 * 基于 ref/ziwei-ui/types.ts 改造为纯 Web 技术栈
 */

// ==================== 星曜类型 ====================

export interface Star {
  name: string
  type: 'main' | 'auxiliary' | 'malefic' | 'auspicious' | 'peach' | 'default'
  brightness?: string // 庙旺利陷（7等级：庙/旺/得/利/平/不/陷）
  sihua?: string // 兼容字段：四化 A(禄) B(权) C(科) D(忌)
  selfSihua?: string // 自化（兼容）

  // 三类四化标记（新版本）
  sihuaOrigin?: 'A' | 'B' | 'C' | 'D' // 生年四化（显示为 A/B/C/D）
  sihuaInward?: 'A' | 'B' | 'C' | 'D' // 向心四化（显示为 iA/iB/iC/iD）
  sihuaOutward?: 'A' | 'B' | 'C' | 'D' // 离心四化（显示为 xA/xB/xC/xD）
}

// ==================== 大运/流年信息 ====================

export interface DayunInfo {
  name: string // 大命、大财等
  ageRange?: string // 年龄范围（如 "6-15"）
}

export interface LiunianInfo {
  name: string // 年命、年财等
  age?: number
}

// ==================== 宫位类型 ====================

export interface Palace {
  branch: string // 地支（子丑寅卯...）
  stem: string // 天干（甲乙丙丁...）
  name: string // 宫位名称（命宫、财帛宫...）
  stars: Star[] // 星曜列表

  // 特殊标记
  isBodyPalace?: boolean // 身宫
  isLaiyinPalace?: boolean // 来因宫

  // 大运/流年/流月信息
  dayunInfo?: DayunInfo // 大运信息
  liunianInfo?: LiunianInfo // 流年信息
  liuyueInfo?: string // 流月信息

  // 小限年龄（用于计算"年命"对应的小限十二宫起点）
  minorAges?: number[]
}

// ==================== 中宫信息 ====================

export interface CenterInfo {
  // 基本信息
  name: string // 姓名
  gender: string // 性别
  birthDate: string // 公历生日（YYYY-MM-DD）
  birthTime: string // 出生时间（HH:mm）
  lunarDate: string // 农历日期
  lunarTime: string // 农历时辰

  // 五行局
  fiveElementsBureau?: string // 如"水二局"

  // 三主
  masters?: {
    life: string // 命主
    body: string // 身主
    ziDou: string // 子斗（斗君）
  }

  // 八字信息
  yearGan: string // 年干
  yearZhi: string // 年支
  monthGan: string // 月干
  monthZhi: string // 月支
  dayGan: string // 日干
  dayZhi: string // 日支
  hourGan: string // 时干
  hourZhi: string // 时支

  // 十神简写（可选，由 view-transforms 预计算并注入）
  tenGods?: {
    year: { stem: string; branch: string }
    month: { stem: string; branch: string }
    day: { stem: string; branch: string }
    hour: { stem: string; branch: string }
  }

  // 八字起运信息
  startLuck?: string // 如 "3年2个月起运"

  // 八个大运（居中展示用）
  majorPeriods8?: Array<{
    period: number
    stem: string
    branch: string
    tgStem: string // 十神（天干）
    tgBranch: string // 十神（地支主气）
    startAge: number
  }>
}

// ==================== 大运/流年/流月选择器 ====================

export interface Period {
  id: string
  text: string // 显示文本（如 "第1运"）
  subtext: string // 干支（如 "6-15 甲寅"）
  ageRange: string // 年龄范围
  selected?: boolean
}

export interface Year {
  id: string
  text: string // 显示文本（如 "1997年"）
  age: number
  branch: string // 地支
  selected?: boolean
}

export interface Month {
  id: string
  text: string // 月份名称（如 "正月"）
  selected?: boolean
}

// ==================== 图表数据 ====================

export interface ChartData {
  palaces: Palace[] // 12个宫位
  centerInfo: CenterInfo // 中宫信息
  periods: Period[] // 大运列表
  years: Year[] // 流年列表
  months: Month[] // 流月列表
}

// ==================== 组件 Props ====================

export interface ZiweiChartProps {
  chartData: ChartData
  activePalace: string | null
  onPalaceClick: (branch: string) => void
  selectedPeriod?: string | null
  selectedYear?: string | null
  selectedMonth?: string | null
}

export interface PalaceCardProps {
  palace: Palace
  isActive: boolean
  onClick: () => void
  selectedPeriod?: string | null
  selectedYear?: string | null
  selectedMonth?: string | null

  // 动态标签（由 ZiweiChart 计算后传入）
  majorLabel?: { text: string; highlight: boolean }
  yearLabel?: { text: string }
  minorLabel?: { text: string }
  dayunYearAge?: string
  monthLabel?: string

  // 四化飞宫高亮
  activeSihuaHighlights?: Map<string, { code: 'A' | 'B' | 'C' | 'D'; color: string }>
}

export interface CenterGridProps {
  centerInfo: CenterInfo
}

export interface ZiweiSelectorsProps {
  periods: Period[]
  years: Year[]
  months: Month[]
  selectedPeriod: string | null
  selectedYear: string | null
  selectedMonth: string | null
  onPeriodChange: (id: string) => void
  onYearChange: (id: string) => void
  onMonthChange: (id: string) => void
}

export interface ZiweiBottomBarProps {
  onSanhePress: () => void // 三合按钮
  onSihuaPress: () => void // 四化按钮
  onPaipanPress: () => void // 排盘按钮
  onAnalysisPress: () => void // 分析按钮
  onSettingsPress: () => void // 设置按钮
  activeMode?: 'sanhe' | 'sihua' | 'analysis' | 'normal'
}

// ==================== 常量定义 ====================

// 地支循环
export const BRANCH_CYCLE = [
  '子', '丑', '寅', '卯', '辰', '巳',
  '午', '未', '申', '酉', '戌', '亥'
] as const

// 大运宫位名称
export const MAJOR_LABELS = [
  '大命', '大兄', '大妻', '大子', '大财', '大疾',
  '大迁', '大友', '大官', '大田', '大福', '大父'
] as const

// 流年宫位名称
export const YEAR_LABELS = [
  '年命', '年兄', '年妻', '年子', '年财', '年疾',
  '年迁', '年友', '年官', '年田', '年福', '年父'
] as const

// 小限宫位名称
export const MINOR_LABELS = [
  '小限', '小兄', '小妻', '小子', '小财', '小疾',
  '小迁', '小友', '小官', '小田', '小福', '小父'
] as const

// 流月名称
export const MONTH_LABELS = [
  '正月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '冬月', '腊月'
] as const

// 星曜颜色分类（Tailwind CSS）
export const STAR_COLORS = {
  main: 'text-purple-900', // 14主星（深紫色）
  auxiliary: 'text-blue-600', // 辅星（蓝色）
  auspicious: 'text-green-600', // 吉星（绿色）
  malefic: 'text-gray-500', // 煞星（灰色）
  peach: 'text-pink-500', // 桃花星（粉色）
  default: 'text-gray-700'
} as const

// 四化颜色（Tailwind CSS）
export const SIHUA_COLORS = {
  A: 'bg-green-500', // 禄（绿）
  B: 'bg-purple-500', // 权（紫）
  C: 'bg-blue-500', // 科（蓝）
  D: 'bg-red-500' // 忌（红）
} as const

// 四化文字颜色
export const SIHUA_TEXT_COLORS = {
  A: 'text-green-600',
  B: 'text-purple-600',
  C: 'text-blue-600',
  D: 'text-red-700'
} as const

// 重点宫位标签集合
export const MAJOR_LABEL_HIGHLIGHTS = new Set(['大命', '大财', '大官'])
export const YEAR_LABEL_HIGHLIGHTS = new Set(['年命', '年财', '年官'])
export const MINOR_LABEL_HIGHLIGHTS = new Set(['小限'])
