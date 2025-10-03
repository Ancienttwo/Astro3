import type { PalaceIdentifier } from './wealth'

export interface CombinationRule {
  key: 'AB' | 'AC' | 'BC' | 'AD' | 'BD' | 'CD'
  label: string
  description: string
  highlights: string[]
}

export const COMBINATION_RULES: Record<CombinationRule['key'], CombinationRule> = {
  AB: {
    key: 'AB',
    label: '禄权忌',
    description: '禄与权同宫或互现，忌象提示扩张后需转折。适合掌握资源但要谨防权责压力与资金紧张。',
    highlights: [
      '象征扩张→掌权→转折的连锁反应，宜预留风险缓冲。',
      '常见于创业或高扩张期，忌象出现时务必控管现金流。',
    ],
  },
  AC: {
    key: 'AC',
    label: '禄科忌',
    description: '禄与科强调投入与声誉并行，忌象提醒需兼顾财务循环。',
    highlights: [
      '适合资产升值、品牌打造或文教相关事业。',
      '忌象浮现时，注意计划执行与成本控管。',
    ],
  },
  BC: {
    key: 'BC',
    label: '权科忌',
    description: '权科并举代表制度与掌控力并存，忌象提示权责界线需厘清。',
    highlights: [
      '常见于专业管理阶层或需制度改革场景。',
      '忌象出现时可借由流程或制度优化来化解。',
    ],
  },
  AD: {
    key: 'AD',
    label: '禄忌',
    description: '禄忌组合重在“以支出换取结果”，投入后多伴随困难或收束。',
    highlights: [
      '常见于创业、现金流操作或需要持续投入的项目。',
      '忌象提醒要衡量收支平衡，避免过度扩张。',
    ],
  },
  BD: {
    key: 'BD',
    label: '权忌',
    description: '权忌象征升迁、掌权后的压力与考验，需要调节权力运用。',
    highlights: [
      '多见于升迁、掌舵后的再平衡阶段。',
      '忌象出现时需防权责失衡或团队关系紧绷。',
    ],
  },
  CD: {
    key: 'CD',
    label: '科忌',
    description: '科忌提示名誉、学业或专业领域的考验，需保守稳健。',
    highlights: [
      '宜关注知识信誉、文书合约或学业考试事项。',
      '忌象浮现时，应保持低调并检视流程，避免声誉损耗。',
    ],
  },
}

export const SIX_BODY_PALACES = new Set<PalaceIdentifier>(['命宫', '夫妻宫', '疾厄宫', '田宅宫', '福德宫', '父母宫'])
export const SIX_USE_PALACES = new Set<PalaceIdentifier>(['兄弟宫', '子女宫', '财帛宫', '迁移宫', '交友宫', '官禄宫'])

export interface DimensionRule {
  key: 'people' | 'events' | 'objects'
  summary: string
  notes: string[]
}

export const DIMENSION_RULES: DimensionRule[] = [
  {
    key: 'people',
    summary: '以阴阳判定聚散：六内宫主聚、六外宫主散。化忌落人宫，多指关系紧张或阻力。',
    notes: [
      '判断人事时，先看化忌是否落在六体宫（绝对有）或落在六用宫（有条件）。',
      '大运六亲宫化忌入本命、本疾、本田，为所指六亲不利。',
    ],
  },
  {
    key: 'events',
    summary: '以阴阳区分动静：六阴宫主变动，六阳宫主守成。',
    notes: [
      '化权决定开展、升迁；化忌提示转进、折返。',
      '若论考试或资格，化科为主，AC 触发年份多吉。',
    ],
  },
  {
    key: 'objects',
    summary: '以内外判断得失：六内宫主得，六外宫主失，化忌落财帛宫尤需留意资金流向。',
    notes: [
      '化禄作为来龙，化忌为去脉，化权为媒介，化科为调和。',
      '财帛宫化忌入六内宫主得财，入六外宫主失财。',
    ],
  },
]

export interface FlyingExchangeRule {
  formula: string
  interpretation: string
}

export const FLYING_EXCHANGE_RULES: FlyingExchangeRule[] = [
  { formula: '1→9D', interpretation: '命宫化忌入官禄宫，上班族倾向增强事业重心，易忽略配偶。' },
  { formula: '9→1D', interpretation: '官禄宫化忌入命宫，自我主导感强，工作类型不局限于上班。' },
  { formula: '1→5D', interpretation: '命宫化忌入财帛宫，重心转向赚钱，适合现金、仲介或买空卖空形式。' },
  { formula: '5→1D', interpretation: '财帛宫化忌入命宫，得财但偏节流，储蓄意识强。' },
  { formula: '5→9D', interpretation: '财帛宫化忌入官禄宫，投入事业需资金，易陷周转压力。' },
  { formula: '9→5D', interpretation: '官禄宫化忌入财帛宫，事业扩张需要资金，需谨防现金链紧绷。' },
  { formula: '5→10D', interpretation: '财帛宫化忌入田宅宫，所得多投向置产或家庭支出。' },
  { formula: '10→5D', interpretation: '田宅宫化忌入财帛宫，动用资产投资，有赚钱潜力亦易套牢。' },
  { formula: '9→10D', interpretation: '官禄宫化忌入田宅宫，事业与地产、门店等实体营运有关。' },
  { formula: '10→9D', interpretation: '田宅宫化忌入官禄宫，扩张事业版图，但同样需留意资金压力。' },
]

