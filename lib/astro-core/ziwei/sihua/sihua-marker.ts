/**
 * 四化星曜标记系统
 * SiHua Star Marking System
 * 
 * @ai-context SIHUA_MARKER_SYSTEM
 * @preload SIHUA_TYPES, AlgorithmRegistry
 * @algorithm-dependency ziwei-sihua
 */

import { SIHUA_TYPES, type HookStarInfo } from '../types/hook-format-types';

// 四化类型枚举
export enum SihuaType {
  LU = 'lu',     // 禄
  QUAN = 'quan', // 权
  KE = 'ke',     // 科
  JI = 'ji'      // 忌
}

// 四化来源
export enum SihuaSource {
  BIRTH_YEAR = 'birth',  // 生年四化
  SELF = 'self',         // 自化
  FLYING = 'flying'      // 飞星四化
}

// 四化标记接口
export interface SihuaMarker {
  type: SihuaType;
  source: SihuaSource;
  code: string; // iA, iB, iC, iD, xA, xB, xC, xD
}

// 天干四化对照表 (生年四化)
const BIRTH_YEAR_SIHUA: Record<string, Record<SihuaType, string>> = {
  '甲': {
    [SihuaType.LU]: '廉贞',
    [SihuaType.QUAN]: '破军',
    [SihuaType.KE]: '武曲',
    [SihuaType.JI]: '太阳'
  },
  '乙': {
    [SihuaType.LU]: '天机',
    [SihuaType.QUAN]: '天梁',
    [SihuaType.KE]: '紫微',
    [SihuaType.JI]: '太阴'
  },
  '丙': {
    [SihuaType.LU]: '天同',
    [SihuaType.QUAN]: '天机',
    [SihuaType.KE]: '文昌',
    [SihuaType.JI]: '廉贞'
  },
  '丁': {
    [SihuaType.LU]: '太阴',
    [SihuaType.QUAN]: '天同',
    [SihuaType.KE]: '天机',
    [SihuaType.JI]: '巨门'
  },
  '戊': {
    [SihuaType.LU]: '贪狼',
    [SihuaType.QUAN]: '太阴',
    [SihuaType.KE]: '右弼',
    [SihuaType.JI]: '天机'
  },
  '己': {
    [SihuaType.LU]: '武曲',
    [SihuaType.QUAN]: '贪狼',
    [SihuaType.KE]: '天梁',
    [SihuaType.JI]: '文曲'
  },
  '庚': {
    [SihuaType.LU]: '太阳',
    [SihuaType.QUAN]: '武曲',
    [SihuaType.KE]: '太阴',
    [SihuaType.JI]: '天同'
  },
  '辛': {
    [SihuaType.LU]: '巨门',
    [SihuaType.QUAN]: '太阳',
    [SihuaType.KE]: '文曲',
    [SihuaType.JI]: '文昌'
  },
  '壬': {
    [SihuaType.LU]: '天梁',
    [SihuaType.QUAN]: '紫微',
    [SihuaType.KE]: '左辅',
    [SihuaType.JI]: '武曲'
  },
  '癸': {
    [SihuaType.LU]: '破军',
    [SihuaType.QUAN]: '巨门',
    [SihuaType.KE]: '太阴',
    [SihuaType.JI]: '贪狼'
  }
};

/**
 * 获取生年四化星曜
 */
export function getBirthYearSihua(yearStem: string): Record<SihuaType, string> {
  return BIRTH_YEAR_SIHUA[yearStem] || {
    [SihuaType.LU]: '',
    [SihuaType.QUAN]: '',
    [SihuaType.KE]: '',
    [SihuaType.JI]: ''
  };
}

/**
 * 生成四化标记代码
 */
