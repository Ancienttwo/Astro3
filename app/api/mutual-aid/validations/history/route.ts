import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveAuth } from '@/lib/auth-adapter';
import { ok, err } from '@/lib/api-response'
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GetValidationHistorySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  vote: z.enum(['approve', 'reject']).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['created_at', 'confidence_score']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/mutual-aid/validations/history
 * 获取用户的验证历史记录
 */
export async function GET(request: NextRequest) {
  try {
    // 认证用户
    const auth = await resolveAuth(request)
    if (!auth.ok || !auth.id) return err(401, 'AUTHENTICATION_REQUIRED', '需要Web3身份验证')

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50),
      vote: searchParams.get('vote') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = GetValidationHistorySchema.parse(params);
    const { page, limit, vote, dateFrom, dateTo, sortBy, sortOrder } = validatedParams;

    // 构建查询
    let query = supabase
      .from('mutual_aid_validations')
      .select(`
        *,
        request:mutual_aid_requests!request_id(
          id,
          amount,
          reason,
          category,
          urgency,
          status,
          severity_level,
          created_at,
          requester:user_profiles!requester_id(
            wallet_address,
            reputation_score
          )
        )
      `, { count: 'exact' })
      .eq('validator_id', auth.id!);

    // 应用筛选条件
    if (vote) {
      query = query.eq('vote', vote);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // 应用排序
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 应用分页
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: validations, error, count } = await query;

    if (error) {
      throw error;
    }

    // 格式化响应数据
    const formattedValidations = validations?.map(validation => ({
      id: validation.id,
      vote: validation.vote,
      confidenceScore: validation.confidence_score,
      reason: validation.reason,
      reviewTimeSeconds: validation.review_time_seconds,
      createdAt: validation.created_at,
      
      // 请求信息
      request: validation.request ? {
        id: validation.request.id,
        amount: validation.request.amount,
        reason: validation.request.reason.substring(0, 100) + '...', // 截断显示
        category: validation.request.category,
        urgency: validation.request.urgency,
        status: validation.request.status,
        severityLevel: validation.request.severity_level,
        createdAt: validation.request.created_at,
        
        // 申请者信息（匿名化）
        requester: {
          walletAddress: `${validation.request.requester.wallet_address.slice(0, 6)}...${validation.request.requester.wallet_address.slice(-4)}`,
          reputationScore: validation.request.requester.reputation_score,
        },
      } : null,
      
      // 验证结果状态
      resultStatus: getValidationResultStatus(validation, validation.request),
    })) || [];

    // 计算分页信息
    const totalPages = Math.ceil((count || 0) / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // 获取验证统计信息
    const validationStats = await getValidationStats(auth.id!, dateFrom, dateTo);

    return ok(formattedValidations, {
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: {
        vote,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      },
      stats: validationStats,
    });

  } catch (error) {
    console.error('获取验证历史记录错误:', error);
    return err(500, 'GET_VALIDATION_HISTORY_FAILED', '获取验证历史记录失败', error instanceof z.ZodError ? error.errors : undefined)
  }
}

/**
 * 获取验证统计信息
 */
