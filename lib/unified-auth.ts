/**
 * 统一认证上下文 - 解决Web2/Web3用户数据交叉访问问题
 * 
 * 核心原则：
 * 1. 严格的用户类型隔离
 * 2. 单一认证验证路径
 * 3. 明确的数据访问边界
 * 4. 无跨类型认证回退
 */

import { supabase } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

/**
 * 统一认证上下文接口
 */
export interface UnifiedAuthContext {
  user_id: string;
  auth_method: 'web2_email' | 'web2_oauth' | 'web3_wallet' | 'web3_walletconnect';
  user_type: 'web2' | 'web3';
  data_scope: 'web2' | 'web3';
  token: string;
  expires_at: number;
  permissions: string[];
  wallet_address?: string;
  email: string;
  username?: string;
}

/**
 * 认证错误类
 */
export class UnifiedAuthError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_TOKEN' | 'EXPIRED_SESSION' | 'CROSS_TYPE_ACCESS' | 'UNAUTHORIZED'
  ) {
    super(message);
    this.name = 'UnifiedAuthError';
  }
}

/**
 * 获取统一认证上下文 - 核心函数
 */
export async function getUnifiedAuthContext(request?: Request): Promise<UnifiedAuthContext | null> {
  console.log('🔍 开始获取统一认证上下文...');

  try {
    // 服务器端认证
    if (typeof window === 'undefined' && request) {
      return await getServerAuthContext(request);
    }
    
    // 客户端认证
    return await getClientAuthContext();
  } catch (error) {
    console.error('❌ 获取认证上下文失败:', error);
    if (error instanceof UnifiedAuthError) {
      throw error;
    }
    return null;
  }
}

/**
 * 服务器端认证上下文获取
 */
async function getServerAuthContext(request: Request): Promise<UnifiedAuthContext | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ 缺少Authorization Bearer token');
    return null;
  }

  const token = authHeader.substring(7);
  
  // 直接尝试Supabase认证
  try {
    const web2Context = await validateSupabaseToken(token);
    if (web2Context) {
      console.log('✅ 服务器端Web2认证成功:', web2Context.user_id);
      return web2Context;
    }
  } catch (error) {
    console.log('❌ Web2认证也失败');
  }

  return null;
}

/**
 * 客户端认证上下文获取
 */
async function getClientAuthContext(): Promise<UnifiedAuthContext | null> {
  // 首先检查Web3认证
  const web3Context = await getWeb3ClientContext();
  if (web3Context) {
    console.log('✅ 客户端Web3认证成功:', web3Context.wallet_address);
    return web3Context;
  }

  // 然后检查Web2认证
  const web2Context = await getWeb2ClientContext();
  if (web2Context) {
    console.log('✅ 客户端Web2认证成功:', web2Context.email);
    return web2Context;
  }

  return null;
}

/**
 * 验证Supabase令牌
 */
async function validateSupabaseToken(token: string): Promise<UnifiedAuthContext | null> {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      throw new UnifiedAuthError('Invalid Supabase token', 'INVALID_TOKEN');
    }

    const user = data.user;

    // 从数据库获取完整用户信息
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('data_scope', 'web2') // 关键：只查询Web2用户
      .single();

    if (dbError || !dbUser) {
      // 如果用户不存在，创建Web2用户记录
      const newUser = {
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.full_name || user.user_metadata?.name || `用户${Date.now().toString().slice(-6)}`,
        auth_type: user.app_metadata?.provider || 'web2_email',
        data_scope: 'web2',
        user_type: 'web2'
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        throw new UnifiedAuthError('Failed to create Web2 user', 'UNAUTHORIZED');
      }

      return {
        user_id: createdUser.id,
        auth_method: 'web2_email',
        user_type: 'web2',
        data_scope: 'web2',
        token: token,
        expires_at: Date.now() + (24 * 60 * 60 * 1000), // 24小时
        permissions: ['web2_user'],
        email: createdUser.email,
        username: createdUser.username
      };
    }

    return {
      user_id: dbUser.id,
      auth_method: dbUser.auth_type?.includes('oauth') ? 'web2_oauth' : 'web2_email',
      user_type: 'web2',
      data_scope: 'web2',
      token: token,
      expires_at: Date.now() + (24 * 60 * 60 * 1000),
      permissions: ['web2_user'],
      email: dbUser.email,
      username: dbUser.username
    };
  } catch (error) {
    throw new UnifiedAuthError('Supabase token validation failed', 'INVALID_TOKEN');
  }
}

