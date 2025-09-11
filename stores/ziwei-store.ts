import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { HeavenlyStem } from '@/lib/zodiac/stems';
import { EarthlyBranch } from '@/lib/zodiac/branches';
import { FiveElementsBureau } from '@/lib/zodiac/five-elements-bureau';
import { StarName, StarBrightness, StarType, STARS, getStarBrightness } from '@/lib/zodiac/stars';
import { produce } from 'immer';
import { Solar } from '@/lib/lunar';
import { FIVE_TIGER_DUN } from '@/lib/zodiac/five-tiger-dun';
import { HEAVENLY_STEMS, STEM_YIN_YANG } from '@/lib/zodiac/stems';
import { EARTHLY_BRANCHES } from '@/lib/zodiac/branches';
import { getFiveElementsBureau, BUREAU_TO_NUMBER } from '@/lib/zodiac/five-elements-bureau';
import { SIHUA_MAP } from '@/lib/zodiac/sihua';
import { getZiweiPosition } from '@/lib/zodiac/ziwei-position';

const PALACE_NAMES = [
  '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
  '迁移', '交友', '官禄', '田宅', '福德', '父母'
];

// 数据类型定义
export interface StarData {
  name: StarName;
  brightness: StarBrightness;
  type: StarType;
  sihua?: 'A' | 'B' | 'C' | 'D';
  palaceHua?: string[];
}

export interface PalaceData {
  id: number;
  name: string;
  branch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
  isLaiYinPalace: boolean;
  isShenGong: boolean;
  decade: string; // e.g., "6-15"
  decadeIndex: number;
  fiveElementsBureau?: FiveElementsBureau;
  yearlyLuck?: { year: number; age: number; };
  yearlyName?: string;
  stars?: StarData[];
}

export interface ZiweiResult {
  palaces: PalaceData[];
  basePalaces: PalaceData[];
  decadePalaces: PalaceData[];
  lunarDate: string;
  fiveElementsBureau?: FiveElementsBureau;
  mingZhu: string;
  shenZhu: string;
  gender: 'male' | 'female';
  selectedIndex: number | null;
  yearGan: HeavenlyStem;
  sihuaInfo?: {
    lu: string;
    quan: string;
    ke: string;
    ji: string;
  } | null;
}

export interface BirthData {
  username: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'male' | 'female' | '';
  category: string;
}

// Store状态接口
interface ZiweiState {
  // 基础数据
  birthData: BirthData;
  ziweiResult: ZiweiResult | null;
  
  // 计算状态
  isCalculating: boolean;
  calculationError: string | null;
  
  // 选择状态
  selectedDecadeIndex: number | null;
  selectedYearlyIndex: number | null;
  selectedPalaceForSihua: PalaceData | null;
  sihuaDisplay: string[];
  
  // UI 状态
  pendingSave: boolean;
  showMenu: boolean; // 新添加
  
  // 操作方法
  setBirthData: (data: Partial<BirthData>) => void;
  setZiweiResult: (result: ZiweiResult | null) => void;
  setCalculating: (calculating: boolean) => void;
  setCalculationError: (error: string | null) => void;
  setSelectedDecadeIndex: (index: number | null) => void;
  setSelectedYearlyIndex: (index: number | null) => void;
  setSelectedPalaceForSihua: (palace: PalaceData | null) => void;
  setSihuaDisplay: (display: string[]) => void;
  setPendingSave: (pending: boolean) => void;
  setShowMenu: (show: boolean) => void; // 新添加
  calculateZiwei: () => void; // 新添加占位
  // 复合操作
  resetCalculation: () => void;
  resetSelections: () => void;
  updateBirthData: (field: keyof BirthData, value: string) => void;
}

// 初始状态
const initialBirthData: BirthData = {
  username: "",
  year: "",
  month: "",
  day: "",
  hour: "",
  gender: "",
  category: "others",
};

// 添加辅助函数
const getMingZhu = (lifePalaceBranch: EarthlyBranch): StarName => {
  const map: Record<EarthlyBranch, StarName> = {
    '子': '贪狼', '丑': '巨门', '寅': '禄存', '卯': '文曲',
    '辰': '廉贞', '巳': '武曲', '午': '破军', '未': '武曲',
    '申': '廉贞', '酉': '文曲', '戌': '禄存', '亥': '巨门',
  };
  return map[lifePalaceBranch];
};

