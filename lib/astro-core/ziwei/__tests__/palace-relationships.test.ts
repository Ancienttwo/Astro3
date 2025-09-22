/**
 * 宫位关系功能测试
 * Tests for Palace Relationship Functions
 */

import {
  getOppositePalace,
  getTrinityPalaces,
  getSquarePalaces,
  getEssencePalace,
  getPalaceRelationships,
  isValidPalaceIndex,
  getPalaceIndexByName
} from '../palace-relationships'
import { PALACE_NAMES } from '../constants'

describe('宫位关系查询功能测试', () => {
  
  describe('getOppositePalace - 对宫查询', () => {
    it('应该正确返回对宫位置', () => {
      // 命宫(0)的对宫是迁移宫(6)
      expect(getOppositePalace(0)).toBe(6)
      
      // 兄弟宫(1)的对宫是交友宫(7)
      expect(getOppositePalace(1)).toBe(7)
      
      // 夫妻宫(2)的对宫是官禄宫(8)
      expect(getOppositePalace(2)).toBe(8)
      
      // 迁移宫(6)的对宫是命宫(0)
      expect(getOppositePalace(6)).toBe(0)
      
      // 测试边界情况
      expect(getOppositePalace(11)).toBe(5)
    })
  })
  
  describe('getTrinityPalaces - 三合宫查询', () => {
    it('应该返回正确的159关系三合宫', () => {
      // 命宫(0)的三合宫：第1宫(本宫0)、第5宫(4)、第9宫(8)
      const trinity0 = getTrinityPalaces(0)
      expect(trinity0).toEqual([0, 4, 8])
      
      // 兄弟宫(1)的三合宫：第1宫(本宫1)、第5宫(5)、第9宫(9)
      const trinity1 = getTrinityPalaces(1)
      expect(trinity1).toEqual([1, 5, 9])
      
      // 测试循环边界
      const trinity10 = getTrinityPalaces(10)
      expect(trinity10).toEqual([10, 2, 6])
    })
    
    it('三合宫应该形成120度关系', () => {
      const trinity = getTrinityPalaces(0)
      // 验证每个宫位之间相距4个位置(120度)
      expect((trinity[1] - trinity[0] + 12) % 12).toBe(4)
      expect((trinity[2] - trinity[1] + 12) % 12).toBe(4)
      expect((trinity[0] - trinity[2] + 12) % 12).toBe(4)
    })
  })
  
  describe('getSquarePalaces - 四正宫查询', () => {
    it('应该返回正确的1 4 7 10关系四正宫', () => {
      // 命宫(0)的四正宫：第1宫(本宫0)、第4宫(3)、第7宫(6)、第10宫(9)
      const square0 = getSquarePalaces(0)
      expect(square0).toEqual([0, 3, 6, 9])
      
      // 财帛宫(4)的四正宫：第1宫(本宫4)、第4宫(7)、第7宫(10)、第10宫(1)
      const square4 = getSquarePalaces(4)
      expect(square4).toEqual([4, 7, 10, 1])
      
      // 测试循环边界
      const square11 = getSquarePalaces(11)
      expect(square11).toEqual([11, 2, 5, 8])
    })
    
    it('四正宫应该形成90度关系', () => {
      const square = getSquarePalaces(0)
      // 验证每个宫位之间相距3个位置(90度)
      expect((square[1] - square[0] + 12) % 12).toBe(3)
      expect((square[2] - square[1] + 12) % 12).toBe(3)
      expect((square[3] - square[2] + 12) % 12).toBe(3)
      expect((square[0] - square[3] + 12) % 12).toBe(3)
    })
  })
  
  describe('getEssencePalace - 本体宫查询', () => {
    it('应该返回正确的16关系本体宫', () => {
      // 命宫(0)的本体宫：第1宫(本宫0)、第6宫(5)
      const essence0 = getEssencePalace(0)
      expect(essence0).toEqual([0, 5])
      
      // 夫妻宫(2)的本体宫：第1宫(本宫2)、第6宫(7)
      const essence2 = getEssencePalace(2)
      expect(essence2).toEqual([2, 7])
      
      // 测试循环边界
      const essence8 = getEssencePalace(8)
      expect(essence8).toEqual([8, 1])
    })
    
    it('本体宫应该相距5个位置', () => {
      const essence = getEssencePalace(0)
      expect((essence[1] - essence[0] + 12) % 12).toBe(5)
    })
  })
  
  describe('getPalaceRelationships - 完整宫位关系查询', () => {
    it('应该返回完整的宫位关系信息', () => {
      const relations = getPalaceRelationships(0)
      
      // 基础宫位
      expect(relations.basePalace).toEqual({
        index: 0,
        name: '命宫'
      })
      
      // 对宫
      expect(relations.opposite).toEqual({
        index: 6,
        name: '迁移'
      })
      
      // 三合宫
      expect(relations.trinity).toHaveLength(3)
      expect(relations.trinity[0]).toEqual({
        index: 0,
        name: '命宫',
        position: '本宫'
      })
      expect(relations.trinity[1]).toEqual({
        index: 4,
        name: '财帛',
        position: '第5宫'
      })
      expect(relations.trinity[2]).toEqual({
        index: 8,
        name: '官禄',
        position: '第9宫'
      })
      
      // 四正宫
      expect(relations.square).toHaveLength(4)
      expect(relations.square[0].position).toBe('本宫')
      expect(relations.square[1].position).toBe('第4宫')
      expect(relations.square[2].position).toBe('第7宫')
      expect(relations.square[3].position).toBe('第10宫')
      
      // 本体宫
      expect(relations.essence).toHaveLength(2)
      expect(relations.essence[0].position).toBe('本宫')
      expect(relations.essence[1].position).toBe('第6宫')
    })
  })
  
  describe('工具函数测试', () => {
    describe('isValidPalaceIndex', () => {
      it('应该正确验证宫位索引', () => {
        // 有效索引
        expect(isValidPalaceIndex(0)).toBe(true)
        expect(isValidPalaceIndex(5)).toBe(true)
        expect(isValidPalaceIndex(11)).toBe(true)
        
        // 无效索引
        expect(isValidPalaceIndex(-1)).toBe(false)
        expect(isValidPalaceIndex(12)).toBe(false)
        expect(isValidPalaceIndex(1.5)).toBe(false)
        expect(isValidPalaceIndex(NaN)).toBe(false)
      })
    })
    
    describe('getPalaceIndexByName', () => {
      it('应该正确返回宫位索引', () => {
        expect(getPalaceIndexByName('命宫')).toBe(0)
        expect(getPalaceIndexByName('兄弟')).toBe(1)
        expect(getPalaceIndexByName('夫妻')).toBe(2)
        expect(getPalaceIndexByName('子女')).toBe(3)
        expect(getPalaceIndexByName('财帛')).toBe(4)
        expect(getPalaceIndexByName('疾厄')).toBe(5)
        expect(getPalaceIndexByName('迁移')).toBe(6)
        expect(getPalaceIndexByName('交友')).toBe(7)
        expect(getPalaceIndexByName('官禄')).toBe(8)
        expect(getPalaceIndexByName('田宅')).toBe(9)
        expect(getPalaceIndexByName('福德')).toBe(10)
        expect(getPalaceIndexByName('父母')).toBe(11)
      })
      
      it('未找到时应该返回-1', () => {
        expect(getPalaceIndexByName('不存在的宫')).toBe(-1)
        expect(getPalaceIndexByName('')).toBe(-1)
      })
    })
  })
  
  describe('实际应用场景测试', () => {
    it('分析命宫与财帛宫的关系', () => {
      const lifeIndex = 0  // 命宫
      const wealthIndex = 4 // 财帛宫
      
      // 命宫的三合宫包含财帛宫
      const lifeTrinity = getTrinityPalaces(lifeIndex)
      expect(lifeTrinity).toContain(wealthIndex)
      
      // 财帛宫的三合宫也包含命宫
      const wealthTrinity = getTrinityPalaces(wealthIndex)
      expect(wealthTrinity).toContain(lifeIndex)
    })
    
    it('分析夫妻宫与官禄宫的对宫关系', () => {
      const spouseIndex = 2  // 夫妻宫
      const careerIndex = 8  // 官禄宫
      
      // 夫妻宫的对宫是官禄宫
      expect(getOppositePalace(spouseIndex)).toBe(careerIndex)
      
      // 官禄宫的对宫是夫妻宫
      expect(getOppositePalace(careerIndex)).toBe(spouseIndex)
    })
    
    it('分析命宫的完整关系网络', () => {
      const relations = getPalaceRelationships(0)
      
      // 收集所有相关宫位
      const relatedPalaces = new Set<number>()
      relatedPalaces.add(relations.opposite.index)
      relations.trinity.forEach(p => relatedPalaces.add(p.index))
      relations.square.forEach(p => relatedPalaces.add(p.index))
      relations.essence.forEach(p => relatedPalaces.add(p.index))
      
      // 命宫应该与多个宫位有关系
      expect(relatedPalaces.size).toBeGreaterThan(5)
      
      // 验证关系的对称性
      relatedPalaces.forEach(palaceIndex => {
        if (palaceIndex !== 0) {
          const otherRelations = getPalaceRelationships(palaceIndex)
          
          // 检查是否在对方的关系网络中也包含命宫
          const otherRelated = [
            otherRelations.opposite.index,
            ...otherRelations.trinity.map(p => p.index),
            ...otherRelations.square.map(p => p.index),
            ...otherRelations.essence.map(p => p.index)
          ]
          
          // 至少有一种关系是双向的
          const hasBidirectionalRelation = otherRelated.includes(0)
          expect(hasBidirectionalRelation).toBe(true)
        }
      })
    })
  })
})