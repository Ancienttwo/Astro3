#!/usr/bin/env tsx

/**
 * 紫微斗数排盘数据生成脚本
 * 使用 calculations.ts 中的函数生成完整的紫微斗数数据
 * 输出格式与 ziwei-chart-1988-6-20-23-male.json 一致
 */

import fs from 'fs'
import path from 'path'

// 导入计算模块
import {
  generateCompleteZiWeiChart,
  createBaZiParams,
  calculateYearGanZhi,
  calculateLifePalace,
  calculateBodyPalace,
  calculateMasters,
  calculateDouJun,
  calculateBirthYearSihua,
  BRANCHES,
  STEMS, 
  PALACE_NAMES
} from './src/calculations'

import type { ZiWeiChartInput } from './src/complete-chart-types'

console.log('📦 已导入的函数:', 'generateCompleteZiWeiChart', 'createBaZiParams', 'calculateYearGanZhi')
console.log('📦 已导入的常量:', 'BRANCHES', 'STEMS', 'PALACE_NAMES')

/**
 * 生成紫微斗数完整数据
 * @param {Object} input - 输入参数
 * @param {number} input.year - 公历年
 * @param {number} input.month - 公历月
 * @param {number} input.day - 公历日
 * @param {number} input.hour - 公历时
 * @param {string} input.gender - 性别 'male' | 'female'
 * @param {boolean} input.isLunar - 是否农历 
 */
function generateZiWeiChartData(input: { year: number, month: number, day: number, hour: number, gender: string, isLunar?: boolean }) {
  const { year, month, day, hour, gender, isLunar = false } = input
  
  try {
    // 使用现有的完整计算函数
    const chartInput: ZiWeiChartInput = {
      year,
      month, 
      day,
      hour,
      gender: gender as 'male' | 'female',
      isLunar
    }
    
    console.log('🔄 开始生成紫微斗数排盘数据...')
    console.log('📅 输入参数:', chartInput)
    
    // 调用主计算函数
    const completeChart = generateCompleteZiWeiChart(chartInput)
    
    console.log('✅ 紫微斗数数据生成完成!')
    console.log('📊 生成的数据包含:')
    console.log(`   - 基本信息: ${completeChart.birthInfo ? '✅' : '❌'}`)
    console.log(`   - 八字信息: ${completeChart.bazi ? '✅' : '❌'}`)
    console.log(`   - 宫位信息: ${completeChart.palaces ? Object.keys(completeChart.palaces).length + '个宫位' : '❌'}`)
    console.log(`   - 四化分析: ${completeChart.sihuaAnalysis ? '✅' : '❌'}`)
    
    return completeChart
    
  } catch (error) {
    console.error('❌ 生成紫微斗数数据失败:', error instanceof Error ? error.message : String(error))
    console.error('🔍 错误详情:', error)
    throw error
  }
}

/**
 * 保存数据到JSON文件
 */
function saveToFile(data: any, filename: string): string {
  const outputPath = path.join(process.cwd(), filename)
  
  try {
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8')
    console.log(`💾 数据已保存到: ${outputPath}`)
    return outputPath
  } catch (error) {
    console.error('❌ 保存文件失败:', error instanceof Error ? error.message : String(error))
    throw error
  }
}

/**
 * 验证生成的数据格式
 */
function validateData(data: any) {
  const requiredFields = [
    'birthInfo',
    'bazi', 
    'lifePalace',
    'bodyPalace',
    'fiveElementsBureau',
    'palaces',
    'sihuaAnalysis'
  ]
  
  console.log('🔍 验证数据格式...')
  
  for (const field of requiredFields) {
    if (!data[field]) {
      console.warn(`⚠️  缺少字段: ${field}`)
    } else {
      console.log(`✅ ${field}: 存在`)
    }
  }
  
  // 验证宫位数据
  if (data.palaces) {
    const branchNames = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']
    for (const branch of branchNames) {
      if (!data.palaces[branch]) {
        console.warn(`⚠️  缺少宫位: ${branch}`)
      }
    }
    console.log(`✅ 宫位数据: ${Object.keys(data.palaces).length}/12`)
  }
}

// 主执行函数
function main() {
  console.log('🌟 紫微斗数排盘数据生成器')
  console.log('='.repeat(40))
  
  // 测试数据 - 与示例文件相同
  const testInput = {
    year: 1988,
    month: 6, 
    day: 20,
    hour: 23,
    gender: 'male',
    isLunar: false
  }
  
  try {
    // 生成数据
    const chartData = generateZiWeiChartData(testInput)
    
    // 验证数据
    validateData(chartData)
    
    // 保存到文件
    const filename = `ziwei-chart-generated-${testInput.year}-${testInput.month}-${testInput.day}-${testInput.hour}-${testInput.gender}.json`
    saveToFile(chartData, filename)
    
    console.log('\n🎉 处理完成!')
    console.log('📋 处理摘要:')
    console.log(`   - 生日: ${testInput.year}年${testInput.month}月${testInput.day}日${testInput.hour}时`)
    console.log(`   - 性别: ${testInput.gender}`)
    console.log(`   - 命宫: ${chartData.lifePalace || '未计算'}`)
    console.log(`   - 身宫: ${chartData.bodyPalace || '未计算'}`)
    console.log(`   - 五行局: ${chartData.fiveElementsBureau?.name || '未计算'}`)
    
  } catch (error) {
    console.error('\n💥 处理失败!')
    console.error('错误信息:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

// 如果是直接运行此脚本 
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

// 导出函数供其他模块使用
export {
  generateZiWeiChartData,
  saveToFile,
  validateData
}