/**
 * 时间计算功能测试
 * Tests for Time-based Calculation Functions
 */

import {
  calculateAge,
  getCurrentMajorPeriod,
  getFleetingYear,
  getFleetingMonth,
  getMinorLimit,
  getMinorLimitLegacy,
  calculateTimeSpan,
  isValidDate,
  formatGanZhi,
  getComprehensiveTimeInfo
} from '../time-calculations'
import { getPalaceName } from '../calculations/palace-calculations'

describe('时间计算功能测试', () => {
  
  describe('calculateAge - 年龄计算', () => {
    it('应该正确计算年龄', () => {
      const birthDate = new Date('1990-05-15')
      
      // 同年生日后
      const date1 = new Date('1990-12-31')
      expect(calculateAge(birthDate, date1)).toBe(0)
      
      // 次年生日前
      const date2 = new Date('1991-05-14')
      expect(calculateAge(birthDate, date2)).toBe(0)
      
      // 次年生日当天
      const date3 = new Date('1991-05-15')
      expect(calculateAge(birthDate, date3)).toBe(1)
      
      // 30岁
      const date4 = new Date('2020-05-15')
      expect(calculateAge(birthDate, date4)).toBe(30)
      
      // 35岁生日前一天
      const date5 = new Date('2025-05-14')
      expect(calculateAge(birthDate, date5)).toBe(34)
    })
    
    it('应该处理闰年2月29日出生的情况', () => {
      const birthDate = new Date('2000-02-29')
      
      // 非闰年的3月1日
      const date1 = new Date('2001-03-01')
      expect(calculateAge(birthDate, date1)).toBe(1)
      
      // 非闰年的2月28日
      const date2 = new Date('2001-02-28')
      expect(calculateAge(birthDate, date2)).toBe(0)
    })
  })
  
  describe('getCurrentMajorPeriod - 大运期计算', () => {
    it('应该正确计算阳男的大运期', () => {
      const birthDate = new Date('1990-01-01')
      const targetDate = new Date('2020-01-01')
      const ctx = {
        birthDate,
        gender: 'male' as const,
        yearStem: '庚' as const,
        yearBranch: '午' as const,
        fiveElementsBureau: 'fire_6',
        lifePalaceIndex: 0
      }

      const majorPeriod = getCurrentMajorPeriod(ctx, targetDate)

      expect(majorPeriod.periodNumber).toBeGreaterThan(0)
      expect(majorPeriod.startAge).toBeLessThanOrEqual(30)
      expect(majorPeriod.endAge).toBeGreaterThanOrEqual(30)
      expect(majorPeriod.palaceIndex).toBeLessThan(12)
      expect(majorPeriod.palaceName).toBeTruthy()
    })

    it('应该正确计算阴女的大运期', () => {
      const ctx = {
        birthDate: new Date('1991-01-01'),
        gender: 'female' as const,
        yearStem: '辛' as const,
        yearBranch: '未' as const,
        fiveElementsBureau: 'wood_3',
        lifePalaceIndex: 2
      }
      const targetDate = new Date('2021-01-01')

      const majorPeriod = getCurrentMajorPeriod(ctx, targetDate)

      expect(majorPeriod.periodNumber).toBeGreaterThan(0)
      expect(majorPeriod.startAge).toBeLessThanOrEqual(30)
      expect(majorPeriod.endAge).toBeGreaterThanOrEqual(30)
    })

    it('大运期应该覆盖10年时间跨度', () => {
      const ctx = {
        birthDate: new Date('1990-01-01'),
        gender: 'male' as const,
        yearStem: '庚' as const,
        yearBranch: '午' as const,
        fiveElementsBureau: 'fire_6',
        lifePalaceIndex: 0
      }
      const targetDate = new Date('2020-01-01')

      const majorPeriod = getCurrentMajorPeriod(ctx, targetDate)

      expect(majorPeriod.endAge - majorPeriod.startAge).toBe(9)
      expect(majorPeriod.endYear - majorPeriod.startYear).toBe(9)
    })

    it('大运宫位名称应与命宫映射一致', () => {
      const ctx = {
        birthDate: new Date('1992-02-02'),
        gender: 'male' as const,
        yearStem: '壬' as const,
        yearBranch: '申' as const,
        fiveElementsBureau: 'water_2',
        lifePalaceIndex: 4
      }
      const targetDate = new Date('2025-01-01')

      const period = getCurrentMajorPeriod(ctx, targetDate)

      expect(period.palaceName).toBe(getPalaceName(period.palaceIndex, ctx.lifePalaceIndex))
    })
  })
  
  describe('getFleetingYear - 流年计算', () => {
    it('应该正确计算流年干支', () => {
      const birthDate = new Date('1990-01-01')
      
      // 2020年（庚子年）
      const fleeting2020 = getFleetingYear(birthDate, 2020, 1)
      expect(fleeting2020.year).toBe(2020)
      expect(fleeting2020.age).toBe(30)
      expect(fleeting2020.stem).toBe('庚')
      expect(fleeting2020.branch).toBe('子')
      expect(fleeting2020.ganZhi).toBe('庚子')
      
      // 2024年（甲辰年）
      const fleeting2024 = getFleetingYear(birthDate, 2024, 1)
      expect(fleeting2024.stem).toBe('甲')
      expect(fleeting2024.branch).toBe('辰')
      expect(fleeting2024.ganZhi).toBe('甲辰')
    })
    
    it('流年宫位索引应该与地支索引对应', () => {
      const birthDate = new Date('1990-01-01')
      
      // 子年
      const yearZi = getFleetingYear(birthDate, 2020, 4)
      expect(yearZi.palaceIndex).toBe(0) // 子的索引为0
      
      // 午年
      const yearWu = getFleetingYear(birthDate, 2014, 4)
      expect(yearWu.palaceIndex).toBe(6) // 午的索引为6
    })

    it('流年宫名应随命宫索引旋转', () => {
      const birthDate = new Date('1990-05-15')
      const lifePalaceIndex = 5
      const year = getFleetingYear(birthDate, 2024, lifePalaceIndex)
      expect(year.palaceName).toBe(getPalaceName(year.palaceIndex, lifePalaceIndex))
    })
  })
  
  describe('getFleetingMonth - 流月计算', () => {
    it('应该正确计算流月干支', () => {
      const birthDate = new Date('1990-01-01')
      
      // 2024年甲辰年的正月应该是丙寅月
      const month1 = getFleetingMonth(birthDate, 2024, 1, 2)
      expect(month1.stem).toBe('丙')
      expect(month1.branch).toBe('寅')
      expect(month1.ganZhi).toBe('丙寅')
      
      // 2024年甲辰年的五月应该是庚午月
      const month5 = getFleetingMonth(birthDate, 2024, 5, 2)
      expect(month5.stem).toBe('庚')
      expect(month5.branch).toBe('午')
    })
    
    it('应该遵循五虎遁规则', () => {
      const birthDate = new Date('1990-01-01')
      
      // 甲己年起丙寅月
      const jiaNian = getFleetingMonth(birthDate, 2024, 1, 0) // 2024甲辰年
      expect(jiaNian.stem).toBe('丙')
      
      // 乙庚年起戊寅月
      const gengNian = getFleetingMonth(birthDate, 2020, 1, 0) // 2020庚子年
      expect(gengNian.stem).toBe('戊')
    })

    it('流月宫名应与命宫映射一致', () => {
      const birthDate = new Date('1990-01-01')
      const lifePalaceIndex = 7
      const month = getFleetingMonth(birthDate, 2024, 8, lifePalaceIndex)
      expect(month.palaceName).toBe(getPalaceName(month.palaceIndex, lifePalaceIndex))
    })
  })
  
  describe('getMinorLimit - 小限计算', () => {
    it('男命小限应该顺行', () => {
      const birthDate = new Date('1990-01-01')
      const targetDate1 = new Date('1991-01-01') // 1岁
      const targetDate2 = new Date('1992-01-01') // 2岁
      
      const ctx = {
        birthDate,
        gender: 'male' as const,
        yearBranch: '午' as const,
        lifePalaceIndex: 4
      }
      const minor1 = getMinorLimit(ctx, targetDate1)
      const minor2 = getMinorLimit(ctx, targetDate2)
      
      // 顺行：第二年的宫位应该在第一年之后
      const diff = (minor2.palaceIndex - minor1.palaceIndex + 12) % 12
      expect(diff).toBe(1)
    })
    
    it('女命小限应该逆行', () => {
      const birthDate = new Date('1990-01-01')
      const targetDate1 = new Date('1991-01-01') // 1岁
      const targetDate2 = new Date('1992-01-01') // 2岁
      
      const ctx = {
        birthDate,
        gender: 'female' as const,
        yearBranch: '午' as const,
        lifePalaceIndex: 8
      }
      const minor1 = getMinorLimit(ctx, targetDate1)
      const minor2 = getMinorLimit(ctx, targetDate2)
      
      // 逆行：第二年的宫位应该在第一年之前
      const diff = (minor1.palaceIndex - minor2.palaceIndex + 12) % 12
      expect(diff).toBe(1)
    })
    
    it('应该根据年支确定起始位置', () => {
      const birthDate = new Date('1990-01-01')
      const targetDate = new Date('1990-01-01') // 0岁
      
      // 子年生人
      const ziYear = getMinorLimitLegacy(birthDate, targetDate, 'male', '子', 3)
      expect(ziYear.palaceIndex).toBe(3) // 从辰宫起（索引4-1=3）
      
      // 丑年生人
      const chouYear = getMinorLimitLegacy(birthDate, targetDate, 'male', '丑', 3)
      expect(chouYear.palaceIndex).toBe(6) // 从未宫起（索引7-1=6）
    })

    it('小限宫名应与命宫映射一致', () => {
      const ctx = {
        birthDate: new Date('1990-01-01'),
        gender: 'male' as const,
        yearBranch: '午' as const,
        lifePalaceIndex: 2
      }
      const minor = getMinorLimit(ctx, new Date('1991-01-01'))
      expect(minor.palaceName).toBe(getPalaceName(minor.palaceIndex, ctx.lifePalaceIndex))
    })
  })
  
  describe('calculateTimeSpan - 时间跨度计算', () => {
    it('应该正确计算时间跨度', () => {
      const date1 = new Date('2020-01-15')
      const date2 = new Date('2023-03-20')
      
      const span = calculateTimeSpan(date1, date2)
      
      expect(span.years).toBe(3)
      expect(span.months).toBe(2)
      expect(span.days).toBe(5)
      expect(span.totalDays).toBeGreaterThan(1000)
    })
    
    it('应该处理跨月的情况', () => {
      const date1 = new Date('2020-01-31')
      const date2 = new Date('2020-03-01')
      
      const span = calculateTimeSpan(date1, date2)
      
      expect(span.years).toBe(0)
      expect(span.months).toBe(1)
      expect(span.days).toBe(1)
    })
  })
  
  describe('工具函数测试', () => {
    describe('isValidDate', () => {
      it('应该正确验证日期', () => {
        expect(isValidDate(new Date('2020-01-01'))).toBe(true)
        expect(isValidDate(new Date())).toBe(true)
        expect(isValidDate(new Date('invalid'))).toBe(false)
        expect(isValidDate(null as any)).toBe(false)
      })
    })
    
    describe('formatGanZhi', () => {
      it('应该正确格式化干支', () => {
        expect(formatGanZhi('甲', '子')).toBe('甲子')
        expect(formatGanZhi('癸', '亥')).toBe('癸亥')
        expect(formatGanZhi('丙', '午')).toBe('丙午')
      })
    })
  })
  
  describe('getComprehensiveTimeInfo - 综合时间信息', () => {
    it('应该返回完整的时间信息', () => {
      const birthDate = new Date('1990-05-15')
      const targetDate = new Date('2020-08-20')
      
      const info = getComprehensiveTimeInfo(
        birthDate,
        targetDate,
        'male',
        '庚',      // 1990庚午年
        '午',
        'fire_6',
        0          // 命宫在子
      )
      
      // 验证所有字段都存在
      expect(info.currentAge).toBe(30)
      expect(info.majorPeriod).toBeDefined()
      expect(info.fleetingYear).toBeDefined()
      expect(info.fleetingMonth).toBeDefined()
      expect(info.minorLimit).toBeDefined()
      expect(info.timeSpan).toBeDefined()
      
      // 验证数据一致性
      expect(info.fleetingYear.year).toBe(2020)
      expect(info.fleetingMonth.year).toBe(2020)
      expect(info.fleetingMonth.month).toBe(8)
      expect(info.minorLimit.age).toBe(30)
    })
    
    it('应该正确处理不同性别', () => {
      const birthDate = new Date('1990-05-15')
      const targetDate = new Date('2020-08-20')
      
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
      
      // 大运和小限方向应该不同
      expect(maleInfo.majorPeriod.palaceIndex).not.toBe(femaleInfo.majorPeriod.palaceIndex)
      expect(maleInfo.minorLimit.palaceIndex).not.toBe(femaleInfo.minorLimit.palaceIndex)
      
      // 流年流月应该相同
      expect(maleInfo.fleetingYear).toEqual(femaleInfo.fleetingYear)
      expect(maleInfo.fleetingMonth).toEqual(femaleInfo.fleetingMonth)
    })
  })
})
