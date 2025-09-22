import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import { isAddress } from 'viem';
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

const supabaseAdmin = getSupabaseAdminClient();

// 筊杯投掷结果处理 API
export async function POST(request: NextRequest) {
  try {
    // 验证 Web3 用户身份
    let walletAddress: string | null = null;

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

    if (!walletAddress) {
      return NextResponse.json({ 
        error: 'Web3 wallet connection required' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { drawId, outcome } = body;

    if (!drawId || !outcome) {
      return NextResponse.json({ 
        error: 'Draw ID and outcome are required' 
      }, { status: 400 });
    }

    // 验证筊杯结果
    const validOutcomes = ['正正', '正反', '反反'];
    if (!validOutcomes.includes(outcome)) {
      return NextResponse.json({ 
        error: 'Invalid jiaobei outcome' 
      }, { status: 400 });
    }

    // 获取抽签记录
    const { data: drawRecord, error: fetchError } = await supabaseAdmin
      .from('guandi_daily_draws')
      .select('*')
      .eq('id', drawId)
      .eq('wallet_address', walletAddress)
      .single();

    if (fetchError || !drawRecord) {
      return NextResponse.json({ 
        error: 'Draw record not found or access denied' 
      }, { status: 404 });
    }

    // 检查抽签状态
    if (drawRecord.current_state !== 'in_progress') {
      return NextResponse.json({ 
        error: 'Draw is not in progress' 
      }, { status: 400 });
    }

    // 处理筊杯结果
    const currentResults = drawRecord.jiaobei_results || [];
    const newResults = [...currentResults, outcome];
    
    let newState = drawRecord.current_state;
    let newConsecutiveSuccesses = drawRecord.consecutive_successes;
    let pointsEarned = 0;

    switch (outcome) {
      case '正反': // 成功
        newConsecutiveSuccesses += 1;
        if (newConsecutiveSuccesses >= 3) {
          // 成功获得签文！
          newState = 'success';
          pointsEarned = await calculateFortunePoints(drawRecord.fortune_slip_id, newConsecutiveSuccesses);
          
          // 记录到签文历史
          await recordFortuneHistory(
            walletAddress, 
            drawRecord.fortune_slip_id, 
            drawRecord,
            newResults,
            pointsEarned
          );
          
          // 更新用户积分和统计
          await updateUserStats(walletAddress, pointsEarned, 'success');
          
          // 检查并完成相关任务
          await checkAndCompleteGuandiTasks(walletAddress);
        }
        break;

      case '正正': // 神明在笑，重新开始
        newConsecutiveSuccesses = 0;
        // 状态保持 in_progress
        break;

      case '反反': // 失败
        newState = 'failed';
        newConsecutiveSuccesses = 0;
        // 更新用户统计（失败不计入连续天数）
        await updateUserStats(walletAddress, 0, 'failed');
        break;
    }

    // 更新抽签记录
    const { data: updatedDraw, error: updateError } = await supabaseAdmin
      .from('guandi_daily_draws')
      .update({
        current_state: newState,
        consecutive_successes: newConsecutiveSuccesses,
        jiaobei_results: newResults,
        luck_points_earned: pointsEarned,
        updated_at: new Date().toISOString()
      })
      .eq('id', drawId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating draw record:', updateError);
      return NextResponse.json({ error: 'Failed to update draw record' }, { status: 500 });
    }

    // 准备响应数据
    const response: any = {
      success: true,
      data: {
        outcome,
        consecutiveSuccesses: newConsecutiveSuccesses,
        gameState: newState,
        message: getOutcomeMessage(outcome, newConsecutiveSuccesses, newState),
        totalResults: newResults
      }
    };

    if (newState === 'success') {
      response.data.pointsEarned = pointsEarned;
      response.data.canMintNFT = true;
      response.data.completedTasks = await getCompletedTasks(walletAddress);
    }

    // 缓存失效：用户相关与可缓存的公共读取
    try {
      await CacheManager.clearUserCache('web3_'+walletAddress, walletAddress)
      await CacheManager.clearGlobalCache()
      await invalidateByExactPath(`/api/guandi/draw?wallet_address=${walletAddress}`,'astrology')
      await invalidateByExactPath(`/api/guandi/gallery?wallet_address=${walletAddress}`,'astrology')
      await invalidateByExactPath('/api/points/leaderboard','user')
      await invalidateByExactPath('/api/airdrop/leaderboard','user')
    } catch {}

    return NextResponse.json(response);

  } catch (error) {
    console.error('Jiaobei API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 计算签文获得的积分
async function calculateFortunePoints(fortuneSlipId: string, consecutiveSuccesses: number): Promise<number> {
  // 获取签文等级
  const { data: slip, error } = await supabaseAdmin
    .from('fortune_slips')
    .select('fortune_level, slip_number')
    .eq('id', fortuneSlipId)
    .single();

  if (error || !slip) {
    return 50; // 默认积分
  }

  // 根据签文等级给予积分
  let basePoints = 50;
  switch (slip.fortune_level) {
    case 'excellent': basePoints = 100; break;
    case 'good': basePoints = 80; break;
    case 'average': basePoints = 60; break;
    case 'caution': basePoints = 40; break;
    case 'warning': basePoints = 30; break;
    default: basePoints = 50;
  }

  // 连续成功奖励
  const streakBonus = Math.max(0, (consecutiveSuccesses - 3) * 10);

  return basePoints + streakBonus;
}

// 记录签文历史
async function recordFortuneHistory(
  walletAddress: string, 
  fortuneSlipId: string, 
  drawRecord: any,
  jiaobeiResults: string[],
  pointsEarned: number
) {
  // 获取签文信息
  const { data: slip } = await supabaseAdmin
    .from('fortune_slips')
    .select('slip_number, fortune_level')
    .eq('id', fortuneSlipId)
    .single();

  const { error } = await supabaseAdmin
    .from('guandi_fortune_history')
    .insert({
      wallet_address: walletAddress,
      fortune_slip_id: fortuneSlipId,
      slip_number: slip?.slip_number || 0,
      jiaobei_session_data: {
        results: jiaobeiResults,
        total_attempts: jiaobeiResults.length,
        consecutive_successes: drawRecord.consecutive_successes + 1
      },
      luck_points_earned: pointsEarned,
      fortune_level: slip?.fortune_level || 'average'
    });

  if (error) {
    console.error('Error recording fortune history:', error);
  }
}

// 更新用户统计数据
async function updateUserStats(walletAddress: string, pointsEarned: number, result: 'success' | 'failed') {
  try {
    // 获取或创建用户积分记录
    const { data: existingPoints, error: fetchError } = await supabaseAdmin
      .from('user_points_web3')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    const today = new Date().toISOString().split('T')[0];
    let consecutiveStreak = 0;
    let maxStreak = 0;

    if (result === 'success') {
      // 计算连续天数
      const lastDrawDate = existingPoints?.last_guandi_draw_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (lastDrawDate === yesterdayStr) {
        // 连续抽签
        consecutiveStreak = (existingPoints?.guandi_consecutive_streak || 0) + 1;
      } else if (lastDrawDate === today) {
        // 今天已经抽过签（不应该发生，但防止数据异常）
        consecutiveStreak = existingPoints?.guandi_consecutive_streak || 1;
      } else {
        // 中断了连续抽签
        consecutiveStreak = 1;
      }
      
      maxStreak = Math.max(consecutiveStreak, existingPoints?.guandi_max_streak || 0);
    } else {
      // 失败不影响连续天数（因为每天只有一次机会）
      consecutiveStreak = existingPoints?.guandi_consecutive_streak || 0;
      maxStreak = existingPoints?.guandi_max_streak || 0;
    }

    const updateData = {
      chain_points_balance: (existingPoints?.chain_points_balance || 0) + pointsEarned,
      total_chain_earned: (existingPoints?.total_chain_earned || 0) + pointsEarned,
      guandi_fortune_draws_count: (existingPoints?.guandi_fortune_draws_count || 0) + 1,
      guandi_consecutive_streak: consecutiveStreak,
      guandi_max_streak: maxStreak,
      last_guandi_draw_date: result === 'success' ? today : existingPoints?.last_guandi_draw_date,
      updated_at: new Date().toISOString()
    };

    if (existingPoints) {
      // 更新现有记录
      const { error: updateError } = await supabaseAdmin
        .from('user_points_web3')
        .update(updateData)
        .eq('wallet_address', walletAddress);
      
      if (updateError) {
        console.error('Error updating user stats:', updateError);
      }
    } else {
      // 创建新记录
      const { error: insertError } = await supabaseAdmin
        .from('user_points_web3')
        .insert({
          wallet_address: walletAddress,
          ...updateData,
          is_active: true
        });
      
      if (insertError) {
        console.error('Error creating user stats:', insertError);
      }
    }

  } catch (error) {
    console.error('Error in updateUserStats:', error);
  }
}

// 检查并完成关帝相关任务
async function checkAndCompleteGuandiTasks(walletAddress: string) {
  try {
    // 获取用户统计数据
    const { data: userStats } = await supabaseAdmin
      .from('user_points_web3')
      .select('guandi_fortune_draws_count, guandi_consecutive_streak, total_chain_earned')
      .eq('wallet_address', walletAddress)
      .single();

    if (!userStats) return [];

    const tasksToComplete = [];

    // 首次求签任务
    if (userStats.guandi_fortune_draws_count === 1) {
      tasksToComplete.push('guandi_first_draw');
    }

    // 连续求签任务
    if (userStats.guandi_consecutive_streak === 3) {
      tasksToComplete.push('guandi_daily_streak_3');
    }
    if (userStats.guandi_consecutive_streak === 7) {
      tasksToComplete.push('guandi_daily_streak_7');
    }

    // 积分里程碑任务
    if (userStats.total_chain_earned >= 1000) {
      tasksToComplete.push('guandi_collect_points');
    }

    // 更新任务状态
    for (const taskKey of tasksToComplete) {
      // 调用现有的任务系统 API
      await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Web3-User': Buffer.from(JSON.stringify({ walletAddress })).toString('base64')
        },
        body: JSON.stringify({
          taskKey,
          action: 'complete',
          progress: 1
        })
      });
    }

    return tasksToComplete;
  } catch (error) {
    console.error('Error checking Guandi tasks:', error);
    return [];
  }
}

// 获取已完成的任务
async function getCompletedTasks(walletAddress: string): Promise<string[]> {
  const { data: completedTasks } = await supabaseAdmin
    .from('user_tasks')
    .select('task_id, tasks(task_key)')
    .eq('wallet_address', walletAddress)
    .eq('status', 'completed')
    .in('tasks.task_key', [
      'guandi_first_draw', 
      'guandi_daily_streak_3', 
      'guandi_daily_streak_7',
      'guandi_collect_points'
    ]);

  const keys = completedTasks?.map((t: { tasks?: { task_key?: string } }) => t.tasks?.task_key) || [];
  return keys.filter((k): k is string => typeof k === 'string');
}

// 获取结果消息
function getOutcomeMessage(outcome: string, consecutiveSuccesses: number, gameState: string): string {
  switch (outcome) {
    case '正反':
      if (gameState === 'success') {
        return `神明同意！连续${consecutiveSuccesses}次成功，获得灵签指引！`;
      } else {
        return `神明同意！已连续成功${consecutiveSuccesses}次，继续投掷筊杯...`;
      }
    case '正正':
      return '神明在笑，心意不够虔诚，请重新投掷筊杯';
    case '反反':
      return '缘分未到，请明日再来求签';
    default:
      return '未知结果';
  }
}
