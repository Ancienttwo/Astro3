/**
 * 签到服务
 * 使用统一的CreditManager处理积分发放
 */

import { CreditManager, CreditType, GrantSource, UserIdentifier } from './credit-manager'

export interface CheckinReward {
  baseReportReward: number
  baseChatbotReward: number
  consecutiveReportBonus: number
  consecutiveChatbotBonus: number
  totalReportReward: number
  totalChatbotReward: number
  actualReportReward: number
  actualChatbotReward: number
  bonusReason?: string
}

export interface CheckinResult {
  success: boolean
  message: string
  reward: CheckinReward
  newStatus: {
    consecutiveDays: number
    totalDays: number
    newBalance: any
  }
}

export class DailyCheckinService {
  
  /**
   * 执行签到
   */
  static async performCheckin(user: UserIdentifier): Promise<CheckinResult> {
    // 1. 检查今天是否已经签到
    const userUsage = await CreditManager.getUserUsage(user)
    const today = new Date().toISOString().split('T')[0]
    
    if (userUsage?.last_checkin_date === today) {
      throw new Error('今天已经签到过了')
    }

    // 2. 计算连续签到天数
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    
    let newConsecutiveDays = 1
    if (userUsage?.last_checkin_date === yesterdayStr) {
      newConsecutiveDays = (userUsage.consecutive_checkin_days || 0) + 1
    }

    // 3. 计算奖励
    const reward = this.calculateReward(newConsecutiveDays)

    // 4. 发放免费报告奖励
    const reportGrantResult = await CreditManager.grantCredits(
      user,
      CreditType.FREE_REPORTS,
      reward.totalReportReward,
      GrantSource.DAILY_CHECKIN,
      `签到第${newConsecutiveDays}天`
    )

    // 5. 发放ChatBot奖励
    const chatbotGrantResult = await CreditManager.grantCredits(
      user,
      CreditType.CHATBOT,
      reward.totalChatbotReward,
      GrantSource.DAILY_CHECKIN,
      `签到第${newConsecutiveDays}天`
    )

    // 6. 更新签到状态
    await this.updateCheckinStatus(user, newConsecutiveDays, userUsage)

    // 7. 生成返回消息
    let message = '签到成功！'
    if (reportGrantResult.granted < reward.totalReportReward) {
      message += ` 免费报告已达当前上限`
    }
    if (chatbotGrantResult.granted < reward.totalChatbotReward) {
      message += ` ChatBot已达当前上限`
    }

    return {
      success: true,
      message,
      reward: {
        ...reward,
        actualReportReward: reportGrantResult.granted,
        actualChatbotReward: chatbotGrantResult.granted
      },
      newStatus: {
        consecutiveDays: newConsecutiveDays,
        totalDays: (userUsage?.total_checkin_days || 0) + 1,
        newBalance: reportGrantResult.newBalance
      }
    }
  }

  /**
   * 计算签到奖励
   */
  private static calculateReward(consecutiveDays: number): Omit<CheckinReward, 'actualReportReward' | 'actualChatbotReward'> {
    const baseReportReward = 1
    const baseChatbotReward = 10
    let consecutiveReportBonus = 0
    let consecutiveChatbotBonus = 0
    let bonusReason = ''

    if (consecutiveDays >= 7 && consecutiveDays % 7 === 0) {
      consecutiveReportBonus = 2
      consecutiveChatbotBonus = 20
      bonusReason = `连续签到${consecutiveDays}天奖励`
    } else if (consecutiveDays >= 15 && consecutiveDays % 15 === 0) {
      consecutiveReportBonus = 3
      consecutiveChatbotBonus = 30
      bonusReason = `连续签到${consecutiveDays}天奖励`
    } else if (consecutiveDays >= 30 && consecutiveDays % 30 === 0) {
      consecutiveReportBonus = 5
      consecutiveChatbotBonus = 50
      bonusReason = `连续签到${consecutiveDays}天大奖励`
    }

    return {
      baseReportReward,
      baseChatbotReward,
      consecutiveReportBonus,
      consecutiveChatbotBonus,
      totalReportReward: baseReportReward + consecutiveReportBonus,
      totalChatbotReward: baseChatbotReward + consecutiveChatbotBonus,
      bonusReason: bonusReason || undefined
    }
  }

  /**
   * 更新签到状态
   */
  private static async updateCheckinStatus(
    user: UserIdentifier, 
    consecutiveDays: number, 
    currentUsage: any
  ) {
    const today = new Date().toISOString().split('T')[0]
    
    const updateData = {
      last_checkin_date: today,
      consecutive_checkin_days: consecutiveDays,
      total_checkin_days: (currentUsage?.total_checkin_days || 0) + 1,
      updated_at: new Date().toISOString()
    }

    await CreditManager.updateUserUsage(user, updateData)
  }

  /**
   * 获取签到状态
   */
  static async getCheckinStatus(user: UserIdentifier) {
    const userUsage = await CreditManager.getUserUsage(user)
    const balance = await CreditManager.getBalance(user)

    return {
      success: true,
      status: {
        last_checkin_date: userUsage?.last_checkin_date,
        consecutive_checkin_days: userUsage?.consecutive_checkin_days || 0,
        total_checkin_days: userUsage?.total_checkin_days || 0,
        balance
      }
    }
  }
}