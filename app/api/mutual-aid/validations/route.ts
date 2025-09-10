import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWeb3Auth } from '@/lib/auth';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 验证投票的验证模式
const SubmitValidationSchema = z.object({
  requestId: z.string().uuid('无效的请求ID'),
  vote: z.enum(['approve', 'reject'], { 
    errorMap: () => ({ message: '投票结果必须是 approve 或 reject' }) 
  }),
  confidenceScore: z.number()
    .min(0.1, '置信度不能低于0.1')
    .max(1.0, '置信度不能高于1.0'),
  reason: z.string()
    .min(20, '验证理由至少需要20个字符')
    .max(500, '验证理由不能超过500个字符'),
  reviewTime: z.number().min(10).optional(), // 审查用时（秒）
});

const GetPendingValidationsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  category: z.enum(['financial', 'medical', 'education', 'family', 'disaster', 'other']).optional(),
  urgency: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  severityLevel: z.number().min(1).max(10).optional(),
  sortBy: z.enum(['created_at', 'amount', 'urgency', 'validation_count']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * GET /api/mutual-aid/validations
 * 获取待验证的互助请求列表
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

    // 检查验证者资格
    const { data: validatorData, error: validatorError } = await supabase
      .from('user_profiles')
      .select('reputation_score, validation_accuracy, is_active_validator, total_validations')
      .eq('id', authResult.userId)
      .single();

    if (validatorError || !validatorData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATOR_DATA_NOT_FOUND',
            message: '找不到验证者信息',
          },
        },
        { status: 404 }
      );
    }

    // 验证验证者资格
    const isQualifiedValidator = 
      validatorData.reputation_score >= 3.0 && 
      validatorData.validation_accuracy >= 0.7 && 
      validatorData.is_active_validator;

    if (!isQualifiedValidator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_VALIDATOR_QUALIFICATIONS',
            message: '您暂时不符合验证者要求',
            requirements: {
              minReputationScore: 3.0,
              currentReputationScore: validatorData.reputation_score,
              minValidationAccuracy: 0.7,
              currentValidationAccuracy: validatorData.validation_accuracy,
              isActiveValidator: validatorData.is_active_validator,
            },
          },
        },
        { status: 403 }
      );
    }

    // 解析查询参数
    const { searchParams } = new URL(request.url);
    const params = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50),
      category: searchParams.get('category') || undefined,
      urgency: searchParams.get('urgency') || undefined,
      severityLevel: searchParams.get('severityLevel') ? parseInt(searchParams.get('severityLevel')!) : undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedParams = GetPendingValidationsSchema.parse(params);
    const { page, limit, category, urgency, severityLevel, sortBy, sortOrder } = validatedParams;

    // 构建查询 - 获取用户未验证过的待验证请求
    let query = supabase
      .from('mutual_aid_requests')
      .select(`
        *,
        requester:user_profiles!requester_id(
          wallet_address,
          reputation_score,
          total_contributions,
          verification_status,
          created_at
        ),
        validations:mutual_aid_validations(
          id,
          validator_id,
          vote,
          confidence_score
        ),
        prediction:mutual_aid_predictions!analysis_id(
          severity_level,
          confidence_score,
          timeframe,
          support_recommendations,
          analysis_weights
        )
      `, { count: 'exact' })
      .eq('status', 'pending')
      .neq('requester_id', authResult.userId); // 不能验证自己的申请

    // 应用筛选条件
    if (category) {
      query = query.eq('category', category);
    }
    if (urgency) {
      query = query.eq('urgency', urgency);
    }
    if (severityLevel) {
      query = query.eq('severity_level', severityLevel);
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

    // 过滤掉用户已经验证过的请求
    const filteredRequests = requests?.filter(request => {
      const hasValidated = request.validations?.some(
        (validation: any) => validation.validator_id === authResult.userId
      );
      return !hasValidated;
    }) || [];

    // 格式化响应数据
    const formattedRequests = filteredRequests.map(request => ({
      id: request.id,
      amount: request.amount,
      reason: request.reason,
      severityLevel: request.severity_level,
      urgency: request.urgency,
      category: request.category,
      status: request.status,
      publicMessage: request.public_message,
      createdAt: request.created_at,
      expiresAt: request.expires_at,
      
      // 申请者信息（匿名化）
      requester: {
        walletAddress: `${request.requester.wallet_address.slice(0, 6)}...${request.requester.wallet_address.slice(-4)}`,
        reputationScore: request.requester.reputation_score,
        totalContributions: request.requester.total_contributions,
        verificationStatus: request.requester.verification_status,
        memberSince: request.requester.created_at,
      },

      // 验证状态汇总
      validationSummary: {
        total: request.validations?.length || 0,
        approved: request.validations?.filter((v: any) => v.vote === 'approve').length || 0,
        rejected: request.validations?.filter((v: any) => v.vote === 'reject').length || 0,
        requiredValidations: getRequiredValidations(request.severity_level, request.amount),
      },

      // AI分析预测信息
      prediction: request.prediction ? {
        severityLevel: request.prediction.severity_level,
        confidenceScore: request.prediction.confidence_score,
        timeframe: request.prediction.timeframe,
        supportRecommendations: request.prediction.support_recommendations,
        analysisWeights: request.prediction.analysis_weights,
      } : undefined,

      // 验证奖励信息
      reward: {
        baseReward: calculateValidationReward(request.severity_level, request.amount),
        bonusMultiplier: getBonusMultiplier(validatorData.validation_accuracy),
        estimatedTotal: calculateValidationReward(request.severity_level, request.amount) * getBonusMultiplier(validatorData.validation_accuracy),
      },
    }));

    // 计算分页信息
    const totalFiltered = filteredRequests.length;
    const totalPages = Math.ceil(totalFiltered / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // 获取验证者统计信息
    const validatorStats = await getValidatorStats(authResult.userId);

    return NextResponse.json({
      success: true,
      data: formattedRequests,
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasNext,
        hasPrev,
        availableTotal: count || 0, // 总的待验证请求数（包括已验证过的）
      },
      filters: {
        category,
        urgency,
        severityLevel,
        sortBy,
        sortOrder,
      },
      validatorInfo: {
        qualifications: validatorData,
        stats: validatorStats,
      },
    });

  } catch (error) {
    console.error('获取待验证请求列表错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_PENDING_VALIDATIONS_FAILED',
          message: '获取待验证请求列表失败',
          details: error instanceof z.ZodError ? error.errors : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/mutual-aid/validations
 * 提交验证投票
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const validatedData = SubmitValidationSchema.parse(body);

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

    // 检查验证者资格
    const { data: validatorData, error: validatorError } = await supabase
      .from('user_profiles')
      .select('reputation_score, validation_accuracy, is_active_validator')
      .eq('id', authResult.userId)
      .single();

    if (validatorError || !validatorData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATOR_DATA_NOT_FOUND',
            message: '找不到验证者信息',
          },
        },
        { status: 404 }
      );
    }

    const isQualifiedValidator = 
      validatorData.reputation_score >= 3.0 && 
      validatorData.validation_accuracy >= 0.7 && 
      validatorData.is_active_validator;

    if (!isQualifiedValidator) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_VALIDATOR_QUALIFICATIONS',
            message: '您暂时不符合验证者要求',
          },
        },
        { status: 403 }
      );
    }

    // 检查申请是否存在且状态正确
    const { data: requestData, error: requestError } = await supabase
      .from('mutual_aid_requests')
      .select('id, requester_id, status, severity_level, amount')
      .eq('id', validatedData.requestId)
      .single();

    if (requestError || !requestData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: '找不到指定的互助申请',
          },
        },
        { status: 404 }
      );
    }

    // 验证申请状态
    if (requestData.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST_STATUS',
            message: '此申请当前不接受验证',
            currentStatus: requestData.status,
          },
        },
        { status: 400 }
      );
    }

    // 验证不是自己的申请
    if (requestData.requester_id === authResult.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CANNOT_VALIDATE_OWN_REQUEST',
            message: '不能验证自己的申请',
          },
        },
        { status: 403 }
      );
    }

    // 检查是否已经验证过
    const { data: existingValidation } = await supabase
      .from('mutual_aid_validations')
      .select('id')
      .eq('request_id', validatedData.requestId)
      .eq('validator_id', authResult.userId)
      .single();

    if (existingValidation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_VALIDATED',
            message: '您已经验证过此申请',
          },
        },
        { status: 409 }
      );
    }

    // 提交验证
    const { data: validation, error: validationError } = await supabase
      .from('mutual_aid_validations')
      .insert({
        request_id: validatedData.requestId,
        validator_id: authResult.userId,
        vote: validatedData.vote,
        confidence_score: validatedData.confidenceScore,
        reason: validatedData.reason,
        review_time_seconds: validatedData.reviewTime,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      })
      .select()
      .single();

    if (validationError) {
      throw validationError;
    }

    // 检查是否达到验证完成条件
    const { data: allValidations } = await supabase
      .from('mutual_aid_validations')
      .select('vote')
      .eq('request_id', validatedData.requestId);

    const validationResult = checkValidationComplete(
      allValidations || [],
      requestData.severity_level,
      requestData.amount
    );

    // 如果验证完成，更新申请状态
    if (validationResult.isComplete) {
      const newStatus = validationResult.approved ? 'approved' : 'rejected';
      
      await supabase
        .from('mutual_aid_requests')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          validation_completed_at: new Date().toISOString(),
        })
        .eq('id', validatedData.requestId);

      // 记录状态变更
      await supabase
        .from('request_status_history')
        .insert({
          request_id: validatedData.requestId,
          from_status: 'pending',
          to_status: newStatus,
          changed_by: 'system',
          reason: `验证完成：${validationResult.approved ? '通过' : '拒绝'}`,
        });

      // 如果申请被批准，触发资金分配流程
      if (validationResult.approved) {
        await initiateFundingProcess(validatedData.requestId);
      }

      // 通知申请者
      await notifyRequester(validatedData.requestId, newStatus, validationResult);
    }

    // 计算验证奖励
    const reward = calculateValidationReward(requestData.severity_level, requestData.amount);
    const bonusMultiplier = getBonusMultiplier(validatorData.validation_accuracy);
    const totalReward = reward * bonusMultiplier;

    // 发放验证奖励
    await awardValidationReward(authResult.userId, totalReward, validation.id);

    // 更新验证者统计
    await updateValidatorStats(authResult.userId, validatedData.vote === 'approve');

    return NextResponse.json({
      success: true,
      validation: {
        id: validation.id,
        vote: validation.vote,
        confidenceScore: validation.confidence_score,
        createdAt: validation.created_at,
      },
      validationResult: validationResult.isComplete ? {
        isComplete: true,
        approved: validationResult.approved,
        finalStatus: validationResult.approved ? 'approved' : 'rejected',
      } : {
        isComplete: false,
        progress: {
          current: (allValidations || []).length + 1,
          required: getRequiredValidations(requestData.severity_level, requestData.amount),
        },
      },
      reward: {
        base: reward,
        multiplier: bonusMultiplier,
        total: totalReward,
      },
      message: '验证已成功提交',
    });

  } catch (error) {
    console.error('提交验证错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUBMIT_VALIDATION_FAILED',
          message: '提交验证失败',
          details: error instanceof z.ZodError ? error.errors : undefined,
        },
      },
      { status: 500 }
    );
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
function checkValidationComplete(validations: any[], severityLevel: number, amount: string) {
  const required = getRequiredValidations(severityLevel, amount);
  const approved = validations.filter(v => v.vote === 'approve').length;
  const rejected = validations.filter(v => v.vote === 'reject').length;
  const total = validations.length;

  // 如果达到所需赞成票数
  if (approved >= required) {
    return { isComplete: true, approved: true };
  }

  // 如果反对票数使得无法达到所需赞成票数
  if (total >= required && rejected > (total - required)) {
    return { isComplete: true, approved: false };
  }

  return { isComplete: false, approved: false };
}

