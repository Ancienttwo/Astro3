/**
 * 透干分析器
 * 负责分析天干透出对五行强弱的加成影响
 */

import { WuxingElement, TransparencyInfluence, TransparencyType, WuxingScores, ITransparencyAnalyzer } from './types';
import { TIANGAN_WUXING, DIZHI_CANGGAN, TRANSPARENCY_CHINESE } from './constants';

export class TransparencyAnalyzer implements ITransparencyAnalyzer {
  /**
   * 分析透干影响
   */
  async analyze(stems: string[], branches: string[]): Promise<TransparencyInfluence> {
    const transparentStems = this.findTransparentStems(stems, branches);
    const totalBonus = this.calculateTotalBonus(transparentStems);
    
    return {
      transparentStems,
      totalBonus
    };
  }

  /**
   * 找到透出的天干
   */
  private findTransparentStems(stems: string[], branches: string[]): Array<{
    stem: string;
    element: WuxingElement;
    supportType: TransparencyType;
    bonus: number;
    description: string;
  }> {
    const transparentStems: Array<{
      stem: string;
      element: WuxingElement;
      supportType: TransparencyType;
      bonus: number;
      description: string;
    }> = [];
    
    // 检查每个天干
    stems.forEach((stem, stemIndex) => {
      const stemElement = TIANGAN_WUXING[stem];
      if (!stemElement) return;
      
      // 检查该天干是否在地支中有根
      const supportInfo = this.findStemSupport(stem, stemElement, branches);
      
      if (supportInfo.hasSupport) {
        const bonus = this.calculateTransparencyBonus(supportInfo.supportType, stemIndex);
        
        transparentStems.push({
          stem,
          element: stemElement,
          supportType: supportInfo.supportType,
          bonus,
          description: `${stem}透${TRANSPARENCY_CHINESE[supportInfo.supportType]}，${this.getElementName(stemElement)}得${bonus.toFixed(1)}分`
        });
      }
    });
    
    return transparentStems;
  }

  /**
   * 查找天干在地支中的支持
   */
  private findStemSupport(stem: string, stemElement: WuxingElement, branches: string[]): {
    hasSupport: boolean;
    supportType: TransparencyType;
    supportingBranches: string[];
  } {
    const supportingBranches: string[] = [];
    let bestSupportType: TransparencyType = 'yuqi';
    
    branches.forEach(branch => {
      const canggan = DIZHI_CANGGAN[branch];
      if (!canggan) return;
      
      // 检查是否包含该天干
      if (canggan[stem]) {
        const weight = canggan[stem].weight;
        
        // 根据权重确定支持类型
        if (weight === 1.0) {
          bestSupportType = 'benqi';  // 本气最强
        } else if (weight >= 0.5 && bestSupportType !== 'benqi') {
          bestSupportType = 'zhongqi'; // 中气次之
        } else if (bestSupportType === 'yuqi') {
          bestSupportType = 'yuqi';    // 余气最弱
        }
        
        supportingBranches.push(branch);
      }
    });
    
    return {
      hasSupport: supportingBranches.length > 0,
      supportType: bestSupportType,
      supportingBranches
    };
  }

  /**
   * 计算透干加分
   */
  private calculateTransparencyBonus(supportType: TransparencyType, stemPosition: number): number {
    // 基础透干加分
    let baseBonus = 0;
    switch (supportType) {
      case 'benqi':
        baseBonus = 3.0; // 本气透出加分最多
        break;
      case 'zhongqi':
        baseBonus = 2.0; // 中气透出加分中等
        break;
      case 'yuqi':
        baseBonus = 1.0; // 余气透出加分最少
        break;
    }
    
    // 位置加权：日干最重要，时干次之，年月干再次
    let positionWeight = 1.0;
    switch (stemPosition) {
      case 2: // 日干（第3个天干，索引2）
        positionWeight = 1.5;
        break;
      case 3: // 时干
        positionWeight = 1.2;
        break;
      case 0: // 年干
      case 1: // 月干
        positionWeight = 1.0;
        break;
    }
    
    return baseBonus * positionWeight;
  }

