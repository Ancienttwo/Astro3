// 统一的用户使用统计类型定义
// 解决字段命名不一致问题

export interface UserUsageBase {
  user_id: string;
  user_email: string;
  user_type: 'web2' | 'web3';
  wallet_address?: string; // Web3用户专用
  created_at: string;
  updated_at: string;
}

export interface UserUsageReports {
  // 免费报告相关
  free_reports_limit: number;    // 免费报告总额度
  free_reports_used: number;     // 已使用的免费报告次数
  
  // 付费报告相关
  paid_reports_purchased: number; // 购买的付费报告次数
  paid_reports_used: number;      // 已使用的付费报告次数
}

export interface UserUsageChatbot {
  // Chatbot相关
  chatbot_limit: number;         // Chatbot使用限制
  chatbot_used: number;          // 已使用的Chatbot次数
}

export interface UserUsageCheckin {
  // 签到相关
  consecutive_checkin_days?: number;  // 连续签到天数
  total_checkin_days?: number;        // 总签到天数
  last_checkin_date?: string;         // 最后签到日期
}

// 完整的用户使用统计接口
export interface UserUsage extends 
  UserUsageBase, 
  UserUsageReports, 
  UserUsageChatbot, 
  UserUsageCheckin {}

// 计算字段接口
export interface UserUsageCalculated {
  // 剩余次数（计算字段）
  free_reports_remaining: number;     // 剩余免费报告次数
  paid_reports_remaining: number;     // 剩余付费报告次数
  total_reports_remaining: number;    // 总剩余报告次数
  chatbot_remaining: number;          // 剩余Chatbot次数
}

// API响应格式
export interface UserUsageResponse extends UserUsage, UserUsageCalculated {
  exists: boolean;
}

// Web3用户专用接口
export interface Web3UserUsage extends UserUsage {
  user_type: 'web3';
  wallet_address: string;
}

// Web2用户专用接口
export interface Web2UserUsage extends UserUsage {
  user_type: 'web2';
  wallet_address?: never;
}

// 签到记录接口
export interface CheckinRecord {
  id: string;
  user_id: string;
  checkin_date: string;
  consecutive_days: number;
  points_earned: number;
  reports_earned: number;
  bonus_multiplier: number;
  created_at: string;
}

// Web2签到记录
export interface Web2CheckinRecord extends CheckinRecord {
  points_earned: 0; // Web2用户不获得积分
}

// Web3签到记录
export interface Web3CheckinRecord extends CheckinRecord {
  wallet_address: string;
  airdrop_weight_earned: number;
  bnb_paid: number;
  gas_used?: number;
  block_number?: number;
  tx_hash: string;
}

// 签到状态检查结果
export interface CheckinStatus {
  can_checkin: boolean;
  consecutive_days: number;
  expected_reports: number;
  bonus_multiplier: number;
  today_checkin?: {
    reports_earned: number;
    checkin_time: string;
  } | null;
}

// 数据库操作响应接口
export interface DatabaseResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API错误响应接口
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: {
    required?: number;
    available?: number;
    freeRemaining?: number;
    paidRemaining?: number;
  };
}

// API成功响应接口
export interface ApiSuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
}

// 统一的API响应类型
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// 消费报告请求接口
export interface ConsumeReportRequest {
  taskId: string;
  analysisType: string;
  amount?: number;
  userType: 'web2' | 'web3';
}

// 消费报告响应接口
export interface ConsumeReportResponse {
  success: boolean;
  message: string;
  charged?: {
    amount: number;
    taskId: string;
    analysisType: string;
    userType: 'web2' | 'web3';
    walletAddress?: string;
    chargedAt: string;
  };
  remaining?: {
    free: number;
    paid: number;
  };
  alreadyCharged?: boolean;
  error?: string;
  details?: {
    required: number;
    available: number;
    freeRemaining: number;
    paidRemaining: number;
  };
}

// 字段映射配置（兼容旧字段名）
export const FIELD_MAPPINGS = {
  // 免费报告字段映射
  free_reports: 'free_reports_limit',
  free_credits: 'free_reports_limit',
  free_credits_limit: 'free_reports_limit',
  
  // 免费报告使用字段映射
  free_credits_used: 'free_reports_used',
  
  // 付费报告字段映射
  paid_credits: 'paid_reports_purchased',
  remaining_paid_reports: 'paid_reports_purchased',
  
  // 付费报告使用字段映射
  paid_credits_used: 'paid_reports_used',
  
  // Chatbot字段映射
  chatbot_credits: 'chatbot_limit',
  chatbot_credits_used: 'chatbot_used'
} as const;

// 字段名标准化函数
export function normalizeFieldName(fieldName: string): string {
  return FIELD_MAPPINGS[fieldName as keyof typeof FIELD_MAPPINGS] || fieldName;
}

// 数据标准化函数
export function normalizeUserUsage(rawData: any): UserUsage {
  const normalized: any = {};
  
  for (const [key, value] of Object.entries(rawData)) {
    const normalizedKey = normalizeFieldName(key);
    normalized[normalizedKey] = value;
  }
  
  return normalized as UserUsage;
}

// 计算剩余次数的工具函数
export function calculateRemainingUsage(usage: UserUsageReports & UserUsageChatbot): UserUsageCalculated {
  const free_reports_remaining = Math.max(0, usage.free_reports_limit - usage.free_reports_used);
  const paid_reports_remaining = Math.max(0, usage.paid_reports_purchased - usage.paid_reports_used);
  const total_reports_remaining = free_reports_remaining + paid_reports_remaining;
  const chatbot_remaining = Math.max(0, usage.chatbot_limit - usage.chatbot_used);
  
  return {
    free_reports_remaining,
    paid_reports_remaining,
    total_reports_remaining,
    chatbot_remaining
  };
}

// 验证用户类型的工具函数
export function isWeb3User(usage: UserUsage): usage is Web3UserUsage {
  return usage.user_type === 'web3' && !!usage.wallet_address;
}

export function isWeb2User(usage: UserUsage): usage is Web2UserUsage {
  return usage.user_type === 'web2';
}

// 默认值常量
export const DEFAULT_USER_USAGE: Omit<UserUsage, 'user_id' | 'user_email' | 'created_at' | 'updated_at'> = {
  user_type: 'web2',
  free_reports_limit: 0,
  free_reports_used: 0,
  paid_reports_purchased: 0,
  paid_reports_used: 0,
  chatbot_limit: 0,
  chatbot_used: 0,
  consecutive_checkin_days: 0,
  total_checkin_days: 0
};