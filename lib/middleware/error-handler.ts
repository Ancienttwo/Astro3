// 统一错误处理中间件
// 标准化所有API的错误处理和响应格式

import { NextResponse } from 'next/server';
import { ApiResponse, ApiErrorResponse, ApiSuccessResponse } from '@/lib/types/user-usage';

// 标准错误类型枚举
export enum ErrorTypes {
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // 验证错误
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_PARAMETER = 'MISSING_PARAMETER',
  INVALID_USER_TYPE = 'INVALID_USER_TYPE',
  INVALID_WALLET_ADDRESS = 'INVALID_WALLET_ADDRESS',
  
  // 业务逻辑错误
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  ALREADY_CHECKED_IN = 'ALREADY_CHECKED_IN',
  DUPLICATE_REQUEST = 'DUPLICATE_REQUEST',
  FEATURE_NOT_AVAILABLE = 'FEATURE_NOT_AVAILABLE',
  
  // 数据库错误
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  RECORD_ALREADY_EXISTS = 'RECORD_ALREADY_EXISTS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  
  // 系统错误
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Web3特定错误
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  CHAIN_ERROR = 'CHAIN_ERROR',
  CONTRACT_ERROR = 'CONTRACT_ERROR'
}

// 错误代码到状态码的映射
const ERROR_STATUS_MAP: Record<ErrorTypes, number> = {
  // 认证错误 (401)
  [ErrorTypes.UNAUTHORIZED]: 401,
  [ErrorTypes.INVALID_TOKEN]: 401,
  [ErrorTypes.TOKEN_EXPIRED]: 401,
  
  // 验证错误 (400)
  [ErrorTypes.INVALID_INPUT]: 400,
  [ErrorTypes.MISSING_PARAMETER]: 400,
  [ErrorTypes.INVALID_USER_TYPE]: 400,
  [ErrorTypes.INVALID_WALLET_ADDRESS]: 400,
  
  // 业务逻辑错误 (400/409)
  [ErrorTypes.INSUFFICIENT_BALANCE]: 400,
  [ErrorTypes.ALREADY_CHECKED_IN]: 409,
  [ErrorTypes.DUPLICATE_REQUEST]: 409,
  [ErrorTypes.FEATURE_NOT_AVAILABLE]: 400,
  
  // 数据库错误 (404/500)
  [ErrorTypes.DATABASE_ERROR]: 500,
  [ErrorTypes.RECORD_NOT_FOUND]: 404,
  [ErrorTypes.RECORD_ALREADY_EXISTS]: 409,
  [ErrorTypes.TRANSACTION_FAILED]: 500,
  
  // 系统错误 (500/503)
  [ErrorTypes.INTERNAL_ERROR]: 500,
  [ErrorTypes.SERVICE_UNAVAILABLE]: 503,
  [ErrorTypes.RATE_LIMIT_EXCEEDED]: 429,
  
  // Web3特定错误 (400/500)
  [ErrorTypes.INVALID_SIGNATURE]: 400,
  [ErrorTypes.CHAIN_ERROR]: 500,
  [ErrorTypes.CONTRACT_ERROR]: 500
};

