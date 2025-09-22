import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import type { APIResponse } from '@/types/fatebook';

export interface FortuneSlip {
  id: string;
  temple_system_id: string;
  slip_number: number;
  title: string;
  title_en: string | null;
  title_ja: string | null;
  content: string;
  content_en: string | null;
  content_ja: string | null;
  basic_interpretation: string;
  basic_interpretation_en: string | null;
  basic_interpretation_ja: string | null;
  categories: string[];
  fortune_level: 'excellent' | 'good' | 'average' | 'caution' | 'warning';
  historical_context: string | null;
  historical_context_en: string | null;
  historical_context_ja: string | null;
  symbolism: string | null;
  symbolism_en: string | null;
  symbolism_ja: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined temple information
  temple_name?: string;
  temple_code?: string;
  temple_primary_color?: string;
  temple_secondary_color?: string;
}

interface RouteParams {
  params: {
    temple_code: string;
    slip_number: string;
  };
}

/**
 * GET /api/fortune/slips/[temple_code]/[slip_number]
 * Get a specific fortune slip from a temple
 * Returns basic interpretation for anonymous users, full content for authenticated users
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { temple_code, slip_number } = await params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh-CN';
    
    // Parse slip number
    const slipNum = parseInt(slip_number);
    if (isNaN(slipNum) || slipNum < 1) {
      return NextResponse.json({
        success: false,
        error: '无效的签号',
        details: '签号必须是大于0的数字'
      }, { status: 400 });
    }

    console.log('🎋 获取签文:', { temple_code, slip_number: slipNum, language });

    // 尝试使用新的多语言系统
    try {
      const multilingualResult = await supabaseAdmin
        .rpc('get_fortune_slip_by_language', {
          p_temple_code: temple_code,
          p_slip_number: slipNum,
          p_language_code: language
        });

      if (multilingualResult.data && multilingualResult.data.length > 0) {
        const slip = multilingualResult.data[0];
        
        return NextResponse.json({
          success: true,
          data: {
            id: slip.slip_id,
            slip_number: slip.slip_number,
            temple_code: slip.temple_code,
            fortune_level: slip.fortune_level,
            categories: slip.categories || [],
            title: slip.title,
            content: slip.content,
            basic_interpretation: slip.basic_interpretation,
            historical_context: slip.historical_context,
            symbolism: slip.symbolism,
            language: language,
            translation_status: slip.language_code === language ? 'complete' : 'fallback'
          },
          meta: {
            temple_code,
            slip_number: slipNum,
            language,
            multilingual_api: true,
            translation_available: slip.language_code === language
          }
        });
      }
    } catch (multilingualError) {
      console.log('多语言API不可用，回退到原始API:', multilingualError);
    }

    // 回退到原始查询方式
    const { data: fortuneSlip, error } = await supabaseAdmin
      .from('fortune_slips')
      .select(`
        *,
        temple_systems!inner (
          temple_name,
          temple_name_en,
          temple_name_ja,
          temple_code,
          primary_color,
          secondary_color,
          is_active
        )
      `)
      .eq('slip_number', slipNum)
      .eq('temple_systems.temple_code', temple_code)
      .eq('temple_systems.is_active', true)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ 签文未找到:', { temple_code, slip_number: slipNum });
        return NextResponse.json({
          success: false,
          error: '签文未找到',
          details: `未找到${temple_code}庙第${slipNum}号签文`
        }, { status: 404 });
      }

      console.error('❌ 获取签文失败:', error);
      return NextResponse.json({
        success: false,
        error: '获取签文失败',
        details: error.message
      }, { status: 500 });
    }

    // Check if user is authenticated to determine access level
    const authHeader = request.headers.get('authorization');
    const isAuthenticated = authHeader && authHeader.startsWith('Bearer ');

    // Transform data based on language preference and access level
    const temple = fortuneSlip.temple_systems;
    const transformedSlip = {
      ...fortuneSlip,
      // Localized temple information
      temple_name: getLocalizedField(temple, 'temple_name', language),
      temple_code: temple.temple_code,
      temple_primary_color: temple.primary_color,
      temple_secondary_color: temple.secondary_color,
      
      // Localized slip content
      display_title: getLocalizedField(fortuneSlip, 'title', language),
      display_basic_interpretation: getLocalizedField(fortuneSlip, 'basic_interpretation', language),
      display_historical_context: getLocalizedField(fortuneSlip, 'historical_context', language),
      display_symbolism: getLocalizedField(fortuneSlip, 'symbolism', language),
      
      // Full content only for authenticated users
      display_content: isAuthenticated 
        ? getLocalizedField(fortuneSlip, 'content', language)
        : null,
      
      // Access level information
      access_level: isAuthenticated ? 'full' : 'basic',
      requires_auth_for_details: !isAuthenticated
    };

    // Remove the nested temple_systems object to avoid confusion
    const { temple_systems, ...cleanSlip } = transformedSlip;

    console.log(`✅ 成功获取签文: ${temple_code} 第${slipNum}号 (${isAuthenticated ? '完整' : '基础'}访问)`);

    return NextResponse.json({
      success: true,
      data: cleanSlip,
      meta: {
        temple_code,
        slip_number: slipNum,
        language,
        access_level: isAuthenticated ? 'full' : 'basic',
        requires_upgrade: !isAuthenticated
      }
    });

  } catch (error) {
    console.error('❌ 签文API错误:', error);
    return NextResponse.json({
      success: false,
      error: '服务器内部错误',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * Helper function to get localized field value
 */
function getLocalizedField(
  obj: any,
  baseField: string,
  language: string
): string {
  
  switch (language) {
    case 'en':
      return obj[`${baseField}_en`] || obj[baseField] || '';
    case 'ja':
      return obj[`${baseField}_ja`] || obj[baseField] || '';
    default:
      return obj[baseField] || '';
  }
}
