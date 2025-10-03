/**
 * 八字分析系统核心类型定义
 * 从生产环境迁移 - AstroZi Mobile
 */
export interface BaziInput {
    day_master: {
        stem: string;
        element: Element;
        yin_yang: YinYang;
    };
    pillars: {
        year: {
            stem: string;
            branch: string;
        };
        month: {
            stem: string;
            branch: string;
        };
        day: {
            stem: string;
            branch: string;
        };
        hour?: {
            stem: string;
            branch: string;
        };
    };
    branches: {
        [branch: string]: {
            hidden: Array<{
                stem: string;
                layer: 'main' | 'mid' | 'rest';
                element: Element;
                yin_yang: YinYang;
            }>;
        };
    };
    stems_visible: Array<{
        stem: string;
        from: 'year' | 'month' | 'day' | 'hour';
        element: Element;
        yin_yang: YinYang;
    }>;
}
export type Element = '木' | '火' | '土' | '金' | '水';
export type YinYang = '阳' | '阴';
export type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '正财' | '偏财' | '正官' | '七杀' | '正印' | '偏印';
export type Branch = '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥' | '子' | '丑';
export type TianGan = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
export type DiZhi = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export interface BaziData {
    yearPillar: {
        stem: TianGan;
        branch: DiZhi;
    };
    monthPillar: {
        stem: TianGan;
        branch: DiZhi;
    };
    dayPillar: {
        stem: TianGan;
        branch: DiZhi;
    };
    hourPillar: {
        stem: TianGan;
        branch: DiZhi;
    };
}
export type CapabilityName = '执行力基础分' | '创新力基础分' | '管理力基础分' | '销售力基础分' | '协调力基础分' | '稳定性基础分';
export type CapabilityScores = {
    [K in CapabilityName]: number;
};
export interface TenGodStrength {
    [key: string]: number;
}
export declare class SeasonalMatrix {
    private static readonly MATRIX;
    static getFactor(monthBranch: Branch, element: Element): number;
    static getAllFactors(monthBranch: Branch): {
        [K in Element]: number;
    };
}
export declare class ElementRelations {
    private static readonly CYCLE;
    static generates(from: Element, to: Element): boolean;
    static controls(from: Element, to: Element): boolean;
    static getGeneratedElement(from: Element): Element;
    static getControlledElement(from: Element): Element;
    static getGeneratingElement(to: Element): Element;
    static getControllingElement(to: Element): Element;
}
export declare class TenGodCalculator {
    static getTenGod(dayElement: Element, dayYinYang: YinYang, targetElement: Element, targetYinYang: YinYang): TenGod;
    static getTenGodElement(dayElement: Element, tenGod: TenGod): Element;
}
export interface BaziAnalysisResult {
    dayMaster: TianGan;
    dayMasterElement: Element;
    dayMasterYinYang: YinYang;
    pillars: {
        year: {
            stem: TianGan;
            branch: DiZhi;
        };
        month: {
            stem: TianGan;
            branch: DiZhi;
        };
        day: {
            stem: TianGan;
            branch: DiZhi;
        };
        hour: {
            stem: TianGan;
            branch: DiZhi;
        };
    };
    tenGodsAnalysis: {
        [pillar: string]: {
            stem: TenGod;
            branch: {
                main: TenGod;
                hidden: TenGod[];
            };
        };
    };
    elementStrength: {
        [element in Element]: number;
    };
    seasonalFactors: {
        [element in Element]: number;
    };
    summary: {
        strongestElement: Element;
        weakestElement: Element;
        dominantTenGods: TenGod[];
        overallBalance: 'strong' | 'weak' | 'balanced';
    };
}
