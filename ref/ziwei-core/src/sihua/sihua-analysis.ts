/**
 * 紫微斗数四化和自化分析核心算法
 * 基于传统四化理论，实现完整的四化象分析系统
 */

export interface IStar {
  name: string
  type: 'main' | 'secondary' | 'minor' | 'time' | 'decoration'
  brightness?: string
  sihuaOrigin?: 'A' | 'B' | 'C' | 'D' // 生年四化
  sihuaInward?: 'A' | 'B' | 'C' | 'D' // 向心自化
  sihuaOutward?: 'A' | 'B' | 'C' | 'D' // 离心自化
}

export interface IPalace {
  name: string
  stem: string // 宫干
  branch: string // 地支
  stars: IStar[]
  palaceIndex: number // 1-12
}

export interface IChartData {
  palaces: IPalace[]
  natalSihuas: INatalSihua[] // 生年四化
}

export interface INatalSihua {
  type: 'A' | 'B' | 'C' | 'D' // 禄权科忌
  star: string // 化星名称
  palaceIndex: number // 宫位索引
}

export interface ISihuaTransform {
  type: 'A' | 'B' | 'C' | 'D'
  direction: 'inward' | 'outward' // 向心或离心
  star: string
  fromPalace: number
  toPalace: number
}

/**
 * 四化象类型定义
 */
export const SIHUA_TYPES = {
  A: {
    code: 'A',
    name: '化禄',
    title: '缘起',
    nature: '万有因缘之起点',
    peachBlossomMeaning: '异性缘佳、开朗恋爱、相识、随和、随缘、缘浓情深、早发姻缘',
    characteristics: ['新的开始', '新的认识', '新的感情', '万物更替', '忙碌劳碌'],
    桃花象: {
      基本涵义: '缘起桃花，象征一切所有的起点',
      婚姻角度: '人际的缘起、异性缘佳、荣观、开朗恋爱、相识、随和、随缘、缘浓情深、早发姻缘',
      特质: '在人——缘乃依禄而生，故禄在何宫，则该宫即为"缘聚"之处'
    }
  },
  B: {
    code: 'B',
    name: '化权',
    title: '缘变',
    nature: '万有因缘之自变数',
    peachBlossomMeaning: '争执、摩擦、占有、主导、霸道、强制、一厢情愿、激情、掌权、强势',
    characteristics: ['穷则变变则通', '多元化人生观', '实质拥有', '责任自立', '不屈朝性'],
    桃花象: {
      基本涵义: '缘变桃花，由天不由人的变化',
      婚姻角度: '人际的争执、摩擦、占有、主导、霸道、强制、一厢情愿、毛手毛脚、激情、掌权、强势、统御、负责、爱现、才华、能干、敢衝、有为',
      特质: '属实质主义者，凡事眼见为凭，易沦为物欲所改变，且曾受物质而困顿过'
    }
  },
  C: {
    code: 'C',
    name: '化科',
    title: '缘续',
    nature: '万有因缘之延续',
    peachBlossomMeaning: '善解人意、浪漫情怀、深情款款、多愁善感、斯文、风度、乐群、幽默',
    characteristics: ['念旧', '惜于已有', '在意而烦恼', '荫人或人荫', '文笔才华'],
    桃花象: {
      基本涵义: '缘续桃花，重心在已有的人事物',
      婚姻角度: '善解人意、浪漫情怀、深情款款、多愁善感、斯文、风度、乐群、幽默、和睦、风趣、风情、魅力、也主声名、声望、惜情、才艺、桃花、贵人、解厄、健康',
      特质: '科是"惜"，惜于已有的人、事、物的怀想，思念亦因而在意而烦恼精神'
    }
  },
  D: {
    code: 'D',
    name: '化忌',
    title: '缘灭',
    nature: '万有因缘之终点',
    peachBlossomMeaning: '桃花结束、钻牛角尖、内向、固执、亏欠、管束、溺爱、不顺遂、乖违',
    characteristics: ['结束', '机变数', '归主定位', '归藏', '果报相应'],
    桃花象: {
      基本涵义: '缘灭桃花，万有万象的一种"机变数"',
      婚姻角度: '桃花结束、钻牛角尖、内向、固执、亏欠、管束、溺爱、管束、不顺遂、乖违、冷淡、唠叨、依偎、报复、无情、缘灭、无缘、结束、生离、死别、粘腻、缘薄、怨叹、是非、困扰、困顿',
      特质: '化忌的本能，是"有机体"的变数，有机生命终止的刹那间，同时又隐藏了另一生机'
    }
  }
} as const

