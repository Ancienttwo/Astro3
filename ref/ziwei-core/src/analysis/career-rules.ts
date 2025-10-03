import type { PalaceIdentifier } from './wealth'

export interface CareerPrinciple {
  title: string
  details: string[]
}

export interface CareerFormulaRule {
  formula: string
  interpretation: string
}

export interface CareerFlowRule {
  title: string
  details: string[]
}

export interface CareerStarHint {
  condition: string
  advice: string
}

export interface PalaceCareerMappingEntry {
  branch: string
  industries: string[]
}

export const CAREER_CORE_PRINCIPLES: CareerPrinciple[] = [
  {
    title: '四化组合辨识',
    details: [
      '分析事业前先确认命盘属于哪个禄权科忌组合，明确先天用神结构。',
      '先天象数以本宫或对宫为主，六大组合（禄权忌、禄科忌、权科忌、禄忌、权忌、科忌）是后续判断基础。',
    ],
  },
  {
    title: '来因宫格局',
    details: [
      '论财官时，命宫、疾厄、田宅最为关键，财帛、官禄、福德次之。',
      '来因落六体宫（命、夫、疾、田、福、父）代表绝对存在；落其余宫位为相对存在。',
      '来因落六内宫（命、财、疾、官、田、福）为自立格；落六外宫为他荫格。',
    ],
  },
  {
    title: '先天与后天重心',
    details: [
      '先天：先看生年忌是否落六内宫，再看生年禄权科的分布与命财官四化。',
      '后天：大运命宫是否走到生年四化所在宫位；大运财、官若照到生年四化同样视为“有”。',
      '大运或大财化忌入本命、本疾、本田最为吉利，代表好运得财。',
    ],
  },
  {
    title: '体用策略',
    details: [
      '命宫为体，财帛与官禄同属命宫三合之用；田宅为体生用，迁移为体化用。',
      '财帛宫推理财方式与创业适性；官禄宫判断事业路径、升迁与学业。',
    ],
  },
  {
    title: '人事物维度',
    details: [
      '人：以阴阳判断聚散；化忌入人宫多主关系紧张或阻滞。',
      '事：六阴宫主动、六阳宫主动中守；化权主开展、化忌主转进。',
      '物：六内主得、六外主失；财帛化忌入六内为吉，入六外需防耗损。',
    ],
  },
]

export const CAREER_SELECTION_RULES: CareerPrinciple[] = [
  {
    title: '行业选择指引',
    details: [
      '职业类型可参考财帛位化禄星的行业特质；官禄位化禄星描述实际工作现象。',
      '化禄入本命或财帛，宜以落宫星曜特质作为择业方向。',
      '若本命财帛化忌入某宫，行运走到该宫或冲宫时，可利用该宫星曜特质转业。',
      '本命权禄入福德照财帛，可依据福德宫星曜特质选择行业，更易获利。',
      '本命或大财的化禄转化忌，可参酌忌入宫的星曜属性调校发展。',
    ],
  },
  {
    title: '大运化忌参考',
    details: [
      '大财化忌入本命、财帛、田宅、疾厄，可借忌入宫的星曜来寻求行业定位。',
      '财帛化忌入夫妻冲官禄，多借贷行商；若化忌入夫妻自身，不宜用配偶名义创业。',
      '官禄化忌入命、迁移、田宅、父母、疾厄等，可进一步判定适合上班或创业与否。',
    ],
  },
  {
    title: '创业与权柄',
    details: [
      '本命忌入夫妻冲官禄或官禄位，不宜创业，多劳又多耗。',
      '本命权禄入命逢自化禄需出外发展，化权自化表示实权被稀释。',
      '命宫坐七杀、破军、廉贞、紫微、天府等，若再会化权与辅星，较能掌实权。',
      '权星若不为原命格所有，即使行运化权，也只是短暂的权力假象。',
    ],
  },
  {
    title: '家族与职场互动',
    details: [
      '夫官线逆水忌，常因婚姻而事业顺遂；官忌入夫妻、夫忌入官皆有配偶助力之象。',
      '夫妻化禄入命迁或子田，婚后事业与经济会改善。',
      '夫妻化忌入迁移或财帛，注意人际或资金受异性影响。',
    ],
  },
]

export const CAREER_EXCHANGE_RULES: CareerFormulaRule[] = [
  { formula: '财帛→命/财帛', interpretation: '化禄入本命或财帛，可依该宫星曜选择职业方向。' },
  { formula: '财帛(忌)→宫位', interpretation: '本命财帛化忌入某宫，行运到该宫或对宫时适合利用该宫星曜调整职业。' },
  { formula: '本权禄→福德照财', interpretation: '本命权禄入福德照财帛，可依福德星曜特质选择行业以增益收益。' },
  { formula: '本忌→夫妻冲官', interpretation: '本命忌入夫妻冲官禄，不宜自创业；财帛忌入夫妻冲官禄，多靠借贷行商。' },
  { formula: '大财忌→命/财/田/疾', interpretation: '大财化忌入这四宫，可凭忌入宫星曜特性调整事业策略。' },
]

