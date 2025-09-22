/**
 * Migrated five-elements scoring (100-point scale)
 * Ported from app/mobile wuxing-scoring.ts to bazi-core
 */
import { WuxingElement, WuxingScores, DetailedWuxingScores } from './types'
import { SEASON_MAP, SEASONAL_STRENGTH, DIZHI_CANGGAN, TIANGAN_WUXING, DIZHI_CONFLICTS } from './constants'

export interface MigratedWuxingScore {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
  details: DetailedWuxingScores;
}

export function calculateWuxingScoreMigrated(bazi: string[]): MigratedWuxingScore {
  const [yg, yz, mg, mz, dg, dz, hg, hz] = bazi
  const gans = [yg, mg, dg, hg].filter(Boolean) as string[]
  const zhis = [yz, mz, dz, hz].filter(Boolean) as string[]
  const season = SEASON_MAP[mz as keyof typeof SEASON_MAP] || 'earth'

  const init = () => ({
    wood: { basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    fire: { basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    earth:{ basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    metal:{ basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 },
    water:{ basic: 0, shengke: 0, combination: 0, conflict: 0, transparency: 0, seasonal: 0, total: 0 }
  }) as DetailedWuxingScores

  const scores = init()

  // 1) 基础分：天干 + 地支藏干
  gans.forEach(gan => { const el = TIANGAN_WUXING[gan]; if (el) scores[el].basic += 2 })
  zhis.forEach(zhi => { const cg = DIZHI_CANGGAN[zhi]; if (!cg) return; Object.values(cg).forEach(({ element, weight }) => { scores[element].basic += (weight === 1 ? 2 : weight >= 0.5 ? 1 : 0.5) }) })

  // 2) 生克：以天干为主，考虑季节强度
  const SHENG: Record<WuxingElement, WuxingElement> = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' }
  const KE: Record<WuxingElement, WuxingElement> = { wood: 'earth', fire: 'metal', earth: 'water', metal: 'wood', water: 'fire' }
  gans.forEach(gan => {
    const el = TIANGAN_WUXING[gan]; if (!el) return
    const sheng = SHENG[el]; const ke = KE[el]
    scores[sheng].shengke += 2 * SEASONAL_STRENGTH[season][sheng]
    scores[ke].shengke -= 1.5 * SEASONAL_STRENGTH[season][ke]
  })

  // 3) 合会（简化：仅全量满足加分）
  const has = (arr: string[]) => arr.every(z => zhis.includes(z))
  if (has(['寅','卯','辰'])) scores.wood.combination += 4 * SEASONAL_STRENGTH[season].wood
  if (has(['巳','午','未'])) scores.fire.combination += 4 * SEASONAL_STRENGTH[season].fire
  if (has(['申','酉','戌'])) scores.metal.combination += 4 * SEASONAL_STRENGTH[season].metal
  if (has(['亥','子','丑'])) scores.water.combination += 4 * SEASONAL_STRENGTH[season].water
  if (has(['申','子','辰'])) scores.water.combination += 3 * SEASONAL_STRENGTH[season].water
  if (has(['亥','卯','未'])) scores.wood.combination += 3 * SEASONAL_STRENGTH[season].wood
  if (has(['寅','午','戌'])) scores.fire.combination += 3 * SEASONAL_STRENGTH[season].fire
  if (has(['巳','酉','丑'])) scores.metal.combination += 3 * SEASONAL_STRENGTH[season].metal
  if (has(['子','丑'])) scores.earth.combination += 2 * SEASONAL_STRENGTH[season].earth
  if (has(['寅','亥'])) scores.wood.combination += 2 * SEASONAL_STRENGTH[season].wood
  if (has(['卯','戌'])) scores.fire.combination += 2 * SEASONAL_STRENGTH[season].fire
  if (has(['辰','酉'])) scores.metal.combination += 2 * SEASONAL_STRENGTH[season].metal
  if (has(['巳','申'])) scores.water.combination += 2 * SEASONAL_STRENGTH[season].water
  if (has(['午','未'])) scores.fire.combination += 2 * SEASONAL_STRENGTH[season].fire

  // 4) 冲（简化：以季节抗性衰减）
  DIZHI_CONFLICTS.chong.forEach(({ pair, score }) => {
    const hasPair = pair.every(z => zhis.includes(z))
    if (hasPair) {
      pair.forEach(zhi => {
        const cg = DIZHI_CANGGAN[zhi]
        if (!cg) return
        Object.values(cg).forEach(({ element }) => {
          const resist = 1 - SEASONAL_STRENGTH[season][element] * 0.3
          scores[element].conflict += score * resist / 2
        })
      })
    }
  })

  // 5) 透干
  gans.forEach(gan => {
    const el = TIANGAN_WUXING[gan]; if (!el) return
    let bonus = 0
    zhis.forEach(zhi => { const cg = DIZHI_CANGGAN[zhi]; if (!cg) return; Object.values(cg).forEach(({ element, weight }) => { if (element === el) { bonus = Math.max(bonus, weight === 1 ? 2 : weight >= 0.5 ? (el === 'earth' ? 1.5 : 1) : (el === 'earth' ? 0.5 : 1)) } }) })
    scores[el].transparency += bonus
  })

  // 6) 成势（免季节惩罚）
  const benqiCount: WuxingScores = { wood:0, fire:0, earth:0, metal:0, water:0 }
  zhis.forEach(z => { const cg = DIZHI_CANGGAN[z]; if (!cg) return; Object.values(cg).forEach(({ element, weight }) => { if (weight === 1) benqiCount[element] += 1 }) })
  const tianganCount: WuxingScores = { wood:0, fire:0, earth:0, metal:0, water:0 }
  gans.forEach(g => { const el = TIANGAN_WUXING[g]; if (el) tianganCount[el] += 1 })
  const exempt: Record<WuxingElement, boolean> = { wood:false, fire:false, earth:false, metal:false, water:false }
  ;(['wood','fire','earth','metal','water'] as WuxingElement[]).forEach(el => { if (benqiCount[el] >= 2 && tianganCount[el] > 0 && (benqiCount[el] + tianganCount[el]) >= 3) exempt[el] = true })

  // 7) 季节加权 & 总分
  ;(['wood','fire','earth','metal','water'] as WuxingElement[]).forEach(el => {
    if (!exempt[el]) {
      const base = scores[el].basic + scores[el].shengke + scores[el].combination + scores[el].conflict + scores[el].transparency
      const f = SEASONAL_STRENGTH[season][el]
      scores[el].seasonal = f >= 1 ? base*0.5 : f >= 0.7 ? base*0.25 : f >= 0.3 ? base*(-0.25) : base*(-0.5)
    }
    scores[el].total = scores[el].basic + scores[el].shengke + scores[el].combination + scores[el].conflict + scores[el].transparency + scores[el].seasonal
  })

  // 8) 归一化
  const totals = (['wood','fire','earth','metal','water'] as WuxingElement[]).map(el => scores[el].total)
  const mx = Math.max(...totals), mn = Math.min(...totals)
  const normalize = (v: number) => {
    const range = mx - mn || 1
    let x = ((v - mn) / range) * 70 + 15
    x = x * (1 - 0.2) + 50 * 0.2
    return Math.round(x)
  }

  const result: MigratedWuxingScore = {
    wood: Math.max(1, Math.min(95, normalize(scores.wood.total))),
    fire: Math.max(1, Math.min(95, normalize(scores.fire.total))),
    earth: Math.max(1, Math.min(95, normalize(scores.earth.total))),
    metal: Math.max(1, Math.min(95, normalize(scores.metal.total))),
    water: Math.max(1, Math.min(95, normalize(scores.water.total))),
    details: scores
  }

  return result
}

