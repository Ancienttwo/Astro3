import { generateCompleteZiWeiChart } from './src/calculations'
import type { ZiWeiChartInput } from './src/complete-chart-types'

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

try {
  const result = generateCompleteZiWeiChart(testInput)
  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  console.error('生成失败:', error instanceof Error ? error.message : String(error))
  process.exit(1)
}