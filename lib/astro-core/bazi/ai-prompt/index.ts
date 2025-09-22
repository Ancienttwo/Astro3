/**
 * AI Prompt 数据接口 - 主入口文件
 * 为AI模型提供结构化的八字分析数据和提示词生成服务
 */

// ===== 类型导出 =====
export type {
  // 基础类型
  AIPromptOptions,
  AIBaZiBasicInfo,
  AIShenShaSummary,
  AIWuxingSummary,
  AIShishenSummary,
  AILifeAnalysis,
  AIDayunLiunian,
  AIPromptData,
  AIPromptTemplate,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIModelConfig,
  // 🆕 能力评估类型
  AICapabilityAssessment,
  
  // 接口定义
  IAIPromptGenerator,
  
  // 枚举和常量
  AIAnalysisScenario
} from './types';

// ===== 核心类导出 =====
export { AIPromptGenerator } from './AIPromptGenerator';
export { AIPromptError } from './types';

// ===== 格式化器导出 =====
export {
  BaZiBasicFormatter,
  ShenShaFormatter,
  WuxingFormatter,
  ShishenFormatter,
  LifeAnalysisFormatter,
  DayunLiunianFormatter,
  AIPromptDataFormatter,
  // 🆕 能力评估格式化器
  CapabilityAssessmentFormatter
} from './formatters';

// ===== 模板相关导出 =====
export {
  getTemplate,
  getAllTemplates,
  createCustomTemplate,
  TemplateEngine,
  BASE_SYSTEM_PROMPTS,
  PREDEFINED_TEMPLATES,
  ENGLISH_TEMPLATES
} from './templates';

// ===== 便利工具类 =====
import { AIPromptGenerator } from './AIPromptGenerator';
import { AIPromptOptions, AIAnalysisRequest, AIAnalysisScenario, AIPromptData, AIAnalysisResponse } from './types';
// Temporary imports since modules don't exist
// import { BaZiChart } from '../base/types';
import { BatchShenShaResult } from '../shensha/types';
// import { WuxingAnalysisResult } from '../wuxing-scoring/types';

// Temporary type definitions
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

interface BaZiChart {
  fourPillars: any;
  gender: 'male' | 'female';
  solarDate: any;
  timezone: string;
}

// WuxingAnalysisResult type imported from types.ts

/**
 * AI提示词工具类
 * 提供快速生成AI提示词的便利方法
 */
