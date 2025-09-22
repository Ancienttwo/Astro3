/**
 * AI Prompt 数据接口使用示例
 * 展示如何使用AI提示词系统为各种分析场景生成结构化数据
 */

import {
  AIPromptUtils,
  generateBaziAIPrompt,
  getDefaultAIPromptGenerator,
  AIPromptData,
  getAIAnalysisSummary
} from './index';
import { AIAnalysisScenario } from './types';
import { ShenShaUtils } from '../shensha/index';
import type { FourPillars, StemName, BranchName } from '../types';
// import { WuxingAnalysisUtils } from '../wuxing-scoring/index'; // 假设存在

/**
 * 示例用的八字图表接口
 * 简化版本，仅包含示例所需的基础字段
 */
interface BaZiChart {
  fourPillars: {
    year: { stem: StemName; branch: BranchName };
    month: { stem: StemName; branch: BranchName };
    day: { stem: StemName; branch: BranchName };
    hour: { stem: StemName; branch: BranchName };
  };
  gender: 'male' | 'female';
  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  timezone: string;
  nayin?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}

/**
 * 基础AI提示词生成示例
 */
export async function basicAIPromptExample() {
  console.log('=== AI提示词生成基础示例 ===\n');

  // 1. 创建测试八字数据
  const testChart: BaZiChart = {
    fourPillars: {
      year: { stem: '甲', branch: '子' },
      month: { stem: '丁', branch: '丑' },
      day: { stem: '壬', branch: '午' },
      hour: { stem: '庚', branch: '戌' }
    },
    gender: 'male',
    solarDate: {
      year: 1984,
      month: 12,
      day: 15,
      hour: 20,
      minute: 30
    },
    timezone: 'GMT+8',
    nayin: {
      year: '海中金',
      month: '涧下水', 
      day: '杨柳木',
      hour: '钗钏金'
    }
  };

  console.log('测试八字:', {
    年柱: `${testChart.fourPillars.year.stem}${testChart.fourPillars.year.branch}`,
    月柱: `${testChart.fourPillars.month.stem}${testChart.fourPillars.month.branch}`,
    日柱: `${testChart.fourPillars.day.stem}${testChart.fourPillars.day.branch}`,
    时柱: `${testChart.fourPillars.hour.stem}${testChart.fourPillars.hour.branch}`
  });

  try {
    // 2. 快速生成基础提示词
    console.log('\n--- 快速生成基础提示词 ---');
    const quickPrompt = await AIPromptUtils.quickGenerate(testChart, {
      language: 'zh-CN',
      detailLevel: 'basic'
    });

    console.log('生成的基础提示词长度:', quickPrompt.length);
    console.log('预估token数:', AIPromptUtils.estimateTokens(quickPrompt));
    console.log('提示词片段:', quickPrompt.substring(0, 200) + '...');

    // 3. 生成特定场景的提示词
    console.log('\n--- 个性分析场景提示词 ---');
    const personalityPrompt = await AIPromptUtils.generateForScenario(
      testChart,
      AIAnalysisScenario.PERSONALITY,
      {
        language: 'zh-CN',
        detailLevel: 'detailed'
      }
    );

    console.log('个性分析提示词长度:', personalityPrompt.length);
    console.log('提示词开头:', personalityPrompt.substring(0, 300) + '...');

    return { quickPrompt, personalityPrompt };

  } catch (error) {
    console.error('基础示例失败:', error);
    throw error;
  }
}

/**
 * 完整分析提示词生成示例
 */
