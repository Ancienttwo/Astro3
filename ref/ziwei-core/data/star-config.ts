/**
 * ZiWei DouShu Star Configuration Data
 * 紫微斗数星曜配置数据 - 数据与逻辑分离
 * 
 * @ai-context STAR_CONFIGURATION_DATA
 * @preload star-brightness, star-attributes, sihua-mapping
 * @data-driven star properties, brightness levels, elemental attributes
 */

import { StarBrightness, StarType } from '../types/enhanced-types';

/**
 * 星曜基础属性配置
 */
export interface StarConfig {
  name: string;
  type: StarType;
  element: '木' | '火' | '土' | '金' | '水';
  gender: '阳' | '阴';
  description: string;
  category: string;
  brightness: Record<number, StarBrightness>; // 12宫位的亮度映射
}

/**
 * 紫微斗数主星配置 (14颗主星)
 */
export const MAIN_STARS_CONFIG: Record<string, StarConfig> = {
  '紫微': {
    name: '紫微',
    type: 'main',
    element: '土',
    gender: '阳',
    description: '北斗主星，帝王之星，主贵显尊荣',
    category: '北斗',
    brightness: {
      0: '庙', 1: '旺', 2: '得', 3: '利', 4: '平', 5: '不',
      6: '庙', 7: '旺', 8: '得', 9: '利', 10: '平', 11: '不'
    }
  },
  
  '天机': {
    name: '天机',
    type: 'main',
    element: '木',
    gender: '阳',
    description: '北斗善星，智谋之星，主机智变动',
    category: '北斗',
    brightness: {
      0: '平', 1: '庙', 2: '旺', 3: '得', 4: '利', 5: '不',
      6: '陷', 7: '平', 8: '庙', 9: '旺', 10: '得', 11: '利'
    }
  },
  
  '太阳': {
    name: '太阳',
    type: 'main',
    element: '火',
    gender: '阳',
    description: '中天主星，父亲之星，主光明正直',
    category: '中天',
    brightness: {
      0: '陷', 1: '不', 2: '平', 3: '利', 4: '得', 5: '旺',
      6: '庙', 7: '旺', 8: '得', 9: '利', 10: '平', 11: '不'
    }
  },
  
  '武曲': {
    name: '武曲',
    type: 'main',
    element: '金',
    gender: '阴',
    description: '北斗财星，财帛之星，主财富武功',
    category: '北斗',
    brightness: {
      0: '得', 1: '利', 2: '平', 3: '不', 4: '陷', 5: '庙',
      6: '旺', 7: '得', 8: '利', 9: '平', 10: '不', 11: '庙'
    }
  },
  
  '天同': {
    name: '天同',
    type: 'main',
    element: '水',
    gender: '阳',
    description: '南斗福星，福德之星，主和谐安乐',
    category: '南斗',
    brightness: {
      0: '利', 1: '平', 2: '不', 3: '陷', 4: '庙', 5: '旺',
      6: '得', 7: '利', 8: '平', 9: '不', 10: '庙', 11: '旺'
    }
  },
  
  '廉贞': {
    name: '廉贞',
    type: 'main',
    element: '火',
    gender: '阴',
    description: '北斗杀星，正直之星，主刑罚正义',
    category: '北斗',
    brightness: {
      0: '平', 1: '不', 2: '陷', 3: '庙', 4: '旺', 5: '得',
      6: '利', 7: '平', 8: '不', 9: '庙', 10: '旺', 11: '得'
    }
  },
  
  '天府': {
    name: '天府',
    type: 'main',
    element: '土',
    gender: '阳',
    description: '南斗主星，财库之星，主富贵安稳',
    category: '南斗',
    brightness: {
      0: '庙', 1: '庙', 2: '庙', 3: '庙', 4: '庙', 5: '庙',
      6: '庙', 7: '庙', 8: '庙', 9: '庙', 10: '庙', 11: '庙'
    }
  },
  
  '太阴': {
    name: '太阴',
    type: 'main',
    element: '水',
    gender: '阴',
    description: '中天主星，母亲之星，主阴柔包容',
    category: '中天',
    brightness: {
      0: '庙', 1: '旺', 2: '得', 3: '利', 4: '平', 5: '不',
      6: '陷', 7: '不', 8: '平', 9: '利', 10: '得', 11: '旺'
    }
  },
  
  '贪狼': {
    name: '贪狼',
    type: 'main',
    element: '水',
    gender: '阳',
    description: '北斗杀星，欲望之星，主才艺桃花',
    category: '北斗',
    brightness: {
      0: '旺', 1: '得', 2: '利', 3: '平', 4: '不', 5: '陷',
      6: '庙', 7: '旺', 8: '得', 9: '利', 10: '平', 11: '不'
    }
  },
  
  '巨门': {
    name: '巨门',
    type: 'main',
    element: '土',
    gender: '阴',
    description: '北斗暗星，口舌之星，主是非争执',
    category: '北斗',
    brightness: {
      0: '不', 1: '陷', 2: '庙', 3: '旺', 4: '得', 5: '利',
      6: '平', 7: '不', 8: '庙', 9: '旺', 10: '得', 11: '利'
    }
  },
  
  '天相': {
    name: '天相',
    type: 'main',
    element: '水',
    gender: '阳',
    description: '南斗星，印星，主权柄相助',
    category: '南斗',
    brightness: {
      0: '得', 1: '利', 2: '平', 3: '不', 4: '庙', 5: '旺',
      6: '得', 7: '利', 8: '平', 9: '不', 10: '庙', 11: '旺'
    }
  },
  
  '天梁': {
    name: '天梁',
    type: 'main',
    element: '土',
    gender: '阳',
    description: '南斗星，老人星，主寿考贵人',
    category: '南斗',
    brightness: {
      0: '平', 1: '不', 2: '庙', 3: '旺', 4: '得', 5: '利',
      6: '平', 7: '不', 8: '庙', 9: '旺', 10: '得', 11: '利'
    }
  },
  
  '七杀': {
    name: '七杀',
    type: 'main',
    element: '金',
    gender: '阳',
    description: '南斗杀星，将军之星，主肃杀威权',
    category: '南斗',
    brightness: {
      0: '庙', 1: '旺', 2: '得', 3: '利', 4: '平', 5: '不',
      6: '陷', 7: '庙', 8: '旺', 9: '得', 10: '利', 11: '平'
    }
  },
  
  '破军': {
    name: '破军',
    type: 'main',
    element: '水',
    gender: '阴',
    description: '北斗杀星，耗星，主破坏变动',
    category: '北斗',
    brightness: {
      0: '得', 1: '利', 2: '平', 3: '不', 4: '陷', 5: '庙',
      6: '旺', 7: '得', 8: '利', 9: '平', 10: '不', 11: '庙'
    }
  }
};

