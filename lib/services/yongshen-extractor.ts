// 用神提取服务 - 从分析报告中提取结构化信息

export interface YongShenData {
  primaryYongShen: string // 主用神
  secondaryYongShen?: string // 次用神
  jiShen: string[] // 忌神
  geLu: string // 格局
  analysisDate: string // 分析日期
  confidence: number // 提取置信度 (0-1)
  rawAnalysis: string // 原始分析报告
}

// 五行相克关系 - 什么克什么
const wuxingKeRelations: Record<string, string> = {
  '木': '土', // 木克土
  '火': '金', // 火克金
  '土': '水', // 土克水
  '金': '木', // 金克木
  '水': '火'  // 水克火
}

// 被克关系 - 什么被什么克
const wuxingBeiKeRelations: Record<string, string> = {
  '木': '金', // 金克木
  '火': '水', // 水克火
  '土': '木', // 木克土
  '金': '火', // 火克金
  '水': '土'  // 土克水
}

// 五行相生关系（用于辅助判断）
const wuxingShengRelations: Record<string, string> = {
  '木': '火', // 木生火
  '火': '土', // 火生土
  '土': '金', // 土生金
  '金': '水', // 金生水
  '水': '木'  // 水生木
}

// 天干到五行的映射
const tianganToWuxing: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火', 
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
}

/**
 * 从用神分析报告中提取结构化信息
 */
