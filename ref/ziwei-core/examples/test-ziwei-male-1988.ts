/**
 * 紫微斗数测试案例 - 1988年6月20日 23:30 男性
 * ZiWei DouShu Test Case - June 20, 1988, 23:30 Male
 * 
 * 测试数据: 1988年6月20日23:30 男性 (公历)
 * Test Data: June 20, 1988, 23:30 Male (Solar Calendar)
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
async function runZiWeiTest1988Male() {
  console.log('🌟 紫微斗数计算开始 - 1988年男命');
  console.log('=' .repeat(60));
  
  // 测试输入数据: 1988年6月20日23:30 男性 (公历)
  const testInput: ZiWeiChartInput = {
    year: 1988,
    month: 6,
    day: 20,
    hour: 23,      // 23:30 = 23时30分 (子时)
    gender: 'male',
    isLunar: false,     // 公历
    isLeapMonth: false,
    timezone: 'Asia/Shanghai'
  };

  console.log('📋 输入数据:');
  console.log('-'.repeat(40));
  console.log('公历时间:', `${testInput.year}年${testInput.month}月${testInput.day}日 ${testInput.hour}:30`);
  console.log('性别:', testInput.gender === 'male' ? '男' : '女');
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
    
    // 显示12宫主要星曜
    displayMainStarsInPalaces(chart);
    
    // 显示四化信息
    displaySihuaInfo(chart);
    
    // 显示统计信息
    displayStatistics(chart);

    // 保存JSON文件
    await saveResults(chart, testInput);
    
    console.log('🎉 计算完成！');
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
  console.log('📋 出生信息');
  console.log('-'.repeat(40));
  console.log('公历:', `${chart.birthInfo.solar.year}年${chart.birthInfo.solar.month}月${chart.birthInfo.solar.day}日 ${chart.birthInfo.solar.hour}时`);
  console.log('农历:', `${chart.birthInfo.lunar.yearGanzhi}年 ${chart.birthInfo.lunar.monthLunar}月${chart.birthInfo.lunar.dayLunar}日 ${chart.birthInfo.lunar.hourBranch}时`);
  console.log('性别:', chart.birthInfo.solar.gender === 'male' ? '男' : '女');
  console.log('年干支:', chart.birthInfo.lunar.yearGanzhi);
  console.log('');
}

/**
 * 显示八字信息
 */
function displayBaziInfo(chart: ZiWeiCompleteChart) {
  console.log('🎋 八字四柱');
  console.log('-'.repeat(40));
  console.log('八字:', chart.bazi);
  console.log('起运:', chart.baziQiyun);
  console.log('大运前三运:', chart.baziDayun.split(',').slice(0, 3).join(','));
  console.log('');
}

/**
 * 显示核心信息
 */
function displayCoreInfo(chart: ZiWeiCompleteChart) {
  console.log('🏛️ 命盘核心');
  console.log('-'.repeat(40));
  console.log('命宫:', chart.lifePalace);
  console.log('身宫:', chart.bodyPalace);
  console.log('来因宫:', chart.laiyinPalace);
  console.log('命主:', chart.lifeMaster);
  console.log('身主:', chart.bodyMaster);
  console.log('五行局:', typeof chart.fiveElementsBureau === 'object' 
    ? `${chart.fiveElementsBureau.name}` 
    : chart.fiveElementsBureau);
  console.log('斗君:', chart.doujun || chart.douJun);
  console.log('');
}

/**
 * 显示12宫主要星曜
 */
function displayMainStarsInPalaces(chart: ZiWeiCompleteChart) {
  console.log('🌟 十二宫主星分布');
  console.log('=' .repeat(60));
  
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  
  branches.forEach((branch) => {
    const palace = chart.palaces[branch];
    if (!palace) return;
    
    const palaceName = palace.name || '未知';
    const mainStars = palace.mainStars || [];
    
    if (mainStars.length > 0) {
      const starNames = mainStars.map(star => {
        let name = star.name;
        if (star.bright) name += `(${star.bright})`;
        if (star.sihua) {
          const sihuaMap: Record<string, string> = {
            'A': '禄', 'B': '权', 'C': '科', 'D': '忌'
          };
          name += `[${sihuaMap[star.sihua] || star.sihua}]`;
        }
        return name;
      }).join(' ');
      
      console.log(`${branch}宫【${palaceName}】: ${starNames}`);
    } else {
      console.log(`${branch}宫【${palaceName}】: 无主星`);
    }
  });
  console.log('');
}

