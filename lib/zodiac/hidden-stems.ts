import { HeavenlyStem } from "./stems";
import { EarthlyBranch } from "./branches";

export type HiddenStems = {
  primary: HeavenlyStem;      // 本气
  secondary?: HeavenlyStem;   // 中气
  tertiary?: HeavenlyStem;      // 余气
};

export const HIDDEN_STEMS: Record<EarthlyBranch, HiddenStems> = {
  '子': { primary: '癸' },
  '丑': { primary: '己', secondary: '癸', tertiary: '辛' },
  '寅': { primary: '甲', secondary: '丙', tertiary: '戊' },
  '卯': { primary: '乙' },
  '辰': { primary: '戊', secondary: '乙', tertiary: '癸' },
  '巳': { primary: '丙', secondary: '庚', tertiary: '戊' },
  '午': { primary: '丁', secondary: '己' },
  '未': { primary: '己', secondary: '丁', tertiary: '乙' },
  '申': { primary: '庚', secondary: '壬', tertiary: '戊' },
  '酉': { primary: '辛' },
  '戌': { primary: '戊', secondary: '辛', tertiary: '丁' },
  '亥': { primary: '壬', secondary: '甲' },
}; 