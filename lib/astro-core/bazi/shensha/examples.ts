/**
 * 神煞检测层架构 - 使用示例
 * 展示分离检测与分析的模块化神煞系统用法
 */

import {
  checkBaziShenSha,
  getNoblemanSummary,
  NoblemanDetector,
  ShenShaAnalyzer,
  ShenShaInput,
  ShenShaRegistry,
  ShenShaUtils,
} from './index';

/**
 * 基础使用示例
 */
export async function basicUsageExample() {
  console.log('=== 神煞系统基础使用示例 ===\n');

  // 1. 创建测试数据
  const testInput: ShenShaInput = {
    fourPillars: {
      year: { stem: '甲', branch: '子' },
      month: { stem: '丁', branch: '丑' },
      day: { stem: '壬', branch: '午' },
      hour: { stem: '庚', branch: '戌' },
    },
    gender: 'male',
    nayin: {
      year: '海中金',
      month: '涧下水',
      day: '杨柳木',
      hour: '钗钏金',
    },
    options: {
      includeMinor: true,
      includeModern: false,
      detailedAnalysis: true,
      resolutionMethods: true,
    },
  };

  console.log('输入四柱:', {
    年柱: `${testInput.fourPillars.year.stem}${testInput.fourPillars.year.branch}`,
    月柱: `${testInput.fourPillars.month.stem}${testInput.fourPillars.month.branch}`,
    日柱: `${testInput.fourPillars.day.stem}${testInput.fourPillars.day.branch}`,
    时柱: `${testInput.fourPillars.hour.stem}${testInput.fourPillars.hour.branch}`,
  });

  try {
    // 2. 快速检测
    console.log('\n--- 快速检测 ---');
    const quickResult = await ShenShaUtils.quickDetect(testInput);
    console.log('检测到神煞数量:', quickResult.statistics.total);
    console.log('吉神数量:', quickResult.statistics.auspicious);
    console.log('凶神数量:', quickResult.statistics.inauspicious);

    if (quickResult.detectedShenSha.length > 0) {
      console.log('检测到的神煞:');
      quickResult.detectedShenSha.forEach((result) => {
        console.log(`  - ${result.info.name} (${result.info.category})`);
      });
    }

    // 3. 完整检测
    console.log('\n--- 完整检测 ---');
    const fullResult = await ShenShaUtils.fullDetect(testInput);
    console.log('综合分析:', fullResult.overallAnalysis.summary);

    if (fullResult.overallAnalysis.keyFindings.length > 0) {
      console.log('关键发现:');
      fullResult.overallAnalysis.keyFindings.forEach((finding) => {
        console.log(`  - ${finding}`);
      });
    }

    if (fullResult.overallAnalysis.recommendations.length > 0) {
      console.log('建议:');
      fullResult.overallAnalysis.recommendations.forEach((recommendation) => {
        console.log(`  - ${recommendation}`);
      });
    }

    // 4. 贵人专项检测
    console.log('\n--- 贵人专项检测 ---');
    const noblemanResult = await ShenShaUtils.detectNoblemanOnly(testInput);
    const noblemanSummary = getNoblemanSummary(noblemanResult);
    console.log('贵人摘要:', noblemanSummary.description);
    if (noblemanSummary.list.length > 0) {
      console.log('贵人列表:', noblemanSummary.list.join('、'));
    }

    return fullResult;
  } catch (error) {
    console.error('神煞检测失败:', error);
    throw error;
  }
}

/**
 * 自定义注册表使用示例
 */
