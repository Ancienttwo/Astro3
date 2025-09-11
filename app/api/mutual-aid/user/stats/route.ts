import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getMutualAidUser } from '@/lib/mutual-aid-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/mutual-aid/user/stats
 * 获取当前用户的互助系统统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 认证用户
    const user = await getMutualAidUser(request as any);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '需要Web3身份验证',
            details: 'No valid mutual-aid user',
          },
        },
        { status: 401 }
      );
    }

    // 获取用户基础信息
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        wallet_address,
        reputation_score,
        total_contributions,
        verification_status,
        is_active_validator,
        validation_accuracy,
        total_validations,
        created_at,
        role
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_PROFILE_NOT_FOUND',
            message: '找不到用户信息',
          },
        },
        { status: 404 }
      );
    }

    // 获取并行数据
    const [
      requestsData,
      validationsData,
      rewardsData,
      nftData,
      recentActivity,
    ] = await Promise.all([
      getUserRequests(user.id),
      getUserValidations(user.id),
      getUserRewards(user.id),
      getUserNFTs(user.id),
      getRecentActivity(user.id),
    ]);

    // 计算综合统计
    const comprehensiveStats = calculateComprehensiveStats(
      userProfile,
      requestsData,
      validationsData,
      rewardsData
    );

    const response = {
      success: true,
      userProfile: {
        id: userProfile.id,
        walletAddress: userProfile.wallet_address,
        reputationScore: userProfile.reputation_score,
        totalContributions: userProfile.total_contributions,
        verificationStatus: userProfile.verification_status,
        isActiveValidator: userProfile.is_active_validator,
        validationAccuracy: userProfile.validation_accuracy,
        totalValidations: userProfile.total_validations,
        memberSince: userProfile.created_at,
        role: userProfile.role,
      },
      
      // 申请相关统计
      requestStats: {
        ...requestsData,
        eligibility: {
          canSubmitNew: requestsData.pendingRequests === 0,
          nextEligibleDate: getNextEligibleDate(requestsData),
          restrictions: getSubmissionRestrictions(userProfile, requestsData),
        },
      },
      
      // 验证相关统计
      validationStats: {
        ...validationsData,
        qualifications: {
          isQualified: isQualifiedValidator(userProfile),
          requirements: {
            minReputationScore: 3.0,
            currentReputationScore: userProfile.reputation_score,
            minValidationAccuracy: 0.7,
            currentValidationAccuracy: userProfile.validation_accuracy,
            isActiveValidator: userProfile.is_active_validator,
          },
          canValidate: isQualifiedValidator(userProfile),
        },
      },
      
      // 奖励和贡献统计
      rewardStats: rewardsData,
      
      // NFT统计
      nftStats: nftData,
      
      // 综合表现统计
      performanceStats: comprehensiveStats,
      
      // 近期活动
      recentActivity: recentActivity,
      
      // 排行榜位置
      rankings: await getUserRankings(user.id),
      
      // 成就和徽章
      achievements: await getUserAchievements(user.id, comprehensiveStats),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('获取用户统计信息错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_USER_STATS_FAILED',
          message: '获取用户统计信息失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 获取用户申请统计
 */
async function getUserRequests(userId: string) {
  try {
    const { data: requests, error } = await supabase
      .from('mutual_aid_requests')
      .select('status, amount, created_at, category, severity_level')
      .eq('requester_id', userId);

    if (error || !requests) {
      return getDefaultRequestStats();
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => ['pending', 'under_review'].includes(r.status)).length;
    const approvedRequests = requests.filter(r => r.status === 'approved').length;
    const completedRequests = requests.filter(r => r.status === 'completed').length;
    const rejectedRequests = requests.filter(r => r.status === 'rejected').length;
    const cancelledRequests = requests.filter(r => r.status === 'cancelled').length;

    const recentRequests = requests.filter(r => new Date(r.created_at) >= thirtyDaysAgo).length;
    const quarterRequests = requests.filter(r => new Date(r.created_at) >= ninetyDaysAgo).length;

    const totalRequestedAmount = requests
      .filter(r => ['approved', 'completed'].includes(r.status))
      .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);

    const successRate = totalRequests > 0 
      ? ((approvedRequests + completedRequests) / totalRequests * 100)
      : 0;

    // 按类别统计
    const categoryBreakdown = requests.reduce((acc: Record<string, any>, request) => {
      const category = request.category;
      if (!acc[category]) {
        acc[category] = { total: 0, approved: 0, totalAmount: 0 };
      }
      acc[category].total++;
      if (['approved', 'completed'].includes(request.status)) {
        acc[category].approved++;
        acc[category].totalAmount += parseFloat(request.amount || '0');
      }
      return acc;
    }, {});

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      rejectedRequests,
      cancelledRequests,
      recentRequests,
      quarterRequests,
      totalRequestedAmount: totalRequestedAmount.toFixed(2),
      successRate: successRate.toFixed(1),
      categoryBreakdown,
      averageAmount: totalRequests > 0 ? (totalRequestedAmount / totalRequests).toFixed(2) : '0.00',
      lastRequestDate: requests.length > 0 ? requests[requests.length - 1].created_at : null,
    };

  } catch (error) {
    console.error('获取用户申请统计失败:', error);
    return getDefaultRequestStats();
  }
}

