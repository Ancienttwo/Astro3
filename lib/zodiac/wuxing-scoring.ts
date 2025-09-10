// 五行强弱终极评分方案（100分制）
// 综合考虑季节、天干地支关系、藏干、土五行特别处理

export interface WuxingScore {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  details: {
    [key: string]: {
      basic: number;      // 基础分
      shengke: number;    // 生克分
      combination: number; // 合会分
      conflict: number;   // 刑冲分
      transparency: number; // 透干分
      seasonal: number;   // 季节加权分
      total: number;      // 总分
    };
  };
}

// 五行类型
type WuxingType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 月支季节映射
const SEASON_MAP: { [key: string]: string } = {
  '寅': 'spring', '卯': 'spring',
  '巳': 'summer', '午': 'summer', 
  '申': 'autumn', '酉': 'autumn',
  '亥': 'winter', '子': 'winter',
  '辰': 'earth', '未': 'earth', '戌': 'earth', '丑': 'earth'
};

// 地支藏干表
const DIZHI_CANGGAN: { [key: string]: { [key: string]: { element: WuxingType; weight: number } } } = {
  '子': { '癸': { element: 'water', weight: 1.0 } },
  '丑': { '己': { element: 'earth', weight: 1.0 }, '癸': { element: 'water', weight: 0.3 }, '辛': { element: 'metal', weight: 0.5 } },
  '寅': { '甲': { element: 'wood', weight: 1.0 }, '丙': { element: 'fire', weight: 0.5 }, '戊': { element: 'earth', weight: 0.3 } },
  '卯': { '乙': { element: 'wood', weight: 1.0 } },
  '辰': { '戊': { element: 'earth', weight: 1.0 }, '乙': { element: 'wood', weight: 0.3 }, '癸': { element: 'water', weight: 0.5 } },
  '巳': { '丙': { element: 'fire', weight: 1.0 }, '戊': { element: 'earth', weight: 0.5 }, '庚': { element: 'metal', weight: 0.3 } },
  '午': { '丁': { element: 'fire', weight: 1.0 }, '己': { element: 'earth', weight: 0.3 } },
  '未': { '己': { element: 'earth', weight: 1.0 }, '丁': { element: 'fire', weight: 0.3 }, '乙': { element: 'wood', weight: 0.5 } },
  '申': { '庚': { element: 'metal', weight: 1.0 }, '壬': { element: 'water', weight: 0.5 }, '戊': { element: 'earth', weight: 0.3 } },
  '酉': { '辛': { element: 'metal', weight: 1.0 } },
  '戌': { '戊': { element: 'earth', weight: 1.0 }, '辛': { element: 'metal', weight: 0.3 }, '丁': { element: 'fire', weight: 0.5 } },
  '亥': { '壬': { element: 'water', weight: 1.0 }, '甲': { element: 'wood', weight: 0.3 } }
};

// 天干五行映射
const TIANGAN_WUXING: { [key: string]: WuxingType } = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

// 五行相生关系
const WUXING_SHENG: { [key in WuxingType]: WuxingType } = {
  wood: 'fire',
  fire: 'earth', 
  earth: 'metal',
  metal: 'water',
  water: 'wood'
};

// 五行相克关系
const WUXING_KE: { [key in WuxingType]: WuxingType } = {
  wood: 'earth',
  fire: 'metal',
  earth: 'water',
  metal: 'wood',
  water: 'fire'
};

// 季节五行强弱表
const SEASONAL_STRENGTH: { [season: string]: { [element in WuxingType]: number } } = {
  spring: { wood: 1.0, fire: 0.7, earth: 0.3, metal: 0.2, water: 0.5 },
  summer: { wood: 0.5, fire: 1.0, earth: 0.7, metal: 0.3, water: 0.2 },
  autumn: { wood: 0.2, fire: 0.3, earth: 0.5, metal: 1.0, water: 0.7 },
  winter: { wood: 0.3, fire: 0.2, earth: 0.3, metal: 0.5, water: 1.0 },
  earth: { wood: 0.3, fire: 0.5, earth: 1.0, metal: 0.7, water: 0.3 }
};

