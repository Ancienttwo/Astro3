/**
 * useZiWeiPalaces Hook - Palace-specific hooks and utilities
 * 紫微宫位钩子 - 宫位相关的钩子和工具
 */

import { useMemo, useCallback } from 'react';
import type {
  CompleteChart,
  PalaceData,
  PalaceName,
  Star,
  SihuaInfo,
} from '../types/core';

/**
 * Palace analysis result
 */
export interface PalaceAnalysis {
  palace: PalaceData;
  palaceName: PalaceName;
  
  // Basic info
  isEmpty: boolean;
  hasMainStar: boolean;
  mainStarCount: number;
  totalStarCount: number;
  
  // Star categories
  mainStars: Star[];
  auxiliaryStars: Star[];
  maleficStars: Star[];
  beneficStars: Star[];
  
  // Sihua analysis
  hasSihua: boolean;
  birthSihua: SihuaInfo[];
  selfTransformations: string[];
  
  // Relationships
  isLifePalace: boolean;
  isBodyPalace: boolean;
  isInTriangle: boolean;
  isInSquare: boolean;
  
  // Strength
  strength: 'strong' | 'medium' | 'weak';
  strengthScore: number;
}

/**
 * Palace relationships
 */
export interface PalaceRelationships {
  opposite: PalaceData | null;
  triangle: PalaceData[];
  square: PalaceData[];
  allRelated: PalaceData[];
}

/**
 * Hook for analyzing all palaces
 */
export function useZiWeiPalaces(chart: CompleteChart | null) {
  // Get all palaces as array
  const palacesArray = useMemo(() => {
    if (!chart) return [];
    return Array.from(chart.palaces.entries());
  }, [chart]);
  
  // Analyze each palace
  const palaceAnalyses = useMemo(() => {
    if (!chart) return new Map<PalaceName, PalaceAnalysis>();
    
    const analyses = new Map<PalaceName, PalaceAnalysis>();
    
    chart.palaces.forEach((palace, palaceName) => {
      const analysis = analyzePalace(
        palace,
        palaceName,
        chart.lifePalaceIndex,
        chart.bodyPalaceIndex
      );
      analyses.set(palaceName, analysis);
    });
    
    return analyses;
  }, [chart]);
  
  // Get palace by name
  const getPalaceByName = useCallback(
    (name: PalaceName): PalaceData | null => {
      if (!chart) return null;
      return chart.palaces.get(name) || null;
    },
    [chart]
  );
  
  // Get palace by index
  const getPalaceByIndex = useCallback(
    (index: number): PalaceData | null => {
      if (!chart) return null;
      
      const entry = Array.from(chart.palaces.entries()).find(
        ([_, palace]) => palace.position.index === index
      );
      
      return entry ? entry[1] : null;
    },
    [chart]
  );
  
  // Get palace relationships
  const getPalaceRelationships = useCallback(
    (palaceName: PalaceName): PalaceRelationships | null => {
      if (!chart) return null;
      
      const palace = chart.palaces.get(palaceName);
      if (!palace) return null;
      
      const index = palace.position.index;
      
      // Calculate related indices
      const oppositeIndex = (index + 6) % 12;
      const triangleIndices = [(index + 4) % 12, (index + 8) % 12];
      const squareIndices = [index, oppositeIndex, ...triangleIndices];
      
      // Get related palaces
      const opposite = getPalaceByIndex(oppositeIndex);
      const triangle = triangleIndices
        .map(i => getPalaceByIndex(i))
        .filter((p): p is PalaceData => p !== null);
      const square = squareIndices
        .map(i => getPalaceByIndex(i))
        .filter((p): p is PalaceData => p !== null);
      
      return {
        opposite,
        triangle,
        square,
        allRelated: square,
      };
    },
    [chart, getPalaceByIndex]
  );
  
  // Find palaces with specific stars
  const findPalacesWithStar = useCallback(
    (starName: string): PalaceData[] => {
      if (!chart) return [];
      
      const palaces: PalaceData[] = [];
      
      chart.palaces.forEach(palace => {
        if (palace.stars.some(star => star.name === starName)) {
          palaces.push(palace);
        }
      });
      
      return palaces;
    },
    [chart]
  );
  
  // Find empty palaces
  const getEmptyPalaces = useMemo(() => {
    if (!chart) return [];
    
    const emptyPalaces: Array<[PalaceName, PalaceData]> = [];
    
    chart.palaces.forEach((palace, name) => {
      if (palace.isEmpty) {
        emptyPalaces.push([name, palace]);
      }
    });
    
    return emptyPalaces;
  }, [chart]);
  
  // Find palaces with sihua
  const getPalacesWithSihua = useMemo(() => {
    if (!chart) return [];
    
    const sihuaPalaces: Array<[PalaceName, PalaceData]> = [];
    
    chart.palaces.forEach((palace, name) => {
      if (palace.sihua.length > 0) {
        sihuaPalaces.push([name, palace]);
      }
    });
    
    return sihuaPalaces;
  }, [chart]);
  
  // Get triangle palaces for life palace
  const getLifeTriangle = useMemo(() => {
    if (!chart) return null;
    
    const lifePalace = chart.palaces.get('命宫');
    if (!lifePalace) return null;
    
    return getPalaceRelationships('命宫');
  }, [chart, getPalaceRelationships]);
  
  return {
    // All palaces
    palaces: palacesArray,
    palaceAnalyses,
    
    // Getters
    getPalaceByName,
    getPalaceByIndex,
    getPalaceRelationships,
    
    // Finders
    findPalacesWithStar,
    getEmptyPalaces,
    getPalacesWithSihua,
    
    // Special relationships
    getLifeTriangle,
  };
}