const getShenZhu = (birthYearBranch: EarthlyBranch): StarName => {
  const map: Record<EarthlyBranch, StarName> = {
    '子': '火星', '丑': '天相', '寅': '天梁', '卯': '天同',
    '辰': '文昌', '巳': '天机', '午': '铃星', '未': '天相',
    '申': '天梁', '酉': '天同', '戌': '文昌', '亥': '天机',
  };
  return map[birthYearBranch];
};

const arrangePalaceStars = (
  fiveElementsBureau: FiveElementsBureau,
  lunarDay: number,
  lunarMonth: number,
  lunarHourIndex: number,
  yearZhi: EarthlyBranch,
  yearGan: HeavenlyStem
): Map<EarthlyBranch, StarData[]> => {
  const starMap = new Map<EarthlyBranch, StarData[]>();
  
  const sihuaStars = SIHUA_MAP[yearGan];
  const sihuaReverseMap: Partial<Record<StarName, 'A' | 'B' | 'C' | 'D'>> = {};
  if (sihuaStars) {
    sihuaReverseMap[sihuaStars['禄']] = 'A';
    sihuaReverseMap[sihuaStars['权']] = 'B';
    sihuaReverseMap[sihuaStars['科']] = 'C';
    sihuaReverseMap[sihuaStars['忌']] = 'D';
  }

  const addStar = (branch: EarthlyBranch, starName: StarName) => {
    if (!starMap.has(branch)) starMap.set(branch, []);
    const starDef = STARS[starName];
    if (starDef) {
      const brightness = getStarBrightness(starName, branch);
      starMap.get(branch)?.push({ 
        name: starName, 
        brightness: brightness, 
        type: starDef.type,
        sihua: sihuaReverseMap[starName]
      });
    }
  };

  // 1. 安紫微星系
  const ziweiPos = getZiweiPosition(fiveElementsBureau, lunarDay);
  if (ziweiPos) {
    const ziweiPosIndex = EARTHLY_BRANCHES.indexOf(ziweiPos);
    
    addStar(ziweiPos, '紫微');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 1 + 12) % 12], '天机');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 3 + 12) % 12], '太阳');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 4 + 12) % 12], '武曲');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 5 + 12) % 12], '天同');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 8 + 12) % 12], '廉贞');

    // 2. 安天府星系
    const tianfuPosIndex = (12 - ziweiPosIndex + 4) % 12;
    addStar(EARTHLY_BRANCHES[tianfuPosIndex], '天府');
    addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 1) % 12], '太阴');
    addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 2) % 12], '贪狼');
    addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 3) % 12], '巨门');
    addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 4) % 12], '天相');
    addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 5) % 12], '天梁');
    addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 6) % 12], '七杀');
    addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 10) % 12], '破军');

    // 3. 安辅星
    const wenchengPosIndex = (10 - lunarHourIndex + 12) % 12;
    addStar(EARTHLY_BRANCHES[wenchengPosIndex], '文昌');
    
    const wenquPosIndex = (4 + lunarHourIndex) % 12;
    addStar(EARTHLY_BRANCHES[wenquPosIndex], '文曲');

    const zuofuPosIndex = (4 + (lunarMonth - 1)) % 12;
    addStar(EARTHLY_BRANCHES[zuofuPosIndex], '左辅');

    const youbiPosIndex = (10 - (lunarMonth - 1) + 12) % 12;
    addStar(EARTHLY_BRANCHES[youbiPosIndex], '右弼');
    
    // 4. 安天魁、天钺、天马
    const tiankuiMap: { [key in HeavenlyStem]?: EarthlyBranch } = {
      '甲': '丑', '戊': '丑', '庚': '丑', '乙': '子', '己': '子', 
      '丙': '亥', '丁': '亥', '壬': '卯', '癸': '卯', '辛': '寅'
    };
    const tianyueMap: { [key in HeavenlyStem]?: EarthlyBranch } = {
      '甲': '未', '戊': '未', '庚': '未', '乙': '申', '己': '申', 
      '丙': '酉', '丁': '酉', '壬': '巳', '癸': '巳', '辛': '午'
    };

    const tiankuiPos = tiankuiMap[yearGan];
    if (tiankuiPos) addStar(tiankuiPos, '天魁');
    
    const tianyuePos = tianyueMap[yearGan];
    if (tianyuePos) addStar(tianyuePos, '天钺');
    
    const tianmaMap: { [key in EarthlyBranch]?: EarthlyBranch } = {
      '寅': '申', '午': '申', '戌': '申', 
      '申': '寅', '子': '寅', '辰': '寅',
      '亥': '巳', '卯': '巳', '未': '巳',
      '巳': '亥', '酉': '亥', '丑': '亥'
    };
    const tianmaPos = tianmaMap[yearZhi];
    if (tianmaPos) addStar(tianmaPos, '天马');

    // 5. 安禄存、擎羊、陀罗
    const lucunMap: { [key in HeavenlyStem]?: EarthlyBranch } = {
      '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午',
      '戊': '巳', '己': '午', '庚': '申', '辛': '酉',
      '壬': '亥', '癸': '子'
    };
    const lucunPos = lucunMap[yearGan];
    if (lucunPos) {
      addStar(lucunPos, '禄存');
      const lucunPosIndex = EARTHLY_BRANCHES.indexOf(lucunPos);
      addStar(EARTHLY_BRANCHES[(lucunPosIndex + 1) % 12], '擎羊');
      addStar(EARTHLY_BRANCHES[(lucunPosIndex - 1 + 12) % 12], '陀罗');
    }

    // 6. 安火星、铃星
    const yearZhiIndex = EARTHLY_BRANCHES.indexOf(yearZhi);
    const huoxingBaseMap: { [key in EarthlyBranch]?: EarthlyBranch } = {
       '寅': '丑', '午': '丑', '戌': '丑',
       '申': '寅', '子': '寅', '辰': '寅',
       '巳': '卯', '酉': '卯', '丑': '卯'
    };
    const huoxingBaseBranch = huoxingBaseMap[yearZhi];
    if (huoxingBaseBranch) {
      const huoxingStartIndex = EARTHLY_BRANCHES.indexOf(huoxingBaseBranch);
      const huoxingPosIndex = (huoxingStartIndex + lunarHourIndex) % 12;
      addStar(EARTHLY_BRANCHES[huoxingPosIndex], '火星');
    }

    const lingxingBaseBranch = yearZhi === '戌' ? '卯' : '戌';
    const lingxingStartIndex = EARTHLY_BRANCHES.indexOf(lingxingBaseBranch);
    const lingxingPosIndex = (lingxingStartIndex + lunarHourIndex) % 12;
    addStar(EARTHLY_BRANCHES[lingxingPosIndex], '铃星');
    
    // 7. 安地空、地劫
    const haiIndex = 11; // 亥
    const dikongPosIndex = (haiIndex - lunarHourIndex + 12) % 12;
    const dijiePosIndex = (haiIndex + lunarHourIndex) % 12;
    addStar(EARTHLY_BRANCHES[dikongPosIndex], '地空');
    addStar(EARTHLY_BRANCHES[dijiePosIndex], '地劫');

    // 8. 安桃花星
    const hongluanPosIndex = (3 - yearZhiIndex + 12) % 12;
    addStar(EARTHLY_BRANCHES[hongluanPosIndex], '红鸾');
    
    const tianxiPosIndex = (hongluanPosIndex + 6) % 12;
    addStar(EARTHLY_BRANCHES[tianxiPosIndex], '天喜');

    const tianyaoPosIndex = (1 + lunarMonth - 1) % 12;
    addStar(EARTHLY_BRANCHES[tianyaoPosIndex], '天姚');

    const tianxingPosIndex = (9 + lunarMonth - 1) % 12;
    addStar(EARTHLY_BRANCHES[tianxingPosIndex], '天刑');
  }

  return starMap;
};

