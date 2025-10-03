/**
 * 紫微斗数星曜亮度系统常量
 * Star Brightness System Constants for ZiWei DouShu
 */
export declare const STAR_BRIGHTNESS: {
    readonly XIAN: 0;
    readonly BU: 1;
    readonly PING: 2;
    readonly LI: 3;
    readonly DE: 4;
    readonly WANG: 5;
    readonly MIAO: 6;
};
export type StarBrightnessValue = typeof STAR_BRIGHTNESS[keyof typeof STAR_BRIGHTNESS];
export declare const BRIGHTNESS_LEVEL_MAP: Record<string, StarBrightnessValue>;
export declare const STAR_BRIGHTNESS_TABLE: Record<string, string[]>;
export type BrightnessLevel = '陷' | '不' | '地' | '平' | '利' | '得' | '旺' | '庙';
export type StarBrightnessData = Record<string, string[]>;
//# sourceMappingURL=star-brightness.d.ts.map