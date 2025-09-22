/**
 * 生克关系分析器
 * 负责分析五行相生相克关系对强弱的影响
 */

import { WuxingElement, RelationshipInfluence, WuxingScores, IRelationshipAnalyzer } from './types';
import { WUXING_SHENG, WUXING_KE, TIANGAN_WUXING, DIZHI_CANGGAN } from './constants';

export class RelationshipAnalyzer implements IRelationshipAnalyzer {
  /**
   * 分析生克关系影响
   */
  async analyze(bazi: string[], season: string): Promise<RelationshipInfluence> {
    const elementCounts = this.calculateElementCounts(bazi);
    const shengRelationships = this.calculateShengRelationships(elementCounts);
    const keRelationships = this.calculateKeRelationships(elementCounts);
    const netInfluence = this.calculateNetInfluence(shengRelationships, keRelationships);
    
    return {
      shengRelationships,
      keRelationships,
      netInfluence
    };
  }

  /**
   * 计算各五行数量（含权重）
   */
  private calculateElementCounts(bazi: string[]): WuxingScores {
    const counts: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    // 计算天干
    for (let i = 0; i < 8; i += 2) {
      const tiangan = bazi[i];
      const element = TIANGAN_WUXING[tiangan];
      if (element) {
        counts[element] += 1;
      }
    }
    
    // 计算地支藏干
    for (let i = 1; i < 8; i += 2) {
      const dizhi = bazi[i];
      const canggan = DIZHI_CANGGAN[dizhi];
      if (canggan) {
        for (const [stem, info] of Object.entries(canggan)) {
          const element = info.element;
          const weight = info.weight;
          counts[element] += weight;
        }
      }
    }
    
    return counts;
  }

  /**
   * 计算相生关系及强度
   */
  private calculateShengRelationships(elementCounts: WuxingScores): Array<{
    from: WuxingElement;
    to: WuxingElement;
    strength: number;
    description: string;
  }> {
    const relationships: Array<{
      from: WuxingElement;
      to: WuxingElement;
      strength: number;
      description: string;
    }> = [];
    
    const elements: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    
    elements.forEach(fromElement => {
      const toElement = WUXING_SHENG[fromElement];
      const fromCount = elementCounts[fromElement];
      const toCount = elementCounts[toElement];
      
      if (fromCount > 0 && toCount > 0) {
        // 生的强度基于生者的数量和被生者的需要
        const strength = fromCount * Math.min(toCount, 2); // 最多加倍
        
        if (strength > 0) {
          relationships.push({
            from: fromElement,
            to: toElement,
            strength,
            description: `${this.getElementName(fromElement)}生${this.getElementName(toElement)}：+${strength.toFixed(1)}`
          });
        }
      }
    });
    
    return relationships;
  }

  /**
   * 计算相克关系及强度
   */
  private calculateKeRelationships(elementCounts: WuxingScores): Array<{
    from: WuxingElement;
    to: WuxingElement;
    strength: number;
    description: string;
  }> {
    const relationships: Array<{
      from: WuxingElement;
      to: WuxingElement;
      strength: number;
      description: string;
    }> = [];
    
    const elements: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    
    elements.forEach(fromElement => {
      const toElement = WUXING_KE[fromElement];
      const fromCount = elementCounts[fromElement];
      const toCount = elementCounts[toElement];
      
      if (fromCount > 0 && toCount > 0) {
        // 克的强度基于克者的数量，但要考虑被克者的抵抗力
        let strength = fromCount * 1.5;
        
        // 如果被克者很强，减少克制效果
        if (toCount >= fromCount * 2) {
          strength *= 0.5; // 被克者很强时，克制效果减半
        }
        
        if (strength > 0) {
          relationships.push({
            from: fromElement,
            to: toElement,
            strength: -strength, // 负值表示减分
            description: `${this.getElementName(fromElement)}克${this.getElementName(toElement)}：-${strength.toFixed(1)}`
          });
        }
      }
    });
    
    return relationships;
  }

  /**
   * 计算净影响
   */
  private calculateNetInfluence(
    shengRelationships: Array<{ from: WuxingElement; to: WuxingElement; strength: number; description: string; }>,
    keRelationships: Array<{ from: WuxingElement; to: WuxingElement; strength: number; description: string; }>
  ): WuxingScores {
    const netInfluence: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    // 累计相生的正面影响
    shengRelationships.forEach(rel => {
      netInfluence[rel.to] += rel.strength;
    });
    
    // 累计相克的负面影响
    keRelationships.forEach(rel => {
      netInfluence[rel.to] += rel.strength; // strength已经是负值
    });
    
    return netInfluence;
  }

  /**
   * 获取五行中文名称
   */
  private getElementName(element: WuxingElement): string {
    const names = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
    return names[element];
  }

  /**
   * 分析某个五行的生克环境
   */
  analyzeElementEnvironment(
    targetElement: WuxingElement, 
    elementCounts: WuxingScores
  ): {
    supportCount: number;  // 生助力量
    restraintCount: number; // 克制力量
    consumptionCount: number; // 泄耗力量
    netEffect: number; // 净效果
    environment: 'supportive' | 'hostile' | 'neutral'; // 环境评价
  } {
    // 计算生助：生我者 + 同类
    let supportCount = elementCounts[this.getShengSource(targetElement)] + elementCounts[targetElement] - 1;
    
    // 计算克制：克我者
    let restraintCount = elementCounts[this.getKeSource(targetElement)];
    
    // 计算泄耗：我生者 + 我克者
    let consumptionCount = elementCounts[WUXING_SHENG[targetElement]] + elementCounts[WUXING_KE[targetElement]];
    
    // 计算净效果
    const netEffect = supportCount - restraintCount - consumptionCount * 0.5;
    
    // 评价环境
    let environment: 'supportive' | 'hostile' | 'neutral';
    if (netEffect > 1) {
      environment = 'supportive';
    } else if (netEffect < -1) {
      environment = 'hostile';
    } else {
      environment = 'neutral';
    }
    
    return {
      supportCount,
      restraintCount,
      consumptionCount,
      netEffect,
      environment
    };
  }

  /**
   * 获取生我的五行
   */
  private getShengSource(element: WuxingElement): WuxingElement {
    const reverseSheng: Record<WuxingElement, WuxingElement> = {
      wood: 'water',
      fire: 'wood',
      earth: 'fire',
      metal: 'earth',
      water: 'metal'
    };
    return reverseSheng[element];
  }

  /**
   * 获取克我的五行
   */
  private getKeSource(element: WuxingElement): WuxingElement {
    const reverseKe: Record<WuxingElement, WuxingElement> = {
      wood: 'metal',
      fire: 'water',
      earth: 'wood',
      metal: 'fire',
      water: 'earth'
    };
    return reverseKe[element];
  }

  /**
   * 计算生克循环强度
   */
  calculateCyclicStrength(elementCounts: WuxingScores): {
    shengCycle: number; // 相生循环强度
    keCycle: number;    // 相克循环强度
    balance: number;    // 平衡度
  } {
    // 相生循环：木→火→土→金→水→木
    const shengCycle = Math.min(
      elementCounts.wood,
      elementCounts.fire,
      elementCounts.earth,
      elementCounts.metal,
      elementCounts.water
    );
    
    // 相克循环：木→土→水→火→金→木
    const keCycle = Math.min(
      elementCounts.wood,
      elementCounts.earth,
      elementCounts.water,
      elementCounts.fire,
      elementCounts.metal
    );
    
    // 平衡度：生克循环都强时平衡度高
    const balance = Math.min(shengCycle, keCycle);
    
    return { shengCycle, keCycle, balance };
  }
}