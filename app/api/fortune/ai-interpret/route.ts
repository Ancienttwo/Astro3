/**
 * AI签文解读API端点
 * 路径: /api/fortune/ai-interpret
 * 支持三层解读级别：basic, personalized, deep
 * 
 * 基于PRP文档设计的AI解读服务
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import { 
  AIInterpretationService,
  createAIInterpretationService,
  type InterpretationLevel,
  type SupportedLanguage,
  type UserContext,
  type FortuneSlipData
} from '@/lib/services/ai-interpretation-service';
import { checkRateLimitRedis } from '@/lib/rate-limit-redis'

// 请求接口
interface AIInterpretationRequest {
  slip_number: number;
  temple_code?: string;
  language?: SupportedLanguage;
  level: InterpretationLevel;
  user_context?: UserContext;
  stream?: boolean;
}

// 响应接口
interface AIInterpretationResponse {
  success: boolean;
  data?: {
    fortune_slip: FortuneSlipData;
    ai_interpretation: any;
    usage_info: {
      tokens_used: number;
      cost_estimate: number;
      processing_time_ms: number;
    };
  };
  error?: string;
  meta: {
    request_id: string;
    timestamp: string;
    api_version: string;
    model_used?: string;
  };
}

/**
 * 获取签文数据
 */
async function getFortuneSlipData(
  slipNumber: number,
  templeCode: string = 'guandi',
  language: SupportedLanguage = 'zh-TW'
): Promise<FortuneSlipData | null> {
  try {
    const supabase = getSupabaseAdminClient();
    // 查询关帝庙ID
    const { data: templeData } = await supabase
      .from('temple_systems')
      .select('id, temple_name')
      .eq('temple_code', templeCode)
      .single();

    if (!templeData) {
      console.error(`Temple ${templeCode} not found`);
      return null;
    }

    const languageSuffix = language === 'en-US' ? '_en' : '';

    // 构建查询字段
    const selectFields = [
      'id',
      'slip_number',
      'fortune_level',
      'categories',
      'created_at',
      'updated_at',
      `title${languageSuffix}`,
      `content${languageSuffix}`,
      `basic_interpretation${languageSuffix}`,
      `historical_context${languageSuffix}`,
      `symbolism${languageSuffix}`
    ].join(', ');

    // 查询签文数据
    const { data, error } = await supabase
      .from('fortune_slips')
      .select(selectFields)
      .eq('temple_system_id', templeData.id)
      .eq('slip_number', slipNumber)
      .single();

    if (error || !data) {
      console.error('Fortune slip query error:', error);
      return null;
    }

    // 构建标准化数据
    type FortuneSlipRow = {
      id: string;
      slip_number: number;
      fortune_level?: string;
      categories?: string[];
      title?: string;
      content?: string;
      basic_interpretation?: string;
      historical_context?: string;
      symbolism?: string;
      [key: string]: any;
    };
    const row = data as unknown as FortuneSlipRow;

    return {
      id: row.id,
      slip_number: row.slip_number,
      temple_name: templeData.temple_name,
      fortune_level: row.fortune_level || 'average',
      categories: row.categories || [],
      title: row[`title${languageSuffix}`] || row.title || 'Unknown Title',
      content: row[`content${languageSuffix}`] || row.content || 'No content',
      basic_interpretation: row[`basic_interpretation${languageSuffix}`] || row.basic_interpretation || 'No interpretation',
      historical_context: row[`historical_context${languageSuffix}`] || row.historical_context,
      symbolism: row[`symbolism${languageSuffix}`] || row.symbolism,
      language
    };

  } catch (error) {
    console.error('Error fetching fortune slip:', error);
    return null;
  }
}

/**
 * 验证请求参数
 */
function validateRequest(body: any): { valid: boolean; error?: string; data?: AIInterpretationRequest } {
  if (!body.slip_number || typeof body.slip_number !== 'number') {
    return { valid: false, error: 'slip_number is required and must be a number' };
  }

  if (body.slip_number < 1 || body.slip_number > 100) {
    return { valid: false, error: 'slip_number must be between 1 and 100' };
  }

  if (!body.level || !['basic', 'personalized', 'deep'].includes(body.level)) {
    return { valid: false, error: 'level must be one of: basic, personalized, deep' };
  }

  if (body.language && !['zh-CN', 'zh-TW', 'en-US'].includes(body.language)) {
    return { valid: false, error: 'language must be one of: zh-CN, zh-TW, en-US' };
  }

  // 个性化和深度解读需要用户上下文
  if ((body.level === 'personalized' || body.level === 'deep') && !body.user_context) {
    return { valid: false, error: 'user_context is required for personalized and deep interpretations' };
  }

  return {
    valid: true,
    data: {
      slip_number: body.slip_number,
      temple_code: body.temple_code || 'guandi',
      language: body.language || 'zh-TW',
      level: body.level,
      user_context: body.user_context,
      stream: body.stream || false
    }
  };
}

/**
 * 计算使用成本估算
 */
