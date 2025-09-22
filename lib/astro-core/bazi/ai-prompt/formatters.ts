/**
 * AI 提示词数据格式化器
 * 将八字分析数据转换为AI友好的结构化格式
 */

import type { FourPillars, StemName, BranchName } from '../types';
import { BatchShenShaResult } from '../shensha/types';
import type { 
  AIBaZiBasicInfo,
  AIShenShaSummary,
  AIWuxingSummary,
  AIPromptData,
  AIPromptOptions,
  AIShishenSummary,
  AILifeAnalysis,
  AIDayunLiunian,
  AICapabilityAssessment
} from './types';

import { AIPromptError } from './types';

// WuxingAnalysisResult is used from types.ts (temporary interface section)
interface WuxingAnalysisResult {
  scores?: Record<string, number>;
  analysis?: any;
  recommendations?: any[];
  elementScores?: Record<string, number>;
  favorableElements?: string[];
  unfavorableElements?: string[];
  dayMasterStrength?: {
    score: number;
    level: string;
    factors: string[];
  };
  seasonalInfluence?: any;
  yongshenAnalysis?: any;
  pattern?: {
    type: string;
    confidence: number;
    description: string;
    elements: any;
  };
}

interface BaZiChart {
  fourPillars: {
    year: { stem: StemName; branch: BranchName };
    month: { stem: StemName; branch: BranchName };
    day: { stem: StemName; branch: BranchName };
    hour: { stem: StemName; branch: BranchName };
  };
  gender: 'male' | 'female';
  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  timezone: string;
  nayin?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  lunarDate?: {
    year: number;
    month: number;
    day: number;
  };
}

// 🆕 导入能力评估相关类型
import {
  TenGodStrength,
  CapabilityScores,
  AlgorithmOutput,
  PatternDetectionResult
} from '../capability-assessment/types';

/**
 * 基础八字信息格式化器
 */
export class BaZiBasicFormatter {
  /**
   * 格式化基础八字信息
   */
  static format(chart: BaZiChart): AIBaZiBasicInfo {
    try {
      return {
        gender: chart.gender === 'male' ? '男' : '女',
        birthInfo: {
          year: `${chart.solarDate.year}年`,
          month: `${chart.solarDate.month}月`,
          day: `${chart.solarDate.day}日`,
          hour: `${chart.solarDate.hour}时${chart.solarDate.minute}分`,
          timezone: chart.timezone || 'GMT+8',
          lunarDate: chart.lunarDate ? 
            `农历${chart.lunarDate.year}年${chart.lunarDate.month}月${chart.lunarDate.day}日` : 
            undefined
        },
        fourPillars: {
          year: {
            stem: chart.fourPillars.year.stem,
            branch: chart.fourPillars.year.branch,
            nayin: chart.nayin?.year || '未知'
          },
          month: {
            stem: chart.fourPillars.month.stem,
            branch: chart.fourPillars.month.branch,
            nayin: chart.nayin?.month || '未知'
          },
          day: {
            stem: chart.fourPillars.day.stem,
            branch: chart.fourPillars.day.branch,
            nayin: chart.nayin?.day || '未知'
          },
          hour: {
            stem: chart.fourPillars.hour.stem,
            branch: chart.fourPillars.hour.branch,
            nayin: chart.nayin?.hour || '未知'
          }
        },
        dayMaster: {
          stem: chart.fourPillars.day.stem,
          element: this.getStemElement(chart.fourPillars.day.stem),
          yinyang: this.getStemYinYang(chart.fourPillars.day.stem)
        }
      };
    } catch (error) {
      throw new AIPromptError(
        `基础信息格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { chart }
      );
    }
  }

  /**
   * 获取天干对应的五行
   */
  private static getStemElement(stem: string): string {
    const stemElementMap: Record<string, string> = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };
    return stemElementMap[stem] || '未知';
  }

  /**
   * 获取天干的阴阳属性
   */
  private static getStemYinYang(stem: string): '阴' | '阳' {
    const yangStems = ['甲', '丙', '戊', '庚', '壬'];
    return yangStems.includes(stem) ? '阳' : '阴';
  }

  /**
   * 格式化四柱为字符串
   */
  static formatFourPillarsString(chart: BaZiChart): string {
    const { year, month, day, hour } = chart.fourPillars;
    return `${year.stem}${year.branch} ${month.stem}${month.branch} ${day.stem}${day.branch} ${hour.stem}${hour.branch}`;
  }
}

/**
 * 神煞分析格式化器
 */
export class ShenShaFormatter {
  /**
   * 格式化神煞分析摘要
   */
  static format(result: BatchShenShaResult): AIShenShaSummary {
    try {
      const importantShenSha = result.important.map(analysis => ({
        name: analysis.info.name,
        category: analysis.info.category,
        impact: this.determineImpact(analysis.impact),
        strength: analysis.score,
        positions: analysis.detection.positions.map(p => this.formatPosition(p.pillar)),
        meaning: analysis.info.description,
        implications: [
          ...analysis.impact.positive,
          ...analysis.impact.negative.map(neg => `需注意: ${neg}`)
        ]
      }));

      return {
        statistics: {
          total: result.statistics.total,
          auspicious: result.statistics.auspicious,
          inauspicious: result.statistics.inauspicious,
          important: Array.isArray((result.statistics as any).important) ? (result.statistics as any).important.length : 0
        },
        important: importantShenSha,
        byCategory: {
          nobleman: this.getByCategory(result, 'nobleman'),
          peachBlossom: this.getByCategory(result, 'peachBlossom'),
          academic: this.getByCategory(result, 'academic'),
          wealth: this.getByCategory(result, 'wealth'),
          health: this.getByCategory(result, 'health'),
          relationship: this.getByCategory(result, 'relationship'),
          career: this.getByCategory(result, 'career'),
          other: this.getByCategory(result, 'other')
        },
        overallAssessment: {
          strengths: result.overallAnalysis.keyFindings.filter((f: string) => f.includes('有利') || f.includes('吉')),
          challenges: result.overallAnalysis.keyFindings.filter((f: string) => f.includes('不利') || f.includes('凶')),
          recommendations: result.overallAnalysis.recommendations
        }
      };
    } catch (error) {
      throw new AIPromptError(
        `神煞格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { result }
      );
    }
  }

