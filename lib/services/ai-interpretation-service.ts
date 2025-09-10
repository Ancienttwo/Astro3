/**
 * AI解读服务 - 三层解读架构
 * 基于 PRP 文档设计的多语言 AI 解读系统 (使用 DIFY API)
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 */

export type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

export type InterpretationLevel = 'basic' | 'personalized' | 'deep';

export interface UserContext {
  // 基础信息
  gender?: 'male' | 'female';
  age?: number;
  birth_year?: number;
  
  // 咨询领域
  concern_area?: 'career' | 'love' | 'health' | 'finance' | 'study' | 'general';
  specific_question?: string;
  
  // 背景信息
  current_situation?: string;
  emotional_state?: 'anxious' | 'hopeful' | 'confused' | 'calm';
  
  // 文化背景
  cultural_background?: 'traditional' | 'modern' | 'mixed';
  belief_level?: 'strong' | 'moderate' | 'curious';
}

export interface FortuneSlipData {
  id: string;
  slip_number: number;
  temple_name: string;
  fortune_level: string;
  categories: string[];
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  language: SupportedLanguage;
}

export interface AIInterpretationResult {
  level: InterpretationLevel;
  language: SupportedLanguage;
  
  // 解读内容
  interpretation: string;
  key_insights: string[];
  practical_advice: string[];
  
  // 个性化内容
  personalized_message?: string;
  relevant_aspects?: string[];
  
  // 深度解读内容
  spiritual_guidance?: string;
  timing_analysis?: string;
  action_recommendations?: string[];
  
