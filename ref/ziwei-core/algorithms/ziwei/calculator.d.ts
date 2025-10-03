/**
 * 紫微斗数核心计算算法
 * 从生产环境完整迁移 - AstroZi Mobile
 *
 * 包含：
 * - 命宫、身宫、来因宫计算（100%迁移算法）
 * - 五行局推断
 * - 十二宫天干计算
 * - 星曜排盘（14主星系统）
 */
import { HeavenlyStem, EarthlyBranch, FiveElementsBureau, ZiweiInputData, ZiweiChartResult, ZiweiAnalysisResult, LaiyinPalaceResult, CalculateLifePalaceFunction, CalculateBodyPalaceFunction, GetFiveElementsBureauFunction } from './types';
/**
 * 命宫计算（正确的紫微斗数算法）
 * 规则：寅宫起正月，顺数生月，子时起数，逆数生时
 * 支持hourBranch统一接口
 */
export declare const calculateLifePalace: CalculateLifePalaceFunction;
/**
 * 身宫计算（正确的紫微斗数算法）
 * 规则：寅宫起正月，顺数生月，子时起数，顺数生时
 * 支持hourBranch统一接口
 */
export declare const calculateBodyPalace: CalculateBodyPalaceFunction;
/**
 * 来因宫计算（100%迁移源文件算法）
 */
export declare const calculateLaiyinPalace: (yearGan: HeavenlyStem, palaceStems: HeavenlyStem[]) => LaiyinPalaceResult | null;
/**
 * 五行局计算（100%迁移源文件算法）
 */
export declare const getFiveElementsBureau: GetFiveElementsBureauFunction;
/**
 * 计算十二宫天干（五虎遁月表）
 */
export declare const calculatePalaceStems: (yearGan: HeavenlyStem) => HeavenlyStem[];
/**
 * 获取对宫地支
 */
export declare const getOppositePalace: (branch: EarthlyBranch) => EarthlyBranch | null;
/**
 * 紫微星安排（根据五行局和农历生日）
 */
export declare const arrangeZiweiStar: (fiveElementsBureau: FiveElementsBureau, lunarDay: number) => number;
/**
 * 天机星安排（紫微逆时针第1宫，即前一宫）
 */
export declare const arrangeTianjiStar: (ziweiPosition: number) => number;
/**
 * 太阳星安排（紫微逆时针第3宫）
 */
export declare const arrangeTaiyangStar: (ziweiPosition: number) => number;
/**
 * 武曲星安排（紫微逆时针第4宫）
 */
export declare const arrangeWuquStar: (ziweiPosition: number) => number;
/**
 * 天同星安排（紫微逆时针第5宫）
 */
export declare const arrangeTiantongStar: (ziweiPosition: number) => number;
/**
 * 廉贞星安排（紫微逆时针第8宫）
 */
export declare const arrangeLianzhenStar: (ziweiPosition: number) => number;
/**
 * 天府星安排（根据紫微天府对角关系）
 */
export declare const arrangeTianfuStar: (ziweiPosition: number) => number;
/**
 * 太阴星安排（天府星系，天府顺行第1宫）
 */
export declare const arrangeTaiyinStar: (tianfuPosition: number) => number;
/**
 * 贪狼星安排（天府顺时针第2宫）
 */
export declare const arrangeTanlangStar: (tianfuPosition: number) => number;
/**
 * 巨门星安排（天府顺时针第3宫）
 */
export declare const arrangeJumenStar: (tianfuPosition: number) => number;
/**
 * 天相星安排（天府顺时针第4宫）
 */
export declare const arrangeTianxiangStar: (tianfuPosition: number) => number;
/**
 * 天梁星安排（天府顺时针第5宫）
 */
export declare const arrangeTianliangStar: (tianfuPosition: number) => number;
/**
 * 七杀星安排（天府顺时针第6宫）
 */
export declare const arrangeQishaStar: (tianfuPosition: number) => number;
/**
 * 破军星安排（天府顺时针第10宫）
 */
export declare const arrangePojunStar: (tianfuPosition: number) => number;
/**
 * 地支索引转换工具
 */
export declare const getBranchIndex: (branch: EarthlyBranch) => number;
/**
 * 索引转地支工具
 */
export declare const getBranchByIndex: (index: number) => EarthlyBranch;
/**
 * 天干索引转换工具
 */
export declare const getStemIndex: (stem: HeavenlyStem) => number;
/**
 * 索引转天干工具
 */
export declare const getStemByIndex: (index: number) => HeavenlyStem;
export declare class ZiweiCalculator {
    /**
     * 紫微斗数完整排盘计算（集成完整134星系统）
     */
    static calculateZiweiChart(inputData: ZiweiInputData): ZiweiChartResult;
    /**
     * 紫微斗数分析（基础版）
     */
    static analyzeZiweiChart(chartResult: ZiweiChartResult): ZiweiAnalysisResult;
}