/**
 * 获取用户验证统计
 */
async function getUserValidations(userId: string) {
  try {
    const { data: validationsRaw, error } = await supabase
      .from('mutual_aid_validations')
      .select(`
        vote,
        confidence_score,
        created_at,
        request:mutual_aid_requests!request_id(
          status,
          amount,
          category,
          severity_level
        )
      `)
      .eq('validator_id', userId);

    if (error || !validationsRaw) {
      return getDefaultValidationStats();
    }

    type ValidationRecord = {
      vote: 'approve' | 'reject';
      confidence_score: number;
      created_at: string;
      request?: {
        status?: string;
        amount?: string;
        category?: string;
        severity_level?: number;
      };
    };

    const validations = validationsRaw as unknown as ValidationRecord[];

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalValidations = validations.length;
    const recentValidations = validations.filter(v => new Date(v.created_at) >= thirtyDaysAgo).length;
    const approvedValidations = validations.filter(v => v.vote === 'approve').length;
    const rejectedValidations = validations.filter(v => v.vote === 'reject').length;

    // 计算准确率
    let correctValidations = 0;
    validations.forEach(validation => {
      const finalStatus = validation.request?.status;
      if (
        (validation.vote === 'approve' && (['approved', 'completed'] as string[]).includes(finalStatus || '')) ||
        (validation.vote === 'reject' && (finalStatus || '') === 'rejected')
      ) {
        correctValidations++;
      }
    });

    const accuracy = totalValidations > 0 ? (correctValidations / totalValidations) : 0;
    const avgConfidence = totalValidations > 0 
      ? validations.reduce((sum, v) => sum + v.confidence_score, 0) / totalValidations
      : 0;

    // 计算验证奖励
    const totalRewards = validations.reduce((sum, validation) => {
      const baseReward = calculateValidationReward(
        validation.request?.severity_level || 5,
        validation.request?.amount || '10'
      );
      return sum + baseReward;
    }, 0);

    // 按类别统计验证
    const categoryBreakdown = validations.reduce((acc: Record<string, any>, validation) => {
      const category = validation.request?.category || 'unknown';
      if (!acc[category]) {
        acc[category] = { total: 0, approved: 0, rejected: 0 };
      }
      acc[category].total++;
      if (validation.vote === 'approve') {
        acc[category].approved++;
      } else {
        acc[category].rejected++;
      }
      return acc;
    }, {});

    return {
      totalValidations,
      recentValidations,
      approvedValidations,
      rejectedValidations,
      approvalRate: totalValidations > 0 ? (approvedValidations / totalValidations * 100).toFixed(1) : '0.0',
      accuracy: (accuracy * 100).toFixed(1),
      averageConfidence: avgConfidence.toFixed(2),
      totalRewards: totalRewards.toFixed(2),
      categoryBreakdown,
      performanceRating: getPerformanceRating(accuracy, avgConfidence),
      validatorLevel: getValidatorLevel(totalValidations, accuracy),
      lastValidationDate: validations.length > 0 ? validations[validations.length - 1].created_at : null,
    };

  } catch (error) {
    console.error('获取用户验证统计失败:', error);
    return getDefaultValidationStats();
  }
}

/**
 * 获取用户奖励统计
 */