export async function comprehensiveAnalysisExample() {
  console.log('\n=== 完整分析提示词生成示例 ===\n');

  const testChart: BaZiChart = {
    fourPillars: {
      year: { stem: '乙', branch: '亥' },
      month: { stem: '戊', branch: '子' },
      day: { stem: '甲', branch: '申' },
      hour: { stem: '丙', branch: '寅' }
    },
    gender: 'female',
    solarDate: {
      year: 1995,
      month: 1,
      day: 8,
      hour: 14,
      minute: 0
    },
    timezone: 'GMT+8'
  };

  try {
    // 1. 首先进行神煞检测
    console.log('执行神煞检测...');
    const shenshaResult = await ShenShaUtils.fullDetect({
      fourPillars: testChart.fourPillars,
      gender: testChart.gender,
      options: {
        includeMinor: true,
        includeModern: false,
        detailedAnalysis: true,
        resolutionMethods: true
      }
    });

    console.log(`神煞检测完成: 发现${shenshaResult.statistics.total}个神煞`);

    // 2. 生成包含神煞的完整分析
    console.log('\n--- 生成包含神煞的完整分析 ---');
    const completeResponse = await AIPromptUtils.generateComplete(
      testChart,
      shenshaResult,
      undefined, // 五行分析结果
      {
        language: 'zh-CN',
        detailLevel: 'comprehensive',
        format: 'prompt-template'
      }
    );

    console.log('分析状态:', completeResponse.status);
    console.log('处理时间:', `${completeResponse.metadata.processingTime}ms`);
    console.log('数据大小:', `${completeResponse.metadata.dataSize} bytes`);
    console.log('预估tokens:', completeResponse.metadata.tokensEstimate);

    // 3. 输出结构化数据概要
    if (completeResponse.data) {
      const summary = getAIAnalysisSummary(completeResponse.data);
      console.log('\n分析数据概要:');
      console.log('基础信息:', summary.basic);
      console.log('重要特征:', summary.highlights.join('；'));
      console.log('主要建议:', summary.recommendations.join('；'));
    }

    return completeResponse;

  } catch (error) {
    console.error('完整分析示例失败:', error);
    throw error;
  }
}

/**
 * 多场景批量生成示例
 */
export async function batchScenariosExample() {
  console.log('\n=== 多场景批量生成示例 ===\n');

  const testChart: BaZiChart = {
    fourPillars: {
      year: { stem: '丙', branch: '寅' },
      month: { stem: '庚', branch: '寅' },
      day: { stem: '甲', branch: '子' },
      hour: { stem: '甲', branch: '戌' }
    },
    gender: 'male',
    solarDate: {
      year: 1986,
      month: 2,
      day: 14,
      hour: 9,
      minute: 0
    },
    timezone: 'GMT+8'
  };

  const scenarios = [
    AIAnalysisScenario.PERSONALITY,
    AIAnalysisScenario.CAREER_GUIDANCE,
    AIAnalysisScenario.RELATIONSHIP_ADVICE,
    AIAnalysisScenario.WEALTH_ANALYSIS
  ];

  try {
    console.log(`批量生成${scenarios.length}个场景的分析...`);
    const batchResults = await AIPromptUtils.generateBatch(
      testChart,
      scenarios,
      undefined, // 神煞结果
      undefined, // 五行结果
      {
        language: 'zh-CN',
        detailLevel: 'detailed'
      }
    );

    console.log('\n批量生成结果:');
    Object.entries(batchResults).forEach(([scenario, response]) => {
      console.log(`${scenario}:`);
      console.log(`  状态: ${response.status}`);
      console.log(`  Tokens: ${response.metadata.tokensEstimate}`);
      console.log(`  处理时间: ${response.metadata.processingTime}ms`);
      
      if (response.status === 'error' && response.errors) {
        console.log(`  错误: ${response.errors.join(', ')}`);
      } else {
        console.log(`  提示词长度: ${response.prompt.length}字符`);
      }
    });

    return batchResults;

  } catch (error) {
    console.error('批量场景示例失败:', error);
    throw error;
  }
}

/**
 * 兼容性接口使用示例
 */
export async function compatibilityInterfaceExample() {
  console.log('\n=== 兼容性接口使用示例 ===\n');

  const testChart: BaZiChart = {
    fourPillars: {
      year: { stem: '戊', branch: '辰' },
      month: { stem: '甲', branch: '寅' },
      day: { stem: '辛', branch: '酉' },
      hour: { stem: '己', branch: '丑' }
    },
    gender: 'female',
    solarDate: {
      year: 1988,
      month: 3,
      day: 8,
      hour: 15,
      minute: 30
    },
    timezone: 'GMT+8'
  };

  try {
    // 1. 使用简化的兼容性接口
    console.log('使用兼容性接口生成AI分析...');
    const result = await generateBaziAIPrompt(testChart, {
      scenario: 'comprehensive',
      language: 'zh-CN',
      includeDetail: true,
      customQuestions: [
        '我的事业发展前景如何？',
        '什么时候适合结婚？',
        '如何提升财运？'
      ]
    });

    console.log('兼容性接口结果:');
    console.log(`场景: ${result.metadata.scenario}`);
    console.log(`Tokens: ${result.metadata.tokens}`);
    console.log(`处理时间: ${result.metadata.processingTime}ms`);

    // 2. 获取数据摘要
    const summary = getAIAnalysisSummary(result.data);
    console.log('\n数据摘要:');
    console.log(`基础: ${summary.basic}`);
    console.log(`亮点: ${summary.highlights.join('、')}`);
    console.log(`建议: ${summary.recommendations.slice(0, 3).join('；')}`);

    return result;

  } catch (error) {
    console.error('兼容性接口示例失败:', error);
    throw error;
  }
}

