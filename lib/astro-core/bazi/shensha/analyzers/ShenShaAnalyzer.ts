/**
 * 神煞分析器
 * 负责分析检测结果，提供详细的影响分析和建议
 */

import {
  IShenShaAnalyzer,
  ShenShaDetectionResult,
  ShenShaAnalysisResult,
  BatchShenShaResult,
  ShenShaInput,
  ShenShaInfo,
  ShenShaCategory,
  ShenShaGroup,
  ShenShaError
} from '../types';

export class ShenShaAnalyzer implements IShenShaAnalyzer {
  public name = 'DefaultShenShaAnalyzer';
  
  private impactTemplates: Map<string, {
    positive: string[];
    negative: string[];
    neutral: string[];
  }> = new Map();
  
  private resolutionMethods: Map<string, string[]> = new Map();
  
  constructor() {
    this.initializeImpactTemplates();
    this.initializeResolutionMethods();
  }
  
  /**
   * 分析单个神煞检测结果
   */
  public analyze(detection: ShenShaDetectionResult, input: ShenShaInput): ShenShaAnalysisResult {
    try {
      // 获取神煞信息（这里需要从检测器获取，暂时使用默认值）
      const info = this.getDefaultShenShaInfo(detection.name);
      
      // 计算综合评分
      const score = this.calculateScore(detection, info, input);
      
      // 生成影响分析
      const impact = this.generateImpact(detection.name, info, input);
      
      // 获取激活条件
      const activationConditions = this.getActivationConditions(detection, input);
      
      // 获取化解方法
      const resolutionMethods = this.getResolutionMethods(detection.name, info.category);
      
      return {
        detection,
        info,
        score,
        impact,
        activationConditions,
        resolutionMethods
      };
    } catch (error) {
      throw new ShenShaError(
        `神煞分析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'ANALYSIS_ERROR',
        { detection, input }
      );
    }
  }
  
  /**
   * 批量分析神煞检测结果
   */
  public batchAnalyze(detections: ShenShaDetectionResult[], input: ShenShaInput): BatchShenShaResult {
    try {
      // 分析每个检测结果
      const detectedShenSha = detections
        .filter(detection => detection.hasIt)
        .map(detection => this.analyze(detection, input));
      
      // 按类别分组
      const byCategory: Record<ShenShaCategory, ShenShaAnalysisResult[]> = {
        auspicious: [],
        inauspicious: [],
        neutral: [],
        mixed: []
      };
      
      // 按分组分类
      const byGroup: Record<ShenShaGroup, ShenShaAnalysisResult[]> = {
        nobleman: [],
        peachBlossom: [],
        wealth: [],
        academic: [],
        health: [],
        relationship: [],
        career: [],
        disaster: [],
        punishment: [],
        general: []
      };
      
      // 重要神煞
      const important: ShenShaAnalysisResult[] = [];
      
      // 分类整理
      for (const result of detectedShenSha) {
        // 按类别分组
        byCategory[result.info.category].push(result);
        
        // 按分组分类
        byGroup[result.info.group].push(result);
        
        // 重要神煞
        if (result.info.isImportant) {
          important.push(result);
        }
      }
      
      // 计算统计信息
      const statistics = this.calculateStatistics(detectedShenSha);
      
      // 生成综合分析
      const overallAnalysis = this.generateOverallAnalysis(detectedShenSha, statistics);
      
      return {
        detectedShenSha,
        byCategory,
        byGroup,
        important,
        statistics,
        overallAnalysis
      };
    } catch (error) {
      throw new ShenShaError(
        `批量神煞分析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'ANALYSIS_ERROR',
        { detections, input }
      );
    }
  }
  
