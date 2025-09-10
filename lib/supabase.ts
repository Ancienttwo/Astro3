/**
 * 安全的 Supabase 配置
 * 匹配新的标准化数据库架构
 */

import { createClient } from '@supabase/supabase-js'

// 环境变量检查 - 必须从环境变量获取
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// 开发环境提示
if (process.env.NODE_ENV === 'development') {
  console.log('🔗 Supabase配置:', {
    url: supabaseUrl,
    hasAnonKey: !!supabaseAnonKey
  })
}

// 标准客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// 管理员客户端（仅服务端使用）
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// 服务端专用管理员客户端（带错误检查）
export function getSupabaseAdmin() {
  if (!supabaseServiceKey) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY not found. Admin functions will not work.')
      return null
    }
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }
  return supabaseAdmin!
}

// 标准化数据库类型定义
export interface UserChart {
  id: string
  user_id: string
  name: string
  birth_year: number
  birth_month: number
  birth_day: number
  birth_hour: number
  gender: 'male' | 'female'
  chart_type: 'bazi' | 'ziwei'
  yongshen_info?: {
    primaryYongShen: string
    secondaryYongShen?: string
    jiShen: string[]
    geLu: string
    analysisDate: string
    confidence: number
    summary: string
  }
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  id: string
  user_id: string
  chart_id: string
  analysis_type: 'bazi' | 'ziwei' | 'tiekou' | 'yongshen'
  content: string
  created_at: string
} 