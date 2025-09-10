/**
 * 地支 (Earthly Branches)
 * 子 (Zi), 丑 (Chou), 寅 (Yin), 卯 (Mao), 辰 (Chen), 巳 (Si), 午 (Wu), 未 (Wei), 申 (Shen), 酉 (You), 戌 (Xu), 亥 (Hai)
 */

export const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
] as const;

export type EarthlyBranch = typeof EARTHLY_BRANCHES[number]; 