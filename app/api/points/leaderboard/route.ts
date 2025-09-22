import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, getSupabaseReadonlyClient } from '@/lib/server/db';
import { isAddress } from 'viem';
import { ok, err } from '@/lib/api-response'

const supabaseAdmin = getSupabaseAdminClient();
const supabaseReadonly = getSupabaseReadonlyClient();

// 获取积分排行榜
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category') || 'total'; // 'total', 'chain', 'task'

    // 定义排序字段
    let orderBy = 'total_chain_earned';
    let selectFields = `
      wallet_address,
      chain_points_balance,
      total_chain_earned,
      consecutive_days,
      last_checkin_date,
      is_active,
      updated_at
    `;

    if (category === 'chain') {
      orderBy = 'chain_points_balance';
    } else if (category === 'consecutive') {
      orderBy = 'consecutive_days';
    }

    // 获取Web3用户积分排行榜
    const { data: web3Leaderboard, error: web3Error } = await supabaseReadonly
      .from('user_points_web3')
      .select(selectFields)
      .eq('is_active', true)
      .not('wallet_address', 'is', null)
      .order(orderBy, { ascending: false })
      .range(offset, offset + limit - 1);

    if (web3Error) {
      console.error('Error fetching Web3 leaderboard:', web3Error);
      return err(500, 'FETCH_FAILED', 'Failed to fetch leaderboard');
    }

    // 获取统计数据
    const { data: totalStats, error: statsError } = await supabaseReadonly
      .from('user_points_web3')
      .select('wallet_address, chain_points_balance, total_chain_earned, consecutive_days')
      .eq('is_active', true);

    if (statsError) {
      console.error('Error fetching stats:', statsError);
    }

    // 计算统计信息
    const stats = calculatePointsLeaderboardStats(totalStats || []);

    // 格式化排行榜数据
    type Web3PointsRow = {
      wallet_address: string
      chain_points_balance: number
      total_chain_earned: number
      consecutive_days: number
      last_checkin_date: string | null
      updated_at: string
    }

    const rows = (web3Leaderboard as unknown as Web3PointsRow[]) || []

    const formattedLeaderboard = rows.map((entry, index) => {
      const currentPoints = category === 'consecutive' ? entry.consecutive_days : 
                           category === 'chain' ? entry.chain_points_balance :
                           entry.total_chain_earned;

      return {
        rank: offset + index + 1,
        walletAddress: entry.wallet_address,
        displayAddress: formatWalletAddress(entry.wallet_address),
        currentPoints,
        chainPointsBalance: entry.chain_points_balance,
        totalChainEarned: entry.total_chain_earned,
        consecutiveDays: entry.consecutive_days,
        lastCheckinDate: entry.last_checkin_date,
        tier: getTierFromPoints(entry.total_chain_earned),
        percentage: stats.totalPoints > 0 ? (entry.total_chain_earned / stats.totalPoints * 100) : 0,
        lastActive: entry.updated_at
      };
    }) || [];

    return ok({
      leaderboard: formattedLeaderboard,
      stats,
      pagination: {
        limit,
        offset,
        total: stats.totalUsers,
        hasMore: offset + limit < stats.totalUsers
      },
      category,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Points leaderboard API error:', error);
    return err(500, 'INTERNAL_ERROR', 'Internal server error');
  }
}

