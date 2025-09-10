import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWeb3Auth } from '@/lib/auth';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GetMyRequestsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'completed', 'expired', 'cancelled']).optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'amount', 'status']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/mutual-aid/requests/my
 * 获取当前用户的互助申请历史
 */
export async function GET(request: NextRequest) {
  try {
    // 验证Web3身份
    const authResult = await verifyWeb3Auth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '需要Web3身份验证',
            details: authResult.error,
          },
        },
        { status: 401 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50),
      status: searchParams.get('status') || undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = GetMyRequestsSchema.parse(params);
    const { page, limit, status, sortBy, sortOrder } = validatedParams;

    // 构建查询
    let query = supabase
      .from('mutual_aid_requests')
      .select(`
        *,
        validations:mutual_aid_validations(
          id,
          vote,
          confidence_score,
          created_at,
          validator:user_profiles!validator_id(
            wallet_address,
            reputation_score
          )
        ),
        prediction:mutual_aid_predictions!analysis_id(
          severity_level,
          confidence_score,
          timeframe,
          support_recommendations
        ),
        status_history:request_status_history(
          from_status,
          to_status,
          changed_at,
          reason
        )
      `, { count: 'exact' })
      .eq('requester_id', authResult.userId);

    // 应用筛选条件
    if (status) {
      query = query.eq('status', status);
    }

    // 应用排序
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 应用分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: requests, error, count } = await query;

    if (error) {
      throw error;
    }

    // 格式化响应数据
    const formattedRequests = requests?.map(request => ({
      id: request.id,
      amount: request.amount,
      reason: request.reason,
      severityLevel: request.severity_level,
      urgency: request.urgency,
      category: request.category,
      status: request.status,
      publicMessage: request.public_message,
      supportingDocuments: request.supporting_documents,
      createdAt: request.created_at,
      updatedAt: request.updated_at,
      expiresAt: request.expires_at,
      cancelledAt: request.cancelled_at,
      completedAt: request.completed_at,
      
      // 验证状态汇总
      validationSummary: {
        total: request.validations?.length || 0,
        approved: request.validations?.filter((v: any) => v.vote === 'approve').length || 0,
        rejected: request.validations?.filter((v: any) => v.vote === 'reject').length || 0,
        averageConfidence: request.validations?.length > 0 
          ? request.validations.reduce((sum: number, v: any) => sum + v.confidence_score, 0) / request.validations.length
          : 0,
        requiredValidations: getRequiredValidations(request.severity_level, request.amount),
        isComplete: isValidationComplete(request.validations, request.severity_level, request.amount),
      },

      // 详细验证信息
      validations: request.validations?.map((validation: any) => ({
        id: validation.id,
        vote: validation.vote,
        confidenceScore: validation.confidence_score,
        createdAt: validation.created_at,
        validator: {
          walletAddress: `${validation.validator.wallet_address.slice(0, 6)}...${validation.validator.wallet_address.slice(-4)}`,
          reputationScore: validation.validator.reputation_score,
        },
      })),

      // AI分析预测信息
      prediction: request.prediction ? {
        severityLevel: request.prediction.severity_level,
        confidenceScore: request.prediction.confidence_score,
        timeframe: request.prediction.timeframe,
        supportRecommendations: request.prediction.support_recommendations,
      } : undefined,

      // 状态变更历史
      statusHistory: request.status_history?.map((history: any) => ({
        fromStatus: history.from_status,
        toStatus: history.to_status,
        changedAt: history.changed_at,
        reason: history.reason,
      })),

      // 可执行的操作
      availableActions: getAvailableActions(request.status),
    })) || [];

    // 计算分页信息
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // 获取用户统计信息
    const userStats = await getUserRequestStats(authResult.userId);

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: {
        status,
        sortBy,
        sortOrder,
      },
      userStats,
    });

  } catch (error) {
    console.error('获取我的申请列表错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_MY_REQUESTS_FAILED',
          message: '获取我的申请列表失败',
          details: error instanceof z.ZodError ? error.errors : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 获取用户申请统计信息
 */
async function getUserRequestStats(userId: string) {
  try {
    const { data: stats, error } = await supabase
      .from('mutual_aid_requests')
      .select('status, amount, created_at')
      .eq('requester_id', userId);

    if (error || !stats) {
      return null;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const totalRequests = stats.length;
    const pendingRequests = stats.filter(r => ['pending', 'under_review'].includes(r.status)).length;
    const approvedRequests = stats.filter(r => r.status === 'approved').length;
    const completedRequests = stats.filter(r => r.status === 'completed').length;
    const rejectedRequests = stats.filter(r => r.status === 'rejected').length;

    const recentRequests = stats.filter(r => new Date(r.created_at) >= thirtyDaysAgo).length;
    const quarterRequests = stats.filter(r => new Date(r.created_at) >= ninetyDaysAgo).length;

    const totalRequestedAmount = stats
      .filter(r => r.status === 'approved' || r.status === 'completed')
      .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);

    const successRate = totalRequests > 0 
      ? ((approvedRequests + completedRequests) / totalRequests * 100).toFixed(1)
      : '0.0';

    return {
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      rejectedRequests,
      recentRequests,
      quarterRequests,
      totalRequestedAmount: totalRequestedAmount.toFixed(2),
      successRate: parseFloat(successRate),
      canSubmitNew: pendingRequests === 0, // 只有没有待处理申请时才能提交新申请
    };

  } catch (error) {
    console.error('获取用户统计信息失败:', error);
    return null;
  }
}

/**
 * 辅助函数：获取所需验证数量
 */
function getRequiredValidations(severityLevel: number, amount: string): number {
  const amountNum = parseFloat(amount);
  
  if (severityLevel >= 8 || amountNum >= 100) return 5;
  if (severityLevel >= 6 || amountNum >= 50) return 3;
  return 2;
}

/**
 * 辅助函数：检查验证是否完成
 */
function isValidationComplete(validations: any[], severityLevel: number, amount: string): boolean {
  if (!validations || validations.length === 0) return false;
  
  const required = getRequiredValidations(severityLevel, amount);
  const approved = validations.filter(v => v.vote === 'approve').length;
  const rejected = validations.filter(v => v.vote === 'reject').length;
  
  // 如果达到所需赞成票数，验证完成
  if (approved >= required) return true;
  
  // 如果反对票数超过一半且总票数足够，也算完成（被拒绝）
  if (validations.length >= required && rejected > approved) return true;
  
  return false;
}

/**
 * 辅助函数：获取可执行的操作
 */
function getAvailableActions(status: string): string[] {
  const actions: string[] = [];

  switch (status) {
    case 'pending':
    case 'under_review':
      actions.push('cancel');
      actions.push('view_validations');
      break;
    
    case 'approved':
      actions.push('view_validations');
      actions.push('track_progress');
      break;
    
    case 'completed':
      actions.push('view_validations');
      actions.push('leave_feedback');
      break;
    
    case 'rejected':
      actions.push('view_validations');
      actions.push('view_rejection_reason');
      break;
    
    case 'cancelled':
      actions.push('resubmit'); // 可以重新提交类似申请
      break;
      
    case 'expired':
      actions.push('resubmit');
      break;
  }

  actions.push('view_details');
  return actions;
}