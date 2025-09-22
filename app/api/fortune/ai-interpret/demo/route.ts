/**
 * AI签文解读演示API端点 (不需要真实API密钥)
 * 路径: /api/fortune/ai-interpret/demo
 * 用于演示AI解读功能的模拟版本
 * 
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';
type InterpretationLevel = 'basic' | 'personalized' | 'deep';

interface UserContext {
  gender?: 'male' | 'female';
  age?: number;
  concern_area?: 'career' | 'love' | 'health' | 'finance' | 'study' | 'general';
  specific_question?: string;
  current_situation?: string;
  emotional_state?: 'anxious' | 'hopeful' | 'confused' | 'calm';
}

interface FortuneSlipData {
  id: string;
  slip_number: number;
  temple_name: string;
  fortune_level: string;
  categories: string[];
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  language: SupportedLanguage;
}

/**
 * 获取签文数据
 */
async function getFortuneSlipData(
  slipNumber: number,
  templeCode: string = 'guandi',
  language: SupportedLanguage = 'zh-CN'
): Promise<FortuneSlipData | null> {
  try {
    const supabaseAdmin = getSupabaseAdminClient();
    const { data: templeData } = await supabaseAdmin
      .from('temple_systems')
      .select('id, temple_name')
      .eq('temple_code', templeCode)
      .single();

    if (!templeData) return null;

    const languageSuffix = language === 'en-US' ? '_en' : '';
    const selectFields = [
      'id', 'slip_number', 'fortune_level', 'categories',
      `title${languageSuffix}`, `content${languageSuffix}`,
      `basic_interpretation${languageSuffix}`,
      `historical_context${languageSuffix}`, `symbolism${languageSuffix}`
    ].join(', ');

    const { data, error } = await supabaseAdmin
      .from('fortune_slips')
      .select(selectFields)
      .eq('temple_system_id', templeData.id)
      .eq('slip_number', slipNumber)
      .single();

    if (error || !data) return null;

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
      [key: string]: any;
    };
    const row = data as unknown as FortuneSlipRow;

    return {
      id: row.id,
      slip_number: row.slip_number,
      temple_name: templeData.temple_name,
      fortune_level: row.fortune_level || 'average',
      categories: row.categories || [],
      title: row[`title${languageSuffix}`] || row.title || 'Unknown Title',
      content: row[`content${languageSuffix}`] || row.content || 'No content',
      basic_interpretation: row[`basic_interpretation${languageSuffix}`] || row.basic_interpretation || 'No interpretation',
      historical_context: row[`historical_context${languageSuffix}`] || row.historical_context,
      symbolism: row[`symbolism${languageSuffix}`] || row.symbolism,
      language
    };
  } catch (error) {
    console.error('Error fetching fortune slip:', error);
    return null;
  }
}

/**
 * 生成模拟AI解读
 */