/**
 * 辅星配置
 */
export const AUXILIARY_STARS_CONFIG: Record<string, StarConfig> = {
  '左辅': {
    name: '左辅',
    type: 'auxiliary',
    element: '土',
    gender: '阳',
    description: '北斗助星，贵人之星，主辅助提携',
    category: '六吉',
    brightness: {
      0: '庙', 1: '庙', 2: '庙', 3: '庙', 4: '庙', 5: '庙',
      6: '庙', 7: '庙', 8: '庙', 9: '庙', 10: '庙', 11: '庙'
    }
  },
  
  '右弼': {
    name: '右弼',
    type: 'auxiliary',
    element: '水',
    gender: '阴',
    description: '北斗助星，贵人之星，主辅助提携',
    category: '六吉',
    brightness: {
      0: '庙', 1: '庙', 2: '庙', 3: '庙', 4: '庙', 5: '庙',
      6: '庙', 7: '庙', 8: '庙', 9: '庙', 10: '庙', 11: '庙'
    }
  },
  
  '文昌': {
    name: '文昌',
    type: 'auxiliary',
    element: '金',
    gender: '阳',
    description: '北斗文星，科名之星，主文章学问',
    category: '六吉',
    brightness: {
      0: '庙', 1: '旺', 2: '得', 3: '利', 4: '平', 5: '不',
      6: '庙', 7: '旺', 8: '得', 9: '利', 10: '平', 11: '不'
    }
  },
  
  '文曲': {
    name: '文曲',
    type: 'auxiliary',
    element: '水',
    gender: '阴',
    description: '北斗文星，才艺之星，主文艺技能',
    category: '六吉',
    brightness: {
      0: '平', 1: '不', 2: '庙', 3: '旺', 4: '得', 5: '利',
      6: '平', 7: '不', 8: '庙', 9: '旺', 10: '得', 11: '利'
    }
  },
  
  '禄存': {
    name: '禄存',
    type: 'auxiliary',
    element: '土',
    gender: '阳',
    description: '北斗财星，财禄之星，主财富储蓄',
    category: '六吉',
    brightness: {
      0: '庙', 1: '庙', 2: '庙', 3: '庙', 4: '庙', 5: '庙',
      6: '庙', 7: '庙', 8: '庙', 9: '庙', 10: '庙', 11: '庙'
    }
  },
  
  '天马': {
    name: '天马',
    type: 'auxiliary',
    element: '火',
    gender: '阳',
    description: '驿马星，动星，主变动奔波',
    category: '六吉',
    brightness: {
      0: '庙', 1: '旺', 2: '得', 3: '利', 4: '平', 5: '不',
      6: '庙', 7: '旺', 8: '得', 9: '利', 10: '平', 11: '不'
    }
  },
  
  '擎羊': {
    name: '擎羊',
    type: 'auxiliary',
    element: '金',
    gender: '阳',
    description: '北斗杀星，刑星，主刑伤争斗',
    category: '六煞',
    brightness: {
      0: '陷', 1: '不', 2: '平', 3: '利', 4: '得', 5: '旺',
      6: '陷', 7: '不', 8: '平', 9: '利', 10: '得', 11: '旺'
    }
  },
  
  '陀罗': {
    name: '陀罗',
    type: 'auxiliary',
    element: '金',
    gender: '阴',
    description: '北斗杀星，困星，主拖延阻滞',
    category: '六煞',
    brightness: {
      0: '旺', 1: '得', 2: '利', 3: '平', 4: '不', 5: '陷',
      6: '旺', 7: '得', 8: '利', 9: '平', 10: '不', 11: '陷'
    }
  },
  
  '火星': {
    name: '火星',
    type: 'auxiliary',
    element: '火',
    gender: '阳',
    description: '南斗杀星，急星，主急躁冲动',
    category: '六煞',
    brightness: {
      0: '得', 1: '庙', 2: '旺', 3: '得', 4: '利', 5: '平',
      6: '不', 7: '陷', 8: '不', 9: '平', 10: '利', 11: '得'
    }
  },
  
  '铃星': {
    name: '铃星',
    type: 'auxiliary',
    element: '火',
    gender: '阴',
    description: '南斗杀星，暗火星，主阴险暗害',
    category: '六煞',
    brightness: {
      0: '不', 1: '陷', 2: '不', 3: '平', 4: '利', 5: '得',
      6: '庙', 7: '旺', 8: '得', 9: '庙', 10: '旺', 11: '得'
    }
  }
};

