/**
 * Malefic Stars Calculator Module
 * 煞星计算模块 - 分离自 star-calculator.ts 以改善模块化
 */

import type {
  Star,
  StarName,
  StarBrightness,
  LunarDate,
} from '../types/core';

import {
  EARTHLY_BRANCHES,
  LUCUN_MAP,
  HUOXING_BASE_MAP,
} from '../constants/ziwei-constants';

/**
 * Calculate star brightness (simplified version for malefic stars)
 */
function calculateBrightness(starName: StarName, palaceIndex: number): StarBrightness {
  // Malefic stars have different brightness patterns
  const brightnessMap: Record<number, StarBrightness> = {
    0: '陷',
    1: '不',
    2: '平',
    3: '利',
    4: '平',
    5: '不',
    6: '陷',
    7: '不',
    8: '平',
    9: '利',
    10: '平',
    11: '不',
  };
  
  return brightnessMap[palaceIndex] || '平';
}

/**
 * Get malefic stars for a specific palace
 * 获取煞星
 */
export function getMaleficStars(
  palaceIndex: number,
  lunarDate: LunarDate
): Star[] {
  const stars: Star[] = [];
  
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
      brightness: calculateBrightness('擎羊' as StarName, palaceIndex),
    });
  }

  // 陀罗在禄存前一位
  const tuoluoIndex = (lucunIndex - 1 + 12) % 12;
  if (tuoluoIndex === palaceIndex) {
    stars.push({
      name: '陀罗' as StarName,
      category: '煞星',
      isMainStar: false,
      brightness: calculateBrightness('陀罗' as StarName, palaceIndex),
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
      brightness: calculateBrightness('火星' as StarName, palaceIndex),
    });
  }

  // 铃星 (Lingxing) - 寅午戌年起卯，其余起戌；按顺时针（加）数至时支
  const lingxingBase = (lunarDate.yearBranch === '寅' || lunarDate.yearBranch === '午' || lunarDate.yearBranch === '戌') ? '卯' : '戌';
  const lingxingBaseIndex = EARTHLY_BRANCHES.indexOf(lingxingBase);
  // hourIndex validated above
  const lingxingIndex = (lingxingBaseIndex + hourIndex) % 12;
  if (lingxingIndex === palaceIndex) {
    stars.push({
      name: '铃星' as StarName,
      category: '煞星',
      isMainStar: false,
      brightness: calculateBrightness('铃星' as StarName, palaceIndex),
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
      brightness: calculateBrightness('地空' as StarName, palaceIndex),
    });
  }

  if (dijieIndex === palaceIndex) {
    stars.push({
      name: '地劫' as StarName,
      category: '煞星',
      isMainStar: false,
      brightness: calculateBrightness('地劫' as StarName, palaceIndex),
    });
  }

  // 天刑 (Tianxing) - 酉宫起正月顺数
  const tianxingIndex = (9 + (lunarDate.month - 1)) % 12;
  if (tianxingIndex === palaceIndex) {
    stars.push({
      name: '天刑' as StarName,
      category: '煞星',
      isMainStar: false,
      brightness: calculateBrightness('天刑' as StarName, palaceIndex),
    });
  }

  return stars;
}
