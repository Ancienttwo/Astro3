/**
 * ZiWei Migration Adapter
 * 紫微斗数迁移适配器
 * 
 * This adapter provides a bridge between the old ziwei-old.tsx implementation
 * and the new @astroall/ziwei-core architecture.
 */

import { ZiWeiFacade } from '../facade/ziwei-facade';
import type { BirthInfo, LunarDate, CompleteChart } from '../types/core';

/**
 * Adapter for generateStarsForPalace function
 * 适配 generateStarsForPalace 函数
 * 
 * Maps the old function signature to the new architecture
 */
export class ZiWeiMigrationAdapter {
  private facade: ZiWeiFacade;
  private cachedChart: CompleteChart | null = null;
  private cachedLunarDate: LunarDate | null = null;

  constructor() {
    this.facade = new ZiWeiFacade();
  }

  /**
   * Replace the old generateStarsForPalace function
   * 替换旧的 generateStarsForPalace 函数
   * 
   * @param branchIndex - Palace branch index (0-11)
   * @param completeStarData - Old star data format (will be ignored, using new calculation)
   * @param yearGan - Year stem for sihua calculation
   * @param palaceStems - Palace stems array for self-transformation
   * @returns Array of stars in the old format
   */
  public generateStarsForPalace(
    branchIndex: number,
    completeStarData?: any,
    yearGan?: string,
    palaceStems?: string[]
  ): any[] {
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const currentBranch = branches[branchIndex];

    // If no cached chart, try to initialize from completeStarData if it has lunarDate
    if (!this.cachedChart) {
      if (completeStarData?.lunarDate) {
        console.log('[Migration Adapter] Auto-initializing from lunarDate in completeStarData');
        this.setChartDataFromLunarDate(completeStarData.lunarDate);
      } else {
        console.warn('[Migration Adapter] No cached chart available. Returning empty array.');
        return [];
      }
    }
    
    if (!this.cachedChart || !this.cachedLunarDate) {
      return [];
    }

    // Find the palace by branch
    const palace = Array.from(this.cachedChart.palaces.values()).find(p => {
      // Map palace index to branch
      const palaceBranchIndex = this.getPalaceBranchIndex(p.index, this.cachedChart!.lifePalaceIndex);
      return palaceBranchIndex === branchIndex;
    });

    if (!palace) {
      console.warn(`[Migration Adapter] No palace found for branch index ${branchIndex}`);
      return [];
    }

    // Convert stars to old format
    return palace.stars.map(star => {
      const processedStar: any = {
        name: star.name,
        type: star.category === '主星' ? 'main' : star.category,
        brightness: star.brightness,
        position: branchIndex,
        branch: currentBranch,
        // Sihua properties
        sihua: null,
        selfSihua: null,
        isInwardTransformation: false,
        isOutwardTransformation: false,
        sihuaType: null,
        sihuaSource: null
      };

      // Map sihua transformations
      if (star.sihuaTransformations && star.sihuaTransformations.length > 0) {
        const sihua = star.sihuaTransformations[0]; // Take first transformation
        if (sihua.source === 'birth') {
          processedStar.sihua = this.sihuaTypeToLetter(sihua.type);
          processedStar.sihuaType = sihua.type;
          processedStar.sihuaSource = 'natal';
        }
      }

      // Map self-transformations
      palace.selfTransformations.forEach(trans => {
        if (trans.star === star.name) {
          if (trans.direction === 'outward') {
            processedStar.selfSihua = `x${trans.type.charAt(0).toUpperCase()}`;
            processedStar.isOutwardTransformation = true;
          } else if (trans.direction === 'inward') {
            processedStar.selfSihua = `i${trans.type.charAt(0).toUpperCase()}`;
            processedStar.isInwardTransformation = true;
          }
        }
      });

      return processedStar;
    });
  }

  /**
   * Set chart data from a birth info calculation
   * 设置出生信息的命盘数据
   * 
   * This should be called before using generateStarsForPalace
   */
  public async setChartDataFromBirthInfo(birthInfo: BirthInfo): Promise<void> {
    const chart = await this.facade.calculateCompleteChart(birthInfo, {
      includeMinorStars: true,
      includeSelfTransformations: true,
      calculateDynamicPalaces: true
    });
    
    this.cachedChart = chart;
    this.cachedLunarDate = chart.lunarDate;
  }

  /**
   * Set chart data directly from lunar date
   * 直接从农历日期设置命盘数据
   */
  public setChartDataFromLunarDate(lunarDate: LunarDate): void {
    const chart = this.facade.calculateWithLunarDate(lunarDate, {
      includeMinorStars: true,
      includeSelfTransformations: true,
      calculateDynamicPalaces: true
    });
    
    this.cachedChart = chart;
    this.cachedLunarDate = lunarDate;
  }

  /**
   * Get the complete chart (for direct access if needed)
   * 获取完整命盘（如需直接访问）
   */
  public getChart(): CompleteChart | null {
    return this.cachedChart;
  }

  /**
   * Clear cached data
   * 清除缓存数据
   */
  public clearCache(): void {
    this.cachedChart = null;
    this.cachedLunarDate = null;
  }

  // Helper methods
  private getPalaceBranchIndex(palaceIndex: number, lifePalaceIndex: number): number {
    // Calculate the branch index based on palace position relative to life palace
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const monthBranchOrder = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    
    // Get the life palace branch
    const lifePalaceBranch = monthBranchOrder[lifePalaceIndex];
    const lifePalaceBranchIndex = branches.indexOf(lifePalaceBranch);
    
    // Calculate target palace branch index
    const offset = palaceIndex;
    const targetBranchIndex = (lifePalaceBranchIndex + offset) % 12;
    
    return targetBranchIndex;
  }

  private sihuaTypeToLetter(type: string): string {
    const mapping: Record<string, string> = {
      '禄': 'A',
      '权': 'B',
      '科': 'C',
      '忌': 'D'
    };
    return mapping[type] || '';
  }

  /**
   * Static method for quick migration
   * 静态方法用于快速迁移
   * 
   * Creates an adapter instance and returns a wrapped function
   */
  public static createMigrationFunction() {
    const adapter = new ZiWeiMigrationAdapter();
    
    return {
      generateStarsForPalace: adapter.generateStarsForPalace.bind(adapter),
      setChartData: adapter.setChartDataFromBirthInfo.bind(adapter),
      setLunarData: adapter.setChartDataFromLunarDate.bind(adapter),
      getChart: adapter.getChart.bind(adapter),
      clearCache: adapter.clearCache.bind(adapter)
    };
  }
}

/**
 * Export a ready-to-use migration instance
 * 导出一个即用的迁移实例
 */
export const ziweiMigration = ZiWeiMigrationAdapter.createMigrationFunction();