function calculateCostEstimate(tokenUsage?: any): number {
  if (!tokenUsage) return 0;
  
  // GPT-4价格估算 (简化计算)
  const inputCostPer1k = 0.03; // $0.03 per 1K tokens
  const outputCostPer1k = 0.06; // $0.06 per 1K tokens
  
  const inputCost = (tokenUsage.prompt_tokens / 1000) * inputCostPer1k;
  const outputCost = (tokenUsage.completion_tokens / 1000) * outputCostPer1k;
  
  return Math.round((inputCost + outputCost) * 10000) / 10000; // 4位小数
}

/**
 * POST 请求处理器
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  try {
    // 速率限制（防止AI接口滥用）
    const rl = await checkRateLimitRedis(request as any, {
      maxAttempts: 20,
      windowMs: 60 * 1000,
      blockDurationMs: 5 * 60 * 1000,
      bucket: 'ai_interpret'
    })
    if (!rl.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Too Many Requests',
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          api_version: '2.0-ai',
          retry_after: rl.blockUntil || undefined
        }
      }, { status: 429 })
    }

    // 解析请求体
    const body = await request.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        error: validation.error,
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          api_version: '2.0-ai'
        }
      }, { status: 400 });
    }

    const requestData = validation.data!;

    console.log(`🤖 AI Interpretation Request: Slip ${requestData.slip_number}, Level: ${requestData.level}, Language: ${requestData.language}`);

    // 获取签文数据
    const fortuneSlip = await getFortuneSlipData(
      requestData.slip_number,
      requestData.temple_code,
      requestData.language
    );

    if (!fortuneSlip) {
      return NextResponse.json({
        success: false,
        error: `Fortune slip ${requestData.slip_number} not found`,
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          api_version: '2.0-ai'
        }
      }, { status: 404 });
    }

    // 创建AI解读服务
    let aiService: AIInterpretationService;
    try {
      aiService = createAIInterpretationService();
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'AI service configuration error',
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          api_version: '2.0-ai'
        }
      }, { status: 500 });
    }

    // 生成AI解读
    let aiInterpretation;
    try {
      switch (requestData.level) {
        case 'basic':
          aiInterpretation = await aiService.generateBasicInterpretation(
            fortuneSlip,
            requestData.user_context
          );
          break;
        case 'personalized':
          aiInterpretation = await aiService.generatePersonalizedInterpretation(
            fortuneSlip,
            requestData.user_context!
          );
          break;
        case 'deep':
          aiInterpretation = await aiService.generateDeepInterpretation(
            fortuneSlip,
            requestData.user_context!
          );
          break;
        default:
          throw new Error('Invalid interpretation level');
      }
    } catch (error) {
      console.error('AI interpretation error:', error);
      return NextResponse.json({
        success: false,
        error: 'AI interpretation failed',
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          api_version: '2.0-ai'
        }
      }, { status: 500 });
    }

    const processingTime = Date.now() - startTime;
    const costEstimate = calculateCostEstimate(aiInterpretation.token_usage);

    console.log(`✅ AI Interpretation completed in ${processingTime}ms, tokens: ${aiInterpretation.token_usage?.total_tokens || 'unknown'}`);

    // 构建响应
    const response: AIInterpretationResponse = {
      success: true,
      data: {
        fortune_slip: fortuneSlip,
        ai_interpretation: aiInterpretation,
        usage_info: {
          tokens_used: aiInterpretation.token_usage?.total_tokens || 0,
          cost_estimate: costEstimate,
          processing_time_ms: processingTime
        }
      },
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        api_version: '2.0-ai',
        model_used: aiInterpretation.model_used
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-AI-Model': aiInterpretation.model_used,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        api_version: '2.0-ai'
      }
    }, { status: 500 });
  }
}

// GET 请求返回API文档
export async function GET(): Promise<NextResponse> {
  const apiDoc = {
    name: 'Guandi Fortune AI Interpretation API',
    version: '2.0-ai',
    description: 'AI-powered fortune slip interpretation service with three levels',
    endpoints: {
      POST: {
        description: 'Generate AI interpretation for a fortune slip',
        parameters: {
          slip_number: 'number (1-100, required)',
          temple_code: 'string (optional, default: guandi)',
          language: 'string (zh-CN|zh-TW|en-US, optional, default: zh-TW)',
          level: 'string (basic|personalized|deep, required)',
          user_context: 'object (required for personalized and deep levels)',
          stream: 'boolean (optional, default: false)'
        },
        example: {
          slip_number: 7,
          language: 'zh-TW',
          level: 'personalized',
          user_context: {
            gender: 'female',
            age: 28,
            concern_area: 'career',
            specific_question: '我应该换工作吗？',
            current_situation: '目前工作压力很大，但收入稳定',
            emotional_state: 'anxious'
          }
        }
      }
    },
    interpretation_levels: {
      basic: 'Standard interpretation based on fortune slip content',
      personalized: 'Customized interpretation based on user context',
      deep: 'Comprehensive interpretation with spiritual guidance'
    },
    supported_languages: ['zh-CN', 'zh-TW', 'en-US'],
    model_info: {
      default_model: 'gpt-4',
      max_tokens: 1500,
      temperature: 0.7
    }
  };

  return NextResponse.json(apiDoc, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// 设置运行时
export const runtime = 'nodejs'; // AI服务需要Node.js runtime