async function getValidationStats(userId: string, dateFrom?: string, dateTo?: string) {
  try {
    // 基础查询
    let query = supabase
      .from('mutual_aid_validations')
      .select(`
        vote,
        created_at,
        confidence_score,
        request:mutual_aid_requests!request_id(
          status,
          amount,
          category,
          severity_level
        )
      `)
      .eq('validator_id', userId);

    // 应用日期筛选
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    const { data: validationsRaw, error } = await query;

    if (error || !validationsRaw) {
      return null;
    }

    type ValidationRecord = {
      vote: 'approve' | 'reject';
      created_at: string;
      confidence_score: number;
      request?: {
        status?: string;
        amount?: string;
        category?: string;
        severity_level?: number;
      };
    };

    const validations = validationsRaw as unknown as ValidationRecord[];

    // 计算基础统计
    const totalValidations = validations.length;
    const approvedValidations = validations.filter(v => v.vote === 'approve').length;
    const rejectedValidations = validations.filter(v => v.vote === 'reject').length;

    // 计算准确率（基于最终结果的匹配度）
    let correctValidations = 0;
    validations.forEach(validation => {
      const finalStatus = validation.request?.status || '';
      if (
        (validation.vote === 'approve' && (finalStatus === 'approved' || finalStatus === 'completed')) ||
        (validation.vote === 'reject' && finalStatus === 'rejected')
      ) {
        correctValidations++;
      }
    });

    const accuracy = totalValidations > 0 ? (correctValidations / totalValidations) : 0;

    // 计算平均置信度
    const avgConfidence = totalValidations > 0 
      ? validations.reduce((sum, v) => sum + v.confidence_score, 0) / totalValidations
      : 0;

    // 按类别统计
    const categoryStats = validations.reduce((acc: Record<string, any>, validation) => {
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

    // 按严重程度统计
    const severityStats = validations.reduce((acc: Record<number, any>, validation) => {
      const severity = validation.request?.severity_level || 0;
      if (!acc[severity]) {
        acc[severity] = { total: 0, approved: 0, rejected: 0 };
      }
      acc[severity].total++;
      if (validation.vote === 'approve') {
        acc[severity].approved++;
      } else {
        acc[severity].rejected++;
      }
      return acc;
    }, {});

    // 计算奖励总额
    const totalRewards = validations.reduce((sum, validation) => {
      const baseReward = calculateValidationReward(
        validation.request?.severity_level || 5,
        validation.request?.amount || '10'
      );
      return sum + baseReward;
    }, 0);

    return {
      totalValidations,
      approvedValidations,
      rejectedValidations,
      approvalRate: (approvedValidations / totalValidations * 100).toFixed(1),
      accuracy: (accuracy * 100).toFixed(1),
      averageConfidence: avgConfidence.toFixed(2),
      totalRewards: totalRewards.toFixed(2),
      categoryBreakdown: categoryStats,
      severityBreakdown: severityStats,
      performance: {
        rating: getPerformanceRating(accuracy, avgConfidence),
        level: getValidatorLevel(totalValidations, accuracy),
      },
    };

  } catch (error) {
    console.error('获取验证统计信息失败:', error);
    return null;
  }
}

/**
 * 辅助函数：获取验证结果状态
 */
function getValidationResultStatus(validation: any, request: any) {
  if (!request) {
    return { status: 'unknown', description: '请求信息不可用' };
  }

  const finalStatus = request.status;
  const userVote = validation.vote;

  // 判断验证是否正确
  let isCorrect = false;
  let description = '';

  switch (finalStatus) {
    case 'approved':
    case 'completed':
      isCorrect = userVote === 'approve';
      description = isCorrect ? '验证正确：申请被批准' : '验证错误：申请被批准但您投了反对票';
      break;
    
    case 'rejected':
      isCorrect = userVote === 'reject';
      description = isCorrect ? '验证正确：申请被拒绝' : '验证错误：申请被拒绝但您投了赞成票';
      break;
    
    case 'pending':
    case 'under_review':
      description = '验证结果待定：申请仍在处理中';
      break;
    
    case 'expired':
    case 'cancelled':
      description = '申请已过期或取消';
      break;
    
    default:
      description = '未知状态';
  }

  return {
    status: finalStatus,
    isCorrect: finalStatus === 'pending' || finalStatus === 'under_review' ? null : isCorrect,
    description,
    impact: getValidationImpact(userVote, finalStatus),
  };
}

/**
 * 辅助函数：获取验证影响
 */
function getValidationImpact(userVote: string, finalStatus: string) {
  if (finalStatus === 'approved' && userVote === 'approve') {
    return { type: 'positive', description: '您的投票帮助了有需要的人' };
  } else if (finalStatus === 'rejected' && userVote === 'reject') {
    return { type: 'protective', description: '您的投票保护了资金池' };
  } else if (finalStatus === 'approved' && userVote === 'reject') {
    return { type: 'conservative', description: '您采取了更保守的立场' };
  } else if (finalStatus === 'rejected' && userVote === 'approve') {
    return { type: 'generous', description: '您采取了更慷慨的立场' };
  } else {
    return { type: 'neutral', description: '结果待定' };
  }
}

/**
 * 辅助函数：计算验证奖励
 */
function calculateValidationReward(severityLevel: number, amount: string): number {
  const baseReward = 0.5;
  const severityMultiplier = 1 + (severityLevel - 5) * 0.1;
  const amountMultiplier = 1 + Math.log10(parseFloat(amount) + 1) * 0.1;
  
  return Math.round((baseReward * severityMultiplier * amountMultiplier) * 100) / 100;
}

/**
 * 辅助函数：获取性能评级
 */
function getPerformanceRating(accuracy: number, avgConfidence: number): string {
  const score = accuracy * 0.7 + avgConfidence * 0.3;
  
  if (score >= 0.95) return 'S';
  if (score >= 0.9) return 'A';
  if (score >= 0.8) return 'B';
  if (score >= 0.7) return 'C';
  return 'D';
}

/**
 * 辅助函数：获取验证者级别
 */
function getValidatorLevel(totalValidations: number, accuracy: number): string {
  if (totalValidations >= 500 && accuracy >= 0.95) return '大师级验证者';
  if (totalValidations >= 200 && accuracy >= 0.9) return '专家级验证者';
  if (totalValidations >= 100 && accuracy >= 0.85) return '高级验证者';
  if (totalValidations >= 50 && accuracy >= 0.8) return '资深验证者';
  if (totalValidations >= 20 && accuracy >= 0.75) return '中级验证者';
  if (totalValidations >= 10) return '初级验证者';
  return '新手验证者';
}
