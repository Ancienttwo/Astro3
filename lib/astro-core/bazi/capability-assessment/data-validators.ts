/**
 * @astroall/bazi-core Capability Assessment Data Validators
 * 
 * 数据验证和转换工具，确保BossAI算法与Core系统的兼容性
 * 
 * @ai-context CAPABILITY_ASSESSMENT_VALIDATORS
 * @purpose 提供数据验证、转换和标准化功能
 * @version 1.0.0
 * @created 2025-09-06
 */

import { 
  BaziInput, 
  TenGodStrength, 
  CapabilityScores, 
  AlgorithmOutput,
  ValidationError,
  PatternDetectionResult 
} from './types';
import type { StemName, BranchName, ElementName } from '../types';

// GenderType 定义
export type GenderType = 'male' | 'female';

// ========================= 接口定义 =========================

/**
 * Core的BaZiChart接口定义
 */
export interface CoreBaZiChart {
  fourPillars?: {
    year?: { stem?: StemName; branch?: BranchName };
    month?: { stem?: StemName; branch?: BranchName };
    day?: { stem?: StemName; branch?: BranchName };
    hour?: { stem?: StemName; branch?: BranchName };
  };
  gender?: GenderType;
  birthDateTime?: {
    year?: number;
    month?: number;
    day?: number;
    hour?: number;
    minute?: number;
  };
}

// ========================= 数据转换和标准化 =========================

/**
 * 标准化的八字输入数据
 */
export interface NormalizedBaziInput extends BaziInput {
  // 添加计算所需的额外字段
  dayMaster: StemName;
  monthBranch: BranchName;
  isValid: boolean;
  validationMessages: string[];
}

/**
 * 八字数据验证器
 */
export class BaziValidator {
  
