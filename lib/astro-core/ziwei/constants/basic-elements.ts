/**
 * 紫微斗数基础元素常量
 * Basic Elements Constants for ZiWei DouShu
 */

// 天干 (Heavenly Stems)
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const

// 地支 (Earthly Branches)
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

/**
 * @ai-context ZIWEI_PALACE_SYSTEM - 紫微斗数十二宫位系统
 * @layout counter-clockwise (逆时针排列) - Traditional Chinese astronomical layout
 * @starting-palace 命宫 (Life Palace) at index 0 - Primary palace determining fate
 * @movement-direction 逆时针：命宫→兄弟→夫妻→子女→财帛→疾厄→迁移→交友→官禄→田宅→福德→父母
 * @why-traditional 基于古代天文观测，北斗七星围绕紫微星运转的逆时针轨迹，保持算法 authenticity
 * @ai-usage 通过 Algorithm Registry.getZiWei() 访问，无需关心内部索引布局
 * 
 * @description 
 * 十二宫系统是紫微斗数的核心结构，每个宫位代表人生不同领域：
 * - 本命十二宫：分析个人基本性格和命运结构
 * - 大限十二宫：分析10年大运的吉凶变化  
 * - 流年十二宫：分析当年各个领域的运势
 * 
 * @indexing-system
 * Array indices 0-11 correspond to palace positions in counter-clockwise order
 * 数组索引 0-11 对应宫位的逆时针排列顺序
 * 
 * @calculation-usage
 * const palaceIndex = (startPosition + offset) % 12  // 宫位计算公式
 * const palaceName = PALACE_NAMES[palaceIndex]       // 获取宫位名称
 * 
 * @historical-significance
 * 逆时针排列源于古代天文观测：
 * - 紫微垣（北极周围星群）的视觉运动方向
 * - 北斗七星绕极星的周日运动轨迹
 * - 与地支十二时辰的天文对应关系
 * 
 * @modern-validation
 * 现代天文学证实了古代观测的准确性：
 * - 地球自转导致星空的逆时针视运动
 * - 北极星周围星群确实逆时针旋转
 * - 保持传统算法确保了文化传承的完整性
 */
export const PALACE_NAMES = [
  '命宫', // 0 - Life Palace (生命主宫) - 个性、命运、人生格局
  '兄弟', // 1 - Siblings Palace (兄弟姐妹) - 手足关系、同辈缘分
  '夫妻', // 2 - Spouse Palace (婚姻伴侣) - 感情婚姻、配偶关系
  '子女', // 3 - Children Palace (子女后代) - 子女缘分、创造力
  '财帛', // 4 - Wealth Palace (财富财运) - 金钱观念、财富累积
  '疾厄', // 5 - Health Palace (健康疾病) - 身体状况、健康运势
  '迁移', // 6 - Travel Palace (外出变动) - 出外运、环境变化
  '交友', // 7 - Friends Palace (交友宫) - 人际关系、朋友关系
  '官禄', // 8 - Career Palace (事业官运) - 职场发展、社会地位
  '田宅', // 9 - Property Palace (房产家庭) - 不动产、居住环境
  '福德', // 10 - Fortune Palace (福德精神) - 精神享受、内在修养
  '父母'  // 11 - Parents Palace (父母长辈) - 父母关系、长辈缘分
] as const

// 大限十二宫 (12 Palaces) - 逆时针排列
export const MAJOR_PERIOD_PALACE_NAMES = [
  '大命', '大兄', '大妻', '大子', '大财', '大疾',
  '大迁', '大友', '大官', '大田', '大福', '大父'
] as const

// 流年十二宫 (12 Palaces) - 逆时针排列  
export const FLEETING_YEAR_PALACE_NAMES = [
  '年命', '年兄', '年妻', '年子', '年财', '年疾',
  '年迁', '年友', '年官', '年田', '年福', '年父'
] as const

// 小限十二宫 (12 Palaces) - 逆时针排列
export const MINOR_PERIOD_PALACE_NAMES = [
  '小限', '小兄', '小妻', '小子', '小财', '小疾', 
  '小迁', '小友', '小官', '小田', '小福', '小父'
] as const

// Type definitions for basic elements
export type Stem = typeof STEMS[number]
export type Branch = typeof BRANCHES[number]
export type PalaceName = typeof PALACE_NAMES[number]
export type MajorPeriodPalaceName = typeof MAJOR_PERIOD_PALACE_NAMES[number]
export type FleetingYearPalaceName = typeof FLEETING_YEAR_PALACE_NAMES[number]
export type MinorPeriodPalaceName = typeof MINOR_PERIOD_PALACE_NAMES[number]