// 获取用户在排行榜中的位置
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份 - 支持Web2和Web3用户
    let userId: string | null = null;
    let walletAddress: string | null = null;

    // 尝试获取Web3用户信息
    const web3UserHeader = request.headers.get('X-Web3-User');
    if (web3UserHeader) {
      try {
        const web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
        walletAddress = web3User.walletAddress?.toLowerCase();
        if (!isAddress(walletAddress as `0x${string}`)) {
          walletAddress = null;
        }
      } catch (e) {
        console.warn('Failed to parse Web3 user header:', e);
      }
    }

    // 尝试获取Web2用户信息或body中的钱包地址
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ') && !walletAddress) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
        if (!authError && user) {
          userId = user.id;
        }
      } catch (e) {
        console.warn('Failed to authenticate Web2 user:', e);
      }
    }

    // 如果没有认证信息，尝试从请求body获取钱包地址
    if (!userId && !walletAddress) {
      const body = await request.json();
      walletAddress = body.walletAddress?.toLowerCase();
      
      if (!walletAddress || !isAddress(walletAddress as `0x${string}`)) {
        return NextResponse.json({ 
          error: 'Authentication required or valid wallet address needed' 
        }, { status: 401 });
      }
    }

    // 查询用户积分数据
    let userData = null;
    let tableName = 'user_points_web3';
    let userField = 'wallet_address';
    let userValue = walletAddress;

    if (userId && !walletAddress) {
      // Web2用户查询逻辑 - 可能需要根据实际的Web2积分表调整
      tableName = 'user_points'; // 假设的Web2积分表
      userField = 'user_id';
      userValue = userId;
    }

    const { data: userPointsData, error: userError } = await supabaseAdmin
      .from(tableName)
      .select('*')
      .eq(userField, userValue)
      .eq('is_active', true)
      .single();

    if (userError || !userPointsData) {
      return NextResponse.json({
        success: true,
        data: {
          rank: null,
          userData: null,
          message: 'User not found in leaderboard or no points earned yet'
        }
      });
    }

    // 计算用户排名（基于总积分）
    const { count: higherUsers, error: rankError } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gt('total_chain_earned', userPointsData.total_chain_earned);

    if (rankError) {
      console.error('Error calculating rank:', rankError);
      return NextResponse.json({ error: 'Failed to calculate rank' }, { status: 500 });
    }

    const userRank = (higherUsers || 0) + 1;

    // 获取附近用户数据
    const { data: nearbyUsers, error: nearbyError } = await supabaseAdmin
      .from(tableName)
      .select(`
        ${userField},
        chain_points_balance,
        total_chain_earned,
        consecutive_days
      `)
      .eq('is_active', true)
      .order('total_chain_earned', { ascending: false })
      .range(Math.max(0, userRank - 3), userRank + 2);

    if (nearbyError) {
      console.error('Error fetching nearby users:', nearbyError);
    }

    return NextResponse.json({
      success: true,
      data: {
        rank: userRank,
        userData: {
          [userField]: userValue,
          displayAddress: walletAddress ? formatWalletAddress(walletAddress) : `User-${userId?.slice(0, 8)}`,
          chainPointsBalance: userPointsData.chain_points_balance || 0,
          totalChainEarned: userPointsData.total_chain_earned || 0,
          consecutiveDays: userPointsData.consecutive_days || 0,
          tier: getTierFromPoints(userPointsData.total_chain_earned || 0),
          lastCheckinDate: userPointsData.last_checkin_date
        },
        nearbyUsers: nearbyUsers?.map((user, index) => {
          const currentRank = Math.max(0, userRank - 3) + index + 1;
          const isCurrentUser = walletAddress ? 
            user[userField] === walletAddress : 
            user[userField] === userId;

          return {
            rank: currentRank,
            [userField]: user[userField],
            displayAddress: user[userField] && user[userField].startsWith('0x') ? 
              formatWalletAddress(user[userField]) : 
              `User-${user[userField]?.slice(0, 8)}`,
            chainPointsBalance: user.chain_points_balance || 0,
            totalChainEarned: user.total_chain_earned || 0,
            consecutiveDays: user.consecutive_days || 0,
            isCurrentUser
          };
        }) || []
      }
    });

  } catch (error) {
    console.error('User rank API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 计算积分排行榜统计信息
function calculatePointsLeaderboardStats(data: any[]): any {
  if (!data || data.length === 0) {
    return {
      totalUsers: 0,
      totalPoints: 0,
      totalBalance: 0,
      averagePoints: 0,
      averageBalance: 0,
      activeUsers: 0,
      topTierUsers: 0
    };
  }

  const totalPoints = data.reduce((sum: number, user: any) => sum + (user.total_chain_earned || 0), 0);
  const totalBalance = data.reduce((sum: number, user: any) => sum + (user.chain_points_balance || 0), 0);
  const activeUsers = data.filter((user: any) => (user.consecutive_days || 0) > 0).length;
  const topTierUsers = data.filter((user: any) => (user.total_chain_earned || 0) >= 500).length;

  return {
    totalUsers: data.length,
    totalPoints,
    totalBalance,
    averagePoints: data.length > 0 ? totalPoints / data.length : 0,
    averageBalance: data.length > 0 ? totalBalance / data.length : 0,
    activeUsers,
    topTierUsers
  };
}

// 格式化钱包地址显示
function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// 根据积分获取等级
function getTierFromPoints(points: number): { name: string; color: string; minPoints: number } {
  if (points >= 1000) {
    return { name: 'Diamond', color: 'text-blue-600', minPoints: 1000 };
  } else if (points >= 500) {
    return { name: 'Platinum', color: 'text-purple-600', minPoints: 500 };
  } else if (points >= 200) {
    return { name: 'Gold', color: 'text-yellow-600', minPoints: 200 };
  } else if (points >= 50) {
    return { name: 'Silver', color: 'text-gray-600', minPoints: 50 };
  } else {
    return { name: 'Bronze', color: 'text-orange-600', minPoints: 0 };
  }
}
