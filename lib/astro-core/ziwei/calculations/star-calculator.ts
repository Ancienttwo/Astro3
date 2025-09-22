/**
 * Star Calculator - Core star calculation logic for ZiWei Dou Shu
 * 星曜计算器 - 紫微斗数核心星曜计算逻辑
 */

import type {
  Star,
  StarName,
  StarCategory,
  StarBrightness,
  LunarDate,
  CalculationOptions,
  EarthlyBranch,
  HeavenlyStem,
  FiveElementsBureau,
  SihuaTransformation,
} from '../types/core';

// Import modularized star calculators
import { getAuxiliaryStars } from './auxiliary-stars';
import { getMaleficStars } from './malefic-stars';
import type { IStarCalculator } from '../types/algorithms';
import { 
  EARTHLY_BRANCHES, 
  HEAVENLY_STEMS,
  ZIWEI_POSITION_TABLE,
  STAR_BRIGHTNESS_MAP,
  TIANMA_MAP,
  TIANKUI_MAP,
  TIANYUE_MAP,
  LUCUN_MAP,
  HONGLUAN_MAP,
  HUOXING_BASE_MAP,
} from '../constants/ziwei-constants';
import { SihuaCalculator } from './sihua-calculator';

// Local branch→index mapping to avoid indexOf typing under exactOptionalPropertyTypes
const BRANCH_TO_INDEX: Record<EarthlyBranch, number> = {
  子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5,
  午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11,
};

/**
 * Star Calculator Class
 * 星曜计算器类
 */
export class StarCalculator implements IStarCalculator {
  private brightnessCache: Map<string, StarBrightness> = new Map();
  private starPositionCache: Map<string, Star[]> = new Map();
  private sihuaCalculator: SihuaCalculator = new SihuaCalculator();

  /**
   * Calculate all stars for a palace with sihua transformations
   * 计算宫位的所有星曜及四化
   */
  calculateStarsForPalace(
    palaceIndex: number,
    lunarDate: LunarDate,
    options?: CalculationOptions
  ): Star[] {
    const cacheKey = `${palaceIndex}-${JSON.stringify(lunarDate)}`;
    
    // Check cache if enabled
    if (options?.useCache && this.starPositionCache.has(cacheKey)) {
      return this.starPositionCache.get(cacheKey)!;
    }

    const branch: EarthlyBranch = (EARTHLY_BRANCHES[palaceIndex] ?? '子') as EarthlyBranch;
    const stars: Star[] = [];

    // Get main stars
    const mainStars = this.getMainStars(palaceIndex, lunarDate, options);
    stars.push(...mainStars);

    // Get auxiliary stars
    const auxiliaryStars = this.getAuxiliaryStars(palaceIndex, lunarDate);
    stars.push(...auxiliaryStars);

    // Get malefic stars if included
    if (options?.includeMinorStars) {
      const maleficStars = this.getMaleficStars(palaceIndex, lunarDate);
      stars.push(...maleficStars);
    }

    // Calculate brightness for all stars
    stars.forEach(star => {
      if (!star.brightness) {
        star.brightness = this.calculateBrightness(star.name, palaceIndex);
      }
    });

    // Add sihua transformations
    if (options?.includeSihua !== false) {
      this.addSihuaTransformations(stars, palaceIndex, lunarDate);
    }

    // Cache result if enabled
    if (options?.useCache) {
      this.starPositionCache.set(cacheKey, stars);
    }

    return stars;
  }

  /**
   * Calculate star brightness
   * 计算星曜亮度
   */
  calculateBrightness(
    starName: StarName,
    palaceIndex: number,
    element?: string
  ): StarBrightness {
    const cacheKey = `${starName}-${palaceIndex}-${element || ''}`;
    
    // Check cache
    if (this.brightnessCache.has(cacheKey)) {
      return this.brightnessCache.get(cacheKey)!;
    }

    const branch: EarthlyBranch = (EARTHLY_BRANCHES[palaceIndex] ?? '子') as EarthlyBranch;
    const brightnessMap = STAR_BRIGHTNESS_MAP[starName];
    
    let brightness: StarBrightness = '平'; // Default brightness
    
    // STAR_BRIGHTNESS_MAP is a Record<string, string[]> ordered by 子丑寅...亥
    // Convert branch to index, then map label to StarBrightness
    if (Array.isArray(brightnessMap)) {
      const branchIndex = BRANCH_TO_INDEX[branch] ?? 0;
      if (branchIndex >= 0 && branchIndex < brightnessMap.length) {
        const label = brightnessMap[branchIndex] ?? '平';
        brightness = this.normalizeBrightnessLabel(label);
      }
    }

    // Cache result
    this.brightnessCache.set(cacheKey, brightness);
    
    return brightness;
  }

