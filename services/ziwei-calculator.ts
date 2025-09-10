import { Solar } from 'lunar-typescript';
import { FIVE_TIGER_DUN } from '@/lib/zodiac/five-tiger-dun';
import { HeavenlyStem, HEAVENLY_STEMS, STEM_YIN_YANG } from '@/lib/zodiac/stems';
import { EARTHLY_BRANCHES, EarthlyBranch } from '@/lib/zodiac/branches';
import { getFiveElementsBureau, FiveElementsBureau, BUREAU_TO_NUMBER } from '@/lib/zodiac/five-elements-bureau';
import { getZiweiPosition } from '@/lib/zodiac/ziwei-position';
import { StarName, STARS, getStarBrightness } from '@/lib/zodiac/stars';
import { SIHUA_MAP } from '@/lib/zodiac/sihua';
import { BirthData, ZiweiResult, PalaceData, StarData } from '@/stores/ziwei-store';

// 宫位名称常量
const PALACE_NAMES = [
  "命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄",
  "迁移", "交友", "官禄", "田宅", "福德", "父母"
];

// 错误类型定义
export class ZiweiCalculationError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'ZiweiCalculationError';
  }
}

// 计算参数接口
export interface CalculationParams {
  birthData: BirthData;
  selectedDecadeIndex?: number | null;
  selectedYearlyIndex?: number | null;
}

// 计算结果接口
export interface CalculationResult {
  success: boolean;
  result?: ZiweiResult;
  error?: string;
}

/**
 * 获取命主和身主
 */
function getMingZhu(lifePalaceBranch: EarthlyBranch): StarName {
  const map: Record<EarthlyBranch, StarName> = {
    '子': '贪狼', '丑': '巨门', '寅': '禄存', '卯': '文曲',
    '辰': '廉贞', '巳': '武曲', '午': '破军', '未': '武曲',
    '申': '廉贞', '酉': '文曲', '戌': '禄存', '亥': '巨门',
  };
  return map[lifePalaceBranch];
}

function getShenZhu(birthYearBranch: EarthlyBranch): StarName {
  const map: Record<EarthlyBranch, StarName> = {
    '子': '火星', '丑': '天相', '寅': '天梁', '卯': '天同',
    '辰': '文昌', '巳': '天机', '午': '铃星', '未': '天相',
    '申': '天梁', '酉': '天同', '戌': '文昌', '亥': '天机',
  };
  return map[birthYearBranch];
}

/**
 * 安星函数 - 根据五行局和农历日期安排所有星曜
 */
