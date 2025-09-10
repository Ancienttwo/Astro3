/**
 * 八字干支关系分析工具函数
 */

export interface BaziRelations {
  tianganWuhe: string[]; // 天干五合
  dizhiLiuhe: string[]; // 地支六合
  dizhiSanhui: string[]; // 地支三会
  dizhiSanhe: string[]; // 地支三合
  dizhiBanhe: string[]; // 地支半合
  dizhiGonghe: string[]; // 地支拱合
  dizhiChong: string[]; // 地支相冲
  dizhiChuanhai: string[]; // 地支相穿/害
  dizhiXing: string[]; // 地支相刑
  dizhiPo: string[]; // 地支相破
  dizhiJue: string[]; // 地支相绝
  angong: string[]; // 暗拱
}

// 天干五合映射表
const TIANGAN_WUHE_MAP = {
  '甲己': '合土', '己甲': '合土',
  '乙庚': '合金', '庚乙': '合金', 
  '丙辛': '合水', '辛丙': '合水',
  '丁壬': '合木', '壬丁': '合木',
  '戊癸': '合火', '癸戊': '合火'
} as const;

// 地支六合映射表
const DIZHI_LIUHE_MAP = {
  '子丑': '合土', '丑子': '合土',
  '寅亥': '合木', '亥寅': '合木',
  '卯戌': '合火', '戌卯': '合火',
  '辰酉': '合金', '酉辰': '合金',
  '巳申': '合水', '申巳': '合水',
  '午未': '合火', '未午': '合火'
} as const;

// 地支三会映射表
const DIZHI_SANHUI_MAP = {
  '寅卯辰': '会东方木', 
  '巳午未': '会南方火', 
  '申酉戌': '会西方金', 
  '亥子丑': '会北方水'
} as const;

// 地支三合映射表
const DIZHI_SANHE_MAP = {
  '寅午戌': '合火', 
  '巳酉丑': '合金', 
  '亥卯未': '合木', 
  '申子辰': '合水'
} as const;

// 地支半合映射表
const DIZHI_BANHE_MAP = {
  '寅午': '半合火', '午寅': '半合火', '午戌': '半合火', '戌午': '半合火',
  '巳酉': '半合金', '酉巳': '半合金', '酉丑': '半合金', '丑酉': '半合金',
  '亥卯': '半合木', '卯亥': '半合木', '卯未': '半合木', '未卯': '半合木',
  '申子': '半合水', '子申': '半合水', '子辰': '半合水', '辰子': '半合水'
} as const;

// 地支拱合映射表
const DIZHI_GONGHE_MAP = {
  '寅戌': '拱午合火', '戌寅': '拱午合火',
  '巳丑': '拱酉合金', '丑巳': '拱酉合金',
  '亥未': '拱卯合木', '未亥': '拱卯合木',
  '申辰': '拱子合水', '辰申': '拱子合水'
} as const;

// 地支相冲映射表
const DIZHI_CHONG_MAP = {
  '子': '午', '丑': '未', '寅': '申', '卯': '酉', '辰': '戌', '巳': '亥',
  '午': '子', '未': '丑', '申': '寅', '酉': '卯', '戌': '辰', '亥': '巳'
} as const;

// 地支相穿映射表
const DIZHI_CHUAN_MAP = {
  '子': '未', '丑': '午', '寅': '巳', '卯': '辰', '申': '亥', '酉': '戌',
  '未': '子', '午': '丑', '巳': '寅', '辰': '卯', '亥': '申', '戌': '酉'
} as const;

// 地支相破映射表
const DIZHI_PO_MAP = {
  '子': '酉', '卯': '午', '辰': '丑', '未': '戌', '寅': '亥', '巳': '申',
  '酉': '子', '午': '卯', '丑': '辰', '戌': '未', '亥': '寅', '申': '巳'
} as const;

// 地支相绝映射表
const DIZHI_JUE_MAP = {
  '寅': '酉', '卯': '申', '午': '亥', '子': '巳',
  '酉': '寅', '申': '卯', '亥': '午', '巳': '子'
} as const;

// 自刑映射表
const ZIXING_MAP = { 
  '辰': '辰自刑', 
  '酉': '酉自刑', 
  '亥': '亥自刑', 
  '午': '午自刑' 
} as const;