export function generateSihuaCode(type: SihuaType, source: SihuaSource): string {
  const typeMap = {
    [SihuaType.LU]: 'A',
    [SihuaType.QUAN]: 'B',
    [SihuaType.KE]: 'C',
    [SihuaType.JI]: 'D'
  };
  
  const sourcePrefix = {
    [SihuaSource.BIRTH_YEAR]: 'i',
    [SihuaSource.SELF]: 'x',
    [SihuaSource.FLYING]: 'f'
  };
  
  return sourcePrefix[source] + typeMap[type];
}

/**
 * 为星曜添加四化标记
 */
export function markStarWithSihua(
  starName: string,
  brightness: string,
  yearStem: string,
  selfSihuaData?: { type: SihuaType; condition: string }
): HookStarInfo {
  const types: string[] = ['D']; // 默认主星标记
  
  // 检查生年四化
  const birthSihua = getBirthYearSihua(yearStem);
  Object.entries(birthSihua).forEach(([sihuaType, sihuaStar]) => {
    if (sihuaStar === starName) {
      const code = generateSihuaCode(sihuaType as SihuaType, SihuaSource.BIRTH_YEAR);
      types.push(code);
    }
  });
  
  // 检查自化
  if (selfSihuaData) {
    const selfCode = generateSihuaCode(selfSihuaData.type, SihuaSource.SELF);
    types.push(selfCode);
  }
  
  return {
    name: starName,
    brightness: brightness,
    type: types.length > 1 ? types : undefined
  };
}

/**
 * 批量处理星曜四化标记
 */
export function markStarsWithSihua(
  stars: Array<{ name: string; brightness: string }>,
  yearStem: string,
  selfSihuaMap?: Map<string, { type: SihuaType; condition: string }>
): HookStarInfo[] {
  return stars.map(star => 
    markStarWithSihua(
      star.name,
      star.brightness,
      yearStem,
      selfSihuaMap?.get(star.name)
    )
  );
}

/**
 * 验证四化标记
 */
export function validateSihuaMarkers(stars: HookStarInfo[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const sihuaCount = { iA: 0, iB: 0, iC: 0, iD: 0 };
  
  stars.forEach(star => {
    if (star.type) {
      star.type.forEach(type => {
        if (type.startsWith('i') && type.length === 2) {
          sihuaCount[type as keyof typeof sihuaCount]++;
        }
      });
    }
  });
  
  // 检查生年四化是否完整
  Object.entries(sihuaCount).forEach(([type, count]) => {
    if (count === 0) {
      errors.push(`缺少生年四化: ${type}`);
    } else if (count > 1) {
      errors.push(`生年四化重复: ${type}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 解析四化标记代码
 */
export function parseSihuaCode(code: string): SihuaMarker | null {
  if (!code || code.length !== 2) return null;
  
  const sourceChar = code[0];
  const typeChar = code[1];
  
  const sourceMap: Record<string, SihuaSource> = {
    'i': SihuaSource.BIRTH_YEAR,
    'x': SihuaSource.SELF,
    'f': SihuaSource.FLYING
  };
  
  const typeMap: Record<string, SihuaType> = {
    'A': SihuaType.LU,
    'B': SihuaType.QUAN,
    'C': SihuaType.KE,
    'D': SihuaType.JI
  };
  
  const source = sourceMap[sourceChar];
  const type = typeMap[typeChar];
  
  if (!source || !type) return null;
  
  return { type, source, code };
}

/**
 * 获取四化描述
 */
export function getSihuaDescription(marker: SihuaMarker): string {
  const descriptions = {
    [SihuaType.LU]: '禄 - 财禄、享受',
    [SihuaType.QUAN]: '权 - 权力、管理',
    [SihuaType.KE]: '科 - 名誉、文雅',
    [SihuaType.JI]: '忌 - 阻碍、忌讳'
  };
  
  const sourceDesc = {
    [SihuaSource.BIRTH_YEAR]: '生年',
    [SihuaSource.SELF]: '自化',
    [SihuaSource.FLYING]: '飞星'
  };
  
  return `${sourceDesc[marker.source]}${descriptions[marker.type]}`;
}