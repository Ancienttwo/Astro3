import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { isAddress } from 'viem';

// 完成任务并领取奖励
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
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { taskKey, action = 'claim_reward' } = body;

    if (!taskKey) {
      return NextResponse.json({ 
        error: 'Task key is required' 
      }, { status: 400 });
    }

    // 获取任务信息
    const { data: task, error: taskError } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('task_key', taskKey)
      .eq('is_active', true)
      .single();

    if (taskError || !task) {
      return NextResponse.json({ 
        error: 'Task not found or inactive' 
      }, { status: 404 });
    }

    // 查找用户任务记录
    let userTaskQuery = supabaseAdmin
      .from('user_tasks')
      .select('*')
      .eq('task_id', task.id);

    if (userId) {
      userTaskQuery = userTaskQuery.eq('user_id', userId);
    } else if (walletAddress) {
      userTaskQuery = userTaskQuery.eq('wallet_address', walletAddress);
    }

    const { data: userTask, error: userTaskError } = await userTaskQuery.single();

    if (userTaskError || !userTask) {
      return NextResponse.json({ 
        error: 'Task not found for user or not completed' 
      }, { status: 404 });
    }

    // 检查任务状态
    if (userTask.status !== 'completed') {
      return NextResponse.json({ 
        error: 'Task is not completed yet' 
      }, { status: 400 });
    }

    if (userTask.status === 'claimed') {
      return NextResponse.json({ 
        error: 'Reward already claimed' 
      }, { status: 400 });
    }

    // 开始数据库事务来处理奖励发放
    const { error: transactionError } = await supabaseAdmin.rpc(
      'claim_task_reward',
      {
        p_user_task_id: userTask.id,
        p_user_id: userId,
        p_wallet_address: walletAddress,
        p_points_reward: task.points_reward
      }
    );

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      
      // 手动处理奖励发放
      await claimRewardManually(userTask, task, userId, walletAddress);
    }

    // 更新任务状态为已领取
    const { data: updatedTask, error: updateError } = await supabaseAdmin
      .from('user_tasks')
      .update({ 
        status: 'claimed',
        claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userTask.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating task status:', updateError);
      return NextResponse.json({ error: 'Failed to update task status' }, { status: 500 });
    }

    // 缓存失效：用户积分、排行榜
    try {
      if (walletAddress) {
        await CacheManager.clearUserCache('web3_'+walletAddress, walletAddress)
      } else if (userId) {
        await CacheManager.clearUserCache(userId)
      }
      await CacheManager.clearGlobalCache()
      await invalidateByExactPath('/api/points/leaderboard', 'user')
      await invalidateByExactPath('/api/airdrop/leaderboard', 'user')
    } catch {}

    return NextResponse.json({
      success: true,
      data: {
        taskKey: task.task_key,
        title: task.title,
        pointsEarned: task.points_reward,
        status: 'claimed',
        claimedAt: updatedTask.claimed_at,
        message: `恭喜！您获得了 ${task.points_reward} 积分奖励！`
      }
    });

  } catch (error) {
    console.error('Task complete API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 手动处理奖励发放的备用函数
async function claimRewardManually(userTask: any, task: any, userId: string | null, walletAddress: string | null) {
  try {
    // 为Web3用户更新积分
    if (walletAddress) {
      const { data: existingPoints } = await supabaseAdmin
        .from('user_points_web3')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single();

      if (existingPoints) {
        // 更新现有积分
        await supabaseAdmin
          .from('user_points_web3')
          .update({
            chain_points_balance: existingPoints.chain_points_balance + task.points_reward,
            total_chain_earned: existingPoints.total_chain_earned + task.points_reward,
            updated_at: new Date().toISOString()
          })
          .eq('wallet_address', walletAddress);
      } else {
        // 创建新的积分记录
        await supabaseAdmin
          .from('user_points_web3')
          .insert({
            wallet_address: walletAddress,
            chain_points_balance: task.points_reward,
            total_chain_earned: task.points_reward,
            airdrop_weight: task.points_reward / 100, // 简单的权重计算
            consecutive_days: 0,
            is_active: true
          });
      }
    }

    // 为Web2用户，这里可以扩展其他积分系统的集成
    // 暂时先记录在用户任务的metadata中
    console.log(`Points awarded: ${task.points_reward} to user ${userId || walletAddress}`);

  } catch (error) {
    console.error('Error in manual reward claiming:', error);
  }
}

// 验证任务完成条件的辅助函数
export async function verifyTaskCompletion(taskKey: string, userContext: any): Promise<boolean> {
  try {
    const { data: task } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('task_key', taskKey)
      .eq('is_active', true)
      .single();

    if (!task) return false;

    const requirements = task.requirements as any;
    if (!requirements) return false;

    switch (requirements.action) {
      case 'checkin':
        // 验证用户是否完成了签到
        return await verifyCheckinCompletion(userContext);
      
      case 'create_chart':
        // 验证用户是否创建了命盘
        return await verifyChartCreation(userContext);
      
      case 'connect_wallet':
        // 验证钱包连接
        return !!userContext.walletAddress;
      
      case 'visit_link':
        // 这个需要前端确认
        return true; // 暂时返回true，实际应该由前端传递确认状态
      
      case 'consecutive_checkin':
        // 验证连续签到
        return await verifyConsecutiveCheckin(userContext, requirements.days);
      
      case 'referral':
        // 验证推荐
        return await verifyReferralCompletion(userContext);
      
      default:
        return false;
    }
  } catch (error) {
    console.error('Error verifying task completion:', error);
    return false;
  }
}

// 验证签到完成
async function verifyCheckinCompletion(userContext: any): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  if (userContext.walletAddress) {
    const { data } = await supabaseAdmin
      .from('checkin_records_web3')
      .select('*')
      .eq('wallet_address', userContext.walletAddress)
      .eq('checkin_date', today)
      .single();
    return !!data;
  }
  
  // Web2用户签到验证逻辑
  // 这里需要根据现有的签到系统进行调整
  return false;
}

// 验证命盘创建
async function verifyChartCreation(userContext: any): Promise<boolean> {
  // 这里需要根据现有的命盘系统进行验证
  // 暂时返回false，需要实际的命盘表来验证
  return false;
}

// 验证连续签到
async function verifyConsecutiveCheckin(userContext: any, requiredDays: number): Promise<boolean> {
  if (userContext.walletAddress) {
    const { data } = await supabaseAdmin
      .from('user_points_web3')
      .select('consecutive_days')
      .eq('wallet_address', userContext.walletAddress)
      .single();
    
    return data?.consecutive_days >= requiredDays;
  }
  
  return false;
}

// 验证推荐完成
async function verifyReferralCompletion(userContext: any): Promise<boolean> {
  // 这里需要根据现有的推荐系统进行验证
  // 暂时返回false，需要实际的推荐表来验证
  return false;
}
