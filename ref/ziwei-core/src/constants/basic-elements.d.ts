/**
 * 紫微斗数基础元素常量
 * Basic Elements Constants for ZiWei DouShu
 */
export declare const STEMS: readonly ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export declare const BRANCHES: readonly ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
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
export declare const PALACE_NAMES: readonly ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"];
export declare const MAJOR_PERIOD_PALACE_NAMES: readonly ["大命", "大兄", "大妻", "大子", "大财", "大疾", "大迁", "大友", "大官", "大田", "大福", "大父"];
export declare const FLEETING_YEAR_PALACE_NAMES: readonly ["年命", "年兄", "年妻", "年子", "年财", "年疾", "年迁", "年友", "年官", "年田", "年福", "年父"];
export declare const MINOR_PERIOD_PALACE_NAMES: readonly ["小限", "小兄", "小妻", "小子", "小财", "小疾", "小迁", "小友", "小官", "小田", "小福", "小父"];
export type Stem = typeof STEMS[number];
export type Branch = typeof BRANCHES[number];
export type PalaceName = typeof PALACE_NAMES[number];
export type MajorPeriodPalaceName = typeof MAJOR_PERIOD_PALACE_NAMES[number];
export type FleetingYearPalaceName = typeof FLEETING_YEAR_PALACE_NAMES[number];
export type MinorPeriodPalaceName = typeof MINOR_PERIOD_PALACE_NAMES[number];
//# sourceMappingURL=basic-elements.d.ts.map