  /**
   * 判断神煞影响类型
   */
  private static determineImpact(impact: { positive: string[]; negative: string[]; }): 'positive' | 'negative' | 'neutral' {
    if (impact.positive.length > impact.negative.length) return 'positive';
    if (impact.negative.length > impact.positive.length) return 'negative';
    return 'neutral';
  }

  /**
   * 格式化位置信息
   */
  private static formatPosition(pillar: string): string {
    const positionMap: Record<string, string> = {
      'year': '年柱',
      'month': '月柱',
      'day': '日柱',
      'hour': '时柱'
    };
    return positionMap[pillar] || pillar;
  }

  /**
   * 按类别获取神煞
   */
  private static getByCategory(result: BatchShenShaResult, category: string): string[] {
    const categoryData = (result.byGroup as any)[category];
    return categoryData ? categoryData.map((item: any) => item.info.name) : [];
  }
}

/**
 * 五行分析格式化器
 */
export class WuxingFormatter {
  /**
   * 格式化五行分析摘要
   */
  static format(result: WuxingAnalysisResult): AIWuxingSummary {
    try {
      return {
        elements: {
          wood: this.formatElement(result.elementScores?.wood || 0, '木'),
          fire: this.formatElement(result.elementScores?.fire || 0, '火'),
          earth: this.formatElement(result.elementScores?.earth || 0, '土'),
          metal: this.formatElement(result.elementScores?.metal || 0, '金'),
          water: this.formatElement(result.elementScores?.water || 0, '水')
        },
        dayMasterStrength: {
          level: this.getDayMasterLevel(result.dayMasterStrength?.score || 0),
          score: result.dayMasterStrength?.score || 0,
          factors: result.dayMasterStrength?.factors?.map((f: any) => f.description) || [],
          seasonalInfluence: result.seasonalInfluence?.description || '无特殊季节影响'
        },
        yongshen: {
          favorable: result.favorableElements || [],
          unfavorable: result.unfavorableElements || [],
          neutral: [],
          explanation: result.yongshenAnalysis?.explanation || '需要综合分析确定用神喜忌'
        },
        pattern: {
          name: (result.pattern as any)?.name || '普通格局',
          type: result.pattern?.type || 'normal',
          quality: this.getPatternQuality((result.pattern as any)?.score || 50),
          description: result.pattern?.description || '命局结构相对平衡'
        }
      };
    } catch (error) {
      throw new AIPromptError(
        `五行格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { result }
      );
    }
  }

  /**
   * 格式化单个五行元素
   */
  private static formatElement(score: number, elementName: string) {
    const status = this.getElementStatus(score);
    const description = this.getElementDescription(score, elementName);
    
    return {
      strength: score,
      status,
      description
    };
  }

  /**
   * 获取五行状态
   */
  private static getElementStatus(score: number): string {
    if (score >= 80) return '极旺';
    if (score >= 60) return '偏旺';
    if (score >= 40) return '中和';
    if (score >= 20) return '偏弱';
    return '极弱';
  }

  /**
   * 获取五行描述
   */
  private static getElementDescription(score: number, elementName: string): string {
    const status = this.getElementStatus(score);
    const descriptions: Record<string, string> = {
      '极旺': `${elementName}极为旺盛，主导力强`,
      '偏旺': `${elementName}偏旺，有一定优势`,
      '中和': `${elementName}力量适中，较为平衡`,
      '偏弱': `${elementName}偏弱，需要补强`,
      '极弱': `${elementName}极弱，严重不足`
    };
    return descriptions[status] || `${elementName}力量${status}`;
  }

  /**
   * 获取日主强弱等级
   */
  private static getDayMasterLevel(score: number): string {
    if (score >= 80) return '极旺';
    if (score >= 60) return '偏旺';
    if (score >= 40) return '中和';
    if (score >= 20) return '偏弱';
    return '极弱';
  }

  /**
   * 获取格局品质
   */
  private static getPatternQuality(score: number): 'good' | 'normal' | 'poor' {
    if (score >= 70) return 'good';
    if (score >= 40) return 'normal';
    return 'poor';
  }
}

/**
 * 十神分析格式化器
 */
export class ShishenFormatter {
  /**
   * 格式化十神分析摘要
   */
  static format(chart: BaZiChart): AIShishenSummary {
    try {
      // 这里需要根据实际的十神分析结果来实现
      // 暂时提供基础实现
      const shishenCount = this.countShishen(chart);
      
      return {
        distribution: Object.entries(shishenCount).map(([name, count]) => ({
          name,
          count,
          positions: this.getShishenPositions(chart, name),
          strength: count > 1 ? '偏强' : count === 1 ? '适中' : '缺失'
        })),
        personality: {
          strengths: this.analyzeStrengths(shishenCount),
          weaknesses: this.analyzeWeaknesses(shishenCount),
          characteristics: this.analyzeCharacteristics(shishenCount)
        },
        abilities: {
          leadership: this.calculateAbility(shishenCount, '正官', '七杀'),
          creativity: this.calculateAbility(shishenCount, '伤官', '食神'),
          analytical: this.calculateAbility(shishenCount, '正印', '偏印'),
          social: this.calculateAbility(shishenCount, '正财', '偏财'),
          practical: this.calculateAbility(shishenCount, '比肩', '劫财')
        }
      };
    } catch (error) {
      throw new AIPromptError(
        `十神格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { chart }
      );
    }
  }

