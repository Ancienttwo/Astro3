import { HEAVENLY_STEMS, STEM_YIN_YANG, type HeavenlyStem } from '@/lib/zodiac/stems';
import { EARTHLY_BRANCHES, type EarthlyBranch } from '@/lib/zodiac/branches';
import { BUREAU_TO_NUMBER, type FiveElementsBureau } from '@/lib/zodiac/five-elements-bureau';
import { getFiveElementsBureau } from '@/lib/zodiac/five-elements-bureau';
import { getZiweiPosition } from '@/lib/zodiac/ziwei-position';
import type { StarName, StarBrightness, StarType } from '@/lib/zodiac/stars';
import { STARS, getStarBrightness } from '@/lib/zodiac/stars';
import { SIHUA_MAP, HUA_TO_LETTER } from '@/lib/zodiac/sihua';
import { Solar } from '@/lib/lunar';
import { FIVE_TIGER_DUN } from '@/lib/zodiac/five-tiger-dun';

export interface StarData {
  name: StarName;
  brightness: StarBrightness;
  type: StarType;
  sihua?: 'A' | 'B' | 'C' | 'D';
  palaceHua?: string[];
  xiangXinSihua?: string;
  liXinSihua?: string;
}

export interface PalaceData {
  id: number;
  name: string;
  branch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
  isLaiYinPalace?: boolean;
  isShenGong?: boolean;
  decade?: string;
  decadeIndex?: number;
  fiveElementsBureau?: FiveElementsBureau;
  yearlyLuck?: { year: number; age: number; };
  yearlyName?: string;
  stars?: StarData[];
}

interface ZiweiResult {
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
  sihuaInfo?: { lu: string; quan: string; ke: string; ji: string; } | null;
}

interface BirthData {
  username: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'male' | 'female' | '';
  category: string;
}

const PALACE_NAMES = [
  "命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄",
  "迁移", "交友", "官禄", "田宅", "福德", "父母"
];

const DECADE_PALACE_NAMES = [
  "大命", "大兄", "大夫", "大子", "大财", "大疾",
  "大迁", "大友", "大官", "大田", "大福", "大父"
];

const YEARLY_PALACE_NAMES = [
    "流命", "流兄", "流夫", "流子", "流财", "流疾",
    "流迁", "流友", "流官", "流田", "流福", "流父"
];

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