/**
 * 四化组合类型
 */
export const SIHUA_COMBINATIONS = {
  // 同组对待
  AD: {
    group: 'AD',
    alias: '禄忌对待',
    nature: '重点在物的得失',
    rule: '禄随忌走'
  },
  BC: {
    group: 'BC',
    alias: '权科对待',
    nature: '重点在人的对待',
    rule: '权科互因'
  },

  // 双象组合
  AB_COMBINATION: {
    code: 'AB',
    alias: '泛水桃花',
    meaning: '对象容易超过一位，表面热情、内心理性，往往得到后即转向下一段',
    财工作象: '生意格'
  },
  AC_COMBINATION: {
    code: 'AC',
    alias: '禄科桃花',
    meaning: '有缘有情的良性组合，就算缘尽也能好聚好散',
    财工作象: '才艺店面生意'
  },
  AD_COMBINATION: {
    code: 'AD',
    alias: '禄忌桃花',
    meaning: '起伏大，投入时全情投入，情势转折时会快速斩断',
    财工作象: '现金或冷门生意'
  },
  BC_COMBINATION: {
    code: 'BC',
    alias: '暗线桃花',
    meaning: '一显一隐，旧情淡去才迎来新缘，也常象征公开与地下关系并存',
    财工作象: '才艺'
  },
  BD_COMBINATION: {
    code: 'BD',
    alias: '权忌桃花',
    meaning: '来去都很突然，感情结束时难再牵挂，像擦肩而过的旅伴',
    财工作象: '专业技术'
  },
  CD_COMBINATION: {
    code: 'CD',
    alias: '科忌桃花',
    meaning: '情绪缠绵、藕断丝连，即便分手也容易旧情复燃或互相牵制',
    财工作象: '上班格'
  }
} as const

/**
 * 自化象类型
 */
export const SELF_TRANSFORM_TYPES = {
  // 同类自化（平方）
  AA: {
    code: 'A²',
    title: '禄+自化禄',
    meaning: '无尽的缘起，过度乐观，有福而不惜福，见异思迁，心无所驻，终究一场空',
    effect: '带动生年忌的宫位，生年忌在六内，主财，则财被拉破',
    象: '1数2，单象作双象解',
    人: '过度乐观，有福而不惜福',
    事: '见异思迁，心无所驻，终究一场空',
    物: '悠望无穷，循环无端，忝不知足'
  },
  BB: {
    code: 'B²',
    title: '权+自化权',
    meaning: '变而再变，天不随人愿，多元开展，深感无奈于天意',
    effect: '带动生年科的宫位',
    象: '1数2，单象作双象解',
    人: '多元开展，深感无奈于天意',
    事: '通权达变，难寄于一，相对付出',
    物: '现实主义者，眼见为凭，权衡造化'
  },
  CC: {
    code: 'C²',
    title: '科+自化科',
    meaning: '无限的追忆，惜情、恋栈，烦恼自求，有情变无情',
    effect: '带动生年权的宫位',
    象: '1数2，单象作双象解',
    人: '惜情、恋栈，烦恼自求，有情变无情',
    事: '文路、知识，用即所学，学而时习之',
    物: '惜于旧物，唯心主义者，心有变物説'
  },
  DD: {
    code: 'D²',
    title: '忌+自化忌',
    meaning: '终究成空，过度执著，无限保守，尊求生机',
    effect: '带动生年禄的宫位',
    象: '1数2，单象作双象解',
    人: '过度执著，无限保守，尊求生机',
    事: '原有存在的终结、归藏，果报相应',
    物: '收束再收束，几近于零，待时而再生'
  },

  // 同组不同类自化
  AD_TRANSFORM: {
    code: 'A→D',
    title: '禄+自化忌',
    meaning: '缘起告终，有变无',
    象: '2数1，同组故主同样的一件人、事、物',
    特论: '禄自化忌不论于何宫，而当行运至该宫，则谓福或缘将尽之时'
  },
  DA_TRANSFORM: {
    code: 'D→A',
    title: '忌+自化禄',
    meaning: '弃旧迎新，终而再始，物换星移的重生现象',
    详解: {
      在人: '所遇之人，交往中定有口角、是非',
      在事: '所遇之事，必有坎坷，不顺或遭小人',
      在物: '所遇之人经济条件必不佳，而曾遭困顿过',
      过程: '须经过某大运、流年、流月之后，前述之人、事、物的现象方告终止，尔后才有禄的空间'
    }
  },
  BC_TRANSFORM: {
    code: 'B→C',
    title: '权+自化科',
    meaning: '稳步发展，在变动、起伏中，渐趋平稳，易逢贵人提拔、帮助'
  },
  CB_TRANSFORM: {
    code: 'C→B',
    title: '科+自化权',
    meaning: '已有的进行改革，对已有的人事物做出重大的改革，受到青人提拔、升任而显贵'
  },

  // 不同组自化
  AB_TRANSFORM: {
    code: 'A→B',
    title: '禄+自化权',
    meaning: '缘起再变，双管齐下，旺盛的企图心，并具过度的乐观而不稳定，有还要更多'
  },
  BA_TRANSFORM: {
    code: 'B→A',
    title: '权+自化禄',
    meaning: '多元开展，双管齐下'
  },
  AC_TRANSFORM: {
    code: 'A→C',
    title: '禄+自化科',
    meaning: '缘起渐变，旧情未了，新缘又起，他人给予不知珍惜，认为理所当然而无感激之心'
  },
  CA_TRANSFORM: {
    code: 'C→A',
    title: '科+自化禄',
    meaning: '旧情未了，新缘又起'
  },
  BD_TRANSFORM: {
    code: 'B→D',
    title: '权+自化忌',
    meaning: '自变于无，突变更新，终而突变，旧有的仍在，而另有新的开辟、突变、创新'
  },
  DB_TRANSFORM: {
    code: 'D→B',
    title: '忌+自化权',
    meaning: '突变更新，终而突变'
  },
  CD_TRANSFORM: {
    code: 'C→D',
    title: '科+自化忌',
    meaning: '渐变更替，旧情绵绵，纠缠不断，应注意身体或心理的刑伤或变故',
    特别注意: '科虽为心理、思想的变化，实质上仍为身体的问题，宜上班、职员、幕僚'
  },
  DC_TRANSFORM: {
    code: 'D→C',
    title: '忌+自化科',
    meaning: '渐变更潜，对于人、事、物而言，都是渐变状态，急不得'
  }
} as const

