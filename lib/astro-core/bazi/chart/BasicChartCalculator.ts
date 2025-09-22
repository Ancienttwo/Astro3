/**
 * 基础排盘计算器
 * 整合四柱、十神、大运、纳音等模块的主计算器
 */

import { 
  BasicChartResult,
  CapabilityAssessmentSnapshot,
  CapabilityRecommendation,
  CapabilitySummaryKey,
  ChartCalculationInput,
  ChartCalculationOptions,
  ChartCalculationError,
  PerformanceMetrics,
  ValidationResult,
  NaYinInfo
} from './types';
import { FourPillarsCalculator } from './FourPillarsCalculator';
import { TenGodCalculator } from './TenGodCalculator';
import { MajorPeriodCalculator } from './MajorPeriodCalculator';
import { NaYinCalculator } from './NaYinCalculator';
import { DEFAULT_CHART_OPTIONS, CHART_ALGORITHM_VERSION } from './constants';
import { PatternEngine } from '../patterns';

// 🆕 能力评估系统集成（可选）
// 条件类型定义以避免循环依赖

// BaziEngine 接口定义
interface BaziEngine {
  evaluateComplete(baziInput: any): Promise<any>;
  calculateTenGodStrength?(baziInput: any): Promise<any>;
  calculateCapabilityScores?(strength: any, input: any): Promise<any>;
  getPerformanceSummary(): {
    totalCalculations: number;
    averageCalculationTime: number;
    cacheHitRate: number;
    memoryUsage: string;
    cacheStats?: {
      strength: unknown;
      capability: unknown;
      complete: unknown;
    };
  };
  clearCache(): void;
}

// 能力评估模块类型定义
type CapabilityModule = {
  BaziCapabilityEngine?: any;
  CapabilityAssessmentUtils?: {
    quickCapabilityScores(baziInput: any): Promise<any>;
    quickAssessment(baziInput: any): Promise<any>;
    quickTenGodStrength?(baziInput: any): Promise<any>;
  };
  CoreIntegrationAdapter?: {
    fromBaZiChart(chart: any): any;
  };
  createBaziEngine?: () => BaziEngine;
  TenGodStrength?: any;
  CapabilityScores?: any;
  AlgorithmOutput?: any;
  BaziInput?: any;
};

// 延迟加载能力评估模块
let capabilityModule: CapabilityModule | null = null;

type CapabilityKey = CapabilitySummaryKey;

const CAPABILITY_KEY_TO_CN: Record<CapabilityKey, string> = {
  execution: '执行力基础分',
  innovation: '创新力基础分',
  management: '管理力基础分',
  sales: '销售力基础分',
  coordination: '协调力基础分',
  stability: '稳定性基础分'
};

const CAPABILITY_LABEL_MAP: Record<CapabilityKey, string> = {
  execution: '执行力',
  innovation: '创新力',
  management: '管理力',
  sales: '销售力',
  coordination: '协调力',
  stability: '稳定性'
};

const CAPABILITY_KEYS = Object.keys(CAPABILITY_KEY_TO_CN) as CapabilityKey[];
const DEFAULT_RECOMMENDATION_CATEGORY = '综合建议';

interface CapabilityComputationResult {
  tenGodStrength?: Record<string, number>;
  capabilityScores: Record<CapabilityKey, number>;
  overallStrength: number;
  topCapabilities: CapabilityKey[];
  topCapabilityLabels: string[];
  topCapabilityDetails: Array<{
    key: CapabilityKey;
    label: string;
    score: number;
    rank: number;
  }>;
  algorithmOutput?: any;
  recommendations: CapabilityRecommendation[];
  patterns?: {
    patternType: string;
    confidence: number;
    description: string;
  };
  analysisDetails?: any;
  rawCapabilityScores?: Record<string, unknown>;
  analysisLevel: 'basic' | 'comprehensive';
}

type CapabilityAssessmentResultPayload = {
  tenGodStrength?: Record<string, number>;
  capabilityScores: Record<CapabilityKey, number>;
  overallStrength?: number;
  topCapabilities?: CapabilityKey[];
  topCapabilityLabels?: string[];
  topCapabilityDetails?: Array<{
    key: CapabilityKey;
    label: string;
    score: number;
    rank: number;
  }>;
  algorithmOutput?: any;
  recommendations?: CapabilityRecommendation[];
  patterns?: {
    patternType: string;
    confidence: number;
    description: string;
  };
  analysisLevel: 'basic' | 'comprehensive';
  analysisDetails?: any;
  rawCapabilityScores?: Record<string, unknown>;
};

// 在需要时动态加载模块的辅助函数
function loadCapabilityModule(): CapabilityModule | null {
  if (capabilityModule) return capabilityModule;
  
  try {
    // 使用动态导入（仅在运行时）
    const module = eval('require')('../capability-assessment');
    capabilityModule = module;
    return module;
  } catch (error) {
    // 如果模块不存在或有循环依赖，返回 null
    return null;
  }
}

export class BasicChartCalculator {
  private fourPillarsCalculator: FourPillarsCalculator;
  private tenGodCalculator: TenGodCalculator;
  private majorPeriodCalculator: MajorPeriodCalculator;
  private naYinCalculator: NaYinCalculator;
  
  // 🆕 能力评估引擎集成（可选）
  private capabilityEngine: BaziEngine | null = null;

  constructor() {
    this.fourPillarsCalculator = new FourPillarsCalculator();
    this.tenGodCalculator = new TenGodCalculator();
    this.majorPeriodCalculator = new MajorPeriodCalculator();
    this.naYinCalculator = new NaYinCalculator();
    
    // 初始化能力评估引擎（如果可用）
    const module = loadCapabilityModule();
    if (module && module.createBaziEngine) {
      try {
        this.capabilityEngine = module.createBaziEngine();
      } catch (error) {
        console.debug('Failed to initialize capability engine:', error);
      }
    }
  }

