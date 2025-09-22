/**
 * 合会关系分析器
 * 负责分析地支三合、六合、三会对五行强弱的影响
 */

import { WuxingElement, CombinationInfluence, WuxingScores, ICombinationAnalyzer } from './types';
import { DIZHI_COMBINATIONS } from './constants';

export class CombinationAnalyzer implements ICombinationAnalyzer {
  /**
   * 分析合会关系影响
   */
  async analyze(branches: string[], season: string): Promise<CombinationInfluence> {
    const sanhui = this.analyzeSanhui(branches);
    const sanhe = this.analyzeSanhe(branches);
    const liuhe = this.analyzeLiuhe(branches);
    const totalBonus = this.calculateTotalBonus(sanhui, sanhe, liuhe);
    
    return {
      sanhui,
      sanhe,
      liuhe,
      totalBonus
    };
  }

  /**
   * 分析三会关系
   */
  private analyzeSanhui(branches: string[]): Array<{
    branches: string[];
    element: WuxingElement;
    score: number;
    isComplete: boolean;
  }> {
    const results: Array<{
      branches: string[];
      element: WuxingElement;
      score: number;
      isComplete: boolean;
    }> = [];
    
    DIZHI_COMBINATIONS.sanhui.forEach(combo => {
      const matchCount = this.countMatches(branches, combo.branches);
      if (matchCount >= 2) {
        const isComplete = matchCount === 3;
        const score = isComplete ? combo.score : combo.score * 0.5; // 不全时减半
        
        results.push({
          branches: combo.branches,
          element: combo.element,
          score,
          isComplete
        });
      }
    });
    
    return results;
  }

  /**
   * 分析三合关系
   */
  private analyzeSanhe(branches: string[]): Array<{
    branches: string[];
    element: WuxingElement;
    score: number;
    isComplete: boolean;
  }> {
    const results: Array<{
      branches: string[];
      element: WuxingElement;
      score: number;
      isComplete: boolean;
    }> = [];
    
    DIZHI_COMBINATIONS.sanhe.forEach(combo => {
      const matchCount = this.countMatches(branches, combo.branches);
      if (matchCount >= 2) {
        const isComplete = matchCount === 3;
        const score = isComplete ? combo.score : combo.score * 0.6; // 不全时六折
        
        results.push({
          branches: combo.branches,
          element: combo.element,
          score,
          isComplete
        });
      }
    });
    
    return results;
  }

  /**
   * 分析六合关系
   */
  private analyzeLiuhe(branches: string[]): Array<{
    branches: string[];
    mergedElement: WuxingElement;
    score: number;
    isComplete: boolean;
  }> {
    const results: Array<{
      branches: string[];
      mergedElement: WuxingElement;
      score: number;
      isComplete: boolean;
    }> = [];
    
    DIZHI_COMBINATIONS.liuhe.forEach(combo => {
      const matchCount = this.countMatches(branches, combo.branches);
      if (matchCount === 2) { // 六合必须完整
        results.push({
          branches: combo.branches,
          mergedElement: combo.mergedElement,
          score: combo.score,
          isComplete: true
        });
      }
    });
    
    return results;
  }

  /**
   * 计算匹配数量
   */
  private countMatches(branches: string[], targetBranches: string[]): number {
    let count = 0;
    targetBranches.forEach(target => {
      if (branches.includes(target)) {
        count++;
      }
    });
    return count;
  }

  /**
   * 计算总加分
   */
  private calculateTotalBonus(
    sanhui: Array<{ element: WuxingElement; score: number; isComplete: boolean; }>,
    sanhe: Array<{ element: WuxingElement; score: number; isComplete: boolean; }>,
    liuhe: Array<{ mergedElement: WuxingElement; score: number; isComplete: boolean; }>
  ): WuxingScores {
    const totalBonus: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    // 三会加分
    sanhui.forEach(combo => {
      totalBonus[combo.element] += combo.score;
    });
    
    // 三合加分
    sanhe.forEach(combo => {
      totalBonus[combo.element] += combo.score;
    });
    
    // 六合加分
    liuhe.forEach(combo => {
      totalBonus[combo.mergedElement] += combo.score;
    });
    
    return totalBonus;
  }

