import { HeavenlyStem } from './stems';
import { EarthlyBranch } from './branches';

export type FiveElementsBureau = '水二局' | '火六局' | '木三局' | '土五局' | '金四局';

const bureauTable: Record<string, FiveElementsBureau[]> = {
    '甲己': ['水二局', '火六局', '木三局', '土五局', '金四局', '火六局'],
    '乙庚': ['火六局', '土五局', '金四局', '木三局', '水二局', '土五局'],
    '丙辛': ['土五局', '木三局', '水二局', '金四局', '火六局', '木三局'],
    '丁壬': ['木三局', '金四局', '火六局', '水二局', '土五局', '金四局'],
    '戊癸': ['金四局', '水二局', '土五局', '火六局', '木三局', '水二局'],
};

const stemToGroup: Record<HeavenlyStem, string> = {
    '甲': '甲己', '己': '甲己',
    '乙': '乙庚', '庚': '乙庚',
    '丙': '丙辛', '辛': '丙辛',
    '丁': '丁壬', '壬': '丁壬',
    '戊': '戊癸', '癸': '戊癸',
};

// 子丑=0, 寅卯=1, 辰巳=2, 午未=3, 申酉=4, 戌亥=5
const branchToIndexMap: Record<EarthlyBranch, number> = {
    '子': 0, '丑': 0,
    '寅': 1, '卯': 1,
    '辰': 2, '巳': 2,
    '午': 3, '未': 3,
    '申': 4, '酉': 4,
    '戌': 5, '亥': 5,
};

export function getFiveElementsBureau(yearStem: HeavenlyStem, lifePalaceBranch: EarthlyBranch): FiveElementsBureau | undefined {
    const stemGroup = stemToGroup[yearStem];
    const branchIndex = branchToIndexMap[lifePalaceBranch];
    
    if (stemGroup && branchIndex !== undefined) {
        return bureauTable[stemGroup][branchIndex];
    }
    return undefined;
}

export const BUREAU_TO_NUMBER: Record<FiveElementsBureau, number> = {
    '水二局': 2,
    '木三局': 3,
    '金四局': 4,
    '土五局': 5,
    '火六局': 6,
}; 