  /**
   * 获取分析建议
   */
  public getRecommendations(results: ShenShaAnalysisResult[]): string[] {
    const recommendations: string[] = [];
    
    // 基于重要神煞的建议
    const important = results.filter(r => r.info.isImportant);
    if (important.length > 0) {
      recommendations.push(`命中有${important.length}个重要神煞，需要重点关注其影响和作用。`);
    }
    
    // 基于吉凶比例的建议
    const auspicious = results.filter(r => r.info.category === 'auspicious');
    const inauspicious = results.filter(r => r.info.category === 'inauspicious');
    
    if (auspicious.length > inauspicious.length) {
      recommendations.push('命带较多吉神，整体运势较好，应善用贵人机会。');
    } else if (inauspicious.length > auspicious.length) {
      recommendations.push('命带较多凶神，需要注意化解，多行善积德。');
    } else {
      recommendations.push('吉凶神煞并存，需要平衡发展，趋吉避凶。');
    }
    
    // 基于分组的建议
    const groupCounts = this.getGroupCounts(results);
    for (const [group, count] of Object.entries(groupCounts)) {
      if (count >= 3) {
        switch (group) {
          case 'nobleman':
            recommendations.push('贵人运强，多与有德有才之人交往。');
            break;
          case 'peachBlossom':
            recommendations.push('桃花运旺，需注意感情处理，避免纠纷。');
            break;
          case 'wealth':
            recommendations.push('财运神煞多现，适合经商理财。');
            break;
          case 'academic':
            recommendations.push('文昌运佳，利于学习深造和文化事业。');
            break;
          case 'disaster':
            recommendations.push('灾煞较多，需要谨慎小心，多做防范。');
            break;
        }
      }
    }
    
    return recommendations;
  }
  
  /**
   * 计算神煞综合评分
   */
  private calculateScore(detection: ShenShaDetectionResult, info: ShenShaInfo, input: ShenShaInput): number {
    let baseScore = info.strength * 10; // 基础分数 (0-100)
    
    // 根据出现位置调整分数
    const positionBonus = this.calculatePositionBonus(detection, input);
    baseScore += positionBonus;
    
    // 根据类别调整分数
    const categoryMultiplier = this.getCategoryMultiplier(info.category);
    baseScore *= categoryMultiplier;
    
    // 根据重要性调整分数
    if (info.isImportant) {
      baseScore += 10;
    }
    
    // 确保分数在合理范围内
    return Math.max(0, Math.min(100, baseScore));
  }
  
  /**
   * 计算位置加成
   */
  private calculatePositionBonus(detection: ShenShaDetectionResult, input: ShenShaInput): number {
    let bonus = 0;
    
    for (const position of detection.positions) {
      // 年柱和日柱的神煞影响力更大
      if (position.pillar === 'year' || position.pillar === 'day') {
        bonus += 5;
      }
      // 月柱和时柱次之
      else if (position.pillar === 'month' || position.pillar === 'hour') {
        bonus += 3;
      }
    }
    
    // 多个位置出现的神煞影响力更强
    if (detection.positions.length > 1) {
      bonus += detection.positions.length * 2;
    }
    
    return bonus;
  }
  
  /**
   * 获取类别系数
   */
  private getCategoryMultiplier(category: ShenShaCategory): number {
    switch (category) {
      case 'auspicious': return 1.2;
      case 'inauspicious': return 1.1;
      case 'mixed': return 1.0;
      case 'neutral': return 0.9;
      default: return 1.0;
    }
  }
  
  /**
   * 生成影响分析
   */
  private generateImpact(shenShaName: string, info: ShenShaInfo, input: ShenShaInput): {
    positive: string[];
    negative: string[];
    neutral: string[];
  } {
    const template = this.impactTemplates.get(shenShaName);
    if (template) {
      return { ...template };
    }
    
    // 使用默认模板
    return this.getDefaultImpact(info);
  }
  
  /**
   * 获取激活条件
   */
  private getActivationConditions(detection: ShenShaDetectionResult, input: ShenShaInput): string[] {
    const conditions: string[] = [];
    
    // 基于出现位置的条件
    for (const position of detection.positions) {
      let pillarName = '';
      switch (position.pillar) {
        case 'year': pillarName = '年柱'; break;
        case 'month': pillarName = '月柱'; break;
        case 'day': pillarName = '日柱'; break;
        case 'hour': pillarName = '时柱'; break;
      }
      
      if (position.stem && position.branch) {
        conditions.push(`${pillarName}为${position.stem}${position.branch}`);
      } else if (position.stem) {
        conditions.push(`${pillarName}天干为${position.stem}`);
      } else if (position.branch) {
        conditions.push(`${pillarName}地支为${position.branch}`);
      }
    }
    
    return conditions;
  }
  