/**
 * 向心力和离心力自化的特性
 */
export const SELF_TRANSFORM_DIRECTIONS = {
  向心自化: {
    性质: '物质的凝聚，缘起而发生某种之现象',
    特点: '它力性的，涵盖本宫及对宫',
    效应: '向心遇同类会排斥(爆炸)，不同类会吸附',
    桃花意义: '被动接受，越不要的越会碰到'
  },
  离心自化: {
    性质: '物质的分散，将已有的事物现象，变成没有或改变成为另一种模式',
    特点: '自发性的，与他人无关',
    效应: '在D自化A时会例外，会由少变多',
    桃花意义: '主动付出，越怕的越会用到',
    特殊规则: {
      'A→D': '有变无',
      'D→A': '无变有',
      '自化B': '以变为用',
      '向心B': '势必发生',
      '离心B': '时间到就发生'
    }
  }
} as const

/**
 * 先天气数组定义规则
 */
export function determineNatalGroup(chart: IChartData): {
  primaryGroup: INatalSihua[]
  secondaryElements: INatalSihua[]
  isDoubleSymbolPalace: boolean
  groupType: 'six_inner' | 'neighbors' | 'standard'
  priority: string
} {
  const { natalSihuas } = chart

  // 1. 生年忌必定要用
  const natalIgnore = natalSihuas.find(s => s.type === 'D')
  if (!natalIgnore) {
    throw new Error('生年忌为必需元素')
  }

  // 2. 检查双象同宫（含化忌）
  const palaceWithMultipleNatal = checkDoubleSymbolPalaces(chart)

  // 3. 优先级排序
  const threeHarmonyPalaces = getThreeHarmonyPalaces(chart)
  const sixInnerPalaces = getSixInnerPalaces(chart)
  const neighborPalaces = getNeighborPalaces()

  const primaryGroup = [natalIgnore]
  const additionalSihuas = natalSihuas.filter(s => s.type !== 'D')
  let priority = '邻宫四化'

  // 按优先级添加四化
  for (const sihua of additionalSihuas) {
    if (threeHarmonyPalaces.includes(sihua.palaceIndex)) {
      primaryGroup.push(sihua)
      priority = '命财官三合位四化'
    } else if (sixInnerPalaces.includes(sihua.palaceIndex)) {
      primaryGroup.push(sihua)
      if (priority === '邻宫四化') priority = '六内四化'
    } else if (neighborPalaces.includes(sihua.palaceIndex)) {
      primaryGroup.push(sihua)
    }
  }

  return {
    primaryGroup,
    secondaryElements: additionalSihuas.filter(s => !primaryGroup.includes(s)),
    isDoubleSymbolPalace: palaceWithMultipleNatal.length > 0,
    groupType: getGroupType(primaryGroup),
    priority
  }
}

