// Legacy类型定义
// 为了向后兼容，保留旧架构的类型定义

export type RecordData = {
  id: string;
  name: string;
  gender?: '男' | '女';
  birthday: string;
  birthData: any;
  bazi?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  type: 'bazi' | 'ziwei';
  aiAnalyses?: {
    [key: string]: {
      type: string;
      result: string;
      createdAt: string;
      isPaid?: boolean;
    }
  };
  lastModified?: string;
  version?: number;
};

// ChartRecord类型（旧版本的定义）
export interface ChartRecord {
  id: string;
  user_id: string;
  name: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  birth_hour: number;
  gender: 'male' | 'female';
  chart_type: 'bazi' | 'ziwei';
  category?: 'friends' | 'family' | 'clients' | 'favorites' | 'others';
  yongshen_info?: {
    primaryYongShen: string;
    secondaryYongShen?: string;
    jiShen: string[];
    geLu: string;
    analysisDate: string;
    confidence: number;
    summary: string;
  };
  created_at: string;
  updated_at: string;
  ai_analyses?: Record<string, {
    result: string;
    analysis_type: string;
    createdAt: string;
    powered_by: string;
    type: string;
    character_count: number;
    source: string;
  }>;
} 