  /**
   * 计算完整的基础排盘
   */
  async calculateBasicChart(
    input: ChartCalculationInput,
    options: ChartCalculationOptions = {}
  ): Promise<BasicChartResult> {
    const startTime = performance.now();
    
    // 合并选项
    const finalOptions: Required<ChartCalculationOptions> = {
      ...DEFAULT_CHART_OPTIONS,
      ...options
    };

    // 验证输入
    if (finalOptions.validateInput) {
      const validation = this.validateInput(input);
      if (!validation.isValid) {
        throw new ChartCalculationError(
          `输入验证失败: ${validation.errors.join(', ')}`,
          'INVALID_INPUT',
          input
        );
      }
    }

    try {
      // 记录各阶段时间
      const metrics: PerformanceMetrics = {
        fourPillarsTime: 0,
        tenGodsTime: 0,
        majorPeriodsTime: 0,
        naYinTime: 0,
        totalTime: 0
      };

      // 1. 计算四柱
      const fourPillarsStart = performance.now();
      const fourPillars = await this.fourPillarsCalculator.calculateFourPillars(input);
      metrics.fourPillarsTime = performance.now() - fourPillarsStart;

      // 2. 计算十神（如果启用）
      let tenGodAnalysis;
      if (finalOptions.includeTenGods) {
        const tenGodsStart = performance.now();
        tenGodAnalysis = await this.tenGodCalculator.calculateTenGods(fourPillars);
        metrics.tenGodsTime = performance.now() - tenGodsStart;
      } else {
        tenGodAnalysis = {
          dayMaster: fourPillars.dayMaster,
          relationships: [],
          summary: {
            strongest: '比肩' as const,
            weakest: '比肩' as const,
            visible: [],
            hidden: [],
            count: {
              '比肩': 0, '劫财': 0, '食神': 0, '伤官': 0, '偏财': 0,
              '正财': 0, '七杀': 0, '正官': 0, '偏印': 0, '正印': 0
            },
            distribution: '十神计算未启用'
          },
          patterns: []
        };
      }

      // 3. 计算纳音（如果启用）
      let naYin: NaYinInfo | undefined;
      if (finalOptions.includeNaYin) {
        const naYinStart = performance.now();
        naYin = await this.naYinCalculator.calculateNaYin(fourPillars);
        metrics.naYinTime = performance.now() - naYinStart;
      } else {
        naYin = undefined;
      }

      // 4. 计算大运（如果启用）
      let majorPeriods;
      if (finalOptions.includeMajorPeriods) {
        const majorPeriodsStart = performance.now();
        majorPeriods = await this.majorPeriodCalculator.calculateMajorPeriods(
          fourPillars,
          input.gender,
          input.year,
          finalOptions.majorPeriodCount
        );
        metrics.majorPeriodsTime = performance.now() - majorPeriodsStart;
      }

      // 5. 🆕 能力评估计算（如果启用且模块可用）
      let capabilityAssessment: CapabilityAssessmentSnapshot | undefined;
      if (finalOptions.includeCapabilityAssessment && this.capabilityEngine && capabilityModule) {
        try {
          const capabilityStart = performance.now();
          
          // 将Chart结果转换为BaziInput格式
          const adapter = capabilityModule.CoreIntegrationAdapter?.fromBaZiChart;
          if (!adapter) {
            console.warn('能力评估适配器不可用，跳过此功能');
          } else {
            const baziInput = adapter({
              fourPillars,
              gender: input.gender,
              tenGodAnalysis,
              birthDateTime: {
                year: input.year,
                month: input.month,
                day: input.day,
                hour: input.hour,
                minute: input.minute ?? 0,
              },
            });

            const capabilityResult = await this.executeCapabilityAssessment(
              baziInput,
              finalOptions.capabilityAnalysisLevel
            );

            if (capabilityResult) {
              const { topCapabilities } = capabilityResult;
              const topCapabilityLabels = this.mapCapabilityLabels(topCapabilities);
              const topCapabilityDetails = topCapabilities.map((key, index) => ({
                key,
                label: CAPABILITY_LABEL_MAP[key],
                score: capabilityResult.capabilityScores[key],
                rank: index + 1
              }));

              capabilityAssessment = {
                tenGodStrength: capabilityResult.tenGodStrength,
                capabilityScores: capabilityResult.capabilityScores,
                overallStrength: capabilityResult.overallStrength,
                topCapabilities,
                topCapabilityLabels,
                topCapabilityDetails,
                algorithmOutput: capabilityResult.algorithmOutput,
                analysisLevel: capabilityResult.analysisLevel,
                recommendations: capabilityResult.recommendations,
                patterns: capabilityResult.patterns,
                analysisDetails: capabilityResult.analysisDetails,
                rawCapabilityScores: capabilityResult.rawCapabilityScores
              };
            }
          }
          
          const capabilityTime = performance.now() - capabilityStart;
          if (finalOptions.enablePerformanceLogging) {
            console.log(`能力评估计算耗时: ${capabilityTime.toFixed(2)}ms`);
          }
          
        } catch (error) {
          console.warn('能力评估计算失败，跳过此功能:', error instanceof Error ? error.message : error);
          capabilityAssessment = undefined;
        }
      } else if (finalOptions.includeCapabilityAssessment && !this.capabilityEngine) {
        console.debug('能力评估模块不可用，跳过此功能');
        capabilityAssessment = undefined;
      }

      // 6. 生成时间信息
      const timeInfo = this.generateTimeInfo(input);

      metrics.totalTime = performance.now() - startTime;

      // 7. 🆕 格局分析
      const patternAnalysis = PatternEngine.analyze(fourPillars, tenGodAnalysis);

      // 7. 构建结果
      const result: BasicChartResult = {
        input,
        fourPillars,
        naYin,
        tenGodAnalysis,
        majorPeriods,
        capabilityAssessment, // 🆕 能力评估结果
        patternAnalysis,
        solarDate: timeInfo.solar,
        lunarDate: timeInfo.lunar,
        calculationTime: metrics.totalTime,
        algorithm: CHART_ALGORITHM_VERSION,
        options: finalOptions
      };

      return result;

    } catch (error) {
      throw new ChartCalculationError(
        `基础排盘计算失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'BASIC_CHART_CALCULATION_ERROR',
        { input, options }
      );
    }
  }

  /**
   * 验证输入参数
   */
  private validateInput(input: ChartCalculationInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 年份验证
    if (!input.year || input.year < 1900 || input.year > 2100) {
      errors.push('年份必须在1900-2100之间');
    }

    // 月份验证
    if (!input.month || input.month < 1 || input.month > 12) {
      errors.push('月份必须在1-12之间');
    }

    // 日期验证
    if (!input.day || input.day < 1 || input.day > 31) {
      errors.push('日期必须在1-31之间');
    }

    // 小时验证
    if (input.hour < 0 || input.hour > 23) {
      errors.push('小时必须在0-23之间');
    }

    // 分钟验证
    if (input.minute !== undefined && (input.minute < 0 || input.minute > 59)) {
      errors.push('分钟必须在0-59之间');
    }

    // 秒钟验证
    if (input.second !== undefined && (input.second < 0 || input.second > 59)) {
      errors.push('秒钟必须在0-59之间');
    }

    // 性别验证
    if (!['male', 'female'].includes(input.gender)) {
      errors.push('性别必须是male或female');
    }

    // 日期合理性检查
    if (input.month === 2 && input.day > 29) {
      errors.push('2月份日期不能超过29日');
    }

    if ([4, 6, 9, 11].includes(input.month) && input.day > 30) {
      errors.push('4、6、9、11月份日期不能超过30日');
    }

    // 农历日期警告
    if (input.isLunar && (input.year < 1900 || input.year > 2050)) {
      warnings.push('农历年份建议在1900-2050之间，超出范围可能影响准确性');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 生成时间信息
   */
  private generateTimeInfo(input: ChartCalculationInput): {
    solar: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
    };
    lunar: {
      year: number;
      month: number;
      day: number;
      isLeapMonth: boolean;
      yearName: string;
      monthName: string;
      dayName: string;
    };
  } {
    // 这里应该使用真实的公历农历转换
    // 目前提供简化版本
    return {
      solar: {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        minute: input.minute || 0
      },
      lunar: {
        year: input.year,
        month: input.month,
        day: input.day,
        isLeapMonth: false,
        yearName: this.getChineseYear(input.year),
        monthName: this.getChineseMonth(input.month),
        dayName: this.getChineseDay(input.day)
      }
    };
  }

  /**
   * 获取中文年份
   */
  private getChineseYear(year: number): string {
    const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    const animal = animals[branchIndex];
    
    return `${stems[stemIndex]}${branches[branchIndex]}${animal}年`;
  }

  /**
   * 获取中文月份
   */
  private getChineseMonth(month: number): string {
    const months = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
    return `${months[month - 1]}月`;
  }

  /**
   * 获取中文日期
   */
  private getChineseDay(day: number): string {
    if (day <= 10) {
      const days = ['', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十'];
      return days[day];
    } else if (day <= 19) {
      return `十${['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][day - 10]}`;
    } else if (day <= 29) {
      return `二十${['', '一', '二', '三', '四', '五', '六', '七', '八', '九'][day - 20]}`;
    } else {
      return `三十${day === 30 ? '' : day === 31 ? '一' : ''}`;
    }
  }

  /**
   * 快速排盘（仅四柱）
   */
  async calculateFourPillarsOnly(input: ChartCalculationInput): Promise<{
    fourPillars: any;
    calculationTime: number;
  }> {
    const startTime = performance.now();
    
    const fourPillars = await this.fourPillarsCalculator.calculateFourPillars(input);
    const calculationTime = performance.now() - startTime;
    
    return {
      fourPillars,
      calculationTime
    };
  }

  /**
   * 获取排盘摘要
   */
  getChartSummary(result: BasicChartResult): {
    dayMaster: string;
    dayMasterElement: string;
    season: string;
    strongestTenGod: string;
    currentMajorPeriod?: string;
    description: string;
  } {
    const dayMaster = result.fourPillars.dayMaster;
    const dayMasterElement = result.fourPillars.day.element || '未知'; // 使用日干的五行
    const season = result.fourPillars.season;
    const strongestTenGod = result.tenGodAnalysis.summary.strongest;
    
    let currentMajorPeriod: string | undefined;
    if (result.majorPeriods?.currentPeriod) {
      const period = result.majorPeriods.currentPeriod;
      currentMajorPeriod = `${period.stem}${period.branch}(${period.startAge}-${period.endAge}岁)`;
    }
    
    const description = `${dayMaster}日主，五行属${dayMasterElement}，生于${season}，` +
                      `十神以${strongestTenGod}为主${currentMajorPeriod ? `，现行${currentMajorPeriod}大运` : ''}。`;
    
    return {
      dayMaster,
      dayMasterElement,
      season,
      strongestTenGod,
      currentMajorPeriod,
      description
    };
  }

  /**
   * 检查排盘特殊格局
   */
  checkSpecialPatterns(result: BasicChartResult): {
    patterns: Array<{
      name: string;
      type: 'favorable' | 'unfavorable' | 'neutral';
      description: string;
      strength: number;
    }>;
    hasSpecialPattern: boolean;
  } {
    const patterns: Array<{
      name: string;
      type: 'favorable' | 'unfavorable' | 'neutral';
      description: string;
      strength: number;
    }> = [];
    
    // 收集十神格局
    if (result.tenGodAnalysis.patterns) {
      patterns.push(...result.tenGodAnalysis.patterns.map(pattern => ({
        name: pattern.name,
        type: pattern.type,
        description: pattern.description,
        strength: pattern.strength
      })));
    }
    
    // 检查四柱特殊组合
    const specialCombinations = this.checkFourPillarsSpecialCombinations(result.fourPillars);
    patterns.push(...specialCombinations);
    
    return {
      patterns,
      hasSpecialPattern: patterns.length > 0
    };
  }

  /**
   * 检查四柱特殊组合
   */
  private checkFourPillarsSpecialCombinations(fourPillars: any): Array<{
    name: string;
    type: 'favorable' | 'unfavorable' | 'neutral';
    description: string;
    strength: number;
  }> {
    const patterns = [];
    
    // 检查纯阴纯阳
    const stems = [fourPillars.year.stem, fourPillars.month.stem, fourPillars.day.stem, fourPillars.hour.stem];
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    const yinStems = ['乙', '丁', '己', '辛', '癸'];
    
    const allYang = stems.every(stem => yangStems.includes(stem));
    const allYin = stems.every(stem => yinStems.includes(stem));
    
    if (allYang) {
      patterns.push({
        name: '纯阳格',
        type: 'neutral' as const,
        description: '四柱天干全阳，性格阳刚，但需要阴柔调和。',
        strength: 70
      });
    } else if (allYin) {
      patterns.push({
        name: '纯阴格',
        type: 'neutral' as const,
        description: '四柱天干全阴，性格阴柔，但需要阳刚补充。',
        strength: 70
      });
    }
    
    return patterns;
  }

  /**
   * 🆕 单独进行能力评估 
   */
  async calculateCapabilityAssessment(
    input: ChartCalculationInput | BasicChartResult,
    analysisLevel: 'basic' | 'comprehensive' = 'comprehensive'
  ): Promise<CapabilityAssessmentResultPayload> {
    // 检查能力评估模块是否可用
    if (!this.capabilityEngine || !capabilityModule) {
      console.warn('能力评估模块不可用');
      return {
        capabilityScores: this.createEmptyCapabilityScores(),
        overallStrength: 0,
        topCapabilities: [],
        topCapabilityLabels: [],
        topCapabilityDetails: [],
        recommendations: this.createFallbackRecommendations('能力评估模块未加载'),
        analysisLevel,
      };
    }

    try {
      let baziInput: any;

      // 判断输入类型并转换
      if ('fourPillars' in input) {
        // 输入是BasicChartResult
        const adapter = capabilityModule.CoreIntegrationAdapter?.fromBaZiChart;
        if (!adapter) {
          return {
            capabilityScores: this.createEmptyCapabilityScores(),
            overallStrength: 0,
            topCapabilities: [],
            topCapabilityLabels: [],
            topCapabilityDetails: [],
            recommendations: this.createFallbackRecommendations('能力评估适配器不可用'),
            analysisLevel,
          };
        }
        baziInput = adapter(input);
      } else {
        // 输入是ChartCalculationInput，需要先排盘
        const chartResult = await this.calculateBasicChart(input, {
          includeTenGods: true,
          validateInput: true
        });
        const adapter = capabilityModule.CoreIntegrationAdapter?.fromBaZiChart;
        if (!adapter) {
          return {
            capabilityScores: this.createEmptyCapabilityScores(),
            overallStrength: 0,
            topCapabilities: [],
            topCapabilityLabels: [],
            topCapabilityDetails: [],
            recommendations: this.createFallbackRecommendations('能力评估适配器不可用'),
            analysisLevel,
          };
        }
        baziInput = adapter(chartResult);
      }

      const capabilityResult = await this.executeCapabilityAssessment(baziInput, analysisLevel);

      if (!capabilityResult) {
        return {
          capabilityScores: this.createEmptyCapabilityScores(),
          overallStrength: 0,
          topCapabilities: [],
          topCapabilityLabels: [],
          topCapabilityDetails: [],
          recommendations: this.createFallbackRecommendations('能力评估模块不可用'),
          analysisLevel
        };
      }

      const topCapabilityLabels = capabilityResult.topCapabilityLabels?.length
        ? capabilityResult.topCapabilityLabels
        : this.mapCapabilityLabels(capabilityResult.topCapabilities);

      const topCapabilityDetails = capabilityResult.topCapabilityDetails?.length
        ? capabilityResult.topCapabilityDetails
        : this.buildTopCapabilityDetails(capabilityResult.capabilityScores, capabilityResult.topCapabilities);

      return {
        tenGodStrength: capabilityResult.tenGodStrength,
        capabilityScores: capabilityResult.capabilityScores,
        overallStrength: capabilityResult.overallStrength,
        topCapabilities: capabilityResult.topCapabilities,
        topCapabilityLabels,
        topCapabilityDetails,
        algorithmOutput: capabilityResult.algorithmOutput,
        recommendations: capabilityResult.recommendations,
        patterns: capabilityResult.patterns,
        analysisLevel: capabilityResult.analysisLevel,
        analysisDetails: capabilityResult.analysisDetails,
        rawCapabilityScores: capabilityResult.rawCapabilityScores
      };
      
    } catch (error) {
      throw new ChartCalculationError(
        `能力评估计算失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'CAPABILITY_ASSESSMENT_ERROR',
        input
      );
    }
  }
  
  /**
   * 根据分析级别执行能力评估
   */
  private async executeCapabilityAssessment(
    baziInput: any,
    analysisLevel: 'basic' | 'comprehensive'
  ): Promise<CapabilityComputationResult | undefined> {
    if (!this.capabilityEngine) {
      return this.executeCapabilityAssessmentWithUtils(baziInput, analysisLevel);
    }

    if (analysisLevel === 'comprehensive') {
      const algorithmOutput = await this.capabilityEngine.evaluateComplete(baziInput);
      const tenGodStrength = this.normalizeTenGodStrength(algorithmOutput.ten_god_strength as Record<string, unknown> | undefined);
      const capabilityScores = this.normalizeCapabilityScores(algorithmOutput.capabilities as Record<string, unknown> | undefined);
      const overallStrength = this.computeOverallStrength(capabilityScores);
      const topCapabilities = this.computeTopCapabilityKeys(capabilityScores, 3);
      const topCapabilityLabels = this.mapCapabilityLabels(topCapabilities);
      const topCapabilityDetails = this.buildTopCapabilityDetails(capabilityScores, topCapabilities);
      const patternInfo = algorithmOutput.analysis_details?.pattern ? {
        patternType: algorithmOutput.analysis_details.pattern?.pattern_type || '',
        confidence: algorithmOutput.analysis_details.pattern?.confidence || 0,
        description: algorithmOutput.analysis_details.pattern?.description || ''
      } : undefined;

      const recommendations = this.normalizeRecommendationEntries(
        algorithmOutput.analysis_details?.recommendations,
        {
          topCapabilityLabels,
          patternType: patternInfo?.patternType
        }
      );

      return {
        tenGodStrength,
        capabilityScores,
        overallStrength,
        topCapabilities,
        topCapabilityLabels,
        topCapabilityDetails,
        algorithmOutput,
        recommendations,
        patterns: patternInfo,
        analysisDetails: algorithmOutput.analysis_details,
        rawCapabilityScores: algorithmOutput.capabilities,
        analysisLevel: 'comprehensive'
      };
    }

    let tenGodStrengthRaw: unknown;
    if (this.capabilityEngine.calculateTenGodStrength) {
      tenGodStrengthRaw = await this.capabilityEngine.calculateTenGodStrength(baziInput);
    } else if (capabilityModule?.CapabilityAssessmentUtils?.quickTenGodStrength) {
      tenGodStrengthRaw = await capabilityModule.CapabilityAssessmentUtils.quickTenGodStrength(baziInput);
    }

    let capabilityScoresRaw: unknown;
    if (this.capabilityEngine.calculateCapabilityScores && tenGodStrengthRaw) {
      capabilityScoresRaw = await this.capabilityEngine.calculateCapabilityScores(tenGodStrengthRaw, baziInput);
    } else if (capabilityModule?.CapabilityAssessmentUtils?.quickCapabilityScores) {
      capabilityScoresRaw = await capabilityModule.CapabilityAssessmentUtils.quickCapabilityScores(baziInput);
    }

    const tenGodStrength = this.normalizeTenGodStrength(tenGodStrengthRaw as Record<string, unknown> | undefined);
    const capabilityScores = this.normalizeCapabilityScores(capabilityScoresRaw as Record<string, unknown> | undefined);
    const overallStrength = this.computeOverallStrength(capabilityScores);
    const topCapabilities = this.computeTopCapabilityKeys(capabilityScores, 3);
    const topCapabilityLabels = this.mapCapabilityLabels(topCapabilities);
    const topCapabilityDetails = this.buildTopCapabilityDetails(capabilityScores, topCapabilities);
    const recommendations = this.normalizeRecommendationEntries(undefined, {
      topCapabilityLabels
    });

    return {
      tenGodStrength,
      capabilityScores,
      overallStrength,
      topCapabilities,
      topCapabilityLabels,
      topCapabilityDetails,
      algorithmOutput: undefined,
      recommendations,
      patterns: undefined,
      analysisDetails: undefined,
      rawCapabilityScores: capabilityScoresRaw as Record<string, unknown> | undefined,
      analysisLevel: 'basic'
    };
  }

  private async executeCapabilityAssessmentWithUtils(
    baziInput: any,
    analysisLevel: 'basic' | 'comprehensive'
  ): Promise<CapabilityComputationResult | undefined> {
    if (!capabilityModule?.CapabilityAssessmentUtils) {
      return undefined;
    }

    const utils = capabilityModule.CapabilityAssessmentUtils;

    try {
      if (analysisLevel === 'comprehensive' && typeof utils.quickAssessment === 'function') {
        const algorithmOutput = await utils.quickAssessment(baziInput);
        const algorithmRecord = algorithmOutput as Record<string, unknown> | undefined;
        const tenGodSource = (algorithmRecord?.ten_god_strength ?? algorithmRecord?.tenGodStrength) as Record<string, unknown> | undefined;
        const capabilitySource = (algorithmRecord?.capabilities ?? algorithmRecord?.capabilityScores) as Record<string, unknown> | undefined;

        const tenGodStrength = this.normalizeTenGodStrength(tenGodSource);
        const capabilityScores = this.normalizeCapabilityScores(capabilitySource);
        const overallStrength = this.computeOverallStrength(capabilityScores);
        const topCapabilities = this.computeTopCapabilityKeys(capabilityScores, 3);
        const topCapabilityLabels = this.mapCapabilityLabels(topCapabilities);
        const topCapabilityDetails = this.buildTopCapabilityDetails(capabilityScores, topCapabilities);
        const analysisDetails = (algorithmOutput as Record<string, any>)?.analysis_details;
        const patternInfo = analysisDetails?.pattern ? {
          patternType: analysisDetails.pattern?.pattern_type || '',
          confidence: analysisDetails.pattern?.confidence || 0,
          description: analysisDetails.pattern?.description || ''
        } : undefined;
        const recommendations = this.normalizeRecommendationEntries(analysisDetails?.recommendations, {
          topCapabilityLabels,
          patternType: patternInfo?.patternType
        });

        return {
          tenGodStrength,
          capabilityScores,
          overallStrength,
          topCapabilities,
          topCapabilityLabels,
          topCapabilityDetails,
          algorithmOutput,
          recommendations,
          patterns: patternInfo,
          analysisDetails,
          rawCapabilityScores: (algorithmOutput as Record<string, any>)?.capabilities,
          analysisLevel: 'comprehensive'
        };
      }

      const tenGodStrengthSource = typeof utils.quickTenGodStrength === 'function'
        ? await utils.quickTenGodStrength(baziInput)
        : undefined;
      const capabilityScoresRaw = await utils.quickCapabilityScores(baziInput);

      const tenGodStrength = this.normalizeTenGodStrength(
        tenGodStrengthSource as Record<string, unknown> | undefined
      );
      const capabilityScores = this.normalizeCapabilityScores(
        capabilityScoresRaw as Record<string, unknown> | undefined
      );
      const overallStrength = this.computeOverallStrength(capabilityScores);
      const topCapabilities = this.computeTopCapabilityKeys(capabilityScores, 3);
      const topCapabilityLabels = this.mapCapabilityLabels(topCapabilities);
      const topCapabilityDetails = this.buildTopCapabilityDetails(capabilityScores, topCapabilities);
      const recommendations = this.normalizeRecommendationEntries(undefined, {
        topCapabilityLabels
      });

      return {
        tenGodStrength,
        capabilityScores,
        overallStrength,
        topCapabilities,
        topCapabilityLabels,
        topCapabilityDetails,
        algorithmOutput: undefined,
        recommendations,
        patterns: undefined,
        analysisDetails: undefined,
        rawCapabilityScores: capabilityScoresRaw as Record<string, unknown> | undefined,
        analysisLevel: 'basic'
      };
    } catch (error) {
      console.warn('能力评估工具集成失败，跳过此功能:', error instanceof Error ? error.message : error);
      return undefined;
    }
  }

  /**
   * 规范化六能力评分（统一为英文key）
   */
  private normalizeCapabilityScores(scores: Record<string, unknown> | undefined | null): Record<CapabilityKey, number> {
    const normalized: Record<CapabilityKey, number> = {
      execution: 0,
      innovation: 0,
      management: 0,
      sales: 0,
      coordination: 0,
      stability: 0
    };

    if (!scores || typeof scores !== 'object') {
      return normalized;
    }

    CAPABILITY_KEYS.forEach(key => {
      const cnKey = CAPABILITY_KEY_TO_CN[key];
      const rawValue = (scores as Record<string, unknown>)[key] ?? (scores as Record<string, unknown>)[cnKey];

      if (rawValue === undefined || rawValue === null) {
        return;
      }

      let numericValue: number | null = null;

      if (typeof rawValue === 'number') {
        numericValue = rawValue;
      } else if (typeof rawValue === 'string') {
        const parsed = Number(rawValue);
        numericValue = Number.isFinite(parsed) ? parsed : null;
      } else if (typeof rawValue === 'object' && 'score' in (rawValue as Record<string, unknown>)) {
        const nested = (rawValue as Record<string, unknown>).score;
        if (typeof nested === 'number') {
          numericValue = nested;
        } else if (typeof nested === 'string') {
          const parsed = Number(nested);
          numericValue = Number.isFinite(parsed) ? parsed : null;
        }
      }

      if (numericValue !== null && Number.isFinite(numericValue)) {
        normalized[key] = this.clampCapabilityScore(numericValue);
      }
    });

    return normalized;
  }

  /**
   * 限制能力分值范围并统一保留一位小数
   */
  private clampCapabilityScore(value: number): number {
    const clamped = Math.max(0, Math.min(100, value));
    return Math.round(clamped * 10) / 10;
  }

  /**
   * 计算综合实力（所有能力平均值）
   */
  private computeOverallStrength(scores: Record<CapabilityKey, number>): number {
    const values = Object.values(scores);
    if (!values.length) {
      return 0;
    }
    const total = values.reduce((sum, current) => sum + current, 0);
    return Math.round((total / values.length) * 10) / 10;
  }

  /**
   * 获取排名靠前的能力Key
   */
  private computeTopCapabilityKeys(
    scores: Record<CapabilityKey, number>,
    limit = 3
  ): CapabilityKey[] {
    return [...CAPABILITY_KEYS]
      .sort((a, b) => {
        if (scores[b] !== scores[a]) {
          return scores[b] - scores[a];
        }
        return a.localeCompare(b);
      })
      .filter(key => scores[key] > 0)
      .slice(0, limit);
  }

  private buildTopCapabilityDetails(
    scores: Record<CapabilityKey, number>,
    topCapabilities: CapabilityKey[]
  ): Array<{ key: CapabilityKey; label: string; score: number; rank: number }> {
    return topCapabilities.map((key, index) => ({
      key,
      label: CAPABILITY_LABEL_MAP[key],
      score: scores[key],
      rank: index + 1
    }));
  }

  private normalizeRecommendationEntries(
    rawRecommendations: unknown,
    context: { topCapabilityLabels: string[]; patternType?: string }
  ): CapabilityRecommendation[] {
    const entries: CapabilityRecommendation[] = [];

    const addEntry = (entry: CapabilityRecommendation) => {
      if (!entry || typeof entry.suggestion !== 'string') {
        return;
      }

      const suggestion = entry.suggestion.trim();
      if (!suggestion) {
        return;
      }

      const category = entry.category?.trim() || this.inferRecommendationCategory(suggestion, context);
      const priority = Number.isFinite(entry.priority) && (entry.priority ?? 0) > 0
        ? Math.min(3, Math.round(entry.priority))
        : Math.min(3, entries.length + 1);

      entries.push({
        category,
        suggestion,
        priority
      });
    };

    const appendStringEntry = (value: string) => {
      const suggestion = value.trim();
      if (!suggestion) {
        return;
      }
      addEntry({
        category: DEFAULT_RECOMMENDATION_CATEGORY,
        suggestion,
        priority: entries.length + 1
      });
    };

    if (Array.isArray(rawRecommendations)) {
      rawRecommendations.forEach(item => {
        if (typeof item === 'string') {
          appendStringEntry(item);
        } else if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const suggestion = this.extractSuggestionFromObject(record);
          if (!suggestion) {
            return;
          }
          const category = this.extractCategoryFromObject(record);
          const priority = this.extractPriorityFromObject(record, entries.length);
          addEntry({
            category: category ?? DEFAULT_RECOMMENDATION_CATEGORY,
            suggestion,
            priority
          });
        }
      });
    } else if (typeof rawRecommendations === 'string') {
      appendStringEntry(rawRecommendations);
    }

    if (!entries.length) {
      const fallbackSuggestions = this.buildFallbackSuggestionStrings(context.topCapabilityLabels);
      fallbackSuggestions.forEach(suggestion => addEntry({
        category: DEFAULT_RECOMMENDATION_CATEGORY,
        suggestion,
        priority: entries.length + 1
      }));
    }

    return this.deduplicateRecommendations(entries).map((entry, index) => ({
      category: entry.category || this.inferRecommendationCategory(entry.suggestion, context),
      suggestion: entry.suggestion,
      priority: Math.min(3, entry.priority || index + 1)
    }));
  }

  private extractSuggestionFromObject(raw: Record<string, unknown>): string | undefined {
    const candidateKeys = ['suggestion', 'text', 'message', 'description'];
    for (const key of candidateKeys) {
      const value = raw[key];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
    }
    return undefined;
  }

  private extractCategoryFromObject(raw: Record<string, unknown>): string | undefined {
    const value = raw.category;
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return undefined;
  }

  private extractPriorityFromObject(raw: Record<string, unknown>, fallbackIndex: number): number {
    const value = raw.priority;
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return Math.min(3, Math.round(value));
    }
    if (typeof value === 'string') {
      const numeric = Number(value);
      if (Number.isFinite(numeric) && numeric > 0) {
        return Math.min(3, Math.round(numeric));
      }
    }
    return Math.min(3, fallbackIndex + 1);
  }

  private buildFallbackSuggestionStrings(labels: string[]): string[] {
    if (labels.length === 0) {
      return ['建议综合提升六大核心能力，巩固当前优势'];
    }

    const uniqueLabels = Array.from(new Set(labels));
    return uniqueLabels.map(label => `建议持续强化${label}相关能力，形成长效优势`);
  }

  private inferRecommendationCategory(
    suggestion: string,
    context: { topCapabilityLabels: string[]; patternType?: string }
  ): string {
    const normalized = suggestion.toLowerCase();

    if (normalized.includes('执行') || normalized.includes('效率') || normalized.includes('行动')) {
      return '执行力';
    }
    if (normalized.includes('创新') || normalized.includes('创意') || normalized.includes('研发')) {
      return '创新力';
    }
    if (normalized.includes('管理') || normalized.includes('领导') || normalized.includes('组织')) {
      return '管理力';
    }
    if (normalized.includes('销售') || normalized.includes('沟通') || normalized.includes('市场')) {
      return '销售力';
    }
    if (normalized.includes('协调') || normalized.includes('团队') || normalized.includes('合作')) {
      return '协调力';
    }
    if (normalized.includes('稳定') || normalized.includes('踏实') || normalized.includes('风险')) {
      return '稳定性';
    }

    if (context.patternType) {
      return `${context.patternType}建议`;
    }

    if (context.topCapabilityLabels.length > 0) {
      return `${context.topCapabilityLabels[0]}优势`; 
    }

    return DEFAULT_RECOMMENDATION_CATEGORY;
  }

  private deduplicateRecommendations(entries: CapabilityRecommendation[]): CapabilityRecommendation[] {
    const seen = new Set<string>();
    const result: CapabilityRecommendation[] = [];

    for (const entry of entries) {
      const key = entry.suggestion.trim();
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(entry);
    }

    return result;
  }

  /**
   * 规范化十神强度数据
   */
  private normalizeTenGodStrength(strength: Record<string, unknown> | undefined | null): Record<string, number> {
    if (!strength || typeof strength !== 'object') {
      return {};
    }

    return Object.entries(strength).reduce<Record<string, number>>((acc, [name, value]) => {
      if (typeof value === 'number') {
        acc[name] = Math.round(value * 1000) / 1000;
        return acc;
      }
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
          acc[name] = Math.round(parsed * 1000) / 1000;
        }
      }
      return acc;
    }, {});
  }

  /**
   * 将能力Key转换为中文标签
   */
  private mapCapabilityLabels(keys: CapabilityKey[]): string[] {
    return keys.map(key => CAPABILITY_LABEL_MAP[key]);
  }

  private createEmptyCapabilityScores(): Record<CapabilityKey, number> {
    return {
      execution: 0,
      innovation: 0,
      management: 0,
      sales: 0,
      coordination: 0,
      stability: 0,
    };
  }

  private createFallbackRecommendations(message: string): CapabilityRecommendation[] {
    return [
      {
        category: DEFAULT_RECOMMENDATION_CATEGORY,
        suggestion: message,
        priority: 1,
      },
    ];
  }

  /**
   * 根据优势能力推断人格类型（简化版）
   */
  private derivePersonalityType(topCapabilityLabels: string[]): string {
    if (topCapabilityLabels.includes('管理力') && topCapabilityLabels.includes('执行力')) {
      return '领导管理型';
    }
    if (topCapabilityLabels.includes('创新力') && topCapabilityLabels.includes('销售力')) {
      return '创新营销型';
    }
    if (topCapabilityLabels.includes('协调力') && topCapabilityLabels.includes('稳定性')) {
      return '稳健协调型';
    }
    if (topCapabilityLabels.includes('执行力') && topCapabilityLabels.includes('稳定性')) {
      return '实务执行型';
    }
    if (topCapabilityLabels.includes('创新力') && topCapabilityLabels.includes('管理力')) {
      return '创新管理型';
    }
    return '综合发展型';
  }

  /**
   * 🆕 获取能力分析摘要
   */
  getCapabilityAnalysisSummary(result: BasicChartResult): {
    hasCapabilityAnalysis: boolean;
    topCapabilities?: Array<{
      key: CapabilityKey;
      label: string;
      score: number;
      rank: number;
    }>;
    topCapabilityLabels?: string[];
    patternSummary?: string;
    pattern?: {
      patternType: string;
      confidence: number;
      description: string;
    };
    overallStrength?: number;
    recommendations?: CapabilityRecommendation[];
    dominantTenGods?: Array<{
      name: string;
      score: number;
    }>;
    personalityType?: string;
    capabilityScores?: Record<CapabilityKey, number>;
  } {
    if (!result.capabilityAssessment) {
      return { hasCapabilityAnalysis: false };
    }
    
    const {
      capabilityScores,
      patterns,
      recommendations,
      tenGodStrength,
      topCapabilities: snapshotTopCapabilities,
      topCapabilityLabels: snapshotTopLabels,
      topCapabilityDetails,
      overallStrength: snapshotOverallStrength
    } = result.capabilityAssessment;

    const normalizedScores = capabilityScores ?? this.createEmptyCapabilityScores();
    const topCapabilityKeys = snapshotTopCapabilities?.length
      ? snapshotTopCapabilities
      : this.computeTopCapabilityKeys(normalizedScores, 3);
    const topCapabilityLabels = snapshotTopLabels?.length
      ? snapshotTopLabels
      : this.mapCapabilityLabels(topCapabilityKeys);
    const topCapabilities = topCapabilityDetails?.length
      ? topCapabilityDetails
      : this.buildTopCapabilityDetails(normalizedScores, topCapabilityKeys);

    const normalizedTenGodStrength = this.normalizeTenGodStrength(tenGodStrength);
    const dominantTenGods = Object.entries(normalizedTenGodStrength)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const overallStrength = typeof snapshotOverallStrength === 'number'
      ? snapshotOverallStrength
      : this.computeOverallStrength(normalizedScores);

    const personalityType = this.derivePersonalityType(topCapabilityLabels);

    if (!topCapabilities.length && !Object.values(normalizedScores).some(score => score > 0)) {
      return { hasCapabilityAnalysis: false };
    }

    return {
      hasCapabilityAnalysis: true,
      topCapabilities,
      topCapabilityLabels,
      patternSummary: patterns?.description,
      pattern: patterns,
      overallStrength,
      recommendations: recommendations || [],
      dominantTenGods,
      personalityType,
      capabilityScores: normalizedScores
    };
  }

  /**
   * 🆕 获取能力引擎性能统计
   */
  getCapabilityEnginePerformance(): {
    cacheHitRate: number;
    averageCalculationTime: number;
    totalCalculations: number;
    totalEvaluations: number;
    memoryUsage: string;
    cacheStats?: {
      strength: unknown;
      capability: unknown;
      complete: unknown;
    };
  } {
    if (this.capabilityEngine && this.capabilityEngine.getPerformanceSummary) {
      const summary = this.capabilityEngine.getPerformanceSummary();
      const totalCalculations = summary.totalCalculations ?? 0;
      const averageCalculationTime = (summary as { averageCalculationTime?: number; averageTime?: number }).averageCalculationTime
        ?? (summary as { averageTime?: number }).averageTime
        ?? 0;
      const memoryUsage = (summary as { memoryUsage?: string }).memoryUsage ?? 'N/A';
      return {
        cacheHitRate: summary.cacheHitRate ?? 0,
        averageCalculationTime,
        totalCalculations,
        totalEvaluations: totalCalculations,
        memoryUsage,
        cacheStats: summary.cacheStats
      };
    }
    return {
      cacheHitRate: 0,
      averageCalculationTime: 0,
      totalCalculations: 0,
      totalEvaluations: 0,
      memoryUsage: 'N/A'
    };
  }
  
  /**
   * 🆕 清除能力评估缓存
   */
  clearCapabilityCache(): void {
    if (this.capabilityEngine && this.capabilityEngine.clearCache) {
      this.capabilityEngine.clearCache();
    }
  }

  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): {
    description: string;
    recommendations: string[];
  } {
    return {
      description: '基础排盘模块性能良好，支持高并发计算。',
      recommendations: [
        '大批量计算时可考虑启用缓存',
        '不需要的模块可以通过选项关闭以提升性能',
        '复杂分析建议分步进行'
      ]
    };
  }
}
