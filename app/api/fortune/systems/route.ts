import { NextRequest, NextResponse } from 'next/server';
import { supabaseReadonly as supabase } from '@/lib/supabase-optimized';
import type { APIResponse } from '@/types/fatebook';

export interface TempleSystem {
  id: string;
  temple_name: string;
  temple_name_en: string | null;
  temple_name_ja: string | null;
  temple_code: string;
  location: string | null;
  deity: string | null;
  specialization: string[];
  total_slips: number;
  description: string | null;
  description_en: string | null;
  description_ja: string | null;
  cultural_context: string | null;
  cultural_context_en: string | null;
  cultural_context_ja: string | null;
  primary_color: string;
  secondary_color: string;
  theme_style: string;
  established_year: number | null;
  is_active: boolean;
  partnership_tier: string;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/fortune/systems
 * Get all active temple systems with optional language filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse<APIResponse<TempleSystem[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'zh';
    const includeInactive = searchParams.get('include_inactive') === 'true';

    console.log('🏛️ 获取庙宇系统列表:', { language, includeInactive });

    // Build query
    let query = supabase
      .from('temple_systems')
      .select('*')
      .order('established_year', { ascending: true });

    // Filter by active status unless specifically requesting inactive
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data: templeSystems, error } = await query;

    if (error) {
      console.error('❌ 获取庙宇系统失败:', error);
      return NextResponse.json({
        success: false,
        error: '获取庙宇系统失败',
        details: error.message
      }, { status: 500 });
    }

    if (!templeSystems || templeSystems.length === 0) {
      console.log('⚠️ 未找到庙宇系统');
      return NextResponse.json({
        success: true,
        data: [],
        message: '暂无可用的庙宇系统'
      });
    }

    // Transform data based on language preference
    const transformedSystems = templeSystems.map(system => ({
      ...system,
      // Use language-specific fields when available
      display_name: getLocalizedField(system, 'temple_name', language),
      display_description: getLocalizedField(system, 'description', language),
      display_cultural_context: getLocalizedField(system, 'cultural_context', language)
    }));

    console.log(`✅ 成功获取 ${transformedSystems.length} 个庙宇系统`);

    return NextResponse.json({
      success: true,
      data: transformedSystems,
      meta: {
        total: transformedSystems.length,
        language,
        include_inactive: includeInactive
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