  /**
   * 获取化解方法
   */
  private getResolutionMethods(shenShaName: string, category: ShenShaCategory): string[] {
    // 吉神不需要化解
    if (category === 'auspicious') {
      return ['此为吉神，无需化解，应善用其力'];
    }
    
    const methods = this.resolutionMethods.get(shenShaName);
    if (methods) {
      return [...methods];
    }
    
    // 使用默认化解方法
    return this.getDefaultResolutionMethods(category);
  }
  
  /**
   * 计算统计信息
   */
  private calculateStatistics(results: ShenShaAnalysisResult[]): {
    total: number;
    auspicious: number;
    inauspicious: number;
    neutral: number;
    mixed: number;
    averageStrength: number;
    totalScore: number;
  } {
    const total = results.length;
    let auspicious = 0;
    let inauspicious = 0;
    let neutral = 0;
    let mixed = 0;
    let totalStrength = 0;
    let totalScore = 0;
    
    for (const result of results) {
      switch (result.info.category) {
        case 'auspicious': auspicious++; break;
        case 'inauspicious': inauspicious++; break;
        case 'neutral': neutral++; break;
        case 'mixed': mixed++; break;
      }
      
      totalStrength += result.info.strength;
      totalScore += result.score;
    }
    
    return {
      total,
      auspicious,
      inauspicious,
      neutral,
      mixed,
      averageStrength: total > 0 ? totalStrength / total : 0,
      totalScore
    };
  }
  
  /**
   * 生成综合分析
   */
  private generateOverallAnalysis(results: ShenShaAnalysisResult[], statistics: any): {
    summary: string;
    dominantCategory: ShenShaCategory;
    keyFindings: string[];
    recommendations: string[];
  } {
    // 确定主导类别
    let dominantCategory: ShenShaCategory = 'neutral';
    let maxCount = 0;
    
    if (statistics.auspicious > maxCount) {
      dominantCategory = 'auspicious';
      maxCount = statistics.auspicious;
    }
    if (statistics.inauspicious > maxCount) {
      dominantCategory = 'inauspicious';
      maxCount = statistics.inauspicious;
    }
    if (statistics.mixed > maxCount) {
      dominantCategory = 'mixed';
      maxCount = statistics.mixed;
    }
    if (statistics.neutral > maxCount) {
      dominantCategory = 'neutral';
      maxCount = statistics.neutral;
    }
    
    // 生成摘要
    let summary = `命主共有${statistics.total}个神煞，`;
    if (statistics.auspicious > 0) {
      summary += `其中吉神${statistics.auspicious}个`;
    }
    if (statistics.inauspicious > 0) {
      summary += `${statistics.auspicious > 0 ? '，' : ''}凶神${statistics.inauspicious}个`;
    }
    if (statistics.neutral > 0) {
      summary += `${statistics.auspicious > 0 || statistics.inauspicious > 0 ? '，' : ''}中性神煞${statistics.neutral}个`;
    }
    summary += `。整体以${this.getCategoryName(dominantCategory)}为主。`;
    
    // 关键发现
    const keyFindings: string[] = [];
    
    // 重要神煞
    const important = results.filter(r => r.info.isImportant);
    if (important.length > 0) {
      keyFindings.push(`发现${important.length}个重要神煞：${important.map(r => r.info.name).join('、')}`);
    }
    
    // 高分神煞
    const highScore = results.filter(r => r.score >= 80);
    if (highScore.length > 0) {
      keyFindings.push(`高分神煞${highScore.length}个，影响力较强`);
    }
    
    // 多位置神煞
    const multiPosition = results.filter(r => r.detection.positions.length > 1);
    if (multiPosition.length > 0) {
      keyFindings.push(`${multiPosition.length}个神煞在多个柱位出现，力量增强`);
    }
    
    // 获取建议
    const recommendations = this.getRecommendations(results);
    
    return {
      summary,
      dominantCategory,
      keyFindings,
      recommendations
    };
  }
  
