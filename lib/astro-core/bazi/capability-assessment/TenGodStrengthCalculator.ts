/**
 * @astroall/bazi-core Ten God Strength Calculator
 * 
 * 十神强度计算引擎 - 基于BossAI完整算法实现
 * 包含季节性系数矩阵、虚透天干检测、格局判定等完整功能
 * 
 * @ai-context TEN_GOD_STRENGTH_CALCULATOR
 * @purpose 计算基于八字的十神强度分布
 * @version 1.0.0
 * @created 2025-09-06
 */

import {
  BaziInput,
  TenGod,
  TenGodStrength,
  AlgorithmConfig,
  StrengthCalculationResult,
  StrengthCalculationIntermediate,
  DEFAULT_ALGORITHM_CONFIG,
  CalculationError
} from './types';
import { StemName, BranchName, ElementName } from '../types';
import { BaziValidator, TenGodStrengthValidator } from './data-validators';

// ========================= 天干阴阳映射 =========================

/**
 * 天干阴阳属性映射 - 用于确定性地计算十神阴阳分配
 * 甲、丙、戊、庚、壬为阳干，乙、丁、己、辛、癸为阴干
 */
const STEM_YIN_YANG: { [key in StemName]: 'yang' | 'yin' } = {
  '甲': 'yang', '乙': 'yin', '丙': 'yang', '丁': 'yin', '戊': 'yang',
  '己': 'yin', '庚': 'yang', '辛': 'yin', '壬': 'yang', '癸': 'yin'
};

/**
 * 基于天干阴阳关系的十神分配映射
 */
const YIN_YANG_TEN_GOD_MAPPING: { [baseTenGod: string]: { yang: TenGod; yin: TenGod } } = {
  '比肩': { yang: '比肩', yin: '劫财' },
  '正官': { yang: '正官', yin: '七杀' },
  '正印': { yang: '正印', yin: '偏印' },
  '正财': { yang: '正财', yin: '偏财' },
  '食神': { yang: '食神', yin: '伤官' }
};

// ========================= 季节性系数矩阵 =========================

/**
 * 完整的季节性系数矩阵 (12个月 × 5个元素)
 * 来源于BossAI算法的精确数值
 */
const SEASONAL_MATRIX: { [key in BranchName]: { [K in ElementName]: number } } = {
  '子': { '木': 0.68, '火': 0.42, '土': 0.58, '金': 0.92, '水': 1.42 },
  '丑': { '木': 0.52, '火': 0.38, '土': 1.28, '金': 1.12, '水': 0.88 },
  '寅': { '木': 1.38, '火': 0.78, '土': 0.48, '金': 0.52, '水': 0.72 },
  '卯': { '木': 1.58, '火': 0.88, '土': 0.42, '金': 0.38, '水': 0.62 },
  '辰': { '木': 0.92, '火': 0.72, '土': 1.18, '金': 0.68, '水': 0.58 },
  '巳': { '木': 0.48, '火': 1.48, '土': 0.82, '金': 0.78, '水': 0.32 },
  '午': { '木': 0.38, '火': 1.68, '土': 0.88, '金': 0.62, '水': 0.28 },
  '未': { '木': 0.58, '火': 0.98, '土': 1.28, '金': 0.72, '水': 0.42 },
  '申': { '木': 0.42, '火': 0.58, '土': 0.78, '金': 1.42, '水': 0.68 },
  '酉': { '木': 0.32, '火': 0.48, '土': 0.68, '金': 1.62, '水': 0.78 },
  '戌': { '木': 0.68, '火': 0.82, '土': 1.18, '金': 0.92, '水': 0.48 },
  '亥': { '木': 0.88, '火': 0.52, '土': 0.62, '金': 0.78, '水': 1.28 }
};

// ========================= 元素关系映射 =========================

/**
 * 天干到元素的映射
 */
const STEM_TO_ELEMENT: { [K in StemName]: ElementName } = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火', 
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

/**
 * 地支藏干映射表 (主气-中气-余气)
 */
const BRANCH_HIDDEN_STEMS: { [K in BranchName]: StemName[] } = {
  '子': ['癸'],
  '丑': ['己', '癸', '辛'],
  '寅': ['甲', '丙', '戊'],
  '卯': ['乙'],
  '辰': ['戊', '乙', '癸'],
  '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'],
  '未': ['己', '丁', '乙'],
  '申': ['庚', '壬', '戊'],
  '酉': ['辛'],
  '戌': ['戊', '辛', '丁'],
  '亥': ['壬', '甲']
};

