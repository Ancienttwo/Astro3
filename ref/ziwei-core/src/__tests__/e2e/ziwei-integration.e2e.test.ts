/**
 * 紫微斗数集成端到端测试
 * End-to-End Integration Tests for ZiWei DouShu
 */

import {
  // 基础计算功能
  calculateYearGanZhi,
  calculateLifePalace,
  calculateBodyPalace,
  calculateFiveElementsBureauDetail,
  calculateZiweiPosition,
  
  // 宫位关系功能
  getOppositePalace,
  getTrinityPalaces,
  getSquarePalaces,
  getEssencePalace,
  getPalaceRelationships,
  
  // 时间计算功能
  getCurrentMajorPeriod,
  getFleetingYear,
  getFleetingMonth,
  getMinorLimit,
  getComprehensiveTimeInfo,
  
  // API类
  ZiweiAPI
} from '../../index'

// 测试数据
const TEST_CASES = [
  {
    name: '标准测试案例1 - 1990年5月15日午时男命',
    input: {
      year: 1990,
      month: 5,
      day: 15,
      hour: 7, // 午时
      gender: 'male' as const,
      birthDate: new Date('1990-05-15T12:00:00')
    },
    expected: {
      yearStem: '庚',
      yearBranch: '午',
      lifePalaceIndex: 2, // 预期命宫位置
      hasValidChart: true
    }
  },
  {
    name: '标准测试案例2 - 2000年1月1日子时女命',
    input: {
      year: 2000,
      month: 1,
      day: 1,
      hour: 1, // 子时
      gender: 'female' as const,
      birthDate: new Date('2000-01-01T00:30:00')
    },
    expected: {
      yearStem: '庚',
      yearBranch: '辰',
      lifePalaceIndex: 0, // 预期命宫位置
      hasValidChart: true
    }
  },
  {
    name: '边界测试案例 - 1900年极早期',
    input: {
      year: 1900,
      month: 2,
      day: 29, // 1900年不是闰年，但测试会处理
      hour: 12,
      gender: 'male' as const,
      birthDate: new Date('1900-02-28T23:30:00')
    },
    expected: {
      yearStem: '庚',
      yearBranch: '子',
      hasValidChart: true
    }
  }
]