  /**
   * Normalize brightness label from table to StarBrightness union
   */
  private normalizeBrightnessLabel(label: string): StarBrightness {
    // Some tables use '地' which we normalize to '不'
    const normalized = label === '地' ? '不' : label;
    const allowed: StarBrightness[] = ['庙', '旺', '得', '利', '平', '不', '陷'];
    return (allowed.includes(normalized as StarBrightness)
      ? (normalized as StarBrightness)
      : '平');
  }

  /**
   * Get main stars for palace
   * 获取宫位的主星
   */
  getMainStars(palaceIndex: number, lunarDate: LunarDate, options?: CalculationOptions): Star[] {
    const stars: Star[] = [];
    const branch = EARTHLY_BRANCHES[palaceIndex];
    
    // Calculate ZiWei position (紫微星位置)
    const ziweiPosition = this.calculateZiweiPosition(lunarDate, options?.fiveElementsBureau);
    const ziweiIndex = EARTHLY_BRANCHES.indexOf(ziweiPosition);
    
    // 紫微星系 (ZiWei Star Series) - Counter-clockwise from ZiWei
    const ziweiSeries = [
      { name: '紫微' as StarName, offset: 0 },
      { name: '天机' as StarName, offset: -1 },
      { name: '太阳' as StarName, offset: -3 },
      { name: '武曲' as StarName, offset: -4 },
      { name: '天同' as StarName, offset: -5 },
      { name: '廉贞' as StarName, offset: -8 },
    ];

    ziweiSeries.forEach(({ name, offset }) => {
      const starIndex = (ziweiIndex + offset + 12) % 12;
      if (starIndex === palaceIndex) {
        stars.push({
          name,
          category: '主星',
          isMainStar: true,
          brightness: this.calculateBrightness(name, palaceIndex),
        });
      }
    });

    // 天府星系 (TianFu Star Series) - Clockwise from TianFu
    const tianfuIndex = (ziweiIndex + 6) % 12; // TianFu is opposite to ZiWei
    const tianfuSeries = [
      { name: '天府' as StarName, offset: 0 },
      { name: '太阴' as StarName, offset: 1 },
      { name: '贪狼' as StarName, offset: 2 },
      { name: '巨门' as StarName, offset: 3 },
      { name: '天相' as StarName, offset: 4 },
      { name: '天梁' as StarName, offset: 5 },
      { name: '七杀' as StarName, offset: 6 },
      { name: '破军' as StarName, offset: 10 },
    ];

    tianfuSeries.forEach(({ name, offset }) => {
      const starIndex = (tianfuIndex + offset) % 12;
      if (starIndex === palaceIndex) {
        stars.push({
          name,
          category: '主星',
          isMainStar: true,
          brightness: this.calculateBrightness(name, palaceIndex),
        });
      }
    });
    
    return stars;
  }

  /**
   * Get auxiliary stars for palace
   * 获取宫位的辅星
   */
  getAuxiliaryStars(palaceIndex: number, lunarDate: LunarDate): Star[] {
    const stars: Star[] = [];
    const branch = EARTHLY_BRANCHES[palaceIndex];
    
    // 文昌星 (Wenchang) - 戌起子时逆数
    const hourIndex = EARTHLY_BRANCHES.indexOf(lunarDate.hourBranch);
    const wenchangIndex = (10 - hourIndex + 12) % 12;
    if (wenchangIndex === palaceIndex) {
      stars.push({
        name: '文昌' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('文昌' as StarName, palaceIndex),
      });
    }

    // 文曲星 (Wenqu) - 辰起子时顺数
    const wenquIndex = (4 + hourIndex) % 12;
    if (wenquIndex === palaceIndex) {
      stars.push({
        name: '文曲' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('文曲' as StarName, palaceIndex),
      });
    }

    // 左辅星 (Zuofu) - 辰起正月顺数
    const zuofuIndex = (4 + (lunarDate.month - 1)) % 12;
    if (zuofuIndex === palaceIndex) {
      stars.push({
        name: '左辅' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('左辅' as StarName, palaceIndex),
      });
    }

    // 右弼星 (Youbi) - 戌起正月逆数
    const youbiIndex = (10 - (lunarDate.month - 1) + 12) % 12;
    if (youbiIndex === palaceIndex) {
      stars.push({
        name: '右弼' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('右弼' as StarName, palaceIndex),
      });
    }

    // 天魁、天钺 (Tiankui, Tianyue) - Based on year stem
    const tiankuiBranch = TIANKUI_MAP[lunarDate.yearStem];
    if (tiankuiBranch && EARTHLY_BRANCHES.indexOf(tiankuiBranch) === palaceIndex) {
      stars.push({
        name: '天魁' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('天魁' as StarName, palaceIndex),
      });
    }

    const tianyueBranch = TIANYUE_MAP[lunarDate.yearStem];
    if (tianyueBranch && EARTHLY_BRANCHES.indexOf(tianyueBranch) === palaceIndex) {
      stars.push({
        name: '天钺' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('天钺' as StarName, palaceIndex),
      });
    }

    // 禄存 (Lucun) - Based on year stem
    const lucunBranch = LUCUN_MAP[lunarDate.yearStem];
    if (lucunBranch && EARTHLY_BRANCHES.indexOf(lucunBranch) === palaceIndex) {
      stars.push({
        name: '禄存' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('禄存' as StarName, palaceIndex),
      });
    }

    // 天马 (Tianma) - Based on year branch
    const tianmaBranch = TIANMA_MAP[lunarDate.yearBranch];
    if (tianmaBranch && EARTHLY_BRANCHES.indexOf(tianmaBranch) === palaceIndex) {
      stars.push({
        name: '天马' as StarName,
        category: '辅星',
        isMainStar: false,
        brightness: this.calculateBrightness('天马' as StarName, palaceIndex),
      });
    }
    
    return stars;
  }