// 用户友好的错误消息映射
const ERROR_MESSAGE_MAP: Record<ErrorTypes, string> = {
  // 认证错误
  [ErrorTypes.UNAUTHORIZED]: '用户未授权，请先登录',
  [ErrorTypes.INVALID_TOKEN]: '认证令牌无效，请重新登录',
  [ErrorTypes.TOKEN_EXPIRED]: '认证令牌已过期，请重新登录',
  
  // 验证错误
  [ErrorTypes.INVALID_INPUT]: '输入参数无效',
  [ErrorTypes.MISSING_PARAMETER]: '缺少必要参数',
  [ErrorTypes.INVALID_USER_TYPE]: '用户类型无效',
  [ErrorTypes.INVALID_WALLET_ADDRESS]: '钱包地址格式无效',
  
  // 业务逻辑错误
  [ErrorTypes.INSUFFICIENT_BALANCE]: '余额不足',
  [ErrorTypes.ALREADY_CHECKED_IN]: '今日已签到',
  [ErrorTypes.DUPLICATE_REQUEST]: '检测到重复请求',
  [ErrorTypes.FEATURE_NOT_AVAILABLE]: '功能暂不可用',
  
  // 数据库错误
  [ErrorTypes.DATABASE_ERROR]: '数据库操作失败',
  [ErrorTypes.RECORD_NOT_FOUND]: '记录不存在',
  [ErrorTypes.RECORD_ALREADY_EXISTS]: '记录已存在',
  [ErrorTypes.TRANSACTION_FAILED]: '事务执行失败',
  
  // 系统错误
  [ErrorTypes.INTERNAL_ERROR]: '系统内部错误',
  [ErrorTypes.SERVICE_UNAVAILABLE]: '服务暂时不可用',
  [ErrorTypes.RATE_LIMIT_EXCEEDED]: '请求频率过高',
  
  // Web3特定错误
  [ErrorTypes.INVALID_SIGNATURE]: '签名验证失败',
  [ErrorTypes.CHAIN_ERROR]: '区块链网络错误',
  [ErrorTypes.CONTRACT_ERROR]: '智能合约执行错误'
};

// 标准化API错误类
export class ApiError extends Error {
  public readonly type: ErrorTypes;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: any;
  public readonly context?: Record<string, any>;

  constructor(
    type: ErrorTypes,
    message?: string,
    details?: any,
    context?: Record<string, any>
  ) {
    super(message || ERROR_MESSAGE_MAP[type]);
    this.name = 'ApiError';
    this.type = type;
    this.statusCode = ERROR_STATUS_MAP[type];
    this.userMessage = ERROR_MESSAGE_MAP[type];
    this.details = details;
    this.context = context;
    
    // 确保堆栈跟踪正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  // 转换为API响应格式
  toResponse(): NextResponse<ApiErrorResponse> {
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: this.userMessage,
      details: this.details
    };

    // 记录错误日志
    this.logError();

    return NextResponse.json(errorResponse, { status: this.statusCode });
  }

  // 记录错误日志
  private logError(): void {
    const logLevel = this.statusCode >= 500 ? 'error' : 'warn';
    const logData = {
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      context: this.context,
      stack: this.stack
    };

    if (logLevel === 'error') {
      console.error('❌ API Error:', logData);
    } else {
      console.warn('⚠️ API Warning:', logData);
    }
  }
}

// 快速创建常见错误的工厂函数
export const ErrorFactory = {
  // 认证错误
  unauthorized: (message?: string, details?: any) => 
    new ApiError(ErrorTypes.UNAUTHORIZED, message, details),
  
  invalidToken: (message?: string, details?: any) => 
    new ApiError(ErrorTypes.INVALID_TOKEN, message, details),
  
  // 验证错误
  invalidInput: (message?: string, details?: any) => 
    new ApiError(ErrorTypes.INVALID_INPUT, message, details),
  
  missingParameter: (paramName: string, details?: any) => 
    new ApiError(ErrorTypes.MISSING_PARAMETER, `缺少参数: ${paramName}`, details),
  
  invalidUserType: (provided?: string) => 
    new ApiError(ErrorTypes.INVALID_USER_TYPE, `用户类型无效: ${provided}`, { provided }),
  
  invalidWalletAddress: (address?: string) => 
    new ApiError(ErrorTypes.INVALID_WALLET_ADDRESS, `钱包地址格式无效: ${address}`, { address }),
  
  // 业务逻辑错误
  insufficientBalance: (required: number, available: number, breakdown?: any) =>
    new ApiError(
      ErrorTypes.INSUFFICIENT_BALANCE,
      `余额不足，需要 ${required} 次，可用 ${available} 次`,
      { required, available, ...breakdown }
    ),
  
  alreadyCheckedIn: (date?: string) =>
    new ApiError(ErrorTypes.ALREADY_CHECKED_IN, `${date || '今日'}已签到`),
  
  duplicateRequest: (message?: string) =>
    new ApiError(ErrorTypes.DUPLICATE_REQUEST, message),
  
  // 数据库错误
  databaseError: (operation: string, originalError?: any) =>
    new ApiError(
      ErrorTypes.DATABASE_ERROR,
      `数据库${operation}失败`,
      { operation, originalError: originalError?.message }
    ),
  
  recordNotFound: (resource: string, identifier?: string) =>
    new ApiError(
      ErrorTypes.RECORD_NOT_FOUND,
      `${resource}不存在${identifier ? `: ${identifier}` : ''}`,
      { resource, identifier }
    ),
  
  transactionFailed: (operation: string, reason?: string) =>
    new ApiError(
      ErrorTypes.TRANSACTION_FAILED,
      `事务失败: ${operation}${reason ? ` - ${reason}` : ''}`,
      { operation, reason }
    ),
  
  // 系统错误
  internalError: (message?: string, context?: any) =>
    new ApiError(ErrorTypes.INTERNAL_ERROR, message, context),
  
  serviceUnavailable: (service?: string) =>
    new ApiError(
      ErrorTypes.SERVICE_UNAVAILABLE,
      service ? `${service}服务不可用` : undefined
    )
};

