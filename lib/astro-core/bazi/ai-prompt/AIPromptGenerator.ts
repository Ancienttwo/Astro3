/**
 * AI提示词生成器
 * 核心类，整合所有组件生成结构化的AI提示词
 */

// Removed unused type imports
import {
  IAIPromptGenerator,
  AIAnalysisRequest,
  AIPromptData,
  AIPromptTemplate,
  AIAnalysisResponse,
  AIPromptOptions,
  AIAnalysisScenario,
  AIPromptError,
  AIModelConfig
} from './types';
import {
  AIPromptDataFormatter,
  BaZiBasicFormatter
} from './formatters';
import {
  getTemplate,
  getAllTemplates,
  TemplateEngine,
  BASE_SYSTEM_PROMPTS
} from './templates';

/**
 * 默认AI提示词生成器实现
 */
export class AIPromptGenerator implements IAIPromptGenerator {
  public readonly name = 'DefaultAIPromptGenerator';
  public readonly supportedFormats = ['json', 'markdown', 'structured-text', 'prompt-template'];

  private readonly version = '1.0.0';
  private readonly maxTokensLimit = 100_000; // 默认最大token限制

  /**
   * 映射语言代码到支持的语言
   */
  private mapLanguageCode(language: "zh-CN" | "zh-TW" | "en-US"): "zh-CN" | "en-US" {
    if (language === "zh-TW") {
      return "zh-CN"; // Map Traditional Chinese to Simplified Chinese
    }
    return language as "zh-CN" | "en-US";
  }

  /**
   * 生成结构化的提示词数据
   */
  async generatePromptData(request: AIAnalysisRequest): Promise<AIPromptData> {
    try {
      this.validateRequest(request);

      const _startTime = Date.now();
      
      // 格式化基础数据
      const promptData = AIPromptDataFormatter.formatComplete(
        request.chart,
        request.shensha,
        request.wuxing,
        undefined, // capabilityOutput - not available in request
        request.options
      );

      // 添加用户上下文
      if (request.userContext) {
        promptData.basic.birthInfo = {
          ...promptData.basic.birthInfo,
          ...this.formatUserContext(request.userContext)
        };
      }

      // 检查大小限制
      const estimatedTokens = this.estimateTokens(promptData);
      if (request.options.maxTokens && estimatedTokens > request.options.maxTokens) {
        throw new AIPromptError(
          `生成的数据超过token限制: ${estimatedTokens} > ${request.options.maxTokens}`,
          'SIZE_LIMIT_EXCEEDED',
          { estimatedTokens, limit: request.options.maxTokens }
        );
      }

      // 更新处理时间
      promptData.timestamp = new Date().toISOString();

      return promptData;
    } catch (error) {
      if (error instanceof AIPromptError) {
        throw error;
      }
      throw new AIPromptError(
        `提示词数据生成失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'FORMATTING_ERROR',
        { request }
      );
    }
  }

  /**
   * 将数据格式化为AI提示词
   */
  async formatAsPrompt(data: AIPromptData, template?: AIPromptTemplate): Promise<string> {
    try {
      const targetTemplate = template ?? this.selectDefaultTemplate(data.options);
      
      // 准备模板数据
      const templateData = this.prepareTemplateData(data);
      
      // 应用模板
      const prompt = TemplateEngine.render(targetTemplate.template, templateData);
      
      // 添加系统指令
      const systemPrompt = this.getSystemPrompt(data.options.language);
      
      return this.combinePrompts(systemPrompt, prompt);
    } catch (error) {
      throw new AIPromptError(
        `提示词格式化失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'TEMPLATE_ERROR',
        { data, template }
      );
    }
  }

  /**
   * 获取可用模板列表
   */
  getAvailableTemplates(): AIPromptTemplate[] {
    return getAllTemplates('zh-CN');
  }

  /**
   * 估算token数量
   */
  estimateTokens(data: AIPromptData): number {
    return AIPromptDataFormatter.estimateTokens(data);
  }