describe('紫微斗数集成E2E测试套件', () => {
  
  describe('完整命盘计算流程测试', () => {
    test.each(TEST_CASES)('$name', async (testCase) => {
      const { input, expected } = testCase
      
      // Step 1: 计算年干支
      const yearGanZhi = calculateYearGanZhi(input.year)
      expect(yearGanZhi.stem).toBe(expected.yearStem)
      expect(yearGanZhi.branch).toBe(expected.yearBranch)
      
      // Step 2: 计算命宫和身宫
      const lifePalaceIndex = calculateLifePalace(input.month, input.hour)
      const bodyPalaceIndex = calculateBodyPalace(input.month, input.hour)
      
      expect(lifePalaceIndex).toBeGreaterThanOrEqual(0)
      expect(lifePalaceIndex).toBeLessThan(12)
      expect(bodyPalaceIndex).toBeGreaterThanOrEqual(0)
      expect(bodyPalaceIndex).toBeLessThan(12)
      
      // Step 3: 计算五行局
      const fiveElementsBureauResult = calculateFiveElementsBureauDetail(
        yearGanZhi.stem,
        yearGanZhi.branch,
        input.month,
        input.hour
      )
      expect(fiveElementsBureauResult.code).toMatch(/^(water_2|wood_3|metal_4|earth_5|fire_6)$/)
      const fiveElementsBureau = fiveElementsBureauResult.code  // 用于后续计算
      
      // Step 4: 计算紫微星位置
      const ziweiPosition = calculateZiweiPosition(fiveElementsBureau, input.day)
      expect(ziweiPosition).toBeGreaterThanOrEqual(0)
      expect(ziweiPosition).toBeLessThan(12)
      
      // Step 5: 使用API生成完整命盘
      const api = new ZiweiAPI()
      const chart = api.getChart(input)
      
      expect(chart).toBeDefined()
      expect(chart.yearStem).toBe(yearGanZhi.stem)
      expect(chart.yearBranch).toBe(yearGanZhi.branch)
      expect(chart.palacesByBranch).toBeDefined()
      expect(Object.keys(chart.palacesByBranch)).toHaveLength(12)
      
      // 验证命盘完整性
      if (expected.hasValidChart) {
        expect(chart.lifePalace).toBeDefined()
        expect(chart.bodyPalace).toBeDefined()
        expect(chart.lifeMaster).toBeTruthy()
        expect(chart.bodyMaster).toBeTruthy()
      }
    })
  })
  
  describe('宫位关系完整性测试', () => {
    it('应该正确计算所有宫位的完整关系网络', () => {
      // 测试所有12个宫位的关系
      for (let i = 0; i < 12; i++) {
        const relations = getPalaceRelationships(i)
        
        // 验证基本结构
        expect(relations.basePalace.index).toBe(i)
        expect(relations.opposite.index).toBe((i + 6) % 12)
        
        // 验证三合宫
        const trinity = getTrinityPalaces(i)
        expect(trinity).toHaveLength(3)
        expect(trinity[0]).toBe(i)
        expect(trinity[1]).toBe((i + 4) % 12)
        expect(trinity[2]).toBe((i + 8) % 12)
        
        // 验证四正宫
        const square = getSquarePalaces(i)
        expect(square).toHaveLength(4)
        expect(square[0]).toBe(i)
        expect(square[1]).toBe((i + 3) % 12)
        expect(square[2]).toBe((i + 6) % 12)
        expect(square[3]).toBe((i + 9) % 12)
        
        // 验证本体宫
        const essence = getEssencePalace(i)
        expect(essence).toHaveLength(2)
        expect(essence[0]).toBe(i)
        expect(essence[1]).toBe((i + 5) % 12)
        
        // 验证关系的对称性
        const oppositeRelations = getPalaceRelationships(relations.opposite.index)
        expect(oppositeRelations.opposite.index).toBe(i)
      }
    })
    
    it('三合宫应该形成闭环', () => {
      const startPalace = 0
      const trinity = getTrinityPalaces(startPalace)
      
      // 每个三合宫的成员应该互相包含
      for (const palace of trinity) {
        const palaceTrinity = getTrinityPalaces(palace)
        expect(palaceTrinity).toContain(trinity[0])
        expect(palaceTrinity).toContain(trinity[1])
        expect(palaceTrinity).toContain(trinity[2])
      }
    })
  })
  
  describe('时间计算完整性测试', () => {
    const birthDate = new Date('1990-05-15T14:30:00')
    const targetDate = new Date('2024-12-01T10:00:00')
    
    it('应该正确计算完整的时间信息', () => {
      const timeInfo = getComprehensiveTimeInfo(
        birthDate,
        targetDate,
        'male',
        '庚',
        '午',
        'fire_6',
        0
      )
      
      // 验证年龄计算
      expect(timeInfo.currentAge).toBe(34)
      
      // 验证大运期
      expect(timeInfo.majorPeriod).toBeDefined()
      expect(timeInfo.majorPeriod.periodNumber).toBeGreaterThan(0)
      expect(timeInfo.majorPeriod.startAge).toBeLessThanOrEqual(34)
      expect(timeInfo.majorPeriod.endAge).toBeGreaterThanOrEqual(34)
      
      // 验证流年
      expect(timeInfo.fleetingYear).toBeDefined()
      expect(timeInfo.fleetingYear.year).toBe(2024)
      expect(timeInfo.fleetingYear.stem).toBe('甲')
      expect(timeInfo.fleetingYear.branch).toBe('辰')
      
      // 验证流月
      expect(timeInfo.fleetingMonth).toBeDefined()
      expect(timeInfo.fleetingMonth.month).toBe(12)
      
      // 验证小限
      expect(timeInfo.minorLimit).toBeDefined()
      expect(timeInfo.minorLimit.age).toBe(34)
      
      // 验证时间跨度
      expect(timeInfo.timeSpan).toBeDefined()
      expect(timeInfo.timeSpan.years).toBe(34)
    })
    
    it('大运期应该连续且不重叠', () => {
      const periods: any[] = []
      
      // 收集前5个大运期
      for (let age = 10; age <= 50; age += 10) {
        const checkDate = new Date(birthDate)
        checkDate.setFullYear(checkDate.getFullYear() + age)
        
        const period = getCurrentMajorPeriod(
          birthDate,
          checkDate,
          'male',
          '庚',
          'fire_6',
          0
        )
        
        // 检查是否已存在
        const existing = periods.find(p => p.periodNumber === period.periodNumber)
        if (!existing) {
          periods.push(period)
        }
      }
      
      // 验证连续性
      periods.sort((a, b) => a.periodNumber - b.periodNumber)
      for (let i = 1; i < periods.length; i++) {
        const prev = periods[i - 1]
        const curr = periods[i]
        
        // 年龄应该连续
        expect(curr.startAge).toBe(prev.endAge + 1)
        // 期数应该递增
        expect(curr.periodNumber).toBe(prev.periodNumber + 1)
      }
    })
    
    it('流年干支应该符合六十甲子循环', () => {
      const years = [2020, 2021, 2022, 2023, 2024]
      const expectedGanZhi = ['庚子', '辛丑', '壬寅', '癸卯', '甲辰']
      
      years.forEach((year, index) => {
        const fleetingYear = getFleetingYear(birthDate, year)
        expect(fleetingYear.ganZhi).toBe(expectedGanZhi[index])
      })
    })
  })
  
  describe('数据一致性测试', () => {
    it('相同输入应该产生相同输出', () => {
      const input = {
        year: 1995,
        month: 6,
        day: 15,
        hour: 8,
        gender: 'female' as const
      }
      
      const api = new ZiweiAPI()
      
      // 多次调用应该返回相同结果
      const chart1 = api.getChart(input)
      const chart2 = api.getChart(input)
      const chart3 = api.getChart(input)
      
      expect(chart1).toEqual(chart2)
      expect(chart2).toEqual(chart3)
      
      // 关键字段验证
      expect(chart1.yearStem).toBe(chart2.yearStem)
      expect(chart1.yearBranch).toBe(chart2.yearBranch)
      expect(chart1.fiveElementsBureau).toBe(chart2.fiveElementsBureau)
      expect(chart1.lifePalace).toEqual(chart2.lifePalace)
      expect(chart1.bodyPalace).toEqual(chart2.bodyPalace)
    })
    
    it('性别差异应该只影响特定计算', () => {
      const birthDate = new Date('1990-05-15')
      const targetDate = new Date('2020-05-15')
      
      const maleInfo = getComprehensiveTimeInfo(
        birthDate,
        targetDate,
        'male',
        '庚',
        '午',
        'fire_6',
        0
      )
      
      const femaleInfo = getComprehensiveTimeInfo(
        birthDate,
        targetDate,
        'female',
        '庚',
        '午',
        'fire_6',
        0
      )
      
      // 流年流月应该相同
      expect(maleInfo.fleetingYear).toEqual(femaleInfo.fleetingYear)
      expect(maleInfo.fleetingMonth).toEqual(femaleInfo.fleetingMonth)
      
      // 大运和小限可能不同（顺逆行）
      expect(maleInfo.majorPeriod.palaceIndex).not.toBe(femaleInfo.majorPeriod.palaceIndex)
      expect(maleInfo.minorLimit.palaceIndex).not.toBe(femaleInfo.minorLimit.palaceIndex)
    })
  })
  
  describe('错误处理和边界条件', () => {
    it('应该处理无效日期输入', () => {
      const api = new ZiweiAPI()
      
      const invalidInputs = [
        { year: -1, month: 1, day: 1, hour: 1, gender: 'male' as const },
        { year: 2024, month: 13, day: 1, hour: 1, gender: 'male' as const },
        { year: 2024, month: 2, day: 30, hour: 1, gender: 'male' as const },
        { year: 2024, month: 1, day: 1, hour: 25, gender: 'male' as const }
      ]
      
      invalidInputs.forEach(input => {
        // 不应该抛出错误，应该返回默认值或处理边界情况
        expect(() => api.getChart(input)).not.toThrow()
      })
    })
    
    it('应该处理极端年份', () => {
      const extremeYears = [1600, 1900, 2100, 2500]
      
      extremeYears.forEach(year => {
        const ganZhi = calculateYearGanZhi(year)
        expect(ganZhi.stem).toBeDefined()
        expect(ganZhi.branch).toBeDefined()
        expect(ganZhi.stem).toMatch(/^[甲乙丙丁戊己庚辛壬癸]$/)
        expect(ganZhi.branch).toMatch(/^[子丑寅卯辰巳午未申酉戌亥]$/)
      })
    })
    
    it('应该处理闰月情况', () => {
      // 2020年有闰四月
      const input = {
        year: 2020,
        month: 4,
        day: 15,
        hour: 6,
        gender: 'male' as const,
        isLeapMonth: true
      }
      
      const api = new ZiweiAPI()
      const chart = api.getChart(input)
      
      expect(chart).toBeDefined()
      expect(chart.palacesByBranch).toBeDefined()
    })
  })
  
  describe('组合功能测试', () => {
    it('应该正确组合使用多个功能模块', () => {
      const birthDate = new Date('1985-03-20T10:30:00')
      const targetDate = new Date('2024-12-01T10:00:00')
      
      // Step 1: 基础计算
      const yearGanZhi = calculateYearGanZhi(1985)
      const lifePalaceIndex = calculateLifePalace(3, 6)
      const bodyPalaceIndex = calculateBodyPalace(3, 6)
      
      // Step 2: 获取宫位关系
      const lifeRelations = getPalaceRelationships(lifePalaceIndex)
      const bodyRelations = getPalaceRelationships(bodyPalaceIndex)
      
      // Step 3: 获取时间信息
      const timeInfo = getComprehensiveTimeInfo(
        birthDate,
        targetDate,
        'female',
        yearGanZhi.stem,
        yearGanZhi.branch,
        'wood_3',
        lifePalaceIndex
      )
      
      // Step 4: 组合分析
      // 检查命宫与身宫的关系
      const lifeBodyRelation = (() => {
        if (getOppositePalace(lifePalaceIndex) === bodyPalaceIndex) {
          return '对宫关系'
        } else if (getTrinityPalaces(lifePalaceIndex).includes(bodyPalaceIndex)) {
          return '三合关系'
        } else if (getSquarePalaces(lifePalaceIndex).includes(bodyPalaceIndex)) {
          return '四正关系'
        } else if (getEssencePalace(lifePalaceIndex).includes(bodyPalaceIndex)) {
          return '本体关系'
        } else {
          return '无直接关系'
        }
      })()
      
      // 验证组合结果
      expect(lifeRelations).toBeDefined()
      expect(bodyRelations).toBeDefined()
      expect(timeInfo).toBeDefined()
      expect(lifeBodyRelation).toBeDefined()
      expect(['对宫关系', '三合关系', '四正关系', '本体关系', '无直接关系'])
        .toContain(lifeBodyRelation)
    })
  })
})