/**
 * 关帝灵签多语言API v2.0 - 签文查询端点
 * 路径: /api/fortune/v2/slips/[temple_code]/[slip_number]
 * 支持查询参数: ?language={lang}&level={access_level}
 * 
 * 基于PRP文档设计的完整多语言支持
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  withMultilingualSupport, 
  MultilingualAPIMiddleware,
  generateCacheKey,
  ResponseCacheMiddleware
} from '@/lib/middleware/multilingual-api';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

// 签文详细信息接口
export interface FortuneSlipV2 {
  id: string;
  slip_number: number;
  temple_code: string;
  fortune_level: 'excellent' | 'good' | 'average' | 'caution' | 'warning';
  categories: string[];
  
  // 多语言内容
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  keywords?: string[];
  
  // 元数据
  language: SupportedLanguage;
  translation_status: 'complete' | 'fallback' | 'missing';
  fallback_language?: SupportedLanguage;
  
  // API信息
  api_version: string;
  access_level: 'basic' | 'full';
  created_at: string;
  updated_at: string;
}

// 路由参数接口
interface RouteParams {
  params: {
    temple_code: string;
    slip_number: string;
  };
}

/**
 * 获取签文的多语言内容
 */
async function getFortuneSlipMultilingual(
  templeCode: string,
  slipNumber: number,
  language: SupportedLanguage,
  accessLevel: 'basic' | 'full' = 'basic'
): Promise<FortuneSlipV2 | null> {
  try {
    // 生成缓存键
    const cacheKey = generateCacheKey(
      'fortune_slip',
      { temple_code: templeCode, slip_number: slipNumber, access_level: accessLevel },
      language
    );

    // 尝试从缓存获取
    const cached = ResponseCacheMiddleware.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit for slip ${templeCode}/${slipNumber} (${language})`);
      return cached;
    }

    // 使用新的多语言查询函数
    const { data, error } = await supabase
      .rpc('get_fortune_slip_multilingual', {
        p_temple_code: templeCode,
        p_slip_number: slipNumber,
        p_language_code: language
      });

    if (error) {
      console.error('Database error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`❌ No slip found: ${templeCode}/${slipNumber}`);
      return null;
    }

    const slip = data[0];
    
    // 构建响应对象
    const result: FortuneSlipV2 = {
      id: slip.id,
      slip_number: slip.slip_number,
      temple_code: slip.temple_code,
      fortune_level: slip.fortune_level,
      categories: slip.categories || [],
      
      title: slip.title || 'Title not available',
      content: accessLevel === 'full' ? (slip.content || 'Content not available') : '',
      basic_interpretation: slip.basic_interpretation || 'Interpretation not available',
      historical_context: accessLevel === 'full' ? slip.historical_context : undefined,
      symbolism: accessLevel === 'full' ? slip.symbolism : undefined,
      keywords: slip.keywords || [],
      
      language,
      translation_status: slip.language_code === language ? 'complete' : 'fallback',
      fallback_language: slip.language_code !== language ? (slip.language_code as SupportedLanguage) : undefined,
      
      api_version: '2.0',
      access_level: accessLevel,
      created_at: slip.created_at,
      updated_at: slip.updated_at
    };

    // 缓存结果（5分钟）
    ResponseCacheMiddleware.set(cacheKey, result, 300);

    console.log(`✅ Retrieved slip ${templeCode}/${slipNumber} (${language}, ${accessLevel})`);
    return result;

  } catch (error) {
    console.error('Error getting multilingual slip:', error);
    return null;
  }
}

/**
 * 记录API使用统计
 */
async function recordAPIUsage(
  request: NextRequest,
  templeCode: string,
  slipNumber: number,
  language: SupportedLanguage,
  accessLevel: string
): Promise<void> {
  try {
    const sessionId = request.headers.get('x-session-id') || 'anonymous';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    await supabase
      .from('usage_records')
      .insert({
        session_id: sessionId,
        action_type: 'slip_query',
        resource_id: `${templeCode}_${slipNumber}`,
        language_code: language,
        metadata: {
          api_version: '2.0',
          access_level: accessLevel,
          temple_code: templeCode,
          slip_number: slipNumber,
          endpoint: 'v2/slips',
          timestamp: new Date().toISOString()
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Failed to record API usage:', error);
    // 不影响主要功能
  }
}

/**
 * GET 请求处理器
 */
async function handleGetRequest(
  request: NextRequest,
  language: SupportedLanguage
): Promise<NextResponse> {
  try {
    // 解析路径参数
    const pathname = request.nextUrl.pathname;
    const pathParts = pathname.split('/');
    const templeCode = pathParts[pathParts.length - 2];
    const slipNumberStr = pathParts[pathParts.length - 1];

    // 验证参数
    if (!templeCode || !slipNumberStr) {
      return MultilingualAPIMiddleware.createErrorResponse(
        'Invalid path parameters',
        language,
        400
      );
    }

    const slipNumber = parseInt(slipNumberStr);
    if (isNaN(slipNumber) || slipNumber < 1 || slipNumber > 100) {
      return MultilingualAPIMiddleware.createErrorResponse(
        'Slip number must be between 1 and 100',
        language,
        400
      );
    }

    // 检查访问级别
    const authHeader = request.headers.get('authorization');
    const accessLevel: 'basic' | 'full' = authHeader && authHeader.startsWith('Bearer ') 
      ? 'full' 
      : 'basic';

    console.log(`🎋 API v2 request: ${templeCode}/${slipNumber} (${language}, ${accessLevel})`);

    // 获取签文数据
    const slip = await getFortuneSlipMultilingual(templeCode, slipNumber, language, accessLevel);
    
    if (!slip) {
      return MultilingualAPIMiddleware.createErrorResponse(
        `Fortune slip ${slipNumber} not found for temple ${templeCode}`,
        language,
        404
      );
    }

    // 记录使用统计
    await recordAPIUsage(request, templeCode, slipNumber, language, accessLevel);

    // 返回成功响应
    const response = MultilingualAPIMiddleware.createResponse(slip, language, {
      translationAvailable: slip.translation_status === 'complete',
      fallbackUsed: slip.translation_status === 'fallback'
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600', // 5分钟浏览器缓存，10分钟CDN缓存
        'X-API-Version': '2.0',
        'X-Translation-Status': slip.translation_status,
        'X-Access-Level': accessLevel
      }
    });

  } catch (error) {
    console.error('API v2 error:', error);
    return MultilingualAPIMiddleware.createErrorResponse(
      'Internal server error',
      language,
      500
    );
  }
}

// 使用多语言中间件包装处理器
export const GET = withMultilingualSupport(handleGetRequest, {
  enableAutoDetection: true,
  fallbackLanguage: 'zh-CN',
  setCookies: true,
  trackUsage: true,
  cacheHeaders: true
});

// 设置运行时
export const runtime = 'edge';
