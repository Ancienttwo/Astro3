/**
 * @astroall/bazi-core Capability Scorer
 * 
 * 六能力评分引擎 - 基于十神强度计算能力分数
 * 包含格局检测、主导性加成、平滑处理等完整功能
 * 
 * @ai-context CAPABILITY_SCORER
 * @purpose 基于十神强度计算六大能力评分
 * @version 1.0.0
 * @created 2025-09-06
 */

import {
  TenGod,
  TenGodStrength,
  CapabilityName,
  CapabilityScores,
  ClusterScores,
  CapabilityConfig,
  CapabilityCalculationResult,
  CapabilityCalculationDetails,
  PatternDetectionResult,
  ValidationError
} from './types';
import { CapabilityScoresValidator, TenGodStrengthValidator } from './data-validators';

// ========================= 能力权重配置 =========================

/**
 * 修复后的权重配置 - 基于BossAI V2.0算法
 */
const CAPABILITY_WEIGHTS_V2: { [key in CapabilityName]: { [K in TenGod]: number } } = {
  '执行力基础分': {
    '正官': 0.35, '七杀': 0.30, '比肩': 0.20, '劫财': 0.10,
    '正印': 0.15, '偏印': 0.08, '食神': 0.05, '伤官': 0.03, 
    '正财': 0.02, '偏财': 0.01
  },
  '创新力基础分': {
    '伤官': 0.40, '食神': 0.35, '偏印': 0.20, '劫财': 0.15,
    '正印': 0.10, '七杀': 0.08, '偏财': 0.05, '正财': 0.03, 
    '正官': 0.02, '比肩': 0.01
  },
  '管理力基础分': {
    '正官': 0.45, '七杀': 0.35, '正印': 0.25, '偏印': 0.15,
    '比肩': 0.12, '食神': 0.08, '劫财': 0.05, '伤官': 0.03, 
    '正财': 0.02, '偏财': 0.01
  },
  '销售力基础分': {
    '伤官': 0.35, '食神': 0.30, '正财': 0.25, '偏财': 0.20,
    '劫财': 0.15, '比肩': 0.10, '七杀': 0.08, '正官': 0.05, 
    '正印': 0.03, '偏印': 0.02
  },
  '协调力基础分': {
    '正印': 0.40, '偏印': 0.30, '食神': 0.25, '正官': 0.20,
    '比肩': 0.15, '正财': 0.12, '偏财': 0.08, '劫财': 0.05, 
    '伤官': 0.03, '七杀': 0.02
  },
  '稳定性基础分': {
    '比肩': 0.40, '正印': 0.35, '正官': 0.25, '偏印': 0.15,
    '正财': 0.12, '食神': 0.08, '偏财': 0.05, '劫财': 0.03, 
    '七杀': 0.02, '伤官': 0.01
  }
};

// ========================= 默认配置 =========================

/**
 * 默认能力评分配置
 */
export const DEFAULT_CAPABILITY_CONFIG: CapabilityConfig = {
  amplification_factor: 2.2,        // 基础放大系数
  dominance_threshold: 0.3,         // 主导阈值
  dominance_bonus_factor: 60,       // 主导加成系数
  min_score: 15,                    // 最低分数
  max_score: 100,                   // 最高分数
  smooth_factor: true,              // 是否使用平方根平滑
  capability_weights: CAPABILITY_WEIGHTS_V2
};

// ========================= 格局检测器 =========================

export class PatternDetector {
  
