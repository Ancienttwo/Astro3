/**
 * 星盘渲染API使用示例
 * Chart Render API Usage Examples
 * 
 * @ai-context CHART_RENDER_EXAMPLES
 * @preload 渲染API, Hook格式数据, React组件
 * @algorithm-dependency ziwei-chart-render-examples
 */

import {
  // Hook格式API
  generateZiWeiHookChart,
  HookCalculationInput,
  
  // 渲染API
  ChartAPI,
  renderPalaceForWeb,
  renderPalaceForNative,
  generateIntegratedChart,
  generateQuickRender,
  DEFAULT_RENDER_PRESETS,
  
  // 类型定义
  WebRenderData,
  NativeRenderData,
  RenderOptions
} from '../index';

// =============================================================================
// 示例1: 最简单的使用方式 - 一键生成所有数据
// =============================================================================

export async function example1_SimpleUsage() {
  console.log('=== 示例1: 一键生成完整星盘数据 ===');
  
  const birthData: HookCalculationInput = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 14,
    gender: "male",
    isLunar: false
  };

  try {
    // 🚀 一键生成Hook格式 + 双平台渲染数据
    const result = await ChartAPI.generate(birthData);
    
    console.log('✅ 生成完成!');
    console.log(`📊 Hook数据版本: ${result.version}`);
    console.log(`⏱️ 总耗时: ${result.performance.totalTime.toFixed(2)}ms`);
    console.log(`🎯 命宫: ${result.hookChart.命宫}`);
    console.log(`🌟 五行局: ${result.hookChart.五行局.name}`);
    
    // Web渲染数据已准备就绪
    console.log(`🌐 Web宫位数: ${result.webRenderData.palaces.length}`);
    console.log(`📱 Native宫位数: ${result.nativeRenderData.palaces.length}`);
    
    return result;
  } catch (error) {
    console.error('生成失败:', error);
  }
}

// =============================================================================
// 示例2: 分步骤使用 - 先生成Hook，再生成渲染数据
// =============================================================================

export async function example2_StepByStep() {
  console.log('=== 示例2: 分步骤生成 ===');
  
  const birthData: HookCalculationInput = {
    year: 1985,
    month: 8,
    day: 15,
    hour: 20,
    gender: "female",
    isLunar: true, // 农历输入
    isLeapMonth: false
  };

  // Step 1: 生成Hook格式数据
  const hookChart = await generateZiWeiHookChart(birthData);
  console.log('✅ Hook格式数据生成完成');
  
  // Step 2: 为Web平台生成渲染数据
  const webOptions: RenderOptions = {
    platform: 'web',
    theme: 'light',
    showSihuaLines: true,
    showMajorPeriods: true,
    fontSize: 'medium'
  };
  
  const webData = renderPalaceForWeb({ hookChart, options: webOptions });
  console.log(`🌐 Web渲染数据: ${webData.palaces.length}个宫位`);
  
  // Step 3: 为Native平台生成渲染数据
  const nativeOptions: RenderOptions = {
    platform: 'native',
    theme: 'dark',
    showSihuaLines: false, // Native版本不显示连线
    showMajorPeriods: false,
    compact: true,
    fontSize: 'small'
  };
  
  const nativeData = renderPalaceForNative({ hookChart, options: nativeOptions });
  console.log(`📱 Native渲染数据: ${nativeData.palaces.length}个宫位`);
  
  return { hookChart, webData, nativeData };
}

// =============================================================================
// 示例3: 使用预设配置快速生成
// =============================================================================

export async function example3_UsingPresets() {
  console.log('=== 示例3: 使用预设配置 ===');
  
  const birthData: HookCalculationInput = {
    year: 1995,
    month: 12,
    day: 25,
    hour: 9,
    gender: "male",
    isLunar: false
  };

  // 使用Web预设
  const webChart = await ChartAPI.web(birthData, DEFAULT_RENDER_PRESETS.web);
  console.log('✅ Web版本生成完成');
  
  // 使用Native预设
  const nativeChart = await ChartAPI.native(birthData, DEFAULT_RENDER_PRESETS.native);
  console.log('✅ Native版本生成完成');
  
  // 使用紧凑预设
  const compactChart = await ChartAPI.native(birthData, DEFAULT_RENDER_PRESETS.compact);
  console.log('✅ 紧凑版本生成完成');
  
  return { webChart, nativeChart, compactChart };
}