const applyPalaceHua = (palaces: PalaceData[]): PalaceData[] => {
  return palaces.map(palace => {
    const updatedPalace = { ...palace };
    const palaceStem = palace.heavenlyStem;
    const sihuaForPalaceStem = SIHUA_MAP[palaceStem];
    
    if (!sihuaForPalaceStem) return updatedPalace;

    const sihuaReverseMap: Partial<Record<StarName, 'A' | 'B' | 'C' | 'D'>> = {
      [sihuaForPalaceStem['禄']]: 'A',
      [sihuaForPalaceStem['权']]: 'B',
      [sihuaForPalaceStem['科']]: 'C',
      [sihuaForPalaceStem['忌']]: 'D',
    };

    // 更新本宫星星的离心自化 (xM)
    const updatedStars = palace.stars ? palace.stars.map(star => {
      const huaLetter = sihuaReverseMap[star.name];
      if (huaLetter) {
        if (!star.palaceHua) star.palaceHua = [];
        star.palaceHua.push(`x${huaLetter}`);
      }
      return star;
    }) : [];

    // 更新对宫星星的向心自化 (iM)
    const oppositeBranchIndex = (EARTHLY_BRANCHES.indexOf(palace.branch) + 6) % 12;
    const oppositePalace = palaces.find(p => p.branch === EARTHLY_BRANCHES[oppositeBranchIndex]);
    if (oppositePalace?.stars) {
      oppositePalace.stars.forEach(star => {
        const huaLetter = sihuaReverseMap[star.name];
        if (huaLetter) {
          if (!star.palaceHua) star.palaceHua = [];
          star.palaceHua.push(`i${huaLetter}`);
        }
      });
    }

    updatedPalace.stars = updatedStars;
    return updatedPalace;
  });
};

