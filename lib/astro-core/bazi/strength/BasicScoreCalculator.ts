/**
 * 基础评分计算器
 * 负责计算天干和地支藏干的基础得分
 */

import { WuxingElement, WuxingScores, WuxingCounts, ScoreBreakdown, DetailedWuxingScores, IBasicScoreCalculator } from './types';
import { TIANGAN_WUXING, DIZHI_CANGGAN } from './constants';

export class BasicScoreCalculator implements IBasicScoreCalculator {
  /**
   * 计算基础得分（天干 + 地支藏干）
   */
  async calculate(bazi: string[]): Promise<{ scores: DetailedWuxingScores; counts: WuxingCounts }> {
    if (bazi.length !== 8) {
      throw new Error('八字必须包含8个字符：年干支、月干支、日干支、时干支');
    }

    const tianganCount = this.calculateTianganCount(bazi);
    const { cangganCount, benqiCount } = this.calculateCangganCount(bazi);
    const totalCount = this.calculateTotalCount(tianganCount, cangganCount);

    // 计算基础得分
    const basicScores = this.calculateBasicScores(tianganCount, cangganCount);
    
    // 初始化详细评分结构
    const detailedScores: DetailedWuxingScores = {
      wood: { basic: basicScores.wood, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: basicScores.wood },
      fire: { basic: basicScores.fire, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: basicScores.fire },
      earth: { basic: basicScores.earth, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: basicScores.earth },
      metal: { basic: basicScores.metal, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: basicScores.metal },
      water: { basic: basicScores.water, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: basicScores.water }
    };

    const counts: WuxingCounts = {
      tianganCount,
      cangganCount,
      benqiCount,
      totalCount
    };

    return { scores: detailedScores, counts };
  }

  /**
   * 计算天干五行数量
   */
  private calculateTianganCount(bazi: string[]): WuxingScores {
    const count: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    // 天干位置：0, 2, 4, 6
    for (let i = 0; i < 8; i += 2) {
      const tiangan = bazi[i];
      const element = TIANGAN_WUXING[tiangan];
      if (element) {
        count[element]++;
      }
    }
    
    return count;
  }

  /**
   * 计算地支藏干数量
   */
  private calculateCangganCount(bazi: string[]): { cangganCount: WuxingScores; benqiCount: WuxingScores } {
    const cangganCount: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    const benqiCount: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    // 地支位置：1, 3, 5, 7
    for (let i = 1; i < 8; i += 2) {
      const dizhi = bazi[i];
      const canggan = DIZHI_CANGGAN[dizhi];
      
      if (canggan) {
        for (const [stem, info] of Object.entries(canggan)) {
          const element = info.element;
          const weight = info.weight;
          
          // 累计藏干数量（按权重）
          cangganCount[element] += weight;
          
          // 本气藏干（权重为1.0的）
          if (weight === 1.0) {
            benqiCount[element]++;
          }
        }
      }
    }
    
    return { cangganCount, benqiCount };
  }

  /**
   * 计算总数量（天干 + 藏干）
   */
  private calculateTotalCount(tianganCount: WuxingScores, cangganCount: WuxingScores): WuxingScores {
    return {
      wood: tianganCount.wood + cangganCount.wood,
      fire: tianganCount.fire + cangganCount.fire,
      earth: tianganCount.earth + cangganCount.earth,
      metal: tianganCount.metal + cangganCount.metal,
      water: tianganCount.water + cangganCount.water
    };
  }

  /**
   * 根据数量计算基础得分
   */
  private calculateBasicScores(tianganCount: WuxingScores, cangganCount: WuxingScores): WuxingScores {
    const scores: WuxingScores = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    
    // 天干得分（每个天干10分）
    scores.wood += tianganCount.wood * 10;
    scores.fire += tianganCount.fire * 10;
    scores.earth += tianganCount.earth * 10;
    scores.metal += tianganCount.metal * 10;
    scores.water += tianganCount.water * 10;
    
    // 地支藏干得分（按权重计算）
    scores.wood += cangganCount.wood * 10;
    scores.fire += cangganCount.fire * 10;
    scores.earth += cangganCount.earth * 10;
    scores.metal += cangganCount.metal * 10;
    scores.water += cangganCount.water * 10;
    
    return scores;
  }

  /**
   * 获取日主五行
   */
  getDayMasterElement(bazi: string[]): WuxingElement {
    const dayMasterStem = bazi[4]; // 日干
    return TIANGAN_WUXING[dayMasterStem] || 'wood';
  }

  /**
   * 获取月令地支
   */
  getMonthBranch(bazi: string[]): string {
    return bazi[3]; // 月支
  }

  /**
   * 计算五行是否成势（某五行占主导地位）
   */
  calculateElementDominance(counts: WuxingCounts): { 
    isDominant: boolean; 
    dominantElement?: WuxingElement;
    dominanceRatio?: number;
  } {
    const total = Object.values(counts.totalCount).reduce((sum, count) => sum + count, 0);
    if (total === 0) return { isDominant: false };

    // 找到最多的五行
    let maxElement: WuxingElement = 'wood';
    let maxCount = counts.totalCount.wood;

    for (const [element, count] of Object.entries(counts.totalCount)) {
      if (count > maxCount) {
        maxElement = element as WuxingElement;
        maxCount = count;
      }
    }

    const dominanceRatio = maxCount / total;

    // 如果某五行占比超过50%，认为成势
    return {
      isDominant: dominanceRatio > 0.5,
      dominantElement: dominanceRatio > 0.5 ? maxElement : undefined,
      dominanceRatio
    };
  }
}