export type StarIdentifier =
  | '紫微'
  | '天府'
  | '天梁'
  | '天机'
  | '太阳'
  | '廉贞'
  | '武曲'
  | '七杀'
  | '天同'
  | '天相'
  | '太阴'
  | '巨门'
  | '贪狼'
  | '破军'

export interface StarKnowledgeEntry {
  element: string | string[]
  people: string[]
  items: string[]
  locations: string[]
  industries: string[]
  bodyParts: string[]
  diseases: string[]
}

function toArray(value?: string | string[]): string[] {
  if (!value) return []
  if (Array.isArray(value)) return value
  return value
    .split(/、|,|；|;/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export const STAR_KNOWLEDGE: Record<StarIdentifier, StarKnowledgeEntry> = {
  紫微: {
    element: '阴土',
    people: toArray('当权者、董事长、老板、管理者、老师'),
    items: toArray('黄金、钻石、玛瑙、钟表、古董、字画、珠宝'),
    locations: toArray('己土、潮湿之土、公家机关、高楼大厦、大饭店、高土坡'),
    industries: toArray('公教政界、大型民营企业、主管人员、行政人员、银行业、古董钟表业'),
    bodyParts: toArray('头、脑、脾胃'),
    diseases: toArray('脾胃、胃部相关疾病'),
  },
  天府: {
    element: '阳土',
    people: toArray('总经理、财务主管'),
    items: toArray('黄金、贵重物品、农作物、保险箱'),
    locations: toArray('高楼大厦、国税局、银行、仓库、山坡地'),
    industries: toArray('营建、代书、金融界、农场、公务员'),
    bodyParts: toArray('天庭、脾胃、胆'),
    diseases: toArray('消化系统、营养供输问题'),
  },
  天梁: {
    element: '阳土',
    people: toArray('教师、中医师、护理、父母、长者'),
    items: toArray('高大植物'),
    locations: toArray('教堂、庙宇、植物园'),
    industries: toArray('中药、公务员、教师、庙祝、保险、土木'),
    bodyParts: toArray('脑部'),
    diseases: toArray('脑神经、用脑过度、白发相关问题'),
  },
  天机: {
    element: '阴木',
    people: toArray('业务、秘书、幕僚、灵媒、运动员、宗教人士'),
    items: toArray('机车、飞机、五金、眼镜、玻璃、楼梯、小型庙宇'),
    locations: toArray('庙宇、马路边、圆环旁'),
    industries: toArray('教育、娱乐、养老院、餐饮小吃、旅游、水电维修'),
    bodyParts: toArray('泌尿系统、膀胱、耳朵'),
    diseases: toArray('四肢酸痛、肝功能、风邪感冒、神经系统疾患'),
  },
  太阳: {
    element: '阳火',
    people: toArray('政治家、律师、公关、官员、男性、父亲'),
    items: toArray('光、电、热能源、马达、发电机、电梯、引擎、电话、热水器'),
    locations: toArray('高地、铁塔、法院'),
    industries: toArray('公务员、教师、司法界、广播、电讯、贸易、旅游'),
    bodyParts: toArray('眼睛、心脏、大肠'),
    diseases: toArray('眼疾、高血压、头痛'),
  },
  廉贞: {
    element: '阴火',
    people: toArray('赌徒、犯人、风尘女郎'),
    items: toArray('电器、皮革、囚车、石头'),
    locations: toArray('荒山、空地、森林、风月场所、监狱'),
    industries: toArray('电脑、电子、家电、贸易、军警、娱乐情色'),
    bodyParts: toArray('心脏、口、唇'),
    diseases: toArray('性病、心脏病、内分泌、癌症、痔疮、青春痘'),
  },
  武曲: {
    element: '阴金',
    people: toArray('军警、金融人员、保险业、税务人员'),
    items: toArray('金钱、刀剑、钢铁器皿、五金、工厂机器'),
    locations: toArray('军营、警局、金融机构、寺塔庙宇'),
    industries: toArray('会计、银行、五金、机械、外科医疗、军警'),
    bodyParts: toArray('鼻子、肺部、气管、筋骨、经络'),
    diseases: toArray('呼吸系统、肺功能、鼻部疾病'),
  },
  七杀: {
    element: '阴金',
    people: toArray('军警、外科医生、针灸师'),
    items: toArray('刀枪、器械、医疗手术器具、五金'),
    locations: toArray('军营、警局、重工业区'),
    industries: toArray('武器制造、军警、屠宰、重工业、外科'),
    bodyParts: toArray('肺、鼻'),
    diseases: toArray('肺部、大肠相关疾病'),
  },
  天同: {
    element: '阳水',
    people: toArray('医师、教师、协调人'),
    items: toArray('饮用水、饮料、水管、马桶'),
    locations: toArray('土地公庙、小吃店、小水沟、水源处'),
    industries: toArray('教育、娱乐、养老院、餐饮小吃、旅游、水电'),
    bodyParts: toArray('泌尿系统、膀胱、耳朵'),
    diseases: toArray('泌尿系统、膀胱问题、糖尿病、疝气、中耳炎、听力问题'),
  },
  天相: {
    element: '阳水',
    people: toArray('老饕、媒人、调停者'),
    items: toArray('印章、证书、服饰'),
    locations: toArray('服饰店、餐厅、瀑布、喷水池'),
    industries: toArray('命相、刻印、服饰、百货、休闲餐饮'),
    bodyParts: toArray('泌尿系统、膀胱、皮肤'),
    diseases: toArray('皮肤过敏、毒品相关问题'),
  },
  太阴: {
    element: ['阴水'],
    people: toArray('女性、母亲、妻子、女儿'),
    items: toArray('轿车、化妆品、女性用品、清洁用品'),
    locations: toArray('池塘、溪流、水坑、旅馆、花圃'),
    industries: toArray('教育、美容、清洁、计程车、水产养殖'),
    bodyParts: toArray('眼睛、肝、白血球'),
    diseases: toArray('血液循环、女性疾病、低血压、糖尿病、眼疾'),
  },
  巨门: {
    element: '阴水',
    people: toArray('老师、律师、法师、业务员'),
    items: toArray('身份证、铁道、西药、符咒、大卡车'),
    locations: toArray('下水道、山洞、暗穴、坟墓'),
    industries: toArray('教育、法律、西药、走私、建筑、神坛、运输'),
    bodyParts: toArray('肛门、胃、口、管道、骨头、肠'),
    diseases: toArray('口腔、胃病、消化系统、免疫力问题'),
  },
  贪狼: {
    element: ['阳木', '阴水'],
    people: toArray('命理师、灵媒、风尘人士'),
    items: toArray('纸类、赌具、棋艺用品、情趣用品'),
    locations: toArray('公园、森林、酒家、舞厅、坟墓'),
    industries: toArray('色情、酒类、饮食、期货、教育、原料、木器、五术'),
    bodyParts: toArray('泪堂、肾'),
    diseases: toArray('肝脏、胆、肾虚火等问题'),
  },
  破军: {
    element: '阴水',
    people: toArray('船员、贩夫走卒、码头工人'),
    items: toArray('海水、舶来品、垃圾'),
    locations: toArray('海边、菜市场、垃圾场、外国'),
    industries: toArray('远洋运输、水手、外科医生、装潢、杂货'),
    bodyParts: toArray('肾脏'),
    diseases: toArray('心脏、血液相关病症'),
  },
}

export function getStarKnowledge(star: StarIdentifier): StarKnowledgeEntry | undefined {
  return STAR_KNOWLEDGE[star]
}

