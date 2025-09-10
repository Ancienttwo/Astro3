import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/api-auth';
import { ethers } from 'ethers';
import { getWeb2UserUsage, getWeb3UserUsage } from '@/lib/utils/user-usage-utils';
import { ValidationMiddleware, ErrorFactory, createSuccessResponse, withErrorHandler } from '@/lib/middleware/error-handler';

// 统一的用户余额查询API - 支持Web2和Web3用户
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const userType = searchParams.get('userType');

  // 验证用户类型
  ValidationMiddleware.validateRequired({ userType });
  ValidationMiddleware.validateUserType(userType!);

  if (userType === 'web2') {
    return await getWeb2Balance(request);
  } else {
    return await getWeb3Balance(request);
  }
});

// 获取Web2用户余额
async function getWeb2Balance(request: NextRequest) {
  // Web2用户认证
  const authResult = await verifyAuthToken(request);
  if (!authResult.success || !authResult.user) {
    throw ErrorFactory.unauthorized();
  }

  const userId = authResult.user.id;
  const userUsage = await getWeb2UserUsage(userId);

  return createSuccessResponse({
    userType: 'web2',
    userId,
    userEmail: authResult.user.email,
    balance: {
      freeReports: { 
        limit: userUsage.free_reports_limit, 
        used: userUsage.free_reports_used, 
        remaining: userUsage.free_reports_remaining 
      },
      paidReports: { 
        purchased: userUsage.paid_reports_purchased, 
        used: userUsage.paid_reports_used, 
        remaining: userUsage.paid_reports_remaining 
      },
      chatbot: { 
        limit: userUsage.chatbot_limit, 
        used: userUsage.chatbot_used, 
        remaining: userUsage.chatbot_remaining 
      },
      totalReports: userUsage.total_reports_remaining
    },
    exists: userUsage.exists
  });
}

// 获取Web3用户余额
async function getWeb3Balance(request: NextRequest) {
  // Web3用户认证
  const web3UserHeader = request.headers.get('X-Web3-User');
  if (!web3UserHeader) {
    throw ErrorFactory.unauthorized('Web3 user header missing');
  }

  let web3User: any;
  try {
    web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
  } catch {
    throw ErrorFactory.invalidToken('Invalid Web3 user header format');
  }

  const walletAddress = web3User.walletAddress?.toLowerCase();
  ValidationMiddleware.validateWalletAddress(walletAddress);

  // 获取Web3用户使用统计
  const userUsage = await getWeb3UserUsage(walletAddress);

  // 获取Web3积分数据 (不抛出错误，因为这是可选的)
  let points = null;
  try {
    const { data: pointsData } = await supabaseAdmin
      .from('user_points_web3')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (pointsData) {
      points = {
        chainPoints: pointsData.chain_points_balance || 0,
        totalEarned: pointsData.total_chain_earned || 0,
        airdropWeight: pointsData.airdrop_weight || 0,
        consecutiveDays: pointsData.consecutive_days || 0,
        lastCheckin: pointsData.last_checkin_date,
        totalBnbSpent: pointsData.total_bnb_spent || 0
      };
    }
  } catch (error) {
    // 积分数据获取失败不影响余额查询
    console.warn('Failed to fetch Web3 points data:', error);
  }

  return createSuccessResponse({
    userType: 'web3',
    walletAddress,
    balance: {
      freeReports: { 
        limit: userUsage.free_reports_limit,
        used: userUsage.free_reports_used,
        remaining: userUsage.free_reports_remaining
      },
      paidReports: { 
        purchased: userUsage.paid_reports_purchased,
        used: userUsage.paid_reports_used,
        remaining: userUsage.paid_reports_remaining
      },
      chatbot: { 
        limit: userUsage.chatbot_limit,
        used: userUsage.chatbot_used,
        remaining: userUsage.chatbot_remaining
      },
      totalReports: userUsage.total_reports_remaining
    },
    points,
    exists: userUsage.exists
  });
}