/**
 * 紫微斗数Hook接口数据格式类型定义
 * ZiWei Hook Interface Data Format Types
 * 
 * @ai-context ZIWEI_HOOK_INTERFACE
 * @preload tyme4ts, AlgorithmRegistry
 * @algorithm-dependency ziwei-calculator
 */

// Hook标准出生信息格式
export interface HookBirthInfo {
  // 公历信息
  year: number;
  month: number;
  day: number;
  hour: number; // 0-23
  gender: string; // "male" | "female"
  isLunar: boolean;

  // 农历信息 (tyme4ts转换后)
  yearStem: string;      // 天干
  yearBranch: string;    // 地支
  yearGanzhi: string;    // 干支，如甲辰
  monthLunar: number;    // 农历月
  dayLunar: number;      // 农历日
  hourBranch: number;    // 时辰索引 0-11 对应子-亥
  isLeapMonth?: boolean; // 是否闰月
}

// 星曜信息 (包含四化标记)
export interface HookStarInfo {
  name: string;           // 星曜名称
  brightness: string;     // 亮度: "庙" | "旺" | "得" | "利" | "平" | "陷"
  type?: string[];        // 四化标记组合: ["D", "xA", "iC"] 等
}

// 大运信息
export interface HookMajorPeriod {
  period: number;         // 第几个大运
  startAge: number;       // 起始年龄
  endAge: number;         // 结束年龄
  startYear: number;      // 起始年份
  endYear: number;        // 结束年份
}

// 五行局信息
export interface HookFiveElementsBureau {
  name: string;           // "水二局"
  局数: string;           // "2"
}

// 单个宫位完整信息 (子-亥)
export interface HookPalaceInfo {
  branch: string;                    // 地支名称
  branchIndex: number;              // 地支索引 0-11
  stem: string;                     // 天干
  palaceName: string;               // 宫位名称
  "mainStars&sihuaStars": HookStarInfo[];      // 主星含四化
  "auxiliaryStars&sihuaStars": HookStarInfo[]; // 辅星含四化
  minorStars: HookStarInfo[];                  // 杂耀
  fleetingYears: number[];                     // 流年年龄 [5,17,29,41,53,65,77,89,101,113]
  majorPeriod: HookMajorPeriod;               // 大运信息
  minorPeriod: number[];                      // 小限年龄 (与流年相同)
}

// 完整紫微Hook格式命盘
export interface ZiWeiHookChart {
  // Allow dynamic access to branch properties
  [branchName: string]: unknown;
  
  // 基础信息
  birthInfo: HookBirthInfo;
  
  // tyme4ts生成的八字信息
  八字: string;           // 八字
  八字起运: string;       // 八字起运
  八字大运: string;       // 八字大运
  
  // 紫微核心信息
  命宫: string;          // 命宫位置
  身宫: string;          // 身宫位置  
  来因宫: string;        // 来因宫位置
  命主: string;          // 命主星
  身主: string;          // 身主星
  斗君: string;          // 斗君位置
  五行局: HookFiveElementsBureau;  // 五行局
  
  // 十二宫数据 (按地支排序)
  子: HookPalaceInfo;
  丑: HookPalaceInfo;
  寅: HookPalaceInfo;
  卯: HookPalaceInfo;
  辰: HookPalaceInfo;
  巳: HookPalaceInfo;
  午: HookPalaceInfo;
  未: HookPalaceInfo;
  申: HookPalaceInfo;
  酉: HookPalaceInfo;
  戌: HookPalaceInfo;
  亥: HookPalaceInfo;
  
  // 元数据
  generatedAt?: string;
  version?: string;
}

// Hook输入参数接口
export interface HookCalculationInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: "male" | "female";
  isLunar?: boolean;
  isLeapMonth?: boolean;
}

// 四化类型标记常量
export const SIHUA_TYPES = {
  // 生年四化
  BIRTH_LU: "iA",    // 生年禄
  BIRTH_QUAN: "iB",  // 生年权
  BIRTH_KE: "iC",    // 生年科
  BIRTH_JI: "iD",    // 生年忌
  
  // 自化四化
  SELF_LU: "xA",     // 自化禄
  SELF_QUAN: "xB",   // 自化权
  SELF_KE: "xC",     // 自化科
  SELF_JI: "xD",     // 自化忌
  
  // 其他标记
  STAR_TYPE_D: "D",  // 主星标记
} as const;

// 地支常量映射
export const BRANCH_NAMES = [
  "子", "丑", "寅", "卯", "辰", "巳",
  "午", "未", "申", "酉", "戌", "亥"
] as const;

export type BranchName = typeof BRANCH_NAMES[number];

// 星曜亮度常量
export const STAR_BRIGHTNESS = {
  TEMPLE: "庙",      // 庙
  PROSPER: "旺",     // 旺
  GAIN: "得",        // 得
  BENEFIT: "利",     // 利
  NORMAL: "平",      // 平
  FALL: "陷"         // 陷
} as const;

export type StarBrightness = typeof STAR_BRIGHTNESS[keyof typeof STAR_BRIGHTNESS];