/**
 * 显示四化信息
 */
function displaySihuaInfo(chart: ZiWeiCompleteChart) {
  console.log('🔄 四化信息');
  console.log('-'.repeat(40));
  
  // 查找生年四化
  const birthYearSihua: Record<string, string> = {
    'A': '', 'B': '', 'C': '', 'D': ''
  };
  
  Object.values(chart.palaces).forEach(palace => {
    if (palace) {
      const allStars = [
        ...(palace.mainStars || []),
        ...(palace.auxiliaryStars || []),
        ...(palace.minorStars || [])
      ];
      
      allStars.forEach(star => {
        if (star.sihua && birthYearSihua[star.sihua] === '') {
          birthYearSihua[star.sihua] = star.name;
        }
      });
    }
  });
  
  console.log('生年四化:');
  console.log(`  化禄: ${birthYearSihua['A'] || '无'}`);
  console.log(`  化权: ${birthYearSihua['B'] || '无'}`);
  console.log(`  化科: ${birthYearSihua['C'] || '无'}`);
  console.log(`  化忌: ${birthYearSihua['D'] || '无'}`);
  
  // 统计自化数量
  let selfTransformCount = 0;
  Object.values(chart.palaces).forEach(palace => {
    if (palace) {
      const allStars = [
        ...(palace.mainStars || []),
        ...(palace.auxiliaryStars || []),
        ...(palace.minorStars || [])
      ];
      
      allStars.forEach(star => {
        if (star.self_sihua) {
          selfTransformCount++;
        }
      });
    }
  });
  
  console.log(`自化数量: ${selfTransformCount}`);
  console.log('');
}

/**
 * 显示统计信息
 */
function displayStatistics(chart: ZiWeiCompleteChart) {
  console.log('📊 统计信息');
  console.log('-'.repeat(40));
  
  let totalMainStars = 0;
  let totalAuxiliaryStars = 0;
  let totalMinorStars = 0;
  let totalSihua = 0;
  
  Object.values(chart.palaces).forEach(palace => {
    if (palace) {
      totalMainStars += palace.mainStars?.length || 0;
      totalAuxiliaryStars += palace.auxiliaryStars?.length || 0;
      totalMinorStars += palace.minorStars?.length || 0;
      
      // 统计四化
      const allStars = [
        ...(palace.mainStars || []),
        ...(palace.auxiliaryStars || []),
        ...(palace.minorStars || [])
      ];
      
      allStars.forEach(star => {
        if (star.sihua) totalSihua++;
        if (star.self_sihua) totalSihua++;
      });
    }
  });
  
  console.log('主星总数:', totalMainStars);
  console.log('辅星总数:', totalAuxiliaryStars);
  console.log('小星总数:', totalMinorStars);
  console.log('四化总数:', totalSihua);
  console.log('宫位总数:', Object.keys(chart.palaces).length);
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
    
    // 构建输出对象
    const output = {
      metadata: {
        description: '紫微斗数命盘 - ZiWei DouShu Chart',
        inputData: {
          solarDate: `${input.year}-${input.month.toString().padStart(2, '0')}-${input.day.toString().padStart(2, '0')}`,
          solarTime: `${input.hour}:30`,
          gender: input.gender,
          calendar: input.isLunar ? 'lunar' : 'solar',
          timezone: input.timezone
        },
        generatedAt: new Date().toISOString(),
        version: '2.0.0'
      },
      chart
    };
    
    // 保存为格式化的JSON
    writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf8');
    
    console.log(`✅ JSON已保存到: ${filePath}`);
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
    
    console.log('🚀 启动紫微斗数计算系统');
    console.log(`⏰ 开始时间: ${new Date().toLocaleString('zh-CN')}`);
    console.log('');
    
    // 执行测试
    const result = await runZiWeiTest1988Male();
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`⏱️ 计算耗时: ${duration}ms`);
    console.log('🎯 状态: 成功');
    
    return result;
    
  } catch (error) {
    console.error('💥 计算失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  main().then(() => {
    console.log('✨ 程序结束');
    process.exit(0);
  }).catch(error => {
    console.error('🚨 程序异常:', error);
    process.exit(1);
  });
}

// 导出供其他模块使用
export { main as runZiWeiTest1988Male };
export type { ZiWeiChartInput, ZiWeiCompleteChart };