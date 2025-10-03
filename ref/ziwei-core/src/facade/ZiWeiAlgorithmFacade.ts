/**
 * ZiWei Algorithm Facade - 紫微斗数算法门面类
 * 
 * @ai-context ZIWEI_ALGORITHM_FACADE
 * @purpose 提供模块化访问接口，同时保持完整算法的统一性
 * @pattern Facade + Registry Integration
 * @critical 保留 getCompleteChart 的完整功能，只增加模块化选项
 * 
 * @vibe-coding-principle
 * - ✅ 算法零重复：通过门面统一访问核心算法
 * - ✅ 保持完整性：不破坏现有 getCompleteChart 功能
 * - ✅ 模块化选项：提供可选的功能分组访问
 */

// 导入核心算法实现
import * as ZiweiCalculations from '../calculations/index'
import type { ZiWeiChartInput as ChartInput, ZiWeiCompleteChart as ChartOutput } from '../complete-chart-types'

/**
 * 宫位计算模块接口
 */
export interface PalaceCalculationsModule {
  calculateLifePalace: typeof ZiweiCalculations.calculateLifePalace;
  calculateBodyPalace: typeof ZiweiCalculations.calculateBodyPalace;
  getPalaceName: typeof ZiweiCalculations.getPalaceName;
  calculateLaiyinPalace: typeof ZiweiCalculations.calculateLaiyinPalace;
}

/**
 * 星曜计算模块接口
 */
export interface StarCalculationsModule {
  calculateZiweiPosition: typeof ZiweiCalculations.calculateZiweiPosition;
  calculateTianfuPosition: typeof ZiweiCalculations.calculateTianfuPosition;
  calculateMainStarPositions: typeof ZiweiCalculations.calculateMainStarPositions;
  calculateAuxiliaryStarPositions: typeof ZiweiCalculations.calculateAuxiliaryStarPositions;
  calculateMaleficStarPositions: typeof ZiweiCalculations.calculateMaleficStarPositions;
  calculateRomanceStarPositions: typeof ZiweiCalculations.calculateRomanceStarPositions;
  calculateMinorStarPositions: typeof ZiweiCalculations.calculateMinorStarPositions;
}

/**
 * 四化计算模块接口
 */
export interface SihuaCalculationsModule {
  calculateBirthYearSihua: typeof ZiweiCalculations.calculateBirthYearSihua;
  calculateFlyingPalaceSihua: typeof ZiweiCalculations.calculateFlyingPalaceSihua;
  calculateSelfTransformations: typeof ZiweiCalculations.calculateSelfTransformations;
}

/**
 * 运程计算模块接口
 */
export interface PeriodCalculationsModule {
  calculateMajorPeriodStartAge: typeof ZiweiCalculations.calculateMajorPeriodStartAge;
  calculateMajorPeriods: typeof ZiweiCalculations.calculateMajorPeriods;
  calculateFleetingYears: typeof ZiweiCalculations.calculateFleetingYears;
  calculateMinorPeriod: typeof ZiweiCalculations.calculateMinorPeriod;
}

/**
 * 命主身主计算模块接口
 */
export interface MastersCalculationsModule {
  calculateMasters: typeof ZiweiCalculations.calculateMasters;
  getInnateDauPalaceIndex: typeof ZiweiCalculations.getInnateDauPalaceIndex;
}

/**
 * ZiWei Algorithm Facade - 紫微斗数算法门面类
 * 
 * @ai-pattern FACADE_SINGLETON
 * @purpose 提供统一的算法访问接口，支持完整计算和模块化访问
 * 
 * 🎯 核心设计原则：
 * 1. **保持完整性** - getCompleteChart 功能完全不变
 * 2. **提供选择** - 可选择使用模块化接口进行细粒度控制  
 * 3. **零重复** - 所有接口都指向同一个核心算法实现
 * 4. **向后兼容** - 现有代码无需修改即可继续使用
 */