/**
 * 检查双象同宫
 */
function checkDoubleSymbolPalaces(chart: IChartData): IPalace[] {
  return chart.palaces.filter(palace => {
    const natalCount = chart.natalSihuas.filter(s => s.palaceIndex === palace.palaceIndex).length
    const selfTransformCount = palace.stars.filter(s => s.sihuaInward || s.sihuaOutward).length
    return natalCount >= 2 || (natalCount >= 1 && selfTransformCount >= 1)
  })
}

const PALACE_OFFSETS = {
  WEALTH: 4,
  CAREER: 8,
  BROTHER: 0,
  SPOUSE: 1,
  CHILDREN: 2,
  WEALTH_2: 3,
  HEALTH: 4
} as const

const PALACE_COUNT = 12

/**
 * 获取三合位宫位（命财官）
 */
function getThreeHarmonyPalaces(chart: IChartData): number[] {
  const lifePalace = chart.palaces.find(p => p.name.includes('命'))?.palaceIndex ?? 1
  return [
    lifePalace, // 命宫
    (lifePalace + PALACE_OFFSETS.WEALTH - 1) % PALACE_COUNT + 1, // 财帛宫
    (lifePalace + PALACE_OFFSETS.CAREER - 1) % PALACE_COUNT + 1  // 官禄宫
  ]
}

/**
 * 获取六内宫位
 */
function getSixInnerPalaces(chart: IChartData): number[] {
  const lifePalace = chart.palaces.find(p => p.name.includes('命'))?.palaceIndex ?? 1
  return [
    lifePalace, // 命宫
    (lifePalace + PALACE_OFFSETS.BROTHER) % PALACE_COUNT + 1, // 兄弟宫
    (lifePalace + PALACE_OFFSETS.SPOUSE) % PALACE_COUNT + 1, // 夫妻宫
    (lifePalace + PALACE_OFFSETS.CHILDREN) % PALACE_COUNT + 1, // 子女宫
    (lifePalace + PALACE_OFFSETS.WEALTH_2) % PALACE_COUNT + 1, // 财帛宫
    (lifePalace + PALACE_OFFSETS.HEALTH) % PALACE_COUNT + 1  // 疾厄宫
  ]
}

/**
 * 获取邻宫
 */
function getNeighborPalaces(): number[] {
  return Array.from({ length: PALACE_COUNT }, (_, i) => i + 1)
}

const GROUP_TYPE_THRESHOLD = {
  SIX_INNER: 3,
  NEIGHBORS: 2
} as const

/**
 * 获取气数组类型
 */
function getGroupType(group: INatalSihua[]): 'six_inner' | 'neighbors' | 'standard' {
  if (group.length >= GROUP_TYPE_THRESHOLD.SIX_INNER) return 'six_inner'
  if (group.length === GROUP_TYPE_THRESHOLD.NEIGHBORS) return 'neighbors'
  return 'standard'
}

/**
 * 分析自化象
 */
