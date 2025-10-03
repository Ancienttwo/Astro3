import { generateCompleteZiWeiChart } from '../calculations'
import type { ZiWeiChartInput } from '../complete-chart-types'

describe('Print 2013-11-01 19:30 female JSON', () => {
  it('generates and prints JSON', () => {
    const input: ZiWeiChartInput = {
      year: 2013,
      month: 11,
      day: 1,
      hour: 19,
      gender: 'female',
      isLunar: false,
      isLeapMonth: false,
      timezone: 'Asia/Shanghai'
    }

    const result = generateCompleteZiWeiChart(input)
    // eslint-disable-next-line no-console
    console.log('\n---BEGIN-ZIWEI-JSON---\n' + JSON.stringify(result, null, 2) + '\n---END-ZIWEI-JSON---')
    expect(result).toBeTruthy()
  })
})