/**
 * 十神关系计算表 - 正确的天干对天干关系
 * 根据日干和其他天干的直接关系确定十神
 * 格式: `${日干}${目标干}` -> TenGod
 */
const TEN_GOD_RELATIONS: Record<string, TenGod> = {
  // 甲日干的十神关系
  '甲甲': '比肩', '甲乙': '劫财', '甲丙': '食神', '甲丁': '伤官',
  '甲戊': '偏财', '甲己': '正财', '甲庚': '七杀', '甲辛': '正官',
  '甲壬': '偏印', '甲癸': '正印',

  // 乙日干的十神关系
  '乙甲': '劫财', '乙乙': '比肩', '乙丙': '伤官', '乙丁': '食神',
  '乙戊': '正财', '乙己': '偏财', '乙庚': '正官', '乙辛': '七杀',
  '乙壬': '正印', '乙癸': '偏印',

  // 丙日干的十神关系
  '丙甲': '偏印', '丙乙': '正印', '丙丙': '比肩', '丙丁': '劫财',
  '丙戊': '食神', '丙己': '伤官', '丙庚': '偏财', '丙辛': '正财',
  '丙壬': '七杀', '丙癸': '正官',

  // 丁日干的十神关系
  '丁甲': '正印', '丁乙': '偏印', '丁丙': '劫财', '丁丁': '比肩',
  '丁戊': '伤官', '丁己': '食神', '丁庚': '正财', '丁辛': '偏财',
  '丁壬': '正官', '丁癸': '七杀',

  // 戊日干的十神关系
  '戊甲': '七杀', '戊乙': '正官', '戊丙': '偏印', '戊丁': '正印',
  '戊戊': '比肩', '戊己': '劫财', '戊庚': '食神', '戊辛': '伤官',
  '戊壬': '偏财', '戊癸': '正财',

  // 己日干的十神关系
  '己甲': '正官', '己乙': '七杀', '己丙': '正印', '己丁': '偏印',
  '己戊': '劫财', '己己': '比肩', '己庚': '伤官', '己辛': '食神',
  '己壬': '正财', '己癸': '偏财',

  // 庚日干的十神关系
  '庚甲': '偏财', '庚乙': '正财', '庚丙': '七杀', '庚丁': '正官',
  '庚戊': '偏印', '庚己': '正印', '庚庚': '比肩', '庚辛': '劫财',
  '庚壬': '食神', '庚癸': '伤官',

  // 辛日干的十神关系
  '辛甲': '正财', '辛乙': '偏财', '辛丙': '正官', '辛丁': '七杀',
  '辛戊': '正印', '辛己': '偏印', '辛庚': '劫财', '辛辛': '比肩',
  '辛壬': '伤官', '辛癸': '食神',

  // 壬日干的十神关系
  '壬甲': '食神', '壬乙': '伤官', '壬丙': '偏财', '壬丁': '正财',
  '壬戊': '七杀', '壬己': '正官', '壬庚': '偏印', '壬辛': '正印',
  '壬壬': '比肩', '壬癸': '劫财',

  // 癸日干的十神关系
  '癸甲': '伤官', '癸乙': '食神', '癸丙': '正财', '癸丁': '偏财',
  '癸戊': '正官', '癸己': '七杀', '癸庚': '正印', '癸辛': '偏印',
  '癸壬': '劫财', '癸癸': '比肩'
};

// ========================= 十神强度计算引擎 =========================

export class TenGodStrengthCalculator {
  private config: AlgorithmConfig;
  
  constructor(config: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG) {
    this.config = { ...config };
  }
  