const calculateSihuaInfo = (basePalaces: PalaceData[], yearGan: HeavenlyStem) => {
  const sihuaStars = SIHUA_MAP[yearGan];
  if (!sihuaStars) {
    console.error('❌ 无法获取生年四化星曜:', yearGan);
    return null;
  }

  const findStarPalace = (starName: string) => {
    for (const palace of basePalaces) {
      const foundStar = palace.stars?.find(star => star.name === starName);
      if (foundStar) {
        return `${palace.name}：${starName}`;
      }
    }
    return `${starName}(未入盘)`;
  };

  return {
    lu: findStarPalace(sihuaStars['禄']),
    quan: findStarPalace(sihuaStars['权']),
    ke: findStarPalace(sihuaStars['科']),
    ji: findStarPalace(sihuaStars['忌'])
  };
};

// 创建Store
export const useZiweiStore = create<ZiweiState>()(
  devtools(
    (set, get) => ({
      // 初始状态
      birthData: initialBirthData,
      ziweiResult: null,
      isCalculating: false,
      calculationError: null,
      selectedDecadeIndex: null,
      selectedYearlyIndex: null,
      selectedPalaceForSihua: null,
      sihuaDisplay: [],
      pendingSave: false,
      showMenu: false,

      // 基础设置方法
      setBirthData: (data) =>
        set(produce((state) => {
          Object.assign(state.birthData, data);
        }), false, 'setBirthData'),

      setZiweiResult: (result) =>
        set(produce((state) => {
          state.ziweiResult = result;
        }), false, 'setZiweiResult'),

      setCalculating: (calculating) =>
        set(produce((state) => {
          state.isCalculating = calculating;
        }), false, 'setCalculating'),

      setCalculationError: (error) =>
        set(produce((state) => {
          state.calculationError = error;
        }), false, 'setCalculationError'),

      setSelectedDecadeIndex: (index) =>
        set(produce((state) => {
          state.selectedDecadeIndex = index;
          state.selectedYearlyIndex = null; // 重置流年选择
          state.selectedPalaceForSihua = null // 重置宫位选择
        }), false, 'setSelectedDecadeIndex'),

      setSelectedYearlyIndex: (index) =>
        set(produce((state) => {
          state.selectedYearlyIndex = index;
          state.selectedPalaceForSihua = null // 重置宫位选择
        }), false, 'setSelectedYearlyIndex'),

      setSelectedPalaceForSihua: (palace) =>
        set(produce((state) => {
          state.selectedPalaceForSihua = palace;
        }), false, 'setSelectedPalaceForSihua'),

      setSihuaDisplay: (display) =>
        set(produce((state) => {
          state.sihuaDisplay = display;
        }), false, 'setSihuaDisplay'),

      setPendingSave: (pending) =>
        set(produce((state) => {
          state.pendingSave = pending;
        }), false, 'setPendingSave'),

      setShowMenu: (show) =>
        set(produce((state) => {
          state.showMenu = show;
        }), false, 'setShowMenu'),

      calculateZiwei: () =>
        set(produce((state) => {
          state.isCalculating = true;
          try {
            const { year, month, day, hour, gender } = state.birthData;
            const y = Number.parseInt(year);
            const m = Number.parseInt(month);
            const d = Number.parseInt(day);
            const h = Number.parseInt(hour);
            const solar = Solar.fromYmdHms(y, m, d, h, 0, 0);
            const lunar = solar.getLunar();
            const yearGan = lunar.getYearGan() as HeavenlyStem;
            const yearZhi = lunar.getYearZhi() as EarthlyBranch;
            const lunarMonth = lunar.getMonth();
            const lunarDay = lunar.getDay();
            const lunarHourIndex = lunar.getTimeZhiIndex();
            
            // 命宫计算
            const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
            const monthBranch = monthBranches[lunarMonth - 1];
            const monthBranchOrder = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
            const monthNumber = monthBranchOrder.indexOf(monthBranch) + 1;
            const hourNumber = lunarHourIndex + 1;
            const monthPalaceIndex = (2 + (monthNumber - 1)) % 12;
            const lifePalaceBranchIndex = (monthPalaceIndex - (hourNumber - 1) + 12) % 12;
            const lifePalaceBranch = EARTHLY_BRANCHES[lifePalaceBranchIndex];
            
            // 身宫计算
            const shenGongBranchIndex = (monthPalaceIndex + (hourNumber - 1)) % 12;
            
            // 五行局
            const fiveElementsBureau = getFiveElementsBureau(yearGan, lifePalaceBranch);
            if (!fiveElementsBureau) throw new Error('无法确定五行局');
            const bureauNumber = BUREAU_TO_NUMBER[fiveElementsBureau];
            
            // 大运顺逆
            const yearStemYinYang = STEM_YIN_YANG[yearGan];
            const isYangManOrYinWoman = (yearStemYinYang === '阳' && gender === 'male') || (yearStemYinYang === '阴' && gender === 'female');
            
            // 五虎遁
            const yinGan = FIVE_TIGER_DUN[yearGan];
            const yinGanIndex = HEAVENLY_STEMS.indexOf(yinGan);
            const palaceStems = EARTHLY_BRANCHES.map((_, branchIndex) => {
              const palaceStemIndex = (yinGanIndex + (branchIndex - 2) + 10) % 10;
              return HEAVENLY_STEMS[palaceStemIndex];
            });
            palaceStems[0] = palaceStems[2];
            palaceStems[1] = palaceStems[3];
            
            // 基础宫位
            let basePalaces = EARTHLY_BRANCHES.map((branch, branchIndex) => {
              const palaceStem = palaceStems[branchIndex];
              const palaceNameIndex = (lifePalaceBranchIndex - branchIndex + 12) % 12;
              const palaceName = PALACE_NAMES[palaceNameIndex];
              const di = isYangManOrYinWoman ? (branchIndex - lifePalaceBranchIndex + 12) % 12 : (lifePalaceBranchIndex - branchIndex + 12) % 12;
              const startAge = bureauNumber + di * 10;
              const endAge = startAge + 9;
              const decade = `${startAge}-${endAge}`;
              const decadeIndex = di;
              const isLaiYin = palaceStem === yearGan && branch !== '子' && branch !== '丑';
              return { 
                id: branchIndex, 
                name: palaceName, 
                branch, 
                heavenlyStem: palaceStem, 
                decade, 
                decadeIndex, 
                isLaiYinPalace: isLaiYin, 
                isShenGong: branchIndex === shenGongBranchIndex 
              };
            });
            
            // 安星
            const starMap = arrangePalaceStars(fiveElementsBureau, lunarDay, lunarMonth, lunarHourIndex, yearZhi, yearGan);
            
            // 分配星曜
            basePalaces = basePalaces.map(palace => ({
              ...palace,
              stars: starMap.get(palace.branch) || [],
            }));
            
            // 应用自化
            basePalaces = applyPalaceHua(basePalaces);
            
            // 生年四化
            const sihuaInfo = calculateSihuaInfo(basePalaces, yearGan);
            
            // 命主身主
            const mingZhu = getMingZhu(lifePalaceBranch);
            const shenZhu = getShenZhu(yearZhi);
            
            // 农历字符串
            const lunarString = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
            
            // 大运宫位
            const decadePalaces = [...basePalaces].sort((a, b) => (a.decadeIndex ?? 0) - (b.decadeIndex ?? 0));
            
            state.ziweiResult = {
              palaces: basePalaces,
              basePalaces,
              decadePalaces,
              lunarDate: lunarString,
              fiveElementsBureau,
              mingZhu,
              shenZhu,
              gender,
              selectedIndex: null,
              yearGan,
              sihuaInfo
            };
          } catch (error: any) {
            state.calculationError = (error && error.message) ? error.message : String(error);
          } finally {
            state.isCalculating = false;
          }
        }), false, 'calculateZiwei'),

      // 复合操作
      resetCalculation: () =>
        set(produce((state) => {
          state.ziweiResult = null;
          state.isCalculating = false;
          state.calculationError = null;
          state.selectedDecadeIndex = null;
          state.selectedYearlyIndex = null;
          state.selectedPalaceForSihua = null;
          state.sihuaDisplay = [];
          state.pendingSave = false
        }), false, 'resetCalculation'),

      resetSelections: () =>
        set(produce((state) => {
          state.selectedDecadeIndex = null;
          state.selectedYearlyIndex = null;
          state.selectedPalaceForSihua = null;
          state.sihuaDisplay = [];
        }), false, 'resetSelections'),

      updateBirthData: (field, value) =>
        set(produce((state) => {
          state.birthData[field] = value;
        }), false, 'updateBirthData'),
    }),
    {
      name: 'ziwei-store', // DevTools中的名称
    }
  )
);

