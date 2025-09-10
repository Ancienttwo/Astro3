import { HeavenlyStem } from './stems';

/**
 * 五虎遁 - 根据年干定寅月的天干
 * 
 * 甲己之年丙作首
 * 乙庚之岁戊为头
 * 丙辛岁首寻庚起
 * 丁壬壬位顺行流
 * 戊癸何方发甲寅
 */
export const FIVE_TIGER_DUN: Record<HeavenlyStem, HeavenlyStem> = {
  '甲': '丙', '己': '丙',
  '乙': '戊', '庚': '戊',
  '丙': '庚', '辛': '庚',
  '丁': '壬', '壬': '壬',
  '戊': '甲', '癸': '甲',
}; 