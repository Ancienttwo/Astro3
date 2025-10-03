import { generateCompleteZiWeiChart } from './src/calculations'
import type { ZiWeiChartInput } from './src/complete-chart-types'

// 测试用户指定的时间: 1989年1月2日 19:25 女
const testInput: ZiWeiChartInput = {
  year: 1989,
  month: 1,
  day: 2,
  hour: 19, // 19:25 -> 戌时
  gender: 'female',
  isLunar: false, // 公历
  isLeapMonth: false,
  timezone: 'Asia/Shanghai'
}

console.log('测试时间: 公历1989年1月2日 19:25 女命')
console.log('输入数据:', testInput)

try {
  const startTime = performance.now()
  const result = generateCompleteZiWeiChart(testInput)
  const endTime = performance.now()
  
  console.log(`✅ 计算成功! 用时: ${(endTime - startTime).toFixed(2)}ms\n`)
  
  // 基础信息
  console.log('=== 基础信息 ===')
  console.log(`公历: ${result.birthInfo.solar.year}年${result.birthInfo.solar.month}月${result.birthInfo.solar.day}日 ${result.birthInfo.solar.hour}时`)
  console.log(`农历: ${result.birthInfo.lunar.yearGanzhi}年 ${result.birthInfo.lunar.monthLunar}月${result.birthInfo.lunar.dayLunar}日`)
  console.log(`八字: ${result.bazi}`)
  console.log(`命宫: ${result.lifePalace}`)
  console.log(`身宫: ${result.bodyPalace}`)
  console.log(`五行局: ${result.fiveElementsBureau.name}`)
  console.log(`命主: ${result.lifeMaster}`)
  console.log(`身主: ${result.bodyMaster}\n`)
  
  // 生年四化
  const transformations = result.sihuaAnalysis.birthYearSihua.transformations
  const sihuaStars = Object.entries(transformations).filter(([_, star]) => star && star.trim() !== '')
  if (sihuaStars.length > 0) {
    console.log(`生年四化: ${sihuaStars.map(([type, star]) => 
      `${star}${type === 'lu' ? '禄' : type === 'quan' ? '权' : type === 'ke' ? '科' : '忌'}`
    ).join(', ')}\n`)
  }
  
  // 详细宫位信息
  console.log('=== 十二宫详细信息 ===')
  Object.entries(result.palaces).forEach(([branch, palace]) => {
    const totalStars = palace.mainStars.length + palace.auxiliaryStars.length + palace.minorStars.length
    if (totalStars > 0) {
      console.log(`${branch}宫 (${palace.palaceName}):`)
      
      // 主星
      if (palace.mainStars.length > 0) {
        const mainStarInfo = palace.mainStars.map(s => {
          let starName = `${s.name}(${s.bright})`
          if (s.sihua) {
            starName += s.sihua === 'A' ? '禄' : 
                      s.sihua === 'B' ? '权' : 
                      s.sihua === 'C' ? '科' : '忌'
          }
          if (s.self_sihua) {
            // 处理组合标记（可能包含多个自化）
            const marks = s.self_sihua.split(',')
            marks.forEach(mark => {
              if (mark.startsWith('i')) {
                starName += mark === 'iA' ? '[向心禄]' : 
                           mark === 'iB' ? '[向心权]' : 
                           mark === 'iC' ? '[向心科]' : '[向心忌]'
              } else if (mark.startsWith('x')) {
                starName += mark === 'xA' ? '[离心禄]' : 
                           mark === 'xB' ? '[离心权]' : 
                           mark === 'xC' ? '[离心科]' : '[离心忌]'
              }
            })
          }
          return starName
        }).join(', ')
        console.log(`  主星: ${mainStarInfo}`)
      } else {
        console.log(`  主星: 无`)
      }
      
      // 辅星
      if (palace.auxiliaryStars.length > 0) {
        const auxStarInfo = palace.auxiliaryStars.map(s => {
          let starName = `${s.name}(${s.bright})`
          if (s.sihua) {
            starName += s.sihua === 'A' ? '禄' : 
                      s.sihua === 'B' ? '权' : 
                      s.sihua === 'C' ? '科' : '忌'
          }
          if (s.self_sihua) {
            // 处理组合标记（可能包含多个自化）
            const marks = s.self_sihua.split(',')
            marks.forEach(mark => {
              if (mark.startsWith('i')) {
                starName += mark === 'iA' ? '[向心禄]' : 
                           mark === 'iB' ? '[向心权]' : 
                           mark === 'iC' ? '[向心科]' : '[向心忌]'
              } else if (mark.startsWith('x')) {
                starName += mark === 'xA' ? '[离心禄]' : 
                           mark === 'xB' ? '[离心权]' : 
                           mark === 'xC' ? '[离心科]' : '[离心忌]'
              }
            })
          }
          return starName
        }).join(', ')
        console.log(`  辅星: ${auxStarInfo}`)
      } else {
        console.log(`  辅星: 无`)
      }
      
      // 杂耀
      if (palace.minorStars.length > 0) {
        const minorStarInfo = palace.minorStars.map(s => s.name).join(', ')
        console.log(`  杂耀: ${minorStarInfo}`)
      }
      
      console.log('') // 空行分隔
    }
  })
  
} catch (error) {
  console.error('❌ 计算失败:', error instanceof Error ? error.message : String(error))
  if (error instanceof Error && error.stack) {
    console.error('错误堆栈:', error.stack)
  }
}