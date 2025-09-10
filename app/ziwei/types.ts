import { StarName, StarBrightness, StarType } from '@/lib/zodiac/stars';
import { HeavenlyStem } from '@/lib/zodiac/stems';
import { EarthlyBranch } from '@/lib/zodiac/branches';
import { FiveElementsBureau } from '@/lib/zodiac/five-elements-bureau';

export interface BirthData {
  username: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: 'male' | 'female' | '';
  category: string;
}

export interface StarData {
  name: StarName;
  brightness: StarBrightness;
  type: StarType;
  sihua?: 'A' | 'B' | 'C' | 'D';
  palaceHua?: string[];
  xiangXinSihua?: string; // 向心自化
  liXinSihua?: string; // 离心自化
}

export interface PalaceData {
  id: number;
  name: string;
  branch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
  isLaiYinPalace?: boolean;
  isShenGong?: boolean;
  decade?: string;
  decadeIndex?: number;
  fiveElementsBureau?: FiveElementsBureau;
  yearlyLuck?: { year: number; age: number; };
  yearlyName?: string;
  stars?: StarData[];
}

export interface SihuaInfo {
  lu: string;
  quan: string;
  ke: string;
  ji: string;
}

export interface ZiweiResult {
  palaces: PalaceData[];
  basePalaces: PalaceData[];
  decadePalaces: PalaceData[];
  lunarDate: string;
  fiveElementsBureau?: FiveElementsBureau;
  mingZhu: string;
  shenZhu: string;
  gender: 'male' | 'female';
  selectedIndex: number | null;
  yearGan: HeavenlyStem;
  sihuaInfo?: SihuaInfo | null;
}

export interface StarsByType {
  mainStars: StarData[];
  auxiliaryStars: StarData[];
  maleficStars: StarData[];
  peachBlossomStars: StarData[];
}

export interface AnalysisData {
  description: string;
  condition: string;
  characteristics: string;
  person?: string;
  matter?: string;
  material?: string;
}

export interface DestinyArrowData {
  mingGong?: PalaceData;
  qianYi?: PalaceData;
  caiPo?: PalaceData;
  guanLu?: PalaceData;
  description: string;
}

// 分析类型枚举
export enum AnalysisType {
  MING_GONG = 'mingGong',
  SHEN_GONG = 'shenGong',
  LAI_YIN = 'laiYin',
  SIHUA = 'sihua',
  DESTINY_ARROW = 'destinyArrow'
}

// 科普知识接口
export interface ScienceContent {
  title: string;
  sections: {
    title: string;
    content: string;
  }[];
}

// 分析状态接口
export interface AnalysisStatus {
  isLoading: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  elapsedTime: number;
  formattedElapsedTime: string;
  error: string | null;
}

// 组件Props接口
export interface PalaceAnalysisProps {
  palace: PalaceData;
  analysisType: AnalysisType;
  showScience?: boolean;
  className?: string;
}

export interface StarGroupProps {
  stars: StarData[];
  title: string;
  emptyText?: string;
  className?: string;
}

// 导出常量
export const CATEGORIES = [
  { key: 'friends', label: '朋友', icon: '👥' },
  { key: 'family', label: '家人', icon: '❤️' },
  { key: 'clients', label: '客户', icon: '💼' },
  { key: 'favorites', label: '最爱', icon: '⭐' },
  { key: 'others', label: '其他', icon: '📁' },
] as const;

export const PALACE_NAMES = [
  "命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄",
  "迁移", "交友", "官禄", "田宅", "福德", "父母"
] as const;

export const DECADE_PALACE_NAMES = [
  "大命", "大兄", "大夫", "大子", "大财", "大疾",
  "大迁", "大友", "大官", "大田", "大福", "大父"
] as const;

export const YEARLY_PALACE_NAMES = [
  "流命", "流兄", "流夫", "流子", "流财", "流疾",
  "流迁", "流友", "流官", "流田", "流福", "流父"
] as const; 