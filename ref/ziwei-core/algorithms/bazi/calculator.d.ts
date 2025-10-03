/**
 * 八字计算核心算法
 * 从生产环境迁移并优化 - AstroZi Mobile
 */
import { BaziData, BaziAnalysisResult, Element, YinYang, TenGod, TianGan, DiZhi } from './types';
export declare const EARTHLY_BRANCH_HIDDEN_STEMS: {
    readonly 子: readonly ["癸"];
    readonly 丑: readonly ["己", "癸", "辛"];
    readonly 寅: readonly ["甲", "丙", "戊"];
    readonly 卯: readonly ["乙"];
    readonly 辰: readonly ["戊", "乙", "癸"];
    readonly 巳: readonly ["丙", "庚", "戊"];
    readonly 午: readonly ["丁", "己"];
    readonly 未: readonly ["己", "丁", "乙"];
    readonly 申: readonly ["庚", "壬", "戊"];
    readonly 酉: readonly ["辛"];
    readonly 戌: readonly ["戊", "辛", "丁"];
    readonly 亥: readonly ["壬", "甲"];
};
export declare const EARTHLY_BRANCH_PRIMARY_QI: {
    readonly 子: "癸";
    readonly 丑: "己";
    readonly 寅: "甲";
    readonly 卯: "乙";
    readonly 辰: "戊";
    readonly 巳: "丙";
    readonly 午: "丁";
    readonly 未: "己";
    readonly 申: "庚";
    readonly 酉: "辛";
    readonly 戌: "戊";
    readonly 亥: "壬";
};
export declare const TIANGAN_ELEMENTS: Record<TianGan, Element>;
export declare const TIANGAN_YINYANG: Record<TianGan, YinYang>;
/**
 * 计算天干与日主的十神关系
 */
export declare function calculateTenGods(dayMaster: TianGan, targetStem: TianGan): TenGod;
/**
 * 八字计算器类
 */
export declare class BaziCalculator {
    /**
     * 完整的八字分析计算
     */
    static calculateBaziAnalysis(baziData: BaziData): BaziAnalysisResult;
    /**
     * 计算十神分析
     */
    private static calculateTenGodsAnalysis;
    /**
     * 计算五行强度（基础版本）
     */
    private static calculateElementStrength;
    /**
     * 应用季节修正
     */
    private static applySeasonalAdjustment;
    /**
     * 生成分析总结
     */
    private static generateAnalysisSummary;
    /**
     * 简化版八字分析（用于快速计算）
     */
    static quickBaziAnalysis(baziData: BaziData): {
        dayMaster: TianGan;
        dayElement: Element;
        monthBranch: DiZhi;
        seasonalFactor: number;
        dayMasterStrength: number;
        isStrong: boolean;
        isWeak: boolean;
        isBalanced: boolean;
    };
}
