/**
 * AI签文解读流式输出API端点
 * 路径: /api/fortune/ai-interpret/stream
 * 支持Server-Sent Events (SSE) 实时流式输出
 * 
 * 基于PRP文档设计的流式AI解读服务
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  createAIInterpretationService,
  type InterpretationLevel,
  type SupportedLanguage,
  type UserContext,
  type FortuneSlipData
} from '@/lib/services/ai-interpretation-service';

// 流式响应事件类型
type StreamEventType = 'start' | 'chunk' | 'complete' | 'error' | 'usage';

interface StreamEvent {
  type: StreamEventType;
  data: any;
  timestamp: string;
}

/**
 * 获取签文数据 (复用逻辑)
 */
async function getFortuneSlipData(
  slipNumber: number,
  templeCode: string = 'guandi',
  language: SupportedLanguage = 'zh-CN'
): Promise<FortuneSlipData | null> {
  try {
    const { data: templeData } = await supabase
      .from('temple_systems')
      .select('id, temple_name')
      .eq('temple_code', templeCode)
      .single();

    if (!templeData) return null;

    const languageSuffix = language === 'en-US' ? '_en' : '';
    const selectFields = [
      'id', 'slip_number', 'fortune_level', 'categories',
      `title${languageSuffix}`, `content${languageSuffix}`,
      `basic_interpretation${languageSuffix}`,
      `historical_context${languageSuffix}`, `symbolism${languageSuffix}`
    ].join(', ');

    const { data, error } = await supabase
      .from('fortune_slips')
      .select(selectFields)
      .eq('temple_system_id', templeData.id)
      .eq('slip_number', slipNumber)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      slip_number: data.slip_number,
      temple_name: templeData.temple_name,
      fortune_level: data.fortune_level || 'average',
      categories: data.categories || [],
      title: data[`title${languageSuffix}`] || data.title || 'Unknown Title',
      content: data[`content${languageSuffix}`] || data.content || 'No content',
      basic_interpretation: data[`basic_interpretation${languageSuffix}`] || data.basic_interpretation || 'No interpretation',
      historical_context: data[`historical_context${languageSuffix}`] || data.historical_context,
      symbolism: data[`symbolism${languageSuffix}`] || data.symbolism,
      language
    };
  } catch (error) {
    console.error('Error fetching fortune slip:', error);
    return null;
  }
}

/**
 * 发送SSE事件
 */