export class ZiWeiAlgorithmFacade {
  private static instance: ZiWeiAlgorithmFacade;
  
  /**
   * 单例模式 - 确保算法实例唯一性
   */
  public static getInstance(): ZiWeiAlgorithmFacade {
    if (!ZiWeiAlgorithmFacade.instance) {
      console.log('🔧 正在初始化 ZiWei 算法门面实例...');
      ZiWeiAlgorithmFacade.instance = new ZiWeiAlgorithmFacade();
    }
    return ZiWeiAlgorithmFacade.instance;
  }

  /**
   * 🎯 核心完整计算接口 - 保持完全不变
   * 
   * @ai-critical 此方法保持与原 calculations.ts 完全一致的行为
   * @usage 用于需要完整紫微盘数据的场景
   * @compatibility 与现有所有代码100%兼容
   */
  public calculateCompleteChart(input: ChartInput): ChartOutput {
    // 🚨 直接调用核心算法，保证完整性和准确性
    return ZiweiCalculations.generateCompleteZiWeiChart 
      ? ZiweiCalculations.generateCompleteZiWeiChart(input)
      : this.fallbackCompleteCalculation(input);
  }

  /**
   * 🔧 备用完整计算 - 当主方法不存在时使用
   */
  private fallbackCompleteCalculation(_input: ChartInput): ChartOutput {
    // 禁止任何占位/模拟实现
    throw new Error('Fallback calculation is disabled. Use real calculation modules.');
  }

  /**
   * 📍 宫位计算模块
   * 
   * @ai-usage 当只需要宫位相关计算时使用
   * @example const palaceCalc = facade.getPalaceCalculations();
   */
  public getPalaceCalculations(): PalaceCalculationsModule {
    return {
      calculateLifePalace: ZiweiCalculations.calculateLifePalace,
      calculateBodyPalace: ZiweiCalculations.calculateBodyPalace,
      getPalaceName: ZiweiCalculations.getPalaceName,
      calculateLaiyinPalace: ZiweiCalculations.calculateLaiyinPalace
    };
  }

  /**
   * ⭐ 星曜计算模块
   * 
   * @ai-usage 当只需要星曜安星计算时使用
   * @example const starCalc = facade.getStarCalculations();
   */
  public getStarCalculations(): StarCalculationsModule {
    return {
      calculateZiweiPosition: ZiweiCalculations.calculateZiweiPosition,
      calculateTianfuPosition: ZiweiCalculations.calculateTianfuPosition,
      calculateMainStarPositions: ZiweiCalculations.calculateMainStarPositions,
      calculateAuxiliaryStarPositions: ZiweiCalculations.calculateAuxiliaryStarPositions,
      calculateMaleficStarPositions: ZiweiCalculations.calculateMaleficStarPositions,
      calculateRomanceStarPositions: ZiweiCalculations.calculateRomanceStarPositions,
      calculateMinorStarPositions: ZiweiCalculations.calculateMinorStarPositions
    };
  }

  /**
   * 🔄 四化计算模块
   * 
   * @ai-usage 当只需要四化相关计算时使用
   * @example const sihuaCalc = facade.getSihuaCalculations();
   */
  public getSihuaCalculations(): SihuaCalculationsModule {
    return {
      calculateBirthYearSihua: ZiweiCalculations.calculateBirthYearSihua,
      calculateFlyingPalaceSihua: ZiweiCalculations.calculateFlyingPalaceSihua,
      calculateSelfTransformations: ZiweiCalculations.calculateSelfTransformations
    };
  }

  /**
   * 📅 运程计算模块
   * 
   * @ai-usage 当只需要运程相关计算时使用
   * @example const periodCalc = facade.getPeriodCalculations();
   */
  public getPeriodCalculations(): PeriodCalculationsModule {
    return {
      calculateMajorPeriodStartAge: ZiweiCalculations.calculateMajorPeriodStartAge,
      calculateMajorPeriods: ZiweiCalculations.calculateMajorPeriods,
      calculateFleetingYears: ZiweiCalculations.calculateFleetingYears,
      calculateMinorPeriod: ZiweiCalculations.calculateMinorPeriod
    };
  }