/**
 * 自定义模板使用示例
 */
export async function customTemplateExample() {
  console.log('\n=== 自定义模板使用示例 ===\n');

  const testChart: BaZiChart = {
    fourPillars: {
      year: { stem: '癸', branch: '亥' },
      month: { stem: '甲', branch: '子' },
      day: { stem: '丙', branch: '午' },
      hour: { stem: '戊', branch: '戌' }
    },
    gender: 'male',
    solarDate: {
      year: 1983,
      month: 12,
      day: 25,
      hour: 18,
      minute: 0
    },
    timezone: 'GMT+8'
  };

  // 1. 定义自定义模板
  const customTemplate = `
请基于以下八字信息，专门分析投资理财方面的建议：

## 八字信息
{{basicInfo}}

## 财运相关神煞
{{shenshaAnalysis}}

请重点分析：
### 1. 投资理财天赋
- 基于日主{{dayMaster}}的理财特质
- 适合的投资风格和策略

### 2. 财运周期分析  
- 近期财运趋势
- 投资的有利时机

### 3. 具体投资建议
- 推荐的投资类型
- 需要避免的投资风险
- 资产配置建议

### 4. 理财规划
- 短期财务目标设定
- 长期财富积累策略

请以专业理财顾问的角度，提供实用的投资建议。
`;

  try {
    const generator = getDefaultAIPromptGenerator();
    
    // 2. 生成数据
    const promptData = await AIPromptUtils.generateDataOnly(testChart);
    
    // 3. 使用自定义模板
    console.log('使用自定义投资理财模板...');
    const customPrompt = await generator.formatAsPrompt(promptData, {
      name: '投资理财专项分析',
      description: '专注于投资理财建议的自定义模板',
      scenarios: ['investment', 'wealth_planning'],
      template: customTemplate,
      parameters: {}
    });

    console.log('自定义模板生成完成');
    console.log('提示词长度:', customPrompt.length);
    console.log('预估tokens:', AIPromptUtils.estimateTokens(customPrompt));
    console.log('模板片段:', customPrompt.substring(0, 500) + '...');

    return customPrompt;

  } catch (error) {
    console.error('自定义模板示例失败:', error);
    throw error;
  }
}

/**
 * 数据格式转换示例
 */
export async function dataFormatExample() {
  console.log('\n=== 数据格式转换示例 ===\n');

  const testChart: BaZiChart = {
    fourPillars: {
      year: { stem: '丁', branch: '卯' },
      month: { stem: '壬', branch: '寅' },
      day: { stem: '己', branch: '未' },
      hour: { stem: '乙', branch: '亥' }
    },
    gender: 'female',
    solarDate: {
      year: 1987,
      month: 2,
      day: 28,
      hour: 21,
      minute: 15
    },
    timezone: 'GMT+8'
  };

  try {
    // 1. 生成结构化数据
    console.log('生成结构化分析数据...');
    const promptData = await AIPromptUtils.generateDataOnly(testChart, undefined, undefined, {
      language: 'zh-CN',
      includeAnalysis: {
        shensha: false,
        wuxing: false,
        dayun: true,
        shishen: true,
        personality: true,
        career: true,
        health: false,
        relationship: true,
        capabilityAssessment: false
      }
    });

    // 2. 转换为不同格式
    console.log('\n--- JSON格式 ---');
    const jsonData = JSON.stringify(promptData, null, 2);
    console.log('JSON数据大小:', jsonData.length, 'characters');
    console.log('JSON片段:', jsonData.substring(0, 300) + '...');

    // 3. 转换为Markdown格式
    console.log('\n--- Markdown格式 ---');
    const { AIPromptDataFormatter } = await import('./formatters');
    const markdownData = AIPromptDataFormatter.formatAsMarkdown(promptData);
    console.log('Markdown数据大小:', markdownData.length, 'characters');
    console.log('Markdown片段:', markdownData.substring(0, 300) + '...');

    // 4. Token估算
    console.log('\n--- Token估算 ---');
    const jsonTokens = AIPromptUtils.estimateTokens(jsonData);
    const markdownTokens = AIPromptUtils.estimateTokens(markdownData);
    
    console.log(`JSON格式预估tokens: ${jsonTokens}`);
    console.log(`Markdown格式预估tokens: ${markdownTokens}`);
    console.log(`格式效率比: ${(markdownTokens / jsonTokens * 100).toFixed(1)}%`);

    return {
      data: promptData,
      formats: {
        json: jsonData,
        markdown: markdownData
      },
      tokens: {
        json: jsonTokens,
        markdown: markdownTokens
      }
    };

  } catch (error) {
    console.error('数据格式示例失败:', error);
    throw error;
  }
}

