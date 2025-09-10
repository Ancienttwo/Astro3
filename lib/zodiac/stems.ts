/**
 * 天干 (Heavenly Stems)
 * 甲 (Jia), 乙 (Yi), 丙 (Bing), 丁 (Ding), 戊 (Wu), 己 (Ji), 庚 (Geng), 辛 (Xin), 壬 (Ren), 癸 (Gui)
 */

export const HEAVENLY_STEMS = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
] as const;

export type HeavenlyStem = typeof HEAVENLY_STEMS[number];

export type YinYang = '阳' | '阴';

export const STEM_YIN_YANG: Record<HeavenlyStem, YinYang> = {
    '甲': '阳', '乙': '阴',
    '丙': '阳', '丁': '阴',
    '戊': '阳', '己': '阴',
    '庚': '阳', '辛': '阴',
    '壬': '阳', '癸': '阴',
}; 