// 地支三合、三会、六合表
const DIZHI_COMBINATIONS: {
  sanhui: Array<{ branches: string[]; element: string; score: number }>;
  sanhe: Array<{ branches: string[]; element: string; score: number }>;
  liuhe: Array<{ branches: string[]; mergedElement: string; score: number }>;
} = {
  sanhui: [
    { branches: ['寅', '卯', '辰'], element: 'wood', score: 4 },
    { branches: ['巳', '午', '未'], element: 'fire', score: 4 },
    { branches: ['申', '酉', '戌'], element: 'metal', score: 4 },
    { branches: ['亥', '子', '丑'], element: 'water', score: 4 }
  ],
  sanhe: [
    { branches: ['申', '子', '辰'], element: 'water', score: 3 },
    { branches: ['亥', '卯', '未'], element: 'wood', score: 3 },
    { branches: ['寅', '午', '戌'], element: 'fire', score: 3 },
    { branches: ['巳', '酉', '丑'], element: 'metal', score: 3 }
  ],
  liuhe: [
    { branches: ['子', '丑'], mergedElement: 'earth', score: 2 },
    { branches: ['寅', '亥'], mergedElement: 'wood', score: 2 },
    { branches: ['卯', '戌'], mergedElement: 'fire', score: 2 },
    { branches: ['辰', '酉'], mergedElement: 'metal', score: 2 },
    { branches: ['巳', '申'], mergedElement: 'water', score: 2 },
    { branches: ['午', '未'], mergedElement: 'fire', score: 2 }
  ]
};

// 地支刑冲害破穿绝表
const DIZHI_CONFLICTS = {
  chong: [
    { pair: ['子', '午'], score: -3 },
    { pair: ['丑', '未'], score: -3 },
    { pair: ['寅', '申'], score: -3 },
    { pair: ['卯', '酉'], score: -3 },
    { pair: ['辰', '戌'], score: -3 },
    { pair: ['巳', '亥'], score: -3 }
  ],
  xing: [
    { group: ['寅', '巳', '申'], score: -2 },
    { group: ['丑', '未', '戌'], score: -2 },
    { pair: ['子', '卯'], score: -2 }
  ],
  // hai (六害) 已合并到 chuan (穿) 中，不再单独处理
  po: [
    { pair: ['子', '酉'], score: -0.5 },
    { pair: ['卯', '午'], score: -0.5 },
    { pair: ['辰', '丑'], score: -0.5 },
    { pair: ['未', '戌'], score: -0.5 },
    { pair: ['寅', '亥'], score: -0.5 },
    { pair: ['巳', '申'], score: -0.5 }
  ],
  // 新增：穿（六害）- 根据详细说明精确处理
  chuan: [
    { pair: ['寅', '巳'], score: -1.5 },
    { pair: ['申', '亥'], score: -1.5 },
    { pair: ['丑', '午'], score: -1.5 },
    { pair: ['子', '未'], score: -1.5 },
    { pair: ['卯', '辰'], score: -1.5 },
    { pair: ['酉', '戌'], score: -1.5 }
  ],
  // 新增：地支相绝
  jue: [
    { pair: ['寅', '酉'], score: -2.5 },
    { pair: ['卯', '申'], score: -2.5 },
    { pair: ['午', '亥'], score: -2.5 },
    { pair: ['子', '巳'], score: -2.5 }
  ]
};

/**
 * 计算五行强弱评分
 * @param bazi 八字数组 [年干, 年支, 月干, 月支, 日干, 日支, 时干, 时支]
 * @returns 五行评分结果
 */
