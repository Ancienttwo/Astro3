/**
 * Mock数据生成器
 * 用于UI开发和测试
 */

import type { ChartData, Palace, Star, Period, Year, Month } from './types'

// 十二地支
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 十天干
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 十二宫位名称
const PALACE_NAMES = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '官禄', '田宅', '福德', '父母'
]

// 紫微斗数主星
const MAIN_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
]

// 辅星
const AUXILIARY_STARS = [
  '左辅', '右弼', '文昌', '文曲', '天魁', '天钺',
  '禄存', '天马', '擎羊', '陀罗', '火星', '铃星'
]

// 生成随机星曜
function generateStars(): Star[] {
  const stars: Star[] = []
  
  // 随机添加1-2个主星
  const mainStarCount = Math.floor(Math.random() * 2) + 1
  for (let i = 0; i < mainStarCount; i++) {
    const starName = (MAIN_STARS[Math.floor(Math.random() * MAIN_STARS.length)] ?? MAIN_STARS[0]) as string
    if (!stars.find(s => s.name === starName)) {
      const shouldSihua = Math.random() > 0.7
      const mainStar: any = {
        name: starName,
        type: 'main',
        brightness: Math.random() > 0.5 ? '庙' : Math.random() > 0.5 ? '旺' : '陷',
      }
      if (shouldSihua) {
        mainStar.sihua = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
      }
      stars.push(mainStar)
    }
  }
  
  // 随机添加0-3个辅星
  const auxStarCount = Math.floor(Math.random() * 4)
  for (let i = 0; i < auxStarCount; i++) {
    const starName = (AUXILIARY_STARS[Math.floor(Math.random() * AUXILIARY_STARS.length)] ?? AUXILIARY_STARS[0]) as string
    if (!stars.find(s => s.name === starName)) {
      const isAuspicious = ['左辅', '右弼', '文昌', '文曲', '天魁', '天钺', '禄存', '天马'].includes(starName)
      const isMalefic = ['擎羊', '陀罗', '火星', '铃星'].includes(starName)
      
      stars.push({
        name: starName,
        type: isAuspicious ? 'auspicious' : isMalefic ? 'malefic' : 'auxiliary'
      })
    }
  }
  
  return stars
}

// 生成宫位数据
function generatePalaces(): Palace[] {
  const palaces: Palace[] = []
  
  // 按照传统顺序排列地支（从巳开始）
  const orderedBranches = ['巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑', '寅', '卯', '辰']
  
  for (let i = 0; i < 12; i++) {
    const branch = (orderedBranches[i] ?? '子') as string
    const stem = (STEMS[Math.floor(Math.random() * STEMS.length)] ?? STEMS[0]) as string
    const palaceName = (PALACE_NAMES[i] ?? '命宫') as string
    
    const palace: Palace = {
      branch,
      stem,
      name: palaceName,
      stars: generateStars(),
      isBodyPalace: palaceName === '迁移' && Math.random() > 0.5,
      isLaiyinPalace: palaceName === '福德' && Math.random() > 0.7
    }
    
    // 随机添加大运信息
    if (Math.random() > 0.8) {
      palace.dayunInfo = {
        name: `大${palaceName.charAt(0)}`,
        ageRange: '25-34'
      }
    }
    
    // 随机添加流年信息
    if (Math.random() > 0.8) {
      palace.liunianInfo = {
        name: `年${palaceName.charAt(0)}`,
        age: 30
      }
    }
    
    // 随机添加流月信息
    if (Math.random() > 0.9) {
      palace.liuyueInfo = `月${palaceName.charAt(0)}`
    }
    
    palaces.push(palace)
  }
  
  return palaces
}

// 生成大运数据
function generatePeriods(): Period[] {
  const periods: Period[] = []
  const startAge = 5
  
  for (let i = 0; i < 12; i++) {
    const ageStart = startAge + (i * 10)
    const ageEnd = ageStart + 9
    
    periods.push({
      id: `period-${i}`,
      text: `第${i + 1}运`,
      subtext: `${STEMS[i % 10]}${BRANCHES[i]}`,
      ageRange: `${ageStart}-${ageEnd}岁`
    })
  }
  
  return periods
}

