/**
 * 神煞注册表
 * 统一管理神煞检测器和分析器，提供统一的检测和分析接口
 */

import {
  IShenShaRegistry,
  IShenShaDetector,
  IShenShaAnalyzer,
  ShenShaInput,
  BatchShenShaResult,
  ShenShaDetectionResult,
  ShenShaConfig,
  ShenShaError
} from './types';

export class ShenShaRegistry implements IShenShaRegistry {
  private detectors: Map<string, IShenShaDetector> = new Map();
  private analyzer?: IShenShaAnalyzer;
  private config: ShenShaConfig;
  private cache: Map<string, BatchShenShaResult> = new Map();
  
  constructor(config?: Partial<ShenShaConfig>) {
    this.config = this.mergeConfig(config);
  }
  
  /**
   * 注册检测器
   */
  public registerDetector(detector: IShenShaDetector): void {
    if (this.detectors.has(detector.name)) {
      throw new ShenShaError(
        `检测器 ${detector.name} 已存在`,
        'CONFIGURATION_ERROR',
        { detectorName: detector.name }
      );
    }
    
    this.detectors.set(detector.name, detector);
    console.log(`已注册神煞检测器: ${detector.name}`);
  }
  
  /**
   * 注册分析器
   */
  public registerAnalyzer(analyzer: IShenShaAnalyzer): void {
    if (this.analyzer) {
      console.warn(`分析器 ${this.analyzer.name} 将被 ${analyzer.name} 替换`);
    }
    
    this.analyzer = analyzer;
    console.log(`已注册神煞分析器: ${analyzer.name}`);
  }
  
  /**
   * 获取所有检测器
   */
  public getDetectors(): IShenShaDetector[] {
    return Array.from(this.detectors.values());
  }
  
  /**
   * 获取指定检测器
   */
  public getDetector(name: string): IShenShaDetector | undefined {
    return this.detectors.get(name);
  }
  
  /**
   * 获取分析器
   */
  public getAnalyzer(): IShenShaAnalyzer {
    if (!this.analyzer) {
      throw new ShenShaError('未注册分析器', 'ANALYZER_NOT_FOUND');
    }
    return this.analyzer;
  }
  
