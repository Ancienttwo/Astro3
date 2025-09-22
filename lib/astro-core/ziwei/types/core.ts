/**
 * Core type definitions for ZiWei Dou Shu calculations
 * 紫微斗数核心类型定义
 */

// ============= Basic Types =============

/**
 * Ten Heavenly Stems (天干)
 */
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

/**
 * Twelve Earthly Branches (地支)
 */
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

/**
 * Five Elements (五行)
 */
export type FiveElement = '木' | '火' | '土' | '金' | '水';

/**
 * Yin Yang (阴阳)
 */
export type YinYang = '阴' | '阳';

/**
 * Five Elements Bureau Names (五行局名称)
 */
export type FiveElementsBureauName = '水二局' | '木三局' | '金四局' | '土五局' | '火六局';

/**
 * Five Elements Bureau Codes (五行局代码)
 */
export type FiveElementsBureauCode = 'water_2' | 'wood_3' | 'metal_4' | 'earth_5' | 'fire_6';

/**
 * Five Elements Bureau (五行局)
 */
export type FiveElementsBureau = FiveElementsBureauName;

/**
 * Algorithm Type (算法类型)
 */
export type AlgorithmType = 'ziwei' | 'bazi' | 'qimen' | 'liuyao';

// Import StarName for local usage and re-export for single source of truth
import type { StarName } from '../constants/star-systems';
export type { StarName } from '../constants/star-systems';

// ============= Palace Types =============

/**
 * Twelve Palace Names (十二宫名称)
 */
export type PalaceName = 
  | '命宫'    // Life Palace
  | '兄弟'    // Siblings Palace
  | '夫妻'    // Marriage Palace
  | '子女'    // Children Palace
  | '财帛'    // Wealth Palace
  | '疾厄'    // Health Palace
  | '迁移'    // Travel Palace
  | '交友'    // Friends Palace
  | '官禄'    // Career Palace
  | '田宅'    // Property Palace
  | '福德'    // Fortune Palace
  | '父母';   // Parents Palace

/**
 * Palace Position (宫位信息)
 */
export interface PalacePosition {
  index: number;          // 0-11
  name: PalaceName;       // Palace name
  branch: EarthlyBranch;  // Earthly branch
  stem: HeavenlyStem;     // Heavenly stem (dynamic)
  element: FiveElement;   // Palace element
}

// ============= Star Types =============

/**
 * Star Category (星曜类别)
 */
export type StarCategory = 
  | '主星'    // Main stars
  | '辅星'    // Assistant stars
  | '煞星'    // Malefic stars
  | '小星'    // Minor stars
  | '桃花'    // Romance stars
  | '吉星'    // Benefic stars
  | '杂曜';   // Miscellaneous stars

/**
 * Star Brightness (星曜亮度)
 */
export type StarBrightness = '庙' | '旺' | '得' | '利' | '平' | '不' | '陷';

/**
 * Star Information (星曜信息)
 */
export interface Star {
  name: StarName;                         // Star name (using literal type)
  category: StarCategory;                 // Category
  element?: FiveElement;                  // Element attribute
  brightness?: StarBrightness;            // Brightness level
  isMainStar?: boolean;                  // Is main star
  transformationType?: SihuaType;        // Legacy: single sihua transformation
  sihuaTransformations?: SihuaTransformation[]; // Complete sihua transformations
}

// ============= Sihua Types =============

/**
 * Four Transformations Type (四化类型)
 */
export type SihuaType = 
  | '化禄'    // Wealth transformation
  | '化权'    // Power transformation
  | '化科'    // Fame transformation
  | '化忌';   // Obstacle transformation

/**
 * Self-transformation Type (自化类型)
 */
export type SelfTransformationType = 
  | 'xA' | 'xB' | 'xC' | 'xD'  // Outward (离心)
  | 'iA' | 'iB' | 'iC' | 'iD'; // Inward (向心)

/**
 * Sihua Information (四化信息)
 */
export interface SihuaInfo {
  type: SihuaType;
  star: string;
  sourceStem: HeavenlyStem;
  sourcePalace?: PalaceName;
  targetPalace?: PalaceName;
  isSelfTransformation?: boolean;
  selfTransformationType?: SelfTransformationType;
}

/**
 * Sihua Transformation (四化转换)
 * Used for detailed sihua calculations
 */
export interface SihuaTransformation {
  star: string;                       // Star name being transformed
  type: SihuaType;                    // Type of transformation
  source: 'birth' | 'palace' | 'self-outward' | 'self-inward' | 'flying';
  sourcePalaceIndex?: number;         // Source palace for flying transformations
  targetPalaceIndex?: number;         // Target palace for flying transformations
  code: string;                       // Transformation code (A, B, C, D, PA, PB, xA, iA, etc.)
  description?: string;               // Optional description
}

// ============= Chart Data Types =============

/**
 * Birth Information (出生信息)
 */
export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender?: 'male' | 'female';
  isLunar?: boolean;
  isLeapMonth?: boolean;
  timezone?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
}

/**
 * Lunar Date Information (农历信息)
 */
export interface LunarDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  isLeapMonth: boolean;
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  monthStem: HeavenlyStem;
  monthBranch: EarthlyBranch;
  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;
  hourStem: HeavenlyStem;
  hourBranch: EarthlyBranch;
}

/**
 * Palace Data (宫位数据)
 */
export interface PalaceData {
  position: PalacePosition;
  stars: Star[];
  sihua: SihuaInfo[];
  selfTransformations: SelfTransformationType[];
  majorStarCount: number;
  isEmpty: boolean;
}

/**
 * Complete Chart Data (完整命盘数据)
 */
export interface CompleteChart {
  birthInfo: BirthInfo;
  lunarDate: LunarDate;
  palaces: Map<PalaceName, PalaceData>;
  lifePalaceIndex: number;
  bodyPalaceIndex: number;
  globalSihua: SihuaInfo[];
  metadata: {
    calculatedAt: Date;
    version: string;
    calculationTime: number; // ms
  };
}

// ============= Calculation Options =============

/**
 * Calculation Options (计算选项)
 */
export interface CalculationOptions {
  includeMinorStars?: boolean;           // Include minor stars
  includeSihua?: boolean;                // Include sihua transformations in stars
  calculateTransformations?: boolean;    // Calculate sihua (legacy)
  calculateSelfTransformations?: boolean; // Calculate self-transformations
  calculateRelationships?: boolean;      // Calculate palace relationships
  useCache?: boolean;                    // Use caching
  parallelCalculation?: boolean;         // Use parallel calculation
  fiveElementsBureau?: FiveElementsBureau; // Five elements bureau for calculations
}

// ============= Error Types =============

/**
 * Error details type for calculation errors
 */
export interface CalculationErrorDetails {
  input?: unknown;
  step?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Calculation Error (计算错误)
 */
export class ZiWeiCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: CalculationErrorDetails
  ) {
    super(message);
    this.name = 'ZiWeiCalculationError';
  }
}

/**
 * Validation Error (验证错误)
 */
export class ZiWeiValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value?: unknown
  ) {
    super(message);
    this.name = 'ZiWeiValidationError';
  }
}