export function extractYongShenFromReport(reportText: string): YongShenData | null {
  if (!reportText || typeof reportText !== 'string') {
    return null
  }

  console.log('🔍 开始提取用神信息，报告长度:', reportText.length)
  console.log('📄 报告内容片段:', reportText.substring(0, 500))

  const result: YongShenData = {
    primaryYongShen: '',
    jiShen: [],
    geLu: '',
    analysisDate: new Date().toISOString(),
    confidence: 0,
    rawAnalysis: reportText
  }

  // 🔥 更新：提取用神的正则表达式模式，支持天干和五行
  const yongShenPatterns = [
    // 新格式：**用神选择：甲木** 或 **用神选择：甲**
    /\*\*用神选择[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?)\*\*/g,
    // 标准格式：用神：甲木 或 用神：甲
    /用神[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?)/g,
    // 五行格式：用神：木
    /用神[：:]\s*([木火土金水])/g,
    // 其他变体
    /主用神[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水])/g,
    /取用神[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水])/g,
    /用神为[：:]?\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水])/g,
    /确定用神[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水])/g,
    /用神五行[：:]\s*([木火土金水])/g,
    // 粗体格式
    /\*\*用神[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水])\*\*/g
  ]

  // 提取忌神的正则表达式模式
  const jiShenPatterns = [
    // 标准忌神表述
    /忌神[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水]+)/g,
    /忌[：:]?\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水]+)/g,
    /避忌[：:]\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水]+)/g,
    /忌神为[：:]?\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水]+)/g,
    // 严禁表述
    /严禁[取用]?[命主无之]?[五行]?[：:]?\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水、]+)/g,
    /禁[用取][：:]?\s*([甲乙丙丁戊己庚辛壬癸][木火土金水]?|[木火土金水、]+)/g
  ]

  // 🔥 用神作用路径识别
  // 克的路线 - 用神克什么，被克的是忌神
  const kePathPatterns = [
    /([木火土金水])制([木火土金水])/g,  // 土制水
    /([木火土金水])克([木火土金水])/g,  // 土克水
    /([木火土金水])治([木火土金水])/g,  // 土治水
    /([木火土金水])制约([木火土金水])/g, // 土制约水
    /([木火土金水])抑制([木火土金水])/g, // 土抑制水
    /([木火土金水])化解([木火土金水])/g, // 土化解水
    /([木火土金水])泄([木火土金水])/g,  // 火泄木
    /防([木火土金水])生([木火土金水])/g, // 防金生水 - 第二个是忌神
  ]

  // 生的路线 - 用神生什么，被生的通常是喜神（不是忌神）
  const shengPathPatterns = [
    /([木火土金水])生([木火土金水])/g,  // 土生金
    /([木火土金水])助([木火土金水])/g,  // 土助金
    /([木火土金水])扶([木火土金水])/g,  // 土扶金
    /([木火土金水])补([木火土金水])/g,  // 土补金
    /([木火土金水])养([木火土金水])/g,  // 土养金
  ]

  // 提取格局的正则表达式模式
  const geLuPatterns = [
    /格局[：:]\s*([^。，\n]+)/g,
    /为(\w*格)/g,
    /属于(\w*格)/g,
    /(\w*格)局/g,
    /形成(\w*格)/g
  ]

  let confidence = 0
  let matchCount = 0

  // 🔥 提取用神 - 支持天干和五行
  for (const pattern of yongShenPatterns) {
    const matches = [...reportText.matchAll(pattern)]
    if (matches.length > 0) {
      const extractedValue = matches[0][1]
      console.log(`🎯 找到用神匹配: "${extractedValue}" (使用模式: ${pattern.source})`)
      
      // 处理天干+五行的组合（如"甲木"）
      if (extractedValue.length === 2) {
        const tiangan = extractedValue[0]
        const wuxing = extractedValue[1]
        if (tianganToWuxing[tiangan] && ['木', '火', '土', '金', '水'].includes(wuxing)) {
          // 验证天干和五行是否匹配
          if (tianganToWuxing[tiangan] === wuxing) {
            result.primaryYongShen = wuxing
            confidence += 0.4 // 天干+五行匹配，置信度更高
            console.log(`✅ 天干五行匹配: ${tiangan}${wuxing} → ${wuxing}`)
          } else {
            // 天干和五行不匹配，使用天干对应的五行
            result.primaryYongShen = tianganToWuxing[tiangan]
            confidence += 0.3
            console.log(`⚠️ 天干五行不匹配: ${tiangan}${wuxing}，使用天干五行: ${tianganToWuxing[tiangan]}`)
          }
          matchCount++
          break
        }
      }
      // 处理单独的天干（如"甲"）
      else if (extractedValue.length === 1 && tianganToWuxing[extractedValue]) {
        result.primaryYongShen = tianganToWuxing[extractedValue]
        confidence += 0.35
        console.log(`✅ 天干转五行: ${extractedValue} → ${tianganToWuxing[extractedValue]}`)
        matchCount++
        break
      }
      // 处理单独的五行（如"木"）
      else if (['木', '火', '土', '金', '水'].includes(extractedValue)) {
        result.primaryYongShen = extractedValue
        confidence += 0.3
        console.log(`✅ 直接五行: ${extractedValue}`)
        matchCount++
        break
      }
    }
  }

  // 提取忌神
  let jiShenFound = false

  // 1. 首先尝试明确的忌神表述（优先级最高）
  for (const pattern of jiShenPatterns) {
    const matches = [...reportText.matchAll(pattern)]
    for (const match of matches) {
      const jiShenText = match[1]
      console.log(`🚫 找到明确忌神表述: "${jiShenText}"`)
      
      // 处理包含多个五行的情况（如"金、水"）
      if (jiShenText.includes('、') || jiShenText.includes(',')) {
        const wuxingList = jiShenText.match(/[木火土金水]/g)
        if (wuxingList) {
          result.jiShen = [...new Set([...result.jiShen, ...wuxingList])]
          confidence += 0.5 // 明确表述，置信度最高
          matchCount++
          jiShenFound = true
          console.log(`✅ 明确多重忌神: ${wuxingList.join('、')}`)
        }
      }
      // 处理天干+五行或单独五行
      else if (jiShenText.length === 2) {
        const tiangan = jiShenText[0]
        const wuxing = jiShenText[1]
        if (tianganToWuxing[tiangan] && ['木', '火', '土', '金', '水'].includes(wuxing)) {
          const finalWuxing = tianganToWuxing[tiangan] === wuxing ? wuxing : tianganToWuxing[tiangan]
          result.jiShen = [...new Set([...result.jiShen, finalWuxing])]
          confidence += 0.4
          matchCount++
          jiShenFound = true
          console.log(`✅ 明确忌神: ${finalWuxing}`)
        }
      } else if (jiShenText.length === 1 && tianganToWuxing[jiShenText]) {
        result.jiShen = [...new Set([...result.jiShen, tianganToWuxing[jiShenText]])]
        confidence += 0.4
        matchCount++
        jiShenFound = true
        console.log(`✅ 明确忌神: ${tianganToWuxing[jiShenText]}`)
      } else {
        // 提取五行字符
        const wuxingChars = jiShenText.match(/[木火土金水]/g)
        if (wuxingChars) {
          result.jiShen = [...new Set([...result.jiShen, ...wuxingChars])]
          confidence += 0.4
          matchCount++
          jiShenFound = true
          console.log(`✅ 明确忌神: ${wuxingChars.join('、')}`)
        }
      }
    }
  }

  // 2. 然后分析用神作用路径 - 克的路线
  if (!jiShenFound || result.jiShen.length === 0) {
    for (const pattern of kePathPatterns) {
      const matches = [...reportText.matchAll(pattern)]
      for (const match of matches) {
        const [fullMatch, wuxing1, wuxing2] = match
        console.log(`⚔️ 找到克制路径: "${fullMatch}" - ${wuxing1} 克/制 ${wuxing2}`)
        
        // 如果第一个五行是用神，那么第二个五行就是忌神
        if (result.primaryYongShen === wuxing1) {
          result.jiShen = [...new Set([...result.jiShen, wuxing2])]
          confidence += 0.4 // 制克关系明确，置信度高
          matchCount++
          jiShenFound = true
          console.log(`✅ 克制路径确认忌神: ${wuxing1}制${wuxing2}，忌神为${wuxing2}`)
        }
        // 特殊处理"防A生B"格式，B是忌神
        else if (fullMatch.includes('防') && fullMatch.includes('生')) {
          result.jiShen = [...new Set([...result.jiShen, wuxing2])]
          confidence += 0.35
          matchCount++
          jiShenFound = true
          console.log(`✅ 防生格式: ${fullMatch}，忌神为${wuxing2}`)
        }
      }
    }
  }

  // 3. 识别生的路径（记录但不作为忌神）
  const shengPathInfo = []
  for (const pattern of shengPathPatterns) {
    const matches = [...reportText.matchAll(pattern)]
    for (const match of matches) {
      const [fullMatch, wuxing1, wuxing2] = match
      if (result.primaryYongShen === wuxing1) {
        shengPathInfo.push(`${wuxing1}生${wuxing2}`)
        console.log(`🌱 识别生扶路径: ${wuxing1}生${wuxing2} (${wuxing2}为喜神，非忌神)`)
      }
    }
  }



  // 4. 最后的自动推断（仅在没有找到明确忌神时才使用，置信度很低）
  if (!jiShenFound && result.primaryYongShen) {
    console.log(`⚠️ 未找到明确忌神表述或作用路径，不进行自动推断`)
    // 移除自动推断逻辑，因为它不可靠
    // 让用户看到原始分析报告，自己判断
  }

  // 提取格局
  for (const pattern of geLuPatterns) {
    const matches = [...reportText.matchAll(pattern)]
    if (matches.length > 0) {
      result.geLu = matches[0][1]?.trim() || ''
      if (result.geLu) {
        confidence += 0.2
        matchCount++
        console.log(`📊 找到格局: ${result.geLu}`)
        break
      }
    }
  }

  // 特殊关键词提取
  const specialKeywords = [
    '正财格', '偏财格', '正官格', '偏官格', '食神格', '伤官格',
    '正印格', '偏印格', '从财格', '从杀格', '从儿格', '从强格',
    '化气格', '曲直格', '炎上格', '稼穑格', '从革格', '润下格'
  ]

  for (const keyword of specialKeywords) {
    if (reportText.includes(keyword)) {
      result.geLu = keyword
      confidence += 0.15
      console.log(`📊 找到特殊格局关键词: ${keyword}`)
      break
    }
  }

  // 计算最终置信度
  result.confidence = Math.min(confidence, 1.0)

  console.log(`📋 用神提取结果:`, {
    primaryYongShen: result.primaryYongShen,
    jiShen: result.jiShen,
    geLu: result.geLu,
    confidence: result.confidence,
    matchCount,
    shengPathInfo: shengPathInfo.length > 0 ? shengPathInfo : '无生扶路径'
  })

  // 只有在找到用神的情况下才返回结果
  if (result.primaryYongShen && result.confidence > 0.2) {
    console.log(`✅ 用神提取成功: ${result.primaryYongShen}`)
    return result
  }

  console.log(`❌ 用神提取失败: 置信度${result.confidence}过低或未找到用神`)
  return null
}

/**
 * 生成用神摘要文本
 */
export function generateYongShenSummary(yongShenData: YongShenData): string {
  const { primaryYongShen, jiShen, geLu } = yongShenData
  
  let summary = `用神：${primaryYongShen}`
  
  if (jiShen.length > 0) {
    summary += ` | 忌神：${jiShen.join('、')}`
  }
  
  if (geLu) {
    summary += ` | 格局：${geLu}`
  }
  
  return summary
}

/**
 * 根据八字生成用神缓存键
 */
export function generateYongShenKey(baziData: any): string {
  const { yearPillar, monthPillar, dayPillar, hourPillar, gender } = baziData
  return `yongshen_${yearPillar}_${monthPillar}_${dayPillar}_${hourPillar}_${gender}`
} 