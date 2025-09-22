import { getSupabaseAdminClient } from '@/lib/server/db'
// 轻量类型定义（避免跨模块导出依赖）
export interface ZiweiChart {
  id: string
  user_id: string
  username?: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  gender: 'male' | 'female'
  chart_data: unknown
  lunar_date?: string
  created_at?: string
  updated_at?: string
}

export interface BaziChart {
  id: string
  user_id: string
  username?: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  gender: 'male' | 'female'
  chart_data: unknown
  lunar_date?: string
  created_at?: string
  updated_at?: string
}

export interface ChatConversation {
  id: string
  user_id: string
  title?: string
  created_at?: string
  updated_at?: string
}
import { randomUUID } from 'crypto'

const supabase = getSupabaseAdminClient()

// 用户服务
export class UserService {
  static async createUser(data: {
    id?: string
    email?: string
    walletAddress?: string
    username?: string
  }) {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: data.id || randomUUID(),
        email: data.email,
        wallet_address: data.walletAddress,
        username: data.username
      })
      .select()
      .single()

    if (error) throw error
    return user
  }

  static async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}

// 紫微斗数命盘服务
export class ZiweiService {
  static async saveChart(data: {
    userId: string
    username: string
    birthYear: number
    birthMonth: number
    birthDay: number
    birthHour: number
    gender: 'male' | 'female'
    chartData: any
    lunarDate: string
  }): Promise<ZiweiChart> {
    const { data: chart, error } = await supabase
      .from('ziwei_charts')
      .insert({
        id: randomUUID(),
        user_id: data.userId,
        username: data.username,
        birth_year: data.birthYear,
        birth_month: data.birthMonth,
        birth_day: data.birthDay,
        birth_hour: data.birthHour,
        gender: data.gender,
        chart_data: data.chartData,
        lunar_date: data.lunarDate
      })
      .select()
      .single()

    if (error) throw error
    return chart
  }

  static async getUserCharts(userId: string): Promise<ZiweiChart[]> {
    const { data, error } = await supabase
      .from('ziwei_charts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getChartById(id: string): Promise<ZiweiChart | null> {
    const { data, error } = await supabase
      .from('ziwei_charts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  static async updateChart(id: string, updates: Partial<ZiweiChart>): Promise<ZiweiChart> {
    const { data, error } = await supabase
      .from('ziwei_charts')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteChart(id: string): Promise<void> {
    const { error } = await supabase
      .from('ziwei_charts')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

// 八字命盘服务
export class BaziService {
  static async saveChart(data: {
    userId: string
    username: string
    birthYear: number
    birthMonth: number
    birthDay: number
    birthHour: number
    gender: 'male' | 'female'
    chartData: any
    lunarDate: string
  }): Promise<BaziChart> {
    const { data: chart, error } = await supabase
      .from('bazi_charts')
      .insert({
        id: randomUUID(),
        user_id: data.userId,
        username: data.username,
        birth_year: data.birthYear,
        birth_month: data.birthMonth,
        birth_day: data.birthDay,
        birth_hour: data.birthHour,
        gender: data.gender,
        chart_data: data.chartData,
        lunar_date: data.lunarDate
      })
      .select()
      .single()

    if (error) throw error
    return chart
  }

  static async getUserCharts(userId: string): Promise<BaziChart[]> {
    const { data, error } = await supabase
      .from('bazi_charts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getChartById(id: string): Promise<BaziChart | null> {
    const { data, error } = await supabase
      .from('bazi_charts')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }
}

// 聊天服务
export class ChatService {
  static async getUserConversations(userId: string): Promise<ChatConversation[]> {
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getConversationMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async deleteConversation(id: string): Promise<void> {
    // 先删除所有消息
    await supabase
      .from('chat_messages')
      .delete()
      .eq('conversation_id', id)

    // 再删除对话
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 
