/**
 * 星盘渲染专用数据类型定义
 * Chart Render Data Types
 * 
 * @ai-context CHART_RENDER_TYPES
 * @preload 渲染组件优化数据格式
 * @algorithm-dependency ziwei-chart-render
 */

import type { ZiWeiHookChart } from './hook-format-types';

export interface RenderStarInfo {
  /** 星曜名称 */
  name: string;
  /** 亮度等级 */
  brightness?: '庙' | '旺' | '得' | '利' | '平' | '陷';
  /** 四化标记 */
  sihua?: '禄' | '权' | '科' | '忌';
  /** 星曜类型标记 */
  types: ('主星' | '辅星' | '煞星' | '小星' | '四化')[];
  /** 颜色标记 (用于UI显示) */
  color?: 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
  /** 是否高亮显示 */
  highlight?: boolean;
}

export interface RenderPalaceInfo {
  /** 地支名称 */
  branch: '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
  /** 地支索引 (0-11) */
  branchIndex: number;
  /** 环型索引（=branchIndex，子=0…亥=11） */
  ringIndex?: number;
  /** 天干 */
  stem: string;
  /** 宫位名称 */
  palaceName: '命宫' | '兄弟' | '夫妻' | '子女' | '财帛' | '疾厄' | '迁移' | '交友' | '官禄' | '田宅' | '福德' | '父母';
  /** 宫位中的星曜 */
  stars: RenderStarInfo[];
  /** 特殊宫位标记 */
  isLifePalace?: boolean;
  isBodyPalace?: boolean;
  isLaiyinPalace?: boolean;
  /** 大运信息 (简化) */
  majorPeriod?: {
    period: number;
    ageRange: string; // "5-14岁"
    yearRange: string; // "1995-2004年"
  };
  /** 流年年龄 (当前相关) */
  currentFleetingAge?: number;
  /** 宫位强弱 */
  strength: 'strong' | 'normal' | 'weak';
  /** 是否为空宫 */
  isEmpty: boolean;
}

export interface RenderCenterInfo {
  /** 性别 */
  gender: '男' | '女';
  /** 年干支 */
  yearGanZhi: string;
  /** 农历信息 */
  lunarDate: string;
  /** 命局信息 */
  bureau: {
    name: string; // "水二局"
    number: string; // "2"
  };
  /** 命主身主 */
  masters: {
    life: string; // "贪狼"
    body: string; // "太阴"
  };
}

export interface RenderSihuaLine {
  /** 起始宫位索引 */
  from: number;
  /** 目标宫位索引 */
  to: number;
  /** 四化类型 */
  type: '禄' | '权' | '科' | '忌';
  /** 涉及的星曜 */
  starName: string;
  /** 线条颜色 */
  color: string;
  /** 线条样式 */
  style: 'solid' | 'dashed' | 'dotted';
}

// =============================================================================
// Web渲染专用格式
// =============================================================================

export interface WebRenderData {
  /** 十二宫位数据 */
  palaces: RenderPalaceInfo[];
  /** 中宫信息 */
  centerInfo: RenderCenterInfo;
  /** 四化连线 */
  sihuaLines: RenderSihuaLine[];
  /** CSS类名映射 */
  cssClasses: {
    palace: string;
    star: Record<string, string>;
    sihua: Record<string, string>;
  };
  /** 网格布局信息 */
  layout: {
    gridSize: number;
    palaceSize: number;
    positions: Array<{ row: number; col: number }>;
  };
}

// =============================================================================
// Native渲染专用格式
// =============================================================================

export interface NativeRenderData {
  /** 十二宫位数据 */
  palaces: RenderPalaceInfo[];
  /** 中宫信息 */
  centerInfo: RenderCenterInfo;
  /** 四化连线 */
  sihuaLines: RenderSihuaLine[];
  /** 布局尺寸信息 */
  dimensions: {
    screenWidth: number;
    screenHeight: number;
    gridSize: number;
    palaceSize: number;
  };
  /** 颜色主题 */
  theme: {
    palace: {
      background: string;
      border: string;
      text: string;
    };
    stars: Record<string, { color: string; background?: string }>;
    sihua: Record<string, string>;
  };
  /** 手势交互配置 */
  interactions: {
    onPalacePress?: (palaceIndex: number, palace: RenderPalaceInfo) => void;
    onStarPress?: (star: RenderStarInfo, palace: RenderPalaceInfo) => void;
  };
}

// =============================================================================
// 通用渲染配置
// =============================================================================

export interface RenderOptions {
  /** 渲染平台 */
  platform: 'web' | 'native';
  /** 是否显示四化连线 */
  showSihuaLines?: boolean;
  /** 是否紧凑模式 */
  compact?: boolean;
  /** 高亮的宫位 */
  highlightPalaces?: number[];
  /** 高亮的星曜 */
  highlightStars?: string[];
  /** 主题模式 */
  theme?: 'light' | 'dark' | 'traditional';
  /** 字体大小 */
  fontSize?: 'small' | 'medium' | 'large';
  /** 是否显示亮度 */
  showBrightness?: boolean;
  /** 是否显示大运信息 */
  showMajorPeriods?: boolean;
  /** 当前年份 (用于流年计算) */
  currentYear?: number;
}

export interface ChartRenderInput {
  /** Hook格式的完整命盘数据 */
  hookChart: ZiWeiHookChart;
  /** 渲染选项 */
  options: RenderOptions;
  /** 当前年份 (用于计算流年) */
  currentYear?: number;
}

// =============================================================================
// 缓存和性能优化
// =============================================================================

export interface RenderDataCache {
  /** 缓存键 */
  cacheKey: string;
  /** Web渲染数据 */
  webData?: WebRenderData;
  /** Native渲染数据 */
  nativeData?: NativeRenderData;
  /** 生成时间 */
  generatedAt: string;
  /** 缓存有效期 */
  expiresAt: string;
  /** 原始Hook数据指纹 */
  hookDataFingerprint: string;
}