function generateMockInterpretation(
  fortuneSlip: FortuneSlipData,
  level: InterpretationLevel,
  userContext?: UserContext
): string {
  const templates: Record<'zh-CN' | 'zh-TW' | 'en-US', { basic: string; personalized: string; deep: string }> = {
    'zh-CN': {
      basic: `## 🎯 基础解读

**核心含义：**
• ${fortuneSlip.title}代表着转机与希望
• 当前的困境即将迎来转变
• 需要保持耐心和积极的心态

**实用建议：**
• 继续坚持当前的努力方向
• 注意把握即将到来的机会
• 与有经验的人多交流学习

**总体指导：**
此签象征着"否极泰来"，过去的辛苦付出即将有所回报。保持信心，时机成熟时自然会有好的结果。

**注意事项：**
虽然整体趋势向好，但仍需谨慎行事，避免过于急躁。`,

      personalized: `## 🎯 个性化解读

${userContext?.gender ? `**针对${userContext.gender === 'male' ? '男性' : '女性'}的建议：**\n` : ''}
${userContext?.concern_area ? `在${userContext.concern_area === 'career' ? '事业发展' : userContext.concern_area === 'love' ? '感情婚姻' : userContext.concern_area === 'health' ? '健康养生' : userContext.concern_area === 'finance' ? '财运投资' : userContext.concern_area === 'study' ? '学业考试' : '综合运势'}方面，` : ''}${fortuneSlip.title}为您指明了方向。

**核心洞察：**
• 您当前的状况正在发生积极的变化
• ${userContext?.specific_question ? `关于"${userContext.specific_question}"这个问题，签文显示时机即将成熟` : '各方面都将有所改善'}
• ${userContext?.emotional_state === 'anxious' ? '您的焦虑情绪会逐渐缓解' : userContext?.emotional_state === 'confused' ? '困惑的状态即将明朗' : userContext?.emotional_state === 'hopeful' ? '您的希望有实现的可能' : '保持当前的心态状态'}

**个性化建议：**
• ${userContext?.age && userContext.age < 30 ? '年轻有为，要把握机会勇敢行动' : userContext?.age && userContext.age > 40 ? '经验丰富，可以稳重地推进计划' : '正值黄金年龄，是实现目标的好时机'}
• ${userContext?.current_situation ? `基于您的现状（${userContext.current_situation}），建议逐步推进变化` : '根据个人情况制定合适的行动计划'}

**相关领域影响：**
在您关注的${userContext?.concern_area || '各个'}领域，都将有积极的发展。`,

      deep: `## 🎯 深度灵性解读

**灵性指导：**
${fortuneSlip.title}不仅是一个预示，更是宇宙给您的启示。生命中的每一个阶段都有其深层含义，当前的经历正在为您的灵魂成长铺路。

**内在成长方向：**
• 学会在困难中保持内心的宁静
• 理解生活的起伏是自然规律的体现
• 培养对未来的信任和对当下的接纳

**时机分析：**
从天时的角度看，现在是蓄积能量的时期。就像种子在土壤中静默积累力量，您现在的努力正在为未来的突破做准备。

**行动建议：**
• 静心观察生活中的细微变化
• 加强内在修养和精神追求
• 寻找与自己价值观相符的发展道路

**潜在挑战与应对：**
可能会遇到信心动摇的时刻，这是成长过程中的必然。通过冥想、读书或与智者交流来坚定内心。

**长远发展启示：**
这个阶段的经历将成为您人生的转折点。几年后回望，您会发现现在的所有经历都是有意义的安排。

**人生哲学感悟：**
正如古人所说"山重水复疑无路，柳暗花明又一村"，生命的智慧在于学会在变化中找到不变的内在力量。`
    },
    'en-US': {
      basic: `## 🎯 Basic Interpretation

**Core Meaning:**
• ${fortuneSlip.title} represents opportunity and hope
• Current difficulties will soon see positive changes
• Patience and positive attitude are needed

**Practical Advice:**
• Continue persisting in your current efforts
• Pay attention to upcoming opportunities
• Communicate more with experienced people

**Overall Guidance:**
This divination symbolizes "fortune after misfortune" - your past hard work will soon pay off. Keep faith, and good results will naturally come when the time is right.

**Important Notes:**
While the overall trend is positive, still proceed with caution and avoid being too hasty.`,

      personalized: `## 🎯 Personalized Interpretation

${userContext?.gender ? `**Advice for ${userContext.gender === 'male' ? 'men' : 'women'}:**\n` : ''}
In terms of ${userContext?.concern_area || 'your concerns'}, ${fortuneSlip.title} points you in the right direction.

**Core Insights:**
• Your current situation is undergoing positive changes
• ${userContext?.specific_question ? `Regarding "${userContext.specific_question}", the divination shows the timing is approaching` : 'All aspects will improve'}
• ${userContext?.emotional_state === 'anxious' ? 'Your anxiety will gradually ease' : userContext?.emotional_state === 'confused' ? 'The confused state will become clear' : userContext?.emotional_state === 'hopeful' ? 'Your hopes have potential for realization' : 'Maintain your current state of mind'}

**Personalized Suggestions:**
• ${userContext?.age && userContext.age < 30 ? 'Young and promising, seize opportunities and act boldly' : userContext?.age && userContext.age > 40 ? 'Rich in experience, steadily advance your plans' : 'In your prime years, perfect time to achieve goals'}
• ${userContext?.current_situation ? `Based on your current situation, gradually implement changes` : 'Create appropriate action plans based on personal circumstances'}

**Impact on Relevant Areas:**
In the ${userContext?.concern_area || 'various'} areas you focus on, there will be positive developments.`,

      deep: `## 🎯 Deep Spiritual Interpretation

**Spiritual Guidance:**
${fortuneSlip.title} is not just a prediction, but an enlightenment from the universe. Every stage in life has deep meaning, and your current experiences are paving the way for soul growth.

**Inner Growth Direction:**
• Learn to maintain inner peace during difficulties
• Understand that life's ups and downs reflect natural laws
• Cultivate trust in the future and acceptance of the present

**Timing Analysis:**
From a cosmic perspective, now is a time for accumulating energy. Like seeds silently gathering strength in soil, your current efforts are preparing for future breakthroughs.

**Action Recommendations:**
• Quietly observe subtle changes in life
• Strengthen inner cultivation and spiritual pursuits
• Find development paths aligned with your values

**Potential Challenges and Solutions:**
You may face moments of wavering confidence - this is natural in the growth process. Strengthen your resolve through meditation, reading, or conversations with wise people.

**Long-term Development Insights:**
This phase will become a turning point in your life. Looking back years from now, you'll find all current experiences were meaningful arrangements.

**Life Philosophy Reflection:**
As the ancients said, "After winding paths through mountains and rivers where no road seems to exist, suddenly willows provide shade and flowers bloom in another village" - life's wisdom lies in finding unchanging inner strength amid change.`
    },
    'zh-TW': {
      basic: `## 🎯 基礎解讀\n\n**核心含義：**\n• ${fortuneSlip.title}代表著轉機與希望\n• 當前的困境即將迎來轉變\n• 需要保持耐心和積極的心態\n\n**實用建議：**\n• 繼續堅持當前的努力方向\n• 注意把握即將到來的機會\n• 與有經驗的人多交流學習\n\n**總體指導：**\n此籤象徵著「否極泰來」，過去的辛苦付出即將有所回報。保持信心，時機成熟時自然會有好的結果。\n\n**注意事項：**\n雖然整體趨勢向好，但仍需謹慎行事，避免過於急躁。`,
      personalized: `## 🎯 個性化解讀\n\n${userContext?.gender ? `**針對${userContext.gender === 'male' ? '男性' : '女性'}的建議：**\n` : ''}\n${userContext?.concern_area ? `在${userContext.concern_area === 'career' ? '事業發展' : userContext.concern_area === 'love' ? '感情婚姻' : userContext.concern_area === 'health' ? '健康養生' : userContext.concern_area === 'finance' ? '財運投資' : userContext.concern_area === 'study' ? '學業考試' : '綜合運勢'}方面，` : ''}${fortuneSlip.title}為您指明了方向。\n\n**核心洞察：**\n• 您當前的狀況正在發生積極的變化\n• ${userContext?.specific_question ? `關於「${userContext.specific_question}」這個問題，籤文顯示時機即將成熟` : '各方面都將有所改善'}\n• ${userContext?.emotional_state === 'anxious' ? '您的焦慮情緒會逐漸緩解' : userContext?.emotional_state === 'confused' ? '困惑的狀態即將明朗' : userContext?.emotional_state === 'hopeful' ? '您的希望有實現的可能' : '保持當前的心態狀態'}`,
      deep: `## 🎯 深度靈性解讀\n\n**靈性指引：**\n${fortuneSlip.title}不只是預測，更是來自宇宙的啟示。每個階段都有其深刻的意義，而您當前的經歷正為靈魂成長鋪路。\n\n**內在成長方向：**\n• 在困難中學會保持內在的平靜\n• 理解人生的起伏乃是自然法則的展現\n• 培養對未來的信任與對當下的接納\n\n……`
    }
  };

  return templates[fortuneSlip.language]?.[level] || templates['zh-CN'][level] || '模拟解读生成中...';
}