  /**
   * 获取分组统计
   */
  private getGroupCounts(results: ShenShaAnalysisResult[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const result of results) {
      const group = result.info.group;
      counts[group] = (counts[group] || 0) + 1;
    }
    
    return counts;
  }
  
  /**
   * 获取类别中文名称
   */
  private getCategoryName(category: ShenShaCategory): string {
    switch (category) {
      case 'auspicious': return '吉神';
      case 'inauspicious': return '凶神';
      case 'mixed': return '吉凶混合';
      case 'neutral': return '中性';
      default: return '未知';
    }
  }
  
  /**
   * 获取默认神煞信息（临时实现）
   */
  private getDefaultShenShaInfo(name: string): ShenShaInfo {
    // 这里应该从神煞信息数据库获取，临时使用默认值
    return {
      name,
      category: 'neutral',
      group: 'general',
      description: '神煞描述待完善',
      strength: 5,
      isImportant: false
    };
  }
  
  /**
   * 获取默认影响分析
   */
  private getDefaultImpact(info: ShenShaInfo): {
    positive: string[];
    negative: string[];
    neutral: string[];
  } {
    switch (info.category) {
      case 'auspicious':
        return {
          positive: ['带来好运', '得贵人相助', '事业顺利'],
          negative: [],
          neutral: ['需要善用机会']
        };
      case 'inauspicious':
        return {
          positive: [],
          negative: ['可能遇到阻碍', '需要谨慎行事', '容易遇到小人'],
          neutral: ['通过努力可以化解']
        };
      default:
        return {
          positive: ['可能带来机会'],
          negative: ['需要注意风险'],
          neutral: ['影响因人而异']
        };
    }
  }
  
  /**
   * 获取默认化解方法
   */
  private getDefaultResolutionMethods(category: ShenShaCategory): string[] {
    switch (category) {
      case 'inauspicious':
        return [
          '多行善积德',
          '佩戴相应的护身符',
          '选择合适的方位和时间',
          '保持积极心态'
        ];
      case 'mixed':
        return [
          '趋吉避凶',
          '把握有利时机',
          '避免不利环境'
        ];
      default:
        return ['保持平常心，顺其自然'];
    }
  }
  
  /**
   * 初始化影响分析模板
   */
  private initializeImpactTemplates(): void {
    // 天乙贵人
    this.impactTemplates.set('天乙贵人', {
      positive: [
        '遇事多有贵人相助',
        '逢凶化吉，遇难成祥',
        '社交能力强，人缘好',
        '容易得到上级和长辈的赏识',
        '在困难时期能得到及时帮助'
      ],
      negative: [],
      neutral: [
        '需要主动结交有德有才之人',
        '平时要积德行善，培养人脉',
        '不可过分依赖他人，也要自强不息'
      ]
    });
    
    // 桃花
    this.impactTemplates.set('桃花', {
      positive: [
        '异性缘佳，容易获得异性好感',
        '人缘好，社交活跃',
        '具有魅力和吸引力'
      ],
      negative: [
        '容易卷入感情纠纷',
        '可能有多角恋情况',
        '需要注意感情专一'
      ],
      neutral: [
        '应当理性处理感情问题',
        '避免感情用事',
        '保持良好的道德品行'
      ]
    });
  }
  
  /**
   * 初始化化解方法
   */
  private initializeResolutionMethods(): void {
    // 桃花化解
    this.resolutionMethods.set('桃花', [
      '佩戴红色或粉色水晶',
      '房间内放置鲜花',
      '避免过于暴露的穿着',
      '保持理性，不要感情用事'
    ]);
    
    // 劫煞化解
    this.resolutionMethods.set('劫煞', [
      '佩戴护身符',
      '多行善事，积累福德',
      '避免去危险场所',
      '出行时选择吉利方位和时间'
    ]);
  }
}