/**
 * 神煞检测器基类
 * 提供通用的检测逻辑和工具方法
 */

import {
  IShenShaDetector,
  ShenShaInput,
  ShenShaDetectionResult,
  ShenShaInfo,
  ShenShaCondition,
  PillarType,
  ShenShaError
} from '../types';
import type { StemName, BranchName } from '../../types';

export abstract class BaseDetector implements IShenShaDetector {
  public abstract name: string;
  public abstract supportedShenSha: string[];
  
  protected shenShaInfoMap: Map<string, ShenShaInfo> = new Map();
  protected conditionsMap: Map<string, ShenShaCondition[]> = new Map();
  
  constructor() {
    this.initializeShenShaInfo();
    this.initializeConditions();
  }
  
  /**
   * 初始化神煞信息
   */
  protected abstract initializeShenShaInfo(): void;
  
  /**
   * 初始化检测条件
   */
  protected abstract initializeConditions(): void;
  
  /**
   * 执行检测
   */
  public detect(input: ShenShaInput): ShenShaDetectionResult[] {
    try {
      this.validateInput(input);
      const results: ShenShaDetectionResult[] = [];
      
      for (const shenShaName of this.supportedShenSha) {
        const result = this.detectSingle(shenShaName, input);
        if (result) {
          results.push(result);
        }
      }
      
      return results;
    } catch (error) {
      throw new ShenShaError(
        `检测失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'DETECTION_ERROR',
        { detector: this.name, input }
      );
    }
  }
  
  /**
   * 检测单个神煞
   */
  protected detectSingle(shenShaName: string, input: ShenShaInput): ShenShaDetectionResult | null {
    const conditions = this.conditionsMap.get(shenShaName);
    if (!conditions) {
      return null;
    }
    
    const result: ShenShaDetectionResult = {
      name: shenShaName,
      hasIt: false,
      positions: []
    };
    
    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, input);
      if (conditionResult.matched) {
        result.hasIt = true;
        result.positions.push(...conditionResult.positions);
        result.details = conditionResult.details;
      }
    }
    
    return result;
  }
  
  /**
   * 评估检测条件
   */
  protected evaluateCondition(condition: ShenShaCondition, input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }>;
    details?: any;
  } {
    switch (condition.type) {
      case 'stem':
        return this.evaluateStemCondition(condition, input);
      case 'branch':
        return this.evaluateBranchCondition(condition, input);
      case 'stemBranch':
        return this.evaluateStemBranchCondition(condition, input);
      case 'relationship':
        return this.evaluateRelationshipCondition(condition, input);
      case 'combination':
        return this.evaluateCombinationCondition(condition, input);
      default:
        return { matched: false, positions: [] };
    }
  }
  
  /**
   * 评估天干条件
   */
  protected evaluateStemCondition(condition: ShenShaCondition, input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }>;
    details?: any;
  } {
    const positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }> = [];
    let matched = false;
    
    if (condition.targetPillar && condition.targetValue) {
      // 检查特定柱位的天干
      const pillar = input.fourPillars[condition.targetPillar];
      const targetValues = Array.isArray(condition.targetValue) ? condition.targetValue : [condition.targetValue];
      
      if (targetValues.includes(pillar.stem)) {
        matched = true;
        positions.push({ pillar: condition.targetPillar, stem: pillar.stem });
      }
    } else if (condition.targetValue) {
      // 检查所有柱位的天干
      const targetValues = Array.isArray(condition.targetValue) ? condition.targetValue : [condition.targetValue];
      const pillars: PillarType[] = ['year', 'month', 'day', 'hour'];
      
      for (const pillarType of pillars) {
        const pillar = input.fourPillars[pillarType];
        if (targetValues.includes(pillar.stem)) {
          matched = true;
          positions.push({ pillar: pillarType, stem: pillar.stem });
        }
      }
    }
    
    return { matched, positions };
  }
  
  /**
   * 评估地支条件
   */
  protected evaluateBranchCondition(condition: ShenShaCondition, input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }>;
    details?: any;
  } {
    const positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }> = [];
    let matched = false;
    
    if (condition.targetPillar && condition.targetValue) {
      // 检查特定柱位的地支
      const pillar = input.fourPillars[condition.targetPillar];
      const targetValues = Array.isArray(condition.targetValue) ? condition.targetValue : [condition.targetValue];
      
      if (targetValues.includes(pillar.branch)) {
        matched = true;
        positions.push({ pillar: condition.targetPillar, branch: pillar.branch });
      }
    } else if (condition.targetValue) {
      // 检查所有柱位的地支
      const targetValues = Array.isArray(condition.targetValue) ? condition.targetValue : [condition.targetValue];
      const pillars: PillarType[] = ['year', 'month', 'day', 'hour'];
      
      for (const pillarType of pillars) {
        const pillar = input.fourPillars[pillarType];
        if (targetValues.includes(pillar.branch)) {
          matched = true;
          positions.push({ pillar: pillarType, branch: pillar.branch });
        }
      }
    }
    
    return { matched, positions };
  }
  
  /**
   * 评估干支组合条件
   */
  protected evaluateStemBranchCondition(condition: ShenShaCondition, input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }>;
    details?: any;
  } {
    const positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }> = [];
    let matched = false;
    
    if (condition.targetPillar && condition.targetValue && condition.referenceValue) {
      // 检查特定柱位的干支组合
      const pillar = input.fourPillars[condition.targetPillar];
      const stemValues = Array.isArray(condition.targetValue) ? condition.targetValue : [condition.targetValue];
      const branchValues = Array.isArray(condition.referenceValue) ? condition.referenceValue : [condition.referenceValue];
      
      if (stemValues.includes(pillar.stem) && branchValues.includes(pillar.branch)) {
        matched = true;
        positions.push({ pillar: condition.targetPillar, stem: pillar.stem, branch: pillar.branch });
      }
    }
    
    return { matched, positions };
  }
  
  /**
   * 评估关系条件（如基于参照柱位的计算）
   */
  protected evaluateRelationshipCondition(condition: ShenShaCondition, input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }>;
    details?: any;
  } {
    // 这是一个抽象方法，由子类具体实现
    return { matched: false, positions: [] };
  }
  
  /**
   * 评估组合条件（多个条件的逻辑组合）
   */
  protected evaluateCombinationCondition(condition: ShenShaCondition, input: ShenShaInput): {
    matched: boolean;
    positions: Array<{ pillar: PillarType; stem?: string; branch?: string; }>;
    details?: any;
  } {
    // 这是一个抽象方法，由子类具体实现
    return { matched: false, positions: [] };
  }
  
  /**
   * 获取神煞信息
   */
  public getShenShaInfo(name: string): ShenShaInfo | undefined {
    return this.shenShaInfoMap.get(name);
  }
  
  /**
   * 验证输入参数
   */
  protected validateInput(input: ShenShaInput): void {
    if (!input) {
      throw new ShenShaError('输入参数不能为空', 'INVALID_INPUT');
    }
    
    if (!input.fourPillars) {
      throw new ShenShaError('四柱信息不能为空', 'INVALID_INPUT');
    }
    
    const requiredPillars: PillarType[] = ['year', 'month', 'day', 'hour'];
    for (const pillarType of requiredPillars) {
      const pillar = input.fourPillars[pillarType];
      if (!pillar || !pillar.stem || !pillar.branch) {
        throw new ShenShaError(`${pillarType}柱信息不完整`, 'INVALID_INPUT');
      }
    }
    
    if (!['male', 'female'].includes(input.gender)) {
      throw new ShenShaError('性别信息无效', 'INVALID_INPUT');
    }
  }
  
  /**
   * 工具方法：根据地支获取相对位置
   */
  protected getBranchRelativePosition(baseBranch: BranchName, offset: number): BranchName {
    const branches: BranchName[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const baseIndex = branches.indexOf(baseBranch);
    const targetIndex = (baseIndex + offset + 12) % 12;
    return branches[targetIndex];
  }
  
  /**
   * 工具方法：根据天干获取相对位置
   */
  protected getStemRelativePosition(baseStem: StemName, offset: number): StemName {
    const stems: StemName[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const baseIndex = stems.indexOf(baseStem);
    const targetIndex = (baseIndex + offset + 10) % 10;
    return stems[targetIndex];
  }
  
  /**
   * 工具方法：检查地支三合局
   */
  protected checkBranchTripleCombination(branches: BranchName[]): {
    hasTriple: boolean;
    type?: 'wood' | 'fire' | 'metal' | 'water';
    matchedBranches?: BranchName[];
  } {
    const combinations = {
      wood: ['寅', '午', '戌'],
      fire: ['巳', '酉', '丑'],
      metal: ['申', '子', '辰'],
      water: ['亥', '卯', '未']
    };
    
    for (const [type, combo] of Object.entries(combinations)) {
      const matches = combo.filter(branch => branches.includes(branch as BranchName));
      if (matches.length >= 2) {
        return {
          hasTriple: matches.length === 3,
          type: type as 'wood' | 'fire' | 'metal' | 'water',
          matchedBranches: matches as BranchName[]
        };
      }
    }
    
    return { hasTriple: false };
  }
  
  /**
   * 工具方法：添加神煞信息
   */
  protected addShenShaInfo(name: string, info: ShenShaInfo): void {
    this.shenShaInfoMap.set(name, info);
  }
  
  /**
   * 工具方法：添加检测条件
   */
  protected addCondition(shenShaName: string, conditions: ShenShaCondition[]): void {
    this.conditionsMap.set(shenShaName, conditions);
  }
}