export const AIPromptUtils = {
  /**
   * 创建默认的AI提示词生成器
   */
  createGenerator(): AIPromptGenerator {
    return new AIPromptGenerator();
  },

  /**
   * 快速生成基础分析提示词
   */
  async quickGenerate(
    chart: BaZiChart,
    options: Partial<AIPromptOptions> = {}
  ): Promise<string> {
    const generator = new AIPromptGenerator();
    const request: AIAnalysisRequest = {
      chart,
      options: this.createDefaultOptions(options)
    };
    
    const response = await generator.generateComplete(request);
    return response.prompt;
  },

  /**
   * 生成特定场景的分析提示词
   */
  async generateForScenario(
    chart: BaZiChart,
    scenario: AIAnalysisScenario,
    options: Partial<AIPromptOptions> = {}
  ): Promise<string> {
    const generator = new AIPromptGenerator();
    const defaultOptions = this.createDefaultOptions(options);
    defaultOptions.detailLevel = this.getScenarioDetailLevel(scenario);
    
    const request: AIAnalysisRequest = {
      chart,
      options: defaultOptions
    };
    
    const response = await generator.generateComplete(request);
    return response.prompt;
  },

  /**
   * 生成包含神煞分析的提示词
   */
  async generateWithShenSha(
    chart: BaZiChart,
    shenshaResult: BatchShenShaResult,
    options: Partial<AIPromptOptions> = {}
  ): Promise<string> {
    const generator = new AIPromptGenerator();
    const request: AIAnalysisRequest = {
      chart,
      shensha: shenshaResult,
      options: {
        ...this.createDefaultOptions(options),
        includeAnalysis: {
          ...this.createDefaultOptions(options).includeAnalysis,
          shensha: true
        }
      }
    };
    
    const response = await generator.generateComplete(request);
    return response.prompt;
  },

  /**
   * 生成包含五行分析的提示词
   */
  async generateWithWuxing(
    chart: BaZiChart,
    wuxingResult: WuxingAnalysisResult,
    options: Partial<AIPromptOptions> = {}
  ): Promise<string> {
    const generator = new AIPromptGenerator();
    const request: AIAnalysisRequest = {
      chart,
      wuxing: wuxingResult,
      options: {
        ...this.createDefaultOptions(options),
        includeAnalysis: {
          ...this.createDefaultOptions(options).includeAnalysis,
          wuxing: true
        }
      }
    };
    
    const response = await generator.generateComplete(request);
    return response.prompt;
  },

  /**
   * 生成完整分析的提示词
   */
  async generateComplete(
    chart: BaZiChart,
    shenshaResult?: BatchShenShaResult,
    wuxingResult?: WuxingAnalysisResult,
    options: Partial<AIPromptOptions> = {}
  ): Promise<AIAnalysisResponse> {
    const generator = new AIPromptGenerator();
    const request: AIAnalysisRequest = {
      chart,
      shensha: shenshaResult,
      wuxing: wuxingResult,
      options: {
        ...this.createDefaultOptions(options),
        includeAnalysis: {
          shensha: !!shenshaResult,
          wuxing: !!wuxingResult,
          shishen: true,
          dayun: true,
          personality: true,
          career: true,
          health: true,
          relationship: true,
          capabilityAssessment: false
        }
      }
    };
    
    return generator.generateComplete(request);
  },

  /**
   * 批量生成多场景分析
   */
  async generateBatch(
    chart: BaZiChart,
    scenarios: AIAnalysisScenario[],
    shenshaResult?: BatchShenShaResult,
    wuxingResult?: WuxingAnalysisResult,
    options: Partial<AIPromptOptions> = {}
  ): Promise<Record<AIAnalysisScenario, AIAnalysisResponse>> {
    const generator = new AIPromptGenerator();
    const request: AIAnalysisRequest = {
      chart,
      shensha: shenshaResult,
      wuxing: wuxingResult,
      options: {
        ...this.createDefaultOptions(options),
        includeAnalysis: {
          shensha: !!shenshaResult,
          wuxing: !!wuxingResult,
          shishen: true,
          dayun: true,
          personality: true,
          career: true,
          health: true,
          relationship: true,
          capabilityAssessment: false
        }
      }
    };
    
    return generator.generateBatch(request, scenarios);
  },

  /**
   * 仅生成结构化数据（不生成提示词）
   */
  async generateDataOnly(
    chart: BaZiChart,
    shenshaResult?: BatchShenShaResult,
    wuxingResult?: WuxingAnalysisResult,
    options: Partial<AIPromptOptions> = {}
  ): Promise<AIPromptData> {
    const generator = new AIPromptGenerator();
    const request: AIAnalysisRequest = {
      chart,
      shensha: shenshaResult,
      wuxing: wuxingResult,
      options: {
        ...this.createDefaultOptions(options),
        includeAnalysis: {
          shensha: !!shenshaResult,
          wuxing: !!wuxingResult,
          shishen: true,
          dayun: true,
          personality: true,
          career: true,
          health: true,
          relationship: true,
          capabilityAssessment: false
        }
      }
    };
    
    return generator.generatePromptData(request);
  },

  /**
   * 🆕 生成包含能力评估的提示词
   * 专门用于生成BossAI能力分析的AI提示词
   */
  async generateWithCapabilityAssessment(
    chart: BaZiChart,
    capabilityOutput: any, // AlgorithmOutput from capability assessment
    options: Partial<AIPromptOptions> = {}
  ): Promise<string> {
    const generator = new AIPromptGenerator();
    const request: AIAnalysisRequest = {
      chart,
      options: {
        ...this.createDefaultOptions(options),
        includeAnalysis: {
          ...this.createDefaultOptions(options).includeAnalysis,
          capabilityAssessment: true,
          // 能力评估相关的分析项目
          personality: true,
          career: true,
          shishen: true
        }
      }
    };
    
    // 注意：这里需要AIPromptGenerator支持capabilityOutput参数
    // 实际调用时需要传递capabilityOutput
    const response = await generator.generateComplete(request);
    return response.prompt;
  },

  /**
   * 🆕 生成能力评估专用场景提示词
   * 针对特定能力评估场景生成优化的提示词
   */
  async generateCapabilityScenario(
    chart: BaZiChart,
    capabilityOutput: any,
    scenario: 'capability_assessment' | 'career_planning' | 'skill_development' | 'potential_analysis' | 'leadership_assessment' | 'innovation_analysis',
    options: Partial<AIPromptOptions> = {}
  ): Promise<string> {
    const generator = new AIPromptGenerator();
    const defaultOptions = this.createDefaultOptions(options);
    defaultOptions.detailLevel = 'comprehensive'; // 能力评估需要详细分析
    
    const request: AIAnalysisRequest = {
      chart,
      options: {
        ...defaultOptions,
        includeAnalysis: {
          shensha: false,
          capabilityAssessment: true,
          personality: scenario === 'capability_assessment' || scenario === 'potential_analysis',
          career: scenario === 'career_planning' || scenario === 'capability_assessment',
          shishen: true, // 十神关系对能力评估很重要
          wuxing: true,  // 五行平衡对能力发展有影响
          dayun: scenario === 'career_planning', // 职业规划需要时运分析
          health: false,
          relationship: scenario === 'leadership_assessment'
        }
      }
    };
    
    const response = await generator.generateComplete(request);
    return response.prompt;
  },

  /**
   * 估算提示词的token数量
   */
  estimateTokens(prompt: string): number {
    // 简单估算：中文字符约1.5个token，英文约0.75个token
    const chineseChars = (prompt.match(/[\u4e00-\u9fa5]/g) || []).length;
    const otherChars = prompt.length - chineseChars;
    
    return Math.ceil(chineseChars * 1.5 + otherChars * 0.75);
  },

  /**
   * 从八字数据创建分析请求
   */
  createAnalysisRequest(
    chart: BaZiChart,
    scenario: AIAnalysisScenario = AIAnalysisScenario.COMPREHENSIVE,
    language: 'zh-CN' | 'zh-TW' | 'en-US' = 'zh-CN'
  ): AIAnalysisRequest {
    return {
      chart,
      options: {
        language,
        detailLevel: this.getScenarioDetailLevel(scenario),
        includeAnalysis: {
          shensha: true,
          wuxing: true,
          dayun: true,
          shishen: true,
          personality: true,
          career: true,
          health: true,
          relationship: true,
          capabilityAssessment: false
        },
        format: 'prompt-template'
      }
    };
  },

  /**
   * 创建默认选项
   */
  createDefaultOptions(partial: Partial<AIPromptOptions> = {}): AIPromptOptions {
    const defaultIncludeAnalysis = {
      shensha: false,
      wuxing: false,
      dayun: false,
      shishen: false,
      personality: false,
      career: false,
      health: false,
      relationship: false,
      // 🆕 能力评估分析
      capabilityAssessment: false
    };
    
    return {
      language: 'zh-CN',
      detailLevel: 'detailed',
      format: 'prompt-template',
      maxTokens: 10000,
      ...partial,
      includeAnalysis: {
        ...defaultIncludeAnalysis,
        ...partial.includeAnalysis
      }
    };
  },

  /**
   * 根据场景获取详细程度
   */
  getScenarioDetailLevel(scenario: AIAnalysisScenario): 'basic' | 'detailed' | 'comprehensive' {
    switch (scenario) {
      case AIAnalysisScenario.QUICK_READING:
        return 'basic';
      case AIAnalysisScenario.COMPREHENSIVE:
      case AIAnalysisScenario.PROFESSIONAL_CONSULTATION:
        return 'comprehensive';
      default:
        return 'detailed';
    }
  }
} as const;

