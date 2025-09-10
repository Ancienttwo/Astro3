/**
 * 统一积分管理服务
 * 解决当前系统中积分逻辑混乱的问题
 * 
 * 核心概念：
 * - FREE_REPORTS: 免费报告（签到获得，累积上限10）
 * - PAID_REPORTS: 付费报告（购买/管理员发放，无上限）
 * - CHATBOT: ChatBot次数（签到/管理员发放，累积上限30）
 */

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export enum CreditType {
  FREE_REPORTS = 'free_reports',
  PAID_REPORTS = 'paid_reports', 
  CHATBOT = 'chatbot'
}

export enum GrantSource {
  DAILY_CHECKIN = 'daily_checkin',
  ADMIN_GRANT = 'admin_grant',
  REFERRAL_REWARD = 'referral_reward',
  PURCHASE = 'purchase'
}

export interface UserIdentifier {
  type: 'web2' | 'web3'
  id: string // user_id for web2, wallet_address for web3
  email?: string
}

export interface CreditBalance {
  freeReports: {
    earned: number
    consumed: number
    available: number
    limit: number
  }
  paidReports: {
    earned: number
    consumed: number
    available: number
  }
  chatbot: {
    earned: number
    consumed: number
    available: number
    limit: number
  }
}

export interface GrantResult {
  success: boolean
  granted: number
  reason?: string
  newBalance: CreditBalance
}

export interface ConsumeResult {
  success: boolean
  consumed: number
  fromFree: number
  fromPaid: number
  newBalance: CreditBalance
}

/**
 * 统一积分管理器
 */
export class CreditManager {
  
  /**
   * 获取用户积分余额
   */
  static async getBalance(user: UserIdentifier): Promise<CreditBalance> {
    const userUsage = await this.getUserUsage(user)
    
    const freeEarned = userUsage?.free_reports_limit || 0
    const freeConsumed = userUsage?.free_reports_used || 0
    const paidEarned = userUsage?.paid_reports_purchased || 0
    const paidConsumed = userUsage?.paid_reports_used || 0
    const chatbotEarned = userUsage?.chatbot_limit || 0
    const chatbotConsumed = userUsage?.chatbot_used || 0

    return {
      freeReports: {
        earned: freeEarned,
        consumed: freeConsumed,
        available: Math.max(0, freeEarned - freeConsumed),
        limit: 10
      },
      paidReports: {
        earned: paidEarned,
        consumed: paidConsumed,
        available: Math.max(0, paidEarned - paidConsumed)
      },
      chatbot: {
        earned: chatbotEarned,
        consumed: chatbotConsumed,
        available: Math.max(0, chatbotEarned - chatbotConsumed),
        limit: 30
      }
    }
  }

  /**
   * 发放积分（统一入口）
   */
  static async grantCredits(
    user: UserIdentifier,
    type: CreditType,
    amount: number,
    source: GrantSource,
    reason?: string
  ): Promise<GrantResult> {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const currentBalance = await this.getBalance(user)
    let actualGranted = amount

    // 检查累积上限
    if (type === CreditType.FREE_REPORTS) {
      const maxCanGrant = Math.max(0, currentBalance.freeReports.limit - currentBalance.freeReports.available)
      actualGranted = Math.min(amount, maxCanGrant)
    } else if (type === CreditType.CHATBOT) {
      const maxCanGrant = Math.max(0, currentBalance.chatbot.limit - currentBalance.chatbot.available)
      actualGranted = Math.min(amount, maxCanGrant)
    }

    if (actualGranted === 0) {
      return {
        success: false,
        granted: 0,
        reason: `${type} already at limit`,
        newBalance: currentBalance
      }
    }

    // 更新数据库
    const updateData = this.buildUpdateData(type, actualGranted, 'grant')
    await this.updateUserUsage(user, updateData)

    // 记录发放历史
    await this.logCreditOperation(user, type, actualGranted, source, 'grant', reason)

    const newBalance = await this.getBalance(user)

    return {
      success: true,
      granted: actualGranted,
      reason: actualGranted < amount ? 'Limited by accumulation cap' : undefined,
      newBalance
    }
  }

