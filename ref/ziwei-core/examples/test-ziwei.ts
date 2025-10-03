/**
 * 紫微斗数完整测试案例
 * Complete ZiWei DouShu Test Case using astro-mobile calculations
 * 
 * 测试数据: 1989年1月2日19:30 女性 (公历)
 * Test Data: January 2, 1989, 19:30 Female (Solar Calendar)
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  generateCompleteZiWeiChart,
  type ZiWeiChartInput,
  type ZiWeiCompleteChart
} from '../src/calculations';

/**
 * 主测试函数
 * Main test function
 */
async function runZiWeiTest() {
  console.log('🌟 紫微斗数完整测试开始');
  console.log('=' .repeat(60));
  
  // 测试输入数据: 1989年1月2日19:30 女性 (公历)
  const testInput: ZiWeiChartInput = {
    year: 1989,
    month: 1,
    day: 2,
    hour: 19,      // 19:30 = 19时30分 (戌时)
    gender: 'female',
    isLunar: false,     // 公历
    isLeapMonth: false,
    timezone: 'Asia/Shanghai'
  };

  console.log('📋 测试输入数据:');
  console.log('-'.repeat(40));
  console.log('公历时间:', `${testInput.year}年${testInput.month}月${testInput.day}日 ${testInput.hour}:30`);
  console.log('性别:', testInput.gender);
  console.log('历法:', testInput.isLunar ? '农历' : '公历');
  console.log('时区:', testInput.timezone);
  console.log('');

  try {
    // 生成完整紫微斗数命盘
    console.log('⚙️ 开始计算紫微斗数命盘...');
    const chart: ZiWeiCompleteChart = generateCompleteZiWeiChart(testInput);
    
    console.log('✅ 命盘计算完成!');
    console.log('');

    // 显示基础信息
    displayBasicInfo(chart);
    
    // 显示八字信息
    displayBaziInfo(chart);
    
    // 显示核心宫位信息
    displayCoreInfo(chart);
    
    // 显示12宫概览
    displayPalacesOverview(chart);
    
    // 显示星曜统计
    displayStarStatistics(chart);

    // 显示四化统计
    displaySihuaStatistics(chart);

    // 保存JSON文件
    await saveResults(chart, testInput);
    
    console.log('🎉 测试完成！');
    console.log('=' .repeat(60));
    
    return chart;
    
  } catch (error) {
    console.error('❌ 计算错误:', error);
    throw error;
  }
}

/**
 * 显示基础信息
 */
function displayBasicInfo(chart: ZiWeiCompleteChart) {
  console.log('📋 基础出生信息');
  console.log('-'.repeat(40));
  console.log('公历:', `${chart.birthInfo.solar.year}年${chart.birthInfo.solar.month}月${chart.birthInfo.solar.day}日 ${chart.birthInfo.solar.hour}时`);
  console.log('农历:', `${chart.birthInfo.lunar.yearGanzhi}年 ${chart.birthInfo.lunar.monthLunar}月${chart.birthInfo.lunar.dayLunar}日 ${chart.birthInfo.lunar.hourBranch}时`);
  console.log('性别:', chart.birthInfo.solar.gender);
  console.log('');
}

/**
 * 显示八字信息
 */
function displayBaziInfo(chart: ZiWeiCompleteChart) {
  console.log('🎋 八字信息');
  console.log('-'.repeat(40));
  console.log('八字:', chart.bazi);
  console.log('起运:', chart.baziQiyun);
  console.log('大运:', chart.baziDayun);
  console.log('');
}

/**
 * 显示核心信息
 */
function displayCoreInfo(chart: ZiWeiCompleteChart) {
  console.log('🏛️ 核心信息');
  console.log('-'.repeat(40));
  console.log('命宫:', chart.lifePalace);
  console.log('身宫:', chart.bodyPalace);
  console.log('来因宫:', chart.laiyinPalace);
  console.log('命主:', chart.lifeMaster);
  console.log('身主:', chart.bodyMaster);
  console.log('五行局:', chart.fiveElementsBureau);
  console.log('斗君:', chart.douJun);
  console.log('');
}

/**
 * 显示12宫概览
 */
function displayPalacesOverview(chart: ZiWeiCompleteChart) {
  console.log('🎯 十二宫概览');
  console.log('=' .repeat(60));
  
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  branches.forEach((branch) => {
    const palace = chart.palaces[branch];
    if (!palace) {
      console.log(`\n❌ ${branch}宫数据缺失`);
      return;
    }
    
    console.log(`\n【${branch}宫】${palace.name} (${palace.ganzhi})`);
    console.log('-'.repeat(40));
    
    // 显示主星
    if (palace.mainStars && palace.mainStars.length > 0) {
      console.log('主星:', palace.mainStars.map(formatStarDisplay).join(' '));
    }
    
    // 显示辅星
    if (palace.auxiliaryStars && palace.auxiliaryStars.length > 0) {
      console.log('辅星:', palace.auxiliaryStars.map(formatStarDisplay).join(' '));
    }
    
    // 显示小星
    if (palace.minorStars && palace.minorStars.length > 0) {
      console.log('小星:', palace.minorStars.map(formatStarDisplay).join(' '));
    }
    
    // 显示大运和流年（如果有）
    if (palace.majorPeriod) {
      console.log('大运:', `${palace.majorPeriod.ganzhi} (${palace.majorPeriod.startAge}-${palace.majorPeriod.endAge}岁)`);
    }
    
    if (palace.fleetingYears && palace.fleetingYears.length > 0) {
      console.log('流年:', palace.fleetingYears.slice(0, 5).join(', ') + (palace.fleetingYears.length > 5 ? '...' : ''));
    }
  });
}

