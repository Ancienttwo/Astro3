/**
 * 神煞检测层架构 - 主入口文件
 * 分离检测与分析的模块化神煞系统
 */

// ===== 类型导出 =====
export type {
  PillarType,
  ShenShaCategory,
  ShenShaGroup,
  ShenShaInfo,
  ShenShaCondition,
  ShenShaDetectionResult,
  ShenShaAnalysisResult,
  BatchShenShaResult,
  ShenShaInput,
  IShenShaDetector,
  IShenShaAnalyzer,
  IShenShaRegistry,
  ShenShaConfig,
  ShenShaErrorCode,
  ShenShaError
} from './types';

export type { StemName, BranchName } from '../types';

// ===== 核心类导出 =====
export { BaseDetector } from './detectors/BaseDetector';
export { NoblemanDetector } from './detectors/NoblemanDetector';
export { ShenShaAnalyzer } from './analyzers/ShenShaAnalyzer';
export { ShenShaRegistry } from './ShenShaRegistry';

// ===== 便利工具导出 =====
import { ShenShaRegistry } from './ShenShaRegistry';
import { NoblemanDetector } from './detectors/NoblemanDetector';
import { ShenShaAnalyzer } from './analyzers/ShenShaAnalyzer';
import { ShenShaInput, BatchShenShaResult, ShenShaConfig } from './types';

/**
 * 神煞系统工具类
 */
export const ShenShaUtils = {
  /**
   * 创建默认的神煞注册表
   */
  createDefaultRegistry(config?: Partial<ShenShaConfig>): ShenShaRegistry {
    const registry = new ShenShaRegistry(config);
    
    // 注册默认检测器
    registry.registerDetector(new NoblemanDetector());
    
    // 注册默认分析器
    registry.registerAnalyzer(new ShenShaAnalyzer());
    
    return registry;
  },
  
  /**
   * 快速神煞检测（使用默认配置）
   */
  async quickDetect(input: ShenShaInput): Promise<BatchShenShaResult> {
    const registry = this.createDefaultRegistry({
      analyzerConfig: {
        includeMinorShenSha: false,
        detailedImpactAnalysis: false,
        includeResolutionMethods: false
      }
    });
    
    return registry.detectAndAnalyze(input);
  },
  
  /**
   * 完整神煞检测（包含详细分析）
   */
  async fullDetect(input: ShenShaInput): Promise<BatchShenShaResult> {
    const registry = this.createDefaultRegistry({
      analyzerConfig: {
        includeMinorShenSha: true,
        detailedImpactAnalysis: true,
        includeResolutionMethods: true
      }
    });
    
    return registry.detectAndAnalyze(input);
  },
  
  /**
   * 检测贵人神煞
   */
  async detectNoblemanOnly(input: ShenShaInput): Promise<BatchShenShaResult> {
    const registry = new ShenShaRegistry();
    registry.registerDetector(new NoblemanDetector());
    registry.registerAnalyzer(new ShenShaAnalyzer());
    
    return registry.detectAndAnalyze(input);
  },
  
  /**
   * 从四柱数据创建神煞输入
   */
  createShenShaInput(
    fourPillars: {
      year: { stem: string; branch: string; };
      month: { stem: string; branch: string; };
      day: { stem: string; branch: string; };
      hour: { stem: string; branch: string; };
    },
    gender: 'male' | 'female',
    nayin?: {
      year: string;
      month: string;
      day: string;
      hour: string;
    },
    options?: {
      includeMinor?: boolean;
      includeModern?: boolean;
      detailedAnalysis?: boolean;
      resolutionMethods?: boolean;
    }
  ): ShenShaInput {
    return {
      fourPillars: fourPillars as any, // 类型转换，实际使用时需要确保类型正确
      gender,
      nayin,
      options
    };
  }
} as const;

/**
 * 神煞系统信息
 */
