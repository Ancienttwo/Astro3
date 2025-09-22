import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/server/db';
import { CacheManager } from '@/lib/redis-cache'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { isAddress } from 'viem';
import { resolveAuth } from '@/lib/auth-adapter'
import { ok, err } from '@/lib/api-response'

const supabaseAdmin = getSupabaseAdminClient();

// Web3用户积分查询
export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAuth(request)
    const walletAddress = (auth.walletAddress || '').toLowerCase()
    if (!auth.ok || !walletAddress || !isAddress(walletAddress as `0x${string}`)) {
      return err(401, 'UNAUTHORIZED', 'Web3 authentication required')
    }

    // 获取用户Web3积分信息
    const { data: pointsData, error: pointsError } = await supabaseAdmin
      .from('user_points_web3')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (pointsError && pointsError.code !== 'PGRST116') {
      console.error('Error fetching Web3 points:', pointsError);
      return err(500, 'FETCH_FAILED', 'Failed to fetch points')
    }

    // 如果用户没有记录，创建一个
    if (!pointsData) {
      const { data: newPointsData, error: createError } = await supabaseAdmin
        .from('user_points_web3')
        .insert({
          wallet_address: walletAddress,
          chain_points_balance: 0,
          total_chain_earned: 0,
          airdrop_weight: 0,
          consecutive_days: 0,
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating Web3 points record:', createError);
        return err(500, 'CREATE_FAILED', 'Failed to create points record')
      }

      return ok(newPointsData)
    }

    // 获取最近的签到记录
    const { data: recentCheckins } = await supabaseAdmin
      .from('checkin_records_web3')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false })
      .limit(10);

    // 获取空投资格信息
    const { data: airdropInfo } = await supabaseAdmin
      .from('airdrop_eligibility')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('last_updated', { ascending: false })
      .limit(1)
      .single();

    return ok({
      ...pointsData,
      recentCheckins: recentCheckins || [],
      airdropEligibility: airdropInfo || null
    })

  } catch (error) {
    console.error('Web3 points API error:', error);
    return err(500, 'INTERNAL_ERROR', 'Internal server error')
  }
}

// Web3用户签到数据同步
export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAuth(request)
    const walletAddress = (auth.walletAddress || '').toLowerCase()
    if (!auth.ok || !walletAddress || !isAddress(walletAddress as `0x${string}`)) {
      return err(401, 'UNAUTHORIZED', 'Web3 authentication required')
    }

    const body = await request.json();
    const { 
      txHash, 
      consecutiveDays, 
      pointsEarned, 
      airdropWeightEarned, 
      bnbPaid, 
      blockNumber,
      gasUsed 
    } = body;

    // 验证必需字段
    if (!txHash || !consecutiveDays || !pointsEarned || !airdropWeightEarned || !bnbPaid) {
      return err(400, 'VALIDATION_FAILED', 'Missing required fields')
    }

    // 检查交易哈希是否已存在
    const { data: existingRecord } = await supabaseAdmin
      .from('checkin_records_web3')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existingRecord) {
      return err(400, 'DUP_TX', 'Transaction already recorded')
    }

    const today = new Date().toISOString().split('T')[0];
    const reportsEarned = calculateReportsFromConsecutiveDays(consecutiveDays);

    // 使用事务处理Web3签到
    const { data: result, error: syncError } = await supabaseAdmin.rpc(
      'handle_web3_checkin_sync',
      {
        p_wallet_address: walletAddress,
        p_tx_hash: txHash,
        p_checkin_date: today,
        p_consecutive_days: consecutiveDays,
        p_points_earned: pointsEarned,
        p_airdrop_weight_earned: airdropWeightEarned,
        p_bnb_paid: bnbPaid,
        p_block_number: blockNumber,
        p_gas_used: gasUsed,
        p_reports_earned: reportsEarned
      }
    );

    if (syncError) {
      console.error('Error syncing Web3 checkin:', syncError);
      return err(500, 'SYNC_FAILED', 'Failed to sync checkin data')
    }

    // 更新空投资格
    await updateAirdropEligibility(walletAddress);

    // 缓存失效：用户缓存、排行榜/全局缓存
    try { await CacheManager.clearUserCache('web3_'+walletAddress, walletAddress) } catch {}
    try { await CacheManager.clearGlobalCache() } catch {}
    try { await invalidateByExactPath('/api/airdrop/leaderboard', 'user') } catch {}
    try { await invalidateByExactPath('/api/points/leaderboard', 'user') } catch {}

    return ok({
      txHash,
      consecutiveDays,
      pointsEarned,
      airdropWeightEarned,
      reportsEarned,
      totalPoints: result?.new_points_balance || 0,
      totalAirdropWeight: result?.new_airdrop_weight || 0
    })

  } catch (error) {
    console.error('Web3 checkin sync API error:', error);
    return err(500, 'INTERNAL_ERROR', 'Internal server error')
  }
}

// 根据连续天数计算报告次数
function calculateReportsFromConsecutiveDays(consecutiveDays: number): number {
  const baseReports = 1;
  
  if (consecutiveDays >= 100) return baseReports * 10;
  if (consecutiveDays >= 60) return baseReports * 8;
  if (consecutiveDays >= 30) return baseReports * 5;
  if (consecutiveDays >= 15) return baseReports * 3;
  if (consecutiveDays >= 7) return baseReports * 2;
  return baseReports;
}

// 更新用户空投资格
async function updateAirdropEligibility(walletAddress: string) {
  try {
    // 获取用户当前统计
    const { data: userStats } = await supabaseAdmin
      .from('user_points_web3')
      .select('airdrop_weight, consecutive_days, total_chain_earned')
      .eq('wallet_address', walletAddress)
      .single();

    if (!userStats) return;

    // 计算各项权重
    const checkinWeight = Math.min(userStats.airdrop_weight / 1000, 100); // 最高100权重
    const activityWeight = Math.min(userStats.total_chain_earned / 1000 * 10, 50); // 基于总积分，最高50权重
    const referralWeight = 0; // 暂时设为0，后续可扩展推荐功能

    const totalWeight = checkinWeight + activityWeight + referralWeight;
    const estimatedTokens = calculateEstimatedAirdropTokens(totalWeight);

    // 更新或插入空投资格记录
    const { error: upsertError } = await supabaseAdmin
      .from('airdrop_eligibility')
      .upsert({
        wallet_address: walletAddress,
        total_weight: totalWeight,
        checkin_weight: checkinWeight,
        activity_weight: activityWeight,
        referral_weight: referralWeight,
        estimated_tokens: estimatedTokens,
        is_eligible: true,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'wallet_address,snapshot_date',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error updating airdrop eligibility:', upsertError);
    }

  } catch (error) {
    console.error('Error in updateAirdropEligibility:', error);
  }
}

// 计算预估空投Token数量
function calculateEstimatedAirdropTokens(weight: number): number {
  const AIRDROP_POOL = 10_000_000; // 1000万AZI
  const TOTAL_WEIGHT_EXPECTED = 100_000; // 预期总权重
  
  return (weight / TOTAL_WEIGHT_EXPECTED) * AIRDROP_POOL;
}
