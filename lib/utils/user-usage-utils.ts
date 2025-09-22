// 用户使用统计工具函数
// 统一处理用户余额查询、更新和验证逻辑

import { getSupabaseAdminClient } from '@/lib/server/db';

const supabaseAdmin = getSupabaseAdminClient();
import { 
  UserUsage, 
  UserUsageResponse, 
  UserUsageCalculated,
  Web2UserUsage,
  Web3UserUsage,
  normalizeUserUsage,
  calculateRemainingUsage,
  DEFAULT_USER_USAGE,
  DatabaseResponse,
  CheckinStatus
} from '@/lib/types/user-usage';

// 错误类定义
export class UserUsageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'UserUsageError';
  }
}

// Web2用户使用统计查询
export async function getWeb2UserUsage(userId: string): Promise<UserUsageResponse> {
  try {
    if (!userId) {
      throw new UserUsageError('User ID is required', 'INVALID_USER_ID', 400);
    }

    const { data: rawUsage, error } = await supabaseAdmin
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new UserUsageError('Failed to fetch user usage', 'QUERY_FAILED', 500);
    }

    // 如果用户没有记录，返回默认值
    if (!rawUsage) {
      const DEFAULT_NO_TYPE1: Omit<UserUsage, 'user_id' | 'user_email' | 'created_at' | 'updated_at'> = DEFAULT_USER_USAGE;
      return {
        ...DEFAULT_NO_TYPE1,
        user_id: userId,
        user_email: `${userId}@temp.local`,
        user_type: 'web2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...calculateRemainingUsage(DEFAULT_USER_USAGE),
        exists: false
      };
    }

    // 标准化数据
    const normalizedUsage = normalizeUserUsage(rawUsage) as Web2UserUsage;
    const calculatedUsage = calculateRemainingUsage(normalizedUsage);

    return {
      ...normalizedUsage,
      ...calculatedUsage,
      exists: true
    };

  } catch (error) {
    if (error instanceof UserUsageError) {
      throw error;
    }
    console.error('Error in getWeb2UserUsage:', error);
    throw new UserUsageError('Internal error while fetching user usage', 'INTERNAL_ERROR', 500);
  }
}