  /**
   * 计算总加分
   */
  private calculateTotalBonus(transparentStems: Array<{
    element: WuxingElement;
    bonus: number;
  }>): WuxingScores {
    const totalBonus: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    transparentStems.forEach(stem => {
      totalBonus[stem.element] += stem.bonus;
    });
    
    return totalBonus;
  }

  /**
   * 获取五行中文名称
   */
  private getElementName(element: WuxingElement): string {
    const names = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
    return names[element];
  }

  /**
   * 分析透干质量
   */
  analyzeTransparencyQuality(
    stems: string[], 
    branches: string[]
  ): {
    strongTransparencies: Array<{ stem: string; element: WuxingElement; strength: number; }>;
    weakTransparencies: Array<{ stem: string; element: WuxingElement; strength: number; }>;
    qualityScore: number; // 0-100，透干质量评分
    analysis: string;
  } {
    const strongTransparencies: Array<{ stem: string; element: WuxingElement; strength: number; }> = [];
    const weakTransparencies: Array<{ stem: string; element: WuxingElement; strength: number; }> = [];
    let totalQuality = 0;
    let transparencyCount = 0;
    
    stems.forEach((stem, index) => {
      const stemElement = TIANGAN_WUXING[stem];
      if (!stemElement) return;
      
      const supportInfo = this.findStemSupport(stem, stemElement, branches);
      
      if (supportInfo.hasSupport) {
        transparencyCount++;
        const strength = this.calculateTransparencyStrength(supportInfo.supportType, supportInfo.supportingBranches.length);
        totalQuality += strength;
        
        if (strength >= 70) {
          strongTransparencies.push({ stem, element: stemElement, strength });
        } else {
          weakTransparencies.push({ stem, element: stemElement, strength });
        }
      }
    });
    
    const qualityScore = transparencyCount > 0 ? totalQuality / transparencyCount : 0;
    const analysis = this.generateTransparencyAnalysis(strongTransparencies.length, weakTransparencies.length, qualityScore);
    
    return {
      strongTransparencies,
      weakTransparencies,
      qualityScore,
      analysis
    };
  }

  /**
   * 计算透干强度
   */
  private calculateTransparencyStrength(supportType: TransparencyType, supportCount: number): number {
    let baseStrength = 0;
    switch (supportType) {
      case 'benqi':
        baseStrength = 80;
        break;
      case 'zhongqi':
        baseStrength = 60;
        break;
      case 'yuqi':
        baseStrength = 40;
        break;
    }
    
    // 多重支持加分
    const supportBonus = (supportCount - 1) * 10;
    
    return Math.min(100, baseStrength + supportBonus);
  }

  /**
   * 生成透干分析
   */
  private generateTransparencyAnalysis(strongCount: number, weakCount: number, qualityScore: number): string {
    let analysis = '';
    
    if (strongCount > 0) {
      analysis += `有${strongCount}个强力透干，`;
    }
    if (weakCount > 0) {
      analysis += `有${weakCount}个一般透干，`;
    }
    
    if (qualityScore >= 80) {
      analysis += '透干质量优秀，五行力量得到强化。';
    } else if (qualityScore >= 60) {
      analysis += '透干质量良好，五行力量有所增强。';
    } else if (qualityScore >= 40) {
      analysis += '透干质量一般，五行力量略有提升。';
    } else if (qualityScore > 0) {
      analysis += '透干质量较差，五行力量提升有限。';
    } else {
      analysis = '无有效透干，五行力量未得到额外加强。';
    }
    
    return analysis;
  }

