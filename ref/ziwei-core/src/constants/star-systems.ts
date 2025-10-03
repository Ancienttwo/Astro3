/**
 * 紫微斗数星曜系统常量
 * Star Systems Constants for ZiWei DouShu
 */

// 紫微星位置表 (ZiWei Star Position Table) - 完整查表法
// 按五行局和农历日查表，[水二局, 木三局, 金四局, 土五局, 火六局]
export const ZIWEI_POSITION_TABLE = [
  // 水二局   木三局   金四局   土五局   火六局
  [ '丑', '辰', '亥', '午', '酉' ], // 初一
  [ '寅', '丑', '辰', '亥', '午' ], // 初二
  [ '寅', '寅', '丑', '辰', '亥' ], // 初三
  [ '卯', '巳', '寅', '丑', '辰' ], // 初四
  [ '卯', '寅', '子', '寅', '丑' ], // 初五
  [ '辰', '卯', '巳', '未', '寅' ], // 初六
  [ '辰', '午', '寅', '子', '戌' ], // 初七
  [ '巳', '卯', '卯', '巳', '未' ], // 初八
  [ '巳', '辰', '丑', '寅', '子' ], // 初九
  [ '午', '未', '午', '卯', '巳' ], // 初十
  [ '午', '辰', '卯', '申', '寅' ], // 十一
  [ '未', '巳', '辰', '丑', '卯' ], // 十二
  [ '未', '申', '寅', '午', '亥' ], // 十三
  [ '申', '巳', '未', '卯', '申' ], // 十四
  [ '申', '午', '辰', '辰', '丑' ], // 十五
  [ '酉', '酉', '巳', '酉', '午' ], // 十六
  [ '酉', '午', '卯', '寅', '寅' ], // 十七
  [ '戌', '未', '申', '未', '辰' ], // 十八
  [ '戌', '戌', '巳', '辰', '子' ], // 十九
  [ '亥', '未', '午', '巳', '酉' ], // 二十
  [ '亥', '申', '辰', '戌', '寅' ], // 廿一
  [ '子', '亥', '酉', '卯', '未' ], // 廿二
  [ '子', '申', '午', '申', '辰' ], // 廿三
  [ '丑', '酉', '未', '巳', '巳' ], // 廿四
  [ '丑', '子', '巳', '午', '丑' ], // 廿五
  [ '寅', '酉', '戌', '亥', '戌' ], // 廿六
  [ '寅', '戌', '未', '辰', '卯' ], // 廿七
  [ '卯', '丑', '申', '酉', '申' ], // 廿八
  [ '卯', '戌', '午', '午', '巳' ], // 廿九
  [ '辰', '亥', '亥', '未', '午' ]  // 三十
] as const

// 天府星位置表 (TianFu Star Position Table)
// 天府与紫微对冲
export const TIANFU_OFFSET_FROM_ZIWEI: Record<number, number> = {
  0: 4,   // 紫微在子，天府在辰
  1: 2,   // 紫微在丑，天府在卯 
  2: 0,   // 紫微在寅，天府在寅
  3: 10,  // 紫微在卯，天府在丑 
  4: 8,   // 紫微在辰，天府在子
  5: 6,   // 紫微在巳，天府在亥
  6: 4,   // 紫微在午，天府在戌
  7: 2,   // 紫微在未，天府在酉
  8: 0,   // 紫微在申，天府在申
  9: 10,  // 紫微在酉，天府在未
  10: 8,  // 紫微在戌，天府在午
  11: 6   // 紫微在亥，天府在巳
}

// 紫微系星曜位置表 (ZiWei Series Star Position Table)
// 相对于紫微星的偏移位置 - 逆时针排列
export const ZIWEI_SERIES_POSITIONS: Record<string, number> = {
  '紫微': 0,    // 紫微本身
  '天机': 11,   // 紫微逆时针1宫
  '太阳': 9,    // 紫微逆时针3宫  
  '武曲': 8,    // 紫微逆时针4宫
  '天同': 7,    // 紫微逆时针5宫
  '廉贞': 4     // 紫微逆时针8宫
}

// 天府系星曜位置表 (TianFu Series Star Position Table)
// 相对于天府星的偏移位置 - 顺时针排列
export const TIANFU_SERIES_POSITIONS: Record<string, number> = {
  '天府': 0,    // 天府本身
  '太阴': 1,    // 天府顺时针1宫
  '贪狼': 2,    // 天府顺时针2宫
  '巨门': 3,    // 天府顺时针3宫
  '天相': 4,    // 天府顺时针4宫
  '天梁': 5,    // 天府顺时针5宫
  '七杀': 6,    // 天府顺时针6宫
  '破军': 10    // 天府顺时针10宫
}

// 主星系列 (Main Star Series)
export const MAIN_STARS = [
  '紫微', '天机', '太阳', '武曲', '天同', '廉贞',
  '天府', '太阴', '贪狼', '巨门', '天相', '天梁', '七杀', '破军'
] as const

// 辅星系列 (Auxiliary Star Series) - 吉星和中性辅助星曜
export const AUXILIARY_STARS = [
  '左辅', '右弼', '文昌', '文曲', '天魁', '天钺', '禄存', '天马'
] as const

// 煞星系列 (Malefic Star Series) - 六煞星和天刑
export const MALEFIC_STARS = [
  '擎羊', '陀罗', '火星', '铃星', '地空', '地劫', '天刑'
] as const

// 桃花星系列 (Peach Blossom Stars) - 感情桃花相关星曜
export const PEACH_BLOSSOM_STARS = [
  '红鸾', '天喜', '天姚', '咸池'
] as const

// 小星系列 (Minor Star Series) - 已移除桃花星和天刑
export const MINOR_STARS = [
  '天官', '天福', '天厨', '天巫', '天月', '阴煞',
  '三台', '八座', '恩光', '天贵', '龙池', '凤阁',
  '孤辰', '寡宿', '天哭', '天虚', '解神', '破碎', '华盖',
  '天德', '月德', '天才', '天寿', '天空', '旬空', '截空', '台辅',
  '封诰', '天使', '天伤', '天煞', '劫煞', '息神'
] as const

// Type definitions for star systems
export type MainStar = typeof MAIN_STARS[number]
export type AuxiliaryStar = typeof AUXILIARY_STARS[number]  
export type MaleficStar = typeof MALEFIC_STARS[number]
export type PeachBlossomStar = typeof PEACH_BLOSSOM_STARS[number]
export type MinorStar = typeof MINOR_STARS[number]
export type StarName = MainStar | AuxiliaryStar | MaleficStar | PeachBlossomStar | MinorStar
