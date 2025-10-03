export interface HealthPrinciple {
  title: string
  details: string[]
}

export interface RiskCombinationRule {
  title: string
  conditions: string[]
}

export interface HealthRiskIndexEntry {
  description: string
  level: number
}

export interface MitigationEntry {
  description: string
  level: number
}

export interface SuicidalPatternRule {
  title: string
  conditions: string[]
}

export interface AccidentPatternRule {
  title: string
  conditions: string[]
}

export interface TimeConsideration {
  key: string
  notes: string[]
}

export interface StarSymptomEntry {
  star: string
  organs: string[]
  symptoms: string[]
}

export const HEALTH_CORE_PRINCIPLES: HealthPrinciple[] = [
  {
    title: '寿元与健康判别顺序',
    details: [
      '寿元判断优先观察大运疾厄宫是否出现凶象，再看大运奴仆宫。',
      '若奴、疾、田形成交易象，尤需留意寿元与重大健康危机。',
      '健康看命、福、疾的互动；寿元则侧重奴、疾、田的交易。',
    ],
  },
  {
    title: '自化与飞宫的影响',
    details: [
      '大运疾厄宫出现自化多代表该十年身体有变化；若原已见凶象，自化会加重风险。',
      '女命在生育年龄若疾厄宫自化，可视为生育讯号。',
      '飞宫双象或自化双象暗示时间概念，应结合流年、流月判断。',
    ],
  },
  {
    title: '人事物立极',
    details: [
      '以疾厄宫立太极：本疾为身体之命，本福为身体之疾，本命为命太极。命、福、疾的交易多指健康议题。',
      '四正（父、疾、夫、官）若出现凶象，也需纳入健康与身体变动的判断。',
    ],
  },
]

export const HEALTH_RISK_COMBINATIONS: RiskCombinationRule[] = [
  {
    title: '寿元高风险组合',
    conditions: [
      '飞宫象形成奴、疾、田的交易（含大运叠本命）。',
      '出现 A 出或 C 出（禄或科外泄），福德宫再出现相同现象尤忌。',
      '大运、流年重复出现奴、疾、田凶象，且命福疾也形成交易。',
    ],
  },
  {
    title: 'AD 交会秘技',
    conditions: [
      '相对宫位化出 AD 交会于同一宫位，高度关注；若同星则无解，异星可借物解。',
      '关注命夫、命迁、奴疾等相对宫位的 AD 交会，以判断姻缘、出外、灾劫。',
    ],
  },
]

export const HEALTH_RISK_INDEX: HealthRiskIndexEntry[] = [
  { description: '大运子女宫叠迁移或疾厄（暗示意外动象）', level: 1 },
  { description: '大运命迁飞出禄忌交会在大运命迁线或父疾线', level: 2 },
  { description: '大运命迁飞出禄忌交会在本命命迁线或父疾线', level: 3 },
  { description: '大运命迁或子田线为甲庚、丙庚、丁辛，化禄忌入本命父疾/命迁/子田线', level: 4 },
  { description: '大运疾厄化忌入本父或迁移', level: 5 },
]

export const HEALTH_MITIGATION_INDEX: MitigationEntry[] = [
  { description: '命疾或大运疾厄有自化科', level: 1 },
  { description: '大运疾厄或飞宫化科入命疾', level: 3 },
  { description: '命疾或大运疾厄得生年化科', level: 5 },
]

export const HEALTH_TIME_CONSIDERATIONS: TimeConsideration[] = [
  {
    key: '流年流月',
    notes: [
      '若疾厄宫出现自化双象或 AD 组合，需同步观察流年、流月经过生年 C、D 的时段。',
      '飞宫逢自化时，多取下半年为关键期。',
    ],
  },
]