// =============================================================================
// 示例4: 主题切换和动态更新
// =============================================================================

export async function example4_ThemeAndUpdates() {
  console.log('=== 示例4: 主题切换和动态更新 ===');
  
  const birthData: HookCalculationInput = {
    year: 2000,
    month: 6,
    day: 10,
    hour: 16,
    gender: "female",
    isLunar: false
  };

  // 生成基础数据
  const hookChart = await generateZiWeiHookChart(birthData);
  console.log('✅ 基础数据生成完成');
  
  // 生成所有主题版本
  const allThemes = ChartAPI.themes(hookChart);
  console.log(`🎨 生成了 ${Object.keys(allThemes).length} 种主题`);
  
  // 动态切换选项示例
  const baseOptions: RenderOptions = {
    platform: 'web',
    theme: 'light',
    showSihuaLines: true
  };
  
  // 切换到暗色主题
  const darkTheme = generateQuickRender(hookChart, 'web', {
    ...baseOptions,
    theme: 'dark'
  });
  console.log('🌙 暗色主题生成完成');
  
  // 切换到传统主题
  const traditionalTheme = generateQuickRender(hookChart, 'web', {
    ...baseOptions,
    theme: 'traditional'
  });
  console.log('🏛️ 传统主题生成完成');
  
  return { allThemes, darkTheme, traditionalTheme };
}

// =============================================================================
// 示例5: 批量处理家庭成员命盘
// =============================================================================

export async function example5_FamilyCharts() {
  console.log('=== 示例5: 家庭成员批量处理 ===');
  
  const familyData: HookCalculationInput[] = [
    // 父亲
    { year: 1965, month: 3, day: 20, hour: 8, gender: "male", isLunar: false },
    // 母亲
    { year: 1968, month: 9, day: 15, hour: 18, gender: "female", isLunar: false },
    // 儿子
    { year: 1995, month: 7, day: 5, hour: 12, gender: "male", isLunar: false },
    // 女儿
    { year: 1998, month: 2, day: 28, hour: 22, gender: "female", isLunar: false }
  ];

  const sharedOptions: Partial<RenderOptions> = {
    theme: 'light',
    showSihuaLines: true,
    showMajorPeriods: true,
    fontSize: 'medium'
  };

  // 批量生成
  const familyCharts = await ChartAPI.batch(familyData, sharedOptions);
  
  console.log(`👨‍👩‍👧‍👦 生成了 ${familyCharts.length} 个家庭成员命盘`);
  
  familyCharts.forEach((chart, index) => {
    const member = ['父亲', '母亲', '儿子', '女儿'][index];
    console.log(`  ${member}: 命宫${chart.hookChart.命宫}, ${chart.hookChart.五行局.name}`);
    console.log(`    生成耗时: ${chart.performance.totalTime.toFixed(2)}ms`);
  });
  
  return familyCharts;
}

// =============================================================================
// 示例6: 错误处理和缓存管理
// =============================================================================

export async function example6_ErrorHandlingAndCache() {
  console.log('=== 示例6: 错误处理和缓存管理 ===');
  
  try {
    // 无效输入测试
    const invalidData: HookCalculationInput = {
      year: 1800, // 无效年份
      month: 13,  // 无效月份
      day: 32,    // 无效日期
      hour: 25,   // 无效小时
      gender: "unknown" as any, // 无效性别
      isLunar: false
    };
    
    console.log('🧪 测试无效输入...');
    await generateZiWeiHookChart(invalidData);
  } catch (error) {
    console.log('✅ 正确捕获了输入验证错误:', (error as Error).message);
  }
  
  // 缓存统计
  const cacheStats = await import('../api/chart-render-api').then(m => m.getRenderCacheStats());
  console.log('📊 渲染缓存统计:', cacheStats);
  
  // 清除缓存
  const { clearRenderCache } = await import('../api/chart-render-api');
  clearRenderCache();
  console.log('🗑️ 缓存已清除');
}

// =============================================================================
// 示例7: React组件中的使用 (伪代码)
// =============================================================================