  /**
   * 检测八字格局
   */
  static detectPattern(strengths: TenGodStrength): PatternDetectionResult {
    // 找到最强的十神
    const sortedStrengths = Object.entries(strengths)
      .sort(([_, a], [__, b]) => b - a);
    
    const [dominantTenGod, maxStrength] = sortedStrengths[0] as [TenGod, number];
    const secondStrength = sortedStrengths[1]?.[1] || 0;
    
    // 计算主导程度
    const strengthRatio = maxStrength / (secondStrength + 0.001);
    
    // 计算聚合指标
    const 印星强度 = (strengths['正印'] || 0) + (strengths['偏印'] || 0);
    const 官杀强度 = (strengths['正官'] || 0) + (strengths['七杀'] || 0);
    const 财星强度 = (strengths['正财'] || 0) + (strengths['偏财'] || 0);
    const 比劫强度 = (strengths['比肩'] || 0) + (strengths['劫财'] || 0);
    const 食伤强度 = (strengths['食神'] || 0) + (strengths['伤官'] || 0);
    
    // 判定格局类型
    let patternType = '普通格局';
    let confidence = 0.5;
    let description = '';
    
    if (maxStrength > 0.3) {
      if (印星强度 > 0.3) {
        patternType = '印旺格';
        confidence = Math.min(0.9, 印星强度 * 2);
        description = '印星旺盛，利于学习和稳定发展';
      } else if (官杀强度 > 0.25) {
        patternType = strengths['正官'] > strengths['七杀'] ? '正官格' : '七杀格';
        confidence = Math.min(0.9, 官杀强度 * 2.5);
        description = patternType === '正官格' ? '正官得用，利于仕途和管理' : '七杀有制，利于开拓和执行';
      } else if (财星强度 > 0.25) {
        patternType = '财旺格';
        confidence = Math.min(0.9, 财星强度 * 2.5);
        description = '财星旺盛，利于经商和理财';
      } else if (比劫强度 > 0.3) {
        patternType = '比劫格';
        confidence = Math.min(0.9, 比劫强度 * 2);
        description = '比劫旺盛，利于合作和团队发展';
      } else if (食伤强度 > 0.25) {
        patternType = '食伤格';
        confidence = Math.min(0.9, 食伤强度 * 2.5);
        description = '食伤旺盛，利于创新和表达';
      }
    }
    
    // 特殊格局检测
    if (strengthRatio > 3.0 && maxStrength > 0.5) {
      patternType = '从格';
      confidence = Math.min(0.95, strengthRatio * 0.2);
      description = '从格成立，专一发展某方面能力';
    }
    
    return {
      pattern_type: patternType,
      dominant_ten_god: dominantTenGod,
      strength_ratio: strengthRatio,
      confidence,
      description
    };
  }
  
  /**
   * 获取格局对应的能力加成配置
   */
  static getPatternBonuses(): { [pattern: string]: { [capability in CapabilityName]?: number } } {
    return {
      '印旺格': {
        '稳定性基础分': 25,
        '协调力基础分': 20, 
        '管理力基础分': 15,
        '执行力基础分': 10
      },
      '正官格': {
        '执行力基础分': 25,
        '管理力基础分': 20,
        '稳定性基础分': 15
      },
      '七杀格': {
        '执行力基础分': 30,
        '创新力基础分': 15,
        '管理力基础分': 10
      },
      '财旺格': {
        '销售力基础分': 25,
        '创新力基础分': 20,
        '执行力基础分': 15
      },
      '食伤格': {
        '创新力基础分': 30,
        '销售力基础分': 20,
        '协调力基础分': 15
      },
      '比劫格': {
        '稳定性基础分': 20,
        '执行力基础分': 15,
        '协调力基础分': 10
      }
    };
  }
}

// ========================= 能力评分引擎 =========================

export class CapabilityScorer {
  private config: CapabilityConfig;
  
  constructor(config: CapabilityConfig = DEFAULT_CAPABILITY_CONFIG) {
    this.config = { ...config };
  }
  
  /**
   * 计算六能力评分的主入口方法
   */
  async calculateScores(
    strengths: TenGodStrength,
    _tags?: {
      hurt_absorb_rate: number;
      kill_mode: 'normal' | 'kill_dominant';
      cong_pattern: boolean | { type: string };
      phantom_ratio: number;
      dominance: number;
      seasonal_method: 'precise_matrix';
      warnings: string[];
    },
    _clusters?: ClusterScores
  ): Promise<CapabilityCalculationResult> {
    try {
      // 1. 验证输入数据
      const validation = this.validateInput(strengths);
      if (!validation.valid) {
        throw new ValidationError(
          `十神强度数据验证失败: ${validation.warnings.join(', ')}`
        );
      }
      
      // 2. 检测格局
      const pattern = PatternDetector.detectPattern(strengths);
      
      // 3. 计算各能力分数
      const scores: CapabilityScores = {} as CapabilityScores;
      const calculationDetails: CapabilityCalculationDetails[] = [];
      
      const capabilities: CapabilityName[] = [
        '执行力基础分', '创新力基础分', '管理力基础分',
        '销售力基础分', '协调力基础分', '稳定性基础分'
      ];
      
      for (const capabilityName of capabilities) {
        const result = await this.calculateSingleCapability(
          capabilityName, 
          strengths, 
          pattern
        );
        
        scores[capabilityName] = result.finalScore;
        calculationDetails.push(result.details);
      }
      
      // 4. 计算极化指标
      const polarization = this.calculatePolarization(scores);
      
      return {
        scores,
        details: {
          pattern,
          calculation_details: calculationDetails,
          polarization
        }
      };
      
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      
      const originalError = error instanceof Error ? error : new Error(String(error));
      throw new ValidationError(
        `能力评分计算失败: ${originalError.message}`
      );
    }
  }
  