export const SUICIDAL_PATTERNS: SuicidalPatternRule[] = [
  {
    title: '自杀象成立要件',
    conditions: [
      '福德宫必见凶象：如大运福德化忌冲本命、本福，或生年自化重叠。',
      '同时出现大运疾厄、大运奴仆凶象，并形成奴、疾、田交易。',
    ],
  },
  {
    title: '自杀方式提示',
    conditions: [
      '破军：开瓦斯或与燃气相关之自杀。',
      '廉贞+天相：服毒、安眠药等。',
      '天梁+文曲：上吊。',
    ],
  },
]

export const ACCIDENT_PATTERNS: AccidentPatternRule[] = [
  {
    title: '终身意外关注',
    conditions: [
      '命宫、迁移宫、疾厄宫为原太极盘的核心，应优先检查。',
      '行运时关注大运命宫、大运迁移、大运疾厄的凶象。',
    ],
  },
  {
    title: '交通事故断诀',
    conditions: [
      '命迁宫干化出的禄忌交会同宫，尤其落在命迁线或父疾线最忌。',
      '甲庚 → 太阳禄忌、丙庚 → 天同禄忌、丁辛 → 巨门禄忌，若落命迁或子田线则凶象明显。',
      '观察疾厄宫垂象决定伤害程度：无凶象为虚惊，有凶象则分轻伤、重伤、断肢等。',
    ],
  },
]

export const TRAFFIC_VEHICLE_MAPPING: Record<string, string> = {
  太阴: '四轮私用车',
  文昌: '四轮公共车或计程车',
  文曲: '四轮公共车或计程车',
  巨门: '大卡车、砂石车',
  破军: '货柜车、联结车',
}

export const STAR_SYMPTOMS: StarSymptomEntry[] = [
  { star: '紫微', organs: ['脾胃'], symptoms: ['胃寒', '服气', '脾胃系统失调'] },
  { star: '天机', organs: ['肝胆', '四肢', '筋骨', '神经系统'], symptoms: ['胆结石', '神经系统问题', '中风'] },
  { star: '太阳', organs: ['头部', '脑部', '眼睛', '心脏', '肠道'], symptoms: ['高血压', '头痛', '眼疾', '心火旺', '痔疮'] },
  { star: '武曲', organs: ['肺经', '鼻', '胸部'], symptoms: ['呼吸系统疾病', '咳嗽', '鼻病', '皮肤搔痒'] },
  { star: '天同', organs: ['肝胆', '耳', '泌尿系统'], symptoms: ['耳疾', '泌尿系统炎症', '糖尿病', '疝气'] },
  { star: '廉贞', organs: ['心脏'], symptoms: ['胸闷', '心气不足', '性病', '内分泌问题'] },
  { star: '天府', organs: ['脾胃'], symptoms: ['脾胃疾病', '消化不良'] },
  { star: '太阴', organs: ['眼睛', '血液循环'], symptoms: ['糖尿病', '脑中风', '妇科疾病'] },
  { star: '贪狼', organs: ['肝胆', '肾'], symptoms: ['肝胆疾病', '性病', '肾虚火'] },
  { star: '巨门', organs: ['口腔', '胃', '管道'], symptoms: ['口腔疾病', '胃寒', '胃出血', '哮喘'] },
  { star: '天相', organs: ['皮肤', '膀胱'], symptoms: ['皮肤疾病', '膀胱炎', '毒品中毒'] },
  { star: '天梁', organs: ['脾胃', '脑'], symptoms: ['胀气', '打嗝', '脑神经衰弱', '脑瘤'] },
  { star: '七杀', organs: ['肺', '骨架'], symptoms: ['肺经疾病', '手脚受伤', '骨骼问题'] },
  { star: '破军', organs: ['肾', '经水'], symptoms: ['经水不调', '妇科疾病', '心律不整'] },
  { star: '左辅', organs: ['脾胃'], symptoms: ['脾胃虚弱'] },
  { star: '右弼', organs: ['经水'], symptoms: ['经水不足'] },
  { star: '文昌', organs: ['呼吸系统'], symptoms: ['血光之灾', '呼吸道疾病', '便秘'] },
  { star: '文曲', organs: ['神经系统', '肾水'], symptoms: ['上下寒热不调', '神经系统疾病', '经水失调'] },
]