  /**
   * 验证天干名称
   */
  static isValidStem(stem: string): stem is StemName {
    const validStems: StemName[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    return validStems.includes(stem as StemName);
  }
  
  /**
   * 验证地支名称
   */
  static isValidBranch(branch: string): branch is BranchName {
    const validBranches: BranchName[] = [
      '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
    ];
    return validBranches.includes(branch as BranchName);
  }
  
  /**
   * 验证性别
   */
  static isValidGender(gender: string): gender is GenderType {
    return gender === 'male' || gender === 'female';
  }
  
  /**
   * 验证日期范围（包含闰年检查）
   */
  static isValidDate(year: number, month: number, day: number): boolean {
    // 基础范围检查
    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    
    // 闰年检查
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const daysInMonth = [31, isLeapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    if (day > daysInMonth[month - 1]) return false;
    
    return true;
  }
  
  /**
   * 验证时间范围
   */
  static isValidTime(hour: number, minute: number): boolean {
    return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
  }
  
  /**
   * 完整的八字输入验证
   */
  static validateInput(input: BaziInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    try {
      // 验证四柱天干地支
      const positions = ['year', 'month', 'day', 'hour'] as const;
      
      for (const position of positions) {
        const pillar = input.pillars[position];
        
        if (!pillar) {
          errors.push(`${position}柱数据缺失`);
          continue;
        }
        
        if (!this.isValidStem(pillar.stem)) {
          errors.push(`${position}柱天干无效: ${pillar.stem}`);
        }
        
        if (!this.isValidBranch(pillar.branch)) {
          errors.push(`${position}柱地支无效: ${pillar.branch}`);
        }
      }
      
      // 验证性别
      if (!this.isValidGender(input.gender)) {
        errors.push(`性别参数无效: ${input.gender}`);
      }
      
      // 验证公历日期
      if (!input.solarDate) {
        errors.push('公历日期数据缺失');
      } else {
        const { year, month, day, hour, minute } = input.solarDate;
        
        if (!this.isValidDate(year, month, day)) {
          errors.push(`公历日期无效: ${year}-${month}-${day}`);
        }
        
        if (!this.isValidTime(hour, minute)) {
          errors.push(`公历时间无效: ${hour}:${minute}`);
        }
      }
      
      // 验证农历日期（可选）
      if (input.lunarDate) {
        const { year, month, day, hour } = input.lunarDate;
        
        if (!this.isValidDate(year, month, day)) {
          errors.push(`农历日期无效: ${year}-${month}-${day}`);
        }
        
        if (hour < 0 || hour > 23) {
          errors.push(`农历时辰无效: ${hour}`);
        }
      }
      
    } catch (error) {
      errors.push(`验证过程中发生错误: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 标准化八字输入数据
   */
  static normalize(input: BaziInput): NormalizedBaziInput {
    const validation = this.validateInput(input);
    
    return {
      ...input,
      dayMaster: input.pillars.day.stem,
      monthBranch: input.pillars.month.branch,
      isValid: validation.valid,
      validationMessages: validation.errors
    };
  }
  
  /**
   * 从Core的BaZiChart转换为BaziInput
   */
  static fromBaZiChart(chart: CoreBaZiChart): BaziInput {
    // 这里需要根据实际的BaZiChart结构进行适配
    if (!chart || !chart.fourPillars) {
      throw new ValidationError('BaZiChart数据结构无效');
    }
    
    const pillars = chart.fourPillars;
    
    return {
      pillars: {
        year: {
          stem: pillars.year?.stem || '甲',
          branch: pillars.year?.branch || '子'
        },
        month: {
          stem: pillars.month?.stem || '甲',
          branch: pillars.month?.branch || '子'
        },
        day: {
          stem: pillars.day?.stem || '甲',
          branch: pillars.day?.branch || '子'
        },
        hour: {
          stem: pillars.hour?.stem || '甲',
          branch: pillars.hour?.branch || '子'
        }
      },
      gender: chart.gender || 'male',
      solarDate: chart.birthDateTime ? {
        year: chart.birthDateTime.year || 2000,
        month: chart.birthDateTime.month || 1,
        day: chart.birthDateTime.day || 1,
        hour: chart.birthDateTime.hour || 0,
        minute: chart.birthDateTime.minute || 0
      } : {
        year: 2000,
        month: 1,
        day: 1,
        hour: 0,
        minute: 0
      }
    };
  }
}

// ========================= 十神强度验证器 =========================

/**
 * 十神强度验证器
 */
export class TenGodStrengthValidator {
  
  /**
   * 验证十神强度数据
   */
  static validate(strengths: TenGodStrength): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    try {
      // 验证所有十神是否存在
      const requiredTenGods = [
        '比肩', '劫财', '食神', '伤官', '正财', 
        '偏财', '正官', '七杀', '正印', '偏印'
      ] as const;
      
      for (const tenGod of requiredTenGods) {
        if (typeof strengths[tenGod] !== 'number') {
          errors.push(`十神强度缺失: ${tenGod}`);
        } else if (isNaN(strengths[tenGod])) {
          errors.push(`十神强度为NaN: ${tenGod}`);
        } else if (strengths[tenGod] < 0) {
          errors.push(`十神强度为负数: ${tenGod} = ${strengths[tenGod]}`);
        }
      }
      
      // 验证总和是否接近1.0
      const total = Object.values(strengths).reduce((sum, val) => sum + (val || 0), 0);
      const tolerance = 0.001;
      
      if (Math.abs(total - 1.0) > tolerance) {
        warnings.push(`十神强度总和不为1.0: ${total.toFixed(6)}`);
      }
      
      // 验证是否有异常高的值
      const maxValue = Math.max(...Object.values(strengths));
      const highValueTolerance = 1 + tolerance;
      if (maxValue > highValueTolerance) {
        errors.push(`存在超过1.0的十神强度: ${maxValue.toFixed(3)}`);
      } else if (maxValue > 0.85) {
        warnings.push(`存在较高的十神强度: ${maxValue.toFixed(3)}`);
      }
      
    } catch (error) {
      errors.push(`十神强度验证错误: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: errors.length === 0,
      warnings: [...errors, ...warnings]
    };
  }
  
  /**
   * 标准化十神强度（确保总和为1.0）
   */
  static normalize(strengths: TenGodStrength): TenGodStrength {
    const sanitized: TenGodStrength = {} as TenGodStrength;
    let positiveTotal = 0;

    (Object.keys(strengths) as Array<keyof TenGodStrength>).forEach(key => {
      const rawValue = Number(strengths[key]) || 0;
      const clipped = rawValue > 0 ? rawValue : 0;
      sanitized[key] = clipped;
      positiveTotal += clipped;
    });

    if (positiveTotal === 0) {
      // 如果所有值都是 0，设置平均分布，避免后续出现 NaN
      const equalValue = 1 / 10;
      return {
        '比肩': equalValue, '劫财': equalValue, '食神': equalValue, '伤官': equalValue,
        '正财': equalValue, '偏财': equalValue, '正官': equalValue, '七杀': equalValue,
        '正印': equalValue, '偏印': equalValue
      };
    }

    const normalized: TenGodStrength = {} as TenGodStrength;
    const divisor = positiveTotal;

    (Object.keys(sanitized) as Array<keyof TenGodStrength>).forEach(key => {
      const value = sanitized[key] / divisor;
      normalized[key] = Number.isFinite(value) ? value : 0;
    });

    return normalized;
  }
}

// ========================= 能力评分验证器 =========================

/**
 * 能力评分验证器
 */
export class CapabilityScoresValidator {
  
  /**
   * 验证能力评分数据
   */
  static validate(scores: CapabilityScores): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    try {
      const capabilities = [
        '执行力基础分', '创新力基础分', '管理力基础分',
        '销售力基础分', '协调力基础分', '稳定性基础分'
      ] as const;
      
      for (const capability of capabilities) {
        const score = scores[capability];
        
        if (typeof score !== 'number') {
          warnings.push(`能力评分缺失: ${capability}`);
        } else if (isNaN(score)) {
          warnings.push(`能力评分为NaN: ${capability}`);
        } else if (score < 0 || score > 100) {
          warnings.push(`能力评分超出范围 [0,100]: ${capability} = ${score}`);
        }
      }
      
    } catch (error) {
      warnings.push(`能力评分验证错误: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
  
  /**
   * 规范化能力评分（限制在0-100范围内）
   */
  static clamp(scores: CapabilityScores): CapabilityScores {
    const clamped: CapabilityScores = {} as CapabilityScores;
    
    (Object.keys(scores) as Array<keyof CapabilityScores>).forEach(key => {
      const score = Number(scores[key]) || 0;
      clamped[key] = Math.max(0, Math.min(100, score));
    });
    
    return clamped;
  }
}

// ========================= 算法输出验证器 =========================

/**
 * 算法输出验证器
 */
export class AlgorithmOutputValidator {
  
  /**
   * 验证完整的算法输出
   */
  static validate(output: AlgorithmOutput): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    try {
      // 验证十神强度
      const strengthValidation = TenGodStrengthValidator.validate(output.ten_god_strength);
      warnings.push(...strengthValidation.warnings);
      
      // 验证能力评分
      const capabilityValidation = CapabilityScoresValidator.validate(output.capabilities);
      warnings.push(...capabilityValidation.warnings);
      
      // 验证聚合指标总和
      const clustersSum = Object.values(output.clusters).reduce((sum, val) => sum + val, 0);
      if (Math.abs(clustersSum - 1.0) > 0.001) {
        warnings.push(`聚合指标总和不为1.0: ${clustersSum.toFixed(6)}`);
      }
      
      // 验证标签数据
      if (output.tags) {
        if (typeof output.tags.hurt_absorb_rate !== 'number' || 
            output.tags.hurt_absorb_rate < 0 || output.tags.hurt_absorb_rate > 1) {
          warnings.push(`伤官吸收率数值异常: ${output.tags.hurt_absorb_rate}`);
        }
        
        if (output.tags.kill_mode !== 'normal' && output.tags.kill_mode !== 'kill_dominant') {
          warnings.push(`杀化模式值异常: ${output.tags.kill_mode}`);
        }
      }
      
      // 验证中间结果
      if (output.intermediates) {
        const rootScoresSum = Object.values(output.intermediates.root_scores).reduce((sum, val) => sum + val, 0);
        if (rootScoresSum === 0) {
          warnings.push('根分值全部为零，可能存在计算错误');
        }
      }
      
    } catch (error) {
      warnings.push(`算法输出验证错误: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

// ========================= 格局检测验证器 =========================

/**
 * 格局检测验证器
 */
export class PatternValidator {
  
  /**
   * 验证格局检测结果
   */
  static validate(pattern: PatternDetectionResult): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    
    try {
      // 验证格局类型
      const validPatterns = [
        '普通格局', '印旺格', '正官格', '七杀格', 
        '财旺格', '食伤格', '比劫格', '从格'
      ];
      
      if (!validPatterns.includes(pattern.pattern_type)) {
        warnings.push(`未知的格局类型: ${pattern.pattern_type}`);
      }
      
      // 验证强度比例
      if (typeof pattern.strength_ratio !== 'number' || 
          isNaN(pattern.strength_ratio) || pattern.strength_ratio < 0) {
        warnings.push(`格局强度比例异常: ${pattern.strength_ratio}`);
      }
      
      // 验证置信度
      if (typeof pattern.confidence !== 'number' || 
          pattern.confidence < 0 || pattern.confidence > 1) {
        warnings.push(`格局置信度异常: ${pattern.confidence}`);
      }
      
    } catch (error) {
      warnings.push(`格局验证错误: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

// ========================= 导出所有验证器 =========================

// 类已通过 export class 导出，不需要重复导出