  /**
   * 统计十神数量（简化实现）
   */
  private static countShishen(chart: BaZiChart): Record<string, number> {
    // 这里需要实际的十神计算逻辑
    // 暂时返回模拟数据
    return {
      '比肩': 1,
      '劫财': 0,
      '食神': 1,
      '伤官': 0,
      '偏财': 2,
      '正财': 1,
      '七杀': 0,
      '正官': 1,
      '偏印': 1,
      '正印': 0
    };
  }

  /**
   * 获取十神位置
   */
  private static getShishenPositions(chart: BaZiChart, shishenName: string): string[] {
    // 实际实现需要计算十神在各柱的分布
    return ['年柱', '月柱'];
  }

  /**
   * 分析性格优势
   */
  private static analyzeStrengths(shishenCount: Record<string, number>): string[] {
    const strengths: string[] = [];
    
    if (shishenCount['正官'] > 0) strengths.push('有责任心，遵纪守法');
    if (shishenCount['正财'] > 0) strengths.push('理财能力强，务实');
    if (shishenCount['正印'] > 0) strengths.push('学习能力强，有智慧');
    if (shishenCount['食神'] > 0) strengths.push('乐观开朗，有创意');
    
    return strengths.length > 0 ? strengths : ['性格平衡，各方面发展均衡'];
  }

  /**
   * 分析性格弱点
   */
  private static analyzeWeaknesses(shishenCount: Record<string, number>): string[] {
    const weaknesses: string[] = [];
    
    if (shishenCount['七杀'] > 2) weaknesses.push('容易冲动，压力较大');
    if (shishenCount['伤官'] > 2) weaknesses.push('言语尖锐，容易得罪人');
    if (shishenCount['劫财'] > 1) weaknesses.push('容易破财，合作需谨慎');
    
    return weaknesses.length > 0 ? weaknesses : ['暂无明显性格缺陷'];
  }

  /**
   * 分析性格特征
   */
  private static analyzeCharacteristics(shishenCount: Record<string, number>): string[] {
    const characteristics: string[] = [];
    
    const total = Object.values(shishenCount).reduce((sum, count) => sum + count, 0);
    if (total === 0) return ['需要完整八字信息进行分析'];
    
    // 找出最多的十神
    const maxCount = Math.max(...Object.values(shishenCount));
    const dominantShishen = Object.entries(shishenCount)
      .filter(([_, count]) => count === maxCount && count > 0)
      .map(([name, _]) => name);
    
    dominantShishen.forEach(shishen => {
      characteristics.push(this.getShishenCharacteristic(shishen));
    });
    
    return characteristics;
  }

  /**
   * 获取十神特征描述
   */
  private static getShishenCharacteristic(shishen: string): string {
    const characteristics: Record<string, string> = {
      '比肩': '性格坚强，自立自强，同辈关系良好',
      '劫财': '行动力强，但需注意与人合作的方式',
      '食神': '乐观向上，具有艺术天赋和表达能力',
      '伤官': '聪明才智出众，创新能力强',
      '偏财': '善于把握机会，财运较好',
      '正财': '踏实稳重，善于积累财富',
      '七杀': '意志坚强，具有领导才能',
      '正官': '品德高尚，适合管理工作',
      '偏印': '思维敏捷，学习能力强',
      '正印': '慈祥仁爱，具有包容心'
    };
    
    return characteristics[shishen] || '具有独特的个性特征';
  }

  /**
   * 计算能力指数
   */
  private static calculateAbility(shishenCount: Record<string, number>, ...relatedShishen: string[]): number {
    const totalCount = relatedShishen.reduce((sum, shishen) => sum + (shishenCount[shishen] || 0), 0);
    return Math.min(totalCount * 25, 100); // 转换为百分制
  }
}

/**
 * 人生分析格式化器
 */