/**
 * 辅助函数：计算验证奖励
 */
function calculateValidationReward(severityLevel: number, amount: string): number {
  const baseReward = 0.5; // 基础奖励 0.5 AZI
  const severityMultiplier = 1 + (severityLevel - 5) * 0.1; // 严重程度系数
  const amountMultiplier = 1 + Math.log10(parseFloat(amount) + 1) * 0.1; // 金额系数
  
  return Math.round((baseReward * severityMultiplier * amountMultiplier) * 100) / 100;
}

/**
 * 辅助函数：获取准确率奖金系数
 */
function getBonusMultiplier(validationAccuracy: number): number {
  if (validationAccuracy >= 0.95) return 1.5;
  if (validationAccuracy >= 0.9) return 1.3;
  if (validationAccuracy >= 0.8) return 1.1;
  return 1.0;
}

/**
 * 辅助函数：获取验证者统计信息
 */
async function getValidatorStats(userId: string) {
  try {
    const { data: stats } = await supabase
      .from('mutual_aid_validations')
      .select('vote, created_at')
      .eq('validator_id', userId);

    if (!stats) return null;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalValidations = stats.length;
    const recentValidations = stats.filter(s => new Date(s.created_at) >= thirtyDaysAgo).length;
    const approvedValidations = stats.filter(s => s.vote === 'approve').length;

    return {
      totalValidations,
      recentValidations,
      approvedValidations,
      approvalRate: totalValidations > 0 ? (approvedValidations / totalValidations * 100).toFixed(1) : '0.0',
    };

  } catch (error) {
    console.error('获取验证者统计失败:', error);
    return null;
  }
}

/**
 * 启动资金分配流程
 */
async function initiateFundingProcess(requestId: string) {
  // 实现资金分配逻辑
  console.log(`启动资金分配流程: ${requestId}`);
}

/**
 * 通知申请者
 */
async function notifyRequester(requestId: string, status: string, validationResult: any) {
  // 实现通知逻辑
  console.log(`通知申请者: ${requestId}, 状态: ${status}`);
}

/**
 * 发放验证奖励
 */
async function awardValidationReward(userId: string, amount: number, validationId: string) {
  try {
    await supabase.rpc('award_validation_reward', {
      user_id: userId,
      amount: amount,
      validation_id: validationId,
    });
  } catch (error) {
    console.error('发放验证奖励失败:', error);
  }
}

/**
 * 更新验证者统计
 */
async function updateValidatorStats(userId: string, approved: boolean) {
  try {
    await supabase.rpc('update_validator_stats', {
      user_id: userId,
      validation_approved: approved,
    });
  } catch (error) {
    console.error('更新验证者统计失败:', error);
  }
}