export function analyzeSelfTransforms(palace: IPalace, natalSihuas: INatalSihua[]): {
  hasInward: boolean
  hasOutward: boolean
  inwardTypes: ('A' | 'B' | 'C' | 'D')[]
  outwardTypes: ('A' | 'B' | 'C' | 'D')[]
  combinations: string[]
  interpretations: string[]
  hasNatalSihua: boolean
  natalTypes: ('A' | 'B' | 'C' | 'D')[]
  complexityAnalysis: string
} {
  const inwardTypes: ('A' | 'B' | 'C' | 'D')[] = []
  const outwardTypes: ('A' | 'B' | 'C' | 'D')[] = []
  const palaceNatalSihuas = natalSihuas.filter(n => n.palaceIndex === palace.palaceIndex)
  const natalTypes = palaceNatalSihuas.map(n => n.type)

  palace.stars.forEach(star => {
    if (star.sihuaInward) inwardTypes.push(star.sihuaInward)
    if (star.sihuaOutward) outwardTypes.push(star.sihuaOutward)
  })

  const combinations = [
    ...natalTypes.map(t => t),
    ...inwardTypes.map(t => `i${t}`),
    ...outwardTypes.map(t => `x${t}`)
  ]

  const interpretations = generateSelfTransformInterpretations(
    natalTypes,
    inwardTypes,
    outwardTypes
  )

  const complexityAnalysis = analyzeComplexity(natalTypes, inwardTypes, outwardTypes)

  return {
    hasInward: inwardTypes.length > 0,
    hasOutward: outwardTypes.length > 0,
    inwardTypes,
    outwardTypes,
    combinations,
    interpretations,
    hasNatalSihua: natalTypes.length > 0,
    natalTypes,
    complexityAnalysis
  }
}

/**
 * 分析复杂度
 */
function analyzeComplexity(
  natalTypes: ('A' | 'B' | 'C' | 'D')[],
  inwardTypes: ('A' | 'B' | 'C' | 'D')[],
  outwardTypes: ('A' | 'B' | 'C' | 'D')[]
): string {
  const hasNatal = natalTypes.length > 0
  const hasSelfTransform = inwardTypes.length > 0 || outwardTypes.length > 0

  if (hasNatal && hasSelfTransform) {
    return '自性体：定象、定位都在本宫，同时包括对宫'
  } else if (!hasNatal && hasSelfTransform) {
    return '依附体：以依附在生年四化而成的现象论'
  } else if (hasNatal && !hasSelfTransform) {
    return '实有：代表实有，但因单象不成物，需寻找同组之另一象'
  }

  return '无明显四化现象'
}

/**
 * 生成自化象解释
 */
function generateSelfTransformInterpretations(
  natalTypes: ('A' | 'B' | 'C' | 'D')[],
  inward: ('A' | 'B' | 'C' | 'D')[],
  outward: ('A' | 'B' | 'C' | 'D')[]
): string[] {
  return [
    ...generateNatalInterpretations(natalTypes),
    ...generateSquareInterpretations(natalTypes, inward, outward),
    ...generateDirectionalInterpretations(inward, outward, natalTypes),
    ...generateCombinationEffects(inward, outward),
    ...generateBodyUseRelations(natalTypes, inward, outward)
  ]
}

function generateNatalInterpretations(natalTypes: ('A' | 'B' | 'C' | 'D')[]): string[] {
  return natalTypes.map(type => {
    const sihuaType = SIHUA_TYPES[type]
    return `生年${sihuaType.name}：${sihuaType.桃花象.婚姻角度}`
  })
}

function generateSquareInterpretations(
  natalTypes: ('A' | 'B' | 'C' | 'D')[],
  inward: ('A' | 'B' | 'C' | 'D')[],
  outward: ('A' | 'B' | 'C' | 'D')[]
): string[] {
  const interpretations: string[] = []

  natalTypes.forEach(natalType => {
    const hasInwardSame = inward.includes(natalType)
    const hasOutwardSame = outward.includes(natalType)

    if (hasInwardSame) {
      const selfTransformType = SELF_TRANSFORM_TYPES[`${natalType}${natalType}` as keyof typeof SELF_TRANSFORM_TYPES]
      if (selfTransformType) {
        interpretations.push(`向心${selfTransformType.meaning}`)
      }
    }

    if (hasOutwardSame) {
      const selfTransformType = SELF_TRANSFORM_TYPES[`${natalType}${natalType}` as keyof typeof SELF_TRANSFORM_TYPES]
      if (selfTransformType) {
        interpretations.push(`离心${selfTransformType.meaning}`)
      }
    }
  })

  return interpretations
}

function generateDirectionalInterpretations(
  inward: ('A' | 'B' | 'C' | 'D')[],
  outward: ('A' | 'B' | 'C' | 'D')[],
  natalTypes: ('A' | 'B' | 'C' | 'D')[]
): string[] {
  const interpretations: string[] = []

  // 向心自化解释
  inward.forEach(type => {
    if (!natalTypes.includes(type)) {
      const sihuaType = SIHUA_TYPES[type]
      interpretations.push(`向心${sihuaType.name}：物质凝聚，${sihuaType.桃花象.婚姻角度}`)
    }
  })

  // 离心自化解释
  outward.forEach(type => {
    if (!natalTypes.includes(type)) {
      const sihuaType = SIHUA_TYPES[type]
      interpretations.push(`离心${sihuaType.name}：分散耗散，${sihuaType.桃花象.婚姻角度}`)
    }
  })

  return interpretations
}

