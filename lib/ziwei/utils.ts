import { StarData, PalaceData } from '@/app/ziwei/page';
import { StarName, StarType } from '@/lib/zodiac/stars';
import { EarthlyBranch, EARTHLY_BRANCHES } from '@/lib/zodiac/branches';
import { HeavenlyStem } from '@/lib/zodiac/stems';
import { MAIN_STARS_INTERPRETATIONS } from '@/lib/data/main-stars';

export const PALACE_NAMES = [
  "命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄",
  "迁移", "交友", "官禄", "田宅", "福德", "父母"
] as const;

export const CATEGORIES = [
  { key: 'friends', label: '朋友', icon: '👥' },
  { key: 'family', label: '家人', icon: '❤️' },
  { key: 'clients', label: '客户', icon: '💼' },
  { key: 'favorites', label: '最爱', icon: '⭐' },
  { key: 'others', label: '其他', icon: '📁' },
] as const;

export const getMingZhu = (lifePalaceBranch: EarthlyBranch): StarName => {
  const branchIndex = EARTHLY_BRANCHES.indexOf(lifePalaceBranch);
  const mingZhuStars = [
    '贪狼', '巨门', '存保', '文曲', '廉贞', '武曲',
    '破军', '武曲', '廉贞', '文曲', '存保', '巨门'
  ] as unknown as StarName[];
  return mingZhuStars[branchIndex];
};

export const getShenZhu = (birthYearBranch: EarthlyBranch): StarName => {
  const branchIndex = EARTHLY_BRANCHES.indexOf(birthYearBranch);
  const shenZhuStars: StarName[] = [
    '文曲', '文昌', '廉贞', '破军', '武曲', '文曲',
    '天同', '天机', '紫微', '太阳', '巨门', '太阴'
  ];
  return shenZhuStars[branchIndex];
};

export const getStarsByType = (stars: StarData[]) => {
  const mainStars = stars.filter(s => String(s.type) === '主星');
  const auxiliaryStars = stars.filter(s => String(s.type) === '辅星');
  const blessingsStars = stars.filter(s => String(s.type) === '吉星');
  const inauspiciousStars = stars.filter(s => String(s.type) === '煞星');
  const miscStars = stars.filter(s => String(s.type) === '杂星');

  return { mainStars, auxiliaryStars, blessingsStars, inauspiciousStars, miscStars };
};

export const getMainStarInterpretation = (palaces: PalaceData[]) => {
  const lifePalace = palaces.find(p => p.name === '命宫');
  const mainStars = lifePalace?.stars?.filter(s => s.type === '主星') || [];
  
  if (mainStars.length === 0) return null;

  const migrationPalace = palaces.find(p => p.name === '迁移');
  if (migrationPalace) {
    const migrationMainStars = migrationPalace?.stars?.filter(s => s.type === '主星') || [];
    
    if (migrationMainStars.length > 0) {
      const combination = `${mainStars[0].name}+${migrationMainStars[0].name}`;
      if (MAIN_STARS_INTERPRETATIONS[combination]) {
        return MAIN_STARS_INTERPRETATIONS[combination];
      }
    }
  }

  return MAIN_STARS_INTERPRETATIONS[mainStars[0].name] || null;
};

export const getDestinyArrowAnalysis = (palaces: PalaceData[]) => {
  const lifePalace = palaces.find(p => p.name === '命宫');
  const bodyPalace = palaces.find(p => p.isShenGong);
  
  if (!lifePalace || !bodyPalace) return null;

  const lifePalaceStars = lifePalace.stars || [];
  const bodyPalaceStars = bodyPalace.stars || [];
  
  const hasDestinyArrow = lifePalaceStars.some(s => String(s.name) === '命宫箭') || 
                         bodyPalaceStars.some(s => String(s.name) === '身宫箭');
  
  if (!hasDestinyArrow) return null;

  return {
    hasDestinyArrow: true,
    analysis: "此人具有命宫箭或身宫箭的特质，需要特别注意相关影响...",
    suggestions: [
      "注意身体健康，避免意外伤害",
      "在重要决策时多加谨慎",
      "培养耐心和稳定性"
    ]
  };
};

export const buildCompleteSihuaQuery = (palaces: PalaceData[], yearGan: HeavenlyStem) => {
  const queries: string[] = [];
  const addedCombinations = new Set<string>();

  palaces.forEach(palace => {
    if (!palace.stars) return;

    const sihuaStars = palace.stars.filter(star => star.sihua);
    sihuaStars.forEach(star => {
      const key = `${star.sihua}_${star.name}_${palace.name}`;
      if (!addedCombinations.has(key)) {
        addedCombinations.add(key);
        
        const sihuaMarks: string[] = [];
        switch (star.sihua) {
          case 'A': sihuaMarks.push('化禄'); break;
          case 'B': sihuaMarks.push('化权'); break;
          case 'C': sihuaMarks.push('化科'); break;
          case 'D': sihuaMarks.push('化忌'); break;
        }

        if (sihuaMarks.length > 0) {
          queries.push(`${yearGan}年${star.name}在${palace.name}${sihuaMarks.join('')}的含义`);
        }
      }
    });
  });

  return queries.length > 0 ? queries.join('，') : '';
};

export const calculateLunarMonth = (palaces: PalaceData[], currentMonth: number = new Date().getMonth() + 1) => {
  const yinPalaceIndex = palaces.findIndex(p => p.branch === '寅');
  if (yinPalaceIndex === -1) return palaces;

  const LUNAR_MONTH_NAMES = ["正月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "冬月", "腊月"];

  return palaces.map((palace, index) => {
    const monthOffset = (index - yinPalaceIndex + 12) % 12;
    const lunarMonthIndex = (currentMonth - 1 + monthOffset) % 12;
    
    return {
      ...palace,
      lunarMonth: LUNAR_MONTH_NAMES[lunarMonthIndex],
      isCurrentMonth: lunarMonthIndex === (currentMonth - 1)
    };
  });
};