export function example7_ReactUsage() {
  console.log('=== 示例7: React组件使用示例 ===');
  
  const reactComponentExample = `
// React组件中的使用示例
import React, { useEffect, useState } from 'react';
import { ChartAPI, WebRenderData, HookCalculationInput } from '@astroall/ziwei-core';

interface ZiweiChartProps {
  birthData: HookCalculationInput;
  theme?: 'light' | 'dark' | 'traditional';
}

export const ZiweiChart: React.FC<ZiweiChartProps> = ({ birthData, theme = 'light' }) => {
  const [renderData, setRenderData] = useState<WebRenderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateChart = async () => {
      try {
        setLoading(true);
        const result = await ChartAPI.web(birthData, { 
          theme,
          showSihuaLines: true,
          showMajorPeriods: true
        });
        setRenderData(result.renderData);
      } catch (error) {
        console.error('生成星盘失败:', error);
      } finally {
        setLoading(false);
      }
    };

    generateChart();
  }, [birthData, theme]);

  if (loading) return <div>正在生成星盘...</div>;
  if (!renderData) return <div>生成失败</div>;

  return (
    <div className="ziwei-chart">
      <div className="center-info">
        <h3>{renderData.centerInfo.gender} 命</h3>
        <p>{renderData.centerInfo.yearGanZhi} 年生</p>
        <p>{renderData.centerInfo.bureau.name}</p>
      </div>
      
      <div className="palaces-grid">
        {renderData.palaces.map((palace, index) => (
          <div key={palace.branch} className={renderData.cssClasses.palace}>
            <h4>{palace.palaceName}</h4>
            <p>{palace.branch} ({palace.stem})</p>
            <div className="stars">
              {palace.stars.map((star, starIndex) => (
                <span 
                  key={starIndex}
                  className={renderData.cssClasses.star[star.types[0]] || ''}
                  style={{ color: getStarColor(star.color) }}
                >
                  {star.name}
                  {star.sihua && <sup>{star.sihua}</sup>}
                  {star.brightness && <sub>{star.brightness}</sub>}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {renderData.sihuaLines.length > 0 && (
        <svg className="sihua-lines">
          {renderData.sihuaLines.map((line, index) => (
            <line
              key={index}
              x1={getLineX(line.from)}
              y1={getLineY(line.from)}
              x2={getLineX(line.to)}
              y2={getLineY(line.to)}
              stroke={line.color}
              strokeDasharray={line.style === 'dashed' ? '5,5' : ''}
            />
          ))}
        </svg>
      )}
    </div>
  );
};

function getStarColor(color: string): string {
  const colors = {
    primary: '#1a73e8',
    secondary: '#34a853',
    warning: '#fbbc04',
    danger: '#ea4335',
    success: '#34a853'
  };
  return colors[color] || '#666';
}

function getLineX(palaceIndex: number): number {
  // 计算宫位连线的X坐标
  return 0; // 简化实现
}

function getLineY(palaceIndex: number): number {
  // 计算宫位连线的Y坐标
  return 0; // 简化实现
}
`;

  console.log('📝 React组件使用示例:');
  console.log(reactComponentExample);
}

// =============================================================================
// 运行所有示例
// =============================================================================

export async function runAllChartRenderExamples() {
  console.log('🎯 开始运行星盘渲染API使用示例\n');
  
  try {
    await example1_SimpleUsage();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await example2_StepByStep();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await example3_UsingPresets();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await example4_ThemeAndUpdates();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await example5_FamilyCharts();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await example6_ErrorHandlingAndCache();
    console.log('\n' + '='.repeat(60) + '\n');
    
    example7_ReactUsage();
    
    console.log('\n✅ 所有示例运行完成!');
    
  } catch (error) {
    console.error('❌ 示例运行失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  void runAllChartRenderExamples();
}

// =============================================================================
// 导出所有示例函数
// =============================================================================

export const ChartRenderExamples = {
  simple: example1_SimpleUsage,
  stepByStep: example2_StepByStep,
  presets: example3_UsingPresets,
  themes: example4_ThemeAndUpdates,
  family: example5_FamilyCharts,
  errorHandling: example6_ErrorHandlingAndCache,
  react: example7_ReactUsage,
  runAll: runAllChartRenderExamples
};
