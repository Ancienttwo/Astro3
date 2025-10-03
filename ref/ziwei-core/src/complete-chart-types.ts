/**
 * 紫微斗数完整命盘数据类型定义
 * Complete ZiWei Chart API Types
 */

// 基础出生信息
export interface BirthInfo {
  // 公历信息
  solar: {
    year: number
    month: number  
    day: number
    hour: number
    gender: 'male' | 'female'
    isLunar: boolean
  }
  
  // 农历信息 (由tyme4ts转换生成)
  lunar: {
    yearStem: string     // 天干
    yearBranch: string   // 地支
    yearGanzhi: string   // 干支，如甲辰
    monthLunar: number   // 农历月
    dayLunar: number     // 农历日
    hourBranch: string   // 时辰地支
    isLunar?: boolean    // 标记数据已是农历格式
    isLeapMonth?: boolean // 是否闰月
  }
}

// 四化类型定义
export type SihuaType = 'lu' | 'quan' | 'ke' | 'ji'  // 禄权科忌
export type SihuaSource = 'birth' | 'self'  // 生年四化、自化

// 四化记录 (简化版，只包含生年四化和自化)
export interface SihuaRecord {
  type: SihuaType                    // 禄权科忌类型
  source: SihuaSource               // 四化来源：生年或自化
  isActive: boolean                 // 是否当前生效
}

// 星曜信息 - 简化版本用于渲染
export interface StarInfo {
  name: string         // 星曜名称
  bright: string       // 亮度 (庙/旺/得/利/平/陷)  
  sihua?: string       // 生年四化标记: iA/iB/iC/iD (禄/权/科/忌)
  self_sihua?: string  // 自化标记: xA/xB/xC/xD (禄/权/科/忌)
}

// 大运信息
export interface MajorPeriodInfo {
  period: number       // 第几个大运
  startAge: number     // 起始年龄
  endAge: number       // 结束年龄
  startYear: number    // 起始年份
  endYear: number      // 结束年份
}

// 宫位四化信息 (静态四化，不含飞宫)
export interface PalaceSihuaInfo {
  birthYearSihua: {               // 本宫生年四化星
    star: string                  // 四化星曜
    type: SihuaType               // 四化类型
  }[]
  
  selfSihua: {                    // 本宫自化
    star: string                  // 自化星曜
    type: SihuaType               // 自化类型
    condition: string             // 自化条件
    effect: string                // 效果描述
  }[]
}

// 单个宫位完整信息
export interface PalaceInfo {
  branch: string                    // 地支
  branchIndex: number              // 地支索引 0-11
  stem: string                     // 天干
  palaceName: string               // 宫位名称
  mainStars: StarInfo[]            // 主星 (含四化标记)
  auxiliaryStars: StarInfo[]       // 辅星 (含四化标记)
  minorStars: StarInfo[]           // 杂耀
  fleetingYears: number[]          // 流年经过年龄 [5,17,29,41,53,65,77,89,101,113]
  majorPeriod: MajorPeriodInfo     // 大运信息
  minorPeriod: number[]            // 小限年龄 [与流年相同]
  
  // 宫位特殊状态
  palaceStatus: {
    isEmpty: boolean               // 是否空宫
    isBorrowingStars: boolean      // 是否借星
    borrowedFrom?: string          // 借星来源宫位
    strength: 'strong' | 'normal' | 'weak' // 宫位力量
    conflictLevel: number          // 冲突程度 0-10
  }
}

// 五行局信息
export interface FiveElementsBureau {
  name: string          // 如 "水二局"
  number: string        // 局数 "2"
}

// 简化的四化分析
export interface GlobalSihuaAnalysis {
  birthYearSihua: {
    stem: string              // 年干
    transformations: {
      lu: string             // 禄星
      quan: string           // 权星  
      ke: string             // 科星
      ji: string             // 忌星
    }
  }
}

// 完整紫微斗数命盘
export interface ZiWeiCompleteChart {
  // 基础出生信息
  birthInfo: BirthInfo
  
  // 八字系统 (tyme4ts生成)
  bazi: string           // 八字
  baziQiyun: string      // 八字起运
  baziDayun: string      // 八字大运
  
  // 命盘核心信息
  lifePalace: string     // 命宫 "宫位名称"
  bodyPalace: string     // 身宫 "宫位名称"
  laiyinPalace: string   // 来因宫 "宫位名称"
  lifeMaster: string     // 命主星
  bodyMaster: string     // 身主星
  doujun: string         // 斗君位置
  fiveElementsBureau: FiveElementsBureau  // 五行局
  
  // 十二宫完整数据 (按地支排列: 子丑寅卯辰巳午未申酉戌亥)
  palaces: {
    [branchName: string]: PalaceInfo
  }
  
  // 全局四化分析系统
  sihuaAnalysis: GlobalSihuaAnalysis
  
  // 生成时间戳和版本信息
  generatedAt: string
  version: string
}

// API输入参数简化接口
export interface ZiWeiChartInput {
  year: number
  month: number
  day: number
  hour: number
  gender: 'male' | 'female'
  isLunar?: boolean
  isLeapMonth?: boolean
  timezone?: string
}