function createSSEMessage(event: StreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

/**
 * POST 请求处理器 - 流式输出
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    // 解析请求参数
    const url = new URL(request.url);
    const slip_number = parseInt(url.searchParams.get('slip_number') || '0');
    const temple_code = url.searchParams.get('temple_code') || 'guandi';
    const language = (url.searchParams.get('language') || 'zh-CN') as SupportedLanguage;
    const level = (url.searchParams.get('level') || 'basic') as InterpretationLevel;

    // 用户上下文可能通过请求体传递
    let userContext: UserContext | undefined;
    try {
      const body = await request.json();
      userContext = body.user_context;
    } catch {
      // 如果没有请求体，使用默认值
      userContext = undefined;
    }

    // 验证参数
    if (!slip_number || slip_number < 1 || slip_number > 100) {
      return new NextResponse('Invalid slip_number parameter', { status: 400 });
    }

    if (!['basic', 'personalized', 'deep'].includes(level)) {
      return new NextResponse('Invalid level parameter', { status: 400 });
    }

    if (!['zh-CN', 'zh-TW', 'en-US'].includes(language)) {
      return new NextResponse('Invalid language parameter', { status: 400 });
    }

    console.log(`🎬 Starting streaming interpretation: Slip ${slip_number}, Level: ${level}, Language: ${language}`);

    // 创建可读流
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          // 发送开始事件
          const startEvent: StreamEvent = {
            type: 'start',
            data: {
              request_id: requestId,
              slip_number,
              level,
              language,
              timestamp: new Date().toISOString()
            },
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(createSSEMessage(startEvent)));

          // 获取签文数据
          const fortuneSlip = await getFortuneSlipData(slip_number, temple_code, language);
          if (!fortuneSlip) {
            const errorEvent: StreamEvent = {
              type: 'error',
              data: { error: 'Fortune slip not found' },
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(createSSEMessage(errorEvent)));
            controller.close();
            return;
          }

          // 创建AI服务
          const aiService = createAIInterpretationService();
          
          // 流式生成解读
          const aiInterpretation = await aiService.generateStreamingInterpretation(
            level,
            fortuneSlip,
            userContext,
            (chunk: string) => {
              // 每收到一个chunk就发送给客户端
              const chunkEvent: StreamEvent = {
                type: 'chunk',
                data: { content: chunk },
                timestamp: new Date().toISOString()
              };
              controller.enqueue(encoder.encode(createSSEMessage(chunkEvent)));
            }
          );

          // 发送完成事件
          const completeEvent: StreamEvent = {
            type: 'complete',
            data: {
              interpretation: aiInterpretation,
              fortune_slip: fortuneSlip
            },
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(createSSEMessage(completeEvent)));

          // 发送使用统计事件
          if (aiInterpretation.token_usage) {
            const usageEvent: StreamEvent = {
              type: 'usage',
              data: {
                tokens_used: aiInterpretation.token_usage.total_tokens,
                model_used: aiInterpretation.model_used,
                request_id: requestId
              },
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(createSSEMessage(usageEvent)));
          }

          console.log(`✅ Streaming interpretation completed for slip ${slip_number}`);
          controller.close();

        } catch (error) {
          console.error('Streaming error:', error);
          const errorEvent: StreamEvent = {
            type: 'error',
            data: { 
              error: error instanceof Error ? error.message : 'Unknown error',
              request_id: requestId
            },
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorEvent)));
          controller.close();
        }
      },

      cancel() {
        console.log('Stream cancelled by client');
      }
    });

    // 返回SSE响应
    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // 禁用Nginx缓冲
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Stream setup error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

/**
 * GET 请求处理器 - 简单的流式演示
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const demo = url.searchParams.get('demo');

  if (demo === 'true') {
    // 创建演示流
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const messages = [
          '🎯 开始AI解读...',
          '📜 正在分析签文内容...',
          '🤔 结合传统智慧与现代理解...',
          '✨ 生成个性化建议...',
          '📝 整理最终解读结果...',
          '✅ 解读完成！'
        ];

        for (let i = 0; i < messages.length; i++) {
          const event: StreamEvent = {
            type: 'chunk',
            data: { content: messages[i] + '\n' },
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(createSSEMessage(event)));
          
          // 模拟延迟
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const completeEvent: StreamEvent = {
          type: 'complete',
          data: { message: 'Demo streaming completed' },
          timestamp: new Date().toISOString()
        };
        controller.enqueue(encoder.encode(createSSEMessage(completeEvent)));
        controller.close();
      }
    });

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });
  }

  // 返回API文档
  return NextResponse.json({
    name: 'AI Interpretation Streaming API',
    version: '2.0-stream',
    description: 'Real-time streaming AI interpretation with Server-Sent Events',
    usage: {
      POST: {
        url: '/api/fortune/ai-interpret/stream',
        parameters: {
          slip_number: 'number (1-100, query param)',
          temple_code: 'string (optional, query param)',
          language: 'string (zh-CN|zh-TW|en-US, query param)',
          level: 'string (basic|personalized|deep, query param)',
          user_context: 'object (optional, request body)'
        },
        response_format: 'Server-Sent Events (text/event-stream)',
        event_types: ['start', 'chunk', 'complete', 'error', 'usage']
      },
      GET: {
        demo: '/api/fortune/ai-interpret/stream?demo=true',
        description: 'Simple streaming demo'
      }
    },
    example_client_code: {
      javascript: `
const eventSource = new EventSource('/api/fortune/ai-interpret/stream?slip_number=7&level=basic&language=zh-CN');

eventSource.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('Event:', data.type, data.data);
  
  switch(data.type) {
    case 'start':
      console.log('Stream started');
      break;
    case 'chunk':
      console.log('Content:', data.data.content);
      break;
    case 'complete':
      console.log('Stream completed');
      eventSource.close();
      break;
    case 'error':
      console.error('Stream error:', data.data.error);
      eventSource.close();
      break;
  }
};
      `
    }
  });
}

// OPTIONS 请求处理CORS
export async function OPTIONS(): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

// 设置运行时
export const runtime = 'nodejs';