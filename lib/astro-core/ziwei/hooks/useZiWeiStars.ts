/**
 * useZiWeiStars Hook - Star-specific hooks and utilities
 * 紫微星曜钩子 - 星曜相关的钩子和工具
 */

import { useMemo, useCallback } from 'react';
import type {
  CompleteChart,
  Star,
  PalaceData,
  SihuaTransformation,
  StarBrightness,
} from '../types/core';

/**
 * Star analysis result
 */
export interface StarAnalysis {
  star: Star;
  palaceName: string;
  palaceIndex: number;
  
  // Properties
  isMainStar: boolean;
  category: string;
  brightness: StarBrightness | undefined;
  element: string | undefined;
  
  // Sihua
  hasSihua: boolean;
  sihuaTypes: string[];
  isBirthSihua: boolean;
  isSelfTransformation: boolean;
  
  // Relationships
  companionStars: Star[];
  conflictingStars: Star[];
  
  // Influence
  influenceScore: number;
  influenceLevel: 'high' | 'medium' | 'low';
}

/**
 * Star distribution across chart
 */
export interface StarDistribution {
  mainStars: Map<string, string[]>;        // Star name -> Palace names
  auxiliaryStars: Map<string, string[]>;
  maleficStars: Map<string, string[]>;
  sihuaStars: Map<string, string[]>;
}

/**
 * Hook for analyzing all stars in chart
 */
