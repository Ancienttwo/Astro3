import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface EligibilityRow {
  wallet_address: string;
  total_weight: number;
  checkin_weight: number;
  activity_weight: number;
  referral_weight: number;
  estimated_tokens: number;
  is_eligible?: boolean;
  last_updated: string;
}
import { supabaseReadonly } from '@/lib/supabase-optimized';

// 获取空投资格排行榜
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category') || 'total'; // 'total', 'checkin', 'activity'

    let orderBy = 'total_weight';
    if (category === 'checkin') orderBy = 'checkin_weight';
    else if (category === 'activity') orderBy = 'activity_weight';

    // 获取排行榜数据
    const { data: leaderboardData, error: leaderboardError } = await supabaseReadonly
      .from('airdrop_eligibility')
      .select(`
        wallet_address,
        total_weight,
        checkin_weight,
        activity_weight,
        referral_weight,
        estimated_tokens,
        last_updated
      `)
      .eq('is_eligible', true)
      .order(orderBy, { ascending: false })
      .range(offset, offset + limit - 1);

    if (leaderboardError) {
      console.error('Error fetching leaderboard:', leaderboardError);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // 获取总计数据用于统计
    const { data: totalStats, error: statsError } = await supabaseReadonly
      .from('airdrop_eligibility')
      .select(`
        wallet_address,
        total_weight,
        estimated_tokens
      `)
      .eq('is_eligible', true);

    if (statsError) {
      console.error('Error fetching total stats:', statsError);
    }

    // 计算统计信息
    const stats = calculateLeaderboardStats((totalStats as EligibilityRow[]) || []);

    // 格式化排行榜数据
    const formattedLeaderboard = (leaderboardData as EligibilityRow[] | null)?.map((entry: EligibilityRow, index: number) => ({
      rank: offset + index + 1,
      walletAddress: entry.wallet_address,
      displayAddress: formatWalletAddress(entry.wallet_address),
      totalWeight: entry.total_weight,
      checkinWeight: entry.checkin_weight,
      activityWeight: entry.activity_weight,
      referralWeight: entry.referral_weight,
      estimatedTokens: entry.estimated_tokens,
      lastUpdated: entry.last_updated,
      tier: getTierFromWeight(entry.total_weight),
      percentage: stats.totalWeight > 0 ? (entry.total_weight / stats.totalWeight * 100) : 0
    })) || [];

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: formattedLeaderboard,
        stats,
        pagination: {
          limit,
          offset,
          total: stats.totalUsers,
          hasMore: offset + limit < stats.totalUsers
        },
        category
      }
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 获取用户在排行榜中的位置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    // 获取用户数据
    const { data: userData, error: userError } = await supabaseAdmin
      .from('airdrop_eligibility')
      .select('*')
      .eq('wallet_address', walletAddress.toLowerCase())
      .eq('is_eligible', true)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ 
        success: true, 
        data: { 
          rank: null, 
          message: 'User not found in leaderboard or not eligible' 
        } 
      });
    }

    // 计算用户排名 (比用户权重更高的用户数量 + 1)
    const { count: higherUsers, error: rankError } = await supabaseAdmin
      .from('airdrop_eligibility')
      .select('*', { count: 'exact' })
      .eq('is_eligible', true)
      .gt('total_weight', userData.total_weight);

    if (rankError) {
      console.error('Error calculating rank:', rankError);
      return NextResponse.json({ error: 'Failed to calculate rank' }, { status: 500 });
    }

    const userRank = (higherUsers || 0) + 1;

    // 获取前后用户（用于对比）
    const { data: nearbyUsers, error: nearbyError } = await supabaseAdmin
      .from('airdrop_eligibility')
      .select(`
        wallet_address,
        total_weight,
        estimated_tokens
      `)
      .eq('is_eligible', true)
      .order('total_weight', { ascending: false })
      .range(Math.max(0, userRank - 3), userRank + 2);

    if (nearbyError) {
      console.error('Error fetching nearby users:', nearbyError);
    }

    return NextResponse.json({
      success: true,
      data: {
        rank: userRank,
        userData: {
          walletAddress: userData.wallet_address,
          totalWeight: userData.total_weight,
          estimatedTokens: userData.estimated_tokens,
          tier: getTierFromWeight(userData.total_weight)
        },
        nearbyUsers: (nearbyUsers as EligibilityRow[] | null)?.map((user: EligibilityRow, index: number) => ({
          rank: Math.max(0, userRank - 3) + index + 1,
          walletAddress: user.wallet_address,
          displayAddress: formatWalletAddress(user.wallet_address),
          totalWeight: user.total_weight,
          estimatedTokens: user.estimated_tokens,
          isCurrentUser: user.wallet_address === walletAddress.toLowerCase()
        })) || []
      }
    });

  } catch (error) {
    console.error('User rank API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 计算排行榜统计信息
function calculateLeaderboardStats(data: EligibilityRow[]) {
  if (!data || data.length === 0) {
    return {
      totalUsers: 0,
      totalWeight: 0,
      totalTokens: 0,
      averageWeight: 0,
      averageTokens: 0,
      topTierUsers: 0
    };
  }

  const totalWeight = data.reduce((sum, user) => sum + (user.total_weight || 0), 0);
  const totalTokens = data.reduce((sum, user) => sum + (user.estimated_tokens || 0), 0);
  const topTierUsers = data.filter(user => (user.total_weight || 0) >= 50).length;

  return {
    totalUsers: data.length,
    totalWeight,
    totalTokens,
    averageWeight: data.length > 0 ? totalWeight / data.length : 0,
    averageTokens: data.length > 0 ? totalTokens / data.length : 0,
    topTierUsers
  };
}

// 格式化钱包地址显示
function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 根据权重获取等级
function getTierFromWeight(weight: number): { name: string; color: string; minWeight: number } {
  if (weight >= 50) {
    return { name: 'Platinum', color: 'text-purple-600', minWeight: 50 };
  } else if (weight >= 30) {
    return { name: 'Gold', color: 'text-yellow-600', minWeight: 30 };
  } else if (weight >= 15) {
    return { name: 'Silver', color: 'text-gray-600', minWeight: 15 };
  } else {
    return { name: 'Bronze', color: 'text-orange-600', minWeight: 0 };
  }
}
