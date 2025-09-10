import { 
  getMingZhu, 
  getShenZhu, 
  getStarsByType, 
  PALACE_NAMES, 
  CATEGORIES 
} from '../ziwei/utils'
import { mockZiweiResult } from '../test-utils'

describe('Ziwei Utils', () => {
  describe('getMingZhu', () => {
    it('returns correct Ming Zhu for different branches', () => {
      expect(getMingZhu('子')).toBe('贪狼')
      expect(getMingZhu('丑')).toBe('巨门')
      expect(getMingZhu('寅')).toBe('存保')
    })
  })

  describe('getShenZhu', () => {
    it('returns correct Shen Zhu for different branches', () => {
      expect(getShenZhu('子')).toBe('文曲')
      expect(getShenZhu('丑')).toBe('文昌')
      expect(getShenZhu('寅')).toBe('廉贞')
    })
  })

  describe('getStarsByType', () => {
    const mockStars = [
      { name: '紫微', type: '主星', brightness: '庙' },
      { name: '左辅', type: '辅星', brightness: '平' },
      { name: '天喜', type: '吉星', brightness: '旺' },
      { name: '擎羊', type: '煞星', brightness: '陷' },
      { name: '解神', type: '杂星', brightness: '利' }
    ] as any[]

    it('correctly categorizes stars by type', () => {
      const result = getStarsByType(mockStars)
      
      expect(result.mainStars).toHaveLength(1)
      expect(result.mainStars[0].name).toBe('紫微')
      
      expect(result.auxiliaryStars).toHaveLength(1)
      expect(result.auxiliaryStars[0].name).toBe('左辅')
      
      expect(result.blessingsStars).toHaveLength(1)
      expect(result.blessingsStars[0].name).toBe('天喜')
      
      expect(result.inauspiciousStars).toHaveLength(1)
      expect(result.inauspiciousStars[0].name).toBe('擎羊')
      
      expect(result.miscStars).toHaveLength(1)
      expect(result.miscStars[0].name).toBe('解神')
    })

    it('handles empty star array', () => {
      const result = getStarsByType([])
      
      expect(result.mainStars).toHaveLength(0)
      expect(result.auxiliaryStars).toHaveLength(0)
      expect(result.blessingsStars).toHaveLength(0)
      expect(result.inauspiciousStars).toHaveLength(0)
      expect(result.miscStars).toHaveLength(0)
    })
  })

  describe('Constants', () => {
    it('PALACE_NAMES contains all 12 palaces', () => {
      expect(PALACE_NAMES).toHaveLength(12)
      expect(PALACE_NAMES).toContain('命宫')
      expect(PALACE_NAMES).toContain('兄弟')
      expect(PALACE_NAMES).toContain('夫妻')
    })

    it('CATEGORIES contains all category types', () => {
      expect(CATEGORIES).toHaveLength(5)
      expect(CATEGORIES.find(c => c.key === 'friends')).toBeDefined()
      expect(CATEGORIES.find(c => c.key === 'family')).toBeDefined()
    })
  })
})