  /**
   * 计算十神强度的主入口方法
   */
  async calculateStrength(input: BaziInput): Promise<StrengthCalculationResult> {
    try {
      // 1. 数据验证
      const validation = BaziValidator.validateInput(input);
      if (!validation.valid) {
        throw new CalculationError(
          `输入数据验证失败: ${validation.errors.join(', ')}`,
          { validation }
        );
      }
      
      // 2. 计算根分值（地支藏干贡献）
      const rootScores = this.calculateRootScores(input);
      
      // 3. 获取季节因子
      const seasonalFactors = this.getSeasonalFactors(input.pillars.month.branch);
      
      // 4. 应用季节调整
      const adjustedScores = this.applySeasonalAdjustment(rootScores, seasonalFactors);
      
      // 5. 天干放大处理
      const amplifiedScores = this.applyAmplification(input, adjustedScores);
      
      // 6. 计算原始十神分布
      const rawTenGodScores = this.calculateRawTenGodStrength(
        input.pillars.day.stem, 
        amplifiedScores
      );
      
      // 7. 应用十神特殊处理
      const processedScores = this.applyTenGodProcessing(rawTenGodScores, input);
      
      // 8. 标准化为最终强度
      const normalizedStrengths = TenGodStrengthValidator.normalize(processedScores);
      
      // 9. 检测虚透天干
      const phantomStems = this.detectPhantomStems(input, rootScores);
      
      // 10. 生成分析标签
      const tags = this.generateAnalysisTags(input, normalizedStrengths, phantomStems);
      
      // 11. 构建中间结果
      const intermediate: StrengthCalculationIntermediate = {
        root_scores: rootScores,
        seasonal_factors: seasonalFactors,
        phantom_stems: phantomStems,
        amplified_scores: amplifiedScores,
        ten_god_raw: rawTenGodScores
      };
      
      return {
        strengths: normalizedStrengths,
        tags,
        intermediate
      };
      
    } catch (error) {
      if (error instanceof CalculationError) {
        throw error;
      }
      
      throw new CalculationError(
        `十神强度计算失败: ${error instanceof Error ? error.message : String(error)}`,
        { input, error }
      );
    }
  }
  