/**
 * POST 请求处理器
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const requestId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  try {
    const body = await request.json();
    const {
      slip_number,
      temple_code = 'guandi',
      language = 'zh-CN',
      level,
      user_context
    } = body;

    // 验证参数
    if (!slip_number || !level) {
      return NextResponse.json({
        success: false,
        error: 'slip_number and level are required',
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          api_version: '2.0-demo'
        }
      }, { status: 400 });
    }

    console.log(`🎭 Demo AI Interpretation: Slip ${slip_number}, Level: ${level}, Language: ${language}`);

    // 获取签文数据
    const fortuneSlip = await getFortuneSlipData(slip_number, temple_code, language);
    if (!fortuneSlip) {
      return NextResponse.json({
        success: false,
        error: `Fortune slip ${slip_number} not found`,
        meta: {
          request_id: requestId,
          timestamp: new Date().toISOString(),
          api_version: '2.0-demo'
        }
      }, { status: 404 });
    }

    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 生成模拟解读
    const interpretation = generateMockInterpretation(fortuneSlip, level, user_context);
    const processingTime = Date.now() - startTime;

    // 构建模拟AI响应
    const aiInterpretation = {
      level,
      language,
      interpretation,
      key_insights: [
        '签文显示积极的发展趋势',
        '需要把握即将到来的机会',
        '保持耐心和积极心态很重要'
      ],
      practical_advice: [
        '继续当前的努力方向',
        '与有经验的人多交流',
        '注意观察环境变化'
      ],
      confidence_score: 0.85,
      interpretation_id: requestId,
      created_at: new Date().toISOString(),
      model_used: 'demo-ai-v1.0',
      token_usage: {
        prompt_tokens: 150,
        completion_tokens: 300,
        total_tokens: 450
      }
    };

    console.log(`✅ Demo interpretation completed in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      data: {
        fortune_slip: fortuneSlip,
        ai_interpretation: aiInterpretation,
        usage_info: {
          tokens_used: 450,
          cost_estimate: 0.0135, // 模拟成本
          processing_time_ms: processingTime
        }
      },
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        api_version: '2.0-demo',
        model_used: 'demo-ai-v1.0',
        note: 'This is a demo version with simulated AI responses'
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Processing-Time': processingTime.toString(),
        'X-AI-Model': 'demo-ai-v1.0',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Demo API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      meta: {
        request_id: requestId,
        timestamp: new Date().toISOString(),
        api_version: '2.0-demo'
      }
    }, { status: 500 });
  }
}

// GET 请求返回演示API文档
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    name: 'Guandi Fortune AI Interpretation Demo API',
    version: '2.0-demo',
    description: 'Demo version of AI-powered fortune slip interpretation (no real API key required)',
    note: 'This is a demonstration version that generates simulated AI responses',
    usage: 'Same as main API but with mock responses',
    example_request: {
      slip_number: 7,
      language: 'zh-CN',
      level: 'basic'
    },
    supported_features: [
      'Three interpretation levels',
      'Multiple languages',
      'Personalized context',
      'Simulated processing delays',
      'Mock token usage statistics'
    ]
  });
}

// 设置运行时
export const runtime = 'nodejs';
