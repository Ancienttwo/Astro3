import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { getCurrentUnifiedUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    console.log('开始兑换码处理...');

    // 获取当前用户
    const user = await getCurrentUnifiedUser();
    if (!user) {
      return NextResponse.json({
        error: '需要登录',
        details: '请先登录后再使用兑换码'
      }, { status: 401 });
    }

    // 解析请求参数
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({
        error: '参数错误',
        details: '请输入有效的兑换码'
      }, { status: 400 });
    }

    // 标准化兑换码（去空格，转大写）
    const normalizedCode = code.trim().toUpperCase();

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

    // 1. 查询兑换码
    const { data: promoCode, error: queryError } = await supabase
      .from('promo_codes')
      .select(`
        *,
        promotion_activities(
          id,
          name,
          type,
          credits,
          status,
          start_date,
          end_date
        )
      `)
      .eq('code', normalizedCode)
      .single();

    if (queryError || !promoCode) {
      console.error('兑换码查询失败:', queryError);
      return NextResponse.json({
        error: '兑换码无效',
        details: '请检查兑换码是否正确'
      }, { status: 400 });
    }

    // 2. 检查兑换码状态
    if (promoCode.is_used) {
      return NextResponse.json({
        error: '兑换码已使用',
        details: `该兑换码已于 ${new Date(promoCode.used_at).toLocaleString()} 被使用`,
        usedBy: promoCode.used_by,
        usedAt: promoCode.used_at
      }, { status: 400 });
    }

    // 3. 检查过期时间
    const now = new Date();
    const expireDate = new Date(promoCode.expire_date);
    if (now > expireDate) {
      return NextResponse.json({
        error: '兑换码已过期',
        details: `该兑换码已于 ${expireDate.toLocaleString()} 过期`,
        expiredAt: promoCode.expire_date
      }, { status: 400 });
    }

    // 4. 检查活动状态
    const activity = promoCode.promotion_activities;
    if (!activity || activity.status !== 'active') {
      return NextResponse.json({
        error: '活动已结束',
        details: '该兑换码对应的活动已结束'
      }, { status: 400 });
    }

    // 5. 检查用户是否已使用过相同活动的兑换码
    const { data: existingGrant, error: grantQueryError } = await supabase
      .from('credit_grants')
      .select('*')
      .eq('user_email', user.email)
      .eq('activity_id', activity.id)
      .eq('source', 'promo_code')
      .single();

    if (existingGrant && !grantQueryError) {
      return NextResponse.json({
        error: '已兑换过',
        details: `您已在 ${new Date(existingGrant.granted_at).toLocaleString()} 兑换过该活动的奖励`,
        previousGrant: {
          credits: existingGrant.credits,
          grantedAt: existingGrant.granted_at
        }
      }, { status: 400 });
    }

    console.log('兑换码验证通过，开始执行兑换...');

    // 6. 开始事务处理
    // 6.1 标记兑换码为已使用
    const { error: updateCodeError } = await supabase
      .from('promo_codes')
      .update({
        is_used: true,
        used_by: user.email,
        used_at: new Date().toISOString()
      })
      .eq('id', promoCode.id);

    if (updateCodeError) {
      console.error('更新兑换码状态失败:', updateCodeError);
      return NextResponse.json({
        error: '兑换失败',
        details: '无法标记兑换码为已使用'
      }, { status: 500 });
    }

    // 6.2 记录次数派发
    const { data: grantRecord, error: grantError } = await supabase
      .from('credit_grants')
      .insert({
        user_email: user.email,
        credits: promoCode.credits,
        source: 'promo_code',
        activity_id: activity.id,
        reason: `兑换码: ${normalizedCode} (${activity.name})`
      })
      .select()
      .single();

    if (grantError) {
      console.error('记录次数派发失败:', grantError);
      
      // 回滚兑换码状态
      await supabase
        .from('promo_codes')
        .update({
          is_used: false,
          used_by: null,
          used_at: null
        })
        .eq('id', promoCode.id);

      return NextResponse.json({
        error: '兑换失败',
        details: '无法记录次数派发'
      }, { status: 500 });
    }

    // 6.3 更新用户剩余次数
    const { data: userUsage, error: usageQueryError } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_email', user.email)
      .single();

    if (usageQueryError && usageQueryError.code !== 'PGRST116') {
      console.error('查询用户使用情况失败:', usageQueryError);
    }

    if (userUsage) {
      // 更新现有记录
      const { error: updateUsageError } = await supabase
        .from('user_usage')
        .update({
          free_credits: (userUsage.free_credits || 0) + promoCode.credits,
          updated_at: new Date().toISOString()
        })
        .eq('user_email', user.email);

      if (updateUsageError) {
        console.error('更新用户次数失败:', updateUsageError);
      }
    } else {
      // 创建新记录
      const { error: createUsageError } = await supabase
        .from('user_usage')
        .insert({
          user_email: user.email,
          free_credits: promoCode.credits,
          used_credits: 0,
          paid_credits: 0
        });

      if (createUsageError) {
        console.error('创建用户使用记录失败:', createUsageError);
      }
    }

    console.log(`兑换成功：用户 ${user.email} 兑换了 ${promoCode.credits} 次`);

    // 缓存失效：用户使用情况
    try { await CacheManager.clearUserCache(user.id) } catch {}
    try { await invalidateByExactPath('/api/user-usage', 'user') } catch {}

    return NextResponse.json({
      success: true,
      message: '兑换成功！',
      data: {
        code: normalizedCode,
        credits: promoCode.credits,
        activity: {
          id: activity.id,
          name: activity.name,
          type: activity.type
        },
        grant: {
          id: grantRecord.id,
          credits: grantRecord.credits,
          grantedAt: grantRecord.granted_at
        },
        user: {
          email: user.email,
          username: user.username
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('兑换码处理失败:', error);
    return NextResponse.json({
      error: '兑换失败',
      details: error instanceof Error ? error.message : '未知错误',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 
