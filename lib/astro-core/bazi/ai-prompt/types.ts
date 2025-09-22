/**
 * AI Prompt 数据接口类型定义
 * 为AI模型提供结构化的八字分析数据
 */

// Temporary imports since modules don't exist
// import { BaZiChart } from '../base/types';
import { BatchShenShaResult } from '../shensha/types';
// import { WuxingAnalysisResult } from '../wuxing-scoring/types';

// Temporary type definitions
interface BaZiChart {
  fourPillars: any;
  gender: 'male' | 'female';
  solarDate: any;
  timezone: string;
}

interface WuxingAnalysisResult {
  scores?: Record<string, number>;
  analysis?: any;
  recommendations?: any[];
  elementScores?: Record<string, number>;
  favorableElements?: string[];
  unfavorableElements?: string[];
  dayMasterStrength?: {
    score: number;
    level: string;
    factors: string[];
  };
  seasonalInfluence?: any;
  yongshenAnalysis?: any;
  pattern?: {
    type: string;
    confidence: number;
    description: string;
    elements: any;
  };
}

/**
 * AI提示词数据格式选项
 */
export interface AIPromptOptions {
  /** 语言设置 */
  language: 'zh-CN' | 'zh-TW' | 'en-US';
  /** 详细程度 */
  detailLevel: 'basic' | 'detailed' | 'comprehensive';
  /** 包含的分析类型 */
  includeAnalysis: {
    shensha: boolean;
    wuxing: boolean;
    dayun: boolean;
    shishen: boolean;
    personality: boolean;
    career: boolean;
    health: boolean;
    relationship: boolean;
    // 🆕 能力评估分析
    capabilityAssessment: boolean;
  };
  /** 输出格式 */
  format: 'json' | 'markdown' | 'structured-text' | 'prompt-template';
  /** 自定义提示词模板 */
  customTemplate?: string;
  /** 上下文长度限制 */
  maxTokens?: number;
}

/**
 * 基础八字信息（AI友好格式）
 */
export interface AIBaZiBasicInfo {
  /** 性别 */
  gender: '男' | '女';
  /** 出生时间信息 */
  birthInfo: {
    year: string;
    month: string;
    day: string;
    hour: string;
    timezone: string;
    lunarDate?: string;
  };
  /** 四柱信息 */
  fourPillars: {
    year: { stem: string; branch: string; nayin: string; };
    month: { stem: string; branch: string; nayin: string; };
    day: { stem: string; branch: string; nayin: string; };
    hour: { stem: string; branch: string; nayin: string; };
  };
  /** 日主信息 */
  dayMaster: {
    stem: string;
    element: string;
    yinyang: '阴' | '阳';
  };
}

/**
 * 神煞分析摘要（AI友好格式）
 */
