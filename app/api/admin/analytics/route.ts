import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserRole } from '@/lib/auth';

// 创建服务角色客户端（用于查询所有数据）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('📊 开始获取运营数据分析...');

    // 🔐 严格验证管理员权限
    const userRole = await getUserRole(request);
    if (userRole !== 'admin') {
      console.warn('🚫 非管理员用户尝试访问分析数据:', request.headers.get('user-agent'));
      return NextResponse.json(
        { error: '权限不足：需要管理员权限' },
        { status: 403 }
      );
    }
    console.log('✅ 管理员权限验证通过');

    // 获取时间范围参数
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '30d'; // 默认30天
    const startDate = getStartDate(timeRange);

    // 并行获取各项数据
    const [
      promocodeStats,
      referralStats,
      userStats,
      usageStats,
      activityTrends
    ] = await Promise.all([
      getPromocodeStats(startDate),
      getReferralStats(startDate),
      getUserStats(startDate),
      getUsageStats(startDate),
      getActivityTrends(startDate)
    ]);

    const analytics = {
      timeRange,
      startDate,
      promocodes: promocodeStats,
      referrals: referralStats,
      users: userStats,
      usage: usageStats,
      trends: activityTrends,
      generatedAt: new Date().toISOString()
    };

    console.log('✅ 运营数据分析获取成功');
    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('❌ 获取运营数据分析失败:', error);
    return NextResponse.json({
      success: false,
      error: '数据获取失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

// 根据时间范围获取开始日期
function getStartDate(timeRange: string): string {
  const now = new Date();
  let daysAgo = 30;

  switch (timeRange) {
    case '7d':
      daysAgo = 7;
      break;
    case '30d':
      daysAgo = 30;
      break;
    case '90d':
      daysAgo = 90;
      break;
    case '1y':
      daysAgo = 365;
      break;
  }

  const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return startDate.toISOString();
}

// 获取兑换码统计数据
async function getPromocodeStats(startDate: string) {
  try {
    // 兑换码总数和已使用数量
    const { data: totalCodes } = await supabaseAdmin
      .from('promo_codes')
      .select('id, created_at')
      .gte('created_at', startDate);

    const { data: usedCodes } = await supabaseAdmin
      .from('credit_grants')
      .select('promo_code_id, granted_at, credits')
      .gte('granted_at', startDate)
      .not('promo_code_id', 'is', null);

    // 按活动分组统计
    const { data: activityStats } = await supabaseAdmin
      .from('promotion_activities')
      .select(`
        id, name, type, created_at,
        promo_codes(count),
        credit_grants(credits)
      `)
      .gte('created_at', startDate);

    return {
      total: totalCodes?.length || 0,
      used: usedCodes?.length || 0,
      usageRate: totalCodes?.length ? (usedCodes?.length || 0) / totalCodes.length : 0,
      totalCreditsGranted: usedCodes?.reduce((sum, grant) => sum + (grant.credits || 0), 0) || 0,
      activities: activityStats || []
    };
  } catch (error) {
    console.error('获取兑换码统计失败:', error);
    return { total: 0, used: 0, usageRate: 0, totalCreditsGranted: 0, activities: [] };
  }
}

// 获取推荐系统统计数据
async function getReferralStats(startDate: string) {
  try {
    // 推荐码总数
    const { data: totalReferralCodes } = await supabaseAdmin
      .from('referral_codes')
      .select('id, user_id, created_at')
      .gte('created_at', startDate);

    // 推荐记录
    const { data: referralRecords } = await supabaseAdmin
      .from('referral_records')
      .select('*')
      .gte('created_at', startDate);

    // 推荐奖励发放
    const { data: referralRewards } = await supabaseAdmin
      .from('credit_grants')
      .select('referral_record_id, credits, granted_at')
      .gte('granted_at', startDate)
      .not('referral_record_id', 'is', null);

    return {
      totalReferralCodes: totalReferralCodes?.length || 0,
      totalReferrals: referralRecords?.length || 0,
      successfulReferrals: referralRecords?.filter(r => r.status === 'completed').length || 0,
      totalRewardsCredits: referralRewards?.reduce((sum, reward) => sum + (reward.credits || 0), 0) || 0,
      conversionRate: totalReferralCodes?.length ? 
        (referralRecords?.filter(r => r.status === 'completed').length || 0) / totalReferralCodes.length : 0
    };
  } catch (error) {
    console.error('获取推荐统计失败:', error);
    return { totalReferralCodes: 0, totalReferrals: 0, successfulReferrals: 0, totalRewardsCredits: 0, conversionRate: 0 };
  }
}

// 获取用户统计数据
async function getUserStats(startDate: string) {
  try {
    // 新用户注册
    const { data: newUsers } = await supabaseAdmin
      .from('users')
      .select('id, created_at')
      .gte('created_at', startDate);

    // 活跃用户（有使用记录的用户）
    const { data: activeUsers } = await supabaseAdmin
      .from('user_usage')
      .select('user_id')
      .gte('updated_at', startDate);

    // 用户总数
    const { count: totalUserCount } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' });

    const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id) || []).size;

    return {
      newUsers: newUsers?.length || 0,
      totalUsers: totalUserCount || 0,
      activeUsers: uniqueActiveUsers,
      activationRate: totalUserCount ? uniqueActiveUsers / totalUserCount : 0
    };
  } catch (error) {
    console.error('获取用户统计失败:', error);
    return { newUsers: 0, totalUsers: 0, activeUsers: 0, activationRate: 0 };
  }
}

// 获取使用量统计
async function getUsageStats(startDate: string) {
  try {
    // AI分析使用统计 - 免费次数使用
    const { data: freeUsage } = await supabaseAdmin
      .from('user_usage')
      .select('free_credits_used, updated_at')
      .gte('updated_at', startDate);

    // AI分析使用统计 - 付费次数使用
    const { data: paidUsage } = await supabaseAdmin
      .from('user_usage')
      .select('paid_credits_used, updated_at')
      .gte('updated_at', startDate);

    const totalFreeUsed = freeUsage?.reduce((sum, usage) => sum + (usage.free_credits_used || 0), 0) || 0;
    const totalPaidUsed = paidUsage?.reduce((sum, usage) => sum + (usage.paid_credits_used || 0), 0) || 0;

    return {
      totalAnalyses: totalFreeUsed + totalPaidUsed,
      freeAnalyses: totalFreeUsed,
      paidAnalyses: totalPaidUsed,
      paidConversionRate: (totalFreeUsed + totalPaidUsed) ? totalPaidUsed / (totalFreeUsed + totalPaidUsed) : 0
    };
  } catch (error) {
    console.error('获取使用统计失败:', error);
    return { totalAnalyses: 0, freeAnalyses: 0, paidAnalyses: 0, paidConversionRate: 0 };
  }
}

// 获取活动趋势数据（按天统计）
async function getActivityTrends(startDate: string) {
  try {
    // 简化版趋势数据 - 可以后续扩展为更详细的日期分组统计
    const days = [];
    const start = new Date(startDate);
    const end = new Date();
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push({
        date: d.toISOString().split('T')[0],
        users: 0, // 可以查询具体日期的数据
        registrations: 0,
        promocodeUsage: 0,
        referrals: 0
      });
    }

    return days.slice(-30); // 返回最近30天的数据
  } catch (error) {
    console.error('获取活动趋势失败:', error);
    return [];
  }
} 