  /**
   * 计算单个能力分数
   */
  private async calculateSingleCapability(
    capabilityName: CapabilityName,
    strengths: TenGodStrength,
    pattern: PatternDetectionResult
  ): Promise<{
    finalScore: number;
    details: CapabilityCalculationDetails;
  }> {
    const weights = this.config.capability_weights[capabilityName];
    
    const details: CapabilityCalculationDetails = {
      capability: capabilityName,
      base_contributions: [],
      base_score: 0,
      dominance_bonus: 0,
      pattern_bonus: 0,
      final_score: 0
    };
    
    // Step 1: 基础分计算
    let baseScore = 0;
    const contributions = [];
    
    for (const [tenGod, weight] of Object.entries(weights)) {
      const rawStrength = strengths[tenGod as TenGod] || 0;
      
      if (rawStrength > 0) {
        // 平滑处理（可选）
        const effectiveStrength = this.config.smooth_factor ? 
          Math.sqrt(rawStrength) : rawStrength;
        
        const contribution = effectiveStrength * weight * 100;
        baseScore += contribution;
        
        contributions.push({
          ten_god: tenGod as TenGod,
          raw_strength: rawStrength,
          effective_strength: effectiveStrength,
          weight,
          contribution
        });
      }
    }
    
    details.base_contributions = contributions
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3); // 保留前3个主要贡献
    details.base_score = baseScore;
    
    // Step 2: 主导性加成
    let dominanceBonus = 0;
    for (const [tenGod, strength] of Object.entries(strengths)) {
      if (strength > this.config.dominance_threshold && weights[tenGod as TenGod]) {
        const bonus = strength * weights[tenGod as TenGod] * this.config.dominance_bonus_factor;
        dominanceBonus += bonus;
      }
    }
    details.dominance_bonus = dominanceBonus;
    
    // Step 3: 格局特殊加成
    const patternBonus = this.calculatePatternBonus(capabilityName, pattern);
    details.pattern_bonus = patternBonus;
    
    // Step 4: 最终计算
    let finalScore = baseScore + dominanceBonus + patternBonus;
    finalScore *= this.config.amplification_factor;
    
    // 限制在合理范围内
    finalScore = Math.min(this.config.max_score, Math.max(this.config.min_score, finalScore));
    
    details.final_score = finalScore;
    
    return {
      finalScore: Math.round(finalScore * 10) / 10, // 保留1位小数
      details
    };
  }
  
  /**
   * 计算格局加成
   */
  private calculatePatternBonus(capabilityName: CapabilityName, pattern: PatternDetectionResult): number {
    const patternBonuses = PatternDetector.getPatternBonuses();
    const bonus = patternBonuses[pattern.pattern_type]?.[capabilityName] || 0;
    
    // 根据格局置信度调整加成
    return bonus * pattern.confidence;
  }
  
  /**
   * 计算极化指标
   */
  private calculatePolarization(scores: CapabilityScores): { disparity: number; balance: number } {
    const scoreValues = Object.values(scores);
    // const sortedValues = scoreValues.slice().sort((a, b) => a - b);
    // const medianValue = sortedValues[Math.floor(sortedValues.length / 2)]; // 暂未使用
    const maxValue = Math.max(...scoreValues);
    const minValue = Math.min(...scoreValues);
    
    const disparity = maxValue - minValue;
    const balance = 1 - Math.max(0, Math.min(1, disparity / 100));
    
    return { disparity, balance };
  }
  
  /**
   * 验证输入数据
   */
  validateInput(strengths: TenGodStrength): { valid: boolean; warnings: string[] } {
    return TenGodStrengthValidator.validate(strengths);
  }
  
  /**
   * 验证输出评分
   */
  validateScores(scores: CapabilityScores): { valid: boolean; warnings: string[] } {
    return CapabilityScoresValidator.validate(scores);
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<CapabilityConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * 获取当前配置
   */
  getConfig(): CapabilityConfig {
    return { ...this.config };
  }
}

// ========================= 导出模块 =========================

// 类已通过 export class 导出，只需导出常量
export { CAPABILITY_WEIGHTS_V2 };