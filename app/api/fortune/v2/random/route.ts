/**
 * 关帝灵签多语言API v2.0 - 随机签文端点
 * 路径: /api/fortune/v2/random
 * 支持查询参数: ?temple={temple_code}&language={lang}&level={access_level}
 * 
 * 基于PRP文档设计的随机签文功能
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import { 
  withMultilingualSupport, 
  MultilingualAPIMiddleware,
  generateCacheKey,
  ResponseCacheMiddleware
} from '@/lib/middleware/multilingual-api';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';
import type { FortuneSlipV2 } from '../slips/[temple_code]/[slip_number]/route';

/**
 * 获取随机签文
 */
const supabase = getSupabaseAdminClient();

async function getRandomFortuneSlip(
  templeCode: string,
  language: SupportedLanguage,
  accessLevel: 'basic' | 'full' = 'basic'
): Promise<FortuneSlipV2 | null> {
  try {
    // 使用数据库函数获取随机签文
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
      console.log(`❌ No random slip found for temple: ${templeCode}`);
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

    console.log(`✅ Retrieved random slip ${templeCode}/${slip.slip_number} (${language}, ${accessLevel})`);
    return result;

  } catch (error) {
    console.error('Error getting random multilingual slip:', error);
    return null;
  }
}

/**
 * 记录随机签文API使用统计
 */
async function recordRandomAPIUsage(
  request: NextRequest,
  templeCode: string,
  language: SupportedLanguage,
  accessLevel: string,
  slipNumber?: number
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
        action_type: 'random_slip_draw',
        resource_id: slipNumber ? `${templeCode}_${slipNumber}` : `${templeCode}_random`,
        language_code: language,
        metadata: {
          api_version: '2.0',
          access_level: accessLevel,
          temple_code: templeCode,
          slip_number: slipNumber || null,
          endpoint: 'v2/random',
          is_random: true,
          timestamp: new Date().toISOString()
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });
  } catch (error) {
    console.error('Failed to record random API usage:', error);
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
    // 解析查询参数
    const { searchParams } = request.nextUrl;
    const templeCode = searchParams.get('temple') || 'guandi';
    
    // 验证庙宇代码
    const validTempleCodes = ['guandi', 'mazu', 'wenchang']; // 可扩展
    if (!validTempleCodes.includes(templeCode)) {
      return MultilingualAPIMiddleware.createErrorResponse(
        `Invalid temple code. Supported temples: ${validTempleCodes.join(', ')}`,
        language,
        400
      );
    }

    // 检查访问级别
    const authHeader = request.headers.get('authorization');
    const accessLevel: 'basic' | 'full' = authHeader && authHeader.startsWith('Bearer ') 
      ? 'full' 
      : 'basic';

    console.log(`🎲 Random API v2 request: ${templeCode} (${language}, ${accessLevel})`);

    // 获取随机签文数据
    const slip = await getRandomFortuneSlip(templeCode, language, accessLevel);
    
    if (!slip) {
      return MultilingualAPIMiddleware.createErrorResponse(
        `No fortune slips available for temple ${templeCode}`,
        language,
        404
      );
    }

    // 记录使用统计
    await recordRandomAPIUsage(request, templeCode, language, accessLevel, slip.slip_number);

    // 返回成功响应
    const response = MultilingualAPIMiddleware.createResponse(slip, language, {
      translationAvailable: slip.translation_status === 'complete',
      fallbackUsed: slip.translation_status === 'fallback'
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate', // 随机内容不缓存
        'X-API-Version': '2.0',
        'X-Translation-Status': slip.translation_status,
        'X-Access-Level': accessLevel,
        'X-Is-Random': 'true',
        'X-Temple-Code': templeCode
      }
    });

  } catch (error) {
    console.error('Random API v2 error:', error);
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
  cacheHeaders: false // 随机内容不使用缓存头
});

// 设置运行时
export const runtime = 'edge';