// 生成流年数据
function generateYears(): Year[] {
  const years: Year[] = []
  const currentYear = 2024
  const birthYear = 1990
  
  for (let i = 0; i < 20; i++) {
    const year = currentYear + i - 10
    const age = year - birthYear
    
    years.push({
      id: `year-${year}`,
      text: `${year}`,
      age,
      branch: (BRANCHES[(year - 4) % 12] ?? '子') as string
    })
  }
  
  return years
}

// 生成流月数据
function generateMonths(): Month[] {
  const months: Month[] = []
  const monthNames = [
    '正月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '冬月', '腊月'
  ]
  
  for (let i = 0; i < 12; i++) {
    months.push({
      id: `month-${i + 1}`,
      text: (monthNames[i] ?? '正月') as string
    })
  }
  
  return months
}

// 生成完整的Mock数据
export function generateMockChartData(): ChartData {
  return {
    palaces: generatePalaces(),
    centerInfo: {
      name: '张三',
      gender: '男',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      lunarDate: '庚午年四月廿一',
      lunarTime: '未时',
      yearGan: '庚',
      yearZhi: '午',
      monthGan: '辛',
      monthZhi: '巳',
      dayGan: '丙',
      dayZhi: '子',
      hourGan: '乙',
      hourZhi: '未'
    },
    periods: generatePeriods(),
    years: generateYears(),
    months: generateMonths()
  }
}

// 生成简化的测试数据
export function generateSimpleTestData(): ChartData {
  return {
    palaces: [
      { branch: '巳', stem: '甲', name: '命宫', stars: [{ name: '紫微', type: 'main', brightness: '庙' }] },
      { branch: '午', stem: '乙', name: '兄弟', stars: [{ name: '天机', type: 'main' }] },
      { branch: '未', stem: '丙', name: '夫妻', stars: [{ name: '太阳', type: 'main', sihua: 'A' }] },
      { branch: '申', stem: '丁', name: '子女', stars: [{ name: '武曲', type: 'main' }] },
      { branch: '酉', stem: '戊', name: '财帛', stars: [{ name: '天同', type: 'main' }] },
      { branch: '戌', stem: '己', name: '疾厄', stars: [{ name: '廉贞', type: 'main' }] },
      { branch: '亥', stem: '庚', name: '迁移', stars: [{ name: '天府', type: 'main' }], isBodyPalace: true },
      { branch: '子', stem: '辛', name: '交友', stars: [{ name: '太阴', type: 'main' }] },
      { branch: '丑', stem: '壬', name: '官禄', stars: [{ name: '贪狼', type: 'main' }] },
      { branch: '寅', stem: '癸', name: '田宅', stars: [{ name: '巨门', type: 'main' }] },
      { branch: '卯', stem: '甲', name: '福德', stars: [{ name: '天相', type: 'main' }] },
      { branch: '辰', stem: '乙', name: '父母', stars: [{ name: '天梁', type: 'main' }] }
    ],
    centerInfo: {
      name: '测试用户',
      gender: '男',
      birthDate: '1990-01-01',
      birthTime: '12:00',
      lunarDate: '己巳年冬月初六',
      lunarTime: '午时',
      yearGan: '己',
      yearZhi: '巳',
      monthGan: '丙',
      monthZhi: '子',
      dayGan: '甲',
      dayZhi: '子',
      hourGan: '庚',
      hourZhi: '午'
    },
    periods: [
      { id: 'p1', text: '第1运', subtext: '甲子', ageRange: '5-14岁' },
      { id: 'p2', text: '第2运', subtext: '乙丑', ageRange: '15-24岁' },
      { id: 'p3', text: '第3运', subtext: '丙寅', ageRange: '25-34岁', selected: true }
    ],
    years: [
      { id: 'y2023', text: '2023', age: 33, branch: '卯' },
      { id: 'y2024', text: '2024', age: 34, branch: '辰', selected: true },
      { id: 'y2025', text: '2025', age: 35, branch: '巳' }
    ],
    months: [
      { id: 'm1', text: '正月' },
      { id: 'm2', text: '二月', selected: true },
      { id: 'm3', text: '三月' }
    ]
  }
}
