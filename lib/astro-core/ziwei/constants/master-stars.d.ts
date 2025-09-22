/**
 * 紫微斗数命主身主星常量
 * Master Stars Constants for ZiWei DouShu
 */
export declare const LIFE_MASTER_STARS: readonly ["贪狼", "巨门", "禄存", "文曲", "廉贞", "武曲", "破军", "武曲", "廉贞", "文曲", "禄存", "巨门"];
export declare const BODY_MASTER_STARS: readonly ["火星", "天相", "天梁", "天同", "文昌", "天机", "火星", "天相", "天梁", "天同", "文昌", "天机"];
export declare const BIRTH_YEAR_SIHUA: Record<string, {
    A: string;
    B: string;
    C: string;
    D: string;
}>;
export declare const FLYING_PALACE_SIHUA: Record<string, {
    A: string;
    B: string;
    C: string;
    D: string;
}>;
export type LifeMasterStar = typeof LIFE_MASTER_STARS[number];
export type BodyMasterStar = typeof BODY_MASTER_STARS[number];
export type SihuaTransformation = {
    A: string;
    B: string;
    C: string;
    D: string;
};
export type SihuaType = 'A' | 'B' | 'C' | 'D';
//# sourceMappingURL=master-stars.d.ts.map