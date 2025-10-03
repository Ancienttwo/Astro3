import { generateCompleteZiWeiChart } from './src/calculations'
import type { ZiWeiChartInput } from './src/complete-chart-types'
import { writeFileSync } from 'fs'

// 测试用例: 1989年1月2日 19:25 女
const testInput: ZiWeiChartInput = {
  year: 1989,
  month: 1,
  day: 2,
  hour: 19,
  gender: 'female',
  isLunar: false,
  isLeapMonth: false,
  timezone: 'Asia/Shanghai'
}

console.log('生成 JSON 文件中...')
try {
  const result = generateCompleteZiWeiChart(testInput)
  
  // 生成文件名
  const filename = `ziwei-chart-${testInput.year}-${testInput.month}-${testInput.day}-${testInput.hour}-${testInput.gender}.json`
  
  // 写入 JSON 文件
  writeFileSync(filename, JSON.stringify(result, null, 2), 'utf8')
  
  console.log(`✅ JSON 文件已生成: ${filename}`)
  console.log(`文件大小: ${(JSON.stringify(result).length / 1024).toFixed(2)} KB`)
} catch (error) {
  console.error('❌ 生成失败:', error)
}