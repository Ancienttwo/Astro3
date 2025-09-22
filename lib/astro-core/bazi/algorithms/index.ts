/**
 * @astroall/bazi-core Algorithms - 八字算法集成层
 * 
 * @ai-context BAZI_CORE_ALGORITHMS
 * @purpose 集成现有的八字算法实现，避免重复开发
 * @integration 复用 ziwei-core/algorithms/bazi 的成熟算法
 * @pattern 算法适配器模式，统一接口
 * @version 1.0.0
 * @created 2025-01-05
 * @updated 2025-01-08 - Fixed type imports and method access
 */

import { 
  BaziCalculator,
  calculateTenGods,
  EARTHLY_BRANCH_HIDDEN_STEMS,
  EARTHLY_BRANCH_PRIMARY_QI,
  TIANGAN_ELEMENTS,
  TIANGAN_YINYANG
} from '../../../ziwei-core/algorithms/bazi/calculator';
import type { 
  BaziData, 
  BaziAnalysisResult,
  TianGan, 
  DiZhi,
  Element,
  YinYang,
  TenGod
} from '../../../ziwei-core/algorithms/bazi/types';
import type { FourPillars, TenGodAnalysis, ElementAnalysis, StemName, BranchName, TenGodSimplified } from '../types';

/**
 * 🎯 八字算法适配器 - 集成现有算法
 * 
 * @ai-pattern ALGORITHM_ADAPTER
 * @purpose 复用现有的八字算法，避免重复实现
 * @integration 基于 ziwei-core/algorithms/bazi/calculator.js
 */
export class BaziAlgorithmAdapter {
  /**
   * 转换输入数据格式到标准 BaziData 格式
   */
  private static convertToBaziData(baziData: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
  }): BaziData {
    return {
      yearPillar: { 
        stem: baziData.yearPillar.stem as TianGan, 
        branch: baziData.yearPillar.branch as DiZhi 
      },
      monthPillar: { 
        stem: baziData.monthPillar.stem as TianGan, 
        branch: baziData.monthPillar.branch as DiZhi 
      },
      dayPillar: { 
        stem: baziData.dayPillar.stem as TianGan, 
        branch: baziData.dayPillar.branch as DiZhi 
      },
      hourPillar: { 
        stem: baziData.hourPillar.stem as TianGan, 
        branch: baziData.hourPillar.branch as DiZhi 
      }
    };
  }

  /**
   * 使用现有的完整八字分析算法
   * @param baziData 四柱数据
   * @returns 完整的八字分析结果
   */
  static calculateCompleteBaziAnalysis(baziData: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
  }): BaziAnalysisResult {
    const convertedData = this.convertToBaziData(baziData);
    return BaziCalculator.calculateBaziAnalysis(convertedData);
  }

  /**
   * 生成符合本地接口的十神分析
   * 使用公共方法和数据转换
   */
  static calculateTenGodsAnalysis(baziData: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
  }): TenGodAnalysis {
    const convertedData = this.convertToBaziData(baziData);
    const fullAnalysis = BaziCalculator.calculateBaziAnalysis(convertedData);
    
    // 从完整分析中提取十神信息并适配到本地接口
    return {
      yearPillar: fullAnalysis.tenGodsAnalysis.year.stem,
      monthPillar: fullAnalysis.tenGodsAnalysis.month.stem,
      dayPillar: fullAnalysis.tenGodsAnalysis.day.stem,
      hourPillar: fullAnalysis.tenGodsAnalysis.hour.stem,
      yearPillarSimplified: this.simplifyTenGod(fullAnalysis.tenGodsAnalysis.year.stem),
      monthPillarSimplified: this.simplifyTenGod(fullAnalysis.tenGodsAnalysis.month.stem),
      dayPillarSimplified: this.simplifyTenGod(fullAnalysis.tenGodsAnalysis.day.stem),
      hourPillarSimplified: this.simplifyTenGod(fullAnalysis.tenGodsAnalysis.hour.stem)
    };
  }

  /**
   * 简化十神名称
   */
  private static simplifyTenGod(tenGod: TenGod): TenGodSimplified {
    const simplifyMap: Record<TenGod, TenGodSimplified> = {
      '比肩': '比',
      '劫财': '劫',
      '食神': '食',
      '伤官': '伤',
      '正财': '财',
      '偏财': '才',
      '正官': '官',
      '七杀': '杀',
      '正印': '印',
      '偏印': '枭'
    };
    return simplifyMap[tenGod] || '比'; // 默认返回有效的 TenGodSimplified 类型
  }

  /**
   * 快速八字强弱分析 - 使用公共接口
   */
  static quickBaziAnalysis(baziData: {
    yearPillar: { stem: string; branch: string };
    monthPillar: { stem: string; branch: string };
    dayPillar: { stem: string; branch: string };
    hourPillar: { stem: string; branch: string };
  }) {
    const convertedData = this.convertToBaziData(baziData);
    return BaziCalculator.quickBaziAnalysis(convertedData);
  }
}

/**
 * 🔧 算法工具函数 - 复用现有实现
 */
export class BaziAlgorithmUtils {
  /**
   * 计算十神关系
   * @param dayMaster 日主天干
   * @param targetStem 目标天干
   * @returns 十神类型
   */
  static calculateTenGods(dayMaster: StemName, targetStem: StemName): TenGod {
    return calculateTenGods(dayMaster as TianGan, targetStem as TianGan);
  }

  /**
   * 获取地支藏干
   */
  static getEarthlyBranchHiddenStems(branch: BranchName): readonly StemName[] {
    return EARTHLY_BRANCH_HIDDEN_STEMS[branch as DiZhi] || [];
  }

  /**
   * 获取地支本气
   */
  static getEarthlyBranchPrimaryQi(branch: BranchName): StemName {
    return EARTHLY_BRANCH_PRIMARY_QI[branch as DiZhi];
  }

  /**
   * 获取天干五行
   */
  static getTianganElement(stem: StemName): Element {
    return TIANGAN_ELEMENTS[stem as TianGan];
  }

  /**
   * 获取天干阴阳
   */
  static getTianganYinYang(stem: StemName): YinYang {
    return TIANGAN_YINYANG[stem as TianGan];
  }
}

/**
 * 🎭 算法导出 - 统一接口
 * 
 * @ai-usage 在 calculation.ts 中使用这些函数
 * @pattern 适配器模式，复用现有算法
 */

// 重新导出神煞计算模块
export {
  checkBaziShenSha,
  getPeachBlossomSummary,
  getNoblemanSummary,
  getSimplifiedShenSha,
  getColumnShenSha,
  type BaziShenShaResult
} from './shensha';

// Classes are already exported above with 'export class' keywords

export default BaziAlgorithmAdapter;