function arrangePalaceStars(
  fiveElementsBureau: FiveElementsBureau,
  lunarDay: number,
  lunarMonth: number,
  lunarHourIndex: number,
  yearZhi: EarthlyBranch,
  yearGan: HeavenlyStem
): Map<EarthlyBranch, StarData[]> {
  const starMap = new Map<EarthlyBranch, StarData[]>();
  
  // 0. 定四化
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
        sihua: sihuaReverseMap[starName],
        palaceHua: []
      });
    }
  };

  // 1. 安紫微星系
  const ziweiPos = getZiweiPosition(fiveElementsBureau, lunarDay);
  if (ziweiPos) {
    const ziweiPosIndex = EARTHLY_BRANCHES.indexOf(ziweiPos);
    
    // 紫微星系 (逆时针)
    addStar(ziweiPos, '紫微');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 1 + 12) % 12], '天机');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 3 + 12) % 12], '太阳');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 4 + 12) % 12], '武曲');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 5 + 12) % 12], '天同');
    addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 8 + 12) % 12], '廉贞');

    // 2. 安天府星系 (顺时针)
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
    const wenchengPosIndex = (10 - lunarHourIndex + 12) % 12; // 戌起子，逆数到生时
    addStar(EARTHLY_BRANCHES[wenchengPosIndex], '文昌');
    
    const wenquPosIndex = (4 + lunarHourIndex) % 12; // 辰起子，顺数到生时
    addStar(EARTHLY_BRANCHES[wenquPosIndex], '文曲');

    const zuofuPosIndex = (4 + (lunarMonth - 1)) % 12; // 辰起正月，顺数
    addStar(EARTHLY_BRANCHES[zuofuPosIndex], '左辅');

    const youbiPosIndex = (10 - (lunarMonth - 1) + 12) % 12; // 戌起正月，逆数
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
      // 擎羊在禄存后一位，陀罗在禄存前一位
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

    const lingxingBaseBranch = yearZhi === '戌' ? '卯' : '戌'; // 戌年起卯，其余皆起戌
    const lingxingStartIndex = EARTHLY_BRANCHES.indexOf(lingxingBaseBranch);
    const lingxingPosIndex = (lingxingStartIndex + lunarHourIndex) % 12;
    addStar(EARTHLY_BRANCHES[lingxingPosIndex], '铃星');
    
    // 7. 安地空、地劫
    const haiIndex = 11; // 亥
    const dikongPosIndex = (haiIndex - lunarHourIndex + 12) % 12; // 从亥宫起子，逆数到生时
    const dijiePosIndex = (haiIndex + lunarHourIndex) % 12;      // 从亥宫起子，顺数到生时
    addStar(EARTHLY_BRANCHES[dikongPosIndex], '地空');
    addStar(EARTHLY_BRANCHES[dijiePosIndex], '地劫');

    // 8. 安桃花星
    const hongluanPosIndex = (3 - yearZhiIndex + 12) % 12; // 卯宫起子, 逆数到生年支
    addStar(EARTHLY_BRANCHES[hongluanPosIndex], '红鸾');
    
    const tianxiPosIndex = (hongluanPosIndex + 6) % 12; // 天喜在红鸾对宫
    addStar(EARTHLY_BRANCHES[tianxiPosIndex], '天喜');

    const tianyaoPosIndex = (1 + lunarMonth - 1) % 12; // 丑宫起正月, 顺数到生月
    addStar(EARTHLY_BRANCHES[tianyaoPosIndex], '天姚');

    const tianxingPosIndex = (9 + lunarMonth - 1) % 12; // 酉宫起正月, 顺数到生月
    addStar(EARTHLY_BRANCHES[tianxingPosIndex], '天刑');
  }

  return starMap;
}

/**
 * 应用宫干四化 - 自化系统
 */
function applyPalaceHua(palaces: PalaceData[]): PalaceData[] {
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

    // 复制星曜数组，避免修改原始数据
    const updatedStars = palace.stars ? [...palace.stars] : [];

    // a. 本宫四化 (xM)
    updatedStars.forEach(star => {
      const huaLetter = sihuaReverseMap[star.name];
      if (huaLetter) {
        if (!star.palaceHua) star.palaceHua = [];
        star.palaceHua.push(`x${huaLetter}`);
      }
    });

    // b. 对宫四化 (iM)
    const oppositePalaceBranch = EARTHLY_BRANCHES[(EARTHLY_BRANCHES.indexOf(palace.branch) + 6) % 12];
    const oppositePalace = palaces.find(p => p.branch === oppositePalaceBranch);
    
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
}

/**
 * 计算生年四化信息
 */
function calculateSihuaInfo(basePalaces: PalaceData[], yearGan: HeavenlyStem) {
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
}

/**
 * 主要的紫微斗数计算函数
 */