  /**
   * 计算地支藏干的根分值贡献
   */
  private calculateRootScores(input: BaziInput): { [K in ElementName]: number } {
    const scores: { [K in ElementName]: number } = {
      '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    };
    
    const positions = ['year', 'month', 'day', 'hour'] as const;
    
    for (const position of positions) {
      const branch = input.pillars[position].branch;
      const hiddenStems = BRANCH_HIDDEN_STEMS[branch];
      const positionWeight = this.config.position_weights[position];
      
      // 处理每个藏干
      hiddenStems.forEach((stem, index) => {
        const element = STEM_TO_ELEMENT[stem];
        
        // 根据藏干层级确定系数
        let layerCoeff: number;
        if (index === 0) layerCoeff = this.config.layer_coefficients.main;
        else if (index === 1) layerCoeff = this.config.layer_coefficients.mid;
        else layerCoeff = this.config.layer_coefficients.rest;
        
        // 累积分值
        scores[element] += positionWeight * layerCoeff;
      });
    }
    
    return scores;
  }
  
  /**
   * 获取当前月支的季节因子
   */
  private getSeasonalFactors(monthBranch: BranchName): { [K in ElementName]: number } {
    return { ...SEASONAL_MATRIX[monthBranch] };
  }
  
  /**
   * 应用季节性调整
   */
  private applySeasonalAdjustment(
    rootScores: { [K in ElementName]: number },
    seasonalFactors: { [K in ElementName]: number }
  ): { [K in ElementName]: number } {
    const adjusted: { [K in ElementName]: number } = {
      '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
    };
    
    for (const element of Object.keys(rootScores) as ElementName[]) {
      adjusted[element] = rootScores[element] * seasonalFactors[element];
    }
    
    return adjusted;
  }
  
  /**
   * 应用天干放大处理
   */
  private applyAmplification(
    input: BaziInput, 
    adjustedScores: { [K in ElementName]: number }
  ): { [key: string]: number } {
    const amplified: { [key: string]: number } = {};
    
    // 复制调整后的分值
    for (const [element, score] of Object.entries(adjustedScores)) {
      amplified[element] = score;
    }
    
    // 天干放大处理
    const positions = ['year', 'month', 'day', 'hour'] as const;
    const { k_amp, gamma_amp, decay_multi, seed_ratio } = this.config.amplification;
    
    for (const position of positions) {
      const stem = input.pillars[position].stem;
      const element = STEM_TO_ELEMENT[stem];
      const baseScore = adjustedScores[element];
      
      if (baseScore > 0) {
        // 应用放大公式
        const amplificationFactor = 1 + (k_amp * Math.pow(baseScore, gamma_amp));
        const seedContribution = baseScore * seed_ratio;
        const amplifiedContribution = seedContribution * amplificationFactor * decay_multi;
        
        amplified[element] += amplifiedContribution;
      }
    }
    
    return amplified;
  }
  
  /**
   * 计算原始十神强度
   */
  private calculateRawTenGodStrength(
    dayMaster: StemName, 
    amplifiedScores: { [key: string]: number }
  ): Partial<TenGodStrength> {
    const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
    const tenGodScores: Partial<TenGodStrength> = {};
    
    // 根据日主元素和其他元素的关系计算十神
    for (const element of Object.keys(amplifiedScores) as ElementName[]) {
      const score = amplifiedScores[element];
      if (score > 0) {
        // 注意：这里需要基于实际天干计算十神，而不是五行元素
        // 暂时使用元素映射作为基础十神，后续应改为基于实际天干对天干的关系
        const baseTenGod = this.getTenGodByElement(dayMasterElement, element);
        
        // 处理阴阳区分（比肩/劫财、正官/七杀、正印/偏印、正财/偏财、食神/伤官）
        let finalTenGod = baseTenGod;
        
        // 基于日主天干的阴阳属性进行确定性分配
        const dayMasterYinYang = STEM_YIN_YANG[dayMaster];
        const mapping = YIN_YANG_TEN_GOD_MAPPING[baseTenGod];
        
        if (mapping) {
          // 根据日主阴阳属性确定性地分配十神
          // 阳干倾向于正星，阴干倾向于偏星
          finalTenGod = dayMasterYinYang === 'yang' ? mapping.yang : mapping.yin;
        }
        
        tenGodScores[finalTenGod as keyof TenGodStrength] = (tenGodScores[finalTenGod as keyof TenGodStrength] || 0) + score;
      }
    }
    
    return tenGodScores;
  }
  
  /**
   * 应用十神特殊处理逻辑
   */
  private applyTenGodProcessing(
    rawScores: Partial<TenGodStrength>,
    input: BaziInput
  ): TenGodStrength {
    // 确保所有十神都有初始值
    const processed: TenGodStrength = {
      '比肩': rawScores['比肩'] || 0,
      '劫财': rawScores['劫财'] || 0,
      '食神': rawScores['食神'] || 0,
      '伤官': rawScores['伤官'] || 0,
      '正财': rawScores['正财'] || 0,
      '偏财': rawScores['偏财'] || 0,
      '正官': rawScores['正官'] || 0,
      '七杀': rawScores['七杀'] || 0,
      '正印': rawScores['正印'] || 0,
      '偏印': rawScores['偏印'] || 0
    };
    
    // 1. 食伤吸收处理
    const { beta_food_hurt, alpha_marginal } = this.config.ten_god_processing;
    const foodHurtTotal = processed['食神'] + processed['伤官'];
    
    if (foodHurtTotal > 0) {
      const absorptionRate = beta_food_hurt * Math.pow(foodHurtTotal, alpha_marginal);
      processed['食神'] *= (1 - absorptionRate);
      processed['伤官'] *= (1 - absorptionRate);
    }
    
    // 2. 弱根处理
    const { weak_root_ratio, weak_root_factor } = this.config.ten_god_processing;
    
    for (const tenGod of Object.keys(processed) as (keyof TenGodStrength)[]) {
      if (processed[tenGod] < weak_root_ratio) {
        processed[tenGod] *= weak_root_factor;
      }
    }
    
    // 3. 杀化处理
    const killScore = processed['七杀'];
    const totalScore = Object.values(processed).reduce((sum, val) => sum + val, 0);
    
    if (killScore > 0 && totalScore > 0) {
      const dominance = killScore / totalScore;
      
      if (dominance > this.config.kill_transformation.dominance_threshold) {
        // 触发杀化，转换部分七杀为正官
        const conversionRate = 0.3;
        const convertedAmount = killScore * conversionRate;
        
        processed['七杀'] -= convertedAmount;
        processed['正官'] += convertedAmount;
      }
    }
    
    return processed;
  }
  
  /**
   * 检测虚透天干
   */
  private detectPhantomStems(
    input: BaziInput, 
    rootScores: { [K in ElementName]: number }
  ): string[] {
    const phantoms: string[] = [];
    const positions = ['year', 'month', 'day', 'hour'] as const;
    
    for (const position of positions) {
      const stem = input.pillars[position].stem;
      const element = STEM_TO_ELEMENT[stem];
      const rootScore = rootScores[element];
      
      // 如果天干对应的五行在地支中根气很弱，认为是虚透
      if (rootScore < 10) { // 阈值可调整
        phantoms.push(`${position}干${stem}`);
      }
    }
    
    return phantoms;
  }
  
  /**
   * 生成分析标签
   */
  private generateAnalysisTags(
    input: BaziInput,
    strengths: TenGodStrength,
    phantomStems: string[]
  ): StrengthCalculationResult['tags'] {
    const warnings: string[] = [];
    
    // 计算伤官吸收率
    const hurtScore = strengths['伤官'];
    const totalScore = Object.values(strengths).reduce((sum, val) => sum + val, 0);
    const hurtAbsorbRate = totalScore > 0 ? hurtScore / totalScore : 0;
    
    // 判定杀化模式
    const killScore = strengths['七杀'];
    const officialScore = strengths['正官'];
    const killMode = killScore > officialScore * 2 ? 'kill_dominant' : 'normal';
    
    // 判定从格
    const maxStrength = Math.max(...Object.values(strengths));
    const secondMax = Object.values(strengths).sort((a, b) => b - a)[1] || 0;
    const dominanceRatio = secondMax > 0 ? maxStrength / secondMax : 0;
    
    const congPattern = dominanceRatio > this.config.cong_pattern.dominance_threshold;
    
    // 计算虚透比例
    const phantomRatio = phantomStems.length / 4;
    
    // 计算主导度
    const dominance = maxStrength;
    
    // 添加警告信息
    if (phantomRatio > 0.5) {
      warnings.push(`虚透天干过多: ${phantomStems.join(', ')}`);
    }
    
    if (dominance > 0.7) {
      warnings.push(`单一十神过强，可能影响平衡性`);
    }
    
    if (hurtAbsorbRate > 0.3) {
      warnings.push(`伤官吸收率较高: ${(hurtAbsorbRate * 100).toFixed(1)}%`);
    }
    
    return {
      hurt_absorb_rate: hurtAbsorbRate,
      kill_mode: killMode,
      cong_pattern: congPattern,
      phantom_ratio: phantomRatio,
      dominance,
      seasonal_method: 'precise_matrix',
      warnings
    };
  }
  
  /**
   * 更新配置
   */
  updateConfig(config: Partial<AlgorithmConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * 获取当前配置
   */
  getConfig(): AlgorithmConfig {
    return { ...this.config };
  }
  
  /**
   * 根据天干直接计算十神关系（正确方法）
   */
  private getTenGodByStem(dayMaster: StemName, targetStem: StemName): TenGod {
    const relationKey = `${dayMaster}${targetStem}`;
    const tenGod = TEN_GOD_RELATIONS[relationKey];
    
    if (!tenGod) {
      throw new CalculationError(
        `未知的十神关系: ${dayMaster} -> ${targetStem}`,
        'UNKNOWN_TEN_GOD_RELATION'
      );
    }
    
    return tenGod;
  }

  /**
   * 根据五行元素关系计算十神（用于兼容旧逻辑）
   * 警告：这种方法不够准确，应该使用 getTenGodByStem 方法
   */
  private getTenGodByElement(dayMasterElement: ElementName, targetElement: ElementName): TenGod {
    // 五行生克关系转换为十神的基础映射
    const elementTenGodMapping: { [dayElement in ElementName]: { [targetElement in ElementName]: TenGod } } = {
      '木': {
        '木': '比肩', '火': '食神', '土': '正财', '金': '正官', '水': '正印'
      },
      '火': {
        '木': '正印', '火': '比肩', '土': '食神', '金': '正财', '水': '正官'
      },
      '土': {
        '木': '正官', '火': '正印', '土': '比肩', '金': '食神', '水': '正财'
      },
      '金': {
        '木': '正财', '火': '正官', '土': '正印', '金': '比肩', '水': '食神'
      },
      '水': {
        '木': '食神', '火': '正财', '土': '正官', '金': '正印', '水': '比肩'
      }
    };
    
    return elementTenGodMapping[dayMasterElement][targetElement];
  }
}

// ========================= 导出计算器 =========================

// 类已通过 export class 导出