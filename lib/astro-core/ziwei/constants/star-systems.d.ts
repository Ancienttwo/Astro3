/**
 * 紫微斗数星曜系统常量
 * Star Systems Constants for ZiWei DouShu
 */
export declare const ZIWEI_POSITION_TABLE: readonly [readonly ["丑", "辰", "亥", "午", "酉"], readonly ["寅", "丑", "辰", "亥", "午"], readonly ["寅", "寅", "丑", "辰", "亥"], readonly ["卯", "巳", "寅", "丑", "辰"], readonly ["卯", "寅", "子", "寅", "丑"], readonly ["辰", "卯", "巳", "未", "寅"], readonly ["辰", "午", "寅", "子", "戌"], readonly ["巳", "卯", "卯", "巳", "未"], readonly ["巳", "辰", "丑", "寅", "子"], readonly ["午", "未", "午", "卯", "巳"], readonly ["午", "辰", "卯", "申", "寅"], readonly ["未", "巳", "辰", "丑", "卯"], readonly ["未", "申", "寅", "午", "亥"], readonly ["申", "巳", "未", "卯", "申"], readonly ["申", "午", "辰", "辰", "丑"], readonly ["酉", "酉", "巳", "酉", "午"], readonly ["酉", "午", "卯", "寅", "寅"], readonly ["戌", "未", "申", "未", "辰"], readonly ["戌", "戌", "巳", "辰", "子"], readonly ["亥", "未", "午", "巳", "酉"], readonly ["亥", "申", "辰", "戌", "寅"], readonly ["子", "亥", "酉", "卯", "未"], readonly ["子", "申", "午", "申", "辰"], readonly ["丑", "酉", "未", "巳", "巳"], readonly ["丑", "子", "巳", "午", "丑"], readonly ["寅", "酉", "戌", "亥", "戌"], readonly ["寅", "戌", "未", "辰", "卯"], readonly ["卯", "丑", "申", "酉", "申"], readonly ["卯", "戌", "午", "午", "巳"], readonly ["辰", "亥", "亥", "未", "午"]];
export declare const TIANFU_OFFSET_FROM_ZIWEI: Record<number, number>;
export declare const ZIWEI_SERIES_POSITIONS: Record<string, number>;
export declare const TIANFU_SERIES_POSITIONS: Record<string, number>;
export declare const MAIN_STARS: readonly ["紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"];
export declare const AUXILIARY_STARS: readonly ["左辅", "右弼", "文昌", "文曲", "天魁", "天钺", "禄存", "天马"];
export declare const MALEFIC_STARS: readonly ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫", "天刑"];
export declare const PEACH_BLOSSOM_STARS: readonly ["红鸾", "天喜", "天姚", "咸池"];
export declare const MINOR_STARS: readonly ["天官", "天福", "天厨", "天巫", "天月", "阴煞", "三台", "八座", "恩光", "天贵", "龙池", "凤阁", "孤辰", "寡宿", "天哭", "天虚", "解神", "破碎", "华盖", "天德", "月德", "天才", "天寿", "天空", "旬空", "截空", "台辅", "封诰", "天使", "天伤", "天煞", "劫煞", "息神"];
export type MainStar = typeof MAIN_STARS[number];
export type AuxiliaryStar = typeof AUXILIARY_STARS[number];
export type MaleficStar = typeof MALEFIC_STARS[number];
export type PeachBlossomStar = typeof PEACH_BLOSSOM_STARS[number];
export type MinorStar = typeof MINOR_STARS[number];
export type StarName = MainStar | AuxiliaryStar | MaleficStar | PeachBlossomStar | MinorStar;
//# sourceMappingURL=star-systems.d.ts.map