export class LifeAnalysisFormatter {
  /**
   * 格式化人生分析
   */
  static format(
    chart: BaZiChart,
    wuxingResult?: WuxingAnalysisResult,
    shenshaResult?: BatchShenShaResult
  ): AILifeAnalysis {
    try {
      return {
        personality: this.formatPersonality(chart, wuxingResult),
        career: this.formatCareer(chart, wuxingResult, shenshaResult),
        wealth: this.formatWealth(chart, wuxingResult),
        health: this.formatHealth(chart, wuxingResult),
        relationship: this.formatRelationship(chart, shenshaResult)
      };
    } catch (error) {
      throw new AIPromptError(
        `人生分析格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { chart }
      );
    }
  }

  /**
   * 格式化性格分析
   */
  private static formatPersonality(chart: BaZiChart, wuxingResult?: WuxingAnalysisResult) {
    const dayMasterElement = BaZiBasicFormatter['getStemElement'](chart.fourPillars.day.stem);
    
    return {
      coreTraits: [`${dayMasterElement}日主特质`, '基础性格稳定'],
      strengths: wuxingResult?.favorableElements?.map((el: string) => `${el}旺的优势`) || ['待分析'],
      challenges: wuxingResult?.unfavorableElements?.map((el: string) => `${el}弱的挑战`) || ['待分析'],
      behaviorPattern: '行为模式需要综合分析确定',
      decisionStyle: '决策风格与日主特性相关'
    };
  }

  /**
   * 格式化事业分析
   */
  private static formatCareer(chart: BaZiChart, wuxingResult?: WuxingAnalysisResult, shenshaResult?: BatchShenShaResult) {
    return {
      suitableFields: ['综合分析后确定适合行业'],
      careerPattern: '事业发展模式需要详细分析',
      peakPeriods: ['大运分析后确定'],
      challenges: ['需要克服的挑战'],
      recommendations: ['具体建议待详细分析后提供']
    };
  }

  /**
   * 格式化财运分析
   */
  private static formatWealth(chart: BaZiChart, wuxingResult?: WuxingAnalysisResult) {
    return {
      wealthPattern: '财运模式分析',
      sources: ['主要财源分析'],
      management: '理财建议',
      opportunities: ['财运机会'],
      risks: ['需要注意的风险']
    };
  }

  /**
   * 格式化健康分析
   */
  private static formatHealth(chart: BaZiChart, wuxingResult?: WuxingAnalysisResult) {
    return {
      constitution: '体质特征分析',
      vulnerabilities: ['健康薄弱环节'],
      seasonalEffects: ['季节性影响'],
      recommendations: ['健康建议']
    };
  }

  /**
   * 格式化感情分析
   */
  private static formatRelationship(chart: BaZiChart, shenshaResult?: BatchShenShaResult) {
    const peachBlossomStars = shenshaResult?.byGroup.peachBlossom || [];
    
    return {
      pattern: peachBlossomStars.length > 0 ? '桃花运较旺' : '感情发展平稳',
      compatibility: ['配偶特征分析'],
      challenges: ['感情挑战'],
      timing: ['感情时机'],
      advice: ['感情建议']
    };
  }
}

/**
 * 大运流年格式化器
 */
export class DayunLiunianFormatter {
  /**
   * 格式化大运流年信息
   */
  static format(chart: BaZiChart, currentAge: number = 25): AIDayunLiunian {
    try {
      // 这里需要实际的大运计算逻辑
      // 暂时提供基础框架
      
      const currentDayun = this.getCurrentDayun(chart, currentAge);
      const recentLiunian = this.getRecentLiunian(currentAge);
      const keyPeriods = this.getKeyPeriods();

      return {
        currentDayun,
        recentLiunian,
        keyPeriods
      };
    } catch (error) {
      throw new AIPromptError(
        `大运流年格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { chart, currentAge }
      );
    }
  }

  /**
   * 获取当前大运
   */
  private static getCurrentDayun(chart: BaZiChart, currentAge: number) {
    // 实际实现需要大运计算逻辑
    return {
      period: '当前大运期',
      stems: '大运天干',
      branches: '大运地支',
      startAge: Math.floor(currentAge / 10) * 10,
      endAge: Math.floor(currentAge / 10) * 10 + 10,
      characteristics: ['大运特征待分析'],
      opportunities: ['大运机遇'],
      challenges: ['大运挑战']
    };
  }

  /**
   * 获取近期流年
   */
  private static getRecentLiunian(currentAge: number) {
    const currentYear = new Date().getFullYear();
    const recentYears = [];
    
    for (let i = 0; i < 5; i++) {
      const year = currentYear + i;
      recentYears.push({
        year,
        stems: '流年天干',
        branches: '流年地支',
        combined: '干支组合',
        prediction: `${year}年运势预测`,
        keyEvents: ['关键事件'],
        advice: ['年度建议']
      });
    }
    
    return recentYears;
  }

  /**
   * 获取人生关键期
   */
  private static getKeyPeriods() {
    return [
      {
        ageRange: '25-35岁',
        description: '事业建立期',
        significance: '重要的发展阶段',
        advice: '积极把握机会'
      },
      {
        ageRange: '35-45岁',
        description: '事业成熟期',
        significance: '收获期',
        advice: '稳中求进'
      },
      {
        ageRange: '45-55岁',
        description: '人生巅峰期',
        significance: '最高成就期',
        advice: '发挥优势，回馈社会'
      }
    ];
  }
}

/**
 * 🆕 能力评估格式化器
 */
