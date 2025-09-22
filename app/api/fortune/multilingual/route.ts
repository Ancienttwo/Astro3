// 多语言签文API端点
// 路径: /api/fortune/multilingual
// 支持: GET /api/fortune/multilingual/slips/{temple_code}/{slip_number}?language={lang}
// 创建日期: 2025-01-31

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';

const supabase = getSupabaseAdminClient();

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

// 多语言签文接口
interface MultilingualFortuneSlip {
  slip_id: string;
  slip_number: number;
  temple_code: string;
  fortune_level: string;
  categories: string[];
  language_code: SupportedLanguage;
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  translation_status: 'complete' | 'fallback';
}

// API响应接口
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    language: SupportedLanguage;
    fallback_used: boolean;
    translation_available: boolean;
  };
}

// 语言验证和默认值
function validateLanguage(language: string | null): SupportedLanguage {
  const supportedLanguages: SupportedLanguage[] = ['zh-CN', 'zh-TW', 'en-US'];
  
  if (language && supportedLanguages.includes(language as SupportedLanguage)) {
    return language as SupportedLanguage;
  }
  
  return 'zh-CN'; // 默认简体中文
}

// 获取多语言签文
async function getMultilingualFortuneSlip(
  templeCode: string,
  slipNumber: number,
  language: SupportedLanguage
): Promise<MultilingualFortuneSlip | null> {
  try {
    // 使用存储过程获取签文
    const { data, error } = await supabase
      .rpc('get_fortune_slip_by_language', {
        p_temple_code: templeCode,
        p_slip_number: slipNumber,
        p_language_code: language
      });

    if (error) {
      console.error('Database error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const slip = data[0];
    
    // 检查是否使用了回退数据
    const isComplete = slip.language_code === language;
    
    return {
      slip_id: slip.slip_id,
      slip_number: slip.slip_number,
      temple_code: slip.temple_code,
      fortune_level: slip.fortune_level,
      categories: slip.categories || [],
      language_code: language,
      title: slip.title,
      content: slip.content,
      basic_interpretation: slip.basic_interpretation,
      historical_context: slip.historical_context,
      symbolism: slip.symbolism,
      translation_status: isComplete ? 'complete' : 'fallback'
    };
  } catch (error) {
    console.error('Error fetching multilingual fortune slip:', error);
    return null;
  }
}

// 随机获取多语言签文
async function getRandomMultilingualFortuneSlip(
  templeCode: string,
  language: SupportedLanguage
): Promise<MultilingualFortuneSlip | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_random_fortune_slip', {
        p_temple_code: templeCode,
        p_language_code: language
      });

    if (error) {
      console.error('Database error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const slip = data[0];
    const isComplete = slip.language_code === language;
    
    return {
      slip_id: slip.slip_id,
      slip_number: slip.slip_number,
      temple_code: slip.temple_code,
      fortune_level: slip.fortune_level,
      categories: slip.categories || [],
      language_code: language,
      title: slip.title,
      content: slip.content,
      basic_interpretation: slip.basic_interpretation,
      historical_context: slip.historical_context,
      symbolism: slip.symbolism,
      translation_status: isComplete ? 'complete' : 'fallback'
    };
  } catch (error) {
    console.error('Error fetching random multilingual fortune slip:', error);
    return null;
  }
}

// 记录用户行为
async function recordUserAction(
  action: 'slip_draw' | 'language_switch',
  resourceId: string,
  language: SupportedLanguage,
  request: NextRequest
) {
  try {
    const sessionId = request.headers.get('x-session-id') || 'anonymous';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await supabase
      .from('user_usage_records')
      .insert({
        session_id: sessionId,
        action_type: action,
        resource_id: resourceId,
        language_code: language,
        metadata: {
          endpoint: 'multilingual',
          timestamp: new Date().toISOString()
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Error recording user action:', error);
    // 不影响主要功能，只记录错误
  }
}

// GET 请求处理器
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = validateLanguage(searchParams.get('language'));
    const templeCode = searchParams.get('temple') || 'guandi';
    const slipNumberParam = searchParams.get('slip_number');
    const isRandom = searchParams.get('random') === 'true';

    // 处理随机签文请求
    if (isRandom) {
      const slip = await getRandomMultilingualFortuneSlip(templeCode, language);
      
      if (!slip) {
        return NextResponse.json<APIResponse<null>>({
          success: false,
          error: 'No fortune slips available for the specified temple'
        }, { status: 404 });
      }

      // 记录用户行为
      await recordUserAction('slip_draw', slip.slip_id, language, request);

      return NextResponse.json<APIResponse<MultilingualFortuneSlip>>({
        success: true,
        data: slip,
        meta: {
          language,
          fallback_used: slip.translation_status === 'fallback',
          translation_available: slip.translation_status === 'complete'
        }
      });
    }

    // 处理指定签文请求
    if (!slipNumberParam) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'slip_number parameter is required when random=true is not specified'
      }, { status: 400 });
    }

    const slipNumber = parseInt(slipNumberParam);
    if (isNaN(slipNumber) || slipNumber < 1 || slipNumber > 100) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: 'slip_number must be between 1 and 100'
      }, { status: 400 });
    }

    const slip = await getMultilingualFortuneSlip(templeCode, slipNumber, language);
    
    if (!slip) {
      return NextResponse.json<APIResponse<null>>({
        success: false,
        error: `Fortune slip ${slipNumber} not found for temple ${templeCode}`
      }, { status: 404 });
    }

    // 记录用户行为
    await recordUserAction('slip_draw', slip.slip_id, language, request);

    return NextResponse.json<APIResponse<MultilingualFortuneSlip>>({
      success: true,
      data: slip,
      meta: {
        language,
        fallback_used: slip.translation_status === 'fallback',
        translation_available: slip.translation_status === 'complete'
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json<APIResponse<null>>({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

// 支持的HTTP方法
export const runtime = 'edge';