function generateCombinationEffects(
  inward: ('A' | 'B' | 'C' | 'D')[],
  outward: ('A' | 'B' | 'C' | 'D')[]
): string[] {
  if (inward.length > 0 && outward.length > 0) {
    return ['存在向心离心自化，形成群分现象，可能造成相抗衡或阻断']
  }
  return []
}

function generateBodyUseRelations(
  natalTypes: ('A' | 'B' | 'C' | 'D')[],
  inward: ('A' | 'B' | 'C' | 'D')[],
  outward: ('A' | 'B' | 'C' | 'D')[]
): string[] {
  const hasNatal = natalTypes.length > 0
  const hasSelfTransform = inward.length > 0 || outward.length > 0

  if (hasNatal && hasSelfTransform) {
    return ['宫内有体有用，不需假借它求：已可组成事件的起始与变化']
  } else if (!hasNatal && hasSelfTransform) {
    return ['宫内无体有用，须依附生年四化而缘起论：变化的缘起为同一生年四化所在的宫职起引']
  }

  return []
}

/**
 * 法象分析
 */
export function analyzeLegalSymbol(
  selfTransform: ISihuaTransform,
  natalSihuas: INatalSihua[]
): {
  legalSymbol: INatalSihua | null
  relationship: string
  interpretation: string
} {
  // 寻找同类生年四化
  const matchingNatal = natalSihuas.find(n => n.type === selfTransform.type)

  if (!matchingNatal) {
    return {
      legalSymbol: null,
      relationship: '无法象',
      interpretation: '此自化象无对应的生年四化，为依附体，需寻找其他关联'
    }
  }

  const relationship = selfTransform.type === 'D' ? '冲' : '照'
  const interpretation = generateLegalSymbolInterpretation(selfTransform, matchingNatal, relationship)

  return {
    legalSymbol: matchingNatal,
    relationship,
    interpretation
  }
}

/**
 * 生成法象解释
 */
function generateLegalSymbolInterpretation(
  selfTransform: ISihuaTransform,
  natalSihua: INatalSihua,
  relationship: string
): string {
  const sihuaType = SIHUA_TYPES[selfTransform.type]
  const direction = selfTransform.direction === 'inward' ? '向心' : '离心'

  return `${direction}${sihuaType.name}法象生年${sihuaType.name}，${relationship}第${natalSihua.palaceIndex}宫，${sihuaType.桃花象.婚姻角度}`
}

/**
 * 分析桃花四化格局
 */
export function analyzePeachBlossomSihua(chart: IChartData): {
  peachBlossomPalaces: {
    palace: IPalace
    natalSihuas: INatalSihua[]
    selfTransforms: ReturnType<typeof analyzeSelfTransforms>
    strength: 'strong' | 'medium' | 'weak'
    interpretation: string
    pattern: string
  }[]
  overallPattern: string
  recommendations: string[]
  natalGroup: ReturnType<typeof determineNatalGroup>
} {
  // 桃花相关宫位：命宫、夫妻宫、子女宫、迁移宫、福德宫
  const peachBlossomPalaceNames = ['命宫', '夫妻宫', '子女宫', '迁移宫', '福德宫']
  const peachBlossomPalaces = chart.palaces.filter(p =>
    peachBlossomPalaceNames.some(name => p.name.includes(name.replace('宫', '')))
  )

  const natalGroup = determineNatalGroup(chart)

  const analyzed = peachBlossomPalaces.map(palace => {
    const natalSihuas = chart.natalSihuas.filter(n => n.palaceIndex === palace.palaceIndex)
    const selfTransforms = analyzeSelfTransforms(palace, chart.natalSihuas)
    const strength = calculatePeachBlossomStrength(natalSihuas, selfTransforms)
    const interpretation = generatePeachBlossomInterpretation(palace, natalSihuas, selfTransforms)
    const pattern = determinePeachBlossomPattern(natalSihuas, selfTransforms)

    return {
      palace,
      natalSihuas,
      selfTransforms,
      strength,
      interpretation,
      pattern
    }
  })

  const overallPattern = generateOverallPattern(analyzed, natalGroup)
  const recommendations = generateRecommendations(analyzed, natalGroup)

  return {
    peachBlossomPalaces: analyzed,
    overallPattern,
    recommendations,
    natalGroup
  }
}