export interface AIShenShaSummary {
  /** 总体统计 */
  statistics: {
    total: number;
    auspicious: number;
    inauspicious: number;
    important: number;
  };
  /** 重要神煞列表 */
  important: Array<{
    name: string;
    category: string;
    impact: 'positive' | 'negative' | 'neutral';
    strength: number;
    positions: string[];
    meaning: string;
    implications: string[];
  }>;
  /** 分组摘要 */
  byCategory: {
    nobleman: string[];
    peachBlossom: string[];
    academic: string[];
    wealth: string[];
    health: string[];
    relationship: string[];
    career: string[];
    other: string[];
  };
  /** 整体评价 */
  overallAssessment: {
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
}

/**
 * 五行旺衰分析摘要（AI友好格式）
 */
export interface AIWuxingSummary {
  /** 五行强度分析 */
  elements: {
    wood: { strength: number; status: string; description: string; };
    fire: { strength: number; status: string; description: string; };
    earth: { strength: number; status: string; description: string; };
    metal: { strength: number; status: string; description: string; };
    water: { strength: number; status: string; description: string; };
  };
  /** 日主旺衰 */
  dayMasterStrength: {
    level: string;
    score: number;
    factors: string[];
    seasonalInfluence: string;
  };
  /** 用神喜忌 */
  yongshen: {
    favorable: string[];
    unfavorable: string[];
    neutral: string[];
    explanation: string;
  };
  /** 格局信息 */
  pattern: {
    name: string;
    type: string;
    quality: 'good' | 'normal' | 'poor';
    description: string;
  };
}

/**
 * 十神分析摘要（AI友好格式）
 */
export interface AIShishenSummary {
  /** 十神分布 */
  distribution: Array<{
    name: string;
    count: number;
    positions: string[];
    strength: string;
  }>;
  /** 性格特征 */
  personality: {
    strengths: string[];
    weaknesses: string[];
    characteristics: string[];
  };
  /** 能力倾向 */
  abilities: {
    leadership: number;
    creativity: number;
    analytical: number;
    social: number;
    practical: number;
  };
}

/**
 * 🆕 能力评估分析摘要（AI友好格式）
 */
export interface AICapabilityAssessment {
  /** 十神强度分析 */
  tenGodStrength: {
    dominant: Array<{
      name: string;
      strength: number;
      rank: number;
      influence: string;
    }>;
    all: Record<string, {
      value: number;
      level: '极强' | '较强' | '中等' | '较弱' | '极弱';
      description: string;
    }>;
  };
  /** 六能力评分 */
  capabilityScores: {
    execution: { score: number; rank: number; description: string; };      // 执行力
    innovation: { score: number; rank: number; description: string; };     // 创新力
    management: { score: number; rank: number; description: string; };     // 管理力
    sales: { score: number; rank: number; description: string; };          // 销售力
    coordination: { score: number; rank: number; description: string; };   // 协调力
    stability: { score: number; rank: number; description: string; };      // 稳定性
  };
  /** 格局分析 */
  pattern: {
    type: string;
    confidence: number;
    description: string;
    implications: string[];
    advantages: string[];
    challenges: string[];
  };
  /** 综合评价 */
  overallAssessment: {
    strengthRank: number;            // 整体强度排名（1-100）
    topThreeCapabilities: string[];  // 前三大能力
    personalityType: string;         // 性格类型
    careerSuggestions: string[];     // 职业建议
    developmentAdvice: string[];     // 发展建议
  };
  /** 个性化建议 */
  recommendations: Array<{
    category: 'career' | 'skill' | 'mindset' | 'relationship' | 'health';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    reasoning: string;
    actionItems: string[];
  }>;
}

/**
 * 人生运势分析（AI友好格式）
 */
export interface AILifeAnalysis {
  /** 性格分析 */
  personality: {
    coreTraits: string[];
    strengths: string[];
    challenges: string[];
    behaviorPattern: string;
    decisionStyle: string;
  };
  /** 事业运势 */
  career: {
    suitableFields: string[];
    careerPattern: string;
    peakPeriods: string[];
    challenges: string[];
    recommendations: string[];
  };
  /** 财运分析 */
  wealth: {
    wealthPattern: string;
    sources: string[];
    management: string;
    opportunities: string[];
    risks: string[];
  };
  /** 健康状况 */
  health: {
    constitution: string;
    vulnerabilities: string[];
    seasonalEffects: string[];
    recommendations: string[];
  };
  /** 感情运势 */
  relationship: {
    pattern: string;
    compatibility: string[];
    challenges: string[];
    timing: string[];
    advice: string[];
  };
}

/**
 * 大运流年信息（AI友好格式）
 */
export interface AIDayunLiunian {
  /** 当前大运 */
  currentDayun: {
    period: string;
    stems: string;
    branches: string;
    startAge: number;
    endAge: number;
    characteristics: string[];
    opportunities: string[];
    challenges: string[];
  };
  /** 近期流年（5年） */
  recentLiunian: Array<{
    year: number;
    stems: string;
    branches: string;
    combined: string;
    prediction: string;
    keyEvents: string[];
    advice: string[];
  }>;
  /** 人生关键运势期 */
  keyPeriods: Array<{
    ageRange: string;
    description: string;
    significance: string;
    advice: string;
  }>;
}

/**
 * 完整AI提示词数据结构
 */
export interface AIPromptData {
  /** 基础信息 */
  basic: AIBaZiBasicInfo;
  /** 神煞分析 */
  shensha?: AIShenShaSummary;
  /** 五行分析 */
  wuxing?: AIWuxingSummary;
  /** 十神分析 */
  shishen?: AIShishenSummary;
  /** 人生分析 */
  life?: AILifeAnalysis;
  /** 大运流年 */
  timing?: AIDayunLiunian;
  /** 🆕 能力评估分析 */
  capability?: AICapabilityAssessment;
  /** 分析时间戳 */
  timestamp: string;
  /** 分析选项 */
  options: AIPromptOptions;
}

/**
 * AI提示词模板类型
 */
export interface AIPromptTemplate {
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 适用场景 */
  scenarios: string[];
  /** 模板内容 */
  template: string;
  /** 参数占位符 */
  parameters: Record<string, string>;
  /** 示例输出 */
  example?: string;
}

/**
 * AI分析请求接口
 */
export interface AIAnalysisRequest {
  /** 八字图表数据 */
  chart: BaZiChart;
  /** 神煞分析结果 */
  shensha?: BatchShenShaResult;
  /** 五行分析结果 */
  wuxing?: WuxingAnalysisResult;
  /** 分析选项 */
  options: AIPromptOptions;
  /** 特定问题（可选） */
  specificQuestions?: string[];
  /** 用户上下文（可选） */
  userContext?: {
    age?: number;
    location?: string;
    occupation?: string;
    concerns?: string[];
  };
}

/**
 * AI分析响应接口
 */
export interface AIAnalysisResponse {
  /** 结构化数据 */
  data: AIPromptData;
  /** 格式化的提示词 */
  prompt: string;
  /** 模板信息 */
  template?: AIPromptTemplate;
  /** 处理状态 */
  status: 'success' | 'partial' | 'error';
  /** 错误信息 */
  errors?: string[];
  /** 元数据 */
  metadata: {
    processingTime: number;
    dataSize: number;
    tokensEstimate: number;
    version: string;
  };
}

/**
 * AI提示词生成器错误类型
 */
export class AIPromptError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_INPUT' | 'TEMPLATE_ERROR' | 'FORMATTING_ERROR' | 'SIZE_LIMIT_EXCEEDED',
    public details?: any
  ) {
    super(message);
    this.name = 'AIPromptError';
  }
}