export async function customRegistryExample() {
  console.log('\n=== 自定义注册表使用示例 ===\n');

  // 1. 创建自定义注册表
  const registry = new ShenShaRegistry({
    analyzerConfig: {
      includeMinorShenSha: false,
      detailedImpactAnalysis: true,
      includeResolutionMethods: true,
    },
    performance: {
      enableCache: true,
      maxCacheSize: 500,
      enableParallel: false,
    },
  });

  // 2. 注册检测器
  registry.registerDetector(new NoblemanDetector());

  // 3. 注册分析器
  registry.registerAnalyzer(new ShenShaAnalyzer());

  // 4. 查看注册表状态
  const status = registry.getStatus();
  console.log('注册表状态:', {
    检测器数量: status.detectorCount,
    是否有分析器: status.hasAnalyzer,
    启用的检测器: status.enabledDetectors,
    缓存大小: status.cacheSize,
  });

  // 5. 获取支持的神煞列表
  const supportedShenSha = registry.getSupportedShenSha();
  console.log('\n支持的神煞:');
  supportedShenSha.forEach((detector) => {
    console.log(`${detector.detectorName}:`);
    detector.shenShaList.forEach((shensha) => {
      console.log(`  - ${shensha}`);
    });
  });

  // 6. 执行检测
  const testInput: ShenShaInput = {
    fourPillars: {
      year: { stem: '乙', branch: '亥' },
      month: { stem: '戊', branch: '子' },
      day: { stem: '甲', branch: '申' },
      hour: { stem: '丙', branch: '寅' },
    },
    gender: 'female',
  };

  const result = registry.detectAndAnalyze(testInput);
  console.log('\n检测结果:', `发现${result.statistics.total}个神煞`);

  return result;
}

/**
 * 兼容性接口使用示例
 */
export async function compatibilityExample() {
  console.log('\n=== 兼容性接口使用示例 ===\n');

  const input = {
    fourPillars: {
      year: { stem: '丙', branch: '寅' },
      month: { stem: '庚', branch: '寅' },
      day: { stem: '甲', branch: '子' },
      hour: { stem: '甲', branch: '戌' },
    },
    gender: 'male' as const,
    nayin: {
      year: '炉中火',
      month: '松柏木',
      day: '海中金',
      hour: '山头火',
    },
  };

  console.log('使用兼容性接口检测神煞...');

  try {
    const result = await checkBaziShenSha(input);

    console.log('检测摘要:', result.summary);

    if (result.detected.length > 0) {
      console.log('\n检测到的神煞:');
      result.detected.forEach((detection) => {
        console.log(`${detection.name}: ${detection.hasIt ? '有' : '无'}`);
        if (detection.hasIt) {
          console.log(`  位置: ${detection.positions.join('、')}`);
          console.log(`  影响: ${detection.impact}`);
          if (detection.resolution) {
            console.log(`  化解: ${detection.resolution.join('、')}`);
          }
        }
      });
    }

    return result;
  } catch (error) {
    console.error('兼容性接口检测失败:', error);
    throw error;
  }
}

/**
 * 性能测试示例
 */