  // 元数据
  confidence_score: number;
  interpretation_id: string;
  created_at: string;
  model_used: string;
  token_usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIServiceConfig {
  provider: 'siliconflow' | 'dify';
  api_key: string;
  base_url: string;
  model_name: string;
  timeout_ms: number;
}

/**
 * AI解读服务核心类
 */
export class AIInterpretationService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  /**
   * 生成基础解读 (Level 1)
   * 基于签文内容的标准化解读，无需用户背景信息
   */
  async generateBasicInterpretation(
    fortuneSlip: FortuneSlipData,
    userContext?: Partial<UserContext>
  ): Promise<AIInterpretationResult> {
    const prompt = this.buildBasicPrompt(fortuneSlip, userContext);
    
    try {
      const response = await this.callAIAPI(prompt, 'basic', fortuneSlip.language);
      return this.parseAIResponse(response.content, 'basic', fortuneSlip.language, response.usage);

    } catch (error) {
      console.error('Basic interpretation error:', error);
      throw new Error(`AI interpretation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 生成个性化解读 (Level 2)
   * 结合用户背景信息的定制化解读
   */
  async generatePersonalizedInterpretation(
    fortuneSlip: FortuneSlipData,
    userContext: UserContext
  ): Promise<AIInterpretationResult> {
    const prompt = this.buildPersonalizedPrompt(fortuneSlip, userContext);
    
    try {
      const response = await this.callAIAPI(prompt, 'personalized', fortuneSlip.language);
      return this.parseAIResponse(response.content, 'personalized', fortuneSlip.language, response.usage);

    } catch (error) {
      console.error('Personalized interpretation error:', error);
      throw new Error(`AI interpretation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 生成深度解读 (Level 3)
   * 包含灵性指导和深层含义的完整解读
   */
  async generateDeepInterpretation(
    fortuneSlip: FortuneSlipData,
    userContext: UserContext
  ): Promise<AIInterpretationResult> {
    const prompt = this.buildDeepPrompt(fortuneSlip, userContext);
    
    try {
      const response = await this.callAIAPI(prompt, 'deep', fortuneSlip.language);
      return this.parseAIResponse(response.content, 'deep', fortuneSlip.language, response.usage);

    } catch (error) {
      console.error('Deep interpretation error:', error);
      throw new Error(`AI interpretation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 流式生成解读 (用于实时显示)
   */
  async generateStreamingInterpretation(
    level: InterpretationLevel,
    fortuneSlip: FortuneSlipData,
    userContext?: UserContext,
    onChunk?: (chunk: string) => void
  ): Promise<AIInterpretationResult> {
    const prompt = this.buildPromptByLevel(level, fortuneSlip, userContext);
    const systemPrompt = this.getSystemPrompt(level, fortuneSlip.language);
    
    try {
      let response;
      if (this.config.provider === 'siliconflow') {
        response = await this.callSiliconFlowStreamingAPI(systemPrompt, prompt, onChunk);
      } else {
        response = await this.callDifyStreamingAPI(systemPrompt, prompt, level, fortuneSlip.language, onChunk);
      }
      
      return this.parseAIResponse(response.content, level, fortuneSlip.language, response.usage);

    } catch (error) {
      console.error('Streaming interpretation error:', error);
      throw new Error(`AI streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 调用 AI API (支持多个提供商)
   */
  private async callAIAPI(
    prompt: string,
    level: InterpretationLevel,
    language: SupportedLanguage
  ): Promise<{ content: string; usage?: any }> {
    const systemPrompt = this.getSystemPrompt(level, language);
    
    if (this.config.provider === 'siliconflow') {
      return this.callSiliconFlowAPI(systemPrompt, prompt);
    } else {
      return this.callDifyAPI(systemPrompt, prompt, level, language);
    }
  }

  /**
   * 调用 SiliconFlow API
   */
  private async callSiliconFlowAPI(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{ content: string; usage?: any }> {
    const response = await fetch(`${this.config.base_url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model_name,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SiliconFlow API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from SiliconFlow API');
    }

    return {
      content: data.choices[0].message.content,
      usage: data.usage ? {
        prompt_tokens: data.usage.prompt_tokens || 0,
        completion_tokens: data.usage.completion_tokens || 0,
        total_tokens: data.usage.total_tokens || 0
      } : undefined
    };
  }

  /**
   * 调用 DIFY API (保留兼容性)
   */
  private async callDifyAPI(
    systemPrompt: string,
    userPrompt: string,
    level: InterpretationLevel,
    language: SupportedLanguage
  ): Promise<{ content: string; usage?: any }> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await fetch(`${this.config.base_url}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          query: fullPrompt,
          level: level,
          language: language
        },
        query: fullPrompt,
        response_mode: 'blocking',
        user: `ai_service_${Date.now()}`
      })
    });

    if (!response.ok) {
      throw new Error(`DIFY API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.answer) {
      throw new Error('No answer from DIFY API');
    }

    return {
      content: data.answer,
      usage: {
        prompt_tokens: data.metadata?.usage?.prompt_tokens || 0,
        completion_tokens: data.metadata?.usage?.completion_tokens || 0,
        total_tokens: data.metadata?.usage?.total_tokens || 0
      }
    };
  }

  /**
   * 调用 SiliconFlow 流式 API
   */
  private async callSiliconFlowStreamingAPI(
    systemPrompt: string,
    userPrompt: string,
    onChunk?: (chunk: string) => void
  ): Promise<{ content: string; usage?: any }> {
    const response = await fetch(`${this.config.base_url}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model_name,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        stream: true
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`SiliconFlow Streaming API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (!response.body) {
      throw new Error('No response body from SiliconFlow streaming API');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let usage = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6).trim();
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed = JSON.parse(data);
              
              if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                const content = parsed.choices[0].delta.content || '';
                if (content) {
                  fullContent += content;
                  if (onChunk) {
                    onChunk(content);
                  }
                }
              }
              
              if (parsed.usage) {
                usage = parsed.usage;
              }
            } catch (parseError) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      usage: usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  }

  /**
   * 调用 DIFY 流式 API
   */
  private async callDifyStreamingAPI(
    systemPrompt: string,
    userPrompt: string,
    level: InterpretationLevel,
    language: SupportedLanguage,
    onChunk?: (chunk: string) => void
  ): Promise<{ content: string; usage?: any }> {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await fetch(`${this.config.base_url}/chat-messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.api_key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: {
          query: fullPrompt,
          level: level,
          language: language
        },
        query: fullPrompt,
        response_mode: 'streaming',
        user: `ai_service_stream_${Date.now()}`
      })
    });

    if (!response.ok) {
      throw new Error(`DIFY Streaming API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body from DIFY streaming API');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    let usage = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              
              if (data.event === 'message') {
                const content = data.answer || '';
                fullContent += content;
                if (onChunk && content) {
                  onChunk(content);
                }
              } else if (data.event === 'message_end') {
                usage = data.metadata?.usage;
              }
            } catch (parseError) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return {
      content: fullContent,
      usage: usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
    };
  }

  /**
   * 构建基础解读提示词
   */
  private buildBasicPrompt(fortuneSlip: FortuneSlipData, userContext?: Partial<UserContext>): string {
    const templates = {
      'zh-CN': `
请为以下关帝灵签提供基础解读：

签文信息：
- 第${fortuneSlip.slip_number}签：${fortuneSlip.title}
- 运势等级：${fortuneSlip.fortune_level}
- 适用领域：${fortuneSlip.categories.join('、')}
- 签诗：${fortuneSlip.content}
- 传统解读：${fortuneSlip.basic_interpretation}
${fortuneSlip.historical_context ? `- 历史典故：${fortuneSlip.historical_context}` : ''}
${fortuneSlip.symbolism ? `- 象征意义：${fortuneSlip.symbolism}` : ''}

${userContext?.concern_area ? `咨询领域：${userContext.concern_area}` : ''}
${userContext?.specific_question ? `具体问题：${userContext.specific_question}` : ''}

请提供：
1. 核心含义解读（3-4个要点）
2. 实用建议（3-4条）
3. 总体指导方向
4. 注意事项

要求：语言通俗易懂，贴近现代生活，积极正面。
      `,
      'zh-TW': `
請為以下關帝靈籤提供基礎解讀：

籤文資訊：
- 第${fortuneSlip.slip_number}籤：${fortuneSlip.title}
- 運勢等級：${fortuneSlip.fortune_level}
- 適用領域：${fortuneSlip.categories.join('、')}
- 籤詩：${fortuneSlip.content}
- 傳統解讀：${fortuneSlip.basic_interpretation}
${fortuneSlip.historical_context ? `- 歷史典故：${fortuneSlip.historical_context}` : ''}
${fortuneSlip.symbolism ? `- 象徵意義：${fortuneSlip.symbolism}` : ''}

${userContext?.concern_area ? `諮詢領域：${userContext.concern_area}` : ''}
${userContext?.specific_question ? `具體問題：${userContext.specific_question}` : ''}

請提供：
1. 核心含義解讀（3-4個要點）
2. 實用建議（3-4條）
3. 總體指導方向
4. 注意事項

要求：語言通俗易懂，貼近現代生活，積極正面。
      `,
      'en-US': `
Please provide a basic interpretation for this Guandi fortune slip:

Fortune Slip Information:
- Slip #${fortuneSlip.slip_number}: ${fortuneSlip.title}
- Fortune Level: ${fortuneSlip.fortune_level}
- Applicable Areas: ${fortuneSlip.categories.join(', ')}
- Fortune Poem: ${fortuneSlip.content}
- Traditional Interpretation: ${fortuneSlip.basic_interpretation}
${fortuneSlip.historical_context ? `- Historical Context: ${fortuneSlip.historical_context}` : ''}
${fortuneSlip.symbolism ? `- Symbolism: ${fortuneSlip.symbolism}` : ''}

${userContext?.concern_area ? `Area of Concern: ${userContext.concern_area}` : ''}
${userContext?.specific_question ? `Specific Question: ${userContext.specific_question}` : ''}

Please provide:
1. Core meaning interpretation (3-4 key points)
2. Practical advice (3-4 suggestions)
3. Overall guidance direction
4. Important considerations

Requirements: Use clear, modern language that's relatable and positive.
      `
    };

    return templates[fortuneSlip.language] || templates['zh-CN'];
  }

  /**
   * 构建个性化解读提示词
   */
  private buildPersonalizedPrompt(fortuneSlip: FortuneSlipData, userContext: UserContext): string {
    const contextInfo = [
      userContext.gender ? `性别：${userContext.gender}` : '',
      userContext.age ? `年龄：${userContext.age}` : '',
      userContext.concern_area ? `关注领域：${userContext.concern_area}` : '',
      userContext.current_situation ? `当前状况：${userContext.current_situation}` : '',
      userContext.emotional_state ? `情绪状态：${userContext.emotional_state}` : '',
    ].filter(Boolean).join('\n');

    return this.buildBasicPrompt(fortuneSlip, userContext) + `

用户背景信息：
${contextInfo}

请结合用户的具体情况，提供个性化的解读和建议。`;
  }

  /**
   * 构建深度解读提示词
   */
  private buildDeepPrompt(fortuneSlip: FortuneSlipData, userContext: UserContext): string {
    return this.buildPersonalizedPrompt(fortuneSlip, userContext) + `

请提供深度灵性解读，包括：
1. 灵性指导和内在成长方向
2. 时机分析和行动建议
3. 潜在挑战和应对方法
4. 长远发展和人生启示

要求：既要有实用价值，也要有精神层面的启发。`;
  }

  /**
   * 根据等级选择提示词构建方法
   */
  private buildPromptByLevel(
    level: InterpretationLevel,
    fortuneSlip: FortuneSlipData,
    userContext?: UserContext
  ): string {
    switch (level) {
      case 'basic':
        return this.buildBasicPrompt(fortuneSlip, userContext);
      case 'personalized':
        return this.buildPersonalizedPrompt(fortuneSlip, userContext || {});
      case 'deep':
        return this.buildDeepPrompt(fortuneSlip, userContext || {});
      default:
        return this.buildBasicPrompt(fortuneSlip, userContext);
    }
  }

  /**
   * 获取系统提示词
   */
  private getSystemPrompt(level: InterpretationLevel, language: SupportedLanguage): string {
    const prompts = {
      'zh-CN': {
        basic: '你是一位经验丰富的关帝灵签解读师，擅长将传统签文智慧转化为现代生活指导。请用简洁明了的语言，提供实用且积极的解读。',
        personalized: '你是一位专业的关帝灵签解读师，能够结合求签者的个人背景，提供个性化的人生指导。请深入理解用户情况，给出贴心的建议。',
        deep: '你是一位具有深厚文化底蕴的关帝灵签大师，能够从多个维度提供深度解读，包括灵性成长、人生哲学和实践智慧。'
      },
      'zh-TW': {
        basic: '你是一位經驗豐富的關帝靈籤解讀師，擅長將傳統籤文智慧轉化為現代生活指導。請用簡潔明瞭的語言，提供實用且積極的解讀。',
        personalized: '你是一位專業的關帝靈籤解讀師，能夠結合求籤者的個人背景，提供個性化的人生指導。請深入理解用戶情況，給出貼心的建議。',
        deep: '你是一位具有深厚文化底蘊的關帝靈籤大師，能夠從多個維度提供深度解讀，包括靈性成長、人生哲學和實踐智慧。'
      },
      'en-US': {
        basic: 'You are an experienced Guandi fortune slip interpreter who excels at translating traditional wisdom into modern life guidance. Please provide practical and positive interpretations in clear language.',
        personalized: 'You are a professional Guandi fortune slip reader who can combine personal background to provide personalized life guidance. Please understand the user\'s situation deeply and offer thoughtful advice.',
        deep: 'You are a Guandi fortune slip master with profound cultural knowledge who can provide deep interpretations from multiple dimensions including spiritual growth, life philosophy, and practical wisdom.'
      }
    };

    return prompts[language]?.[level] || prompts['zh-CN'][level];
  }

  /**
   * 解析AI响应
   */
  private parseAIResponse(
    response: string,
    level: InterpretationLevel,
    language: SupportedLanguage,
    usage?: any
  ): AIInterpretationResult {
    // 简单的响应解析逻辑，实际项目中可能需要更复杂的解析
    const lines = response.split('\n').filter(line => line.trim());
    
    return {
      level,
      language,
      interpretation: response,
      key_insights: lines.slice(0, 3), // 简化处理
      practical_advice: lines.slice(3, 6), // 简化处理
      confidence_score: 0.85, // 固定值，实际可以通过模型输出评估
      interpretation_id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      model_used: this.config.model_name,
      token_usage: usage ? {
        prompt_tokens: usage.prompt_tokens || 0,
        completion_tokens: usage.completion_tokens || 0,
        total_tokens: usage.total_tokens || 0
      } : undefined
    };
  }
}

/**
 * 创建AI解读服务实例
 */
export function createAIInterpretationService(): AIInterpretationService {
  const provider = (process.env.AI_PROVIDER || 'siliconflow') as 'siliconflow' | 'dify';
  
  let config: AIServiceConfig;
  
  if (provider === 'siliconflow') {
    config = {
      provider: 'siliconflow',
      api_key: process.env.SILICONFLOW_API_KEY || '',
      base_url: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.com/v1',
      model_name: process.env.SILICONFLOW_MODEL || 'Qwen/Qwen2.5-72B-Instruct',
      timeout_ms: parseInt(process.env.AI_TIMEOUT_MS || '30000')
    };
    
    if (!config.api_key) {
      throw new Error('SILICONFLOW_API_KEY environment variable is required');
    }
  } else {
    config = {
      provider: 'dify',
      api_key: process.env.DIFY_API_KEY || '',
      base_url: process.env.DIFY_BASE_URL || 'https://api.dify.ai/v1',
      model_name: 'dify-ai',
      timeout_ms: parseInt(process.env.AI_TIMEOUT_MS || '30000')
    };
    
    if (!config.api_key) {
      throw new Error('DIFY_API_KEY environment variable is required');
    }
  }

  return new AIInterpretationService(config);
}