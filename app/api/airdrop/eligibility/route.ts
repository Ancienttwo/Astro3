import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { isAddress } from 'viem';

const supabaseAdmin = getSupabaseAdminClient();

// 获取用户空投资格
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address')?.toLowerCase();

    if (!walletAddress || !isAddress(walletAddress as `0x${string}`)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // 获取空投资格信息
    const { data: eligibilityData, error: eligibilityError } = await supabaseAdmin
      .from('airdrop_eligibility')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    if (eligibilityError && eligibilityError.code !== 'PGRST116') {
      console.error('Error fetching eligibility:', eligibilityError);
      return NextResponse.json({ error: 'Failed to fetch eligibility data' }, { status: 500 });
    }

    // 获取用户Web3积分统计
    const { data: pointsData, error: pointsError } = await supabaseAdmin
      .from('user_points_web3')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (pointsError && pointsError.code !== 'PGRST116') {
      console.error('Error fetching points data:', pointsError);
      return NextResponse.json({ error: 'Failed to fetch points data' }, { status: 500 });
    }

    // 获取签到统计
    const { data: checkinStats, error: checkinError } = await supabaseAdmin
      .from('checkin_records_web3')
      .select('checkin_date, consecutive_days, points_earned, airdrop_weight_earned, bnb_paid')
      .eq('wallet_address', walletAddress)
      .order('checkin_date', { ascending: false });

    if (checkinError) {
      console.error('Error fetching checkin stats:', checkinError);
    }

    // 如果没有资格记录，创建一个基础记录
    if (!eligibilityData && pointsData) {
      const { error: createError } = await supabaseAdmin.rpc(
        'update_airdrop_eligibility_for_user',
        { p_wallet_address: walletAddress }
      );

      if (createError) {
        console.error('Error creating eligibility record:', createError);
      }

      // 重新获取创建的记录
      const { data: newEligibilityData } = await supabaseAdmin
        .from('airdrop_eligibility')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      return NextResponse.json({
        success: true,
        data: {
          eligibility: newEligibilityData || null,
          userStats: pointsData || null,
          checkinHistory: checkinStats || [],
          summary: generateEligibilitySummary(newEligibilityData, pointsData, checkinStats || [])
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        eligibility: eligibilityData || null,
        userStats: pointsData || null,
        checkinHistory: checkinStats || [],
        summary: generateEligibilitySummary(eligibilityData, pointsData, checkinStats || [])
      }
    });

  } catch (error) {
    console.error('Airdrop eligibility API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 手动更新用户空投资格
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress || !isAddress(walletAddress as `0x${string}`)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    // 更新空投资格
    const { data: result, error: updateError } = await supabaseAdmin.rpc(
      'update_airdrop_eligibility_for_user',
      { p_wallet_address: walletAddress.toLowerCase() }
    );

    if (updateError) {
      console.error('Error updating airdrop eligibility:', updateError);
      return NextResponse.json({ error: 'Failed to update eligibility' }, { status: 500 });
    }

    // 缓存失效：用户空投缓存与排行榜
    try { await CacheManager.clearUserCache('web3_'+walletAddress.toLowerCase(), walletAddress.toLowerCase()) } catch {}
    try { await CacheManager.clearGlobalCache() } catch {}
    try { await invalidateByExactPath('/api/airdrop/leaderboard', 'user') } catch {}

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Airdrop eligibility updated successfully'
    });

  } catch (error) {
    console.error('Update airdrop eligibility API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 生成空投资格摘要
function generateEligibilitySummary(
  eligibility: any,
  userStats: any,
  checkinHistory: any[]
): any {
  if (!eligibility || !userStats) {
    return {
      isEligible: false,
      totalWeight: 0,
      estimatedTokens: 0,
      rank: 'Not Eligible',
      nextMilestone: null
    };
  }

  const totalWeight = eligibility.total_weight || 0;
  const estimatedTokens = eligibility.estimated_tokens || 0;

  // 计算等级
  let rank = 'Bronze';
  if (totalWeight >= 50) rank = 'Platinum';
  else if (totalWeight >= 30) rank = 'Gold';
  else if (totalWeight >= 15) rank = 'Silver';

  // 计算下一个里程碑
  let nextMilestone = null;
  if (totalWeight < 15) {
    nextMilestone = {
      target: 15,
      current: totalWeight,
      reward: 'Silver Tier',
      progress: (totalWeight / 15) * 100
    };
  } else if (totalWeight < 30) {
    nextMilestone = {
      target: 30,
      current: totalWeight,
      reward: 'Gold Tier',
      progress: (totalWeight / 30) * 100
    };
  } else if (totalWeight < 50) {
    nextMilestone = {
      target: 50,
      current: totalWeight,
      reward: 'Platinum Tier',
      progress: (totalWeight / 50) * 100
    };
  }

  // 统计数据
  const stats = {
    totalCheckins: checkinHistory?.length || 0,
    totalBNBSpent: userStats.total_bnb_spent || 0,
    maxConsecutiveDays: userStats.max_consecutive_days || 0,
    currentStreak: userStats.consecutive_days || 0,
    lastActivity: userStats.last_checkin_date || null
  };

  return {
    isEligible: eligibility.is_eligible,
    totalWeight,
    estimatedTokens,
    rank,
    nextMilestone,
    stats,
    breakdown: {
      checkinWeight: eligibility.checkin_weight || 0,
      activityWeight: eligibility.activity_weight || 0,
      referralWeight: eligibility.referral_weight || 0,
      holdingWeight: eligibility.holding_weight || 0,
      governanceWeight: eligibility.governance_weight || 0
    }
  };
}