  /**
   * Get malefic stars for palace
   * 获取宫位的煞星
   */
  private getMaleficStars(palaceIndex: number, lunarDate: LunarDate): Star[] {
    const stars: Star[] = [];
    const branch = EARTHLY_BRANCHES[palaceIndex];
    
    // 擎羊、陀罗 (Qingyang, Tuoluo) - Based on Lucun position
    const lucunBranch = LUCUN_MAP[lunarDate.yearStem];
    if (!lucunBranch) {
      throw new Error(`Invalid yearStem for LuCun mapping: ${lunarDate.yearStem}`);
    }
    const lucunIndex = EARTHLY_BRANCHES.indexOf(lucunBranch);
    
    // 擎羊在禄存后一位
    const qingyangIndex = (lucunIndex + 1) % 12;
    if (qingyangIndex === palaceIndex) {
      stars.push({
        name: '擎羊' as StarName,
        category: '煞星',
        isMainStar: false,
        brightness: this.calculateBrightness('擎羊' as StarName, palaceIndex),
      });
    }

    // 陀罗在禄存前一位
    const tuoluoIndex = (lucunIndex - 1 + 12) % 12;
    if (tuoluoIndex === palaceIndex) {
      stars.push({
        name: '陀罗' as StarName,
        category: '煞星',
        isMainStar: false,
        brightness: this.calculateBrightness('陀罗' as StarName, palaceIndex),
      });
    }

    // 火星 (Huoxing) - Based on year branch and hour
    const huoxingBase = HUOXING_BASE_MAP[lunarDate.yearBranch];
    if (!huoxingBase) {
      throw new Error(`Missing Huoxing base for yearBranch: ${lunarDate.yearBranch}`);
    }
    const hourIndex = EARTHLY_BRANCHES.indexOf(lunarDate.hourBranch);
    if (hourIndex === -1) {
      throw new Error(`Invalid hourBranch: ${lunarDate.hourBranch}`);
    }
    const huoxingBaseIndex = EARTHLY_BRANCHES.indexOf(huoxingBase);
    const huoxingIndex = (huoxingBaseIndex + hourIndex) % 12;
    if (huoxingIndex === palaceIndex) {
      stars.push({
        name: '火星' as StarName,
        category: '煞星',
        isMainStar: false,
        brightness: this.calculateBrightness('火星' as StarName, palaceIndex),
      });
    }

    // 铃星 (Lingxing) - 寅午戌年起卯，其余起戌；方向：顺时针（加）
    const lingxingBase = (lunarDate.yearBranch === '寅' || lunarDate.yearBranch === '午' || lunarDate.yearBranch === '戌') ? '卯' : '戌';
    const lingxingBaseIndex = EARTHLY_BRANCHES.indexOf(lingxingBase);
    // hourIndex validated above
    const lingxingIndex = (lingxingBaseIndex + hourIndex) % 12;
    if (lingxingIndex === palaceIndex) {
      stars.push({
        name: '铃星' as StarName,
        category: '煞星',
        isMainStar: false,
        brightness: this.calculateBrightness('铃星' as StarName, palaceIndex),
      });
    }

    // 地空、地劫 (Dikong, Dijie) - Based on hour
    const haiIndex = 11; // 亥宫索引
    const dikongIndex = (haiIndex - hourIndex + 12) % 12;
    const dijieIndex = (haiIndex + hourIndex) % 12;
    
    if (dikongIndex === palaceIndex) {
      stars.push({
        name: '地空' as StarName,
        category: '煞星',
        isMainStar: false,
        brightness: this.calculateBrightness('地空' as StarName, palaceIndex),
      });
    }

    if (dijieIndex === palaceIndex) {
      stars.push({
        name: '地劫' as StarName,
        category: '煞星',
        isMainStar: false,
        brightness: this.calculateBrightness('地劫' as StarName, palaceIndex),
      });
    }

    // 天刑 (Tianxing) - 酉宫起正月顺数
    const tianxingIndex = (9 + (lunarDate.month - 1)) % 12;
    if (tianxingIndex === palaceIndex) {
      stars.push({
        name: '天刑' as StarName,
        category: '煞星',
        isMainStar: false,
        brightness: this.calculateBrightness('天刑' as StarName, palaceIndex),
      });
    }

    return stars;
  }