  /**
   * 检查特定合局
   */
  checkSpecificCombination(
    branches: string[], 
    combinationType: 'sanhui' | 'sanhe' | 'liuhe',
    element?: WuxingElement
  ): {
    found: boolean;
    combinations: Array<{
      branches: string[];
      element: WuxingElement;
      score: number;
      isComplete: boolean;
    }>;
  } {
    const combinations = DIZHI_COMBINATIONS[combinationType];
    const results: Array<{
      branches: string[];
      element: WuxingElement;
      score: number;
      isComplete: boolean;
    }> = [];
    
    combinations.forEach(combo => {
      const matchCount = this.countMatches(branches, combo.branches);
      const isEligible = combinationType === 'liuhe' ? matchCount === 2 : matchCount >= 2;
      
      if (isEligible) {
        const targetElement = 'element' in combo ? combo.element : combo.mergedElement;
        
        // 如果指定了元素，只返回该元素的合局
        if (!element || targetElement === element) {
          const isComplete = matchCount === combo.branches.length;
          const scoreMultiplier = combinationType === 'liuhe' ? 1 : 
                                 (isComplete ? 1 : (combinationType === 'sanhui' ? 0.5 : 0.6));
          
          results.push({
            branches: combo.branches,
            element: targetElement,
            score: combo.score * scoreMultiplier,
            isComplete
          });
        }
      }
    });
    
    return {
      found: results.length > 0,
      combinations: results
    };
  }

  /**
   * 计算合局优先级
   */
  calculateCombinationPriority(
    sanhui: Array<{ element: WuxingElement; score: number; isComplete: boolean; }>,
    sanhe: Array<{ element: WuxingElement; score: number; isComplete: boolean; }>,
    liuhe: Array<{ mergedElement: WuxingElement; score: number; isComplete: boolean; }>
  ): Array<{
    type: 'sanhui' | 'sanhe' | 'liuhe';
    element: WuxingElement;
    priority: number;
    description: string;
  }> {
    const priorities: Array<{
      type: 'sanhui' | 'sanhe' | 'liuhe';
      element: WuxingElement;
      priority: number;
      description: string;
    }> = [];
    
    // 三会优先级最高
    sanhui.forEach(combo => {
      priorities.push({
        type: 'sanhui',
        element: combo.element,
        priority: combo.isComplete ? 10 : 8,
        description: `${this.getElementName(combo.element)}局三会${combo.isComplete ? '(完整)' : '(不全)'}`
      });
    });
    
    // 三合优先级中等
    sanhe.forEach(combo => {
      priorities.push({
        type: 'sanhe',
        element: combo.element,
        priority: combo.isComplete ? 7 : 5,
        description: `${this.getElementName(combo.element)}局三合${combo.isComplete ? '(完整)' : '(不全)'}`
      });
    });
    
    // 六合优先级较低
    liuhe.forEach(combo => {
      priorities.push({
        type: 'liuhe',
        element: combo.mergedElement,
        priority: 3,
        description: `六合化${this.getElementName(combo.mergedElement)}`
      });
    });
    
    // 按优先级排序
    return priorities.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 获取五行中文名称
   */
  private getElementName(element: WuxingElement): string {
    const names = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
    return names[element];
  }

  /**
   * 分析合局对日主的影响
   */
  analyzeDayMasterImpact(
    dayMasterElement: WuxingElement,
    combinations: CombinationInfluence
  ): {
    beneficialCombinations: Array<{ type: string; element: WuxingElement; impact: string; }>;
    harmfulCombinations: Array<{ type: string; element: WuxingElement; impact: string; }>;
    neutralCombinations: Array<{ type: string; element: WuxingElement; impact: string; }>;
  } {
    const beneficial: Array<{ type: string; element: WuxingElement; impact: string; }> = [];
    const harmful: Array<{ type: string; element: WuxingElement; impact: string; }> = [];
    const neutral: Array<{ type: string; element: WuxingElement; impact: string; }> = [];
    
    const analyzeImpact = (type: string, element: WuxingElement) => {
      const impact = this.getElementRelation(dayMasterElement, element);
      const combo = { type, element, impact: impact.description };
      
      if (impact.beneficial) {
        beneficial.push(combo);
      } else if (impact.harmful) {
        harmful.push(combo);
      } else {
        neutral.push(combo);
      }
    };
    
    // 分析三会
    combinations.sanhui.forEach(combo => {
      analyzeImpact('三会', combo.element);
    });
    
    // 分析三合
    combinations.sanhe.forEach(combo => {
      analyzeImpact('三合', combo.element);
    });
    
    // 分析六合
    combinations.liuhe.forEach(combo => {
      analyzeImpact('六合', combo.mergedElement);
    });
    
    return {
      beneficialCombinations: beneficial,
      harmfulCombinations: harmful,
      neutralCombinations: neutral
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
    
    // 检查是否生日主
    const shengMap: Record<WuxingElement, WuxingElement> = {
      wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal'
    };
    if (shengMap[dayMaster] === target) {
      return { beneficial: true, harmful: false, description: '生助日主' };
    }
    
    // 检查是否克日主
    const keMap: Record<WuxingElement, WuxingElement> = {
      wood: 'metal', fire: 'water', earth: 'wood', metal: 'fire', water: 'earth'
    };
    if (keMap[dayMaster] === target) {
      return { beneficial: false, harmful: true, description: '克制日主' };
    }
    
    // 其他情况为中性
    return { beneficial: false, harmful: false, description: '中性影响' };
  }
}