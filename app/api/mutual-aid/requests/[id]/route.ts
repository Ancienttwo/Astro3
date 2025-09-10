import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyWeb3Auth } from '@/lib/auth';
import { z } from 'zod';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 更新请求状态的验证模式
const UpdateRequestSchema = z.object({
  status: z.enum(['pending', 'under_review', 'approved', 'rejected', 'completed', 'expired']).optional(),
  adminNotes: z.string().max(500).optional(),
});

/**
 * GET /api/mutual-aid/requests/[id]
 * 获取特定互助请求的详细信息
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    // 验证UUID格式
    if (!requestId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST_ID',
            message: '无效的请求ID格式',
          },
        },
        { status: 400 }
      );
    }

    // 获取详细的请求信息
    const { data: requestData, error } = await supabase
      .from('mutual_aid_requests')
      .select(`
        *,
        requester:user_profiles!requester_id(
          id,
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
          confidence_score,
          reason,
          created_at,
          validator:user_profiles!validator_id(
            wallet_address,
            reputation_score,
            validation_accuracy
          )
        ),
        prediction:mutual_aid_predictions!analysis_id(
          severity_level,
          confidence_score,
          timeframe,
          analysis_weights,
          support_recommendations,
          challenges,
          opportunities,
          advice
        )
      `)
      .eq('id', requestId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'REQUEST_NOT_FOUND',
              message: '找不到指定的互助请求',
            },
          },
          { status: 404 }
        );
      }
      throw error;
    }

    // 验证用户身份（可选）
    let isOwner = false;
    let isAdmin = false;
    let canValidate = false;

    try {
      const authResult = await verifyWeb3Auth(request);
      if (authResult.success) {
        isOwner = requestData.requester_id === authResult.userId;
        
        // 检查是否是管理员
        const { data: adminData } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', authResult.userId)
          .single();
        
        isAdmin = adminData?.role === 'admin';

        // 检查是否可以验证（符合验证者条件且未验证过该请求）
        if (!isOwner && !isAdmin) {
          const { data: validatorData } = await supabase
            .from('user_profiles')
            .select('reputation_score, validation_accuracy, is_active_validator')
            .eq('id', authResult.userId)
            .single();

          const hasValidated = requestData.validations?.some(
            (v: any) => v.validator_id === authResult.userId
          );

          canValidate = validatorData && 
            validatorData.reputation_score >= 3.0 && 
            validatorData.validation_accuracy >= 0.7 && 
            validatorData.is_active_validator && 
            !hasValidated &&
            requestData.status === 'pending';
        }
      }
    } catch (authError) {
      // 身份验证失败不影响查看公开信息
      console.warn('身份验证失败:', authError);
    }

    // 格式化响应数据
    const formattedResponse = {
      id: requestData.id,
      amount: requestData.amount,
      reason: requestData.reason,
      severityLevel: requestData.severity_level,
      urgency: requestData.urgency,
      category: requestData.category,
      status: requestData.status,
      publicMessage: requestData.public_message,
      supportingDocuments: requestData.supporting_documents,
      createdAt: requestData.created_at,
      updatedAt: requestData.updated_at,
      expiresAt: requestData.expires_at,
      
      // 申请者信息（部分匿名化）
      requester: {
        walletAddress: isOwner || isAdmin 
          ? requestData.requester.wallet_address 
          : `${requestData.requester.wallet_address.slice(0, 6)}...${requestData.requester.wallet_address.slice(-4)}`,
        reputationScore: requestData.requester.reputation_score,
        totalContributions: requestData.requester.total_contributions,
        verificationStatus: requestData.requester.verification_status,
        memberSince: requestData.requester.created_at,
        isAnonymous: !isOwner && !isAdmin,
      },

      // 验证状态汇总
      validationSummary: {
        total: requestData.validations?.length || 0,
        approved: requestData.validations?.filter((v: any) => v.vote === 'approve').length || 0,
        rejected: requestData.validations?.filter((v: any) => v.vote === 'reject').length || 0,
        averageConfidence: requestData.validations?.length > 0 
          ? requestData.validations.reduce((sum: number, v: any) => sum + v.confidence_score, 0) / requestData.validations.length
          : 0,
        requiredValidations: getRequiredValidations(requestData.severity_level, requestData.amount),
        isComplete: isValidationComplete(requestData.validations, requestData.severity_level, requestData.amount),
      },

      // 详细验证记录（根据权限显示不同信息）
      validations: requestData.validations?.map((validation: any) => ({
        id: validation.id,
        vote: validation.vote,
        confidenceScore: validation.confidence_score,
        reason: isOwner || isAdmin ? validation.reason : undefined,
        createdAt: validation.created_at,
        validator: {
          walletAddress: isOwner || isAdmin 
            ? validation.validator.wallet_address 
            : `${validation.validator.wallet_address.slice(0, 6)}...${validation.validator.wallet_address.slice(-4)}`,
          reputationScore: validation.validator.reputation_score,
          validationAccuracy: validation.validator.validation_accuracy,
          isAnonymous: !isOwner && !isAdmin,
        },
      })),

      // AI分析预测信息
      prediction: requestData.prediction ? {
        severityLevel: requestData.prediction.severity_level,
        confidenceScore: requestData.prediction.confidence_score,
        timeframe: requestData.prediction.timeframe,
        analysisWeights: requestData.prediction.analysis_weights,
        supportRecommendations: requestData.prediction.support_recommendations,
        challenges: requestData.prediction.challenges,
        opportunities: requestData.prediction.opportunities,
        advice: requestData.prediction.advice,
      } : undefined,

      // 用户权限信息
      permissions: {
        isOwner,
        isAdmin,
        canValidate,
        canView: true,
        canUpdate: isOwner || isAdmin,
        canCancel: isOwner && ['pending', 'under_review'].includes(requestData.status),
      },
    };

    return NextResponse.json({
      success: true,
      request: formattedResponse,
    });

  } catch (error) {
    console.error('获取互助请求详情错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'GET_REQUEST_FAILED',
          message: '获取互助请求详情失败',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/mutual-aid/requests/[id]
 * 更新互助请求状态（仅管理员或申请者）
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;
    const body = await request.json();
    const validatedData = UpdateRequestSchema.parse(body);

    // 验证Web3身份
    const authResult = await verifyWeb3Auth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '需要身份验证',
          },
        },
        { status: 401 }
      );
    }

    // 获取请求信息
    const { data: requestData, error: fetchError } = await supabase
      .from('mutual_aid_requests')
      .select('requester_id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: '找不到指定的互助请求',
          },
        },
        { status: 404 }
      );
    }

    // 检查权限
    const isOwner = requestData.requester_id === authResult.userId;
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', authResult.userId)
      .single();
    
    const isAdmin = userData?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: '没有权限修改此请求',
          },
        },
        { status: 403 }
      );
    }

    // 构建更新数据
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validatedData.status) {
      // 验证状态转换是否有效
      if (!isValidStatusTransition(requestData.status, validatedData.status)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_STATUS_TRANSITION',
              message: `不能将状态从 ${requestData.status} 更改为 ${validatedData.status}`,
            },
          },
          { status: 400 }
        );
      }

      updateData.status = validatedData.status;
    }

    if (validatedData.adminNotes && isAdmin) {
      updateData.admin_notes = validatedData.adminNotes;
    }

    // 执行更新
    const { data: updatedRequest, error: updateError } = await supabase
      .from('mutual_aid_requests')
      .update(updateData)
      .eq('id', requestId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 记录状态变更日志
    if (validatedData.status) {
      await supabase
        .from('request_status_history')
        .insert({
          request_id: requestId,
          from_status: requestData.status,
          to_status: validatedData.status,
          changed_by: authResult.userId,
          reason: validatedData.adminNotes,
        });
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: '请求状态已更新',
    });

  } catch (error) {
    console.error('更新互助请求错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_REQUEST_FAILED',
          message: '更新互助请求失败',
          details: error instanceof z.ZodError ? error.errors : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * 删除/取消互助请求（仅申请者在特定状态下）
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = params.id;

    // 验证Web3身份
    const authResult = await verifyWeb3Auth(request);
    if (!authResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: '需要身份验证',
          },
        },
        { status: 401 }
      );
    }

    // 获取请求信息
    const { data: requestData, error: fetchError } = await supabase
      .from('mutual_aid_requests')
      .select('requester_id, status')
      .eq('id', requestId)
      .single();

    if (fetchError || !requestData) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'REQUEST_NOT_FOUND',
            message: '找不到指定的互助请求',
          },
        },
        { status: 404 }
      );
    }

    // 检查是否是申请者
    if (requestData.requester_id !== authResult.userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_PERMISSIONS',
            message: '只能取消自己的申请',
          },
        },
        { status: 403 }
      );
    }

    // 检查状态是否允许取消
    if (!['pending', 'under_review'].includes(requestData.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CANNOT_CANCEL',
            message: '当前状态不允许取消申请',
          },
        },
        { status: 400 }
      );
    }

    // 软删除：更改状态为cancelled
    const { error: updateError } = await supabase
      .from('mutual_aid_requests')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (updateError) {
      throw updateError;
    }

    // 记录取消日志
    await supabase
      .from('request_status_history')
      .insert({
        request_id: requestId,
        from_status: requestData.status,
        to_status: 'cancelled',
        changed_by: authResult.userId,
        reason: '用户主动取消',
      });

    return NextResponse.json({
      success: true,
      message: '互助申请已取消',
    });

  } catch (error) {
    console.error('取消互助请求错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CANCEL_REQUEST_FAILED',
          message: '取消互助请求失败',
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
 * 辅助函数：验证状态转换是否有效
 */
function isValidStatusTransition(currentStatus: string, newStatus: string): boolean {
  const validTransitions: Record<string, string[]> = {
    'pending': ['under_review', 'rejected', 'cancelled'],
    'under_review': ['approved', 'rejected'],
    'approved': ['completed', 'expired'],
    'rejected': [],
    'completed': [],
    'cancelled': [],
    'expired': [],
  };

  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}