// 选择器函数 - 方便组件使用
export const selectBirthData = (state: ZiweiState) => state.birthData;
export const selectZiweiResult = (state: ZiweiState) => state.ziweiResult;
export const selectIsCalculating = (state: ZiweiState) => state.isCalculating;
export const selectCalculationError = (state: ZiweiState) => state.calculationError;
export const selectSelectedDecadeIndex = (state: ZiweiState) => state.selectedDecadeIndex;
export const selectSelectedYearlyIndex = (state: ZiweiState) => state.selectedYearlyIndex;
export const selectSelectedPalaceForSihua = (state: ZiweiState) => state.selectedPalaceForSihua;
export const selectSihuaDisplay = (state: ZiweiState) => state.sihuaDisplay;
export const selectShowMenu = (state: ZiweiState) => state.showMenu;

// 复合选择器
export const selectIsFormValid = (state: ZiweiState) => {
  const { birthData } = state;
  return !!(
    birthData.username && 
    birthData.year && 
    birthData.month && 
    birthData.day && 
    birthData.hour && 
    birthData.gender
  );
};

export const selectHasResult = (state: ZiweiState) => !!state.ziweiResult;

export const selectCanSelectDecade = (state: ZiweiState) => 
  !!(state.ziweiResult && state.ziweiResult.decadePalaces.length > 0);

