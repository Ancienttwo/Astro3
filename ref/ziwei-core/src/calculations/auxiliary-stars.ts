/**
 * Auxiliary Stars Calculator Module
 * 辅星计算模块 - 分离自 star-calculator.ts 以改善模块化
 */

import type {
  Star,
  StarName,
  StarBrightness,
  LunarDate,
} from '../types/core';

import {
  EARTHLY_BRANCHES,
  TIANKUI_MAP,
  TIANYUE_MAP,
  LUCUN_MAP,
  TIANMA_MAP,
} from '../constants/ziwei-constants';

/**
 * Calculate star brightness (simplified version for auxiliary stars)
 */
function calculateBrightness(starName: StarName, palaceIndex: number): StarBrightness {
  // Simplified brightness calculation - can be enhanced later
  const brightnessMap: Record<number, StarBrightness> = {
    0: '庙',
    1: '旺',
    2: '得',
    3: '利',
    4: '平',
    5: '不',
    6: '陷',
    7: '不',
    8: '平',
    9: '利',
    10: '得',
    11: '旺',
  };
  
  return brightnessMap[palaceIndex] || '平';
}

/**
 * Get auxiliary stars for a specific palace
 * 获取辅星
 */
export function getAuxiliaryStars(
  palaceIndex: number,
  lunarDate: LunarDate
): Star[] {
  const stars: Star[] = [];
  
  // 文昌星 (Wenchang) - 戌起子时逆数
  const hourIndex = EARTHLY_BRANCHES.indexOf(lunarDate.hourBranch);
  const wenchangIndex = (10 - hourIndex + 12) % 12;
  if (wenchangIndex === palaceIndex) {
    stars.push({
      name: '文昌' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('文昌' as StarName, palaceIndex),
    });
  }

  // 文曲星 (Wenqu) - 辰起子时顺数
  const wenquIndex = (4 + hourIndex) % 12;
  if (wenquIndex === palaceIndex) {
    stars.push({
      name: '文曲' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('文曲' as StarName, palaceIndex),
    });
  }

  // 左辅星 (Zuofu) - 辰起正月顺数
  const zuofuIndex = (4 + (lunarDate.month - 1)) % 12;
  if (zuofuIndex === palaceIndex) {
    stars.push({
      name: '左辅' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('左辅' as StarName, palaceIndex),
    });
  }

  // 右弼星 (Youbi) - 戌起正月逆数
  const youbiIndex = (10 - (lunarDate.month - 1) + 12) % 12;
  if (youbiIndex === palaceIndex) {
    stars.push({
      name: '右弼' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('右弼' as StarName, palaceIndex),
    });
  }

  // 天魁、天钺 (Tiankui, Tianyue) - Based on year stem
  const tiankuiBranch = TIANKUI_MAP[lunarDate.yearStem];
  if (tiankuiBranch && EARTHLY_BRANCHES.indexOf(tiankuiBranch) === palaceIndex) {
    stars.push({
      name: '天魁' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('天魁' as StarName, palaceIndex),
    });
  }

  const tianyueBranch = TIANYUE_MAP[lunarDate.yearStem];
  if (tianyueBranch && EARTHLY_BRANCHES.indexOf(tianyueBranch) === palaceIndex) {
    stars.push({
      name: '天钺' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('天钺' as StarName, palaceIndex),
    });
  }

  // 禄存 (Lucun) - Based on year stem
  const lucunBranch = LUCUN_MAP[lunarDate.yearStem];
  if (lucunBranch && EARTHLY_BRANCHES.indexOf(lucunBranch) === palaceIndex) {
    stars.push({
      name: '禄存' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('禄存' as StarName, palaceIndex),
    });
  }

  // 天马 (Tianma) - Based on year branch
  const tianmaBranch = TIANMA_MAP[lunarDate.yearBranch];
  if (tianmaBranch && EARTHLY_BRANCHES.indexOf(tianmaBranch) === palaceIndex) {
    stars.push({
      name: '天马' as StarName,
      category: '辅星',
      isMainStar: false,
      brightness: calculateBrightness('天马' as StarName, palaceIndex),
    });
  }
  
  return stars;
}