import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ethers } from 'ethers';

// 关帝灵签每日抽签 API
export async function POST(request: NextRequest) {
  try {
    // 验证 Web3 用户身份
    let walletAddress: string | null = null;

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

    if (!walletAddress) {
      return NextResponse.json({ 
        error: 'Web3 wallet connection required for Guandi fortune drawing' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { action = 'start_draw' } = body;

    // 检查每日抽签限制
    const today = new Date().toISOString().split('T')[0];
    const { data: existingDraw, error: checkError } = await supabaseAdmin
      .from('guandi_daily_draws')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('draw_date', today)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking daily draw:', checkError);
      return NextResponse.json({ error: 'Failed to check daily draw status' }, { status: 500 });
    }

    // 如果今天已经成功抽签，返回错误
    if (existingDraw?.current_state === 'success') {
      return NextResponse.json({ 
        error: 'Already completed fortune drawing today',
        data: {
          canDrawToday: false,
          nextDrawTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          todayResult: {
            slipNumber: existingDraw.fortune_slip_id,
            luckPointsEarned: existingDraw.luck_points_earned
          }
        }
      }, { status: 400 });
    }

    // 如果今天已经失败，也不能再抽
    if (existingDraw?.current_state === 'failed') {
      return NextResponse.json({ 
        error: 'Daily fortune drawing failed today, please try tomorrow',
        data: {
          canDrawToday: false,
          nextDrawTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
      }, { status: 400 });
    }

    if (action === 'start_draw') {
      // 随机选择一个关帝签文
      const { data: randomSlip, error: slipError } = await supabaseAdmin
        .from('fortune_slips')
        .select(`
          id,
          slip_number,
          title,
          content,
          basic_interpretation,
          historical_context,
          symbolism,
          fortune_level,
          categories
        `)
        .eq('temple_system_id', (await getGuandiTempleSystemId()))
        .gte('slip_number', 1)
        .lte('slip_number', 100)
        .order('slip_number')
        .limit(100);

      if (slipError || !randomSlip || randomSlip.length === 0) {
        console.error('Error fetching fortune slips:', slipError);
        return NextResponse.json({ error: 'Failed to fetch fortune slips' }, { status: 500 });
      }

      // 随机选择一个签文
      const selectedSlip = randomSlip[Math.floor(Math.random() * randomSlip.length)];

      // 创建或更新每日抽签记录
      const drawData = {
        wallet_address: walletAddress,
        draw_date: today,
        fortune_slip_id: selectedSlip.id,
        current_state: 'in_progress',
        attempts_count: (existingDraw?.attempts_count || 0) + 1,
        success_count: 0,
        consecutive_successes: 0,
        luck_points_earned: 0, // 将与现有积分系统合并
        jiaobei_results: []
      };

      const { data: drawRecord, error: drawError } = await supabaseAdmin
        .from('guandi_daily_draws')
        .upsert(drawData, { 
          onConflict: 'wallet_address,draw_date',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (drawError) {
        console.error('Error creating draw record:', drawError);
        return NextResponse.json({ error: 'Failed to start fortune drawing' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: {
          drawId: drawRecord.id,
          fortuneSlip: selectedSlip,
          gameState: 'jiaobei_required',
          consecutiveSuccesses: 0,
          requiresJiaobei: true
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Guandi draw API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 获取用户今日抽签状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address')?.toLowerCase();

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return NextResponse.json({ error: 'Valid wallet address required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    
    // 获取今日抽签状态
    const { data: todayDraw, error: drawError } = await supabaseAdmin
      .from('guandi_daily_draws')
      .select(`
        *,
        fortune_slip:fortune_slips(
          slip_number,
          title,
          content,
          basic_interpretation,
          fortune_level
        )
      `)
      .eq('wallet_address', walletAddress)
      .eq('draw_date', today)
      .single();

    // 获取用户积分余额（使用现有积分系统）
    const { data: userPoints, error: pointsError } = await supabaseAdmin
      .from('user_points_web3')
      .select(`
        chain_points_balance, 
        total_chain_earned, 
        guandi_fortune_draws_count, 
        guandi_consecutive_streak,
        guandi_max_streak,
        last_guandi_draw_date
      `)
      .eq('wallet_address', walletAddress)
      .single();

    // 获取连续抽签天数
    const consecutiveStreak = await calculateConsecutiveStreak(walletAddress);

    const canDrawToday = !todayDraw || (todayDraw.current_state !== 'success' && todayDraw.current_state !== 'failed');

    return NextResponse.json({
      success: true,
      data: {
        canDrawToday,
        todayDrawStatus: todayDraw?.current_state || 'not_started',
        todayResult: todayDraw ? {
          slipNumber: todayDraw.fortune_slip?.slip_number,
          title: todayDraw.fortune_slip?.title,
          luckPointsEarned: todayDraw.luck_points_earned,
          consecutiveSuccesses: todayDraw.consecutive_successes
        } : null,
        userStats: {
          chainPointsBalance: userPoints?.chain_points_balance || 0,
          totalChainEarned: userPoints?.total_chain_earned || 0,
          guangdiDrawsCount: userPoints?.guandi_fortune_draws_count || 0,
          consecutiveStreak: userPoints?.guandi_consecutive_streak || 0,
          maxStreak: userPoints?.guandi_max_streak || 0
        },
        nextDrawTime: canDrawToday ? null : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });

  } catch (error) {
    console.error('Guandi draw status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 辅助函数：获取关帝庙系统ID
async function getGuandiTempleSystemId(): Promise<string> {
  const { data: temple, error } = await supabaseAdmin
    .from('temple_systems')
    .select('id')
    .eq('temple_code', 'guandi')
    .single();

  if (error || !temple) {
    throw new Error('Guandi temple system not found');
  }

  return temple.id;
}

// 辅助函数：计算连续抽签天数
async function calculateConsecutiveStreak(walletAddress: string): Promise<number> {
  const { data: recentDraws, error } = await supabaseAdmin
    .from('guandi_daily_draws')
    .select('draw_date, current_state')
    .eq('wallet_address', walletAddress)
    .eq('current_state', 'success')
    .order('draw_date', { ascending: false })
    .limit(30); // 检查最近30天

  if (error || !recentDraws || recentDraws.length === 0) {
    return 0;
  }

  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < recentDraws.length; i++) {
    const drawDate = new Date(recentDraws[i].draw_date);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);
    
    // 检查日期是否连续
    if (drawDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}