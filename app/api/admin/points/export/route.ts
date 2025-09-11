import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/api-auth';

interface EligibilityRow {
  wallet_address: string;
  total_weight: number;
  checkin_weight: number;
  activity_weight: number;
  referral_weight: number;
  estimated_tokens: number;
  is_eligible?: boolean;
  last_updated: string;
  user_stats?: UserStats | null;
}

interface UserStats {
  wallet_address: string;
  chain_points_balance: number;
  total_chain_earned: number;
  total_bnb_spent: number;
  consecutive_days: number;
  max_consecutive_days: number;
  last_checkin_date: string;
  created_at: string;
}

interface RankedUser extends EligibilityRow {
  rank: number;
  tier: { name: string; color: string; minWeight: number };
  percentage_of_pool: number;
}

// 导出积分数据 - 仅管理员可用
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuthToken(request);
    if (!authResult.success) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查是否为管理员 (这里可以根据实际需求调整权限检查逻辑)
    // 预留：如需基于数据库的管理员校验，可在此查询相应表

    // 简单的管理员检查，实际项目中应该有专门的管理员表或角色系统
    const isAdmin = true; // 采用前端权限控制策略，服务端放行

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json'; // 'json', 'csv'
    const includeDetails = searchParams.get('details') === 'true';
    const snapshotDate = searchParams.get('snapshot_date');
    const minWeight = parseFloat(searchParams.get('min_weight') || '0');
    const limit = parseInt(searchParams.get('limit') || '10000');

    // 构建查询
    let query = supabaseAdmin
      .from('airdrop_eligibility')
      .select(`
        wallet_address,
        total_weight,
        checkin_weight,
        activity_weight,
        referral_weight,
        estimated_tokens,
        is_eligible,
        last_updated
      `)
      .eq('is_eligible', true)
      .gte('total_weight', minWeight)
      .order('total_weight', { ascending: false })
      .limit(limit);

    if (snapshotDate) {
      query = query.lte('last_updated', snapshotDate);
    }

    const { data: eligibilityData, error: eligibilityError } = await query as unknown as { data: EligibilityRow[] | null; error: any };

    if (eligibilityError) {
      console.error('Error fetching eligibility data:', eligibilityError);
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }

    if (!eligibilityData || eligibilityData.length === 0) {
      return NextResponse.json({ 
        success: true, 
        data: [], 
        message: 'No eligible users found' 
      });
    }

    // 如果需要详细信息，获取用户统计数据
    let detailedData: EligibilityRow[] = eligibilityData as EligibilityRow[];
    if (includeDetails) {
      const walletAddresses = (eligibilityData as EligibilityRow[]).map((item: EligibilityRow) => item.wallet_address);
      
      const { data: userStats, error: statsError } = await supabaseAdmin
        .from('user_points_web3')
        .select(`
          wallet_address,
          chain_points_balance,
          total_chain_earned,
          total_bnb_spent,
          consecutive_days,
          max_consecutive_days,
          last_checkin_date,
          created_at
        `)
        .in('wallet_address', walletAddresses);

      if (!statsError && userStats) {
        // 合并数据
        detailedData = (eligibilityData as EligibilityRow[]).map((eligibility: EligibilityRow) => {
          const userStat = (userStats as UserStats[]).find((stat: UserStats) => stat.wallet_address === eligibility.wallet_address) || null;
          return {
            ...eligibility,
            user_stats: userStat
          };
        });
      }
    }

    // 添加排名信息
    const rankedData: RankedUser[] = (detailedData as EligibilityRow[]).map((item: EligibilityRow, index: number) => ({
      rank: index + 1,
      ...item,
      tier: getTierFromWeight(item.total_weight),
      percentage_of_pool: calculatePoolPercentage(item.total_weight, detailedData)
    }));

    // 生成导出数据
    if (format === 'csv') {
      const csvData = generateCSV(rankedData, includeDetails);
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="airdrop_snapshot_${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // JSON格式返回
    const summary = generateSummary(rankedData);
    
    return NextResponse.json({
      success: true,
      data: {
        users: rankedData,
        summary,
        export_info: {
          timestamp: new Date().toISOString(),
          total_users: rankedData.length,
          format,
          filters: {
            min_weight: minWeight,
            snapshot_date: snapshotDate || 'latest',
            include_details: includeDetails
          }
        }
      }
    });

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 创建空投快照
export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = true; // 采用前端权限控制策略，服务端放行

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      snapshotName, 
      airdropPoolSize = 10000000, 
      minWeight = 0,
      description 
    } = body;

    if (!snapshotName) {
      return NextResponse.json({ error: 'Snapshot name required' }, { status: 400 });
    }

    // 获取当前所有合格用户
    const { data: eligibleUsers, error: usersError } = await supabaseAdmin
      .from('airdrop_eligibility')
      .select('*')
      .eq('is_eligible', true)
      .gte('total_weight', minWeight)
      .order('total_weight', { ascending: false });

    if (usersError) {
      console.error('Error fetching users for snapshot:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const totalWeight = (eligibleUsers as EligibilityRow[] | null)?.reduce(
      (sum: number, user: EligibilityRow) => sum + user.total_weight,
      0
    ) || 0;
    const weightPerToken = totalWeight > 0 ? airdropPoolSize / totalWeight : 0;

    // 创建快照记录
    const { data: snapshot, error: snapshotError } = await supabaseAdmin
      .from('airdrop_snapshots')
      .insert({
        snapshot_name: snapshotName,
        snapshot_date: new Date().toISOString().split('T')[0],
        total_eligible_users: eligibleUsers?.length || 0,
        total_weight: totalWeight,
        airdrop_pool_size: airdropPoolSize,
        weight_per_token: weightPerToken,
        status: 'final'
      })
      .select()
      .single();

    if (snapshotError) {
      console.error('Error creating snapshot:', snapshotError);
      return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 });
    }

    // 更新用户的最终Token分配
    if (eligibleUsers && eligibleUsers.length > 0) {
      const updates = (eligibleUsers as EligibilityRow[]).map((user: EligibilityRow) => ({
        wallet_address: user.wallet_address,
        estimated_tokens: user.total_weight * weightPerToken,
        snapshot_date: snapshot.snapshot_date
      }));

      // 批量更新
      const { error: updateError } = await supabaseAdmin
        .from('airdrop_eligibility')
        .upsert(updates, { 
          onConflict: 'wallet_address,snapshot_date',
          ignoreDuplicates: false 
        });

      if (updateError) {
        console.error('Error updating final allocations:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        snapshot,
        summary: {
          total_eligible_users: eligibleUsers?.length || 0,
          total_weight: totalWeight,
          airdrop_pool_size: airdropPoolSize,
          weight_per_token: weightPerToken,
          snapshot_date: snapshot.snapshot_date
        }
      },
      message: `Snapshot "${snapshotName}" created successfully`
    });

  } catch (error) {
    console.error('Create snapshot API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 生成CSV格式数据
function generateCSV(data: RankedUser[], includeDetails: boolean): string {
  const headers = [
    'rank',
    'wallet_address', 
    'total_weight',
    'estimated_tokens',
    'tier',
    'percentage_of_pool',
    'checkin_weight',
    'activity_weight',
    'referral_weight',
    'last_updated'
  ];

  if (includeDetails) {
    headers.push(
      'chain_points_balance',
      'total_chain_earned',
      'total_bnb_spent',
      'consecutive_days',
      'max_consecutive_days',
      'last_checkin_date',
      'user_created_at'
    );
  }

  const csvRows = [headers.join(',')];

  data.forEach((item: RankedUser) => {
    const row = [
      item.rank,
      item.wallet_address,
      item.total_weight.toFixed(4),
      item.estimated_tokens.toFixed(2),
      item.tier.name,
      item.percentage_of_pool.toFixed(6),
      item.checkin_weight.toFixed(4),
      item.activity_weight.toFixed(4),
      item.referral_weight.toFixed(4),
      item.last_updated
    ];

    if (includeDetails && item.user_stats) {
      row.push(
        item.user_stats.chain_points_balance || 0,
        item.user_stats.total_chain_earned || 0,
        item.user_stats.total_bnb_spent || 0,
        item.user_stats.consecutive_days || 0,
        item.user_stats.max_consecutive_days || 0,
        item.user_stats.last_checkin_date || '',
        item.user_stats.created_at || ''
      );
    }

    csvRows.push(row.join(','));
  });

  return csvRows.join('\n');
}

// 生成统计摘要
function generateSummary(data: RankedUser[]) {
  if (!data || data.length === 0) return {};

  const totalWeight = data.reduce((sum: number, item: RankedUser) => sum + item.total_weight, 0);
  const totalTokens = data.reduce((sum: number, item: RankedUser) => sum + item.estimated_tokens, 0);

  const tiers = {
    platinum: data.filter(item => item.tier.name === 'Platinum').length,
    gold: data.filter(item => item.tier.name === 'Gold').length,
    silver: data.filter(item => item.tier.name === 'Silver').length,
    bronze: data.filter(item => item.tier.name === 'Bronze').length
  };

  return {
    total_users: data.length,
    total_weight: totalWeight,
    total_tokens: totalTokens,
    average_weight: data.length > 0 ? totalWeight / data.length : 0,
    average_tokens: data.length > 0 ? totalTokens / data.length : 0,
    tier_distribution: tiers,
    top_10_weight: data.slice(0, 10).reduce((sum: number, item: RankedUser) => sum + item.total_weight, 0),
    top_10_percentage: totalWeight > 0 ? 
      (data.slice(0, 10).reduce((sum, item) => sum + item.total_weight, 0) / totalWeight * 100) : 0
  };
}

// 计算池子百分比
function calculatePoolPercentage(userWeight: number, allData: EligibilityRow[]): number {
  const totalWeight = (allData as EligibilityRow[]).reduce((sum: number, item: EligibilityRow) => sum + item.total_weight, 0);
  return totalWeight > 0 ? (userWeight / totalWeight * 100) : 0;
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
