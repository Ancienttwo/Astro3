/**
 * 紫微斗数命主身主星常量
 * Master Stars Constants for ZiWei DouShu
 */

// 命主星 (Life Master Stars) - indexed by birth branch
export const LIFE_MASTER_STARS = [
  '贪狼', // 子
  '巨门', // 丑
  '禄存', // 寅
  '文曲', // 卯
  '廉贞', // 辰
  '武曲', // 巳
  '破军', // 午
  '武曲', // 未
  '廉贞', // 申
  '文曲', // 酉
  '禄存', // 戌
  '巨门'  // 亥
] as const

// 身主星 (Body Master Stars) - indexed by birth branch
export const BODY_MASTER_STARS = [
  '火星', // 子
  '天相', // 丑
  '天梁', // 寅
  '天同', // 卯
  '文昌', // 辰
  '天机', // 巳
  '火星', // 午
  '天相', // 未
  '天梁', // 申
  '天同', // 酉
  '文昌', // 戌
  '天机'  // 亥
] as const

// 生年四化表 (Birth Year Si Hua Table)
export const BIRTH_YEAR_SIHUA: Record<string, { A: string; B: string; C: string; D: string }> = {
  '甲': { A: '廉贞', B: '破军', C: '武曲', D: '太阳' },
  '乙': { A: '天机', B: '天梁', C: '紫微', D: '太阴' },
  '丙': { A: '天同', B: '天机', C: '文昌', D: '廉贞' },
  '丁': { A: '太阴', B: '天同', C: '天机', D: '巨门' },
  '戊': { A: '贪狼', B: '太阴', C: '右弼', D: '天机' },
  '己': { A: '武曲', B: '贪狼', C: '天梁', D: '文曲' },
  '庚': { A: '太阳', B: '武曲', C: '太阴', D: '天同' },
  '辛': { A: '巨门', B: '太阳', C: '文曲', D: '文昌' },
  '壬': { A: '天梁', B: '紫微', C: '左辅', D: '武曲' },
  '癸': { A: '破军', B: '巨门', C: '太阴', D: '贪狼' }
}

// 飞宫四化表 (Flying Palace Si Hua Table) - 与生年四化相同
export const FLYING_PALACE_SIHUA = BIRTH_YEAR_SIHUA

// Type definitions for master stars
export type LifeMasterStar = typeof LIFE_MASTER_STARS[number]
export type BodyMasterStar = typeof BODY_MASTER_STARS[number]
export type SihuaTransformation = { A: string; B: string; C: string; D: string }
export type SihuaType = 'A' | 'B' | 'C' | 'D'