// 地支顺序
const DIZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 分析八字中的干支关系
 * @param bazi 八字数组 [年干, 年支, 月干, 月支, 日干, 日支, 时干, 时支]
 * @returns 干支关系分析结果
 */
export function analyzeBaziRelations(bazi: string[]): BaziRelations {
  const relations: BaziRelations = {
    tianganWuhe: [],
    dizhiLiuhe: [],
    dizhiSanhui: [],
    dizhiSanhe: [],
    dizhiBanhe: [],
    dizhiGonghe: [],
    dizhiChong: [],
    dizhiChuanhai: [],
    dizhiXing: [],
    dizhiPo: [],
    dizhiJue: [],
    angong: []
  };

  const tiangans = [bazi[0], bazi[2], bazi[4], bazi[6]];
  const dizhis = [bazi[1], bazi[3], bazi[5], bazi[7]];
  const tianganPositions = ['年', '月', '日', '时'];
  const dizhiPositions = ['年', '月', '日', '时'];

  // 天干五合检测
  for (let i = 0; i < tiangans.length; i++) {
    for (let j = i + 1; j < tiangans.length; j++) {
      const pair = tiangans[i] + tiangans[j];
      if (TIANGAN_WUHE_MAP[pair as keyof typeof TIANGAN_WUHE_MAP]) {
        relations.tianganWuhe.push(
          `${tianganPositions[i]}干${tiangans[i]}与${tianganPositions[j]}干${tiangans[j]}${TIANGAN_WUHE_MAP[pair as keyof typeof TIANGAN_WUHE_MAP]}`
        );
      }
    }
  }

  // 地支六合检测
  for (let i = 0; i < dizhis.length; i++) {
    for (let j = i + 1; j < dizhis.length; j++) {
      const pair = dizhis[i] + dizhis[j];
      if (DIZHI_LIUHE_MAP[pair as keyof typeof DIZHI_LIUHE_MAP]) {
        relations.dizhiLiuhe.push(
          `${dizhiPositions[i]}支${dizhis[i]}与${dizhiPositions[j]}支${dizhis[j]}${DIZHI_LIUHE_MAP[pair as keyof typeof DIZHI_LIUHE_MAP]}`
        );
      }
    }
  }

  // 地支三会检测
  const dizhiSet = new Set(dizhis);
  Object.keys(DIZHI_SANHUI_MAP).forEach(pattern => {
    const chars = pattern.split('');
    if (chars.every(char => dizhiSet.has(char))) {
      relations.dizhiSanhui.push(pattern + DIZHI_SANHUI_MAP[pattern as keyof typeof DIZHI_SANHUI_MAP]);
    }
  });

  // 地支三合检测
  Object.keys(DIZHI_SANHE_MAP).forEach(pattern => {
    const chars = pattern.split('');
    if (chars.every(char => dizhiSet.has(char))) {
      relations.dizhiSanhe.push(pattern + DIZHI_SANHE_MAP[pattern as keyof typeof DIZHI_SANHE_MAP]);
    }
  });

  // 地支半合检测
  for (let i = 0; i < dizhis.length; i++) {
    for (let j = i + 1; j < dizhis.length; j++) {
      const pair = dizhis[i] + dizhis[j];
      if (DIZHI_BANHE_MAP[pair as keyof typeof DIZHI_BANHE_MAP]) {
        relations.dizhiBanhe.push(
          `${dizhiPositions[i]}支${dizhis[i]}与${dizhiPositions[j]}支${dizhis[j]}${DIZHI_BANHE_MAP[pair as keyof typeof DIZHI_BANHE_MAP]}`
        );
      }
    }
  }

  // 地支拱合检测
  for (let i = 0; i < dizhis.length; i++) {
    for (let j = i + 1; j < dizhis.length; j++) {
      const pair = dizhis[i] + dizhis[j];
      if (DIZHI_GONGHE_MAP[pair as keyof typeof DIZHI_GONGHE_MAP]) {
        relations.dizhiGonghe.push(`${dizhis[i]}${dizhis[j]}${DIZHI_GONGHE_MAP[pair as keyof typeof DIZHI_GONGHE_MAP]}`);
      }
    }
  }

  // 地支相冲检测
  for (let i = 0; i < dizhis.length; i++) {
    for (let j = i + 1; j < dizhis.length; j++) {
      if (DIZHI_CHONG_MAP[dizhis[i] as keyof typeof DIZHI_CHONG_MAP] === dizhis[j]) {
        relations.dizhiChong.push(`${dizhiPositions[i]}支${dizhis[i]}与${dizhiPositions[j]}支${dizhis[j]}相冲`);
      }
    }
  }

  // 地支相穿检测
  for (let i = 0; i < dizhis.length; i++) {
    for (let j = i + 1; j < dizhis.length; j++) {
      if (DIZHI_CHUAN_MAP[dizhis[i] as keyof typeof DIZHI_CHUAN_MAP] === dizhis[j]) {
        relations.dizhiChuanhai.push(`${dizhiPositions[i]}支${dizhis[i]}与${dizhiPositions[j]}支${dizhis[j]}相穿`);
      }
    }
  }

  // 地支相刑检测
  // 子卯刑
  if (dizhiSet.has('子') && dizhiSet.has('卯')) {
    relations.dizhiXing.push('子卯刑');
  }
  // 寅巳申三刑
  if (dizhiSet.has('寅') && dizhiSet.has('巳') && dizhiSet.has('申')) {
    relations.dizhiXing.push('寅巳申三刑');
  }
  // 丑戌未三刑  
  if (dizhiSet.has('丑') && dizhiSet.has('戌') && dizhiSet.has('未')) {
    relations.dizhiXing.push('丑戌未三刑');
  }
  // 自刑
  Object.keys(ZIXING_MAP).forEach(zhi => {
    const count = dizhis.filter(d => d === zhi).length;
    if (count >= 2) {
      relations.dizhiXing.push(ZIXING_MAP[zhi as keyof typeof ZIXING_MAP]);
    }
  });

  // 地支相破检测
  for (let i = 0; i < dizhis.length; i++) {
    for (let j = i + 1; j < dizhis.length; j++) {
      if (DIZHI_PO_MAP[dizhis[i] as keyof typeof DIZHI_PO_MAP] === dizhis[j]) {
        relations.dizhiPo.push(`${dizhis[i]}${dizhis[j]}相破`);
      }
    }
  }

  // 地支相绝检测
  for (let i = 0; i < dizhis.length; i++) {
    for (let j = i + 1; j < dizhis.length; j++) {
      if (DIZHI_JUE_MAP[dizhis[i] as keyof typeof DIZHI_JUE_MAP] === dizhis[j]) {
        relations.dizhiJue.push(`${dizhis[i]}${dizhis[j]}相绝`);
      }
    }
  }

  // 暗拱检测（相邻两柱天干相同，地支相隔一位）
  const ganzhiPairs = [
    [bazi[0], bazi[1]], // 年柱
    [bazi[2], bazi[3]], // 月柱
    [bazi[4], bazi[5]], // 日柱
    [bazi[6], bazi[7]]  // 时柱
  ];

  // 检查相邻两柱
  for (let i = 0; i < ganzhiPairs.length - 1; i++) {
    const [gan1, zhi1] = ganzhiPairs[i];
    const [gan2, zhi2] = ganzhiPairs[i + 1];
    
    // 天干相同
    if (gan1 === gan2) {
      const index1 = DIZHI_ORDER.indexOf(zhi1);
      const index2 = DIZHI_ORDER.indexOf(zhi2);
      
      // 地支相隔一位（考虑循环）
      const diff = Math.abs(index2 - index1);
      if (diff === 2 || diff === 10) { // 相隔一位或跨越子亥
        const middleIndex = diff === 2 
          ? Math.min(index1, index2) + 1 
          : (index1 === 0 || index2 === 0) ? 11 : 1;
        const middleZhi = DIZHI_ORDER[middleIndex];
        
        const pillarNames = ['年', '月', '日', '时'];
        relations.angong.push(`${pillarNames[i]}${pillarNames[i+1]}拱出${middleZhi}`);
      }
    }
  }

  return relations;
} 