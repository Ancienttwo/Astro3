import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import { getCurrentUnifiedUser } from '@/lib/auth';
import { analyzeFortuneSlipWithDify } from '@/lib/services/dify-integration';
import type { APIResponse } from '@/types/fatebook';

interface FortuneInterpretationRequest {
  temple_code: string;
  slip_number: number;
  user_question?: string;
  categories?: string[];
  language?: string;
}

interface FortuneInterpretationResponse {
  temple_name: string;
  slip_number: number;
  slip_title: string;
  ai_interpretation: string;
  interpretation_language: string;
  user_question?: string;
  categories: string[];
  created_at: string;
}

/**
 * POST /api/fortune/interpret
 * Get AI interpretation of a fortune slip (requires authentication)
 */
export async function POST(request: NextRequest): Promise<NextResponse<APIResponse<FortuneInterpretationResponse>>> {
  try {
    // Check authentication
    const user = await getCurrentUnifiedUser();
    if (!user) {
      return NextResponse.json({
        success: false,
        error: '需要登录',
        details: '获取详细解签需要登录账户'
      }, { status: 401 });
    }

    const body: FortuneInterpretationRequest = await request.json();
    const { temple_code, slip_number, user_question, categories, language = 'zh' } = body;

    console.log('🎋 请求签文AI解读:', { 
      temple_code, 
      slip_number, 
      user_id: user.id,
      language,
      has_question: !!user_question 
    });

    // Validate input
    if (!temple_code || !slip_number) {
      return NextResponse.json({
        success: false,
        error: '缺少必要参数',
        details: '请提供庙宇代码和签号'
      }, { status: 400 });
    }

    // Get fortune slip with temple information
    const supabase = getSupabaseAdminClient();
    const { data: fortuneSlip, error: slipError } = await supabase
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
      .eq('slip_number', slip_number)
      .eq('temple_systems.temple_code', temple_code)
      .eq('temple_systems.is_active', true)
      .eq('is_active', true)
      .single();

    if (slipError || !fortuneSlip) {
      console.log('⚠️ 签文未找到:', { temple_code, slip_number });
      return NextResponse.json({
        success: false,
        error: '签文未找到',
        details: `未找到${temple_code}庙第${slip_number}号签文`
      }, { status: 404 });
    }

    // Prepare data for AI interpretation
    const temple = fortuneSlip.temple_systems;
    const fortuneSlipData = {
      temple_name: getLocalizedField(temple, 'temple_name', language),
      temple_code: temple.temple_code,
      slip_number: fortuneSlip.slip_number,
      display_title: getLocalizedField(fortuneSlip, 'title', language),
      display_content: getLocalizedField(fortuneSlip, 'content', language),
      fortune_level: fortuneSlip.fortune_level,
      categories: categories || fortuneSlip.categories || [],
      user_question: user_question,
      historical_context: getLocalizedField(fortuneSlip, 'historical_context', language),
      symbolism: getLocalizedField(fortuneSlip, 'symbolism', language)
    };

    console.log('🤖 调用AI解签师...', { agent_language: language });

    // Get AI interpretation
    const aiResponse = await analyzeFortuneSlipWithDify(
      fortuneSlipData,
      user.id,
      language
    );

    if (!aiResponse.answer) {
      console.error('❌ AI解读失败: 空响应');
      return NextResponse.json({
        success: false,
        error: 'AI解读失败',
        details: '未能获得有效的解读结果'
      }, { status: 500 });
    }

    // Save interpretation to history
    const { data: historyRecord, error: historyError } = await supabase
      .from('divination_history')
      .insert({
        user_id: user.id,
        fortune_slip_id: fortuneSlip.id,
        temple_system_id: temple.id,
        question: user_question,
        ai_interpretation: aiResponse.answer,
        interpretation_language: language,
        interpretation_type: 'detailed',
        ai_agent: `fortune-master${language !== 'zh' ? `-${language}` : ''}`,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (historyError) {
      console.warn('⚠️ 保存解读历史失败:', historyError);
      // Don't fail the request if history saving fails
    }

    const result: FortuneInterpretationResponse = {
      temple_name: fortuneSlipData.temple_name,
      slip_number: fortuneSlip.slip_number,
      slip_title: fortuneSlipData.display_title,
      ai_interpretation: aiResponse.answer,
      interpretation_language: language,
      user_question: user_question,
      categories: fortuneSlipData.categories,
      created_at: new Date().toISOString()
    };

    console.log(`✅ 签文AI解读完成: ${temple_code} 第${slip_number}号 (${aiResponse.answer.length}字)`);

    return NextResponse.json({
      success: true,
      data: result,
      meta: {
        temple_code,
        slip_number,
        language,
        ai_agent: `fortune-master${language !== 'zh' ? `-${language}` : ''}`,
        user_id: user.id,
        conversation_id: aiResponse.conversation_id,
        saved_to_history: !historyError
      }
    });

  } catch (error) {
    console.error('❌ 签文解读API错误:', error);
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