  /**
   * 完整分析流程
   */
  async generateComplete(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const startTime = Date.now();
    
    try {
      // 生成结构化数据
      const promptData = await this.generatePromptData(request);
      
      // 选择或使用指定模板
      const template = request.options.customTemplate ? 
        this.createCustomTemplate(request.options.customTemplate) :
        this.selectTemplateByScenario(request);
      
      // 生成最终提示词
      const prompt = await this.formatAsPrompt(promptData, template);
      
      const processingTime = Date.now() - startTime;
      const tokensEstimate = this.estimateTokens(promptData);
      
      return {
        data: promptData,
        prompt,
        template,
        status: 'success',
        metadata: {
          processingTime,
          dataSize: JSON.stringify(promptData).length,
          tokensEstimate,
          version: this.version
        }
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        data: {} as unknown as AIPromptData,
        prompt: '',
        status: 'error',
        errors: [error instanceof Error ? error.message : '未知错误'],
        metadata: {
          processingTime,
          dataSize: 0,
          tokensEstimate: 0,
          version: this.version
        }
      };
    }
  }

  /**
   * 批量生成不同场景的提示词
   */
  async generateBatch(
    request: AIAnalysisRequest,
    scenarios: AIAnalysisScenario[]
  ): Promise<Record<AIAnalysisScenario, AIAnalysisResponse>> {
    const results: Record<string, AIAnalysisResponse> = {};
    
    for (const scenario of scenarios) {
      const scenarioRequest = {
        ...request,
        options: {
          ...request.options,
          detailLevel: this.getScenarioDetailLevel(scenario)
        }
      };
      
      try {
        const template = getTemplate(scenario, this.mapLanguageCode(request.options.language));
        const response = await this.generateComplete(scenarioRequest);
        response.template = template;
        results[scenario] = response;
      } catch (error) {
        results[scenario] = {
          data: {} as unknown as AIPromptData,
          prompt: '',
          status: 'error',
          errors: [error instanceof Error ? error.message : '未知错误'],
          metadata: {
            processingTime: 0,
            dataSize: 0,
            tokensEstimate: 0,
            version: this.version
          }
        };
      }
    }
    
    return results as Record<AIAnalysisScenario, AIAnalysisResponse>;
  }

  /**
   * 生成模型特定的配置
   */
  generateModelConfig(modelName: string, _data: AIPromptData): AIModelConfig {
    const baseConfig: AIModelConfig = {
      modelName,
      maxTokens: 4000,
      temperature: 0.7,
      systemPrompt: BASE_SYSTEM_PROMPTS.TRADITIONAL_CHINESE,
      preferredFormat: 'markdown'
    };

    // 根据模型调整配置
    switch (modelName.toLowerCase()) {
      case 'gpt-4':
      case 'gpt-4-turbo':
        return {
          ...baseConfig,
          maxTokens: 8000,
          temperature: 0.8,
          specialInstructions: [
            '请以专业命理师的身份进行分析',
            '结合传统理论与现代心理学观点',
            '提供实用的生活指导建议'
          ]
        };

      case 'claude-3-sonnet':
      case 'claude-3-opus':
        return {
          ...baseConfig,
          maxTokens: 10000,
          temperature: 0.7,
          systemPrompt: BASE_SYSTEM_PROMPTS.PSYCHOLOGICAL_COUNSELOR,
          specialInstructions: [
            '注重分析的逻辑性和条理性',
            '避免过度迷信的表达',
            '强调个人成长和积极发展'
          ]
        };

      case 'gemini-pro':
        return {
          ...baseConfig,
          maxTokens: 6000,
          temperature: 0.6,
          preferredFormat: 'json',
          specialInstructions: [
            '提供结构化的分析结果',
            '包含量化的评估指标',
            '注重科学性和客观性'
          ]
        };

      default:
        return baseConfig;
    }
  }

  // === 私有方法 ===

  /**
   * 验证请求参数
   */
  private validateRequest(request: AIAnalysisRequest): void {
    if (!request.chart) {
      throw new AIPromptError('八字图表数据不能为空', 'INVALID_INPUT');
    }

    if (!request.chart.fourPillars) {
      throw new AIPromptError('四柱信息不完整', 'INVALID_INPUT');
    }

    if (!request.options) {
      throw new AIPromptError('分析选项不能为空', 'INVALID_INPUT');
    }

    // 检查必需的四柱数据
    const pillars = ['year', 'month', 'day', 'hour'] as const;
    for (const pillar of pillars) {
      const pillarData = request.chart.fourPillars[pillar];
      if (!pillarData || !pillarData.stem || !pillarData.branch) {
        throw new AIPromptError(`${pillar}柱信息不完整`, 'INVALID_INPUT');
      }
    }
  }