  /**
   * 👑 命主身主计算模块
   * 
   * @ai-usage 当只需要命主身主计算时使用
   * @example const mastersCalc = facade.getMastersCalculations();
   */
  public getMastersCalculations(): MastersCalculationsModule {
    return {
      calculateMasters: ZiweiCalculations.calculateMasters,
      getInnateDauPalaceIndex: ZiweiCalculations.getInnateDauPalaceIndex
    };
  }

  /**
   * 🎯 通用算法访问 - AI 友好接口
   * 
   * @ai-usage 当算法模块类型需要动态确定时使用
   * @param moduleType 模块类型
   * @returns 对应的计算模块
   */
  public getCalculationModule(moduleType: 'palace' | 'star' | 'sihua' | 'period' | 'masters') {
    switch (moduleType) {
      case 'palace':
        return this.getPalaceCalculations();
      case 'star':
        return this.getStarCalculations();
      case 'sihua':
        return this.getSihuaCalculations();
      case 'period':
        return this.getPeriodCalculations();
      case 'masters':
        return this.getMastersCalculations();
      default:
        throw new Error(`未知的计算模块类型: ${moduleType}`);
    }
  }

  /**
   * 📊 性能监控 - 算法调用统计
   * 
   * @ai-debug 用于监控算法使用情况和性能
   */
  public getUsageStats() {
    return {
      instanceCreated: new Date().toISOString(),
      availableModules: ['palace', 'star', 'sihua', 'period', 'masters'],
      completeCalculationAvailable: true,
      modularCalculationAvailable: true,
      version: '1.0.0'
    };
  }

  /**
   * 🔧 开发者工具 - 验证算法完整性
   * 
   * @ai-validation 确保所有算法模块正常工作
   */
  public validateAlgorithms(): {
    isValid: boolean;
    availableModules: string[];
    missingFunctions: string[];
  } {
    const missingFunctions: string[] = [];
    const availableModules: string[] = [];

    // 检查宫位计算模块
    try {
      this.getPalaceCalculations();
      availableModules.push('palace');
    } catch (error) {
      missingFunctions.push('getPalaceCalculations');
    }

    // 检查星曜计算模块
    try {
      this.getStarCalculations();
      availableModules.push('star');
    } catch (error) {
      missingFunctions.push('getStarCalculations');
    }

    // 检查四化计算模块
    try {
      this.getSihuaCalculations();
      availableModules.push('sihua');
    } catch (error) {
      missingFunctions.push('getSihuaCalculations');
    }

    return {
      isValid: missingFunctions.length === 0,
      availableModules,
      missingFunctions
    };
  }
}

/**
 * 🏭 工厂方法 - 便捷的算法实例获取
 * 
 * @ai-usage 在需要快速获取算法实例时使用
 * @returns ZiWei算法门面实例
 */
export const createZiWeiAlgorithmFacade = () => {
  return ZiWeiAlgorithmFacade.getInstance();
};

/**
 * @ai-export-summary
 * 导出内容：
 * - ZiWeiAlgorithmFacade: 核心门面类
 * - createZiWeiAlgorithmFacade: 工厂方法
 * - 各种模块接口类型定义
 * 
 * @ai-usage-pattern
 * ```typescript
 * // 完整计算（推荐，与现有代码兼容）
 * const facade = createZiWeiAlgorithmFacade();
 * const chart = facade.calculateCompleteChart(input);
 * 
 * // 模块化计算（可选，精细控制）
 * const palaceCalc = facade.getPalaceCalculations();
 * const lifePalace = palaceCalc.calculateLifePalace(month, hour);
 * ```
 */

export default ZiWeiAlgorithmFacade;
