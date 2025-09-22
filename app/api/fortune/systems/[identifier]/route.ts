import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseReadonlyClient } from '@/lib/server/db';

const supabase = getSupabaseReadonlyClient();
import type { APIResponse } from '@/types/fatebook';
import type { TempleSystem } from '../route';

interface RouteParams {
  params: {
    identifier: string;
  };
}

/**
 * GET /api/fortune/systems/[identifier]
 * Get a specific temple system by ID or temple_code
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<APIResponse<TempleSystem>>> {
  try {
    const { identifier } = params;
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';

    console.log('🏛️ 获取单个庙宇系统:', { identifier, language });

    // Determine if identifier is UUID or temple_code
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    let query = supabase
      .from('temple_systems')
      .select('*')
      .eq('is_active', true);

    if (isUUID) {
      query = query.eq('id', identifier);
    } else {
      query = query.eq('temple_code', identifier);
    }

    const { data: templeSystem, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('⚠️ 庙宇系统未找到:', identifier);
        return NextResponse.json({
          success: false,
          error: '庙宇系统未找到',
          details: `未找到标识符为 ${identifier} 的庙宇系统`
        }, { status: 404 });
      }

      console.error('❌ 获取庙宇系统失败:', error);
      return NextResponse.json({
        success: false,
        error: '获取庙宇系统失败',
        details: error.message
      }, { status: 500 });
    }

    // Transform data based on language preference
    const transformedSystem = {
      ...templeSystem,
      display_name: getLocalizedField(templeSystem, 'temple_name', language),
      display_description: getLocalizedField(templeSystem, 'description', language),
      display_cultural_context: getLocalizedField(templeSystem, 'cultural_context', language)
    };

    console.log(`✅ 成功获取庙宇系统: ${transformedSystem.display_name}`);

    return NextResponse.json({
      success: true,
      data: transformedSystem,
      meta: {
        language,
        identifier,
        lookup_method: isUUID ? 'id' : 'temple_code'
      }
    });

  } catch (error) {
    console.error('❌ 庙宇系统API错误:', error);
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
  system: any,
  baseField: string,
  language: string
): string {
  
  switch (language) {
    case 'en':
      return system[`${baseField}_en`] || system[baseField] || '';
    case 'ja':
      return system[`${baseField}_ja`] || system[baseField] || '';
    default:
      return system[baseField] || '';
  }
}