export function calculateWuxingScore(bazi: string[]): WuxingScore {
  const [yearGan, yearZhi, monthGan, monthZhi, dayGan, dayZhi, hourGan, hourZhi] = bazi;
  const gans = [yearGan, monthGan, dayGan, hourGan];
  const zhis = [yearZhi, monthZhi, dayZhi, hourZhi];
  
  // 初始化评分
  const scores: { [key in WuxingType]: any } = {
    wood: { basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    fire: { basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    earth: { basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    metal: { basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    water: { basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 }
  };

  // 统计五行出现次数
  const wuxingCount: { [key in WuxingType]: number } = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };

  // 统计地支本气数量
  const benqiCount: { [key in WuxingType]: number } = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };

  // 1. 计算基础分（30分）
  // 1.1 天干基数分
  gans.forEach(gan => {
    if (gan && TIANGAN_WUXING[gan]) {
      wuxingCount[TIANGAN_WUXING[gan]]++;
    }
  });

  // 1.2 地支藏干分
  const cangganCount: { [key in WuxingType]: number } = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };

  zhis.forEach(zhi => {
    if (zhi && DIZHI_CANGGAN[zhi]) {
      Object.values(DIZHI_CANGGAN[zhi]).forEach(canggan => {
        wuxingCount[canggan.element]++;
        
        // 统计本气
        if (canggan.weight === 1.0) {
          benqiCount[canggan.element]++;
        }
        
        // 土五行特殊权重处理
        let weight = canggan.weight;
        if (canggan.element === 'earth') {
          if (weight === 0.3) weight = 0.5; // 余气(库)权重 > 中气
          if (weight === 0.5) weight = 0.3;
        }
        
        cangganCount[canggan.element] += weight;
      });
    }
  });

  // 计算基础分
  const totalCount = Object.values(wuxingCount).reduce((sum, count) => sum + count, 0);
  Object.keys(wuxingCount).forEach(element => {
    const el = element as WuxingType;
    
    // 基数分 - 确保每个存在的五行都有基础分
    const baseRatio = wuxingCount[el] / totalCount;
    scores[el].basic += Math.max(3, 20 * baseRatio); // 最少3分基础分
    
    // 藏干权重分
    scores[el].basic += cangganCount[el] * 3;
    
    // 未月土基数特殊处理
    if (monthZhi === '未' && el === 'earth') {
      scores[el].basic *= 0.8;
    }
  });

  // 2. 生克关系分（考虑季节强弱）
  const season = SEASON_MAP[monthZhi] || 'earth';
  
  Object.keys(WUXING_SHENG).forEach(fromElement => {
    const from = fromElement as WuxingType;
    const to = WUXING_SHENG[from];
    
    if (wuxingCount[from] > 0 && wuxingCount[to] > 0) {
      // 相生力度 = 基础分 × 季节强弱
      const shengPower = 2 * SEASONAL_STRENGTH[season][from];
      scores[to].shengke += shengPower;
    }
  });

  // 相克关系
  Object.keys(WUXING_KE).forEach(fromElement => {
    const from = fromElement as WuxingType;
    const to = WUXING_KE[from];
    
    if (wuxingCount[from] > 0 && wuxingCount[to] > 0) {
      // 相克力度 = 基础分 × 季节强弱
      const kePower = 1.5 * SEASONAL_STRENGTH[season][from];
      scores[to].shengke -= kePower;
    }
  });

  // 3. 合会加分
  calculateCombinations(zhis, scores, season);
  
  // 4. 刑冲减分（考虑季节影响）
  calculateConflicts(zhis, scores, season);

  // 5. 透干加成
  calculateTransparency(gans, zhis, scores);

  // 6. 检查成势情况（免季节影响）
  const exemptFromSeasonal: { [key in WuxingType]: boolean } = {
    wood: false, fire: false, earth: false, metal: false, water: false
  };

  Object.keys(wuxingCount).forEach(element => {
    const el = element as WuxingType;
    const tianganCount = gans.filter(gan => gan && TIANGAN_WUXING[gan] === el).length;
    
    // 成势条件：地支本气≥2个 + 天干数量，总数≥3
    if (benqiCount[el] >= 2 && tianganCount > 0 && (benqiCount[el] + tianganCount) >= 3) {
      exemptFromSeasonal[el] = true;
    }
  });

  // 7. 季节加权（后置）
  Object.keys(scores).forEach(element => {
    const el = element as WuxingType;
    
    if (!exemptFromSeasonal[el]) {
      // 未成势的五行受季节影响
      const baseScore = scores[el].basic + scores[el].shengke + scores[el].combination + 
                       scores[el].conflict + scores[el].transparency;
      const seasonalFactor = SEASONAL_STRENGTH[season][el];
      
             // 季节加权：当令+50%，相生+25%，休囚-25%，死绝-50%
       if (seasonalFactor >= 1.0) {
         scores[el].seasonal = baseScore * 0.5; // 当令+50%
       } else if (seasonalFactor >= 0.7) {
         scores[el].seasonal = baseScore * 0.25; // 相生+25%
       } else if (seasonalFactor >= 0.3) {
         scores[el].seasonal = baseScore * (-0.25); // 休囚-25%
       } else {
         scores[el].seasonal = baseScore * (-0.5); // 死绝-50%
       }
    }
  });

  // 8. 计算总分
  Object.keys(scores).forEach(element => {
    const el = element as WuxingType;
    scores[el].total = scores[el].basic + scores[el].shengke + scores[el].combination + 
                      scores[el].conflict + scores[el].transparency + scores[el].seasonal;
  });

  // 9. 极弱五行的额外减分项
  Object.keys(scores).forEach(element => {
    const el = element as WuxingType;
    
    // 检查五行是否完全不存在：天干和地支藏干都没有
    if (wuxingCount[el] === 0) {
      // 完全不存在的五行直接按0分计算
      scores[el].total = 0;
      return;
    }
    
    // 检查天干无根情况：天干存在但地支藏干中没有本气、中气、余气
    const tianganCount = gans.filter(gan => gan && TIANGAN_WUXING[gan] === el).length;
    if (tianganCount > 0) {
      let hasRoot = false;
      zhis.forEach(zhi => {
        if (DIZHI_CANGGAN[zhi]) {
          Object.values(DIZHI_CANGGAN[zhi]).forEach(canggan => {
            if (canggan.element === el) {
              hasRoot = true;
            }
          });
        }
      });
      
      if (!hasRoot) {
        // 天干无根，直接减50%
        scores[el].total *= 0.5;
      }
    }
    
    // 检查地支坐相克情况
    for (let i = 0; i < gans.length; i++) {
      const gan = gans[i];
      const zhi = zhis[i];
      
      if (gan && TIANGAN_WUXING[gan] === el && zhi && DIZHI_CANGGAN[zhi]) {
        const ganElement = TIANGAN_WUXING[gan];
        let isKeByZhi = false;
        
        // 检查地支本气是否克天干
        Object.values(DIZHI_CANGGAN[zhi]).forEach(canggan => {
          if (canggan.weight === 1.0 && WUXING_KE[canggan.element] === ganElement) {
            isKeByZhi = true;
          }
        });
        
        if (isKeByZhi) {
          // 地支坐相克，减50%
          scores[el].total *= 0.5;
        }
      }
    }
  });

  // 10. 改进的归一化算法 - 更好地体现极弱五行
  const totalScores = Object.values(scores).map(s => s.total);
  const maxScore = Math.max(...totalScores);
  const minScore = Math.min(...totalScores);
  const avgScore = totalScores.reduce((sum, score) => sum + score, 0) / totalScores.length;
  
  // 检测极弱五行：基础分很低且受到严重负面影响
  const finalScores: { [key in WuxingType]: number } = {} as any;
  
  Object.keys(scores).forEach(element => {
    const el = element as WuxingType;
    const score = scores[el];
    
    // 完全不存在的五行直接返回0分
    if (score.total === 0 && wuxingCount[el] === 0) {
      finalScores[el] = 0;
      return;
    }
    
    // 判断是否为极弱五行
    const isExtremelyWeak = (
      score.basic <= 5 && // 基础分很低
      score.total <= 3 && // 总分很低
      score.seasonal < -1 // 季节严重不利
    );
    
    if (isExtremelyWeak) {
      // 极弱五行直接给予很低分数
      finalScores[el] = Math.max(1, Math.min(8, 3 + score.total * 0.1));
    } else {
      // 正常归一化
      finalScores[el] = normalizeScore(score.total, minScore, maxScore, avgScore);
    }
  });
  
  // 设置合理的分数范围
  const normalizedScores: WuxingScore = {
    wood: Math.max(1, Math.min(95, finalScores.wood)),
    fire: Math.max(1, Math.min(95, finalScores.fire)),
    earth: Math.max(1, Math.min(95, finalScores.earth)),
    metal: Math.max(1, Math.min(95, finalScores.metal)),
    water: Math.max(1, Math.min(95, finalScores.water)),
    details: {
      wood: scores.wood,
      fire: scores.fire,
      earth: scores.earth,
      metal: scores.metal,
      water: scores.water
    }
  };

  return normalizedScores;
}

// 辅助函数：改进的归一化算法
function normalizeScore(score: number, minScore: number, maxScore: number, avgScore: number): number {
  const range = maxScore - minScore || 1;
  
  // 基础归一化
  let normalized = ((score - minScore) / range) * 70 + 15; // 映射到15-85范围
  
  // 考虑平均值，避免极端分化
  const avgFactor = 0.2; // 平均值影响权重
  normalized = normalized * (1 - avgFactor) + (50 * avgFactor);
  
  return Math.round(normalized);
}

// 辅助函数：获取季节对应的五行
function getSeasonalElement(season: string): WuxingType | null {
  switch (season) {
    case 'spring': return 'wood';
    case 'summer': return 'fire';
    case 'autumn': return 'metal';
    case 'winter': return 'water';
    case 'earth': return 'earth';
    default: return null;
  }
}

// 辅助函数：判断五行相克关系
function isKeElement(from: WuxingType, to: WuxingType): boolean {
  return WUXING_KE[from] === to;
}

// 计算合会加分（考虑季节影响）
function calculateCombinations(zhis: string[], scores: { [key in WuxingType]: any }, season: string) {
  // 三会
  DIZHI_COMBINATIONS.sanhui.forEach(combo => {
    const matchCount = combo.branches.filter(branch => zhis.includes(branch)).length;
    if (matchCount === 3) {
      const seasonalBonus = SEASONAL_STRENGTH[season][combo.element as WuxingType];
      scores[combo.element as WuxingType].combination += combo.score * seasonalBonus;
    }
  });

  // 三合
  DIZHI_COMBINATIONS.sanhe.forEach(combo => {
    const matchCount = combo.branches.filter(branch => zhis.includes(branch)).length;
    if (matchCount === 3) {
      const seasonalBonus = SEASONAL_STRENGTH[season][combo.element as WuxingType];
      scores[combo.element as WuxingType].combination += combo.score * seasonalBonus;
    }
  });

  // 六合
  DIZHI_COMBINATIONS.liuhe.forEach(combo => {
    const hasAll = combo.branches.every(branch => zhis.includes(branch));
    if (hasAll) {
      // 只给合成的五行加分
      const seasonalBonus = SEASONAL_STRENGTH[season][combo.mergedElement as WuxingType];
      scores[combo.mergedElement as WuxingType].combination += combo.score * seasonalBonus;
    }
  });
}

// 计算刑冲减分（考虑季节影响）
function calculateConflicts(zhis: string[], scores: { [key in WuxingType]: any }, season: string) {
  // 冲
  DIZHI_CONFLICTS.chong.forEach(conflict => {
    const hasAll = conflict.pair.every(zhi => zhis.includes(zhi));
    if (hasAll) {
      conflict.pair.forEach(zhi => {
        if (DIZHI_CANGGAN[zhi]) {
          Object.values(DIZHI_CANGGAN[zhi]).forEach(canggan => {
            // 季节强的五行受冲影响较小
            const seasonalResistance = SEASONAL_STRENGTH[season][canggan.element];
            const conflictPower = conflict.score * (1 - seasonalResistance * 0.3);
            scores[canggan.element].conflict += conflictPower / 2;
          });
        }
      });
    }
  });

  // 刑
  DIZHI_CONFLICTS.xing.forEach(conflict => {
    if (conflict.group) {
      const matchCount = conflict.group.filter(zhi => zhis.includes(zhi)).length;
      if (matchCount >= 2) {
        conflict.group.forEach(zhi => {
          if (zhis.includes(zhi) && DIZHI_CANGGAN[zhi]) {
            Object.values(DIZHI_CANGGAN[zhi]).forEach(canggan => {
              const seasonalResistance = SEASONAL_STRENGTH[season][canggan.element];
              const conflictPower = conflict.score * (1 - seasonalResistance * 0.2);
              scores[canggan.element].conflict += conflictPower / matchCount;
            });
          }
        });
      }
    } else if (conflict.pair) {
      const hasAll = conflict.pair.every(zhi => zhis.includes(zhi));
      if (hasAll) {
        conflict.pair.forEach(zhi => {
          if (DIZHI_CANGGAN[zhi]) {
            Object.values(DIZHI_CANGGAN[zhi]).forEach(canggan => {
              const seasonalResistance = SEASONAL_STRENGTH[season][canggan.element];
              const conflictPower = conflict.score * (1 - seasonalResistance * 0.2);
              scores[canggan.element].conflict += conflictPower / 2;
            });
          }
        });
      }
    }
  });

  // 害 (六害) 已合并到穿 (chuan) 中处理，不再单独计算

  // 破
  DIZHI_CONFLICTS.po.forEach(conflict => {
    const hasAll = conflict.pair.every(zhi => zhis.includes(zhi));
    if (hasAll) {
      conflict.pair.forEach(zhi => {
        if (DIZHI_CANGGAN[zhi]) {
          Object.values(DIZHI_CANGGAN[zhi]).forEach(canggan => {
            // 破的影响比较小
            scores[canggan.element].conflict += conflict.score;
          });
        }
      });
    }
  });

  // 新增：穿（六害）- 根据详细说明精确处理
  DIZHI_CONFLICTS.chuan.forEach(conflict => {
    const hasAll = conflict.pair.every(zhi => zhis.includes(zhi));
    if (hasAll) {
      const [zhi1, zhi2] = conflict.pair;
      
      // 根据具体的穿组合进行精确处理
      if ((zhi1 === '子' && zhi2 === '未') || (zhi1 === '未' && zhi2 === '子')) {
        // 子未穿：子水穿坏未中丁火和己土
        if (DIZHI_CANGGAN['未']) {
          Object.values(DIZHI_CANGGAN['未']).forEach(canggan => {
            if (canggan.element === 'fire' || canggan.element === 'earth') {
              scores[canggan.element].conflict -= 2.0; // 比一般穿更严重
            }
          });
        }
        if (DIZHI_CANGGAN['子']) {
          Object.values(DIZHI_CANGGAN['子']).forEach(canggan => {
            scores[canggan.element].conflict -= 1.0; // 子水也受伤
          });
        }
      } else if ((zhi1 === '丑' && zhi2 === '午') || (zhi1 === '午' && zhi2 === '丑')) {
        // 丑午穿：丑中癸水穿坏午中丁火，午火烤干丑中癸水和辛金
        if (DIZHI_CANGGAN['丑']) {
          Object.values(DIZHI_CANGGAN['丑']).forEach(canggan => {
            if (canggan.element === 'water' || canggan.element === 'metal') {
              scores[canggan.element].conflict -= 2.0;
            }
          });
        }
        if (DIZHI_CANGGAN['午']) {
          Object.values(DIZHI_CANGGAN['午']).forEach(canggan => {
            if (canggan.element === 'fire') {
              scores[canggan.element].conflict -= 1.5;
            }
          });
        }
      } else if ((zhi1 === '卯' && zhi2 === '辰') || (zhi1 === '辰' && zhi2 === '卯')) {
        // 卯辰穿：卯木穿坏辰中水，辰土腐蚀卯木
        if (DIZHI_CANGGAN['辰']) {
          Object.values(DIZHI_CANGGAN['辰']).forEach(canggan => {
            if (canggan.element === 'water') {
              scores[canggan.element].conflict -= 2.0;
            }
          });
        }
        if (DIZHI_CANGGAN['卯']) {
          Object.values(DIZHI_CANGGAN['卯']).forEach(canggan => {
            scores[canggan.element].conflict -= 2.0; // 卯木烂根
          });
        }
      } else if ((zhi1 === '酉' && zhi2 === '戌') || (zhi1 === '戌' && zhi2 === '酉')) {
        // 酉戌穿：戌火库穿坏酉金，酉金晦戌中丁火
        if (DIZHI_CANGGAN['酉']) {
          Object.values(DIZHI_CANGGAN['酉']).forEach(canggan => {
            scores[canggan.element].conflict -= 2.5; // 实体相穿，影响大
          });
        }
        if (DIZHI_CANGGAN['戌']) {
          Object.values(DIZHI_CANGGAN['戌']).forEach(canggan => {
            if (canggan.element === 'fire') {
              scores[canggan.element].conflict -= 2.0; // 丁火受晦
            }
          });
        }
      } else if ((zhi1 === '申' && zhi2 === '亥') || (zhi1 === '亥' && zhi2 === '申')) {
        // 申亥穿：申金穿坏亥中甲木，亥水化申中庚金
        if (DIZHI_CANGGAN['亥']) {
          Object.values(DIZHI_CANGGAN['亥']).forEach(canggan => {
            if (canggan.element === 'wood') {
              scores[canggan.element].conflict -= 2.0;
            }
          });
        }
        if (DIZHI_CANGGAN['申']) {
          Object.values(DIZHI_CANGGAN['申']).forEach(canggan => {
            if (canggan.element === 'metal') {
              scores[canggan.element].conflict -= 1.5;
            }
          });
        }
      } else if ((zhi1 === '寅' && zhi2 === '巳') || (zhi1 === '巳' && zhi2 === '寅')) {
        // 寅巳穿：寅木穿坏巳中戊土，巳火穿坏寅中甲木
        if (DIZHI_CANGGAN['寅']) {
          Object.values(DIZHI_CANGGAN['寅']).forEach(canggan => {
            if (canggan.element === 'wood') {
              scores[canggan.element].conflict -= 2.0; // 湿木被烧烤
            }
          });
        }
        if (DIZHI_CANGGAN['巳']) {
          Object.values(DIZHI_CANGGAN['巳']).forEach(canggan => {
            if (canggan.element === 'earth') {
              scores[canggan.element].conflict -= 1.5;
            } else if (canggan.element === 'fire') {
              scores[canggan.element].conflict -= 1.0; // 巳火也受伤
            }
          });
        }
      }
    }
  });

  // 相绝关系处理已移除（功能已在其他部分实现）
}

// 计算透干加成
function calculateTransparency(gans: string[], zhis: string[], scores: { [key in WuxingType]: any }) {
  gans.forEach(gan => {
    if (!gan || !TIANGAN_WUXING[gan]) return;
    
    const ganElement = TIANGAN_WUXING[gan];
    let isTransparent = false;
    let transparencyType = 'none';
    
    // 检查是否为透干
    zhis.forEach(zhi => {
      if (DIZHI_CANGGAN[zhi]) {
        Object.entries(DIZHI_CANGGAN[zhi]).forEach(([cangganGan, cangganInfo]) => {
          if (cangganInfo.element === ganElement) {
            isTransparent = true;
            // 判断透干类型
            if (cangganInfo.weight === 1.0) {
              transparencyType = 'benqi';
            } else if (cangganInfo.weight >= 0.5) {
              transparencyType = 'yuqi';
            } else {
              transparencyType = 'zhongqi';
            }
          }
        });
      }
    });
    
    if (isTransparent) {
      let bonus = 0;
      if (transparencyType === 'benqi') {
        bonus = 2;
      } else if (transparencyType === 'yuqi') {
        bonus = ganElement === 'earth' ? 1.5 : 1;
      } else if (transparencyType === 'zhongqi') {
        bonus = ganElement === 'earth' ? 0.5 : 1;
      }
      scores[ganElement].transparency += bonus;
    }
  });
} 