/**
 * Hook for a specific palace
 */
export function useZiWeiPalace(
  chart: CompleteChart | null,
  palaceName: PalaceName
) {
  // Get palace data
  const palace = useMemo(() => {
    if (!chart) return null;
    return chart.palaces.get(palaceName) || null;
  }, [chart, palaceName]);
  
  // Analyze palace
  const analysis = useMemo(() => {
    if (!chart || !palace) return null;
    
    return analyzePalace(
      palace,
      palaceName,
      chart.lifePalaceIndex,
      chart.bodyPalaceIndex
    );
  }, [chart, palace, palaceName]);
  
  // Get relationships
  const relationships = useMemo(() => {
    if (!chart || !palace) return null;
    
    const palaces = useZiWeiPalaces(chart);
    return palaces.getPalaceRelationships(palaceName);
  }, [chart, palace, palaceName]);
  
  // Get main stars
  const mainStars = useMemo(() => {
    if (!palace) return [];
    return palace.stars.filter(star => star.isMainStar);
  }, [palace]);
  
  // Get sihua stars
  const sihuaStars = useMemo(() => {
    if (!palace) return [];
    return palace.stars.filter(star => 
      star.sihuaTransformations && star.sihuaTransformations.length > 0
    );
  }, [palace]);
  
  return {
    palace,
    analysis,
    relationships,
    mainStars,
    sihuaStars,
    
    // Quick checks
    isEmpty: palace?.isEmpty || false,
    hasMainStar: mainStars.length > 0,
    hasSihua: sihuaStars.length > 0,
  };
}

/**
 * Analyze a single palace
 */
function analyzePalace(
  palace: PalaceData,
  palaceName: PalaceName,
  lifePalaceIndex: number,
  bodyPalaceIndex: number
): PalaceAnalysis {
  // Categorize stars
  const mainStars = palace.stars.filter(s => s.isMainStar);
  const auxiliaryStars = palace.stars.filter(s => s.category === '辅星');
  const maleficStars = palace.stars.filter(s => s.category === '煞星');
  const beneficStars = palace.stars.filter(s => s.category === '吉星');
  
  // Extract birth sihua
  const birthSihua = palace.sihua.filter(s => !s.isSelfTransformation);
  
  // Calculate relationships
  const isLifePalace = palace.position.index === lifePalaceIndex;
  const isBodyPalace = palace.position.index === bodyPalaceIndex;
  
  // Check if in triangle/square of life palace
  const lifeTriangleIndices = [
    (lifePalaceIndex + 4) % 12,
    (lifePalaceIndex + 8) % 12,
  ];
  const lifeSquareIndices = [
    lifePalaceIndex,
    (lifePalaceIndex + 6) % 12,
    ...lifeTriangleIndices,
  ];
  
  const isInTriangle = lifeTriangleIndices.includes(palace.position.index);
  const isInSquare = lifeSquareIndices.includes(palace.position.index);
  
  // Calculate strength
  let strengthScore = 0;
  
  // Main stars contribute most
  strengthScore += mainStars.length * 30;
  
  // Bright stars add strength
  const brightStars = palace.stars.filter(s => 
    s.brightness === '庙' || s.brightness === '旺'
  );
  strengthScore += brightStars.length * 10;
  
  // Beneficial sihua add strength
  const beneficialSihua = palace.stars.filter(s =>
    s.sihuaTransformations?.some(t => 
      t.type === '化禄' || t.type === '化权' || t.type === '化科'
    )
  );
  strengthScore += beneficialSihua.length * 15;
  
  // Malefic stars reduce strength
  strengthScore -= maleficStars.length * 5;
  
  // Determine strength category
  let strength: 'strong' | 'medium' | 'weak' = 'medium';
  if (strengthScore >= 60) {
    strength = 'strong';
  } else if (strengthScore < 30) {
    strength = 'weak';
  }
  
  return {
    palace,
    palaceName,
    
    // Basic info
    isEmpty: palace.isEmpty,
    hasMainStar: mainStars.length > 0,
    mainStarCount: mainStars.length,
    totalStarCount: palace.stars.length,
    
    // Star categories
    mainStars,
    auxiliaryStars,
    maleficStars,
    beneficStars,
    
    // Sihua analysis
    hasSihua: palace.sihua.length > 0,
    birthSihua,
    selfTransformations: palace.selfTransformations,
    
    // Relationships
    isLifePalace,
    isBodyPalace,
    isInTriangle,
    isInSquare,
    
    // Strength
    strength,
    strengthScore,
  };
}