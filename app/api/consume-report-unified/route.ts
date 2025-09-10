import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/api-auth';
import { ethers } from 'ethers';

// 统一的报告消费API - 支持Web2和Web3用户
export async function POST(request: NextRequest) {
  console.log('🎯 Unified consume-report API called');
  
  try {
    const body = await request.json();
    const { taskId, analysisType, amount = 1, userType } = body;
    
    if (!taskId || !analysisType) {
      return NextResponse.json({ 
        error: 'Missing required parameters: taskId and analysisType' 
      }, { status: 400 });
    }

    if (!['web2', 'web3'].includes(userType)) {
      return NextResponse.json({ 
        error: 'Invalid userType. Must be "web2" or "web3"' 
      }, { status: 400 });
    }

    console.log(`💰 Processing charge: userType=${userType}, taskId=${taskId}, analysisType=${analysisType}, amount=${amount}`);

    if (userType === 'web2') {
      return await consumeWeb2Reports(request, taskId, analysisType, amount);
    } else {
      return await consumeWeb3Reports(request, taskId, analysisType, amount);
    }

  } catch (error) {
    console.error('❌ Unified consume-report API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Web2用户报告消费
async function consumeWeb2Reports(
  request: NextRequest, 
  taskId: string, 
  analysisType: string, 
  amount: number
) {
  try {
    // Web2用户认证
    const authResult = await verifyAuthToken(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = authResult.user.id;
    console.log(`✅ Web2 user authenticated: ${authResult.user.email}`);

    // 防重复扣费检查
    const recentChargeCheck = await checkRecentCharges(userId, 'web2');
    if (!recentChargeCheck.canProceed) {
      console.log(`⚠️ Detected duplicate Web2 charge request, skipping`);
      return NextResponse.json({
        success: true,
        alreadyCharged: true,
        message: 'Duplicate request detected, charge skipped',
        note: 'Time-based duplicate detection'
      });
    }

    // 获取当前余额
    const { data: currentUsage, error: usageError } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (usageError) {
      if (usageError.code === 'PGRST116') {
        // 用户没有记录，创建一个
        const { data: newUsage, error: createError } = await supabaseAdmin
          .from('user_usage')
          .insert({
            user_id: userId,
            user_email: authResult.user.email,
            user_type: 'web2',
            free_reports_limit: 0,
            free_reports_used: 0,
            paid_reports_purchased: 0,
            paid_reports_used: 0,
            chatbot_limit: 0,
            chatbot_used: 0
          })
          .select()
          .single();

        if (createError) {
          console.error('❌ Failed to create Web2 usage record:', createError);
          return NextResponse.json({ 
            error: 'Failed to create user record' 
          }, { status: 500 });
        }

        console.log('✅ Web2 user usage record created:', newUsage);
        return NextResponse.json({
          success: false,
          error: 'No available reports',
          details: {
            required: amount,
            available: 0,
            freeRemaining: 0,
            paidRemaining: 0
          }
        }, { status: 400 });
      } else {
        console.error('❌ Error fetching Web2 usage:', usageError);
        return NextResponse.json({ 
          error: 'Failed to fetch user balance' 
        }, { status: 500 });
      }
    }

    // 计算可用余额
    const freeLimit = currentUsage.free_reports_limit || 0;
    const freeUsed = currentUsage.free_reports_used || 0;
    const paidPurchased = currentUsage.paid_reports_purchased || 0;
    const paidUsed = currentUsage.paid_reports_used || 0;

    const freeRemaining = Math.max(0, freeLimit - freeUsed);
    const paidRemaining = Math.max(0, paidPurchased - paidUsed);
    const totalRemaining = freeRemaining + paidRemaining;

    console.log(`📊 Web2 balance: free=${freeRemaining}, paid=${paidRemaining}, total=${totalRemaining}`);

    // 检查余额是否足够
    if (totalRemaining < amount) {
      console.log(`❌ Insufficient Web2 balance: need ${amount}, have ${totalRemaining}`);
      return NextResponse.json({
        success: false,
        error: 'Insufficient report credits',
        details: {
          required: amount,
          available: totalRemaining,
          freeRemaining,
          paidRemaining
        }
      }, { status: 400 });
    }

    // 执行扣费
    const updateData: Record<string, number> = {};
    
    if (freeRemaining >= amount) {
      updateData.free_reports_used = freeUsed + amount;
    } else {
      const useFree = freeRemaining;
      const usePaid = amount - useFree;
      updateData.free_reports_used = freeLimit;
      updateData.paid_reports_used = paidUsed + usePaid;
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_usage')
      .update(updateData)
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Failed to update Web2 usage:', updateError);
      return NextResponse.json({ 
        error: 'Failed to charge credits' 
      }, { status: 500 });
    }

    console.log(`✅ Web2 charge successful: user=${authResult.user.email}, charged=${amount}`);

    return NextResponse.json({
      success: true,
      message: `Successfully charged ${amount} report credits`,
      charged: {
        amount,
        taskId,
        analysisType,
        userType: 'web2',
        chargedAt: new Date().toISOString()
      },
      remaining: {
        free: Math.max(0, freeLimit - (updateData.free_reports_used || freeUsed)),
        paid: Math.max(0, paidPurchased - (updateData.paid_reports_used || paidUsed))
      }
    });

  } catch (error) {
    console.error('❌ Web2 consume error:', error);
    return NextResponse.json({ 
      error: 'Failed to process Web2 charge' 
    }, { status: 500 });
  }
}

// Web3用户报告消费
async function consumeWeb3Reports(
  request: NextRequest, 
  taskId: string, 
  analysisType: string, 
  amount: number
) {
  try {
    // Web3用户认证
    const web3UserHeader = request.headers.get('X-Web3-User');
    if (!web3UserHeader) {
      return NextResponse.json({ error: 'Web3 user header missing' }, { status: 401 });
    }

    const web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
    const walletAddress = web3User.walletAddress?.toLowerCase();

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
    }

    console.log(`✅ Web3 user authenticated: ${walletAddress}`);

    // 防重复扣费检查
    const recentChargeCheck = await checkRecentCharges(walletAddress, 'web3');
    if (!recentChargeCheck.canProceed) {
      console.log(`⚠️ Detected duplicate Web3 charge request, skipping`);
      return NextResponse.json({
        success: true,
        alreadyCharged: true,
        message: 'Duplicate request detected, charge skipped',
        note: 'Time-based duplicate detection'
      });
    }

    // 获取Web3用户使用统计
    const { data: usageResult, error: usageError } = await supabaseAdmin.rpc(
      'get_web3_user_usage',
      { p_wallet_address: walletAddress }
    );

    if (usageError) {
      console.error('❌ Error fetching Web3 usage:', usageError);
      return NextResponse.json({ 
        error: 'Failed to fetch Web3 user balance' 
      }, { status: 500 });
    }

    const totalRemaining = usageResult?.total_reports_remaining || 0;
    const freeRemaining = usageResult?.free_reports_remaining || 0;
    const paidRemaining = usageResult?.paid_reports_remaining || 0;

    console.log(`📊 Web3 balance: free=${freeRemaining}, paid=${paidRemaining}, total=${totalRemaining}`);

    // 检查余额是否足够
    if (totalRemaining < amount) {
      console.log(`❌ Insufficient Web3 balance: need ${amount}, have ${totalRemaining}`);
      return NextResponse.json({
        success: false,
        error: 'Insufficient report credits',
        details: {
          required: amount,
          available: totalRemaining,
          freeRemaining,
          paidRemaining
        }
      }, { status: 400 });
    }

    // 执行Web3用户扣费
    let updateData: Record<string, number> = {};
    
    if (freeRemaining >= amount) {
      // 使用免费次数
      updateData = {
        free_reports_used: (usageResult?.usage_stats?.free_used || 0) + amount
      };
    } else {
      // 先用完免费次数，再用付费次数
      const useFree = freeRemaining;
      const usePaid = amount - useFree;
      updateData = {
        free_reports_used: usageResult?.usage_stats?.free_limit || 0,
        paid_reports_used: (usageResult?.usage_stats?.paid_used || 0) + usePaid
      };
    }

    const { error: updateError } = await supabaseAdmin
      .from('user_usage')
      .update(updateData)
      .eq('wallet_address', walletAddress)
      .eq('user_type', 'web3');

    if (updateError) {
      console.error('❌ Failed to update Web3 usage:', updateError);
      return NextResponse.json({ 
        error: 'Failed to charge Web3 credits' 
      }, { status: 500 });
    }

    console.log(`✅ Web3 charge successful: wallet=${walletAddress}, charged=${amount}`);

    return NextResponse.json({
      success: true,
      message: `Successfully charged ${amount} report credits`,
      charged: {
        amount,
        taskId,
        analysisType,
        userType: 'web3',
        walletAddress,
        chargedAt: new Date().toISOString()
      },
      remaining: {
        free: Math.max(0, freeRemaining - (freeRemaining >= amount ? amount : freeRemaining)),
        paid: Math.max(0, paidRemaining - (freeRemaining >= amount ? 0 : amount - freeRemaining))
      }
    });

  } catch (error) {
    console.error('❌ Web3 consume error:', error);
    return NextResponse.json({ 
      error: 'Failed to process Web3 charge' 
    }, { status: 500 });
  }
}

// 重复检查函数
async function checkRecentCharges(userIdentifier: string, userType: string) {
  try {
    const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
    
    let query = supabaseAdmin
      .from('user_usage')
      .select('updated_at')
      .gte('updated_at', fiveSecondsAgo);
    
    if (userType === 'web2') {
      query = query.eq('user_id', userIdentifier);
    } else {
      query = query.eq('wallet_address', userIdentifier).eq('user_type', 'web3');
    }
    
    const { data: recentUpdate } = await query.single();

    if (recentUpdate) {
      return { 
        canProceed: false,
        message: 'Detected possible duplicate request'
      };
    }

    return { canProceed: true };
  } catch (error) {
    console.error('Duplicate check error, allowing to continue:', error);
    return { canProceed: true };
  }
}