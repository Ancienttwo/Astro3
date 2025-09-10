import { EarthlyBranch } from './branches';

export const MONTH_BRANCHES: Record<EarthlyBranch, number> = {
    '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
    '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
};

export const HOUR_BRANCHES: Record<EarthlyBranch, number> = {
    '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
    '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12
};

export const ORIGINAL_PALACES: Record<number, string> = {
    1: '命宫', 2: '兄弟', 3: '夫妻', 4: '子女', 5: '财帛', 6: '疾厄',
    7: '迁移', 8: '交友', 9: '官禄', 10: '田宅', 11: '福德', 12: '父母'
};

export const DECADE_PALACES: Record<number, string> = {
    1: '大命', 2: '大兄', 3: '大夫', 4: '大子', 5: '大财', 6: '大疾',
    7: '大迁', 8: '大友', 9: '大官', 10: '大田', 11: '大福', 12: '大父'
};

export const YEAR_PALACES: Record<number, string> = {
    1: '年命', 2: '年兄', 3: '年夫', 4: '年子', 5: '年财', 6: '年疾',
    7: '年迁', 8: '年友', 9: '年官', 10: '年田', 11: '年福', 12: '年父'
}; 