/**
 * 确定桃花格局
 */
function determinePeachBlossomPattern(
  natalSihuas: INatalSihua[],
  selfTransforms: ReturnType<typeof analyzeSelfTransforms>
): string {
  const natalTypes = natalSihuas.map(n => n.type).sort()

  // 检查双象组合
  if (natalTypes.includes('A') && natalTypes.includes('B')) return '泛水桃花（AB）'
  if (natalTypes.includes('A') && natalTypes.includes('C')) return '禄科桃花（AC）'
  if (natalTypes.includes('A') && natalTypes.includes('D')) return '禄忌桃花（AD）'
  if (natalTypes.includes('B') && natalTypes.includes('C')) return '暗线桃花（BC）'
  if (natalTypes.includes('B') && natalTypes.includes('D')) return '权忌桃花（BD）'
  if (natalTypes.includes('C') && natalTypes.includes('D')) return '科忌桃花（CD）'

  // 检查自化平方
  const hasSquare = natalTypes.some(type =>
    selfTransforms.inwardTypes.includes(type) || selfTransforms.outwardTypes.includes(type)
  )
  if (hasSquare) return '自化平方格局'

  // 单象格局
  if (natalTypes.length === 1) {
    const type = natalTypes[0]
    return `单象${SIHUA_TYPES[type].title}桃花`
  }

  return '一般桃花格局'
}

const STRENGTH_SCORES = {
  LU: 3, // 化禄最利桃花
  KE: 2, // 化科次之
  QUAN: 1, // 化权有争执但也有魅力
  JI: -1, // 化忌不利桃花
  INWARD_POSITIVE: 2,
  INWARD_QUAN: 1,
  INWARD_JI: -1,
  OUTWARD_LU: 1,
  OUTWARD_KE: 1,
  OUTWARD_JI: -2,
  SQUARE_PENALTY: -2
} as const

const STRENGTH_THRESHOLD = {
  STRONG: 5,
  MEDIUM: 2
} as const

/**
 * 计算桃花强度
 */
function calculatePeachBlossomStrength(
  natalSihuas: INatalSihua[],
  selfTransforms: ReturnType<typeof analyzeSelfTransforms>
): 'strong' | 'medium' | 'weak' {
  let score = 0

  // 生年四化得分
  natalSihuas.forEach(n => {
    if (n.type === 'A') score += STRENGTH_SCORES.LU
    if (n.type === 'C') score += STRENGTH_SCORES.KE
    if (n.type === 'B') score += STRENGTH_SCORES.QUAN
    if (n.type === 'D') score += STRENGTH_SCORES.JI
  })

  // 自化得分
  selfTransforms.inwardTypes.forEach(t => {
    if (t === 'A' || t === 'C') score += STRENGTH_SCORES.INWARD_POSITIVE
    if (t === 'B') score += STRENGTH_SCORES.INWARD_QUAN
    if (t === 'D') score += STRENGTH_SCORES.INWARD_JI
  })

  selfTransforms.outwardTypes.forEach(t => {
    if (t === 'A') score += STRENGTH_SCORES.OUTWARD_LU
    if (t === 'C') score += STRENGTH_SCORES.OUTWARD_KE
    if (t === 'D') score += STRENGTH_SCORES.OUTWARD_JI
  })

  // 平方惩罚
  const hasSquare = natalSihuas.some(n =>
    selfTransforms.inwardTypes.includes(n.type) || selfTransforms.outwardTypes.includes(n.type)
  )
  if (hasSquare) score += STRENGTH_SCORES.SQUARE_PENALTY

  if (score >= STRENGTH_THRESHOLD.STRONG) return 'strong'
  if (score >= STRENGTH_THRESHOLD.MEDIUM) return 'medium'
  return 'weak'
}

const PALACE_BASIC_MEANINGS = {
  '命宫': '命宫为本命桃花格局，先天吸引力与自我认知',
  '夫妻宫': '夫妻宫为正缘与婚姻质量，配偶特质与感情模式',
  '子女宫': '子女宫为短期情缘与性缘，露水情缘与合伙机缘',
  '迁移宫': '迁移宫为外在魅力与机遇，社交磁场与形象投射',
  '福德宫': '福德宫为精神层面的情感需求，隐性渴望与因果业力'
} as const

