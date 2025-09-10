import { createClient } from '@supabase/supabase-js'
import Redis from 'ioredis'

interface Web3Session {
  walletAddress: string
  message: string
  nonce: string
  expiresAt: Date
  createdAt: Date
}

class Web3SessionManager {
  private redis: Redis | null = null
  private fallbackSessions: Map<string, Web3Session> = new Map()
  private supabase: any = null

  constructor() {
    this.initializeRedis()
    this.initializeSupabase()
  }

  private initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL)
        console.log('✅ Redis连接已初始化')
      } else {
        console.log('⚠️ 未配置Redis，使用内存回退模式')
      }
    } catch (error) {
      console.error('❌ Redis连接失败:', error)
    }
  }

  private initializeSupabase() {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (supabaseUrl && supabaseServiceKey) {
        this.supabase = createClient(supabaseUrl, supabaseServiceKey)
        console.log('✅ Supabase客户端已初始化')
      }
    } catch (error) {
      console.error('❌ Supabase初始化失败:', error)
    }
  }

  async saveSession(nonce: string, session: Web3Session): Promise<void> {
    const sessionData = JSON.stringify({
      ...session,
      expiresAt: session.expiresAt.toISOString(),
      createdAt: session.createdAt.toISOString()
    })

    try {
      // 优先使用Redis
      if (this.redis) {
        const ttl = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000)
        await this.redis.setex(`web3:session:${nonce}`, Math.max(ttl, 60), sessionData)
        console.log(`💾 会话已保存到Redis: ${nonce}`)
        return
      }

      // 回退到Supabase
      if (this.supabase) {
        await this.supabase
          .from('web3_sessions')
          .upsert({
            nonce,
            wallet_address: session.walletAddress,
            message: session.message,
            expires_at: session.expiresAt.toISOString(),
            created_at: session.createdAt.toISOString()
          })
        console.log(`💾 会话已保存到Supabase: ${nonce}`)
        return
      }

      // 最后回退到内存
      this.fallbackSessions.set(nonce, session)
      console.log(`💾 会话已保存到内存: ${nonce}`)
      
    } catch (error) {
      console.error('❌ 会话保存失败:', error)
      // 失败时回退到内存存储
      this.fallbackSessions.set(nonce, session)
    }
  }

  async getSession(nonce: string): Promise<Web3Session | null> {
    try {
      // 优先从Redis读取
      if (this.redis) {
        const sessionData = await this.redis.get(`web3:session:${nonce}`)
        if (sessionData) {
          const parsed = JSON.parse(sessionData)
          return {
            ...parsed,
            expiresAt: new Date(parsed.expiresAt),
            createdAt: new Date(parsed.createdAt)
          }
        }
      }

      // 从Supabase读取
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('web3_sessions')
          .select('*')
          .eq('nonce', nonce)
          .single()
        
        if (data && !error) {
          return {
            walletAddress: data.wallet_address,
            message: data.message,
            nonce: data.nonce,
            expiresAt: new Date(data.expires_at),
            createdAt: new Date(data.created_at)
          }
        }
      }

      // 从内存读取
      return this.fallbackSessions.get(nonce) || null
      
    } catch (error) {
      console.error('❌ 会话读取失败:', error)
      return this.fallbackSessions.get(nonce) || null
    }
  }

  async deleteSession(nonce: string): Promise<void> {
    try {
      // 从所有存储中删除
      if (this.redis) {
        await this.redis.del(`web3:session:${nonce}`)
      }
      
      if (this.supabase) {
        await this.supabase
          .from('web3_sessions')
          .delete()
          .eq('nonce', nonce)
      }
      
      this.fallbackSessions.delete(nonce)
      
    } catch (error) {
      console.error('❌ 会话删除失败:', error)
    }
  }

  async cleanExpiredSessions(): Promise<void> {
    try {
      const now = new Date()
      
      // 清理内存中的过期会话
      for (const [nonce, session] of this.fallbackSessions.entries()) {
        if (now > session.expiresAt) {
          this.fallbackSessions.delete(nonce)
        }
      }
      
      // 清理Supabase中的过期会话
      if (this.supabase) {
        await this.supabase
          .from('web3_sessions')
          .delete()
          .lt('expires_at', now.toISOString())
      }
      
    } catch (error) {
      console.error('❌ 清理过期会话失败:', error)
    }
  }
}

// 创建单例实例
export const web3SessionManager = new Web3SessionManager()

// 定期清理过期会话
if (typeof global !== 'undefined') {
  if (!global.web3CleanupInterval) {
    global.web3CleanupInterval = setInterval(() => {
      web3SessionManager.cleanExpiredSessions()
    }, 5 * 60 * 1000) // 每5分钟清理一次
  }
}