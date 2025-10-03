/**
 * 紫微斗数命主身主计算模块
 * Life & Body Masters Module for ZiWei DouShu
 * 
 * @description
 * 提供命主、身主的计算功能
 * Provides calculation functions for life master and body master
 * 
 * @module Masters
 * @version 2.0.0
 */

import { LIFE_MASTER_STARS, BODY_MASTER_STARS } from '../constants'
import { BRANCHES } from '../constants/basic-elements'
import type { EarthlyBranch } from '../types/core'

/**
 * 命主身主结果接口
 */
export interface Masters {
  lifeMaster: string    // 命主星
  bodyMaster: string    // 身主星
}

/**
 * 计算命主身主
 * Calculate life and body masters
 * 
 * @param yearBranch 年支
 * @param lifePalaceBranch 命宫地支（可选，用于更精确的计算）
 * @returns 命主身主对象
 */
export function calculateMasters(
  yearBranch: string | EarthlyBranch,
  lifePalaceBranch?: string | EarthlyBranch
): Masters {
  const yearBranchIndex = BRANCHES.indexOf(yearBranch as EarthlyBranch)
  const lifeBranchIndex = lifePalaceBranch ? BRANCHES.indexOf(lifePalaceBranch as EarthlyBranch) : -1

  // 约定：命主用命宫地支索引，身主用出生年支索引（参见 calculations.ts.backup 的实现说明）
  const lifeMasterIndex = lifeBranchIndex >= 0 ? lifeBranchIndex : yearBranchIndex
  return {
    lifeMaster: (LIFE_MASTER_STARS[lifeMasterIndex] || LIFE_MASTER_STARS[yearBranchIndex] || '贪狼') as string,
    bodyMaster: (BODY_MASTER_STARS[yearBranchIndex] || '火星') as string
  }
}

/**
 * 获取命主星
 * Get life master star
 * 
 * @param yearBranch 年支
 * @returns 命主星名称
 */
export function getLifeMaster(yearBranch: string | EarthlyBranch): string {
  const branchIndex = BRANCHES.indexOf(yearBranch as EarthlyBranch)
  return (LIFE_MASTER_STARS[branchIndex] || '贪狼') as string
}

/**
 * 获取身主星  
 * Get body master star
 * 
 * @param yearBranch 年支
 * @returns 身主星名称
 */
export function getBodyMaster(yearBranch: string | EarthlyBranch): string {
  const branchIndex = BRANCHES.indexOf(yearBranch as EarthlyBranch)
  return (BODY_MASTER_STARS[branchIndex] || '火星') as string
}
