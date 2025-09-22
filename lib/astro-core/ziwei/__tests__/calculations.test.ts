import { generateCompleteZiWeiChart } from '../calculations'
import type { ZiWeiChartInput } from '../complete-chart-types'

describe('ZiWei Core Calculations', () => {
  describe('generateCompleteZiWeiChart', () => {
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

    it('should generate complete chart with correct basic info', () => {
      const result = generateCompleteZiWeiChart(testInput)

      expect(result).toHaveProperty('birthInfo')
      expect(result).toHaveProperty('bazi')
      expect(result).toHaveProperty('baziQiyun')
      expect(result).toHaveProperty('baziDayun')
      expect(result).toHaveProperty('palaces')

      // Check birth info structure
      expect(result.birthInfo.solar).toEqual({
        year: 1988,
        month: 6,
        day: 20,
        hour: 23,
        gender: 'male',
        isLunar: false
      })

      expect(result.birthInfo.lunar).toHaveProperty('yearStem')
      expect(result.birthInfo.lunar).toHaveProperty('yearBranch')
      expect(result.birthInfo.lunar).toHaveProperty('yearGanzhi')
    })

    it('should calculate correct BaZi (八字)', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      expect(result.bazi).toBe('戊辰戊午丙午戊子')
      expect(typeof result.bazi).toBe('string')
      expect(result.bazi).toHaveLength(8) // 4 pillars × 2 characters each
    })

    it('should calculate correct QiYun (起运) timing', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      expect(result.baziQiyun).toMatch(/^\d+年\d+个月$/)
      expect(result.baziQiyun).toBe('5年5个月')
    })

    it('should calculate correct DaYun (大运) periods', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      expect(typeof result.baziDayun).toBe('string')
      expect(result.baziDayun).toContain('6-15岁')
      expect(result.baziDayun).toContain('己未')
      
      // Should have 8 major periods (大运)
      const periods = result.baziDayun.split(', ')
      expect(periods).toHaveLength(8)
    })

    it('should have all 12 palaces (宫位)', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
      
      expect(Object.keys(result.palaces)).toHaveLength(12)
      
      branches.forEach(branch => {
        expect(result.palaces).toHaveProperty(branch)
        expect(result.palaces[branch]).toHaveProperty('palaceName')
        expect(result.palaces[branch]).toHaveProperty('mainStars')
        expect(result.palaces[branch]).toHaveProperty('auxiliaryStars')
        expect(result.palaces[branch]).toHaveProperty('minorStars')
      })
    })

    it('should identify correct life palace (命宫)', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      expect(result.lifePalace).toBe('命宫')
      
      // The life palace should be in the 午 position for this birth chart
      const lifePalaceData = result.palaces['午']
      expect(lifePalaceData.palaceName).toBe('命宫')
      expect(lifePalaceData.mainStars.length).toBeGreaterThan(0)
    })

    it('should calculate five elements bureau (五行局)', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      expect(result.fiveElementsBureau).toHaveProperty('name')
      expect(result.fiveElementsBureau).toHaveProperty('number')
      expect(result.fiveElementsBureau.name).toBe('火六局')
      expect(result.fiveElementsBureau.number).toBe('6')
    })

    it('should include sihua analysis (四化分析)', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      expect(result.sihuaAnalysis).toHaveProperty('birthYearSihua')
      expect(result.sihuaAnalysis.birthYearSihua).toHaveProperty('stem')
      expect(result.sihuaAnalysis.birthYearSihua).toHaveProperty('transformations')
      
      const transformations = result.sihuaAnalysis.birthYearSihua.transformations
      expect(transformations).toHaveProperty('lu')
      expect(transformations).toHaveProperty('quan')
      expect(transformations).toHaveProperty('ke')
      expect(transformations).toHaveProperty('ji')
    })

    it('should handle female birth correctly', () => {
      const femaleInput: ZiWeiChartInput = {
        ...testInput,
        gender: 'female'
      }
      
      const result = generateCompleteZiWeiChart(femaleInput)
      
      expect(result.birthInfo.solar.gender).toBe('female')
      expect(result).toHaveProperty('baziQiyun')
      expect(result).toHaveProperty('baziDayun')
    })

    it('should handle different birth times consistently', () => {
      const morningInput: ZiWeiChartInput = {
        ...testInput,
        hour: 9
      }
      
      const result = generateCompleteZiWeiChart(morningInput)
      
      expect(result).toHaveProperty('bazi')
      expect(result.bazi).not.toBe('戊辰戊午丙午戊子') // Different time should give different time pillar
    })

    it('should include metadata', () => {
      const result = generateCompleteZiWeiChart(testInput)
      
      expect(result).toHaveProperty('generatedAt')
      expect(result).toHaveProperty('version')
      expect(new Date(result.generatedAt)).toBeInstanceOf(Date)
      expect(result.version).toBe('1.0.0')
    })
  })

  describe('Edge Cases', () => {
    it('should handle leap years correctly', () => {
      const leapYearInput: ZiWeiChartInput = {
        year: 2020,
        month: 2,
        day: 29,
        hour: 12,
        gender: 'male',
        isLunar: false,
        isLeapMonth: false,
        timezone: 'Asia/Shanghai'
      }
      
      expect(() => generateCompleteZiWeiChart(leapYearInput)).not.toThrow()
    })

    it('should handle lunar calendar input', () => {
      const lunarInput: ZiWeiChartInput = {
        year: 1988,
        month: 5,
        day: 7,
        hour: 23,
        gender: 'male',
        isLunar: true,
        isLeapMonth: false,
        timezone: 'Asia/Shanghai'
      }
      
      const result = generateCompleteZiWeiChart(lunarInput)
      expect(result).toHaveProperty('bazi')
    })
  })
})