/**
 * 性能测试示例
 */
export async function performanceTestExample() {
  console.log('\n=== 性能测试示例 ===\n');

  const testCharts: BaZiChart[] = [
    {
      fourPillars: {
        year: { stem: '甲', branch: '子' },
        month: { stem: '乙', branch: '丑' },
        day: { stem: '丙', branch: '寅' },
        hour: { stem: '丁', branch: '卯' }
      },
      gender: 'male',
      solarDate: { year: 1984, month: 1, day: 1, hour: 12, minute: 0 },
      timezone: 'GMT+8'
    },
    {
      fourPillars: {
        year: { stem: '戊', branch: '辰' },
        month: { stem: '己', branch: '巳' },
        day: { stem: '庚', branch: '午' },
        hour: { stem: '辛', branch: '未' }
      },
      gender: 'female',
      solarDate: { year: 1988, month: 4, day: 15, hour: 16, minute: 30 },
      timezone: 'GMT+8'
    },
    {
      fourPillars: {
        year: { stem: '壬', branch: '申' },
        month: { stem: '癸', branch: '酉' },
        day: { stem: '甲', branch: '戌' },
        hour: { stem: '乙', branch: '亥' }
      },
      gender: 'male',
      solarDate: { year: 1992, month: 8, day: 20, hour: 20, minute: 45 },
      timezone: 'GMT+8'
    }
  ];

  console.log(`性能测试：处理 ${testCharts.length} 个八字图表`);

  // 1. 测试基础生成性能
  console.log('\n--- 基础生成性能测试 ---');
  const basicStart = performance.now();
  const basicResults = [];

  for (let i = 0; i < testCharts.length; i++) {
    const result = await AIPromptUtils.quickGenerate(testCharts[i]);
    basicResults.push(result);
    console.log(`第${i + 1}个图表: 生成${result.length}字符, ${AIPromptUtils.estimateTokens(result)} tokens`);
  }

  const basicTime = performance.now() - basicStart;
  console.log(`基础生成总耗时: ${basicTime.toFixed(2)}ms`);
  console.log(`平均耗时: ${(basicTime / testCharts.length).toFixed(2)}ms per chart`);

  // 2. 测试完整分析性能
  console.log('\n--- 完整分析性能测试 ---');
  const comprehensiveStart = performance.now();
  const comprehensiveResults = [];

  for (let i = 0; i < testCharts.length; i++) {
    const result = await AIPromptUtils.generateComplete(testCharts[i]);
    comprehensiveResults.push(result);
    console.log(`第${i + 1}个图表: 状态${result.status}, ${result.metadata.tokensEstimate} tokens, ${result.metadata.processingTime}ms`);
  }

  const comprehensiveTime = performance.now() - comprehensiveStart;
  console.log(`完整分析总耗时: ${comprehensiveTime.toFixed(2)}ms`);
  console.log(`平均耗时: ${(comprehensiveTime / testCharts.length).toFixed(2)}ms per chart`);

  // 3. 性能总结
  console.log('\n--- 性能总结 ---');
  const totalBasicTokens = basicResults.reduce((sum, result) => sum + AIPromptUtils.estimateTokens(result), 0);
  const totalComprehensiveTokens = comprehensiveResults.reduce((sum, result) => sum + result.metadata.tokensEstimate, 0);

  console.log(`基础生成平均tokens: ${(totalBasicTokens / testCharts.length).toFixed(0)}`);
  console.log(`完整分析平均tokens: ${(totalComprehensiveTokens / testCharts.length).toFixed(0)}`);
  console.log(`复杂度提升比: ${(totalComprehensiveTokens / totalBasicTokens).toFixed(1)}x`);
  console.log(`性能开销比: ${(comprehensiveTime / basicTime).toFixed(1)}x`);

  return {
    basic: { results: basicResults, time: basicTime, tokens: totalBasicTokens },
    comprehensive: { results: comprehensiveResults, time: comprehensiveTime, tokens: totalComprehensiveTokens }
  };
}

