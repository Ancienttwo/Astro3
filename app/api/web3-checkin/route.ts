import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      userAddress, 
      txHash, 
      consecutiveDays, 
      creditsEarned, 
      aiReportsEarned, 
      amountPaid,
      blockNumber,
      timestamp 
    } = await request.json();

    // 验证必要参数
    if (!userAddress || !txHash || !creditsEarned || !aiReportsEarned) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 验证Web3用户身份（简单验证，生产环境应该更严格）
    const web3UserHeader = request.headers.get('X-Web3-User');
    if (!web3UserHeader) {
      return NextResponse.json(
        { success: false, error: 'Web3 user verification required' },
        { status: 401 }
      );
    }

    let web3User;
    try {
      web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid Web3 user data' },
        { status: 401 }
      );
    }

    // 检查用户地址是否匹配
    if (web3User.id !== userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address mismatch' },
        { status: 401 }
      );
    }

    // 检查交易哈希是否已经记录（防止重复）
    const { data: existingRecord } = await supabase
      .from('web3_checkin_records')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existingRecord) {
      return NextResponse.json(
        { success: false, error: 'Transaction already recorded' },
        { status: 409 }
      );
    }

    // 记录Web3签到数据
    const { error: insertError } = await supabase
      .from('web3_checkin_records')
      .insert({
        user_address: userAddress,
        tx_hash: txHash,
        consecutive_days: consecutiveDays,
        credits_earned: creditsEarned,
        ai_reports_earned: aiReportsEarned,
        amount_paid: amountPaid,
        block_number: blockNumber,
        checkin_date: new Date(timestamp || Date.now()).toISOString().split('T')[0],
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting Web3 checkin record:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to record checkin' },
        { status: 500 }
      );
    }

    // 更新或创建用户的总体统计
    const { data: userStats, error: fetchError } = await supabase
      .from('web3_user_stats')
      .select('*')
      .eq('user_address', userAddress)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user stats:', fetchError);
    }

    if (userStats) {
      // 更新现有统计
      const { error: updateError } = await supabase
        .from('web3_user_stats')
        .update({
          last_checkin_date: new Date(timestamp || Date.now()).toISOString().split('T')[0],
          consecutive_checkin_days: consecutiveDays,
          total_checkin_days: userStats.total_checkin_days + 1,
          total_credits: userStats.total_credits + creditsEarned,
          total_ai_reports: userStats.total_ai_reports + aiReportsEarned,
          total_spent: userStats.total_spent + parseFloat(amountPaid || '0'),
          updated_at: new Date().toISOString()
        })
        .eq('user_address', userAddress);

      if (updateError) {
        console.error('Error updating user stats:', updateError);
      }
    } else {
      // 创建新的统计记录
      const { error: createError } = await supabase
        .from('web3_user_stats')
        .insert({
          user_address: userAddress,
          last_checkin_date: new Date(timestamp || Date.now()).toISOString().split('T')[0],
          consecutive_checkin_days: consecutiveDays,
          total_checkin_days: 1,
          total_credits: creditsEarned,
          total_ai_reports: aiReportsEarned,
          total_spent: parseFloat(amountPaid || '0'),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (createError) {
        console.error('Error creating user stats:', createError);
      }
    }

    // 缓存失效：用户缓存与排行榜
    try {
      await CacheManager.clearUserCache('web3_'+userAddress, userAddress)
      await CacheManager.clearGlobalCache()
      await invalidateByExactPath('/api/points/leaderboard','user')
      await invalidateByExactPath('/api/airdrop/leaderboard','user')
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Web3 checkin recorded successfully',
      data: {
        userAddress,
        txHash,
        creditsEarned,
        aiReportsEarned
      }
    });

  } catch (error) {
    console.error('Web3 checkin API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userAddress = url.searchParams.get('userAddress');

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address required' },
        { status: 400 }
      );
    }

    // 验证Web3用户身份
    const web3UserHeader = request.headers.get('X-Web3-User');
    if (!web3UserHeader) {
      return NextResponse.json(
        { success: false, error: 'Web3 user verification required' },
        { status: 401 }
      );
    }

    let web3User;
    try {
      web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid Web3 user data' },
        { status: 401 }
      );
    }

    if (web3User.id !== userAddress) {
      return NextResponse.json(
        { success: false, error: 'User address mismatch' },
        { status: 401 }
      );
    }

    // 获取用户统计数据
    const { data: userStats, error } = await supabase
      .from('web3_user_stats')
      .select('*')
      .eq('user_address', userAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching user stats:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user stats' },
        { status: 500 }
      );
    }

    // 如果没有记录，返回默认值
    if (!userStats) {
      return NextResponse.json({
        success: true,
        data: {
          userAddress,
          lastCheckinDate: null,
          consecutiveDays: 0,
          totalDays: 0,
          totalCredits: 0,
          totalAiReports: 0,
          totalSpent: '0',
          canCheckinToday: true
        }
      });
    }

    // 检查今天是否可以签到
    const today = new Date().toISOString().split('T')[0];
    const canCheckinToday = userStats.last_checkin_date !== today;

    return NextResponse.json({
      success: true,
      data: {
        userAddress,
        lastCheckinDate: userStats.last_checkin_date,
        consecutiveDays: userStats.consecutive_checkin_days,
        totalDays: userStats.total_checkin_days,
        totalCredits: userStats.total_credits,
        totalAiReports: userStats.total_ai_reports,
        totalSpent: userStats.total_spent.toString(),
        canCheckinToday
      }
    });

  } catch (error) {
    console.error('Web3 checkin GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
