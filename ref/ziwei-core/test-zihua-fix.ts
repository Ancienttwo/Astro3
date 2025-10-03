import { generateCompleteZiWeiChart } from './src/calculations'
import type { ZiWeiChartInput } from './src/complete-chart-types'

console.log('=== 测试修正后的自化系统 ===\n')

// 测试用例: 1988年6月20日 23:30 男（戊辰年）
const testInput: ZiWeiChartInput = {
  year: 1988,
  month: 6,
  day: 20,
  hour: 23,
  gender: 'male',
  isLunar: false,
  isLeapMonth: false,
  timezone: 'Asia/Shanghai'
}

console.log(`测试命例: ${testInput.year}年${testInput.month}月${testInput.day}日 ${testInput.hour}时 ${testInput.gender === 'male' ? '男命' : '女命'}`)

try {
  const result = generateCompleteZiWeiChart(testInput)
  
  console.log('\n=== 自化验证：巳宫天同星 ===')
  
  const siGong = result.palaces['巳']
  console.log(`巳宫天干: ${siGong.stem}`)
  console.log(`对宫(亥宫)天干: ${result.palaces['亥'].stem}`)
  
  // 四化表对照
  console.log('\n四化表对照:')
  console.log('丁干四化: 太阴A(禄), 天同B(权), 天机C(科), 巨门D(忌)')
  console.log('癸干四化: 破军A(禄), 巨门B(权), 太阴C(科), 贪狼D(忌)')
  
  // 查找天同星
  const tianTongStar = siGong.mainStars.find(star => star.name === '天同')
  if (tianTongStar) {
    console.log(`\n天同星自化标记: ${tianTongStar.self_sihua || '无'}`)
    
    // 分析预期结果
    console.log('\n正确分析:')
    console.log('1. 离心自化: 巳宫丁干，天同化权，射向对宫 → 应有 xB')
    console.log('2. 向心自化: 亥宫癸干四化中无天同 → 应无向心自化')
    console.log(`3. 预期结果: xB`)
    console.log(`4. 实际结果: ${tianTongStar.self_sihua || '无'}`)
    
    if (tianTongStar.self_sihua === 'xB') {
      console.log('✅ 自化计算正确!')
    } else {
      console.log('❌ 自化计算仍有错误')
    }
  } else {
    console.log('❌ 未找到天同星')
  }
  
  // 检查其他宫位的自化情况
  console.log('\n=== 各宫位自化情况检查 ===')
  Object.entries(result.palaces).forEach(([branchName, palace]) => {
    const starsWithSelfSihua = [...palace.mainStars, ...palace.auxiliaryStars]
      .filter(star => star.self_sihua)
    
    if (starsWithSelfSihua.length > 0) {
      console.log(`${branchName} (${palace.stem}干):`)
      starsWithSelfSihua.forEach(star => {
        console.log(`  ${star.name}: ${star.self_sihua}`)
      })
    }
  })
  
} catch (error) {
  console.error('❌ 测试失败:', error instanceof Error ? error.message : String(error))
  if (error instanceof Error && error.stack) {
    console.error('错误堆栈:', error.stack)
  }
}