async function getUserRewards(userId: string) {
  try {
    // 这里假设有一个奖励记录表
    const { data: rewards, error } = await supabase
      .from('user_rewards')
      .select('amount, reward_type, created_at')
      .eq('user_id', userId);

    const totalRewards = rewards?.reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
    const validationRewards = rewards?.filter(r => r.reward_type === 'validation').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
    const contributionRewards = rewards?.filter(r => r.reward_type === 'contribution').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;
    const bonusRewards = rewards?.filter(r => r.reward_type === 'bonus').reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentRewards = rewards?.filter(r => new Date(r.created_at) >= thirtyDaysAgo).reduce((sum, r) => sum + parseFloat(r.amount), 0) || 0;

    return {
      totalRewards: totalRewards.toFixed(2),
      validationRewards: validationRewards.toFixed(2),
      contributionRewards: contributionRewards.toFixed(2),
      bonusRewards: bonusRewards.toFixed(2),
      recentRewards: recentRewards.toFixed(2),
      totalTransactions: rewards?.length || 0,
    };

  } catch (error) {
    console.error('获取用户奖励统计失败:', error);
    return {
      totalRewards: '0.00',
      validationRewards: '0.00',
      contributionRewards: '0.00',
      bonusRewards: '0.00',
      recentRewards: '0.00',
      totalTransactions: 0,
    };
  }
}

/**
 * 获取用户NFT统计
 */
async function getUserNFTs(userId: string) {
  try {
    const { data: nfts, error } = await supabase
      .from('user_nfts')
      .select('token_id, nft_type, rarity, created_at')
      .eq('owner_id', userId);

    if (error || !nfts) {
      return { totalNFTs: 0, breakdown: {} };
    }

    const breakdown = nfts.reduce((acc: Record<string, any>, nft) => {
      const type = nft.nft_type || 'unknown';
      if (!acc[type]) {
        acc[type] = { count: 0, rarities: {} };
      }
      acc[type].count++;
      
      const rarity = nft.rarity || 'common';
      acc[type].rarities[rarity] = (acc[type].rarities[rarity] || 0) + 1;
      
      return acc;
    }, {});

    return {
      totalNFTs: nfts.length,
      breakdown,
      latestMint: nfts.length > 0 ? nfts[nfts.length - 1].created_at : null,
    };

  } catch (error) {
    console.error('获取用户NFT统计失败:', error);
    return { totalNFTs: 0, breakdown: {} };
  }
}

/**
 * 获取近期活动
 */