export function useZiWeiStars(chart: CompleteChart | null) {
  // Get all stars with their palace locations
  const allStarsWithLocation = useMemo(() => {
    if (!chart) return [];
    
    const starsWithLocation: Array<{
      star: Star;
      palaceName: string;
      palaceIndex: number;
    }> = [];
    
    chart.palaces.forEach((palace, palaceName) => {
      palace.stars.forEach(star => {
        starsWithLocation.push({
          star,
          palaceName,
          palaceIndex: palace.position.index,
        });
      });
    });
    
    return starsWithLocation;
  }, [chart]);
  
  // Get star distribution
  const starDistribution = useMemo((): StarDistribution => {
    if (!chart) {
      return {
        mainStars: new Map(),
        auxiliaryStars: new Map(),
        maleficStars: new Map(),
        sihuaStars: new Map(),
      };
    }
    
    const distribution: StarDistribution = {
      mainStars: new Map(),
      auxiliaryStars: new Map(),
      maleficStars: new Map(),
      sihuaStars: new Map(),
    };
    
    chart.palaces.forEach((palace, palaceName) => {
      palace.stars.forEach(star => {
        // Main stars
        if (star.isMainStar) {
          if (!distribution.mainStars.has(star.name)) {
            distribution.mainStars.set(star.name, []);
          }
          distribution.mainStars.get(star.name)!.push(palaceName);
        }
        
        // Auxiliary stars
        if (star.category === '辅星') {
          if (!distribution.auxiliaryStars.has(star.name)) {
            distribution.auxiliaryStars.set(star.name, []);
          }
          distribution.auxiliaryStars.get(star.name)!.push(palaceName);
        }
        
        // Malefic stars
        if (star.category === '煞星') {
          if (!distribution.maleficStars.has(star.name)) {
            distribution.maleficStars.set(star.name, []);
          }
          distribution.maleficStars.get(star.name)!.push(palaceName);
        }
        
        // Sihua stars
        if (star.sihuaTransformations && star.sihuaTransformations.length > 0) {
          if (!distribution.sihuaStars.has(star.name)) {
            distribution.sihuaStars.set(star.name, []);
          }
          distribution.sihuaStars.get(star.name)!.push(palaceName);
        }
      });
    });
    
    return distribution;
  }, [chart]);
  
  // Find star by name
  const findStar = useCallback(
    (starName: string): Array<{ star: Star; palaceName: string; palace: PalaceData }> => {
      if (!chart) return [];
      
      const results: Array<{ star: Star; palaceName: string; palace: PalaceData }> = [];
      
      chart.palaces.forEach((palace, palaceName) => {
        const star = palace.stars.find(s => s.name === starName);
        if (star) {
          results.push({ star, palaceName, palace });
        }
      });
      
      return results;
    },
    [chart]
  );
  
  // Get all main stars
  const mainStars = useMemo(() => {
    return allStarsWithLocation.filter(item => item.star.isMainStar);
  }, [allStarsWithLocation]);
  
  // Get all stars with sihua
  const sihuaStars = useMemo(() => {
    return allStarsWithLocation.filter(item => 
      item.star.sihuaTransformations && item.star.sihuaTransformations.length > 0
    );
  }, [allStarsWithLocation]);
  
  // Get all bright stars
  const brightStars = useMemo(() => {
    return allStarsWithLocation.filter(item =>
      item.star.brightness === '庙' || item.star.brightness === '旺'
    );
  }, [allStarsWithLocation]);
  
  // Get all dim stars
  const dimStars = useMemo(() => {
    return allStarsWithLocation.filter(item =>
      item.star.brightness === '陷' || item.star.brightness === '不'
    );
  }, [allStarsWithLocation]);
  
  // Analyze specific star
  const analyzeStar = useCallback(
    (starName: string, palaceName: string): StarAnalysis | null => {
      if (!chart) return null;
      
      const palace = chart.palaces.get(palaceName as any);
      if (!palace) return null;
      
      const star = palace.stars.find(s => s.name === starName);
      if (!star) return null;
      
      // Find companion stars in same palace
      const companionStars = palace.stars.filter(s => 
        s.name !== starName && isCompanionStar(star.name, s.name)
      );
      
      // Find conflicting stars in same palace
      const conflictingStars = palace.stars.filter(s =>
        s.name !== starName && isConflictingStar(star.name, s.name)
      );
      
      // Check sihua properties
      const hasSihua = star.sihuaTransformations !== undefined && 
                      star.sihuaTransformations.length > 0;
      const sihuaTypes = star.sihuaTransformations?.map(t => t.type) || [];
      const isBirthSihua = star.sihuaTransformations?.some(t => t.source === 'birth') || false;
      const isSelfTransformation = star.sihuaTransformations?.some(t => 
        t.source === 'self-outward' || t.source === 'self-inward'
      ) || false;
      
      // Calculate influence score
      let influenceScore = 0;
      
      if (star.isMainStar) influenceScore += 50;
      if (star.brightness === '庙') influenceScore += 20;
      if (star.brightness === '旺') influenceScore += 15;
      if (star.brightness === '陷') influenceScore -= 10;
      
      if (hasSihua) {
        if (sihuaTypes.includes('化禄')) influenceScore += 15;
        if (sihuaTypes.includes('化权')) influenceScore += 12;
        if (sihuaTypes.includes('化科')) influenceScore += 10;
        if (sihuaTypes.includes('化忌')) influenceScore -= 5;
      }
      
      // Determine influence level
      let influenceLevel: 'high' | 'medium' | 'low' = 'medium';
      if (influenceScore >= 60) influenceLevel = 'high';
      else if (influenceScore < 30) influenceLevel = 'low';
      
      return {
        star,
        palaceName,
        palaceIndex: palace.position.index,
        
        // Properties
        isMainStar: star.isMainStar || false,
        category: star.category,
        brightness: star.brightness,
        element: star.element,
        
        // Sihua
        hasSihua,
        sihuaTypes,
        isBirthSihua,
        isSelfTransformation,
        
        // Relationships
        companionStars,
        conflictingStars,
        
        // Influence
        influenceScore,
        influenceLevel,
      };
    },
    [chart]
  );
  
  // Get star combinations
  const getStarCombinations = useMemo(() => {
    if (!chart) return [];
    
    const combinations: Array<{
      type: string;
      stars: string[];
      palaceName: string;
      description: string;
    }> = [];
    
    chart.palaces.forEach((palace, palaceName) => {
      const starNames = palace.stars.map(s => s.name);
      
      // Check for ZiWei + TianFu combination
      if (starNames.includes('紫微') && starNames.includes('天府')) {
        combinations.push({
          type: '紫府同宫',
          stars: ['紫微', '天府'],
          palaceName,
          description: '帝王星与财库星同宫，富贵双全',
        });
      }
      
      // Check for Sun + Moon combination
      if (starNames.includes('太阳') && starNames.includes('太阴')) {
        combinations.push({
          type: '日月同宫',
          stars: ['太阳', '太阴'],
          palaceName,
          description: '阴阳调和，文武兼备',
        });
      }
      
      // Check for WuQu + TanLang combination
      if (starNames.includes('武曲') && starNames.includes('贪狼')) {
        combinations.push({
          type: '武贪同宫',
          stars: ['武曲', '贪狼'],
          palaceName,
          description: '财星遇桃花，先贫后富',
        });
      }
      
      // Add more combinations as needed
    });
    
    return combinations;
  }, [chart]);
  
  return {
    // All stars
    allStarsWithLocation,
    starDistribution,
    
    // Categories
    mainStars,
    sihuaStars,
    brightStars,
    dimStars,
    
    // Methods
    findStar,
    analyzeStar,
    
    // Combinations
    getStarCombinations,
  };
}