export function calculateZiwei(params: CalculationParams): CalculationResult {
  try {
    const { birthData, selectedDecadeIndex = null, selectedYearlyIndex = null } = params;
    
    // 验证输入数据
    if (!birthData.year || !birthData.month || !birthData.day || !birthData.hour || !birthData.gender) {
      throw new ZiweiCalculationError('出生信息不完整');
    }

    const year = Number.parseInt(birthData.year);
    const month = Number.parseInt(birthData.month);
    const day = Number.parseInt(birthData.day);
    const hour = Number.parseInt(birthData.hour);

    // 验证数值范围
    if (year < 1900 || year > 2100) {
      throw new ZiweiCalculationError('年份超出有效范围 (1900-2100)');
    }
    if (month < 1 || month > 12) {
      throw new ZiweiCalculationError('月份超出有效范围 (1-12)');
    }
    if (day < 1 || day > 31) {
      throw new ZiweiCalculationError('日期超出有效范围 (1-31)');
    }
    if (hour < 0 || hour > 23) {
      throw new ZiweiCalculationError('时辰超出有效范围 (0-23)');
    }

    // 农历转换
    const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    const lunar = solar.getLunar();
    const yearGan = lunar.getYearGan() as HeavenlyStem;
    const yearZhi = lunar.getYearZhi() as EarthlyBranch;
    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();
    const lunarHourIndex = lunar.getTimeZhiIndex();
    
    // 🔥 正确的命宫身宫计算算法 - 使用两套地支数序
    // 月地支数序：寅1到子12（计算机：寅0到子11）
    // 时地支数序：子1到亥12（计算机：子0到亥11）
    // 紫微排盘从来不用数字0！
    
    // 月地支对应：正月寅，二月卯，三月辰，四月巳，五月午，六月未，
    //           七月申，八月酉，九月戌，十月亥，冬月子，腊月丑
    const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    const monthBranch = monthBranches[lunarMonth - 1]; // 农历月份对应的地支
    
    // 月地支在十二地支中的位置（用于月地支数序）
    // 寅1，卯2，辰3，巳4，午5，未6，申7，酉8，戌9，亥10，子11，丑12
    const monthBranchOrder = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];
    const monthNumber = monthBranchOrder.indexOf(monthBranch) + 1; // 传统数序，从1开始
    
    // 时辰在时地支数序中的数字
    // 子1，丑2，寅3，卯4，辰5，巳6，午7，未8，申9，酉10，戌11，亥12
    const hourNumber = lunarHourIndex + 1; // 从计算机索引转为传统数序
    
    // 命宫算法：寅宫起正月，顺数到生月，再逆数生时
    // 1. 寅宫为起点（索引2），顺数到生月
    const monthPalaceIndex = (2 + (monthNumber - 1)) % 12; // 寅宫起正月
    
    // 2. 从月宫逆数生时（关键：起点宫位本身就是第1步！）
    // 中国古代没有0的概念，起点就是第1步，然后逆数(hourNumber-1)步
    const lifePalaceBranchIndex = (monthPalaceIndex - (hourNumber - 1) + 12) % 12;
    const lifePalaceBranch = EARTHLY_BRANCHES[lifePalaceBranchIndex];
    
    // 身宫算法：寅宫起正月，顺数到生月，再顺数生时
    // 同样的逻辑：起点宫位本身就是第1步
    const shenGongBranchIndex = (monthPalaceIndex + (hourNumber - 1)) % 12;
    
    console.log('🔍 命宫身宫计算调试:');
    console.log('农历:', `${lunarMonth}月 (${monthBranch})`, '月数序:', monthNumber);
    console.log('时辰:', EARTHLY_BRANCHES[lunarHourIndex], '时数序:', hourNumber);
    console.log('月宫位置:', `寅宫起正月，顺数${monthNumber}到${EARTHLY_BRANCHES[monthPalaceIndex]}`);
    console.log('命宫计算:', `从${EARTHLY_BRANCHES[monthPalaceIndex]}逆数${hourNumber}步 → ${lifePalaceBranch}(${lifePalaceBranchIndex})`);
    console.log('身宫计算:', `从${EARTHLY_BRANCHES[monthPalaceIndex]}顺数${hourNumber}步 → ${EARTHLY_BRANCHES[shenGongBranchIndex]}(${shenGongBranchIndex})`);
    
    // 定五行局
    const fiveElementsBureau = getFiveElementsBureau(yearGan, lifePalaceBranch);
    if (!fiveElementsBureau) {
      throw new ZiweiCalculationError('无法确定五行局');
    }
    
    const bureauNumber = BUREAU_TO_NUMBER[fiveElementsBureau];

    // 定大运顺逆
    const yearStemYinYang = STEM_YIN_YANG[yearGan];
    const isYangManOrYinWoman = (yearStemYinYang === '阳' && birthData.gender === 'male') || 
                               (yearStemYinYang === '阴' && birthData.gender === 'female');
    
    // 五虎遁月
    const yinGan = FIVE_TIGER_DUN[yearGan];
    if (!yinGan) {
      throw new ZiweiCalculationError(`无法确定五虎遁月: ${yearGan}`);
    }
    
    const yinGanIndex = HEAVENLY_STEMS.indexOf(yinGan);

    // 安十二宫天干
    const palaceStems = EARTHLY_BRANCHES.map((_, branchIndex) => {
      const palaceStemIndex = (yinGanIndex + (branchIndex - 2) + 10) % 10;
      return HEAVENLY_STEMS[palaceStemIndex];
    });
    // 特殊处理子、丑宫
    palaceStems[0] = palaceStems[2]; // 子干同寅
    palaceStems[1] = palaceStems[3]; // 丑干同卯

    // 创建基础宫位
    let basePalaces: PalaceData[] = EARTHLY_BRANCHES.map((branch, branchIndex) => {
      const palaceStem = palaceStems[branchIndex];
      const palaceNameIndex = (lifePalaceBranchIndex - branchIndex + 12) % 12;
      const palaceName = PALACE_NAMES[palaceNameIndex];

      // 计算大运
      let decade, decadeIndex;
      if (bureauNumber > 0) {
        const di = isYangManOrYinWoman
            ? (branchIndex - lifePalaceBranchIndex + 12) % 12
            : (lifePalaceBranchIndex - branchIndex + 12) % 12;
        
        const startAge = bureauNumber + di * 10;
        const endAge = startAge + 9;
        decade = `${startAge}-${endAge}`;
        decadeIndex = di;
      }

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
    const starMap = arrangePalaceStars(
      fiveElementsBureau, 
      lunarDay, 
      lunarMonth, 
      lunarHourIndex, 
      yearZhi, 
      yearGan
    );

    // 将星曜分配到宫位
    basePalaces = basePalaces.map(palace => ({
      ...palace,
      stars: starMap.get(palace.branch) || [],
    }));

    // 应用宫干四化
    basePalaces = applyPalaceHua(basePalaces);

    // 创建最终宫位（处理大运流年）
    let finalPalaces = [...basePalaces];
    const decadePalaces = [...basePalaces].sort((a, b) => (a.decadeIndex ?? 0) - (b.decadeIndex ?? 0));

    // TODO: 处理大运流年逻辑（如果需要）

    // 计算命主身主
    const mingZhu = getMingZhu(lifePalaceBranch);
    const shenZhu = getShenZhu(yearZhi);

    // 计算生年四化信息
    const sihuaInfo = calculateSihuaInfo(basePalaces, yearGan);

    // 农历日期字符串
    const lunarString = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

    const result: ZiweiResult = {
      palaces: finalPalaces,
      basePalaces: basePalaces,
      decadePalaces: decadePalaces,
      lunarDate: lunarString,
      fiveElementsBureau: fiveElementsBureau,
      mingZhu: mingZhu,
      shenZhu: shenZhu,
      gender: birthData.gender,
      selectedIndex: selectedDecadeIndex,
      yearGan: yearGan,
      sihuaInfo: sihuaInfo,
    };

    return {
      success: true,
      result: result
    };

  } catch (error) {
    console.error('紫微斗数计算错误:', error);
    
    if (error instanceof ZiweiCalculationError) {
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知计算错误'
    };
  }
}

/**
 * 验证出生数据
 */
export function validateBirthData(birthData: Partial<BirthData>): string[] {
  const errors: string[] = [];
  
  if (!birthData.username?.trim()) {
    errors.push('请输入用户名');
  }
  
  if (!birthData.year) {
    errors.push('请选择出生年份');
  } else {
    const year = Number.parseInt(birthData.year);
    if (isNaN(year) || year < 1900 || year > 2100) {
      errors.push('年份超出有效范围 (1900-2100)');
    }
  }
  
  if (!birthData.month) {
    errors.push('请选择出生月份');
  } else {
    const month = Number.parseInt(birthData.month);
    if (isNaN(month) || month < 1 || month > 12) {
      errors.push('月份超出有效范围 (1-12)');
    }
  }
  
  if (!birthData.day) {
    errors.push('请选择出生日期');
  } else {
    const day = Number.parseInt(birthData.day);
    if (isNaN(day) || day < 1 || day > 31) {
      errors.push('日期超出有效范围 (1-31)');
    }
  }
  
  if (!birthData.hour) {
    errors.push('请选择出生时辰');
  } else {
    const hour = Number.parseInt(birthData.hour);
    if (isNaN(hour) || hour < 0 || hour > 23) {
      errors.push('时辰超出有效范围 (0-23)');
    }
  }
  
  if (!birthData.gender) {
    errors.push('请选择性别');
  }
  
  return errors;
} 