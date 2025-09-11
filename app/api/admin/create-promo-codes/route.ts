import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getUserRole } from '@/lib/auth';
import { invalidateByExactPath } from '@/lib/edge/invalidate'

// 生成随机兑换码
function generatePromoCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 确保兑换码唯一性
async function generateUniquePromoCode(supabase: SupabaseClient, length: number = 8): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const code = generatePromoCode(length);
    
    // 检查是否已存在
    const { error } = await supabase
      .from('promo_codes')
      .select('id')
      .eq('code', code)
      .single();
    
    if (error && error.code === 'PGRST116') {
      // 没找到，说明唯一
      return code;
    }
    
    attempts++;
  }
  
  throw new Error('无法生成唯一兑换码，请稍后重试');
}

export async function POST(req: NextRequest) {
  try {
    console.log('开始生成兑换码...');

    // 🔐 严格验证管理员权限
    const userRole = await getUserRole(req);
    if (userRole !== 'admin') {
      console.warn('🚫 非管理员用户尝试创建促销码:', req.headers.get('user-agent'));
      return NextResponse.json(
        { error: '权限不足：需要管理员权限' },
        { status: 403 }
      );
    }
    console.log('✅ 管理员权限验证通过');

    // 解析请求参数
    const body = await req.json();
    const {
      activityName,
      credits,
      quantity = 10,
      expireDays = 30,
      description = ''
    } = body;

    // 参数验证
    if (!activityName || !credits || credits <= 0 || quantity <= 0) {
      return NextResponse.json({
        error: '参数错误',
        details: '活动名称、次数和数量必须大于0'
      }, { status: 400 });
    }

    if (quantity > 1000) {
      return NextResponse.json({
        error: '数量限制',
        details: '单次最多生成1000个兑换码'
      }, { status: 400 });
    }

    // 使用服务密钥创建客户端
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        error: '服务配置错误',
        details: '缺少必要的环境变量'
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 计算过期时间
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + expireDays);

    // 1. 创建运营活动记录
    const { data: activity, error: activityError } = await supabase
      .from('promotion_activities')
      .insert({
        name: activityName,
        type: 'promo_code',
        credits: credits,
        description: description,
        end_date: expireDate.toISOString(),
        status: 'active'
      })
      .select()
      .single();

    if (activityError) {
      console.error('创建活动失败:', activityError);
      return NextResponse.json({
        error: '创建活动失败',
        details: activityError.message
      }, { status: 500 });
    }

    console.log('活动创建成功:', activity.id);

    // 2. 批量生成兑换码
    const promoCodes = [];
    const failedCodes = [];

    for (let i = 0; i < quantity; i++) {
      try {
        const code = await generateUniquePromoCode(supabase);
        promoCodes.push({
          code: code,
          activity_id: activity.id,
          credits: credits,
          expire_date: expireDate.toISOString()
        });
      } catch (error) {
        console.error(`生成第 ${i + 1} 个兑换码失败:`, error);
        failedCodes.push(i + 1);
      }
    }

    if (promoCodes.length === 0) {
      return NextResponse.json({
        error: '兑换码生成失败',
        details: '无法生成任何有效的兑换码'
      }, { status: 500 });
    }

    // 3. 批量插入数据库
    const { data: insertedCodes, error: insertError } = await supabase
      .from('promo_codes')
      .insert(promoCodes)
      .select();

    if (insertError) {
      console.error('插入兑换码失败:', insertError);
      return NextResponse.json({
        error: '保存兑换码失败',
        details: insertError.message
      }, { status: 500 });
    }

    console.log(`成功生成 ${insertedCodes.length} 个兑换码`);

    try { await invalidateByExactPath('/api/admin/create-promo-codes','user') } catch {}

    return NextResponse.json({
      success: true,
      message: `成功生成 ${insertedCodes.length} 个兑换码`,
      data: {
        activity: {
          id: activity.id,
          name: activity.name,
          credits: activity.credits,
          expire_date: expireDate.toISOString()
        },
        codes: insertedCodes.map(code => ({
          id: code.id,
          code: code.code,
          credits: code.credits,
          expire_date: code.expire_date
        })),
        summary: {
          requested: quantity,
          generated: insertedCodes.length,
          failed: failedCodes.length,
          expireDays: expireDays
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('生成兑换码失败:', error);
    return NextResponse.json({
      error: '生成兑换码失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// 获取活动码列表
export async function GET(req: NextRequest) {
  try {
    // 🔐 严格验证管理员权限
    const userRole = await getUserRole(req);
    if (userRole !== 'admin') {
      console.warn('🚫 非管理员用户尝试访问促销码列表:', req.headers.get('user-agent'));
      return NextResponse.json(
        { error: '权限不足：需要管理员权限' },
        { status: 403 }
      );
    }
    console.log('✅ 管理员权限验证通过');

    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get('activityId');

    // 使用服务密钥查询数据
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    let query = supabase
      .from('promotion_activities')
      .select(`
        *,
        promo_codes (
          count
        )
      `)
      .eq('type', 'promo_code')
      .order('created_at', { ascending: false });

    if (activityId) {
      query = query.eq('id', activityId);
    }

    const { data: activities, error } = await query;

    if (error) {
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    return NextResponse.json({ activities });

  } catch (error) {
    console.error('获取活动码列表失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 
