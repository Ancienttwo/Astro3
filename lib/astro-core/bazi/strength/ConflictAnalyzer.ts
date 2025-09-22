/**
 * 冲突关系分析器
 * 负责分析地支刑冲害破穿绝对五行强弱的负面影响
 */

import { WuxingElement, ConflictInfluence, WuxingScores, IConflictAnalyzer } from './types';
import { DIZHI_CONFLICTS, DIZHI_CANGGAN } from './constants';

// 定义命名类型以提高代码可读性和类型安全
interface ConflictPair {
  pair: string[];
  affectedElements: WuxingElement[];
  severity: number;
  description: string;
}

interface ConflictGroup {
  group: string[];
  affectedElements: WuxingElement[];
  severity: number;
  description: string;
}

interface ImpactAnalysis {
  type: string;
  description: string;
  severity: number;
}

interface DayMasterConflictAnalysis {
  directImpacts: ImpactAnalysis[];
  indirectImpacts: ImpactAnalysis[];
  totalImpact: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

interface SpecificConflictResult {
  participants: string[];
  severity: number;
  description: string;
}

interface ConflictCheckResult {
  found: boolean;
  conflicts: SpecificConflictResult[];
}

type ConflictType = 'chong' | 'xing' | 'po' | 'chuan' | 'jue';

export class ConflictAnalyzer implements IConflictAnalyzer {
  /**
   * 分析冲突关系影响
   */
  async analyze(branches: string[]): Promise<ConflictInfluence> {
    const chong = this.analyzeChong(branches);
    const xing = this.analyzeXing(branches);
    const hai = this.analyzeHai(branches); // 包含破、穿、绝
    const totalPenalty = this.calculateTotalPenalty(chong, xing, hai);
    
    return {
      chong,
      xing,
      hai,
      totalPenalty
    };
  }

  /**
   * 分析冲关系
   */
  private analyzeChong(branches: string[]): ConflictPair[] {
    const results: ConflictPair[] = [];
    
    DIZHI_CONFLICTS.chong.forEach(conflict => {
      const hasFirst = branches.includes(conflict.pair[0]);
      const hasSecond = branches.includes(conflict.pair[1]);
      
      if (hasFirst && hasSecond) {
        const affectedElements = this.getAffectedElements(conflict.pair);
        results.push({
          pair: conflict.pair,
          affectedElements,
          severity: Math.abs(conflict.score),
          description: `${conflict.pair[0]}${conflict.pair[1]}相冲，损耗${affectedElements.map(e => this.getElementName(e)).join('、')}`
        });
      }
    });
    
    return results;
  }

  /**
   * 分析刑关系
   */
  private analyzeXing(branches: string[]): ConflictGroup[] {
    const results: ConflictGroup[] = [];
    
    DIZHI_CONFLICTS.xing.forEach(conflict => {
      let matchCount = 0;
      const matchedBranches: string[] = [];
      
      if ('group' in conflict && conflict.group) {
        // 三刑
        conflict.group.forEach(branch => {
          if (branches.includes(branch)) {
            matchCount++;
            matchedBranches.push(branch);
          }
        });
        
        if (matchCount >= 2) {
          const affectedElements = this.getAffectedElements(matchedBranches);
          const isComplete = matchCount === 3;
          const severity = Math.abs(conflict.score) * (isComplete ? 1 : 0.7);
          
          results.push({
            group: conflict.group,
            affectedElements,
            severity,
            description: `${matchedBranches.join('')}${isComplete ? '三刑' : '见刑'}，损耗${affectedElements.map(e => this.getElementName(e)).join('、')}`
          });
        }
      } else if ('pair' in conflict && conflict.pair) {
        // 对刑
        const hasFirst = branches.includes(conflict.pair[0]);
        const hasSecond = branches.includes(conflict.pair[1]);
        
        if (hasFirst && hasSecond) {
          const affectedElements = this.getAffectedElements(conflict.pair);
          results.push({
            group: conflict.pair,
            affectedElements,
            severity: Math.abs(conflict.score),
            description: `${conflict.pair[0]}${conflict.pair[1]}相刑，损耗${affectedElements.map(e => this.getElementName(e)).join('、')}`
          });
        }
      }
    });
    
    return results;
  }