export interface PostTabooRule {
  title: string
  details: string[]
}

export const POST_TABOO_RULES: PostTabooRule[] = [
  {
    title: '生年忌分野',
    details: ['以生年忌落点区分忌前忌后，过忌后需改以【用】为主判断。'],
  },
  {
    title: '大运侧重点',
    details: [
      '过忌之后，以大运命宫与大运官禄宫为主，大运财帛为辅。',
      '官禄以化权为主线，化忌决定进退；财帛以化忌论吉凶，化权为转进。',
    ],
  },
  {
    title: '流年应期',
    details: ['注意先坐忌或先冲忌：先冲忌者过忌易解，先坐忌者需等回归定位。'],
  },
]

export interface PeriodFinanceEntry {
  target: PalaceIdentifier
  formula: string
  conclusion: string
  resultTags: string[]
}

export const PERIOD_FINANCE_TABLE: PeriodFinanceEntry[] = [
  { target: '命宫', formula: 'P5→1D', conclusion: '顺利但劳碌得财，倾向保守节俭。', resultTags: ['内得', '体顺', '阳少', '实有'] },
  { target: '兄弟宫', formula: 'P5→2D', conclusion: '与人合作多波折，结果损大财。', resultTags: ['外损', '用波折', '阴多', '实有'] },
  { target: '夫妻宫', formula: 'P5→3D', conclusion: '事业损小财，或财流向配偶。', resultTags: ['外损', '体顺', '阳少', '虚无'] },
  { target: '子女宫', formula: 'P5→4D', conclusion: '合伙投资多波折，易损大财。', resultTags: ['外损', '用波折', '阴多', '实有'] },
  { target: '财帛宫', formula: 'P5→5D', conclusion: '劳碌得财但易再投资或周转。', resultTags: ['内得', '用波折', '阳少', '虚无'] },
  { target: '疾厄宫', formula: 'P5→6D', conclusion: '顺利得大财，需注意健康负荷。', resultTags: ['内得', '体顺', '阴多', '实有'] },
  { target: '迁移宫', formula: 'P5→7D', conclusion: '奔波劳碌恐损财或破耗。', resultTags: ['外损', '用波折', '阳少', '虚无'] },
  { target: '交友宫', formula: 'P5→8D', conclusion: '合伙损大财，易因财失义。', resultTags: ['外损', '用波折', '阴多', '虚无'] },
  { target: '官禄宫', formula: 'P5→9D', conclusion: '劳碌得财但常再投入事业。', resultTags: ['内得', '用波折', '阳少', '虚无'] },
  { target: '田宅宫', formula: 'P5→10D', conclusion: '顺利得财并添置房产。', resultTags: ['内得', '体顺', '阴多', '实有'] },
  { target: '福德宫', formula: 'P5→11D', conclusion: '懂享受亦易财来财去。', resultTags: ['内得', '体顺', '阴多', '虚无'] },
  { target: '父母宫', formula: 'P5→12D', conclusion: '前期顺利终局失财，防范官非。', resultTags: ['外失', '体顺', '阴多', '实有'] },
]

export const SIDE_WEALTH_RULES = {
  lifetime: [
    '本命父母宫化忌入六内宫：终生有偏财运。',
    '本命父母宫化忌入六外宫：偏财运有限或波动大。',
  ],
  period: [
    '大运父母宫化忌入本命六内宫：该十年偏财机会旺。',
    '流年父母宫化忌入六内宫：当年偏财机缘显著，可再追踪流月。',
  ],
}

export const FLOW_ROUTES = {
  source: '化禄象征财富来源（来龙），可推钱从何处来。',
  sink: '化忌代表财富去处（去脉），判断钱花在哪里、是否易流失。',
  medium: '化权为媒介，掌管转进、升迁与资金调度。',
  harmonizer: '化科调和声誉与制度，确保项目顺利推进。',
}

export const RETIREMENT_HINT = '观察大运官禄宫化忌，可推测退休或事业退出时机。'

export const LITIGATION_RULES = {
  focusPalace: '官禄宫为官非诉讼的核心宫位。',
  combinations: ['本官化忌冲本命或本父', '大官化忌冲本命、本官、本父'],
  stars: ['文昌、文曲、廉贞化忌与票据、契约纠纷相关', '天刑化忌常涉及法律议题'],
}

export const STUDY_RULES = {
  observation: ['关注官禄宫的记过、退学、开除、官讼、牢狱等讯息'],
  priority: ['求学与考运四化优先顺序：禄 > 科 > 权 > 忌'],
  discipline: {
    A: '普通高中或一般科系',
    D: '私立学校或普通科系',
    B: '理工、化学及专业技术',
    C: '文学、历史与文科领域',
  },
}