/**
 * AI提示词生成器接口
 */
export interface IAIPromptGenerator {
  /** 生成器名称 */
  name: string;
  /** 支持的格式 */
  supportedFormats: string[];
  /** 生成提示词数据 */
  generatePromptData(request: AIAnalysisRequest): Promise<AIPromptData>;
  /** 格式化为提示词 */
  formatAsPrompt(data: AIPromptData, template?: AIPromptTemplate): Promise<string>;
  /** 获取可用模板 */
  getAvailableTemplates(): AIPromptTemplate[];
  /** 估算token数量 */
  estimateTokens(data: AIPromptData): number;
}

/**
 * 预定义的分析场景
 */
export enum AIAnalysisScenario {
  /** 性格分析 */
  PERSONALITY = 'personality',
  /** 事业指导 */
  CAREER_GUIDANCE = 'career_guidance',
  /** 感情咨询 */
  RELATIONSHIP_ADVICE = 'relationship_advice',
  /** 健康建议 */
  HEALTH_ANALYSIS = 'health_analysis',
  /** 财运分析 */
  WEALTH_ANALYSIS = 'wealth_analysis',
  /** 流年运势 */
  ANNUAL_FORECAST = 'annual_forecast',
  /** 大运分析 */
  DAYUN_ANALYSIS = 'dayun_analysis',
  /** 综合分析 */
  COMPREHENSIVE = 'comprehensive',
  /** 快速解读 */
  QUICK_READING = 'quick_reading',
  /** 专业咨询 */
  PROFESSIONAL_CONSULTATION = 'professional_consultation',
  
  // 🆕 能力评估相关场景
  /** 能力评估分析 */
  CAPABILITY_ASSESSMENT = 'capability_assessment',
  /** 职业规划建议 */
  CAREER_PLANNING = 'career_planning',
  /** 技能发展指导 */
  SKILL_DEVELOPMENT = 'skill_development',
  /** 个人潜力分析 */
  POTENTIAL_ANALYSIS = 'potential_analysis',
  /** 管理能力评估 */
  LEADERSHIP_ASSESSMENT = 'leadership_assessment',
  /** 创新能力分析 */
  INNOVATION_ANALYSIS = 'innovation_analysis'
}

/**
 * AI模型特定配置
 */
export interface AIModelConfig {
  /** 模型名称 */
  modelName: string;
  /** 最大token限制 */
  maxTokens: number;
  /** 温度设置 */
  temperature: number;
  /** 系统提示词 */
  systemPrompt: string;
  /** 特殊指令 */
  specialInstructions?: string[];
  /** 输出格式偏好 */
  preferredFormat: 'json' | 'markdown' | 'text';
}