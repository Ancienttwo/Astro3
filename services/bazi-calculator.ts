import { Solar } from '@/lib/lunar';
import { HIDDEN_STEMS } from '@/lib/zodiac/hidden-stems';
import { TEN_GODS_RELATIONS } from '@/lib/zodiac/ten-gods';
import { HeavenlyStem } from '@/lib/zodiac/stems';
import { BirthData, BaziResult, LuckCycle, FleetingYear } from '@/stores/bazi-store';

// 工具函数
const getStemElement = (stem: string) => {
  if (['甲', '乙'].includes(stem)) return '木';
  if (['丙', '丁'].includes(stem)) return '火';
  if (['戊', '己'].includes(stem)) return '土';
  if (['庚', '辛'].includes(stem)) return '金';
  if (['壬', '癸'].includes(stem)) return '水';
  return '';
};

const getBranchAnimal = (branch: string) => {
  const animals: { [key: string]: string } = {
    '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔', '辰': '龙', '巳': '蛇',
    '午': '马', '未': '羊', '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪'
  };
  return animals[branch] || '';
};

const countElements = (result: BaziResult) => {
  const counts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const pillars = [result.year, result.month, result.day, result.hour];
  pillars.forEach(p => {
    const stemElement = getStemElement(p.heavenlyStem);
    if (stemElement === '木') counts.wood++;
    if (stemElement === '火') counts.fire++;
    if (stemElement === '土') counts.earth++;
    if (stemElement === '金') counts.metal++;
    if (stemElement === '水') counts.water++;
  });
  return counts;
};

// 八字计算结果接口
export interface BaziCalculationResult {
  baziResult: BaziResult;
  lunarDateString: string;
  luckInfo: string;
  luckCycles: LuckCycle[];
}

// 主要计算函数
export function calculateBazi(birthData: BirthData): BaziCalculationResult {
  const year = Number.parseInt(birthData.year);
  const month = Number.parseInt(birthData.month);
  const day = Number.parseInt(birthData.day);
  const hour = Number.parseInt(birthData.hour);

  const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const hourGanZhi = lunar.getTimeInGanZhi();

  const gender = birthData.gender === 'male' ? 1 : 0;
  const yun = eightChar.getYun(gender);
  const startLuckDate = yun.getStartSolar();
  const luckStartYear = startLuckDate.getYear();
  const luckStartMonth = startLuckDate.getMonth();
  const luckInfoString = `${luckStartYear}年${luckStartMonth}月起运，每10年的${luckStartMonth}月交运。`;

  const dayMasterStem = eightChar.getDayGan() as HeavenlyStem;
  const daYunArr = yun.getDaYun();
  const cycles = daYunArr.map(daYun => {
    const ganZhi = daYun.getGanZhi();
    const gan = ganZhi.substring(0, 1) as HeavenlyStem;
    const zhi = ganZhi.substring(1, 2) as keyof typeof HIDDEN_STEMS;

    const ganTenGod = TEN_GODS_RELATIONS[dayMasterStem][gan];
    const mainHiddenStem = HIDDEN_STEMS[zhi]?.primary;
    const zhiTenGod = mainHiddenStem ? TEN_GODS_RELATIONS[dayMasterStem][mainHiddenStem] : '';

    return {
      age: daYun.getStartAge(),
      year: daYun.getStartYear(),
      ganZhi,
      gan,
      zhi,
      ganTenGod,
      zhiTenGod,
    };
  });

  const lunarString = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()} ${lunar.getTimeInGanZhi()}`;

  const result: BaziResult = {
    year: {
      heavenlyStem: eightChar.getYearGan(),
      earthlyBranch: eightChar.getYearZhi(),
      element: getStemElement(eightChar.getYearGan()),
      animal: getBranchAnimal(eightChar.getYearZhi()),
    },
    month: {
      heavenlyStem: eightChar.getMonthGan(),
      earthlyBranch: eightChar.getMonthZhi(),
      element: getStemElement(eightChar.getMonthGan()),
      animal: getBranchAnimal(eightChar.getMonthZhi()),
    },
    day: {
      heavenlyStem: eightChar.getDayGan(),
      earthlyBranch: eightChar.getDayZhi(),
      element: getStemElement(eightChar.getDayGan()),
      animal: getBranchAnimal(eightChar.getDayZhi()),
    },
    hour: {
      heavenlyStem: hourGanZhi.substring(0, 1),
      earthlyBranch: hourGanZhi.substring(1),
      element: getStemElement(hourGanZhi.substring(0, 1)),
      animal: getBranchAnimal(hourGanZhi.substring(1)),
    },
    luck: { current: "运势分析需要更多数据", next: "下一大运需要更多数据" },
    elements: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
  };

  result.elements = countElements(result);

  return {
    baziResult: result,
    lunarDateString: lunarString,
    luckInfo: luckInfoString,
    luckCycles: cycles,
  };
}

// 流年计算函数
export function calculateFleetingYears(luckCycle: LuckCycle, dayMasterStem: HeavenlyStem): FleetingYear[] {
  const years: FleetingYear[] = [];
  for (let i = 0; i < 10; i++) {
    const currentYear = luckCycle.year + i;
    const solar = Solar.fromYmd(currentYear, 6, 1);
    const lunar = solar.getLunar();
    const ganZhi = `${lunar.getYearGan()}${lunar.getYearZhi()}`;
    const gan = ganZhi.substring(0, 1) as HeavenlyStem;
    const zhi = ganZhi.substring(1, 2) as keyof typeof HIDDEN_STEMS;

    const ganTenGod = TEN_GODS_RELATIONS[dayMasterStem][gan];
    const mainHiddenStem = HIDDEN_STEMS[zhi]?.primary;
    const zhiTenGod = mainHiddenStem ? TEN_GODS_RELATIONS[dayMasterStem][mainHiddenStem] : '';

    years.push({
      year: currentYear,
      gan,
      zhi,
      ganTenGod,
      zhiTenGod,
    });
  }
  return years;
}

// 验证出生数据
export function validateBirthData(birthData: BirthData): boolean {
  return !!(
    birthData.year && 
    birthData.month && 
    birthData.day && 
    birthData.hour && 
    birthData.gender && 
    birthData.username
  );
} 