/**
 * 格式化星曜显示
 */
function formatStarDisplay(star: any): string {
  if (!star.name) return '';
  
  let result = `${star.name}`;
  
  // 添加亮度信息
  if (star.bright) {
    result += `(${star.bright})`;
  }
  
  // 添加生年四化
  if (star.sihua) {
    const sihuaMap: Record<string, string> = {
      'iA': '禄', 'iB': '权', 'iC': '科', 'iD': '忌'
    };
    result += `[${sihuaMap[star.sihua] || star.sihua}]`;
  }
  
  // 添加自化
  if (star.self_sihua) {
    const selfSihuaMap: Record<string, string> = {
      'xA': '自禄', 'xB': '自权', 'xC': '自科', 'xD': '自忌'
    };
    result += `[${selfSihuaMap[star.self_sihua] || star.self_sihua}]`;
  }
  
  return result;
}

/**
 * 显示星曜统计
 */
function displayStarStatistics(chart: ZiWeiCompleteChart) {
  console.log('\n📊 星曜统计');
  console.log('-'.repeat(40));
  
  let totalMainStars = 0;
  let totalAuxiliaryStars = 0;
  let totalMinorStars = 0;
  
  Object.values(chart.palaces).forEach(palace => {
    if (palace) {
      totalMainStars += palace.mainStars?.length || 0;
      totalAuxiliaryStars += palace.auxiliaryStars?.length || 0;
      totalMinorStars += palace.minorStars?.length || 0;
    }
  });
  
  console.log('主星总数:', totalMainStars);
  console.log('辅星总数:', totalAuxiliaryStars);
  console.log('小星总数:', totalMinorStars);
  console.log('宫位总数:', Object.keys(chart.palaces).length);
  console.log('');
}

/**
 * 显示四化统计
 */
function displaySihuaStatistics(chart: ZiWeiCompleteChart) {
  console.log('🔄 四化统计');
  console.log('-'.repeat(40));
  
  let birthYearSihua = 0;
  let selfSihua = 0;
  
  Object.values(chart.palaces).forEach(palace => {
    if (palace) {
      const allStars = [
        ...(palace.mainStars || []),
        ...(palace.auxiliaryStars || []),
        ...(palace.minorStars || [])
      ];
      
      allStars.forEach(star => {
        if (star.sihua) birthYearSihua++;
        if (star.self_sihua) selfSihua++;
      });
    }
  });
  
  console.log('生年四化数量:', birthYearSihua);
  console.log('自化数量:', selfSihua);
  console.log('四化总数:', birthYearSihua + selfSihua);
  console.log('');
}

/**
 * 保存结果到JSON文件
 */
async function saveResults(chart: ZiWeiCompleteChart, input: ZiWeiChartInput) {
  console.log('💾 保存结果...');
  
  try {
    // 确保输出目录存在
    const outputDir = join(process.cwd(), 'output');
    mkdirSync(outputDir, { recursive: true });
    
    // 生成文件名
    const fileName = `ziwei-${input.year}-${input.month.toString().padStart(2, '0')}-${input.day.toString().padStart(2, '0')}-${input.hour}30-${input.gender}.json`;
    const filePath = join(outputDir, fileName);
    
    // 添加测试信息到输出
    const output = {
      testInfo: {
        description: '紫微斗数完整测试案例 - Complete ZiWei Test Case',
        inputData: input,
        generatedAt: new Date().toISOString(),
        version: '1.0.0'
      },
      chart
    };
    
    // 保存为格式化的JSON
    writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`✅ 结果已保存到: ${filePath}`);
    console.log(`📄 文件大小: ${(JSON.stringify(output).length / 1024).toFixed(1)} KB`);
    console.log('');
    
  } catch (error) {
    console.error('❌ 保存失败:', error);
    throw error;
  }
}

/**
 * 主入口函数
 * Main entry point
 */
async function main() {
  try {
    const startTime = Date.now();
    
    console.log('🚀 启动紫微斗数测试系统');
    console.log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('');
    
    // 执行测试
    const result = await runZiWeiTest();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ 计算耗时: ${duration}ms`);
    console.log('🎯 测试状态: 成功');
    
    return result;
    
  } catch (error) {
    console.error('💥 测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  main().then(() => {
    console.log('✨ 程序正常结束');
    process.exit(0);
  }).catch(error => {
    console.error('🚨 程序异常结束:', error);
    process.exit(1);
  });
}

// 导出供其他模块使用
export { main as runZiWeiTestExample };
export type { ZiWeiChartInput, ZiWeiCompleteChart };