export async function performanceExample() {
  console.log('\n=== 性能测试示例 ===\n');

  const testCases: ShenShaInput[] = [
    {
      fourPillars: {
        year: { stem: '甲', branch: '子' },
        month: { stem: '乙', branch: '丑' },
        day: { stem: '丙', branch: '寅' },
        hour: { stem: '丁', branch: '卯' },
      },
      gender: 'male',
    },
    {
      fourPillars: {
        year: { stem: '戊', branch: '辰' },
        month: { stem: '己', branch: '巳' },
        day: { stem: '庚', branch: '午' },
        hour: { stem: '辛', branch: '未' },
      },
      gender: 'female',
    },
    {
      fourPillars: {
        year: { stem: '壬', branch: '申' },
        month: { stem: '癸', branch: '酉' },
        day: { stem: '甲', branch: '戌' },
        hour: { stem: '乙', branch: '亥' },
      },
      gender: 'male',
    },
  ];

  console.log(`性能测试：检测 ${testCases.length} 个命盘`);

  // 测试无缓存性能
  console.log('\n--- 无缓存测试 ---');
  const noCacheStart = performance.now();

  for (let i = 0; i < testCases.length; i++) {
    const result = await ShenShaUtils.quickDetect(testCases[i]);
    console.log(`第${i + 1}个命盘: 检测到${result.statistics.total}个神煞`);
  }

  const noCacheTime = performance.now() - noCacheStart;
  console.log(`无缓存总耗时: ${noCacheTime.toFixed(2)}ms`);

  // 测试有缓存性能
  console.log('\n--- 有缓存测试 ---');
  const registry = ShenShaUtils.createDefaultRegistry({
    performance: { enableCache: true, maxCacheSize: 1000, enableParallel: false },
  });

  const cacheStart = performance.now();

  // 第一轮：建立缓存
  for (let i = 0; i < testCases.length; i++) {
    registry.detectAndAnalyze(testCases[i]);
  }

  // 第二轮：使用缓存
  for (let i = 0; i < testCases.length; i++) {
    const result = registry.detectAndAnalyze(testCases[i]);
    console.log(`第${i + 1}个命盘(缓存): 检测到${result.statistics.total}个神煞`);
  }

  const cacheTime = performance.now() - cacheStart;
  console.log(`有缓存总耗时: ${cacheTime.toFixed(2)}ms`);
  console.log(`性能提升: ${(((noCacheTime - cacheTime) / noCacheTime) * 100).toFixed(1)}%`);
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  console.log('\n=== 错误处理示例 ===\n');

  const invalidInputs = [
    // 缺少四柱信息
    {
      fourPillars: null as any,
      gender: 'male' as const,
    },
    // 无效的天干
    {
      fourPillars: {
        year: { stem: '无效干', branch: '子' },
        month: { stem: '甲', branch: '丑' },
        day: { stem: '乙', branch: '寅' },
        hour: { stem: '丙', branch: '卯' },
      },
      gender: 'male' as const,
    },
    // 无效的性别
    {
      fourPillars: {
        year: { stem: '甲', branch: '子' },
        month: { stem: '乙', branch: '丑' },
        day: { stem: '丙', branch: '寅' },
        hour: { stem: '丁', branch: '卯' },
      },
      gender: 'unknown' as any,
    },
  ];

  for (let i = 0; i < invalidInputs.length; i++) {
    try {
      console.log(`测试无效输入 ${i + 1}:`);
      await ShenShaUtils.quickDetect(invalidInputs[i] as unknown as ShenShaInput);
      console.log('❌ 应该抛出错误但没有');
    } catch (error: any) {
      console.log('✅ 正确捕获错误:', error.message);
      console.log('   错误代码:', error.code);
    }
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 开始运行神煞系统示例\n');

  try {
    await basicUsageExample();
    await customRegistryExample();
    await compatibilityExample();
    await performanceExample();
    await errorHandlingExample();

    console.log('\n✅ 所有示例运行完成');
  } catch (error) {
    console.error('\n❌ 示例运行失败:', error);
  }
}

/**
 * 对比新旧系统示例
 */
export async function comparisonExample() {
  console.log('\n=== 新旧系统对比示例 ===\n');

  const testInput = {
    fourPillars: {
      year: { stem: '甲', branch: '子' },
      month: { stem: '乙', branch: '丑' },
      day: { stem: '壬', branch: '午' },
      hour: { stem: '庚', branch: '戌' },
    },
    gender: 'male' as const,
  };

  console.log('相同输入数据的检测结果对比：');

  // 新系统
  console.log('\n--- 新系统（分层架构） ---');
  const newSystemStart = performance.now();
  const newResult = await checkBaziShenSha(testInput);
  const newSystemTime = performance.now() - newSystemStart;

  console.log(`检测耗时: ${newSystemTime.toFixed(2)}ms`);
  console.log(`检测到神煞: ${newResult.detected.filter((d) => d.hasIt).length}个`);
  console.log('神煞详情:');
  newResult.detected
    .filter((d) => d.hasIt)
    .forEach((detection) => {
      console.log(`  ${detection.name}: ${detection.positions.join('、')}`);
    });

  // 对比总结
  console.log('\n--- 系统对比总结 ---');
  console.log('新系统优势:');
  console.log('  ✅ 模块化设计，易于扩展');
  console.log('  ✅ 分离检测与分析逻辑');
  console.log('  ✅ 统一的接口管理');
  console.log('  ✅ 缓存机制优化性能');
  console.log('  ✅ 详细的影响分析和建议');
  console.log('  ✅ 支持自定义检测器和分析器');
  console.log('  ✅ 完整的错误处理机制');
  console.log('  ✅ 兼容原有接口');
}

// 如果直接运行此文件
if (require.main === module) {
  void runAllExamples();
}