/**
 * Hook for a specific star
 */
export function useZiWeiStar(
  chart: CompleteChart | null,
  starName: string
) {
  // Find star locations
  const starLocations = useMemo(() => {
    if (!chart) return [];
    
    const locations: Array<{
      palace: PalaceData;
      palaceName: string;
      star: Star;
    }> = [];
    
    chart.palaces.forEach((palace, palaceName) => {
      const star = palace.stars.find(s => s.name === starName);
      if (star) {
        locations.push({ palace, palaceName, star });
      }
    });
    
    return locations;
  }, [chart, starName]);
  
  // Get primary location (usually there's only one)
  const primaryLocation = starLocations[0] || null;
  
  // Get star analysis
  const analysis = useMemo(() => {
    if (!primaryLocation) return null;
    
    const stars = useZiWeiStars(chart);
    return stars.analyzeStar(starName, primaryLocation.palaceName);
  }, [chart, starName, primaryLocation]);
  
  // Get sihua transformations
  const sihuaTransformations = useMemo(() => {
    if (!primaryLocation) return [];
    return primaryLocation.star.sihuaTransformations || [];
  }, [primaryLocation]);
  
  return {
    exists: starLocations.length > 0,
    locations: starLocations,
    primaryLocation,
    analysis,
    sihuaTransformations,
    
    // Quick properties
    brightness: primaryLocation?.star.brightness,
    isMainStar: primaryLocation?.star.isMainStar || false,
    category: primaryLocation?.star.category,
  };
}

/**
 * Check if two stars are companions
 */
function isCompanionStar(star1: string, star2: string): boolean {
  const companionPairs = [
    ['紫微', '天府'],
    ['太阳', '太阴'],
    ['武曲', '贪狼'],
    ['天机', '太阴'],
    ['廉贞', '贪狼'],
    ['天同', '太阴'],
    ['文昌', '文曲'],
    ['左辅', '右弼'],
    ['天魁', '天钺'],
  ];
  
  return companionPairs.some(pair =>
    (pair.includes(star1) && pair.includes(star2))
  );
}

/**
 * Check if two stars conflict
 */
function isConflictingStar(star1: string, star2: string): boolean {
  const conflictPairs = [
    ['太阳', '巨门'],
    ['廉贞', '破军'],
    ['武曲', '破军'],
    ['火星', '铃星'],
    ['擎羊', '陀罗'],
  ];
  
  return conflictPairs.some(pair =>
    (pair.includes(star1) && pair.includes(star2))
  );
}