  /**
   * 分析害（包含破、穿、绝）关系
   */
  private analyzeHai(branches: string[]): ConflictPair[] {
    const results: ConflictPair[] = [];
    
    // 分析破
    DIZHI_CONFLICTS.po?.forEach(conflict => {
      const hasFirst = branches.includes(conflict.pair[0]);
      const hasSecond = branches.includes(conflict.pair[1]);
      
      if (hasFirst && hasSecond) {
        const affectedElements = this.getAffectedElements(conflict.pair);
        results.push({
          pair: conflict.pair,
          affectedElements,
          severity: Math.abs(conflict.score),
          description: `${conflict.pair[0]}${conflict.pair[1]}相破，轻损${affectedElements.map(e => this.getElementName(e)).join('、')}`
        });
      }
    });
    
    // 分析穿
    DIZHI_CONFLICTS.chuan?.forEach(conflict => {
      const hasFirst = branches.includes(conflict.pair[0]);
      const hasSecond = branches.includes(conflict.pair[1]);
      
      if (hasFirst && hasSecond) {
        const affectedElements = this.getAffectedElements(conflict.pair);
        results.push({
          pair: conflict.pair,
          affectedElements,
          severity: Math.abs(conflict.score),
          description: `${conflict.pair[0]}${conflict.pair[1]}相穿，暗损${affectedElements.map(e => this.getElementName(e)).join('、')}`
        });
      }
    });
    
    // 分析绝
    DIZHI_CONFLICTS.jue?.forEach(conflict => {
      const hasFirst = branches.includes(conflict.pair[0]);
      const hasSecond = branches.includes(conflict.pair[1]);
      
      if (hasFirst && hasSecond) {
        const affectedElements = this.getAffectedElements(conflict.pair);
        results.push({
          pair: conflict.pair,
          affectedElements,
          severity: Math.abs(conflict.score),
          description: `${conflict.pair[0]}${conflict.pair[1]}相绝，重损${affectedElements.map(e => this.getElementName(e)).join('、')}`
        });
      }
    });
    
    return results;
  }

  /**
   * 获取受影响的五行
   */
  private getAffectedElements(branches: string[]): WuxingElement[] {
    const elements = new Set<WuxingElement>();
    
    branches.forEach(branch => {
      const canggan = DIZHI_CANGGAN[branch];
      if (canggan) {
        Object.values(canggan).forEach(info => {
          elements.add(info.element);
        });
      }
    });
    
    return Array.from(elements);
  }

  /**
   * 计算总扣分
   */
  private calculateTotalPenalty(
    chong: ConflictPair[],
    xing: ConflictGroup[],
    hai: ConflictPair[]
  ): WuxingScores {
    const totalPenalty: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    const applyPenalty = (conflicts: Array<{ affectedElements: WuxingElement[]; severity: number; }>) => {
      conflicts.forEach(conflict => {
        conflict.affectedElements.forEach(element => {
          totalPenalty[element] -= conflict.severity;
        });
      });
    };
    
    applyPenalty(chong);
    applyPenalty(xing);
    applyPenalty(hai);
    
    return totalPenalty;
  }

  /**
   * 获取五行中文名称
   */
  private getElementName(element: WuxingElement): string {
    const names = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
    return names[element];
  }

