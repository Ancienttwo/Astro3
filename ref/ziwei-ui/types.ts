/**
 * 紫微斗数UI组件类型定义
 */

// 星曜
export interface Star {
  name: string
  type: 'main' | 'auxiliary' | 'malefic' | 'auspicious' | 'default'
  brightness?: string  // 庙旺利陷
  sihua?: string      // 兼容字段：四化: A(禄) B(权) C(科) D(忌)
  selfSihua?: string  // 自化（兼容）
  // 新增：三类四化标记
  sihuaOrigin?: 'A' | 'B' | 'C' | 'D'    // 生年四化（显示为 A/B/C/D）
  sihuaInward?: 'A' | 'B' | 'C' | 'D'    // 向心四化（显示为 iA/iB/iC/iD）
  sihuaOutward?: 'A' | 'B' | 'C' | 'D'   // 离心四化（显示为 xA/xB/xC/xD）
}

// 大运信息
export interface DayunInfo {
  name: string        // 大命、大财等
  ageRange?: string   // 年龄范围
}

// 流年信息
export interface LiunianInfo {
  name: string        // 年命、年财等
  age?: number
}

// 宫位
export interface Palace {
  branch: string      // 地支
  stem: string        // 天干
  name: string        // 宫位名称
  stars: Star[]       // 星曜列表
  isBodyPalace?: boolean     // 身宫
  isLaiyinPalace?: boolean   // 来因宫
  dayunInfo?: DayunInfo      // 大运信息
  liunianInfo?: LiunianInfo  // 流年信息
  liuyueInfo?: string        // 流月信息
  // 小限年龄（用于计算“年命”对应的小限十二宫起点）
  minorAges?: number[]
}

// 中宫信息
export interface CenterInfo {
  name: string        // 姓名
  gender: string      // 性别
  birthDate: string   // 公历生日
  birthTime: string   // 出生时间
  lunarDate: string   // 农历日期
  lunarTime: string   // 农历时辰
  fiveElementsBureau?: string // 五行局，如“水二局”
  masters?: {                 // 命主/身主/子斗（斗君）
    life: string
    body: string
    ziDou: string
  }
  // 八字起运信息（例如："3年2个月起运"）
  startLuck?: string
  // 八个大运（居中展示用）
  majorPeriods8?: Array<{
    period: number
    stem: string
    branch: string
    tgStem: string   // 十神（天干）
    tgBranch: string // 十神（地支主气）
    startAge: number
  }>
  yearGan: string     // 年干
  yearZhi: string     // 年支
  monthGan: string    // 月干
  monthZhi: string    // 月支
  dayGan: string      // 日干
  dayZhi: string      // 日支
  hourGan: string     // 时干
  hourZhi: string     // 时支
  // 可选：十神简写（由 view-transforms 预计算并注入）
  tenGods?: {
    year: { stem: string; branch: string }
    month: { stem: string; branch: string }
    day: { stem: string; branch: string }
    hour: { stem: string; branch: string }
  }
}

// 大运
export interface Period {
  id: string
  text: string        // 显示文本
  subtext: string     // 干支
  ageRange: string    // 年龄范围
  selected?: boolean
}

// 流年
export interface Year {
  id: string
  text: string        // 显示文本
  age: number
  branch: string      // 地支
  selected?: boolean
}

// 流月
export interface Month {
  id: string
  text: string        // 月份名称
  selected?: boolean
}

// 图表数据
export interface ChartData {
  palaces: Palace[]
  centerInfo: CenterInfo
  periods: Period[]
  years: Year[]
  months: Month[]
}

// 主组件Props
export interface ZiweiChartProps {
  chartData: ChartData
  activePalace: string | null
  onPalaceClick: (branch: string) => void
  selectedPeriod?: string | null
  selectedYear?: string | null
  selectedMonth?: string | null
}

// 选择器Props
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

// 底部栏Props - 匹配ziwei-old.tsx的接口
export interface ZiweiBottomBarProps {
  onSanhePress: () => void        // 三合按钮
  onSihuaPress: () => void        // 四化按钮
  onPaipanPress: () => void       // 排盘按钮
  onAnalysisPress: () => void     // 分析按钮
  onSettingsPress: () => void     // 设置按钮
  activeMode?: 'sanhe' | 'sihua' | 'analysis' | 'normal'
}
