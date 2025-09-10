import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/api-auth';

// Web2用户签到查询 (只返回签到状态，不涉及积分)
export async function GET(request: NextRequest) {
  try {
    // 验证Web2用户身份
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const today = new Date().toISOString().split('T')[0];

    // 使用新的签到状态检查函数
    const { data: checkinStatus, error: statusError } = await supabaseAdmin.rpc('check_web2_checkin_status', {
      p_user_id: userId,
      p_check_date: today
    });

    if (statusError) {
      console.error('Error checking Web2 checkin status:', statusError);
      return NextResponse.json({ error: 'Failed to check checkin status' }, { status: 500 });
    }

    // 获取最近的签到记录
    const { data: recentCheckinsResult, error: recentError } = await supabaseAdmin.rpc('get_web2_recent_checkins', {
      p_user_id: userId,
      p_limit: 10
    });

    if (recentError) {
      console.error('Error fetching recent checkins:', recentError);
      // 不阻塞响应，使用空数组
    }

    return NextResponse.json({
      success: true,
      data: {
        hasCheckedInToday: !checkinStatus.can_checkin,
        consecutiveDays: checkinStatus.consecutive_days,
        expectedReports: checkinStatus.expected_reports,
        bonusMultiplier: checkinStatus.bonus_multiplier,
        todayCheckin: checkinStatus.today_checkin,
        recentCheckins: recentCheckinsResult?.recent_checkins || []
      }
    });

  } catch (error) {
    console.error('Web2 checkin status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Web2用户签到 (直接给予AI报告次数，无积分)
export async function POST(request: NextRequest) {
  try {
    // 验证Web2用户身份
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    const today = new Date().toISOString().split('T')[0];

    // 检查今天是否已经签到
    const { data: existingCheckin } = await supabaseAdmin
      .from('checkin_records_web2')
      .select('id')
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .single();

    if (existingCheckin) {
      return NextResponse.json({ 
        success: false, 
        error: 'Already checked in today' 
      }, { status: 400 });
    }

    // 获取用户最近签到记录来计算连续天数
    const { data: lastCheckin } = await supabaseAdmin
      .from('checkin_records_web2')
      .select('*')
      .eq('user_id', userId)
      .order('checkin_date', { ascending: false })
      .limit(1)
      .single();

    // 计算连续签到天数
    let consecutiveDays = 1;
    if (lastCheckin?.checkin_date) {
      const lastCheckinDate = new Date(lastCheckin.checkin_date);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastCheckinDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // 连续签到
        consecutiveDays = (lastCheckin.consecutive_days || 0) + 1;
      } else {
        // 签到中断，重新开始
        consecutiveDays = 1;
      }
    }

    // 计算AI报告奖励 (Web2用户不需要积分)
    const reportsEarned = calculateWeb2Reports(consecutiveDays);

    // 使用原子性签到函数确保数据一致性
    const { data: checkinResult, error: checkinError } = await supabaseAdmin.rpc('atomic_web2_checkin', {
      p_user_id: userId,
      p_user_email: authResult.user.email,
      p_checkin_date: today,
      p_consecutive_days: consecutiveDays,
      p_reports_earned: reportsEarned
    });

    if (checkinError) {
      console.error('Error performing atomic Web2 checkin:', checkinError);
      return NextResponse.json({ 
        error: 'Failed to complete checkin', 
        details: checkinError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        consecutiveDays: checkinResult.consecutive_days,
        reportsEarned: checkinResult.reports_earned,
        bonusMultiplier: checkinResult.bonus_multiplier,
        message: checkinResult.message
      }
    });

  } catch (error) {
    console.error('Web2 checkin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 计算Web2用户AI报告奖励
function calculateWeb2Reports(consecutiveDays: number): number {
  const baseReports = 1;
  
  if (consecutiveDays >= 100) return baseReports * 10;
  if (consecutiveDays >= 60) return baseReports * 8;
  if (consecutiveDays >= 30) return baseReports * 5;
  if (consecutiveDays >= 15) return baseReports * 3;
  if (consecutiveDays >= 7) return baseReports * 2;
  return baseReports;
}

// 获取奖励倍数
function getMultiplier(consecutiveDays: number): number {
  if (consecutiveDays >= 100) return 5.0;
  if (consecutiveDays >= 60) return 4.0;
  if (consecutiveDays >= 30) return 3.0;
  if (consecutiveDays >= 15) return 2.0;
  if (consecutiveDays >= 7) return 1.5;
  return 1.0;
}