  /**
   * 执行完整检测流程
   */
  public detectAndAnalyze(input: ShenShaInput): BatchShenShaResult {
    try {
      // 验证输入
      this.validateInput(input);
      
      // 检查缓存
      if (this.config.performance.enableCache) {
        const cacheKey = this.generateCacheKey(input);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          return cached;
        }
      }
      
      // 执行检测
      const detections = this.executeDetection(input);
      
      // 执行分析
      const result = this.executeAnalysis(detections, input);
      
      // 缓存结果
      if (this.config.performance.enableCache) {
        const cacheKey = this.generateCacheKey(input);
        this.cache.set(cacheKey, result);
        this.cleanupCache();
      }
      
      return result;
    } catch (error) {
      throw new ShenShaError(
        `神煞检测分析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'DETECTION_ERROR',
        { input }
      );
    }
  }
  
  /**
   * 执行检测
   */
  private executeDetection(input: ShenShaInput): ShenShaDetectionResult[] {
    const allDetections: ShenShaDetectionResult[] = [];
    const enabledDetectors = this.getEnabledDetectors();
    
    if (this.config.performance.enableParallel && enabledDetectors.length > 1) {
      // 并行检测（模拟异步，实际上JavaScript是单线程）
      const detectionPromises = enabledDetectors.map(detector => {
        return Promise.resolve(detector.detect(input));
      });
      
      // 这里简化处理，直接同步执行
      for (const detector of enabledDetectors) {
        try {
          const detections = detector.detect(input);
          allDetections.push(...detections);
        } catch (error) {
          console.warn(`检测器 ${detector.name} 执行失败:`, error);
          // 继续执行其他检测器
        }
      }
    } else {
      // 顺序检测
      for (const detector of enabledDetectors) {
        try {
          const detections = detector.detect(input);
          allDetections.push(...detections);
        } catch (error) {
          console.warn(`检测器 ${detector.name} 执行失败:`, error);
          // 继续执行其他检测器
        }
      }
    }
    
    return allDetections;
  }
  
  /**
   * 执行分析
   */
  private executeAnalysis(detections: ShenShaDetectionResult[], input: ShenShaInput): BatchShenShaResult {
    const analyzer = this.getAnalyzer();
    return analyzer.batchAnalyze(detections, input);
  }
  
  /**
   * 获取启用的检测器
   */
  private getEnabledDetectors(): IShenShaDetector[] {
    const enabled: IShenShaDetector[] = [];
    
    for (const detectorName of this.config.enabledDetectors) {
      const detector = this.detectors.get(detectorName);
      if (detector) {
        enabled.push(detector);
      } else {
        console.warn(`检测器 ${detectorName} 未找到`);
      }
    }
    
    // 如果没有配置启用的检测器，则使用所有已注册的检测器
    if (enabled.length === 0) {
      enabled.push(...this.detectors.values());
    }
    
    return enabled;
  }
  
  /**
   * 验证输入参数
   */
  private validateInput(input: ShenShaInput): void {
    if (!input) {
      throw new ShenShaError('输入参数不能为空', 'INVALID_INPUT');
    }
    
    if (!input.fourPillars) {
      throw new ShenShaError('四柱信息不能为空', 'INVALID_INPUT');
    }
    
    const requiredPillars = ['year', 'month', 'day', 'hour'] as const;
    for (const pillarType of requiredPillars) {
      const pillar = input.fourPillars[pillarType];
      if (!pillar || !pillar.stem || !pillar.branch) {
        throw new ShenShaError(`${pillarType}柱信息不完整`, 'INVALID_INPUT');
      }
    }
    
    if (!['male', 'female'].includes(input.gender)) {
      throw new ShenShaError('性别信息无效', 'INVALID_INPUT');
    }
  }
  
  /**
   * 生成缓存键
   */
  private generateCacheKey(input: ShenShaInput): string {
    const { fourPillars, gender, nayin, options } = input;
    
    const pillarStr = [
      `${fourPillars.year.stem}${fourPillars.year.branch}`,
      `${fourPillars.month.stem}${fourPillars.month.branch}`,
      `${fourPillars.day.stem}${fourPillars.day.branch}`,
      `${fourPillars.hour.stem}${fourPillars.hour.branch}`
    ].join('');
    
    const nayinStr = nayin ? 
      `${nayin.year}_${nayin.month}_${nayin.day}_${nayin.hour}` : 
      'no_nayin';
    
    const optionsStr = options ? 
      `${options.includeMinor}_${options.includeModern}_${options.detailedAnalysis}_${options.resolutionMethods}` :
      'default_options';
    
    return `${pillarStr}_${gender}_${nayinStr}_${optionsStr}`;
  }
  
  /**
   * 清理缓存
   */
  private cleanupCache(): void {
    if (this.cache.size > this.config.performance.maxCacheSize) {
      // 简单的LRU策略：删除最早的一半缓存
      const entries = Array.from(this.cache.entries());
      const deleteCount = Math.floor(entries.length / 2);
      
      for (let i = 0; i < deleteCount; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }
  
  /**
   * 合并配置
   */
  private mergeConfig(customConfig?: Partial<ShenShaConfig>): ShenShaConfig {
    const defaultConfig: ShenShaConfig = {
      enabledDetectors: [], // 空数组表示使用所有注册的检测器
      analyzerConfig: {
        includeMinorShenSha: true,
        detailedImpactAnalysis: true,
        includeResolutionMethods: true
      },
      performance: {
        enableCache: true,
        maxCacheSize: 1000,
        enableParallel: false // JavaScript单线程，暂时不启用
      }
    };
    
    return {
      ...defaultConfig,
      ...customConfig,
      analyzerConfig: {
        ...defaultConfig.analyzerConfig,
        ...customConfig?.analyzerConfig
      },
      performance: {
        ...defaultConfig.performance,
        ...customConfig?.performance
      }
    };
  }
  
  /**
   * 获取注册表状态
   */
  public getStatus(): {
    detectorCount: number;
    hasAnalyzer: boolean;
    enabledDetectors: string[];
    cacheSize: number;
  } {
    return {
      detectorCount: this.detectors.size,
      hasAnalyzer: !!this.analyzer,
      enabledDetectors: this.config.enabledDetectors.length > 0 ? 
        this.config.enabledDetectors : 
        Array.from(this.detectors.keys()),
      cacheSize: this.cache.size
    };
  }
  
  /**
   * 清空缓存
   */
  public clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * 更新配置
   */
  public updateConfig(config: Partial<ShenShaConfig>): void {
    this.config = this.mergeConfig(config);
    
    // 如果禁用缓存，清空现有缓存
    if (!this.config.performance.enableCache) {
      this.clearCache();
    }
  }
  
  /**
   * 获取支持的神煞列表
   */
  public getSupportedShenSha(): Array<{
    detectorName: string;
    shenShaList: string[];
  }> {
    const result: Array<{
      detectorName: string;
      shenShaList: string[];
    }> = [];
    
    for (const [name, detector] of this.detectors) {
      result.push({
        detectorName: name,
        shenShaList: [...detector.supportedShenSha]
      });
    }
    
    return result;
  }
  
  /**
   * 检测单个神煞
   */
  public detectSingle(shenShaName: string, input: ShenShaInput): ShenShaDetectionResult | null {
    // 找到支持该神煞的检测器
    for (const detector of this.detectors.values()) {
      if (detector.supportedShenSha.includes(shenShaName)) {
        const detections = detector.detect(input);
        return detections.find(d => d.name === shenShaName) || null;
      }
    }
    
    return null;
  }
  
  /**
   * 分析单个神煞
   */
  public analyzeSingle(shenShaName: string, input: ShenShaInput): import("./types").ShenShaAnalysisResult | null {
    const detection = this.detectSingle(shenShaName, input);
    if (!detection || !detection.hasIt) {
      return null;
    }
    
    const analyzer = this.getAnalyzer();
    return analyzer.analyze(detection, input);
  }
}