export const selectCurrentDecade = (state: ZiweiState) => {
  const { ziweiResult, selectedDecadeIndex } = state;
  if (!ziweiResult || selectedDecadeIndex === null) return null;
  return ziweiResult.decadePalaces[selectedDecadeIndex] || null;
}; 

// 选择器 - 用于获取衍生状态
export const useZiweiSelectors = () => {
  const store = useZiweiStore();
  
  return {
    // 基础数据
    birthData: store.birthData,
    ziweiResult: store.ziweiResult,
    
    // 计算状态
    isCalculating: store.isCalculating,
    calculationError: store.calculationError,
    
    // 选择状态
    selectedDecadeIndex: store.selectedDecadeIndex,
    selectedYearlyIndex: store.selectedYearlyIndex,
    selectedPalaceForSihua: store.selectedPalaceForSihua,
    sihuaDisplay: store.sihuaDisplay,
    showMenu: store.showMenu,
    
    // 衍生状态
    hasValidBirthData: store.birthData.year && store.birthData.month && 
                       store.birthData.day && store.birthData.hour && 
                       store.birthData.gender && store.birthData.username,
    
    hasZiweiResult: !!store.ziweiResult,
    
    // 检查是否需要保存
    shouldSave: store.pendingSave && !!store.ziweiResult && 
               store.birthData.username && store.birthData.year,
  };
};

// 操作方法选择器
export const useZiweiActions = () => {
  const store = useZiweiStore();
  
  return {
    setBirthData: store.setBirthData,
    setZiweiResult: store.setZiweiResult,
    setCalculating: store.setCalculating,
    setCalculationError: store.setCalculationError,
    setSelectedDecadeIndex: store.setSelectedDecadeIndex,
    setSelectedYearlyIndex: store.setSelectedYearlyIndex,
    setSelectedPalaceForSihua: store.setSelectedPalaceForSihua,
    setSihuaDisplay: store.setSihuaDisplay,
    setShowMenu: store.setShowMenu,
    calculateZiwei: store.calculateZiwei,
    resetCalculation: store.resetCalculation,
    resetSelections: store.resetSelections,
    updateBirthData: store.updateBirthData,
    
    // 添加缺失的方法
    setPendingSave: (pending: boolean) => {
      store.setPendingSave(pending);
    },
    loadChartData: (chartData: any) => {
      const newBirthData = {
        username: chartData.name,
        year: chartData.birth_year.toString(),
        month: chartData.birth_month.toString(),
        day: chartData.birth_day.toString(),
        hour: chartData.birth_hour.toString(),
        gender: chartData.gender,
        category: chartData.category || 'others'
      };
      
      store.setBirthData(newBirthData);
    },
  };
};

// 导出类型
export type { ZiweiState }; 