/**
 * 运行所有示例
 */
export async function runAllAIPromptExamples() {
  console.log('🤖 开始运行AI提示词系统示例\n');

  try {
    await basicAIPromptExample();
    await comprehensiveAnalysisExample();
    await batchScenariosExample();
    await compatibilityInterfaceExample();
    await customTemplateExample();
    await dataFormatExample();
    await performanceTestExample();

    console.log('\n✅ 所有AI提示词示例运行完成');
  } catch (error) {
    console.error('\n❌ AI提示词示例运行失败:', error);
  }
}

/**
 * 实际项目集成示例
 */
export async function projectIntegrationExample() {
  console.log('\n=== 实际项目集成示例 ===\n');

  // 模拟真实的用户请求场景
  const userChart: BaZiChart = {
    fourPillars: {
      year: { stem: '庚', branch: '申' },
      month: { stem: '戊', branch: '子' },
      day: { stem: '壬', branch: '寅' },
      hour: { stem: '辛', branch: '亥' }
    },
    gender: 'male',
    solarDate: { year: 1980, month: 12, day: 10, hour: 22, minute: 30 },
    timezone: 'GMT+8'
  };

  const userContext = {
    age: 44,
    location: '北京',
    occupation: 'IT工程师',
    concerns: ['事业发展', '健康状况', '子女教育']
  };

  try {
    console.log('模拟真实用户咨询场景...');
    console.log('用户背景:', userContext);

    // 1. 根据用户关注点选择分析场景
    const relevantScenarios = [
      AIAnalysisScenario.CAREER_GUIDANCE,  // 事业发展
      AIAnalysisScenario.HEALTH_ANALYSIS,  // 健康状况
      AIAnalysisScenario.COMPREHENSIVE     // 综合分析（包含子女方面）
    ];

    // 2. 批量生成分析
    const analysisResults = await AIPromptUtils.generateBatch(
      userChart,
      relevantScenarios,
      undefined,
      undefined,
      {
        language: 'zh-CN',
        detailLevel: 'comprehensive'
      }
    );

    // 3. 整理结果供前端使用
    const frontendData = {
      userInfo: {
        chart: userChart,
        context: userContext,
        analysisTime: new Date().toISOString()
      },
      analyses: {} as Record<string, any>
    };

    Object.entries(analysisResults).forEach(([scenario, result]) => {
      if (result.status === 'success') {
        frontendData.analyses[scenario] = {
          prompt: result.prompt,
          summary: getAIAnalysisSummary(result.data),
          metadata: {
            tokens: result.metadata.tokensEstimate,
            processingTime: result.metadata.processingTime
          }
        };
      }
    });

    console.log('\n项目集成结果:');
    console.log(`成功生成 ${Object.keys(frontendData.analyses).length} 个分析场景`);
    
    Object.entries(frontendData.analyses).forEach(([scenario, data]) => {
      console.log(`${scenario}:`);
      console.log(`  摘要: ${data.summary.basic}`);
      console.log(`  特征: ${data.summary.highlights.join('、')}`);
      console.log(`  Tokens: ${data.metadata.tokens}`);
    });

    return frontendData;

  } catch (error) {
    console.error('项目集成示例失败:', error);
    throw error;
  }
}

// 如果直接运行此文件
if (require.main === module) {
  void runAllAIPromptExamples();
}
