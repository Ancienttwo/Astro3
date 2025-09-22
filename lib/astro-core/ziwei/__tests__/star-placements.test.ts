import { BRANCHES } from '../../src/constants/basic-elements'
import { calculateMaleficStarPositions, calculateRomanceStarPositions } from '../../src/calculations/star-placements'

describe('Star Placements – 火星/铃星/天姚', () => {
  it('火星与铃星示例：戊辰年 辰时 → 火=午, 铃=寅（顺时针）', () => {
    const month = 3
    const timeZhiIndex = BRANCHES.indexOf('辰') // 4
    const yearStem = '戊'
    const yearBranch = '辰'

    const pos = calculateMaleficStarPositions(month, timeZhiIndex, yearStem, yearBranch)
    const huoxing = pos.get('火星')?.[0]
    const lingxing = pos.get('铃星')?.[0]

    expect(huoxing).toBe(BRANCHES.indexOf('午')) // 顺时针：寅起 + 辰(4) → 午
    expect(lingxing).toBe(BRANCHES.indexOf('寅')) // 顺时针：戌起 + 辰(4) → 寅
  })

  it('铃星：戌年起卯，子时应在卯宫（顺时针0步）', () => {
    const month = 1
    const timeZhiIndex = BRANCHES.indexOf('子') // 0
    const yearStem = '庚'
    const yearBranch = '戌'

    const pos = calculateMaleficStarPositions(month, timeZhiIndex, yearStem, yearBranch)
    const lingxing = pos.get('铃星')?.[0]
    expect(lingxing).toBe(BRANCHES.indexOf('卯')) // 3
  })

  it('火星：寅年起丑，子时应在丑宫（顺时针0步）', () => {
    const month = 1
    const timeZhiIndex = BRANCHES.indexOf('子') // 0
    const yearStem = '甲'
    const yearBranch = '寅'

    const pos = calculateMaleficStarPositions(month, timeZhiIndex, yearStem, yearBranch)
    const huoxing = pos.get('火星')?.[0]
    expect(huoxing).toBe(BRANCHES.indexOf('丑')) // 1
  })

  it('天姚按农历月定位：丑起正月，八月在申宫', () => {
    const yearBranch = '辰'
    const month = 8
    const t = calculateRomanceStarPositions(yearBranch, month)
    const tianyao = t.get('天姚')?.[0]
    expect(tianyao).toBe(BRANCHES.indexOf('申'))
  })
})
