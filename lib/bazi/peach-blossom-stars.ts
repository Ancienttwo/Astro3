// 桃花星算法工具函数
// 包含红鸾、天喜、咸池、沐浴、红艳五个桃花星的计算

export interface PeachBlossomStars {
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

// 地支索引映射
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 红鸾算法：年支对冲
const HONG_LUAN_MAP: Record<string, string> = {
  '子': '酉', '丑': '申', '寅': '未', '卯': '午', 
  '辰': '巳', '巳': '辰', '午': '卯', '未': '寅',
  '申': '丑', '酉': '子', '戌': '亥', '亥': '戌'
}

// 天喜算法：年支对位
const TIAN_XI_MAP: Record<string, string> = {
  '子': '卯', '丑': '寅', '寅': '丑', '卯': '子',
  '辰': '亥', '巳': '戌', '午': '酉', '未': '申',
  '申': '未', '酉': '午', '戌': '巳', '亥': '辰'
}

// 咸池算法：三合局桃花
const XIAN_CHI_MAP: Record<string, string> = {
  '申': '酉', '子': '酉', '辰': '酉', // 申子辰见酉
  '寅': '卯', '午': '卯', '戌': '卯', // 寅午戌见卯
  '亥': '子', '卯': '子', '未': '子', // 亥卯未见子
  '巳': '午', '酉': '午', '丑': '午'  // 巳酉丑见午
}

// 沐浴算法：长生十二宫的沐浴位
const MU_YU_MAP: Record<string, string> = {
  '甲': '子', '乙': '巳', '丙': '卯', '丁': '申',
  '戊': '卯', '己': '申', '庚': '午', '辛': '亥',
  '壬': '酉', '癸': '寅'
}

// 红艳算法：日干对应地支
const HONG_YAN_MAP: Record<string, string> = {
  '甲': '午', '乙': '申', '丙': '寅', '丁': '未',
  '戊': '辰', '己': '戌', '庚': '未', '辛': '戌',
  '壬': '申', '癸': '亥'
}

/**
 * 计算桃花星
 * @param yearBranch 年支
 * @param dayBranch 日支  
 * @param dayStem 日干
 * @param allBranches 八字中所有地支
 * @returns 桃花星信息
 */
export function calculatePeachBlossomStars(
  yearBranch: string,
  dayBranch: string,
  dayStem: string,
  allBranches: string[]
): PeachBlossomStars {
  // 计算红鸾
  const hongLuanBranch = HONG_LUAN_MAP[yearBranch]
  const hongLuanActive = allBranches.includes(hongLuanBranch)

  // 计算天喜
  const tianXiBranch = TIAN_XI_MAP[yearBranch]
  const tianXiActive = allBranches.includes(tianXiBranch)

  // 计算咸池（以日支为准）
  const xianChiBranch = XIAN_CHI_MAP[dayBranch]
  const xianChiActive = allBranches.includes(xianChiBranch)

  // 计算沐浴（以日干为准）
  const muYuBranch = MU_YU_MAP[dayStem]
  const muYuActive = allBranches.includes(muYuBranch)

  // 计算红艳（以日干为准）
  const hongYanBranch = HONG_YAN_MAP[dayStem]
  const hongYanActive = allBranches.includes(hongYanBranch)

  return {
    hongLuan: {
      branch: hongLuanBranch,
      isActive: hongLuanActive,
      meaning: '主婚姻喜事、良缘'
    },
    tianXi: {
      branch: tianXiBranch,
      isActive: tianXiActive,
      meaning: '主喜庆、添丁、良缘'
    },
    xianChi: {
      branch: xianChiBranch,
      isActive: xianChiActive,
      meaning: '桃花煞，主异性缘、情感纠葛'
    },
    muYu: {
      branch: muYuBranch,
      isActive: muYuActive,
      meaning: '主变动、情感，长生十二宫之一'
    },
    hongYan: {
      branch: hongYanBranch,
      isActive: hongYanActive,
      meaning: '主艳遇、魅力、情感是非'
    }
  }
}

/**
 * 获取桃花星综合分析
 * @param stars 桃花星信息
 * @returns 综合分析文本
 */
export function getPeachBlossomAnalysis(stars: PeachBlossomStars): string {
  const activeStars = []
  
  if (stars.hongLuan.isActive) activeStars.push('红鸾')
  if (stars.tianXi.isActive) activeStars.push('天喜')
  if (stars.xianChi.isActive) activeStars.push('咸池')
  if (stars.muYu.isActive) activeStars.push('沐浴')
  if (stars.hongYan.isActive) activeStars.push('红艳')

  if (activeStars.length === 0) {
    return '八字中无明显桃花星，感情运较为平稳。'
  }

  let analysis = `八字中有${activeStars.join('、')}等桃花星。`

  if (stars.hongLuan.isActive && stars.tianXi.isActive) {
    analysis += '红鸾天喜双现，主双喜临门，婚姻美满。'
  } else if (stars.hongLuan.isActive) {
    analysis += '红鸾入命，利于正缘，主婚姻喜事。'
  } else if (stars.tianXi.isActive) {
    analysis += '天喜入命，主家庭和睦，添丁之喜。'
  }

  if (stars.xianChi.isActive) {
    analysis += '咸池桃花，异性缘佳，但需注意情感纠葛。'
  }

  if (stars.muYu.isActive) {
    analysis += '沐浴星现，情感多变，人生多机遇。'
  }

  if (stars.hongYan.isActive) {
    analysis += '红艳入命，魅力十足，但需防情感是非。'
  }

  return analysis
}