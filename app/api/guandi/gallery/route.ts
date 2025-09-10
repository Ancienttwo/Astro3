import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('wallet_address');
    const filter = searchParams.get('filter') || 'all';

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'Wallet address required'
      }, { status: 400 });
    }

    // 获取用户的关帝签文历史记录
    let query = supabase
      .from('guandi_fortune_history')
      .select(`
        id,
        slip_number,
        draw_date,
        fortune_level,
        luck_points_earned,
        jiaobei_session_data,
        is_minted_as_nft,
        nft_token_id,
        nft_contract_address,
        share_count
      `)
      .eq('wallet_address', walletAddress)
      .order('draw_date', { ascending: false });

    // 应用过滤器
    if (filter === 'nft-eligible') {
      query = query.eq('is_minted_as_nft', false);
    } else if (filter === 'minted') {
      query = query.eq('is_minted_as_nft', true);
    }

    const { data: records, error: recordsError } = await query;

    if (recordsError) {
      console.error('Failed to fetch fortune history:', recordsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch fortune history'
      }, { status: 500 });
    }

    // 获取统计数据
    const { data: userStats, error: statsError } = await supabase
      .from('user_points_web3')
      .select(`
        guandi_fortune_draws_count,
        guandi_consecutive_streak,
        guandi_max_streak,
        chain_points_balance
      `)
      .eq('wallet_address', walletAddress)
      .single();

    if (statsError) {
      console.warn('Failed to fetch user stats:', statsError);
    }

    // 计算统计信息
    const totalFortuneDraws = records?.length || 0;
    const nftEligible = records?.filter(r => !r.is_minted_as_nft).length || 0;
    const nftMinted = records?.filter(r => r.is_minted_as_nft).length || 0;
    const totalPoints = userStats?.chain_points_balance || 0;
    const longestStreak = userStats?.guandi_max_streak || 0;

    // 计算最喜欢的运势等级
    const levelCounts: { [key: string]: number } = {};
    records?.forEach(record => {
      if (record.fortune_level) {
        levelCounts[record.fortune_level] = (levelCounts[record.fortune_level] || 0) + 1;
      }
    });
    
    const favoriteLevel = Object.keys(levelCounts).reduce(
      (a, b) => levelCounts[a] > levelCounts[b] ? a : b, 
      'average'
    );

    const levelDisplayMap: { [key: string]: string } = {
      'excellent': '大吉',
      'good': '中吉', 
      'average': '平',
      'caution': '小凶',
      'warning': '大凶'
    };

    // 获取签文详情（需要单独查询）
    const formattedRecords = [];
    if (records && records.length > 0) {
      for (const record of records) {
        // 获取对应的签文详情
        const { data: fortuneSlip } = await supabase
          .from('fortune_slips')
          .select('title, content, basic_interpretation, historical_context, symbolism')
          .eq('slip_number', record.slip_number)
          .eq('temple_system_id', (await supabase
            .from('temple_systems')
            .select('id')
            .eq('temple_code', 'guandi')
            .single()).data?.id)
          .single();

        formattedRecords.push({
          id: record.id,
          slip_number: record.slip_number,
          draw_date: record.draw_date,
          fortune_level: record.fortune_level,
          luck_points_earned: record.luck_points_earned || 0,
          jiaobei_session_data: record.jiaobei_session_data || {
            results: [],
            total_attempts: 0,
            consecutive_successes: 0
          },
          is_minted_as_nft: record.is_minted_as_nft || false,
          nft_token_id: record.nft_token_id,
          nft_contract_address: record.nft_contract_address,
          share_count: record.share_count || 0,
          fortune_slip: fortuneSlip || null
        });
      }
    }

    const stats = {
      totalFortuneDraws,
      nftEligible,
      nftMinted,
      totalPoints,
      longestStreak,
      favoriteLevel: levelDisplayMap[favoriteLevel] || '平'
    };

    return NextResponse.json({
      success: true,
      data: {
        records: formattedRecords,
        stats
      }
    });

  } catch (error) {
    console.error('Gallery API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}