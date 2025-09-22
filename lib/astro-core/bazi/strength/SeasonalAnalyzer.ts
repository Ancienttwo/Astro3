/**
 * 季节分析器
 * 负责分析月令季节对五行强弱的影响
 */

import { WuxingElement, SeasonType, SeasonalInfluence, DetailedWuxingScores, WuxingCounts, ISeasonalAnalyzer } from './types';
import { SEASON_MAP, SEASONAL_STRENGTH, SEASON_CHINESE, SPECIAL_CASES } from './constants';

export class SeasonalAnalyzer implements ISeasonalAnalyzer {
  /**
   * 分析季节影响
   */
  async analyze(
    monthBranch: string, 
    scores: DetailedWuxingScores, 
    counts: WuxingCounts
  ): Promise<SeasonalInfluence> {
    const currentSeason = this.getSeason(monthBranch);
    const seasonalStrengths = SEASONAL_STRENGTH[currentSeason];
    const exemptElements = this.getExemptElements(counts);
    
    // 应用季节影响到评分
    this.applySeasonalInfluence(scores, seasonalStrengths, exemptElements);
    
    const description = this.generateSeasonDescription(currentSeason, exemptElements);
    
    return {
      currentSeason,
      seasonalStrengths,
      exemptElements,
      description
    };
  }

  /**
   * 根据月支获取季节
   */
  private getSeason(monthBranch: string): SeasonType {
    return SEASON_MAP[monthBranch] || 'earth';
  }

  /**
   * 获取免受季节影响的五行（成势的五行）
   */
  private getExemptElements(counts: WuxingCounts): WuxingElement[] {
    const exemptElements: WuxingElement[] = [];
    const total = Object.values(counts.totalCount).reduce((sum, count) => sum + count, 0);
    
    // 检查每个五行是否成势（占比超过40%）
    Object.entries(counts.totalCount).forEach(([element, count]) => {
      const ratio = count / total;
      if (ratio > 0.4) {
        exemptElements.push(element as WuxingElement);
      }
    });
    
    return exemptElements;
  }

  /**
   * 应用季节影响到评分
   */
  private applySeasonalInfluence(
    scores: DetailedWuxingScores, 
    seasonalStrengths: { [key in WuxingElement]: number },
    exemptElements: WuxingElement[]
  ): void {
    const elements: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    
    elements.forEach(element => {
      if (exemptElements.includes(element)) {
        // 成势的五行免受季节影响
        scores[element].seasonal = 0;
      } else {
        // 计算季节影响分数
        const basicScore = scores[element].basic;
        const seasonalMultiplier = seasonalStrengths[element];
        const seasonalBonus = basicScore * (seasonalMultiplier - 1);
        
        scores[element].seasonal = seasonalBonus;
      }
      
      // 更新总分
      scores[element].total = 
        scores[element].basic + 
        scores[element].shengke + 
        scores[element].combination + 
        scores[element].conflict + 
        scores[element].transparency + 
        scores[element].seasonal;
    });

    // 应用特殊处理
    this.applySpecialSeasonalCases(scores);
  }

  /**
   * 应用特殊季节处理情况
   */
  private applySpecialSeasonalCases(scores: DetailedWuxingScores): void {
    // 未月土基数特殊处理
    if (SPECIAL_CASES.weiMonthEarthReduction) {
      scores.earth.seasonal *= SPECIAL_CASES.weiMonthEarthReduction;
      scores.earth.total = 
        scores.earth.basic + 
        scores.earth.shengke + 
        scores.earth.combination + 
        scores.earth.conflict + 
        scores.earth.transparency + 
        scores.earth.seasonal;
    }
  }

  /**
   * 生成季节描述
   */
  private generateSeasonDescription(season: SeasonType, exemptElements: WuxingElement[]): string {
    const seasonName = SEASON_CHINESE[season];
    let description = `当前为${seasonName}，`;

    switch (season) {
      case 'spring':
        description += '木旺、火相、水休、金囚、土死。';
        break;
      case 'summer':
        description += '火旺、土相、木休、水囚、金死。';
        break;
      case 'autumn':
        description += '金旺、水相、土休、火囚、木死。';
        break;
      case 'winter':
        description += '水旺、木相、金休、土囚、火死。';
        break;
      case 'earth':
        description += '土旺、金相、火休、木囚、水死。';
        break;
    }

    if (exemptElements.length > 0) {
      const exemptNames = exemptElements.map(element => {
        const mapping = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
        return mapping[element];
      }).join('、');
      description += `但${exemptNames}成势，不受季节影响。`;
    }

    return description;
  }

  /**
   * 获取当令五行
   */
  getSeasonalRuler(season: SeasonType): WuxingElement {
    switch (season) {
      case 'spring': return 'wood';
      case 'summer': return 'fire';
      case 'autumn': return 'metal';
      case 'winter': return 'water';
      case 'earth': return 'earth';
      default: return 'earth';
    }
  }

  /**
   * 判断五行是否当令
   */
  isInSeason(element: WuxingElement, season: SeasonType): boolean {
    return this.getSeasonalRuler(season) === element;
  }

  /**
   * 获取季节强度等级
   */
  getSeasonalStrengthLevel(element: WuxingElement, season: SeasonType): 'strong' | 'moderate' | 'weak' | 'very-weak' {
    const strength = SEASONAL_STRENGTH[season][element];
    
    if (strength >= 1.0) return 'strong';      // 旺
    if (strength >= 0.7) return 'moderate';    // 相
    if (strength >= 0.3) return 'weak';        // 休
    return 'very-weak';                        // 囚死
  }
}