/**
 * 获取Web3客户端认证上下文
 */
async function getWeb3ClientContext(): Promise<UnifiedAuthContext | null> {
  const currentUser = localStorage.getItem('current_user');
  const walletconnectAuth = localStorage.getItem('walletconnect_auth');

  if (!currentUser || !walletconnectAuth) {
    return null;
  }

  try {
    const userData = JSON.parse(currentUser);
    const authData = JSON.parse(walletconnectAuth);

    // 验证是否为Web3用户
    if (!userData.wallet_address || userData.auth_method !== 'walletconnect') {
      return null;
    }

    // 检查令牌是否过期
    const currentTime = Math.floor(Date.now() / 1000);
    if (authData.expires_at && currentTime > authData.expires_at) {
      // 清理过期数据
      localStorage.removeItem('current_user');
      localStorage.removeItem('walletconnect_auth');
      throw new UnifiedAuthError('Web3 session expired', 'EXPIRED_SESSION');
    }

    return {
      user_id: userData.id,
      auth_method: 'web3_walletconnect',
      user_type: 'web3',
      data_scope: 'web3',
      token: authData.auth_token,
      expires_at: authData.expires_at * 1000,
      permissions: ['web3_user'],
      wallet_address: userData.wallet_address,
      email: userData.email,
      username: userData.username
    };
  } catch (error) {
    if (error instanceof UnifiedAuthError) {
      throw error;
    }
    return null;
  }
}

/**
 * 获取Web2客户端认证上下文
 */
async function getWeb2ClientContext(): Promise<UnifiedAuthContext | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session || !session.user) {
      return null;
    }

    const user = session.user;

    // 确保不是Web3虚拟邮箱
    if (user.email?.includes('@web3.') || user.email?.includes('@astrozi.ai')) {
      console.log('🔍 检测到Web3虚拟邮箱，跳过Web2处理');
      return null;
    }

    // 查询数据库中的用户信息
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .eq('data_scope', 'web2') // 只查询Web2用户
      .single();

    if (dbError || !dbUser) {
      // 创建Web2用户记录
      const newUser = {
        id: user.id,
        email: user.email!,
        username: user.user_metadata?.full_name || `用户${Date.now().toString().slice(-6)}`,
        auth_type: 'web2_email',
        data_scope: 'web2',
        user_type: 'web2'
      };

      const { data: createdUser, error: createError } = await supabase
        .from('users')
        .insert(newUser)
        .select()
        .single();

      if (createError) {
        console.error('❌ 创建Web2用户失败:', createError);
        return null;
      }

      return {
        user_id: createdUser.id,
        auth_method: 'web2_email',
        user_type: 'web2',
        data_scope: 'web2',
        token: session.access_token,
        expires_at: new Date(session.expires_at!).getTime(),
        permissions: ['web2_user'],
        email: createdUser.email,
        username: createdUser.username
      };
    }

    return {
      user_id: dbUser.id,
      auth_method: dbUser.auth_type?.includes('oauth') ? 'web2_oauth' : 'web2_email',
      user_type: 'web2',
      data_scope: 'web2',
      token: session.access_token,
      expires_at: new Date(session.expires_at!).getTime(),
      permissions: ['web2_user'],
      email: dbUser.email,
      username: dbUser.username
    };
  } catch (error) {
    console.error('❌ Web2客户端认证失败:', error);
    return null;
  }
}

/**
 * 验证用户是否有权限访问特定数据范围
 */
export function validateDataScopeAccess(
  authContext: UnifiedAuthContext,
  requiredScope: 'web2' | 'web3'
): boolean {
  if (authContext.data_scope !== requiredScope) {
    throw new UnifiedAuthError(
      `Access denied: ${authContext.user_type} user cannot access ${requiredScope} data`,
      'CROSS_TYPE_ACCESS'
    );
  }
  return true;
}

/**
 * 创建带有认证上下文的JWT（用于服务器端验证）
 */
export function createAuthContextJWT(authContext: UnifiedAuthContext): string {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      sub: authContext.user_id,
      user_id: authContext.user_id,
      auth_type: authContext.auth_method,
      data_scope: authContext.data_scope,
      user_type: authContext.user_type,
      wallet_address: authContext.wallet_address,
      email: authContext.email,
      permissions: authContext.permissions,
      iss: 'astrozi',
      aud: 'astrozi-users'
    },
    jwtSecret,
    {
      algorithm: 'HS256',
      expiresIn: '24h'
    }
  );
}