async function getRecentActivity(userId: string) {
  try {
    // 获取最近的申请和验证活动
    const [requests, validations] = await Promise.all([
      supabase
        .from('mutual_aid_requests')
        .select('id, status, amount, created_at, updated_at')
        .eq('requester_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      
      supabase
        .from('mutual_aid_validations')
        .select('id, vote, created_at, request:mutual_aid_requests!request_id(amount)')
        .eq('validator_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const activities: any[] = [];

    // 添加申请活动
    if (requests.data) {
      requests.data.forEach(request => {
        activities.push({
          type: 'request',
          action: 'submitted',
          timestamp: request.created_at,
          details: {
            id: request.id,
            amount: request.amount,
            status: request.status,
          },
        });
      });
    }

    // 添加验证活动
    if (validations.data) {
      validations.data.forEach(validation => {
        activities.push({
          type: 'validation',
          action: validation.vote,
          timestamp: validation.created_at,
          details: {
            id: validation.id,
            requestAmount: (validation.request as any)?.amount,
          },
        });
      });
    }

    // 按时间排序
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return activities.slice(0, 10);

  } catch (error) {
    console.error('获取近期活动失败:', error);
    return [];
  }
}

/**
 * 获取用户排行榜位置
 */
async function getUserRankings(userId: string) {
  try {
    // 这里需要实现排行榜查询逻辑
    // 暂时返回模拟数据
    return {
      reputation: { rank: 'N/A', total: 'N/A' },
      validation: { rank: 'N/A', total: 'N/A' },
      contribution: { rank: 'N/A', total: 'N/A' },
    };
  } catch (error) {
    console.error('获取用户排名失败:', error);
    return {
      reputation: { rank: 'N/A', total: 'N/A' },
      validation: { rank: 'N/A', total: 'N/A' },
      contribution: { rank: 'N/A', total: 'N/A' },
    };
  }
}

/**
 * 获取用户成就
 */
async function getUserAchievements(userId: string, stats: any) {
  const achievements = [];

  // 基于统计数据计算成就
  if (stats.totalValidations >= 100) {
    achievements.push({
      id: 'validator_expert',
      name: '验证专家',
      description: '完成100次验证',
      earned: true,
      earnedAt: null,
    });
  }

  if (stats.validationAccuracy >= 0.95) {
    achievements.push({
      id: 'accurate_validator',
      name: '精准验证者',
      description: '验证准确率达到95%',
      earned: true,
      earnedAt: null,
    });
  }

  if (stats.totalRequests > 0 && stats.requestSuccessRate >= 80) {
    achievements.push({
      id: 'trusted_requester',
      name: '可信申请者',
      description: '申请成功率达到80%',
      earned: true,
      earnedAt: null,
    });
  }

  return achievements;
}

// 辅助函数
function getDefaultRequestStats() {
  return {
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    completedRequests: 0,
    rejectedRequests: 0,
    cancelledRequests: 0,
    recentRequests: 0,
    quarterRequests: 0,
    totalRequestedAmount: '0.00',
    successRate: '0.0',
    categoryBreakdown: {},
    averageAmount: '0.00',
    lastRequestDate: null,
  };
}

function getDefaultValidationStats() {
  return {
    totalValidations: 0,
    recentValidations: 0,
    approvedValidations: 0,
    rejectedValidations: 0,
    approvalRate: '0.0',
    accuracy: '0.0',
    averageConfidence: '0.00',
    totalRewards: '0.00',
    categoryBreakdown: {},
    performanceRating: 'N/A',
    validatorLevel: '新手验证者',
    lastValidationDate: null,
  };
}

function isQualifiedValidator(userProfile: any): boolean {
  return userProfile.reputation_score >= 3.0 && 
         userProfile.validation_accuracy >= 0.7 && 
         userProfile.is_active_validator;
}

function getNextEligibleDate(requestStats: any): string | null {
  if (requestStats.pendingRequests > 0) {
    return '有待处理申请时不能提交新申请';
  }
  return null;
}

function getSubmissionRestrictions(userProfile: any, requestStats: any) {
  const restrictions = [];
  
  if (requestStats.pendingRequests > 0) {
    restrictions.push('有待处理申请');
  }
  
  if (userProfile.reputation_score < 2.0) {
    restrictions.push('信誉分数不足');
  }
  
  return restrictions;
}

function calculateComprehensiveStats(userProfile: any, requests: any, validations: any, rewards: any) {
  const totalValidations = validations.totalValidations || 0;
  const validationAccuracy = parseFloat(validations.accuracy) / 100 || 0;
  const reputationScore = userProfile.reputation_score || 0;
  
  return {
    totalValidations,
    requestSuccessRate: parseFloat(requests.successRate) || 0,
    validationAccuracy: validationAccuracy * 100,
    reputationScore,
    performanceScore: calculatePerformanceScore(reputationScore, validationAccuracy, totalValidations),
    level: getValidatorLevel(totalValidations, validationAccuracy),
  };
}

function calculatePerformanceScore(reputation: number, accuracy: number, totalValidations: number): number {
  const reputationWeight = 0.4;
  const accuracyWeight = 0.4;
  const experienceWeight = 0.2;
  
  const experienceScore = Math.min(totalValidations / 100, 1); // 最高100次验证得满分
  
  return Math.round((reputation * reputationWeight + accuracy * accuracyWeight + experienceScore * experienceWeight) * 100) / 100;
}

function calculateValidationReward(severityLevel: number, amount: string): number {
  const baseReward = 0.5;
  const severityMultiplier = 1 + (severityLevel - 5) * 0.1;
  const amountMultiplier = 1 + Math.log10(parseFloat(amount) + 1) * 0.1;
  
  return Math.round((baseReward * severityMultiplier * amountMultiplier) * 100) / 100;
}

function getPerformanceRating(accuracy: number, avgConfidence: number): string {
  const score = accuracy * 0.7 + avgConfidence * 0.3;
  
  if (score >= 0.95) return 'S';
  if (score >= 0.9) return 'A';
  if (score >= 0.8) return 'B';
  if (score >= 0.7) return 'C';
  return 'D';
}

function getValidatorLevel(totalValidations: number, accuracy: number): string {
  if (totalValidations >= 500 && accuracy >= 0.95) return '大师级验证者';
  if (totalValidations >= 200 && accuracy >= 0.9) return '专家级验证者';
  if (totalValidations >= 100 && accuracy >= 0.85) return '高级验证者';
  if (totalValidations >= 50 && accuracy >= 0.8) return '资深验证者';
  if (totalValidations >= 20 && accuracy >= 0.75) return '中级验证者';
  if (totalValidations >= 10) return '初级验证者';
  return '新手验证者';
}