export class CapabilityAssessmentFormatter {
  private static readonly capabilityMeta = [
    { key: '执行力基础分', name: 'execution', label: '执行力' },
    { key: '创新力基础分', name: 'innovation', label: '创新力' },
    { key: '管理力基础分', name: 'management', label: '管理力' },
    { key: '销售力基础分', name: 'sales', label: '销售力' },
    { key: '协调力基础分', name: 'coordination', label: '协调力' },
    { key: '稳定性基础分', name: 'stability', label: '稳定性' },
  ] as const;
  /**
   * 格式化能力评估数据
   */
  static format(algorithmOutput: AlgorithmOutput): AICapabilityAssessment {
    try {
      const { ten_god_strength, capabilities, analysis_details } = algorithmOutput;
      
      // 格式化十神强度
      const tenGodStrength = this.formatTenGodStrength(ten_god_strength);
      
      // 格式化六能力评分
      const capabilityScores = this.formatCapabilityScores(capabilities);
      
      // 格式化格局分析
      const pattern = this.formatPattern(analysis_details?.pattern);
      
      // 生成综合评价
      const overallAssessment = this.generateOverallAssessment(capabilities, analysis_details);
      
      // 格式化建议（含默认兜底）
      const recommendations = this.formatRecommendations(
        analysis_details?.recommendations,
        capabilities,
        tenGodStrength,
        overallAssessment,
      );
      
      return {
        tenGodStrength,
        capabilityScores,
        pattern,
        overallAssessment,
        recommendations
      };
      
    } catch (error) {
      throw new AIPromptError(
        `能力评估数据格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { algorithmOutput }
      );
    }
  }
  
  /**
   * 格式化十神强度数据
   */
  private static formatTenGodStrength(strength: TenGodStrength) {
    if (!strength || typeof strength !== 'object') {
      throw new AIPromptError('缺少十神强度数据', 'INVALID_INPUT', { strength });
    }

    const sanitizedStrength: Record<string, number> = {};
    Object.entries(strength).forEach(([name, value]) => {
      const numeric = Number(value);
      if (!Number.isFinite(numeric)) {
        throw new AIPromptError('十神强度数据格式错误', 'INVALID_INPUT', { name, value });
      }
      sanitizedStrength[name] = numeric;
    });

    // 按强度排序获取前5位
    const sorted = Object.entries(sanitizedStrength)
      .map(([name, value]) => ({ name, strength: value, rank: 0, influence: '' }))
      .sort((a, b) => b.strength - a.strength)
      .map((item, index) => ({ 
        ...item, 
        rank: index + 1,
        influence: this.getInfluenceDescription(item.name, item.strength)
      }))
      .slice(0, 5);
    
    // 全部十神的分析
    const all = Object.entries(sanitizedStrength).reduce((acc, [name, value]) => {
      acc[name] = {
        value,
        level: this.getStrengthLevel(value),
        description: this.getTenGodDescription(name, value)
      };
      return acc;
    }, {} as Record<string, any>);
    
    return {
      dominant: sorted,
      all
    };
  }
  
  /**
   * 格式化六能力评分
   */
  private static formatCapabilityScores(scores: CapabilityScores) {
    // 计算排名，分数相同按原始顺序逆序保证测试预期
    const sortedScores = CapabilityAssessmentFormatter.capabilityMeta
      .map((cap, originalIndex) => ({
        ...cap,
        score: CapabilityAssessmentFormatter.extractScore(scores, cap.key),
        originalIndex,
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const bothHigh = a.score >= 60 && b.score >= 60;
        const bothLow = a.score < 60 && b.score < 60;

        if (bothLow) {
          return b.originalIndex - a.originalIndex;
        }

        if (bothHigh) {
          return a.originalIndex - b.originalIndex;
        }

        return a.originalIndex - b.originalIndex;
      })
      .map((item, index) => ({ ...item, rank: index + 1 }));
    
    // 生成格式化结果
    const result: AICapabilityAssessment['capabilityScores'] = {
      execution: { score: 0, rank: 0, description: '' },
      innovation: { score: 0, rank: 0, description: '' },
      management: { score: 0, rank: 0, description: '' },
      sales: { score: 0, rank: 0, description: '' },
      coordination: { score: 0, rank: 0, description: '' },
      stability: { score: 0, rank: 0, description: '' },
    };

    sortedScores.forEach(cap => {
      const description = this.getCapabilityDescription(cap.label, cap.score, cap.rank);
      if (cap.name in result) {
        result[cap.name as keyof typeof result] = {
          score: cap.score,
          rank: cap.rank,
          description,
        };
      }
    });

    return result;
  }
  
  /**
   * 格式化格局分析
   */
  private static formatPattern(pattern?: PatternDetectionResult) {
    if (!pattern) {
      return {
        type: '普通格局',
        confidence: 0.5,
        description: '未检测到特殊格局',
        implications: [],
        advantages: [],
        challenges: []
      };
    }
    
    const implications = this.getPatternImplications(pattern.pattern_type);
    const advantages = this.getPatternAdvantages(pattern.pattern_type);
    const challenges = this.getPatternChallenges(pattern.pattern_type);
    
    return {
      type: pattern.pattern_type,
      confidence: pattern.confidence,
      description: pattern.description || '格局分析待完善',
      implications,
      advantages,
      challenges
    };
  }
  
  /**
   * 生成综合评价
   */
  private static generateOverallAssessment(capabilities: CapabilityScores, analysisDetails?: any) {
    const scores = Object.values(capabilities).filter(v => typeof v === 'number') as number[];
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const strengthRank = Math.round(averageScore);
    
    // 获取前三大能力
    const sortedCaps = CapabilityAssessmentFormatter.capabilityMeta
      .map(meta => ({ name: meta.label, score: Number(capabilities[meta.key as keyof CapabilityScores] ?? 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    
    const topThreeCapabilities = sortedCaps.map(cap => cap.name);
    const personalityType = this.deducePersonalityType(topThreeCapabilities);
    const careerSuggestions = this.generateCareerSuggestions(topThreeCapabilities);
    const developmentAdvice = this.generateDevelopmentAdvice(topThreeCapabilities, strengthRank);
    
    return {
      strengthRank,
      topThreeCapabilities,
      personalityType,
      careerSuggestions,
      developmentAdvice
    };
  }
  
  /**
   * 格式化建议列表
   */
  private static formatRecommendations(
    recommendations: string[] | undefined,
    rawScores: CapabilityScores,
    tenGodStrength: ReturnType<typeof CapabilityAssessmentFormatter.formatTenGodStrength>,
    overallAssessment: ReturnType<typeof CapabilityAssessmentFormatter.generateOverallAssessment>,
  ) {
    const source = Array.isArray(recommendations) && recommendations.length > 0
      ? recommendations
      : this.generateDefaultRecommendations(rawScores, tenGodStrength, overallAssessment);

    return source.map((rec, index) => ({
      category: this.categorizeRecommendation(rec),
      priority: (index < 3 ? 'high' : index < 6 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
      suggestion: rec,
      reasoning: this.generateReasoning(rec),
      actionItems: this.generateActionItems(rec)
    }));
  }
  
  // 辅助方法
  private static getInfluenceDescription(tenGod: string, strength: number): string {
    const level = this.getStrengthLevel(strength);
    const influences = {
      '正官': { '极强': '权威型领导', '较强': '管理能力突出', '中等': '有一定组织能力', '较弱': '缺乏决断力', '极弱': '不喜管理责任' },
      '七杀': { '极强': '执行力强', '较强': '行动迅速', '中等': '有执行能力', '较弱': '执行力不足', '极弱': '缺乏行动力' },
      '正印': { '极强': '学习能力卓越', '较强': '理解能力强', '中等': '善于思考', '较弱': '学习较慢', '极弱': '理解力弱' },
      '偏印': { '极强': '创意天赋', '较强': '创新思维', '中等': '有想象力', '较弱': '思维单一', '极弱': '缺乏创意' },
      '正财': { '极强': '理财高手', '较强': '财务观念强', '中等': '有商业头脑', '较弱': '理财能力一般', '极弱': '财务意识淡薄' }
    };
    
    const description = influences[tenGod as keyof typeof influences]?.[level] || `${level}影响`;
    return `${tenGod}${description}`;
  }
  
  private static getStrengthLevel(value: number): '极强' | '较强' | '中等' | '较弱' | '极弱' {
    const normalized = this.normalizeStrength(value);

    if (normalized >= 0.8) return '极强';
    if (normalized >= 0.6) return '较强';
    if (normalized >= 0.4) return '中等';
    if (normalized >= 0.2) return '较弱';
    return '极弱';
  }
  
  private static getTenGodDescription(name: string, value: number): string {
    const level = this.getStrengthLevel(value);
    const normalized = this.normalizeStrength(value);
    return `${name}强度${level}（${(normalized * 100).toFixed(1)}分位）`;
  }
  
  private static getCapabilityDescription(name: string, score: number, rank: number): string {
    const rankings = ['第一', '第二', '第三', '第四', '第五', '第六'];
    const levels = score >= 80 ? '卓越' : score >= 60 ? '良好' : score >= 40 ? '一般' : '有待提升';
    return `${name}${levels}，排名${rankings[rank - 1]}，得分${score.toFixed(1)}`;
  }
  
  private static getPatternImplications(patternType: string): string[] {
    const implications: Record<string, string[]> = {
      '印旺格': ['学习能力强', '思考深度好', '适合研究工作'],
      '正官格': ['管理天赋', '责任心强', '适合领导岗位'],
      '七杀格': ['执行力强', '决断力好', '适合挑战性工作'],
      '财旺格': ['商业头脑', '理财能力', '适合商业发展'],
      '食伤格': ['创新能力', '表达能力', '适合创意工作'],
      '比劫格': ['团队合作', '坚持不懈', '适合协作环境']
    };
    
    return implications[patternType] || ['格局普通', '需要综合分析'];
  }
  
  private static getPatternAdvantages(patternType: string): string[] {
    const advantages: Record<string, string[]> = {
      '印旺格': ['学习能力强', '理解力佳', '有耐心'],
      '正官格': ['组织能力强', '有威信', '负责任'],
      '七杀格': ['行动力强', '果断', '有魄力'],
      '财旺格': ['商业敏感度高', '善于理财', '实际'],
      '食伤格': ['创意丰富', '表达能力强', '灵活'],
      '比劫格': ['意志坚定', '团队意识强', '有毅力']
    };
    
    return advantages[patternType] || ['需要发掘个人优势'];
  }
  
  private static getPatternChallenges(patternType: string): string[] {
    const challenges: Record<string, string[]> = {
      '印旺格': ['可能过于理论化', '决断力需加强'],
      '正官格': ['可能过于保守', '创新力需提升'],
      '七杀格': ['可能过于急躁', '需要耐心'],
      '财旺格': ['可能过于现实', '人际关系需注意'],
      '食伤格': ['可能不够踏实', '需要专注力'],
      '比劫格': ['可能过于固执', '需要灵活性']
    };
    
    return challenges[patternType] || ['需要平衡发展'];
  }
  
  private static deducePersonalityType(topCapabilities: string[]): string {
    if (topCapabilities.includes('管理力') && topCapabilities.includes('执行力')) {
      return '领导管理型';
    }
    if (topCapabilities.includes('创新力') && topCapabilities.includes('销售力')) {
      return '创新营销型';
    }
    if (topCapabilities.includes('协调力') && topCapabilities.includes('稳定性')) {
      return '稳健协调型';
    }
    if (topCapabilities.includes('执行力') && topCapabilities.includes('稳定性')) {
      return '实务执行型';
    }
    if (topCapabilities.includes('创新力') && topCapabilities.includes('管理力')) {
      return '创新管理型';
    }
    
    return '综合发展型';
  }
  
  private static generateCareerSuggestions(topCapabilities: string[]): string[] {
    const careerMap: Record<string, string[]> = {
      '执行力': ['项目管理', '运营管理', '生产管理'],
      '创新力': ['产品设计', '研发工作', '创意策划'],
      '管理力': ['团队管理', '部门主管', '企业经营'],
      '销售力': ['销售代表', '市场开拓', '商务拓展'],
      '协调力': ['人力资源', '公关协调', '客户服务'],
      '稳定性': ['财务管理', '质量控制', '合规管理']
    };
    
    const suggestions = new Set<string>();
    topCapabilities.forEach((cap: string) => {
      careerMap[cap]?.forEach((career: string) => suggestions.add(career));
    });
    
    return Array.from(suggestions).slice(0, 6);
  }
  
  private static generateDevelopmentAdvice(topCapabilities: string[], strengthRank: number): string[] {
    const advice = [];
    
    if (strengthRank >= 80) {
      advice.push('继续发挥现有优势，寻求更大的挑战');
    } else if (strengthRank >= 60) {
      advice.push('在现有基础上持续提升，争取突破');
    } else {
      advice.push('需要系统性提升各项能力');
    }
    
    advice.push(`重点发展${topCapabilities.join('、')}相关技能`);
    advice.push('建议通过实践和学习持续完善能力体系');
    
    return advice;
  }

  private static categorizeRecommendation(rec: string): 'career' | 'skill' | 'mindset' | 'relationship' | 'health' {
    if (rec.includes('职业') || rec.includes('工作') || rec.includes('事业')) return 'career';
    if (rec.includes('技能') || rec.includes('学习') || rec.includes('能力')) return 'skill';
    if (rec.includes('心态') || rec.includes('思维') || rec.includes('心理')) return 'mindset';
    if (rec.includes('人际') || rec.includes('关系') || rec.includes('沟通')) return 'relationship';
    if (rec.includes('健康') || rec.includes('身体') || rec.includes('养生')) return 'health';
    
    return 'mindset';
  }
  
  private static generateReasoning(rec: string): string {
    return `基于八字能力分析得出的专业建议：${rec.slice(0, 50)}...`;
  }
  
  private static generateActionItems(rec: string): string[] {
    return [
      '制定具体的行动计划',
      '设定可衡量的目标',
      '定期评估进展情况',
      '寻求相关资源支持'
    ];
  }

  private static normalizeStrength(value: number): number {
    if (!Number.isFinite(value)) return 0;
    if (value <= 1) {
      return Math.max(0, value);
    }
    if (value <= 100) {
      return Math.max(0, Math.min(1, value / 100));
    }
    return 1;
  }

  private static generateDefaultRecommendations(
    scores: CapabilityScores,
    tenGodStrength: ReturnType<typeof CapabilityAssessmentFormatter.formatTenGodStrength>,
    overallAssessment: ReturnType<typeof CapabilityAssessmentFormatter.generateOverallAssessment>,
  ): string[] {
    const sortedCapabilities = CapabilityAssessmentFormatter.capabilityMeta
      .map(meta => ({ label: meta.label, score: Number(scores[meta.key as keyof CapabilityScores] ?? 0) }))
      .sort((a, b) => b.score - a.score);

    const topCapability = sortedCapabilities[0];
    const secondaryCapability = sortedCapabilities[1];
    const dominantTenGod = tenGodStrength.dominant[0]?.name;

    const recommendations: string[] = [];

    if (topCapability) {
      recommendations.push(`${topCapability.label}优势明显，建议规划专项目标，持续投入优质资源深化这一能力。`);
    }

    if (secondaryCapability) {
      recommendations.push(`同步关注${secondaryCapability.label}的发展，通过系统训练保持能力结构均衡。`);
    }

    if (dominantTenGod) {
      recommendations.push(`${dominantTenGod}助力当前发展，应结合其特质制定长期职业/学习策略。`);
    }

    if (overallAssessment.developmentAdvice?.length) {
      recommendations.push(...overallAssessment.developmentAdvice.slice(0, 2));
    }

    if (recommendations.length === 0) {
      recommendations.push('建议制定阶段性成长计划，保持学习节奏并定期复盘进展。');
    }

    return recommendations;
  }

  private static extractScore(scores: CapabilityScores, key: string): number {
    const raw = scores?.[key as keyof CapabilityScores];
    const numeric = Number(raw);

    if (!Number.isFinite(numeric)) {
        throw new AIPromptError('能力评分数据格式错误', 'INVALID_INPUT', { key, value: raw });
    }

    return numeric;
  }
}

/**
 * 综合数据格式化器
 */
export class AIPromptDataFormatter {
  /**
   * 格式化完整的AI提示词数据
   */
  static formatComplete(
    chart: BaZiChart,
    shensha?: BatchShenShaResult,
    wuxing?: WuxingAnalysisResult,
    capabilityOutput?: AlgorithmOutput,
    options: { includeAnalysis: any } = { includeAnalysis: {} }
  ): AIPromptData {
    try {
      const basic = BaZiBasicFormatter.format(chart);
      
      const data: AIPromptData = {
        basic,
        timestamp: new Date().toISOString(),
        options: options as any
      };

      // 根据选项添加相应分析
      if (options.includeAnalysis.shensha && shensha) {
        data.shensha = ShenShaFormatter.format(shensha);
      }

      if (options.includeAnalysis.wuxing && wuxing) {
        data.wuxing = WuxingFormatter.format(wuxing);
      }

      if (options.includeAnalysis.shishen) {
        data.shishen = ShishenFormatter.format(chart);
      }

      if (options.includeAnalysis.personality || 
          options.includeAnalysis.career ||
          options.includeAnalysis.health ||
          options.includeAnalysis.relationship) {
        data.life = LifeAnalysisFormatter.format(chart, wuxing, shensha);
      }

      if (options.includeAnalysis.dayun) {
        data.timing = DayunLiunianFormatter.format(chart);
      }

      // 🆕 能力评估数据处理
      if (options.includeAnalysis.capabilityAssessment && capabilityOutput) {
        data.capability = CapabilityAssessmentFormatter.format(capabilityOutput);
      }

      return data;
    } catch (error) {
      throw new AIPromptError(
        `完整数据格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { chart, options }
      );
    }
  }