  /**
   * 格式化用户上下文信息
   */
  private formatUserContext(userContext: any): Record<string, any> {
    const formatted: Record<string, any> = {};
    
    if (userContext.age) {
      formatted.currentAge = `${userContext.age}岁`;
    }
    
    if (userContext.location) {
      formatted.location = userContext.location;
    }
    
    if (userContext.occupation) {
      formatted.occupation = userContext.occupation;
    }
    
    if (userContext.concerns && userContext.concerns.length > 0) {
      formatted.concerns = userContext.concerns.join('、');
    }
    
    return formatted;
  }

  /**
   * 选择默认模板
   */
  private selectDefaultTemplate(options: AIPromptOptions): AIPromptTemplate {
    const detailLevel = options.detailLevel;
    
    switch (detailLevel) {
      case 'basic':
        return getTemplate(AIAnalysisScenario.QUICK_READING, this.mapLanguageCode(options.language));
      case 'comprehensive':
        return getTemplate(AIAnalysisScenario.COMPREHENSIVE, this.mapLanguageCode(options.language));
      default:
        return getTemplate(AIAnalysisScenario.PERSONALITY, this.mapLanguageCode(options.language));
    }
  }

  /**
   * 根据场景选择模板
   */
  private selectTemplateByScenario(request: AIAnalysisRequest): AIPromptTemplate {
    // 根据用户问题和上下文推断场景
    if (request.specificQuestions) {
      const questions = request.specificQuestions.join('').toLowerCase();
      
      if (questions.includes('事业') || questions.includes('工作') || questions.includes('职业')) {
        return getTemplate(AIAnalysisScenario.CAREER_GUIDANCE, this.mapLanguageCode(request.options.language));
      }
      
      if (questions.includes('感情') || questions.includes('婚姻') || questions.includes('恋爱')) {
        return getTemplate(AIAnalysisScenario.RELATIONSHIP_ADVICE, this.mapLanguageCode(request.options.language));
      }
      
      if (questions.includes('财运') || questions.includes('财富') || questions.includes('赚钱')) {
        return getTemplate(AIAnalysisScenario.WEALTH_ANALYSIS, this.mapLanguageCode(request.options.language));
      }
      
      if (questions.includes('健康') || questions.includes('身体') || questions.includes('养生')) {
        return getTemplate(AIAnalysisScenario.HEALTH_ANALYSIS, this.mapLanguageCode(request.options.language));
      }
      
      if (questions.includes('今年') || questions.includes('流年') || questions.includes('运势')) {
        return getTemplate(AIAnalysisScenario.ANNUAL_FORECAST, this.mapLanguageCode(request.options.language));
      }
    }
    
    // 默认使用综合分析
    return getTemplate(AIAnalysisScenario.COMPREHENSIVE, this.mapLanguageCode(request.options.language));
  }

  /**
   * 创建自定义模板
   */
  private createCustomTemplate(templateContent: string): AIPromptTemplate {
    return {
      name: 'CustomTemplate',
      description: '用户自定义模板',
      scenarios: ['custom'],
      template: templateContent,
      parameters: {}
    };
  }

  /**
   * 准备模板数据
   */
  private prepareTemplateData(data: AIPromptData): Record<string, any> {
    const templateData: Record<string, any> = {
      // 基础信息
      basicInfo: this.formatBasicInfoForTemplate(data.basic),
      dayMaster: data.basic.dayMaster.stem,
      gender: data.basic.gender,
      fourPillars: BaZiBasicFormatter.formatFourPillarsString({
        fourPillars: data.basic.fourPillars
      } as any),

      // 分析结果
      wuxingAnalysis: data.wuxing ? this.formatWuxingForTemplate(data.wuxing) : '五行分析数据不可用',
      shishenAnalysis: data.shishen ? this.formatShishenForTemplate(data.shishen) : '十神分析数据不可用',
      shenshaAnalysis: data.shensha ? this.formatShenshaForTemplate(data.shensha) : '神煞分析数据不可用',
      
      // 大运流年
      currentDayun: data.timing?.currentDayun ? this.formatDayunForTemplate(data.timing.currentDayun) : '大运信息不可用',
      dayunPeriod: data.timing?.currentDayun?.period || '当前大运',
      liunianInfo: data.timing?.recentLiunian ? this.formatLiunianForTemplate(data.timing.recentLiunian) : '流年信息不可用',

      // 衍生信息
      strongElements: this.getStrongElements(data.wuxing),
      weakElements: this.getWeakElements(data.wuxing),
      favorableElements: data.wuxing?.yongshen.favorable || [],
      mainShishen: this.getMainShishen(data.shishen),
      peachBlossomStars: data.shensha?.byCategory.peachBlossom || [],

      // 快速解读专用
      coreTraits: this.getCoreTraits(data),
      mainStrengths: this.getMainStrengths(data),
      mainChallenges: this.getMainChallenges(data),
      careerDirection: this.getCareerDirection(data),
      wealthPattern: this.getWealthPattern(data),
      relationshipPattern: this.getRelationshipPattern(data),
      currentPeriodForecast: this.getCurrentPeriodForecast(data),
      practicalAdvice: this.getPracticalAdvice(data)
    };

    return templateData;
  }

