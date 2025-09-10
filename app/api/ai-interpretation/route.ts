import { NextRequest, NextResponse } from 'next/server';
import { AIInterpretationService } from '@/lib/services/ai-interpretation-service';

export const runtime = 'edge';

interface InterpretationRequest {
  slip_number: number;
  title: string;
  content: string;
  basic_interpretation: string;
  user_info?: {
    birth_date?: string;
    gender?: string;
    question?: string;
  };
  interpretation_level: 'basic' | 'personalized' | 'deep';
  language?: 'zh' | 'en';
}

export async function POST(request: NextRequest) {
  try {
    const body: InterpretationRequest = await request.json();
    
    // 验证必需参数
    if (!body.slip_number || !body.title || !body.content || !body.interpretation_level) {
      return NextResponse.json({
        success: false,
        error: '缺少必需参数'
      }, { status: 400 });
    }
    
    // 初始化AI服务
    const aiService = new AIInterpretationService({
      provider: 'siliconflow',
      api_key: process.env.SILICONFLOW_API_KEY!,
      base_url: process.env.SILICONFLOW_BASE_URL!,
      model_name: process.env.SILICONFLOW_MODEL!,
      timeout_ms: parseInt(process.env.AI_TIMEOUT_MS || '30000')
    });
    
    const startTime = Date.now();
    
    // 执行AI解读
    const interpretation = await aiService.generateInterpretation(
      body.slip_number,
      body.title,
      body.content,
      body.basic_interpretation,
      body.interpretation_level,
      body.user_info || {},
      body.language || 'zh'
    );
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      interpretation,
      response_time_ms: responseTime,
      model_used: process.env.SILICONFLOW_MODEL,
      slip_number: body.slip_number,
      interpretation_level: body.interpretation_level,
      language: body.language || 'zh'
    });
    
  } catch (error) {
    console.error('AI解读API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '解读服务暂时不可用'
    }, { status: 500 });
  }
}