export const ShenShaModuleInfo = {
  name: '@astroall/bazi-core/shensha',
  version: '1.0.0',
  description: '八字神煞检测分析系统',
  architecture: {
    pattern: '分层架构',
    layers: [
      '检测层(Detectors) - 负责神煞检测逻辑',
      '分析层(Analyzers) - 负责影响分析和建议',
      '管理层(Registry) - 负责检测器和分析器的统一管理'
    ]
  },
  features: [
    '模块化检测器设计',
    '可插拔分析器系统',
    '统一的注册表管理',
    '缓存机制优化',
    '批量检测分析',
    '详细的影响分析',
    '化解方法建议',
    '神煞重要性评分',
    '综合统计分析'
  ],
  supportedDetectors: [
    'NoblemanDetector - 贵人类神煞检测器'
  ],
  extensibility: {
    customDetectors: '继承BaseDetector实现自定义检测器',
    customAnalyzers: '实现IShenShaAnalyzer接口',
    customConfig: '通过ShenShaConfig自定义配置',
    pluginSystem: '支持动态加载检测器和分析器'
  },
  performance: {
    cachingStrategy: 'LRU缓存机制',
    parallelProcessing: '支持并行检测（规划中）',
    memoryOptimized: '内存优化的数据结构',
    lazyLoading: '延迟加载检测器'
  }
} as const;

// ===== 默认实例（单例模式） =====
let defaultRegistry: ShenShaRegistry | null = null;

/**
 * 获取默认神煞注册表实例
 */
export function getDefaultShenShaRegistry(): ShenShaRegistry {
  if (!defaultRegistry) {
    defaultRegistry = ShenShaUtils.createDefaultRegistry();
  }
  return defaultRegistry;
}

/**
 * 重置默认神煞注册表实例
 */
export function resetDefaultShenShaRegistry(): void {
  defaultRegistry = null;
}

// ===== 兼容性接口 =====

/**
 * 兼容性接口：快速神煞检测
 * 提供与现有系统类似的接口，便于迁移
 */
export async function checkBaziShenSha(input: {
  fourPillars: {
    year: { stem: string; branch: string; };
    month: { stem: string; branch: string; };
    day: { stem: string; branch: string; };
    hour: { stem: string; branch: string; };
  };
  gender: 'male' | 'female';
  nayin?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
}): Promise<{
  // 保持与原接口兼容的结果格式
  detected: Array<{
    name: string;
    hasIt: boolean;
    positions: string[];
    impact: string;
    resolution?: string[];
  }>;
  summary: {
    total: number;
    auspicious: number;
    inauspicious: number;
    important: string[];
  };
}> {
  const shenShaInput = ShenShaUtils.createShenShaInput(
    input.fourPillars,
    input.gender,
    input.nayin
  );
  
  const result = await ShenShaUtils.quickDetect(shenShaInput);
  
  // 转换为兼容格式
  const detected = result.detectedShenSha.map(analysis => ({
    name: analysis.info.name,
    hasIt: analysis.detection.hasIt,
    positions: analysis.detection.positions.map(p => {
      const pillarNames = {
        year: '年柱',
        month: '月柱', 
        day: '日柱',
        hour: '时柱'
      };
      return pillarNames[p.pillar] || p.pillar;
    }),
    impact: analysis.impact.positive.concat(analysis.impact.negative).join('；'),
    resolution: analysis.resolutionMethods
  }));
  
  return {
    detected,
    summary: {
      total: result.statistics.total,
      auspicious: result.statistics.auspicious,
      inauspicious: result.statistics.inauspicious,
      important: result.important.map(r => r.info.name)
    }
  };
}

/**
 * 兼容性接口：获取贵人摘要
 */
export function getNoblemanSummary(result: BatchShenShaResult): {
  count: number;
  list: string[];
  description: string;
} {
  const nobleman = result.byGroup.nobleman || [];
  
  return {
    count: nobleman.length,
    list: nobleman.map(r => r.info.name),
    description: nobleman.length > 0 ? 
      `命中有${nobleman.length}个贵人神煞，多有贵人相助。` : 
      '命中贵人神煞较少，需要自力更生。'
  };
}

/**
 * 兼容性接口：获取桃花摘要
 */
export function getPeachBlossomSummary(result: BatchShenShaResult): {
  count: number;
  list: string[];
  description: string;
} {
  const peachBlossom = result.byGroup.peachBlossom || [];
  
  return {
    count: peachBlossom.length,
    list: peachBlossom.map(r => r.info.name),
    description: peachBlossom.length > 0 ?
      `命带${peachBlossom.length}个桃花神煞，异性缘佳，需注意感情处理。` :
      '命中桃花神煞较少，感情发展需要主动。'
  };
}