  /**
   * Calculate ZiWei position based on Five Elements Bureau and lunar day
   * 根据五行局和农历日期计算紫微星位置
   */
  private calculateZiweiPosition(lunarDate: LunarDate, bureau?: FiveElementsBureau): EarthlyBranch {
    // ZIWEI_POSITION_TABLE is a 30x5 array, columns correspond to bureau
    const bureauToCol: Record<FiveElementsBureau, number> = {
      '水二局': 0,
      '木三局': 1,
      '金四局': 2,
      '土五局': 3,
      '火六局': 4,
    };
    const col = bureau ? bureauToCol[bureau] : 0;
    const dayIndex = Math.max(0, Math.min(lunarDate.day - 1, 29));
    const row = ZIWEI_POSITION_TABLE[dayIndex];
    if (!row || col === null || col === undefined) return '子';
    return row[col] as EarthlyBranch;
  }

  /**
   * Add sihua transformations to stars
   * 为星曜添加四化信息
   */
  private addSihuaTransformations(
    stars: Star[],
    palaceIndex: number,
    lunarDate: LunarDate
  ): void {
    // Calculate birth year sihua
    const birthYearSihua = this.sihuaCalculator.calculateBirthYearSihua(lunarDate.yearStem);
    
    // Calculate palace stem for this palace
    const palaceStem = this.sihuaCalculator.getPalaceStem(lunarDate.yearStem, palaceIndex);
    
    // Calculate palace stem sihua
    const palaceStemSihua = this.sihuaCalculator.calculatePalaceStemSihua(palaceStem, palaceIndex);
    
    // Create a map of birth sihua for self-transformation detection
    const birthSihuaMap = new Map<string, SihuaTransformation['type']>();
    birthYearSihua.forEach(trans => {
      birthSihuaMap.set(trans.star, trans.type);
    });
    
    // Detect self-transformations
    const selfTransformations = this.sihuaCalculator.detectSelfTransformations(
      palaceStem,
      stars,
      birthSihuaMap
    );
    
    // Apply transformations to stars
    stars.forEach(star => {
      const transformations: SihuaTransformation[] = [];
      
      // Check for birth year sihua
      const birthTrans = birthYearSihua.find(t => t.star === star.name);
      if (birthTrans) {
        transformations.push(birthTrans);
      }
      
      // Check for palace stem sihua (flying transformations)
      const palaceTrans = palaceStemSihua.find(t => t.star === star.name);
      if (palaceTrans) {
        transformations.push(palaceTrans);
      }
      
      // Check for self-transformations
      const selfTrans = selfTransformations.filter(t => t.star === star.name);
      if (selfTrans.length > 0) {
        transformations.push(...selfTrans);
      }
      
      // Add transformations to star if any exist
      if (transformations.length > 0) {
        star.sihuaTransformations = transformations;
      }
    });
  }

  /**
   * Clear all caches
   * 清除所有缓存
   */
  clearCache(): void {
    this.brightnessCache.clear();
    this.starPositionCache.clear();
    this.sihuaCalculator.clearCache();
  }

  /**
   * Get cache statistics
   * 获取缓存统计
   */
  getCacheStats(): { brightness: number; positions: number } {
    return {
      brightness: this.brightnessCache.size,
      positions: this.starPositionCache.size,
    };
  }
}