// Web3用户使用统计查询
export async function getWeb3UserUsage(walletAddress: string): Promise<UserUsageResponse> {
  try {
    if (!walletAddress || walletAddress.length !== 42) {
      throw new UserUsageError('Valid wallet address is required', 'INVALID_WALLET_ADDRESS', 400);
    }

    const { data: usageResult, error } = await supabaseAdmin.rpc(
      'get_web3_user_usage',
      { p_wallet_address: walletAddress.toLowerCase() }
    );

    if (error) {
      throw new UserUsageError('Failed to fetch Web3 user usage', 'QUERY_FAILED', 500);
    }

    if (!usageResult || !usageResult.exists) {
      const DEFAULT_NO_TYPE2: Omit<UserUsage, 'user_id' | 'user_email' | 'created_at' | 'updated_at'> = DEFAULT_USER_USAGE;
      return {
        ...DEFAULT_NO_TYPE2,
        user_id: `web3_${walletAddress}`,
        user_email: `${walletAddress.toLowerCase()}@web3.local`,
        user_type: 'web3',
        wallet_address: walletAddress.toLowerCase(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...calculateRemainingUsage(DEFAULT_USER_USAGE),
        exists: false
      };
    }

    // 构建标准化响应
    const usage: Web3UserUsage = {
      user_id: `web3_${walletAddress}`,
      user_email: `${walletAddress.toLowerCase()}@web3.local`,
      user_type: 'web3',
      wallet_address: walletAddress.toLowerCase(),
      free_reports_limit: usageResult.usage_stats?.free_limit || 0,
      free_reports_used: usageResult.usage_stats?.free_used || 0,
      paid_reports_purchased: usageResult.usage_stats?.paid_purchased || 0,
      paid_reports_used: usageResult.usage_stats?.paid_used || 0,
      chatbot_limit: usageResult.usage_stats?.chatbot_limit || 0,
      chatbot_used: usageResult.usage_stats?.chatbot_used || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return {
      ...usage,
      free_reports_remaining: usageResult.free_reports_remaining || 0,
      paid_reports_remaining: usageResult.paid_reports_remaining || 0,
      total_reports_remaining: usageResult.total_reports_remaining || 0,
      chatbot_remaining: usageResult.chatbot_remaining || 0,
      exists: true
    };

  } catch (error) {
    if (error instanceof UserUsageError) {
      throw error;
    }
    console.error('Error in getWeb3UserUsage:', error);
    throw new UserUsageError('Internal error while fetching Web3 user usage', 'INTERNAL_ERROR', 500);
  }
}

// 创建默认用户使用记录
export async function createDefaultUserUsage(
  userId: string, 
  userEmail: string, 
  userType: 'web2' | 'web3' = 'web2',
  walletAddress?: string
): Promise<UserUsage> {
  try {
    const DEFAULT_NO_TYPE3: Omit<UserUsage, 'user_id' | 'user_email' | 'created_at' | 'updated_at'> = DEFAULT_USER_USAGE;
    const insertData = {
      user_id: userId,
      user_email: userEmail,
      user_type: userType,
      wallet_address: walletAddress?.toLowerCase(),
      ...DEFAULT_NO_TYPE3,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newUsage, error } = await supabaseAdmin
      .from('user_usage')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new UserUsageError('Failed to create user usage record', 'CREATE_FAILED', 500);
    }

    return normalizeUserUsage(newUsage);

  } catch (error) {
    if (error instanceof UserUsageError) {
      throw error;
    }
    console.error('Error in createDefaultUserUsage:', error);
    throw new UserUsageError('Internal error while creating user usage', 'INTERNAL_ERROR', 500);
  }
}

// 更新用户使用统计
export async function updateUserUsage(
  identifier: string,
  updates: Partial<UserUsage>,
  identifierType: 'user_id' | 'wallet_address' = 'user_id'
): Promise<UserUsage> {
  try {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    let query = supabaseAdmin
      .from('user_usage')
      .update(updateData)
      .select();

    if (identifierType === 'wallet_address') {
      query = query.eq('wallet_address', identifier.toLowerCase()).eq('user_type', 'web3');
    } else {
      query = query.eq('user_id', identifier);
    }

    const { data: updatedUsage, error } = await query.single();

    if (error) {
      throw new UserUsageError('Failed to update user usage', 'UPDATE_FAILED', 500);
    }

    return normalizeUserUsage(updatedUsage);

  } catch (error) {
    if (error instanceof UserUsageError) {
      throw error;
    }
    console.error('Error in updateUserUsage:', error);
    throw new UserUsageError('Internal error while updating user usage', 'INTERNAL_ERROR', 500);
  }
}

// 检查余额是否充足
export function checkSufficientBalance(
  usage: UserUsageCalculated, 
  requiredAmount: number
): { sufficient: boolean; canUseFromFree: number; canUseFromPaid: number } {
  const canUseFromFree = Math.min(usage.free_reports_remaining, requiredAmount);
  const remainingNeeded = requiredAmount - canUseFromFree;
  const canUseFromPaid = Math.min(usage.paid_reports_remaining, remainingNeeded);
  
  return {
    sufficient: (canUseFromFree + canUseFromPaid) >= requiredAmount,
    canUseFromFree,
    canUseFromPaid
  };
}

// 计算扣费策略
export function calculateDeductionStrategy(
  currentUsage: UserUsageResponse,
  amount: number
): {
  valid: boolean;
  freeUsed: number;
  paidUsed: number;
  newFreeUsed: number;
  newPaidUsed: number;
  error?: string;
} {
  const balanceCheck = checkSufficientBalance(currentUsage, amount);
  
  if (!balanceCheck.sufficient) {
    return {
      valid: false,
      freeUsed: 0,
      paidUsed: 0,
      newFreeUsed: currentUsage.free_reports_used,
      newPaidUsed: currentUsage.paid_reports_used,
      error: `Insufficient balance. Required: ${amount}, Available: ${currentUsage.total_reports_remaining}`
    };
  }

  const freeUsed = balanceCheck.canUseFromFree;
  const paidUsed = balanceCheck.canUseFromPaid;

  return {
    valid: true,
    freeUsed,
    paidUsed,
    newFreeUsed: currentUsage.free_reports_used + freeUsed,
    newPaidUsed: currentUsage.paid_reports_used + paidUsed
  };
}

// 防重复扣费检查
export async function checkRecentDeduction(
  identifier: string,
  identifierType: 'user_id' | 'wallet_address' = 'user_id',
  timeWindowSeconds: number = 5
): Promise<{ canProceed: boolean; message?: string }> {
  try {
    const timeThreshold = new Date(Date.now() - timeWindowSeconds * 1000).toISOString();
    
    let query = supabaseAdmin
      .from('user_usage')
      .select('updated_at')
      .gte('updated_at', timeThreshold);

    if (identifierType === 'wallet_address') {
      query = query.eq('wallet_address', identifier.toLowerCase()).eq('user_type', 'web3');
    } else {
      query = query.eq('user_id', identifier);
    }

    const { data: recentUpdates } = await query.single();

    if (recentUpdates) {
      return {
        canProceed: false,
        message: 'Detected possible duplicate request within time window'
      };
    }

    return { canProceed: true };

  } catch (error) {
    console.error('Error in checkRecentDeduction:', error);
    // 发生错误时允许继续，避免误拦截
    return { canProceed: true };
  }
}

// Web2签到状态检查
export async function getWeb2CheckinStatus(userId: string, checkDate?: string): Promise<CheckinStatus> {
  try {
    const targetDate = checkDate || new Date().toISOString().split('T')[0];
    
    const { data: checkinStatus, error } = await supabaseAdmin.rpc('check_web2_checkin_status', {
      p_user_id: userId,
      p_check_date: targetDate
    });

    if (error) {
      throw new UserUsageError('Failed to check checkin status', 'CHECKIN_STATUS_FAILED', 500);
    }

    return checkinStatus;

  } catch (error) {
    if (error instanceof UserUsageError) {
      throw error;
    }
    console.error('Error in getWeb2CheckinStatus:', error);
    throw new UserUsageError('Internal error while checking checkin status', 'INTERNAL_ERROR', 500);
  }
}

// 数据完整性验证
export async function validateDataIntegrity(
  userId?: string,
  daysBack: number = 30
): Promise<{
  status: 'healthy' | 'minor_issues' | 'needs_attention';
  consistencyRate: number;
  totalCheckins: number;
  inconsistentCount: number;
  inconsistencies: any[];
}> {
  try {
    const { data: validationResult, error } = await supabaseAdmin.rpc('validate_web2_checkin_integrity', {
      p_user_id: userId || null,
      p_days_back: daysBack
    });

    if (error) {
      throw new UserUsageError('Failed to validate data integrity', 'VALIDATION_FAILED', 500);
    }

    return {
      status: validationResult.status,
      consistencyRate: validationResult.consistency_rate,
      totalCheckins: validationResult.total_checkins,
      inconsistentCount: validationResult.inconsistent_count,
      inconsistencies: validationResult.inconsistencies
    };

  } catch (error) {
    if (error instanceof UserUsageError) {
      throw error;
    }
    console.error('Error in validateDataIntegrity:', error);
    throw new UserUsageError('Internal error while validating data integrity', 'INTERNAL_ERROR', 500);
  }
}

// 导出所有工具函数
export {
  DEFAULT_USER_USAGE,
  normalizeUserUsage,
  calculateRemainingUsage
};