// 成功响应创建函数
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    message
  };

  return NextResponse.json(response);
}

// 错误处理包装器
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R | NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      // 如果是已知的ApiError，直接返回响应
      if (error instanceof ApiError) {
        return error.toResponse();
      }

      // 处理Supabase特定错误
      if (error && typeof error === 'object' && 'code' in error) {
        return handleSupabaseError(error as any);
      }

      // 处理其他未知错误
      console.error('❌ Unhandled error in API:', error);
      return ErrorFactory.internalError(
        '系统内部错误',
        { originalError: error instanceof Error ? error.message : String(error) }
      ).toResponse();
    }
  };
}

// Supabase错误处理
function handleSupabaseError(error: any): NextResponse {
  const { code, message, details } = error;

  switch (code) {
    case 'PGRST116': // 记录不存在
      return ErrorFactory.recordNotFound('用户记录', details).toResponse();
    
    case '23505': // 唯一约束违反
      return ErrorFactory.recordAlreadyExists(message, { code, details }).toResponse();
    
    case '23503': // 外键约束违反
      return ErrorFactory.databaseError('关联数据约束', { code, message }).toResponse();
    
    case '42P01': // 表不存在
      return ErrorFactory.serviceUnavailable('数据库服务').toResponse();
    
    default:
      return ErrorFactory.databaseError('未知数据库操作', { code, message, details }).toResponse();
  }
}

// 辅助函数：记录已存在错误
function recordAlreadyExists(message?: string, details?: any): ApiError {
  return new ApiError(ErrorTypes.RECORD_ALREADY_EXISTS, message, details);
}

// 验证中间件
export const ValidationMiddleware = {
  // 验证用户类型
  validateUserType: (userType: string) => {
    if (!['web2', 'web3'].includes(userType)) {
      throw ErrorFactory.invalidUserType(userType);
    }
  },

  // 验证钱包地址
  validateWalletAddress: (address: string) => {
    if (!address || address.length !== 42 || !address.startsWith('0x')) {
      throw ErrorFactory.invalidWalletAddress(address);
    }
  },

  // 验证必需参数
  validateRequired: (params: Record<string, any>) => {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === '') {
        throw ErrorFactory.missingParameter(key);
      }
    }
  },

  // 验证数字参数
  validateNumeric: (value: any, fieldName: string, min?: number, max?: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw ErrorFactory.invalidInput(`${fieldName} 必须是有效数字`);
    }
    if (min !== undefined && value < min) {
      throw ErrorFactory.invalidInput(`${fieldName} 不能小于 ${min}`);
    }
    if (max !== undefined && value > max) {
      throw ErrorFactory.invalidInput(`${fieldName} 不能大于 ${max}`);
    }
  }
};

// 导出默认错误处理函数
export default withErrorHandler;