export const CAREER_POST_TABOO_RULES: CareerFlowRule[] = [
  {
    title: '忌前与忌后',
    details: [
      '生年忌落点为分水岭，过忌之后行运判断需改以【用】为主。',
      '过忌后以大运命宫、大运官禄为主轴，大运财帛为辅。',
    ],
  },
  {
    title: '流年应期',
    details: [
      '观察先坐忌或先冲忌：先冲忌者过忌即解，先坐忌需等待归位。',
      '飞宫双象或自化双象，多暗示流年或流月的特定时机。',
    ],
  },
]

export const CAREER_STAR_HINTS: CareerStarHint[] = [
  { condition: '命宫化忌入夫妻冲官禄', advice: '事业易破耗，不宜自己创业，需留意周转。' },
  { condition: '命宫化忌入迁移', advice: '外出无贵人，人脉不佳，不适合创事业。' },
  { condition: '命宫自化忌', advice: '适合学一技之长或从事冷门行业，不宜稳定上班。' },
  { condition: '官禄自忌', advice: '求谋多阻，上班族易遇问题，宜走外勤或灵活行业。' },
  { condition: '官禄忌入命', advice: '不宜创业，稳定就业较佳。' },
  { condition: '官禄忌入迁移', advice: '出外创业较有机会，但收益有限。' },
  { condition: '官禄忌入田宅', advice: '适合家庭工厂或在家创业。' },
  { condition: '官禄忌入父母/疾厄', advice: '不利创业或合伙，宜守成就业。' },
  { condition: '财帛忌入夫妻冲官禄', advice: '本钱不足需借贷周转，不宜以自己名义投资。' },
  { condition: '夫妻化禄入命迁子田', advice: '婚后经济改善，可立业成家。' },
  { condition: '权禄入官禄，忌入官禄', advice: '前者宜自立创业；后者适合稳定工作或家庭角色。' },
]

export const CAREER_INDUSTRY_MAPPING: CareerPrinciple[] = [
  {
    title: '主星与行业倾向',
    details: [
      '紫微、天府、武曲偏向商科与经营管理。',
      '太阳、天机适合贸易、化工及具流动性的行业。',
      '廉贞、破军多与电机、电子、科技制造相关。',
      '太阴、天同、文昌、文曲适合文科、美术、文化传播。',
      '天机、天梁、太阴会煞或昌曲，宜从事资讯、软件、高科技领域。',
      '天相、七杀适合金融保险、军警等具权威性的行业。',
      '身宫逢文曲、右弼、天钺，易走异途功名。',
    ],
  },
  {
    title: '特殊职场现象',
    details: [
      '杀破狼命格逢禄存，事业起伏大但能成功；化忌入子田线需谨慎。',
      '破军化禄入官禄起伏大；化权宜发展专利权或创新。',
      '贪狼坐辰戌官禄需辅佐方能发挥；配煞星反而有突破。',
      '廉贪+陀罗在官禄易东西两面落差，大运行甲戊方较佳。',
      '太阳、太阴化权位置决定是否能掌实权。',
    ],
  },
]

export const CAREER_BRANCH_INDUSTRIES: PalaceCareerMappingEntry[] = [
  { branch: '子', industries: ['艺术', '政治', '水利', '运输', '餐饮', '金融'] },
  { branch: '丑', industries: ['金属', '机械', '技师', '公教', '学术研究'] },
  { branch: '寅', industries: ['医护', '法律', '护理', '保姆'] },
  { branch: '卯', industries: ['宗教', '教育', '文学', '美术', '演艺'] },
  { branch: '辰', industries: ['教育', '宗教', '政治', '法律', '矿业', '中介'] },
  { branch: '巳', industries: ['写作', '评论', '军警'] },
  { branch: '午', industries: ['医护', '厨艺', '政治', '宗教', '技术'] },
  { branch: '未', industries: ['建筑', '工程', '社服', '写作'] },
  { branch: '申', industries: ['烹饪', '中介', '学术', '金融'] },
  { branch: '酉', industries: ['教育', '学术', '艺文', '编辑技术'] },
  { branch: '戌', industries: ['著作', '音乐', '投机', '金属', '机械', '农工商'] },
  { branch: '亥', industries: ['外科', '技术', '银楼', '宗教（僧侣）'] },
]