  /**
   * 格式化基础信息用于模板
   */
  private formatBasicInfoForTemplate(basic: any): string {
    return [
      `性别: ${basic.gender}`,
      `出生: ${basic.birthInfo.year}${basic.birthInfo.month}${basic.birthInfo.day} ${basic.birthInfo.hour}`,
      `四柱: ${basic.fourPillars.year.stem}${basic.fourPillars.year.branch} ${basic.fourPillars.month.stem}${basic.fourPillars.month.branch} ${basic.fourPillars.day.stem}${basic.fourPillars.day.branch} ${basic.fourPillars.hour.stem}${basic.fourPillars.hour.branch}`,
      `日主: ${basic.dayMaster.stem}(${basic.dayMaster.element}${basic.dayMaster.yinyang})`
    ].join('\n');
  }

  /**
   * 格式化五行信息用于模板
   */
  private formatWuxingForTemplate(wuxing: any): string {
    const elements = Object.entries(wuxing.elements).map(([element, info]: [string, any]) => 
      `${element}: ${info.status}(${info.strength}分)`
    ).join(', ');
    
    return [
      `日主强度: ${wuxing.dayMasterStrength.level}(${wuxing.dayMasterStrength.score}分)`,
      `五行分布: ${elements}`,
      `用神: ${wuxing.yongshen.favorable.join('、')}`,
      `忌神: ${wuxing.yongshen.unfavorable.join('、')}`,
      `格局: ${wuxing.pattern.name}(${wuxing.pattern.quality})`
    ].join('\n');
  }

  /**
   * 格式化十神信息用于模板
   */
  private formatShishenForTemplate(shishen: any): string {
    const distribution = shishen.distribution
      .filter((item: any) => item.count > 0)
      .map((item: any) => `${item.name}${item.count}个`)
      .join('、');
    
    return [
      `分布: ${distribution}`,
      `优势: ${shishen.personality.strengths.join('、')}`,
      `特征: ${shishen.personality.characteristics.join('、')}`
    ].join('\n');
  }

  /**
   * 格式化神煞信息用于模板
   */
  private formatShenshaForTemplate(shensha: any): string {
    const important = shensha.important.map((item: any) => 
      `${item.name}(${item.positions.join('、')})`
    ).join('、');
    
    return [
      `统计: 共${shensha.statistics.total}个，吉${shensha.statistics.auspicious}个，凶${shensha.statistics.inauspicious}个`,
      `重要: ${important}`,
      `优势: ${shensha.overallAssessment.strengths.join('、')}`,
      `挑战: ${shensha.overallAssessment.challenges.join('、')}`
    ].join('\n');
  }

  /**
   * 格式化大运信息用于模板
   */
  private formatDayunForTemplate(dayun: any): string {
    return [
      `期间: ${dayun.period}(${dayun.startAge}-${dayun.endAge}岁)`,
      `干支: ${dayun.stems}${dayun.branches}`,
      `特征: ${dayun.characteristics.join('、')}`,
      `机遇: ${dayun.opportunities.join('、')}`,
      `挑战: ${dayun.challenges.join('、')}`
    ].join('\n');
  }

  /**
   * 格式化流年信息用于模板
   */
  private formatLiunianForTemplate(liunian: any[]): string {
    return liunian.slice(0, 3).map(year => 
      `${year.year}年${year.stems}${year.branches}: ${year.prediction}`
    ).join('\n');
  }

  /**
   * 获取强势五行
   */
  private getStrongElements(wuxing?: any): string[] {
    if (!wuxing) return [];
    
    return Object.entries(wuxing.elements)
      .filter(([_, info]: [string, any]) => info.strength >= 60)
      .map(([element, _]) => element);
  }