  /**
   * 检查特定天干的透干情况
   */
  checkStemTransparency(
    stem: string, 
    branches: string[]
  ): {
    isTransparent: boolean;
    supportType?: TransparencyType;
    supportingBranches: string[];
    bonus: number;
    description: string;
  } {
    const stemElement = TIANGAN_WUXING[stem];
    if (!stemElement) {
      return {
        isTransparent: false,
        supportingBranches: [],
        bonus: 0,
        description: '无效天干'
      };
    }
    
    const supportInfo = this.findStemSupport(stem, stemElement, branches);
    
    if (!supportInfo.hasSupport) {
      return {
        isTransparent: false,
        supportingBranches: [],
        bonus: 0,
        description: `${stem}无根，不透干`
      };
    }
    
    const bonus = this.calculateTransparencyBonus(supportInfo.supportType, 0); // 使用默认位置权重
    
    return {
      isTransparent: true,
      supportType: supportInfo.supportType,
      supportingBranches: supportInfo.supportingBranches,
      bonus,
      description: `${stem}透${TRANSPARENCY_CHINESE[supportInfo.supportType]}于${supportInfo.supportingBranches.join('、')}，得${bonus.toFixed(1)}分`
    };
  }

  /**
   * 分析透干对日主的影响
   */
  analyzeDayMasterTransparency(
    dayMasterStem: string,
    allStems: string[],
    branches: string[]
  ): {
    dayMasterTransparency: {
      isTransparent: boolean;
      strength: number;
      description: string;
    };
    supportiveTransparencies: Array<{ stem: string; element: WuxingElement; impact: string; }>;
    hostileTransparencies: Array<{ stem: string; element: WuxingElement; impact: string; }>;
    overallImpact: 'positive' | 'negative' | 'neutral';
  } {
    const dayMasterElement = TIANGAN_WUXING[dayMasterStem];
    const dayMasterInfo = this.checkStemTransparency(dayMasterStem, branches);
    
    const supportiveTransparencies: Array<{ stem: string; element: WuxingElement; impact: string; }> = [];
    const hostileTransparencies: Array<{ stem: string; element: WuxingElement; impact: string; }> = [];
    
    allStems.forEach(stem => {
      if (stem === dayMasterStem) return; // 跳过日主本身
      
      const stemElement = TIANGAN_WUXING[stem];
      if (!stemElement) return;
      
      const transparency = this.checkStemTransparency(stem, branches);
      if (!transparency.isTransparent) return;
      
      const relation = this.getElementRelation(dayMasterElement!, stemElement);
      
      if (relation.beneficial) {
        supportiveTransparencies.push({
          stem,
          element: stemElement,
          impact: `${stem}透干${relation.description}`
        });
      } else if (relation.harmful) {
        hostileTransparencies.push({
          stem,
          element: stemElement,
          impact: `${stem}透干${relation.description}`
        });
      }
    });
    
    // 评估整体影响
    let overallImpact: 'positive' | 'negative' | 'neutral';
    const positiveScore = (dayMasterInfo.isTransparent ? dayMasterInfo.bonus : 0) + supportiveTransparencies.length * 2;
    const negativeScore = hostileTransparencies.length * 2;
    
    if (positiveScore > negativeScore + 2) {
      overallImpact = 'positive';
    } else if (negativeScore > positiveScore + 2) {
      overallImpact = 'negative';
    } else {
      overallImpact = 'neutral';
    }
    
    return {
      dayMasterTransparency: {
        isTransparent: dayMasterInfo.isTransparent,
        strength: dayMasterInfo.bonus,
        description: dayMasterInfo.description
      },
      supportiveTransparencies,
      hostileTransparencies,
      overallImpact
    };
  }

  /**
   * 获取五行关系
   */
  private getElementRelation(dayMaster: WuxingElement, target: WuxingElement): {
    beneficial: boolean;
    harmful: boolean;
    description: string;
  } {
    if (dayMaster === target) {
      return { beneficial: true, harmful: false, description: '比助日主' };
    }
    
    // 生日主
    const shengMap: Record<WuxingElement, WuxingElement> = {
      wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal'
    };
    if (shengMap[dayMaster] === target) {
      return { beneficial: true, harmful: false, description: '生助日主' };
    }
    
    // 克日主
    const keMap: Record<WuxingElement, WuxingElement> = {
      wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth'
    };
    if (keMap[dayMaster] === target) {
      return { beneficial: false, harmful: true, description: '克制日主' };
    }
    
    return { beneficial: false, harmful: false, description: '中性影响' };
  }
}