// English version of Peach Blossom Stars calculation
// Includes Hong Luan, Tian Xi, Xian Chi, Mu Yu, Hong Yan

export interface PeachBlossomStarsEn {
  hongLuan: {
    branch: string
    isActive: boolean
    meaning: string
  }
  tianXi: {
    branch: string
    isActive: boolean
    meaning: string
  }
  xianChi: {
    branch: string
    isActive: boolean
    meaning: string
  }
  muYu: {
    branch: string
    isActive: boolean
    meaning: string
  }
  hongYan: {
    branch: string
    isActive: boolean
    meaning: string
  }
}

// Import calculation logic from Chinese version
import { calculatePeachBlossomStars as calculateChinese } from './peach-blossom-stars'

/**
 * Calculate Peach Blossom Stars for English interface
 * @param yearBranch Year branch
 * @param dayBranch Day branch  
 * @param dayStem Day stem
 * @param allBranches All branches in Bazi chart
 * @returns Peach Blossom Stars information in English
 */
export function calculatePeachBlossomStarsEn(
  yearBranch: string,
  dayBranch: string,
  dayStem: string,
  allBranches: string[]
): PeachBlossomStarsEn {
  // Use Chinese calculation logic
  const chineseResult = calculateChinese(yearBranch, dayBranch, dayStem, allBranches)
  
  // Convert to English meanings
  return {
    hongLuan: {
      branch: chineseResult.hongLuan.branch,
      isActive: chineseResult.hongLuan.isActive,
      meaning: 'Marriage luck, good romance, wedding joy'
    },
    tianXi: {
      branch: chineseResult.tianXi.branch,
      isActive: chineseResult.tianXi.isActive,
      meaning: 'Joy, fertility, family harmony'
    },
    xianChi: {
      branch: chineseResult.xianChi.branch,
      isActive: chineseResult.xianChi.isActive,
      meaning: 'Peach blossom luck, attraction, romantic complications'
    },
    muYu: {
      branch: chineseResult.muYu.branch,
      isActive: chineseResult.muYu.isActive,
      meaning: 'Emotional changes, life transitions, bathing star'
    },
    hongYan: {
      branch: chineseResult.hongYan.branch,
      isActive: chineseResult.hongYan.isActive,
      meaning: 'Charm, romantic encounters, emotional troubles'
    }
  }
}

/**
 * Get comprehensive Peach Blossom analysis in English
 * @param stars Peach Blossom Stars information
 * @returns Comprehensive analysis text in English
 */
export function getPeachBlossomAnalysisEn(stars: PeachBlossomStarsEn): string {
  const activeStars = []
  
  if (stars.hongLuan.isActive) activeStars.push('Hong Luan')
  if (stars.tianXi.isActive) activeStars.push('Tian Xi')
  if (stars.xianChi.isActive) activeStars.push('Xian Chi')
  if (stars.muYu.isActive) activeStars.push('Mu Yu')
  if (stars.hongYan.isActive) activeStars.push('Hong Yan')

  if (activeStars.length === 0) {
    return 'No significant peach blossom stars in your chart. Romance luck is relatively stable.'
  }

  let analysis = `Your chart contains ${activeStars.join(', ')} peach blossom stars. `

  if (stars.hongLuan.isActive && stars.tianXi.isActive) {
    analysis += 'Both Hong Luan and Tian Xi appear, indicating double joy and marital bliss. '
  } else if (stars.hongLuan.isActive) {
    analysis += 'Hong Luan brings marriage luck and wedding joy. '
  } else if (stars.tianXi.isActive) {
    analysis += 'Tian Xi brings family harmony and fertility luck. '
  }

  if (stars.xianChi.isActive) {
    analysis += 'Xian Chi enhances romantic appeal but warns of emotional complications. '
  }

  if (stars.muYu.isActive) {
    analysis += 'Mu Yu brings emotional changes and life opportunities. '
  }

  if (stars.hongYan.isActive) {
    analysis += 'Hong Yan enhances personal charm but may attract romantic troubles. '
  }

  return analysis.trim()
}