  /**
   * 获取弱势五行
   */
  private getWeakElements(wuxing?: any): string[] {
    if (!wuxing) return [];
    
    return Object.entries(wuxing.elements)
      .filter(([_, info]: [string, any]) => info.strength < 40)
      .map(([element, _]) => element);
  }

  /**
   * 获取主要十神
   */
  private getMainShishen(shishen?: any): string[] {
    if (!shishen) return [];
    
    return shishen.distribution
      .filter((item: any) => item.count > 0)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 3)
      .map((item: any) => item.name);
  }

  /**
   * 获取核心特质（用于快速解读）
   */
  private getCoreTraits(data: AIPromptData): string {
    const traits = [];
    
    if (data.wuxing?.dayMasterStrength) {
      traits.push(`${data.wuxing.dayMasterStrength.level}日主`);
    }
    
    if (data.shishen?.personality.characteristics) {
      traits.push(...data.shishen.personality.characteristics.slice(0, 2));
    }
    
    return traits.join('，') || '性格特质需要详细分析';
  }

  /**
   * 获取主要优势
   */
  private getMainStrengths(data: AIPromptData): string {
    const strengths = [];
    
    if (data.shishen?.personality.strengths) {
      strengths.push(...data.shishen.personality.strengths);
    }
    
    if (data.shensha?.overallAssessment.strengths) {
      strengths.push(...data.shensha.overallAssessment.strengths);
    }
    
    return strengths.slice(0, 3).join('；') || '优势特征待分析';
  }

  /**
   * 获取主要挑战
   */
  private getMainChallenges(data: AIPromptData): string {
    const challenges = [];
    
    if (data.shishen?.personality.weaknesses) {
      challenges.push(...data.shishen.personality.weaknesses);
    }
    
    if (data.shensha?.overallAssessment.challenges) {
      challenges.push(...data.shensha.overallAssessment.challenges);
    }
    
    return challenges.slice(0, 2).join('；') || '挑战需要综合评估';
  }

  /**
   * 获取事业方向
   */
  private getCareerDirection(data: AIPromptData): string {
    if (data.life?.career.suitableFields) {
      return data.life.career.suitableFields.slice(0, 3).join('、');
    }
    return '综合五行特质确定适合行业';
  }

  /**
   * 获取财运模式
   */
  private getWealthPattern(data: AIPromptData): string {
    if (data.life?.wealth.wealthPattern) {
      return data.life.wealth.wealthPattern;
    }
    return '财运模式需要详细分析';
  }

  /**
   * 获取感情特点
   */
  private getRelationshipPattern(data: AIPromptData): string {
    if (data.life?.relationship.pattern) {
      return data.life.relationship.pattern;
    }
    return '感情模式待综合评估';
  }

  /**
   * 获取当前期运势
   */
  private getCurrentPeriodForecast(data: AIPromptData): string {
    if (data.timing?.currentDayun) {
      const dayun = data.timing.currentDayun;
      return `当前${dayun.period}，${dayun.characteristics.slice(0, 2).join('、')}`;
    }
    return '当前运势需要大运分析确定';
  }

  /**
   * 获取实用建议
   */
  private getPracticalAdvice(data: AIPromptData): string {
    const advice = [];
    
    if (data.shensha?.overallAssessment.recommendations) {
      advice.push(...data.shensha.overallAssessment.recommendations.slice(0, 2));
    }
    
    if (data.wuxing?.yongshen?.favorable?.length && data.wuxing.yongshen.favorable.length > 0) {
      advice.push(`多用${data.wuxing.yongshen.favorable.join('、')}元素`);
    }
    
    return advice.join('；') || '具体建议需要详细咨询分析';
  }

  /**
   * 获取系统提示词
   */
  private getSystemPrompt(language: string): string {
    switch (language) {
      case 'en-US':
        return BASE_SYSTEM_PROMPTS.ENGLISH_ASTROLOGER;
      case 'zh-TW':
        return BASE_SYSTEM_PROMPTS.TRADITIONAL_CHINESE;
      default:
        return BASE_SYSTEM_PROMPTS.TRADITIONAL_CHINESE;
    }
  }

  /**
   * 组合系统提示词和用户提示词
   */
  private combinePrompts(systemPrompt: string, userPrompt: string): string {
    return `${systemPrompt}\n\n---\n\n${userPrompt}`;
  }

  /**
   * 根据场景获取详细程度
   */
  private getScenarioDetailLevel(scenario: AIAnalysisScenario): 'basic' | 'detailed' | 'comprehensive' {
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
}