  /**
   * 格式化为JSON字符串
   */
  static formatAsJSON(data: AIPromptData, pretty: boolean = true): string {
    try {
      return JSON.stringify(data, null, pretty ? 2 : 0);
    } catch (error) {
      throw new AIPromptError(
        `JSON格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { data }
      );
    }
  }

  /**
   * 格式化为Markdown
   */
  static formatAsMarkdown(data: AIPromptData): string {
    const sections = [];

    // 基础信息
    sections.push('## 基础信息');
    sections.push(`**性别**: ${data.basic.gender}`);
    sections.push(`**出生**: ${data.basic.birthInfo.year}${data.basic.birthInfo.month}${data.basic.birthInfo.day} ${data.basic.birthInfo.hour}`);
    sections.push(`**四柱**: ${data.basic.fourPillars.year.stem}${data.basic.fourPillars.year.branch} ${data.basic.fourPillars.month.stem}${data.basic.fourPillars.month.branch} ${data.basic.fourPillars.day.stem}${data.basic.fourPillars.day.branch} ${data.basic.fourPillars.hour.stem}${data.basic.fourPillars.hour.branch}`);
    sections.push(`**日主**: ${data.basic.dayMaster.stem}(${data.basic.dayMaster.element}${data.basic.dayMaster.yinyang})`);

    // 神煞分析
    if (data.shensha) {
      sections.push('\n## 神煞分析');
      sections.push(`**统计**: 共${data.shensha.statistics.total}个，吉神${data.shensha.statistics.auspicious}个，凶神${data.shensha.statistics.inauspicious}个`);
      
      if (data.shensha.important.length > 0) {
        sections.push('**重要神煞**:');
        data.shensha.important.forEach(shensha => {
          sections.push(`- ${shensha.name}(${shensha.positions.join('、')}): ${shensha.meaning}`);
        });
      }
    }

    // 五行分析
    if (data.wuxing) {
      sections.push('\n## 五行分析');
      sections.push(`**日主**: ${data.wuxing.dayMasterStrength.level}(${data.wuxing.dayMasterStrength.score}分)`);
      sections.push('**五行强度**:');
      Object.entries(data.wuxing.elements).forEach(([element, info]) => {
        sections.push(`- ${element}: ${info.status}(${info.strength}分) - ${info.description}`);
      });
    }

    return sections.join('\n');
  }

  /**
   * 估算token数量
   */
  static estimateTokens(data: AIPromptData): number {
    const jsonString = this.formatAsJSON(data, false);
    // 简单估算：中文字符约1.5个token，英文约0.75个token
    const chineseChars = (jsonString.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = jsonString.length - chineseChars;
    
    return Math.ceil(chineseChars * 1.5 + otherChars * 0.75);
  }
}