/**
 * 小星配置 (部分重要小星)
 */
export const MINOR_STARS_CONFIG: Record<string, StarConfig> = {
  '天魁': {
    name: '天魁',
    type: 'minor',
    element: '火',
    gender: '阳',
    description: '贵人星，主白天贵人，男性长辈',
    category: '贵人',
    brightness: {
      0: '平', 1: '平', 2: '平', 3: '平', 4: '平', 5: '平',
      6: '平', 7: '平', 8: '平', 9: '平', 10: '平', 11: '平'
    }
  },
  
  '天钺': {
    name: '天钺',
    type: 'minor',
    element: '火',
    gender: '阴',
    description: '贵人星，主夜晚贵人，女性长辈',
    category: '贵人',
    brightness: {
      0: '平', 1: '平', 2: '平', 3: '平', 4: '平', 5: '平',
      6: '平', 7: '平', 8: '平', 9: '平', 10: '平', 11: '平'
    }
  },
  
  '天空': {
    name: '天空',
    type: 'minor',
    element: '火',
    gender: '阳',
    description: '空亡星，主破耗虚空',
    category: '空曜',
    brightness: {
      0: '陷', 1: '陷', 2: '陷', 3: '陷', 4: '陷', 5: '陷',
      6: '陷', 7: '陷', 8: '陷', 9: '陷', 10: '陷', 11: '陷'
    }
  },
  
  '地劫': {
    name: '地劫',
    type: 'minor',
    element: '火',
    gender: '阴',
    description: '劫煞星，主劫夺破财',
    category: '空曜',
    brightness: {
      0: '陷', 1: '陷', 2: '陷', 3: '陷', 4: '陷', 5: '陷',
      6: '陷', 7: '陷', 8: '陷', 9: '陷', 10: '陷', 11: '陷'
    }
  },
  
  '天姚': {
    name: '天姚',
    type: 'minor',
    element: '水',
    gender: '阴',
    description: '桃花星，主感情桃花',
    category: '桃花',
    brightness: {
      0: '平', 1: '平', 2: '平', 3: '平', 4: '平', 5: '平',
      6: '平', 7: '平', 8: '平', 9: '平', 10: '平', 11: '平'
    }
  },
  
  '红鸾': {
    name: '红鸾',
    type: 'minor',
    element: '水',
    gender: '阴',
    description: '桃花星，主婚姻感情',
    category: '桃花',
    brightness: {
      0: '平', 1: '平', 2: '平', 3: '平', 4: '平', 5: '平',
      6: '平', 7: '平', 8: '平', 9: '平', 10: '平', 11: '平'
    }
  },
  
  '天喜': {
    name: '天喜',
    type: 'minor',
    element: '水',
    gender: '阳',
    description: '喜庆星，主喜事临门',
    category: '桃花',
    brightness: {
      0: '平', 1: '平', 2: '平', 3: '平', 4: '平', 5: '平',
      6: '平', 7: '平', 8: '平', 9: '平', 10: '平', 11: '平'
    }
  }
};