  /**
   * 消费积分（统一入口）
   */
  static async consumeCredits(
    user: UserIdentifier,
    type: CreditType,
    amount: number
  ): Promise<ConsumeResult> {
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const currentBalance = await this.getBalance(user)
    let fromFree = 0
    let fromPaid = 0

    if (type === CreditType.FREE_REPORTS || type === CreditType.PAID_REPORTS) {
      const totalAvailable = currentBalance.freeReports.available + currentBalance.paidReports.available
      
      if (totalAvailable < amount) {
        throw new Error('Insufficient credits')
      }

      // 优先使用免费次数
      fromFree = Math.min(amount, currentBalance.freeReports.available)
      fromPaid = amount - fromFree

    } else if (type === CreditType.CHATBOT) {
      if (currentBalance.chatbot.available < amount) {
        throw new Error('Insufficient chatbot credits')
      }
      fromFree = amount // ChatBot只有一种类型
    }

    // 更新数据库
    const updateData: Record<string, number> = {}
    if (fromFree > 0) {
      if (type === CreditType.CHATBOT) {
        updateData.chatbot_used = currentBalance.chatbot.consumed + fromFree
      } else {
        updateData.free_reports_used = currentBalance.freeReports.consumed + fromFree
      }
    }
    if (fromPaid > 0) {
      updateData.paid_reports_used = currentBalance.paidReports.consumed + fromPaid
    }

    await this.updateUserUsage(user, updateData)

    // 记录消费历史
    await this.logCreditOperation(user, type, amount, GrantSource.DAILY_CHECKIN, 'consume')

    const newBalance = await this.getBalance(user)

    return {
      success: true,
      consumed: amount,
      fromFree,
      fromPaid,
      newBalance
    }
  }

  /**
   * 获取用户使用记录
   */
  static async getUserUsage(user: UserIdentifier) {
    let query = supabaseAdmin.from('user_usage').select('*')
    
    if (user.type === 'web2') {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('wallet_address', user.id.toLowerCase()).eq('user_type', 'web3')
    }

    const { data, error } = await query.single()
    
    if (error && error.code === 'PGRST116') {
      // 用户不存在，创建新记录
      return await this.createUserUsage(user)
    }
    
    if (error) {
      throw error
    }
    
    return data
  }

  /**
   * 创建新用户记录
   */
  private static async createUserUsage(user: UserIdentifier) {
    const insertData: Record<string, any> = {
      user_email: user.email || `${user.id}@temp.local`,
      free_reports_limit: 0,
      free_reports_used: 0,
      paid_reports_purchased: 0,
      paid_reports_used: 0,
      chatbot_limit: 0,
      chatbot_used: 0,
      consecutive_checkin_days: 0,
      total_checkin_days: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (user.type === 'web2') {
      insertData.user_id = user.id
      insertData.user_type = 'web2'
    } else {
      insertData.wallet_address = user.id.toLowerCase()
      insertData.user_type = 'web3'
      insertData.user_id = null
    }

    const { data, error } = await supabaseAdmin
      .from('user_usage')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  /**
   * 更新用户使用记录
   */
  static async updateUserUsage(user: UserIdentifier, updateData: Record<string, any>) {
    updateData.updated_at = new Date().toISOString()

    // 对于需要累加的字段，先获取当前值
    const currentUsage = await this.getUserUsage(user)
    
    if (updateData.free_reports_limit !== undefined) {
      updateData.free_reports_limit = (currentUsage?.free_reports_limit || 0) + updateData.free_reports_limit
    }
    if (updateData.paid_reports_purchased !== undefined) {
      updateData.paid_reports_purchased = (currentUsage?.paid_reports_purchased || 0) + updateData.paid_reports_purchased
    }
    if (updateData.chatbot_limit !== undefined) {
      updateData.chatbot_limit = (currentUsage?.chatbot_limit || 0) + updateData.chatbot_limit
    }

    let query = supabaseAdmin.from('user_usage').update(updateData)
    
    if (user.type === 'web2') {
      query = query.eq('user_id', user.id)
    } else {
      query = query.eq('wallet_address', user.id.toLowerCase()).eq('user_type', 'web3')
    }

    const { error } = await query

    if (error) {
      throw error
    }
  }

  /**
   * 构建更新数据（增量值）
   */
  private static buildUpdateData(type: CreditType, amount: number, operation: 'grant' | 'consume'): Record<string, number> {
    const data: Record<string, number> = {}

    if (operation === 'grant') {
      switch (type) {
        case CreditType.FREE_REPORTS:
          data.free_reports_limit = amount // 增量值，在updateUserUsage中累加
          break
        case CreditType.PAID_REPORTS:
          data.paid_reports_purchased = amount
          break
        case CreditType.CHATBOT:
          data.chatbot_limit = amount
          break
      }
    }

    return data
  }

  /**
   * 记录积分操作历史
   */
  private static async logCreditOperation(
    user: UserIdentifier,
    type: CreditType,
    amount: number,
    source: GrantSource,
    operation: 'grant' | 'consume',
    reason?: string
  ) {
    try {
      await supabaseAdmin
        .from('credit_history')
        .insert({
          user_identifier: user.id,
          user_type: user.type,
          credit_type: type,
          amount,
          operation,
          source,
          reason: reason || `${operation} ${type}`,
          created_at: new Date().toISOString()
        })
    } catch (error) {
      // 记录历史失败不影响主要功能
      console.warn('Failed to log credit operation:', error)
    }
  }
}