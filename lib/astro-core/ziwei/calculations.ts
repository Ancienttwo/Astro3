/**
 * 紫微斗数计算工具函数 - 统一入口
 * Consolidated Calculator Entry Point for ZiWei DouShu
 * 
 * 本文件作为紫微斗数所有核心计算算法的统一入口，提供向后兼容性和完整的功能访问。
 * 底层实现基于模块化架构，按功能域分组组织在 ./calculations/ 目录中。
 * 
 * ## 📐 双重/三重数值体系设计标准
 * 
 * ### 基础双重数值 (Dual-Value)
 * - `value`: 计算意义数值 (用于显示，如"命宫"、"紫微"、"庙")
 * - `index`: 渲染意义数值 (用于处理，如0-11宫位索引)
 * 
 * ### 三重数值结构 (Triple-Value) - 宫位叠加场景
 * - `value`: 原始意义 (如"身宫"、"大财"、"年命")
 * - `index`: 渲染位置 (实际所在宫位索引)
 * - `name`: 叠加说明 (如"身宫在疾厄宫")
 * 
 * 需要三重数值的场景：身宫、主星、辅星、四化、大运、流年、来因宫
 * 
 * @version 2.0.0
 * @lastUpdated 2025-09-08
 * @architecture Modular design with unified entry point
 */

/**
 * 🗂️ 函数索引 (Function Index)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * ## 📚 数据转换与预处理 (Data Conversion & Preprocessing)
 * ├── createBaZiParams()              - 从tyme4ts创建统一八字参数对象 ⭐ 推荐入口
 * └── calculateYearGanZhi()           - 计算年干支 [DEPRECATED: 使用tyme4ts]
 * 
 * ## 🏛️ 宫位计算 (Palace Calculations)
 * ├── calculateLifePalace()           - 计算命宫位置
 * ├── calculateBodyPalace()           - 计算身宫位置
 * ├── getPalaceName()                 - 获取宫位名称
 * └── calculateLaiyinPalace()         - 计算来因宫
 * 
 * ## 🌟 主星安星 (Main Star Placements)
 * ├── calculateZiweiPosition()        - 计算紫微星位置
 * ├── calculateTianfuPosition()       - 计算天府星位置
 * └── calculateMainStarPositions()    - 计算所有主星位置
 * 
 * ## ⭐ 辅星安星 (Auxiliary Star Placements)
 * ├── calculateAuxiliaryStarPositions() - 计算吉星位置 (文昌文曲左辅右弼等)
 * ├── calculateMaleficStarPositions()  - 计算煞星位置 (擎羊陀罗火铃空劫等)
 * ├── calculateRomanceStarPositions()  - 计算桃花星位置 (红鸾天喜天姚咸池)
 * └── calculateMinorStarPositions()    - 计算小星位置 (天官天福等)
 * 
 * ## 🔄 四化计算 (Four Transformations)
 * ├── calculateBirthYearSihua()       - 计算生年四化
 * ├── calculateFlyingPalaceSihua()    - 计算飞宫四化
 * └── calculateSelfTransformations()  - 计算自化 (宫干引发的四化)
 * 
 * ## 👑 命主身主 (Life & Body Masters)
 * ├── calculateMasters()              - 计算命主身主
 * └── getInnateDauPalaceIndex()       - 获取先天斗君宫位索引
 * 
 * ## 📅 运程计算 (Period Calculations)
 * ├── calculateMajorPeriodStartAge()  - 计算大运起运年龄
 * ├── calculateMajorPeriods()         - 计算大运信息
 * ├── calculateFleetingYears()        - 计算流年
 * └── calculateMinorPeriod()          - 计算小限
 * 
 * ## ⚡ 五行局 (Five Elements Bureau)
 * └── calculateFiveElementsBureauDetail() - 五行局详细信息（包含所有格式）
 * 
 * ## 🌟 星曜亮度 (Star Brightness)
 * ├── getStarBrightness()             - 获取星曜亮度值 ⭐ 推荐
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * @usage 推荐使用模式：
 * ```typescript
 * import { Solar } from 'tyme4ts'
 * import { createBaZiParams } from './calculations'
 * 
 * const solar = Solar.fromYmd(1989, 2, 1)
 * const baziParams = createBaZiParams(solar, 0) // 统一数据入口
 * 
 * // 使用 baziParams 中的数据进行各种计算
 * const lifePalace = calculateLifePalace(baziParams.lunarMonth, baziParams.timeZhiIndex)
 * ```
 * 
 * @note
 * - ⭐ 标记为推荐使用的函数
 * - [DEPRECATED] 标记为即将废弃的函数
 * - 新项目请优先使用 createBaZiParams 作为数据入口
 */

// ═══════════════════════════════════════════════════════════════════════════
// 📦 MODULAR IMPORTS - Re-export from specialized calculation modules
// ═══════════════════════════════════════════════════════════════════════════

// Re-export everything from modular calculation system
export * from './calculations'

// Import constants for helper functions
import { BRANCHES, type Branch } from './constants'

// ═══════════════════════════════════════════════════════════════════════════
// 🎯 CONSOLIDATED CALCULATOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * 获取先天斗君宫位索引
 * Get innate Dou Jun palace index
 * 
 * @param lifePalaceIndex 命宫索引
 * @param yearBranch 年支
 * @returns 先天斗君宫位索引
 */
export function getInnateDauPalaceIndex(lifePalaceIndex: number, yearBranch: Branch): number {
  const branchIndex = BRANCHES.indexOf(yearBranch)
  if (branchIndex === -1) {
    throw new Error(`Invalid year branch: ${yearBranch}`)
  }
  return (lifePalaceIndex + branchIndex) % 12
}

// ═══════════════════════════════════════════════════════════════════════════
// 🌟 COMPREHENSIVE CHART GENERATION (Re-exported from chart-generator.ts)
// ═══════════════════════════════════════════════════════════════════════════

// Re-export chart generation functionality from dedicated module
export {
  generateCompleteZiWeiChart,
  calculateDouJun,
  type IZiWeiCompleteChart
} from './chart-generator'