const calculateZiwei = (dataToCalculate: BirthData, currentDecadeIndex: number | null, currentYearlyIndex: number | null): ZiweiResult | null => {
  if (!dataToCalculate.year || !dataToCalculate.month || !dataToCalculate.day || !dataToCalculate.hour || !dataToCalculate.gender) {
    return null;
  }

  try {
    const year = Number.parseInt(dataToCalculate.year);
    const month = Number.parseInt(dataToCalculate.month);
    const day = Number.parseInt(dataToCalculate.day);
    const hour = Number.parseInt(dataToCalculate.hour);
    const solar = Solar.fromYmdHms(year, month, day, hour, 0, 0);
    const lunar = solar.getLunar();
    const yearGan = lunar.getYearGan() as HeavenlyStem;
    const yearZhi = lunar.getYearZhi() as EarthlyBranch;
    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();
    const lunarHourIndex = lunar.getTimeZhiIndex();
    const shenGongMonthPalaceIndex = (2 + (lunarMonth - 1)) % 12;
    const shenGongBranchIndex = (shenGongMonthPalaceIndex + lunarHourIndex) % 12;
    const yinGan = FIVE_TIGER_DUN[yearGan];
    if (!yinGan) {
      return null;
    }
    const monthPalaceIndex = (2 + lunarMonth - 1) % 12;
    const lifePalaceBranchIndex = (monthPalaceIndex - lunarHourIndex + 12) % 12;
    const lifePalaceBranch = EARTHLY_BRANCHES[lifePalaceBranchIndex];
    const fiveElementsBureau = getFiveElementsBureau(yearGan, lifePalaceBranch);
    const bureauNumber = fiveElementsBureau ? BUREAU_TO_NUMBER[fiveElementsBureau] : 0;
    const yearStemYinYang = STEM_YIN_YANG[yearGan];
    const isYangManOrYinWoman = (yearStemYinYang === '阳' && dataToCalculate.gender === 'male') || (yearStemYinYang === '阴' && dataToCalculate.gender === 'female');
    const isShunXing = isYangManOrYinWoman;
    const yinGanIndex = HEAVENLY_STEMS.indexOf(yinGan);
    const palaceStems = EARTHLY_BRANCHES.map((_, branchIndex) => {
      const palaceStemIndex = (yinGanIndex + (branchIndex - 2) + 10) % 10;
      return HEAVENLY_STEMS[palaceStemIndex];
    });
    palaceStems[0] = palaceStems[2];
    palaceStems[1] = palaceStems[3];
    let basePalaces: PalaceData[] = EARTHLY_BRANCHES.map((branch, branchIndex) => {
      const palaceStem = palaceStems[branchIndex];
      const palaceNameIndex = (lifePalaceBranchIndex - branchIndex + 12) % 12;
      const palaceName = PALACE_NAMES[palaceNameIndex];
      let decade, decadeIndex;
      if (bureauNumber > 0) {
        const di = isYangManOrYinWoman ? (branchIndex - lifePalaceBranchIndex + 12) % 12 : (lifePalaceBranchIndex - branchIndex + 12) % 12;
        const startAge = bureauNumber + di * 10;
        const endAge = startAge + 9;
        decade = `${startAge}-${endAge}`;
        decadeIndex = di;
      }
      const isLaiYin = palaceStem === yearGan && branch !== '子' && branch !== '丑';
      return { id: branchIndex, name: palaceName, branch, heavenlyStem: palaceStem, decade, decadeIndex, isLaiYinPalace: isLaiYin, isShenGong: branchIndex === shenGongBranchIndex, stars: [] };
    });

    const lunarString = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

    let finalPalaces = [...basePalaces];
    const decadePalaces = [...basePalaces].sort((a, b) => (a.decadeIndex ?? 0) - (b.decadeIndex ?? 0));

    if (currentDecadeIndex !== null) {
      const selectedDecadePalace = decadePalaces[currentDecadeIndex];
      const clickedPalaceBranch = selectedDecadePalace.branch;
      const clickedPalaceIndex = EARTHLY_BRANCHES.indexOf(clickedPalaceBranch);
      finalPalaces = finalPalaces.map(palace => {
        const branchIndex = EARTHLY_BRANCHES.indexOf(palace.branch);
        let stepsFromClicked;
        if (isShunXing) {
          stepsFromClicked = (branchIndex - clickedPalaceIndex + 12) % 12;
        } else {
          stepsFromClicked = (clickedPalaceIndex - branchIndex + 12) % 12;
        }
        const decadeNameIndex = stepsFromClicked;
        const decadeName = DECADE_PALACE_NAMES[decadeNameIndex];
        return { ...palace, yearlyName: decadeName };
      });
    }

    const starMap = new Map<EarthlyBranch, StarData[]>();

    try {
      if (fiveElementsBureau) {
        const sihuaStars = SIHUA_MAP[yearGan];
        const sihuaReverseMap: Partial<Record<StarName, 'A' | 'B' | 'C' | 'D'>> = {};
        if (sihuaStars) {
          sihuaReverseMap[sihuaStars['禄']] = 'A';
          sihuaReverseMap[sihuaStars['权']] = 'B';
          sihuaReverseMap[sihuaStars['科']] = 'C';
          sihuaReverseMap[sihuaStars['忌']] = 'D';
        }
        const ziweiPos = getZiweiPosition(fiveElementsBureau, lunarDay);

        try {
          if (ziweiPos) {
            const ziweiPosIndex = EARTHLY_BRANCHES.indexOf(ziweiPos);
            const addStar = (branch: EarthlyBranch, starName: StarName) => {
              if (!starMap.has(branch)) starMap.set(branch, []);
              const starDef = STARS[starName];
              if (starDef) {
                const brightness = getStarBrightness(starName, branch);
                starMap.get(branch)!.push({ name: starName, brightness, type: starDef.type, sihua: sihuaReverseMap[starName], palaceHua: [], xiangXinSihua: undefined, liXinSihua: undefined });
              }
            };
            addStar(ziweiPos, '紫微');
            addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 1 + 12) % 12], '天机');
            addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 3 + 12) % 12], '太阳');
            addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 4 + 12) % 12], '武曲');
            addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 5 + 12) % 12], '天同');
            addStar(EARTHLY_BRANCHES[(ziweiPosIndex - 8 + 12) % 12], '廉贞');
            const tianfuPosIndex = (12 - ziweiPosIndex + 4) % 12;
            addStar(EARTHLY_BRANCHES[tianfuPosIndex], '天府');
            addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 1) % 12], '太阴');
            addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 2) % 12], '贪狼');
            addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 3) % 12], '巨门');
            addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 4) % 12], '天相');
            addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 5) % 12], '天梁');
            addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 6) % 12], '七杀');
            addStar(EARTHLY_BRANCHES[(tianfuPosIndex + 10) % 12], '破军');
            const wenchengPosIndex = (10 - lunarHourIndex + 12) % 12;
            addStar(EARTHLY_BRANCHES[wenchengPosIndex], '文昌');
            const wenquPosIndex = (4 + lunarHourIndex) % 12;
            addStar(EARTHLY_BRANCHES[wenquPosIndex], '文曲');
            const zuofuPosIndex = (4 + (lunarMonth - 1)) % 12;
            addStar(EARTHLY_BRANCHES[zuofuPosIndex], '左辅');
            const youbiPosIndex = (10 - (lunarMonth - 1) + 12) % 12;
            addStar(EARTHLY_BRANCHES[youbiPosIndex], '右弼');
            const lucunMap: { [key in HeavenlyStem]?: EarthlyBranch } = {
              '甲': '寅',
              '乙': '卯',
              '丙': '巳',
              '丁': '午',
              '戊': '巳',
              '己': '午',
              '庚': '申',
              '辛': '酉',
              '壬': '亥',
              '癸': '子',
            };
            const lucunPos = lucunMap[yearGan];
            if (lucunPos) {
              addStar(lucunPos, '禄存');
              const lucunPosIndex = EARTHLY_BRANCHES.indexOf(lucunPos);
              addStar(EARTHLY_BRANCHES[(lucunPosIndex + 1) % 12], '擎羊');
              addStar(EARTHLY_BRANCHES[(lucunPosIndex - 1 + 12) % 12], '陀罗');
            }
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
            const haiIndex = 11;
            const dikongPosIndex = (haiIndex - lunarHourIndex + 12) % 12;
            const dijiePosIndex = (haiIndex + lunarHourIndex) % 12;
            addStar(EARTHLY_BRANCHES[dikongPosIndex], '地空');
            addStar(EARTHLY_BRANCHES[dijiePosIndex], '地劫');
            const hongluanPosIndex = (3 - yearZhiIndex + 12) % 12;
            addStar(EARTHLY_BRANCHES[hongluanPosIndex], '红鸾');
            const tianxiPosIndex = (hongluanPosIndex + 6) % 12;
            addStar(EARTHLY_BRANCHES[tianxiPosIndex], '天喜');
            const tianyaoPosIndex = (1 + lunarMonth - 1) % 12;
            addStar(EARTHLY_BRANCHES[tianyaoPosIndex], '天姚');
            const tianxingPosIndex = (9 + lunarMonth - 1) % 12;
            addStar(EARTHLY_BRANCHES[tianxingPosIndex], '天刑');
            finalPalaces = finalPalaces.map(palace => ({
              ...palace,
              stars: starMap.get(palace.branch) || [],
            }));
            basePalaces = basePalaces.map(palace => ({
              ...palace,
              stars: starMap.get(palace.branch) || [],
            }));
            const applyPalaceHua = (palaces: PalaceData[]) => {
              palaces.forEach((palace) => {
                const palaceStem = palace.heavenlyStem;
                const sihuaForPalaceStem = SIHUA_MAP[palaceStem];
                if (!sihuaForPalaceStem) return;
                const sihuaReverseMap: Partial<Record<StarName, 'A' | 'B' | 'C' | 'D'>> = {
                  [sihuaForPalaceStem['禄']]: 'A',
                  [sihuaForPalaceStem['权']]: 'B',
                  [sihuaForPalaceStem['科']]: 'C',
                  [sihuaForPalaceStem['忌']]: 'D',
                };
                palace.stars?.forEach(star => {
                  const huaLetter = sihuaReverseMap[star.name];
                  if (huaLetter) {
                    if (!star.palaceHua) star.palaceHua = [];
                    star.palaceHua.push(`x${huaLetter}`);
                  }
                });
                const oppositePalaceBranch = EARTHLY_BRANCHES[(EARTHLY_BRANCHES.indexOf(palace.branch) + 6) % 12];
                const oppositePalace = palaces.find(p => p.branch === oppositePalaceBranch);
                oppositePalace?.stars?.forEach(star => {
                  const huaLetter = sihuaReverseMap[star.name];
                  if (huaLetter) {
                    if (!star.palaceHua) star.palaceHua = [];
                    star.palaceHua.push(`i${huaLetter}`);
                  }
                });
              });
            };
            applyPalaceHua(finalPalaces);

            const mingZhu = getMingZhu(lifePalaceBranch);
            const shenZhu = getShenZhu(yearZhi);

            const sihuaInfo = (() => {
              const sihuaStars = SIHUA_MAP[yearGan];
              if (!sihuaStars) {
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
              const result = {
                lu: findStarPalace(sihuaStars['禄']),
                quan: findStarPalace(sihuaStars['权']),
                ke: findStarPalace(sihuaStars['科']),
                ji: findStarPalace(sihuaStars['忌'])
              };
              return result;
            })();

            return {
              palaces: finalPalaces,
              basePalaces,
              decadePalaces,
              lunarDate: lunarString,
              fiveElementsBureau,
              mingZhu,
              shenZhu,
              gender: dataToCalculate.gender as 'male' | 'female',
              selectedIndex: currentDecadeIndex !== null ? currentDecadeIndex : null,
              yearGan,
              sihuaInfo,
            };
          } else {
            return null;
          }
        } catch (error) {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export { getMingZhu };
export { getShenZhu };
export { calculateZiwei };
export { PALACE_NAMES };
export { DECADE_PALACE_NAMES };
export { YEARLY_PALACE_NAMES };