/**
 * useZiWeiCalculator Hook - Direct access to calculator instances
 * 紫微计算器钩子 - 直接访问计算器实例
 */

import { useMemo } from 'react';
import { StarCalculator } from '../calculations/star-calculator';
import { SihuaCalculator } from '../calculations/sihua-calculator';
import { PalaceCalculator } from '../calculations/palace-calculator';
import type {
  Star,
  LunarDate,
  CalculationOptions,
  PalaceData,
  SihuaTransformation,
  HeavenlyStem,
  PalaceName,
} from '../types/core';

/**
 * Calculator instances container
 */
export interface ZiWeiCalculators {
  starCalculator: StarCalculator;
  sihuaCalculator: SihuaCalculator;
  palaceCalculator: PalaceCalculator;
}

/**
 * Hook return value
 */
export interface UseZiWeiCalculatorReturn extends ZiWeiCalculators {
  // Star calculations
  calculateStars: (
    palaceIndex: number,
    lunarDate: LunarDate,
    options?: CalculationOptions
  ) => Star[];
  
  // Sihua calculations
  calculateBirthYearSihua: (yearStem: HeavenlyStem) => SihuaTransformation[];
  calculatePalaceStemSihua: (
    palaceStem: HeavenlyStem,
    palaceIndex: number
  ) => SihuaTransformation[];
  
  // Palace calculations
  calculatePalaces: (lunarDate: LunarDate) => Map<PalaceName, PalaceData>;
  calculatePalaceRelationships: (palaceIndex: number) => {
    opposite: number;
    triangle: number[];
    square: number[];
  };
  
  // Utility functions
  clearAllCaches: () => void;
  getCacheStats: () => {
    stars: number;
    sihua: number;
    palaces: number;
  };
}

// Singleton calculator instances
let calculatorInstances: ZiWeiCalculators | null = null;

const getCalculatorInstances = (): ZiWeiCalculators => {
  if (!calculatorInstances) {
    calculatorInstances = {
      starCalculator: new StarCalculator(),
      sihuaCalculator: new SihuaCalculator(),
      palaceCalculator: new PalaceCalculator(),
    };
  }
  return calculatorInstances;
};

/**
 * Hook for direct access to ZiWei calculators
 * 直接访问紫微计算器的钩子
 */
export function useZiWeiCalculator(): UseZiWeiCalculatorReturn {
  // Get calculator instances
  const calculators = useMemo(() => getCalculatorInstances(), []);
  
  // Star calculation wrapper
  const calculateStars = useMemo(
    () => (
      palaceIndex: number,
      lunarDate: LunarDate,
      options?: CalculationOptions
    ) => {
      return calculators.starCalculator.calculateStarsForPalace(
        palaceIndex,
        lunarDate,
        options
      );
    },
    [calculators.starCalculator]
  );
  
  // Birth year sihua calculation wrapper
  const calculateBirthYearSihua = useMemo(
    () => (yearStem: HeavenlyStem) => {
      return calculators.sihuaCalculator.calculateBirthYearSihua(yearStem);
    },
    [calculators.sihuaCalculator]
  );
  
  // Palace stem sihua calculation wrapper
  const calculatePalaceStemSihua = useMemo(
    () => (palaceStem: HeavenlyStem, palaceIndex: number) => {
      return calculators.sihuaCalculator.calculatePalaceStemSihua(
        palaceStem,
        palaceIndex
      );
    },
    [calculators.sihuaCalculator]
  );
  
  // Palace calculation wrapper
  const calculatePalaces = useMemo(
    () => (lunarDate: LunarDate) => {
      return calculators.palaceCalculator.calculatePalaces(lunarDate);
    },
    [calculators.palaceCalculator]
  );
  
  // Palace relationships wrapper
  const calculatePalaceRelationships = useMemo(
    () => (palaceIndex: number) => {
      return calculators.palaceCalculator.calculatePalaceRelationships(palaceIndex);
    },
    [calculators.palaceCalculator]
  );
  
  // Clear all caches
  const clearAllCaches = useMemo(
    () => () => {
      calculators.starCalculator.clearCache();
      calculators.sihuaCalculator.clearCache();
      calculators.palaceCalculator.clearCache();
    },
    [calculators]
  );
  
  // Get cache statistics
  const getCacheStats = useMemo(
    () => () => {
      return {
        stars: calculators.starCalculator.getCacheStats().positions,
        sihua: calculators.sihuaCalculator.getCacheStats().sihuaEntries,
        palaces: calculators.palaceCalculator.getCacheStats().palaceEntries,
      };
    },
    [calculators]
  );
  
  return {
    // Calculator instances
    ...calculators,
    
    // Calculation methods
    calculateStars,
    calculateBirthYearSihua,
    calculatePalaceStemSihua,
    calculatePalaces,
    calculatePalaceRelationships,
    
    // Utility methods
    clearAllCaches,
    getCacheStats,
  };
}