/**
 * 合并所有星曜配置
 */
export const ALL_STARS_CONFIG = {
  ...MAIN_STARS_CONFIG,
  ...AUXILIARY_STARS_CONFIG,
  ...MINOR_STARS_CONFIG
};

/**
 * 星曜类型映射（自动生成）
 */
export const STAR_TYPE_MAPPING: Record<string, StarType> = Object.keys(ALL_STARS_CONFIG).reduce((acc, starName) => {
  acc[starName] = ALL_STARS_CONFIG[starName].type;
  return acc;
}, {} as Record<string, StarType>);

/**
 * 星曜亮度映射（自动生成）
 */
export const STAR_BRIGHTNESS_MAPPING: Record<string, Record<number, StarBrightness>> = Object.keys(ALL_STARS_CONFIG).reduce((acc, starName) => {
  acc[starName] = ALL_STARS_CONFIG[starName].brightness;
  return acc;
}, {} as Record<string, Record<number, StarBrightness>>);

/**
 * 根据星曜名称获取配置
 */
export function getStarConfig(starName: string): StarConfig | undefined {
  return ALL_STARS_CONFIG[starName];
}

/**
 * 获取某个类型的所有星曜
 */
export function getStarsByType(type: StarType): StarConfig[] {
  return Object.values(ALL_STARS_CONFIG).filter(star => star.type === type);
}

/**
 * 获取某个类别的所有星曜
 */
export function getStarsByCategory(category: string): StarConfig[] {
  return Object.values(ALL_STARS_CONFIG).filter(star => star.category === category);
}

/**
 * 验证星曜名称是否存在
 */
export function isValidStarName(starName: string): boolean {
  return starName in ALL_STARS_CONFIG;
}

/**
 * 获取星曜统计信息
 */
export function getStarStatistics() {
  const allStars = Object.values(ALL_STARS_CONFIG);
  
  return {
    total: allStars.length,
    byType: {
      main: allStars.filter(s => s.type === 'main').length,
      auxiliary: allStars.filter(s => s.type === 'auxiliary').length,
      minor: allStars.filter(s => s.type === 'minor').length
    },
    byElement: {
      木: allStars.filter(s => s.element === '木').length,
      火: allStars.filter(s => s.element === '火').length,
      土: allStars.filter(s => s.element === '土').length,
      金: allStars.filter(s => s.element === '金').length,
      水: allStars.filter(s => s.element === '水').length
    },
    byGender: {
      阳: allStars.filter(s => s.gender === '阳').length,
      阴: allStars.filter(s => s.gender === '阴').length
    }
  };
}