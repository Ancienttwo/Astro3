/**
 * Chart Generator Types
 * 图表生成器类型定义
 */

/**
 * 综合排盘接口
 */
export interface IZiWeiCompleteChart {
  // 基础信息
  baziGanZhi: string
  baziDayun: string
  lifePalace: string
  bodyPalace: string
  laiyinPalace: string
  lifeMaster: string
  bodyMaster: string
  doujun: number
  fiveElementsBureau: {
    name: string
    number: string
  }
  
  // 宫位信息
  palaces: IPalaceInfo[]
  
  // 四化分析
  sihuaAnalysis: {
    birthYearSihua: {
      stem: string
      transformations: {
        lu: string
        quan: string
        ke: string
        ji: string
      }
    }
  }
  
  // 元数据
  generatedAt: string
  version: string
}

/**
 * 宫位信息接口
 */
export interface IPalaceInfo {
  name: string
  index: number
  branch: string
  stem: string
  mainStars: string[]
  auxiliaryStars: string[]
  maleficStars: string[]
  romanceStars: string[]
  brightness: Record<string, string>
  sihua: {
    lu: string[]
    quan: string[]
    ke: string[]
    ji: string[]
  }
}

/**
 * 星曜位置集合
 */
export interface IStarPositions {
  mainStars: Map<string, number[]>
  auxiliaryStars: Map<string, number[]>
  maleficStars: Map<string, number[]>
  romanceStars: Map<string, number[]>
}

/**
 * 基础图表信息
 */
export interface IChartBasics {
  lifePalaceIndex: number
  bodyPalaceIndex: number
  fiveElementsBureau: {
    name: string
    局数: number
    element: string
    code: string
  }
  lifeMaster: string
  bodyMaster: string
}

/**
 * 图表数据接口
 */
export interface IChartData {
  basics: IChartBasics
  palaces: IPalaceInfo[]
  birthSihua: {
    A: string | null
    B: string | null
    C: string | null
    D: string | null
  }
}