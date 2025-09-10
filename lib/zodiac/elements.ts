import { HeavenlyStem } from "./stems";
import { EarthlyBranch } from "./branches";

export type Element = '木' | '火' | '土' | '金' | '水';

export const STEM_ELEMENTS: Record<HeavenlyStem, Element> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

export const BRANCH_ELEMENTS: Record<EarthlyBranch, Element> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
};

export const getElement = (celestial: HeavenlyStem | EarthlyBranch): Element | undefined => {
    if (celestial in STEM_ELEMENTS) {
        return STEM_ELEMENTS[celestial as HeavenlyStem];
    }
    if (celestial in BRANCH_ELEMENTS) {
        return BRANCH_ELEMENTS[celestial as EarthlyBranch];
    }
    return undefined;
} 