/**
 * 生成桃花解释
 */
function generatePeachBlossomInterpretation(
  palace: IPalace,
  natalSihuas: INatalSihua[],
  selfTransforms: ReturnType<typeof analyzeSelfTransforms>
): string {
  const interpretations: string[] = []

  // 基本宫位意义
  const palaceName = palace.name as keyof typeof PALACE_BASIC_MEANINGS
  const basicMeaning = PALACE_BASIC_MEANINGS[palaceName]
  if (basicMeaning) {
    interpretations.push(basicMeaning)
  }

  // 四化具体分析
  if (selfTransforms.interpretations.length > 0) {
    interpretations.push(...selfTransforms.interpretations)
  } else if (natalSihuas.length === 0) {
    interpretations.push('此宫无明显四化现象，桃花能量较弱')
  }

  return interpretations.join('；') || '此宫桃花能量较弱'
}

type PeachBlossomAnalyzedPalace = {
  palace: IPalace
  strength: 'strong' | 'medium' | 'weak'
  pattern: string
}

const PATTERN_THRESHOLDS = {
  STRONG_MULTIPLE: 2,
  MEDIUM_STRONG_MIN: 1,
  MEDIUM_MULTIPLE: 2
} as const

/**
 * 生成整体格局
 */
function generateOverallPattern(
  analyzed: PeachBlossomAnalyzedPalace[],
  natalGroup: ReturnType<typeof determineNatalGroup>
): string {
  const strongCount = analyzed.filter(a => a.strength === 'strong').length
  const mediumCount = analyzed.filter(a => a.strength === 'medium').length

  let basePattern = ''
  if (strongCount >= PATTERN_THRESHOLDS.STRONG_MULTIPLE) {
    basePattern = '强桃花格局，异性缘佳，感情丰富但需注意专一'
  } else if (strongCount === PATTERN_THRESHOLDS.MEDIUM_STRONG_MIN && mediumCount >= PATTERN_THRESHOLDS.MEDIUM_STRONG_MIN) {
    basePattern = '中等桃花格局，有一定异性缘，感情稳定'
  } else if (mediumCount >= PATTERN_THRESHOLDS.MEDIUM_MULTIPLE) {
    basePattern = '平稳桃花格局，感情发展较为平缓'
  } else {
    basePattern = '弱桃花格局，感情发展需要主动经营'
  }

  const groupTypeMap = {
    six_inner: '六内宫为主',
    neighbors: '邻宫为辅',
    standard: '标准配置'
  } as const

  const groupInfo = `先天气数组采用${natalGroup.priority}，${groupTypeMap[natalGroup.groupType]}`

  return `${basePattern}。${groupInfo}。${natalGroup.isDoubleSymbolPalace ? '命盘中存在双象同宫，感情变化较为复杂。' : ''}`
}

/**
 * 生成建议
 */
function generateRecommendations(
  analyzed: PeachBlossomAnalyzedPalace[],
  natalGroup: ReturnType<typeof determineNatalGroup>
): string[] {
  const recommendations: string[] = []

  // 根据整体格局给建议
  if (natalGroup.isDoubleSymbolPalace) {
    recommendations.push('命盘有双象同宫，感情易有变化，宜保持理性，不宜冲动决定')
  }

  // 根据各宫位情况给建议
  analyzed.forEach(a => {
    if (a.strength === 'strong') {
      if (a.pattern.includes('平方')) {
        recommendations.push(`${a.palace.name}有自化平方，桃花旺盛但易破耗，宜慎选对象，避免过度投入`)
      } else {
        recommendations.push(`${a.palace.name}桃花旺盛，宜把握良缘，但需防范泛滥或多角关系`)
      }
    } else if (a.strength === 'weak') {
      recommendations.push(`${a.palace.name}桃花较弱，可通过提升个人魅力、改善人际关系或调整居住环境来增强`)
    }
  })

  // 根据先天气数组优先级给建议
  if (natalGroup.priority === '命财官三合位四化') {
    recommendations.push('先天气数组集中在三合位，事业与感情关联度高，宜在工作环境中寻找良缘')
  } else if (natalGroup.priority === '六内四化') {
    recommendations.push('先天气数组集中在六内宫，感情发展与个人内在修养关联度高，宜先完善自己')
  }

  return recommendations
}
