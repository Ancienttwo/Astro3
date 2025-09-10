import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { APIResponse } from '@/types/fatebook';

interface RandomFortuneRequest {
  temple_code: string;
  category?: string;
  question?: string;
  language?: string;
}

interface RandomFortuneResponse {
  temple_code: string;
  slip_number: number;
  temple_name: string;
  redirect_url: string;
  message: string;
}

/**
 * POST /api/fortune/random
 * Generate a random fortune slip number for a specific temple
 */
export async function POST(request: NextRequest): Promise<NextResponse<APIResponse<RandomFortuneResponse>>> {
  try {
    const body: RandomFortuneRequest = await request.json();
    const { temple_code, category, question, language: bodyLanguage } = body;
    const { searchParams } = new URL(request.url);
    const language = bodyLanguage || searchParams.get('language') || 'zh-CN';

    console.log('🎲 生成随机签文:', { temple_code, category, question, language });

    // Validate temple_code
    if (!temple_code) {
      return NextResponse.json({
        success: false,
        error: '缺少庙宇代码',
        details: '请提供有效的庙宇代码'
      }, { status: 400 });
    }

    // Get temple information and available slip numbers
    const { data: temple, error: templeError } = await supabase
      .from('temple_systems')
      .select('id, temple_name, temple_name_en, temple_name_ja, temple_code, total_slips')
      .eq('temple_code', temple_code)
      .eq('is_active', true)
      .single();

    if (templeError || !temple) {
      console.log('⚠️ 庙宇未找到:', temple_code);
      return NextResponse.json({
        success: false,
        error: '庙宇未找到',
        details: `未找到代码为 ${temple_code} 的庙宇`
      }, { status: 404 });
    }

    // Build query for available fortune slips
    let slipQuery = supabase
      .from('fortune_slips')
      .select('slip_number')
      .eq('temple_system_id', temple.id)
      .eq('is_active', true);

    // Filter by category if provided
    if (category) {
      slipQuery = slipQuery.contains('categories', [category]);
    }

    const { data: availableSlips, error: slipsError } = await slipQuery;

    if (slipsError) {
      console.error('❌ 获取可用签文失败:', slipsError);
      return NextResponse.json({
        success: false,
        error: '获取可用签文失败',
        details: slipsError.message
      }, { status: 500 });
    }

    if (!availableSlips || availableSlips.length === 0) {
      console.log('⚠️ 没有可用的签文');
      return NextResponse.json({
        success: false,
        error: '暂无可用签文',
        details: category ? `没有找到分类为"${category}"的签文` : '该庙宇暂无可用签文'
      }, { status: 404 });
    }

    // Generate random slip number from available slips
    const randomIndex = Math.floor(Math.random() * availableSlips.length);
    const selectedSlip = availableSlips[randomIndex];
    const slipNumber = selectedSlip.slip_number;

    // Get localized temple name
    const templeName = getLocalizedField(temple, 'temple_name', language);

    // Generate redirect URL
    const redirectUrl = `/fortune/slips/${temple_code}/${slipNumber}${language !== 'zh' ? `?language=${language}` : ''}`;

    // Generate appropriate message
    const messages = {
      'zh-CN': `您抽到了${templeName}第${slipNumber}号签${category ? `（${category}类）` : ''}`,
      'zh-TW': `您抽到了${templeName}第${slipNumber}號籤${category ? `（${category}類）` : ''}`,
      'en-US': `You have drawn slip #${slipNumber} from ${templeName}${category ? ` (${category} category)` : ''}`,
      en: `You have drawn slip #${slipNumber} from ${templeName}${category ? ` (${category} category)` : ''}`,
      zh: `您抽到了${templeName}第${slipNumber}号签${category ? `（${category}类）` : ''}`,
      ja: `${templeName}第${slipNumber}番の籤を引きました${category ? `（${category}分野）` : ''}`
    };

    console.log(`✅ 成功生成随机签文: ${temple_code} 第${slipNumber}号`);

    return NextResponse.json({
      success: true,
      data: {
        temple_code,
        slip_number: slipNumber,
        temple_name: templeName,
        redirect_url: redirectUrl,
        message: messages[language as keyof typeof messages] || messages['zh-CN']
      },
      meta: {
        temple_code,
        total_available_slips: availableSlips.length,
        category: category || 'all',
        language,
        generation_method: 'random'
      }
    });

  } catch (error) {
    console.error('❌ 随机签文API错误:', error);
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