  /**
   * 分析冲突对日主的影响
   */
  analyzeDayMasterConflictImpact(
    dayMasterElement: WuxingElement,
    conflicts: ConflictInfluence
  ): DayMasterConflictAnalysis {
    const directImpacts: ImpactAnalysis[] = [];
    const indirectImpacts: ImpactAnalysis[] = [];
    let totalImpact = 0;
    
    // 分析冲对日主的影响
    conflicts.chong.forEach(conflict => {
      if (conflict.affectedElements.includes(dayMasterElement)) {
        directImpacts.push({
          type: '相冲',
          description: conflict.description,
          severity: conflict.severity
        });
        totalImpact += conflict.severity;
      } else {
        indirectImpacts.push({
          type: '相冲',
          description: conflict.description + ' (间接影响)',
          severity: conflict.severity * 0.3
        });
        totalImpact += conflict.severity * 0.3;
      }
    });
    
    // 分析刑对日主的影响
    conflicts.xing.forEach(conflict => {
      if (conflict.affectedElements.includes(dayMasterElement)) {
        directImpacts.push({
          type: '相刑',
          description: conflict.description,
          severity: conflict.severity
        });
        totalImpact += conflict.severity;
      } else {
        indirectImpacts.push({
          type: '相刑',
          description: conflict.description + ' (间接影响)',
          severity: conflict.severity * 0.4
        });
        totalImpact += conflict.severity * 0.4;
      }
    });
    
    // 分析害对日主的影响
    conflicts.hai.forEach(conflict => {
      if (conflict.affectedElements.includes(dayMasterElement)) {
        directImpacts.push({
          type: '相害',
          description: conflict.description,
          severity: conflict.severity
        });
        totalImpact += conflict.severity;
      } else {
        indirectImpacts.push({
          type: '相害',
          description: conflict.description + ' (间接影响)',
          severity: conflict.severity * 0.2
        });
        totalImpact += conflict.severity * 0.2;
      }
    });
    
    // 评估风险等级
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (totalImpact < 2) {
      riskLevel = 'low';
    } else if (totalImpact < 5) {
      riskLevel = 'medium';
    } else if (totalImpact < 10) {
      riskLevel = 'high';
    } else {
      riskLevel = 'critical';
    }
    
    return {
      directImpacts,
      indirectImpacts,
      totalImpact,
      riskLevel
    };
  }

  /**
   * 检查特定冲突
   */
  checkSpecificConflict(
    branches: string[],
    conflictType: ConflictType
  ): ConflictCheckResult {
    const results: SpecificConflictResult[] = [];
    
    const conflictGroup = conflictType === 'chong' ? DIZHI_CONFLICTS.chong :
                         conflictType === 'xing' ? DIZHI_CONFLICTS.xing :
                         conflictType === 'po' ? DIZHI_CONFLICTS.po :
                         conflictType === 'chuan' ? DIZHI_CONFLICTS.chuan :
                         DIZHI_CONFLICTS.jue;
    
    if (!conflictGroup) return { found: false, conflicts: [] };
    
    conflictGroup.forEach(conflict => {
      if ('pair' in conflict && conflict.pair) {
        const hasFirst = branches.includes(conflict.pair[0]);
        const hasSecond = branches.includes(conflict.pair[1]);
        
        if (hasFirst && hasSecond) {
          results.push({
            participants: conflict.pair,
            severity: Math.abs(conflict.score),
            description: this.getConflictDescription(conflictType, conflict.pair)
          });
        }
      } else if ('group' in conflict && conflict.group) {
        const matchedBranches: string[] = [];
        conflict.group.forEach(branch => {
          if (branches.includes(branch)) {
            matchedBranches.push(branch);
          }
        });
        
        if (matchedBranches.length >= 2) {
          results.push({
            participants: matchedBranches,
            severity: Math.abs(conflict.score) * (matchedBranches.length === 3 ? 1 : 0.7),
            description: this.getConflictDescription(conflictType, matchedBranches)
          });
        }
      }
    });
    
    return {
      found: results.length > 0,
      conflicts: results
    };
  }

  /**
   * 获取冲突描述
   */
  private getConflictDescription(type: ConflictType, participants: string[]): string {
    const typeNames: Record<ConflictType, string | ((participants: string[]) => string)> = {
      chong: '相冲',
      xing: (participants: string[]) => participants.length === 3 ? '三刑' : '相刑',
      po: '相破',
      chuan: '相穿',
      jue: '相绝'
    };
    
    const typeName = typeNames[type];
    const typeNameStr = typeof typeName === 'function' ? typeName(participants) : typeName;
    return `${participants.join('')}${typeNameStr}`;
  }
}