// ===== 默认实例（单例模式） =====
let defaultGenerator: AIPromptGenerator | null = null;

/**
 * 获取默认AI提示词生成器实例
 */
export function getDefaultAIPromptGenerator(): AIPromptGenerator {
  if (!defaultGenerator) {
    defaultGenerator = new AIPromptGenerator();
  }
  return defaultGenerator;
}

/**
 * 重置默认AI提示词生成器实例
 */
export function resetDefaultAIPromptGenerator(): void {
  defaultGenerator = null;
}

// ===== 兼容性接口 =====

/**
 * 兼容性接口：快速生成AI分析提示词
 * 提供与其他模块类似的简单接口，便于集成使用
 */
export async function generateBaziAIPrompt(
  chart: BaZiChart,
  options?: {
    scenario?: 'personality' | 'career' | 'relationship' | 'health' | 'comprehensive' | 'quick';
    language?: 'zh-CN' | 'en-US';
    includeDetail?: boolean;
    customQuestions?: string[];
  }
): Promise<{
  prompt: string;
  data: AIPromptData;
  metadata: {
    scenario: string;
    tokens: number;
    processingTime: number;
  };
}> {
  const scenario = options?.scenario ? 
    AIAnalysisScenario[options.scenario.toUpperCase() as keyof typeof AIAnalysisScenario] :
    AIAnalysisScenario.COMPREHENSIVE;

  const generator = getDefaultAIPromptGenerator();
  const startTime = Date.now();
  
  const request: AIAnalysisRequest = {
    chart,
    options: AIPromptUtils.createDefaultOptions({
      language: options?.language || 'zh-CN',
      detailLevel: options?.includeDetail ? 'comprehensive' : 'detailed',
      includeAnalysis: {
        shensha: true,
        wuxing: true,
        dayun: true,
        shishen: true,
        personality: true,
        career: true,
        health: true,
        relationship: true,
        capabilityAssessment: false
      }
    }),
    specificQuestions: options?.customQuestions
  };

  const response = await generator.generateComplete(request);
  const processingTime = Date.now() - startTime;

  return {
    prompt: response.prompt,
    data: response.data,
    metadata: {
      scenario: scenario,
      tokens: response.metadata.tokensEstimate,
      processingTime
    }
  };
}

