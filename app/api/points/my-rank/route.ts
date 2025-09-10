import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ethers } from 'ethers';

// 获取当前用户的排名信息
export async function GET(request: NextRequest) {
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
        if (!ethers.isAddress(walletAddress)) {
          walletAddress = null;
        }
      } catch (e) {
        console.warn('Failed to parse Web3 user header:', e);
      }
    }

    // 尝试获取Web2用户信息
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

    if (!userId && !walletAddress) {
      return NextResponse.json({ 
        error: 'Authentication required. Please login or connect wallet.' 
      }, { status: 401 });
    }

    // 查询用户积分数据
    let userData = null;
    let tableName = 'user_points_web3';
    let userField = 'wallet_address';
    let userValue = walletAddress;

    if (userId && !walletAddress) {
      // Web2用户查询逻辑 - 需要根据实际的Web2积分表调整
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
      // 返回默认的新用户状态
      return NextResponse.json({
        success: true,
        data: {
          rank: null,
          userData: {
            [userField]: userValue,
            displayAddress: walletAddress ? formatWalletAddress(walletAddress) : `User-${userId?.slice(0, 8)}`,
            chainPointsBalance: 0,
            totalChainEarned: 0,
            consecutiveDays: 0,
            tier: getTierFromPoints(0),
            isNewUser: true
          },
          stats: await getUserRankStats(),
          message: 'Welcome! Complete your first task to appear on the leaderboard.'
        }
      });
    }

    // 计算用户在总积分排行榜中的排名
    const { count: higherUsersByTotal, error: totalRankError } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gt('total_chain_earned', userPointsData.total_chain_earned);

    if (totalRankError) {
      console.error('Error calculating total rank:', totalRankError);
    }

    const totalRank = (higherUsersByTotal || 0) + 1;

    // 计算用户在余额排行榜中的排名
    const { count: higherUsersByBalance, error: balanceRankError } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gt('chain_points_balance', userPointsData.chain_points_balance);

    if (balanceRankError) {
      console.error('Error calculating balance rank:', balanceRankError);
    }

    const balanceRank = (higherUsersByBalance || 0) + 1;

    // 计算用户在连续签到排行榜中的排名
    const { count: higherUsersByConsecutive, error: consecutiveRankError } = await supabaseAdmin
      .from(tableName)
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .gt('consecutive_days', userPointsData.consecutive_days);

    if (consecutiveRankError) {
      console.error('Error calculating consecutive rank:', consecutiveRankError);
    }

    const consecutiveRank = (higherUsersByConsecutive || 0) + 1;

    // 获取用户完成的任务数量
    let completedTasks = 0;
    let totalTaskPoints = 0;

    try {
      const userTasksQuery = supabaseAdmin
        .from('user_tasks')
        .select('*, tasks!inner(points_reward)')
        .eq('status', 'claimed');

      if (userId) {
        userTasksQuery.eq('user_id', userId);
      } else if (walletAddress) {
        userTasksQuery.eq('wallet_address', walletAddress);
      }

      const { data: userTasks } = await userTasksQuery;
      
      if (userTasks) {
        completedTasks = userTasks.length;
        totalTaskPoints = userTasks.reduce((sum, task) => sum + (task.tasks?.points_reward || 0), 0);
      }
    } catch (e) {
      console.warn('Error fetching user tasks:', e);
    }

    // 获取排名统计信息
    const rankStats = await getUserRankStats();

    // 计算下一个等级需要的积分
    const currentTier = getTierFromPoints(userPointsData.total_chain_earned);
    const nextTier = getNextTier(userPointsData.total_chain_earned);
    const pointsToNextTier = nextTier ? nextTier.minPoints - userPointsData.total_chain_earned : 0;

    return NextResponse.json({
      success: true,
      data: {
        rank: {
          total: totalRank,
          balance: balanceRank,
          consecutive: consecutiveRank
        },
        userData: {
          [userField]: userValue,
          displayAddress: walletAddress ? formatWalletAddress(walletAddress) : `User-${userId?.slice(0, 8)}`,
          chainPointsBalance: userPointsData.chain_points_balance,
          totalChainEarned: userPointsData.total_chain_earned,
          consecutiveDays: userPointsData.consecutive_days,
          lastCheckinDate: userPointsData.last_checkin_date,
          tier: currentTier,
          nextTier,
          pointsToNextTier,
          completedTasks,
          totalTaskPoints,
          isNewUser: false
        },
        stats: rankStats,
        achievements: generateUserAchievements(userPointsData, completedTasks)
      }
    });

  } catch (error) {
    console.error('My rank API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 获取排名统计信息
async function getUserRankStats() {
  try {
    const { data: allUsers, error } = await supabaseAdmin
      .from('user_points_web3')
      .select('total_chain_earned, chain_points_balance, consecutive_days')
      .eq('is_active', true);

    if (error || !allUsers) {
      return {
        totalUsers: 0,
        averagePoints: 0,
        topPercentThreshold: 0
      };
    }

    const totalUsers = allUsers.length;
    const averagePoints = totalUsers > 0 ? 
      allUsers.reduce((sum, user) => sum + (user.total_chain_earned || 0), 0) / totalUsers : 0;
    
    // 计算前10%的分数线
    const sortedUsers = allUsers
      .map(user => user.total_chain_earned || 0)
      .sort((a, b) => b - a);
    
    const top10PercentIndex = Math.floor(totalUsers * 0.1);
    const topPercentThreshold = totalUsers > 0 ? sortedUsers[top10PercentIndex] || 0 : 0;

    return {
      totalUsers,
      averagePoints: Math.round(averagePoints),
      topPercentThreshold
    };
  } catch (e) {
    console.error('Error fetching rank stats:', e);
    return {
      totalUsers: 0,
      averagePoints: 0,
      topPercentThreshold: 0
    };
  }
}

// 生成用户成就
function generateUserAchievements(userData: any, completedTasks: number) {
  const achievements = [];

  // 签到成就
  if (userData.consecutive_days >= 30) {
    achievements.push({ name: '签到达人', description: '连续签到30天', type: 'checkin', earned: true });
  } else if (userData.consecutive_days >= 7) {
    achievements.push({ name: '坚持一周', description: '连续签到7天', type: 'checkin', earned: true });
  }

  // 积分成就
  if (userData.total_chain_earned >= 1000) {
    achievements.push({ name: '积分大师', description: '累计获得1000积分', type: 'points', earned: true });
  } else if (userData.total_chain_earned >= 100) {
    achievements.push({ name: '百分新手', description: '累计获得100积分', type: 'points', earned: true });
  }

  // 任务成就
  if (completedTasks >= 10) {
    achievements.push({ name: '任务专家', description: '完成10个任务', type: 'task', earned: true });
  } else if (completedTasks >= 5) {
    achievements.push({ name: '勤奋新人', description: '完成5个任务', type: 'task', earned: true });
  }

  return achievements;
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

// 获取下一个等级
function getNextTier(points: number): { name: string; color: string; minPoints: number } | null {
  if (points < 50) {
    return { name: 'Silver', color: 'text-gray-600', minPoints: 50 };
  } else if (points < 200) {
    return { name: 'Gold', color: 'text-yellow-600', minPoints: 200 };
  } else if (points < 500) {
    return { name: 'Platinum', color: 'text-purple-600', minPoints: 500 };
  } else if (points < 1000) {
    return { name: 'Diamond', color: 'text-blue-600', minPoints: 1000 };
  }
  return null; // 已达到最高等级
}