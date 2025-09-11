/**
 * 现有数据结构的关帝灵签API端点
 * 路径: /api/fortune/existing/slips/[slip_number]
 * 支持查询参数: ?language={lang}
 * 
 * 兼容现有数据库结构
 * 作者: SuperClaude
 * 创建日期: 2025-01-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseReadonly as supabase } from '@/lib/supabase-optimized';

// 支持的语言类型
type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

// 签文响应接口
interface FortuneSlipResponse {
  id: string;
  slip_number: number;
  temple_name: string;
  fortune_level: string;
  categories: string[];
  
  // 多语言内容
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  
  // 元数据
  language: SupportedLanguage;
  api_version: string;
  created_at: string;
  updated_at: string;
}

// 路由参数接口
interface RouteParams {
  slip_number: string;
}

/**
 * 获取语言对应的字段后缀
 */
function getLanguageSuffix(language: SupportedLanguage): string {
  switch (language) {
    case 'zh-CN':
      return ''; // 默认字段（简体中文）
    case 'zh-TW':
      return ''; // 繁体中文，目前使用默认字段
    case 'en-US':
      return '_en'; // 英文字段
    default:
      return '';
  }
}

/**
 * 获取签文数据
 */
async function getFortuneSlip(
  slipNumber: number,
  language: SupportedLanguage
): Promise<FortuneSlipResponse | null> {
  try {
    // 查询关帝庙ID
    const { data: templeData } = await supabase
      .from('temple_systems')
      .select('id, temple_name')
      .eq('temple_code', 'guandi')
      .single();

    if (!templeData) {
      console.error('Guandi temple not found');
      return null;
    }

    const languageSuffix = getLanguageSuffix(language);

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

    // 构建响应数据
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
      created_at?: string;
      updated_at?: string;
      [key: string]: any;
    };
    const row = data as unknown as FortuneSlipRow;

    const response: FortuneSlipResponse = {
      id: row.id,
      slip_number: row.slip_number,
      temple_name: templeData.temple_name,
      fortune_level: row.fortune_level || 'average',
      categories: row.categories || [],
      
      // 多语言内容（优先使用指定语言，回退到默认语言）
      title: row[`title${languageSuffix}`] || row.title || 'Unknown Title',
      content: row[`content${languageSuffix}`] || row.content || 'No content available',
      basic_interpretation: row[`basic_interpretation${languageSuffix}`] || row.basic_interpretation || 'No interpretation available',
      historical_context: row[`historical_context${languageSuffix}`] || row.historical_context,
      symbolism: row[`symbolism${languageSuffix}`] || row.symbolism,
      
      // 元数据
      language,
      api_version: '1.0-existing',
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || new Date().toISOString()
    };

    return response;

  } catch (error) {
    console.error('Error fetching fortune slip:', error);
    return null;
  }
}

/**
 * GET 请求处理器
 */
export async function GET(
  request: NextRequest,
  { params }: { params: RouteParams }
): Promise<NextResponse> {
  try {
    const slipNumber = parseInt(params.slip_number);
    const { searchParams } = request.nextUrl;
    const language = (searchParams.get('language') || 'zh-CN') as SupportedLanguage;

    // 验证参数
    if (isNaN(slipNumber) || slipNumber < 1 || slipNumber > 100) {
      return NextResponse.json({
        success: false,
        error: 'Invalid slip number. Must be between 1 and 100.',
        meta: {
          language,
          api_version: '1.0-existing'
        }
      }, { status: 400 });
    }

    // 验证语言
    if (!['zh-CN', 'zh-TW', 'en-US'].includes(language)) {
      return NextResponse.json({
        success: false,
        error: 'Unsupported language. Supported languages: zh-CN, zh-TW, en-US',
        meta: {
          language: 'zh-CN',
          api_version: '1.0-existing'
        }
      }, { status: 400 });
    }

    console.log(`🔍 Fetching slip ${slipNumber} in ${language}...`);

    // 获取签文数据
    const fortuneSlip = await getFortuneSlip(slipNumber, language);

    if (!fortuneSlip) {
      return NextResponse.json({
        success: false,
        error: `Fortune slip ${slipNumber} not found`,
        meta: {
          language,
          api_version: '1.0-existing'
        }
      }, { status: 404 });
    }

    console.log(`✅ Found slip ${slipNumber} in ${language}`);

    return NextResponse.json({
      success: true,
      data: fortuneSlip,
      meta: {
        language,
        api_version: '1.0-existing',
        response_time: new Date().toISOString()
      }
    }, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=600',
        'Content-Language': language,
        'X-API-Version': '1.0-existing'
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      meta: {
        language: 'zh-CN',
        api_version: '1.0-existing'
      }
    }, { status: 500 });
  }
}

// 设置运行时
export const runtime = 'edge';
