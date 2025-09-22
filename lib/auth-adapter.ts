import { NextRequest } from 'next/server'
import { getCurrentUnifiedUser } from '@/lib/auth'

export type AuthProvider = 'supabase' | 'walletconnect' | 'web3' | 'privy' | 'unknown'
export type TokenType = 'supabase' | 'web3_wallet' | 'none'

export interface ResolvedAuth {
  ok: boolean
  id: string | null
  email?: string | null
  walletAddress?: string | null
  authProvider: AuthProvider
  tokenType: TokenType
}

/**
 * 统一解析认证：支持 Supabase JWT、Wallet 地址 Bearer、X-Wallet-Address、X-Web3-Auth
 * 依赖 lib/auth.ts 的 getCurrentUnifiedUser（已增强各类头兼容）
 */
export async function resolveAuth(request: NextRequest): Promise<ResolvedAuth> {
  const user = await getCurrentUnifiedUser(request as unknown as Request)
  if (!user) {
    return { ok: false, id: null, authProvider: 'unknown', tokenType: 'none' }
  }
  const authProvider: AuthProvider = (user as any).auth_type || 'unknown'
  return {
    ok: true,
    id: user.id || null,
    email: (user as any).email || null,
    walletAddress: (user as any).wallet_address || null,
    authProvider,
    tokenType: authProvider === 'web3' || authProvider === 'walletconnect' ? 'web3_wallet' : 'supabase'
  }
}

export async function requireAuth(request: NextRequest): Promise<ResolvedAuth> {
  const auth = await resolveAuth(request)
  if (!auth.ok || !auth.id) {
    const e: any = new Error('UNAUTHORIZED')
    e.status = 401
    throw e
  }
  return auth
}