/**
 * 兼容性接口：获取AI分析数据摘要
 */
export function getAIAnalysisSummary(data: AIPromptData): {
  basic: string;
  highlights: string[];
  recommendations: string[];
} {
  const basic = `${data.basic.gender}命，日主${data.basic.dayMaster.stem}(${data.basic.dayMaster.element})`;
  
  const highlights = [];
  const recommendations = [];

  // 从神煞分析获取亮点
  if (data.shensha && data.shensha.important.length > 0) {
    highlights.push(`命带${data.shensha.important.map(s => s.name).join('、')}`);
  }

  // 从五行分析获取建议
  if (data.wuxing && data.wuxing.yongshen.favorable.length > 0) {
    recommendations.push(`宜多用${data.wuxing.yongshen.favorable.join('、')}元素`);
  }

  // 从神煞分析获取建议
  if (data.shensha && data.shensha.overallAssessment.recommendations.length > 0) {
    recommendations.push(...data.shensha.overallAssessment.recommendations.slice(0, 2));
  }

  return {
    basic,
    highlights: highlights.length > 0 ? highlights : ['命格特征需要详细分析'],
    recommendations: recommendations.length > 0 ? recommendations : ['具体建议需要综合分析确定']
  };
}

// ===== 模块信息 =====
export const AIPromptModuleInfo = {
  name: '@astroall/bazi-core/ai-prompt',
  version: '1.0.0',
  description: 'AI提示词数据接口系统',
  features: [
    '结构化八字数据格式化',
    '多场景AI提示词模板',
    '灵活的模板引擎系统',
    '批量分析场景支持',
    '多语言提示词生成',
    'Token使用量估算',
    '模型特定配置支持',
    '兼容性接口提供'
  ],
  supportedScenarios: [
    'personality - 个性分析',
    'career_guidance - 事业指导',
    'relationship_advice - 感情咨询',
    'health_analysis - 健康分析',
    'wealth_analysis - 财运分析',
    'annual_forecast - 流年运势',
    'dayun_analysis - 大运分析',
    'comprehensive - 综合分析',
    'quick_reading - 快速解读',
    'professional_consultation - 专业咨询',
    // 🆕 能力评估相关场景
    'capability_assessment - 能力评估分析',
    'career_planning - 职业规划建议',
    'skill_development - 技能发展指导',
    'potential_analysis - 个人潜力分析',
    'leadership_assessment - 管理能力评估',
    'innovation_analysis - 创新能力分析'
  ],
  supportedLanguages: ['zh-CN', 'zh-TW', 'en-US'],
  supportedFormats: ['json', 'markdown', 'structured-text', 'prompt-template'],
  integrations: {
    shensha: '神煞检测系统集成',
    wuxing: '五行分析系统集成',
    base: '基础排盘系统集成',
    // 🆕 能力评估系统集成
    capability: 'BossAI能力评估算法集成'
  }
} as const;