/**
 * 统一API客户端
 * 
 * 提供标准化的API调用接口，包含：
 * - Bearer token认证
 * - 统一错误处理
 * - 请求/响应拦截
 * - 缓存支持
 * - 重试机制
 */

import { supabase } from '@/lib/supabase';
import type { APIResponse, PaginatedResponse } from '@/types/fatebook';

/**
 * API客户端配置
 */
interface APIClientConfig {
  baseURL?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableCache?: boolean;
}

/**
 * 请求配置
 */
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: boolean;
  timeout?: number;
}

/**
 * 缓存条目
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

/**
 * API错误类
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 认证错误类
 */
export class AuthError extends APIError {
  constructor(message: string = '用户未登录或认证已过期') {
    super(message, 401);
    this.name = 'AuthError';
  }
}

/**
 * 统一API客户端类
 */
export class APIClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;
  private enableCache: boolean;
  private cache: Map<string, CacheEntry> = new Map();

  constructor(config: APIClientConfig = {}) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 30000;
    this.retryAttempts = config.retryAttempts || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.enableCache = config.enableCache || false;
  }

  /**
   * 获取认证头部 - 支持Web3和Web2认证
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    console.log('🔍 开始获取认证头部...');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    let hasValidWeb3Auth = false;

    // 首先尝试Web3认证 (客户端环境)
    if (typeof window !== 'undefined') {
      try {
        // 检查WalletConnect认证
        const walletConnectAuth = localStorage.getItem('walletconnect_auth');
        const currentUser = localStorage.getItem('current_user');
        
        if (walletConnectAuth && currentUser) {
          const authData = JSON.parse(walletConnectAuth);
          const userData = JSON.parse(currentUser);
          
          console.log('🔍 检查WalletConnect认证数据:', {
            hasAuthToken: !!authData.auth_token,
            hasWalletAddress: !!userData.wallet_address,
            authMethod: userData.auth_method,
            expiresAt: authData.expires_at,
            currentTime: Math.floor(Date.now() / 1000)
          });
          
          // 检查token是否过期
          const currentTime = Math.floor(Date.now() / 1000);
          if (authData.expires_at && currentTime > authData.expires_at) {
            console.log('⚠️ WalletConnect token已过期，需要重新连接钱包');
            localStorage.removeItem('walletconnect_auth');
            localStorage.removeItem('current_user');
            localStorage.removeItem('wallet_session');
            // 标记为Web3用户但token过期
            hasValidWeb3Auth = false;
            throw new AuthError('Web3认证已过期，请重新连接钱包');
          } else if (authData.auth_token && userData.wallet_address && userData.auth_method === 'walletconnect') {
            // 只使用标准的Authorization Bearer header
            headers['Authorization'] = `Bearer ${authData.auth_token}`;
            console.log('🔑 设置WalletConnect Bearer token认证:', {
              walletAddress: userData.wallet_address,
              hasAuthToken: !!authData.auth_token
            });
            hasValidWeb3Auth = true;
            return headers;
          } else {
            console.log('⚠️ WalletConnect认证数据不完整:', {
              hasAuthToken: !!authData.auth_token,
              hasWalletAddress: !!userData.wallet_address,
              authMethod: userData.auth_method
            });
          }
        }
        
        // 检查传统Web3认证（向后兼容）
        const web3Auth = localStorage.getItem('web3_auth');
        if (web3Auth && currentUser) {
          const authData = JSON.parse(web3Auth);
          const userData = JSON.parse(currentUser);
          
          // 检查传统Web3认证是否有过期时间
          const currentTime = Math.floor(Date.now() / 1000);
          if (authData.expires_at && currentTime > authData.expires_at) {
            console.log('⚠️ 传统Web3 token已过期');
            localStorage.removeItem('web3_auth');
            localStorage.removeItem('current_user');
            throw new AuthError('Web3认证已过期，请重新连接钱包');
          } else if (authData.auth_token && userData.wallet_address) {
            // 只使用标准的Authorization Bearer header
            headers['Authorization'] = `Bearer ${authData.auth_token}`;
            console.log('🔑 使用传统Web3 Bearer token认证:', userData.wallet_address);
            hasValidWeb3Auth = true;
            return headers;
          }
        }
        
        // 检查是否有Web3用户标识但没有有效token - 尝试恢复session
        if (currentUser) {
          const userData = JSON.parse(currentUser);
          if (userData.auth_method === 'walletconnect' || userData.wallet_address) {
            console.log('⚠️ 检测到Web3用户但认证token无效或缺失，尝试恢复session');
            console.log('🔍 Web3用户数据详情:', {
              authMethod: userData.auth_method,
              walletAddress: userData.wallet_address,
              hasUserId: !!userData.id,
              email: userData.email
            });
            
            // 尝试恢复Web3 session，而不是立即抛出错误
            try {
              console.log('🔄 尝试自动恢复Web3用户session...');
              const { supabaseSessionManager } = await import('@/lib/services/supabase-session-manager');
              const restoredUser = await supabaseSessionManager.restoreWeb3Session();
              
              if (restoredUser) {
                console.log('✅ Web3用户session自动恢复成功');
                // 重新获取认证头部
                const walletConnectAuth = localStorage.getItem('walletconnect_auth');
                if (walletConnectAuth) {
                  const authData = JSON.parse(walletConnectAuth);
                  if (authData.auth_token) {
                    headers['Authorization'] = `Bearer ${authData.auth_token}`;
                    console.log('🔑 使用恢复的Web3认证token');
                    hasValidWeb3Auth = true;
                    return headers;
                  }
                }
              }
            } catch (restoreError) {
              console.log('❌ 自动恢复Web3 session失败:', restoreError);
            }
            
            // 检查是否缺少用户ID
            if (!userData.id) {
              console.log('❌ Web3用户缺少userId，这可能是WalletConnect认证过程中的问题');
              console.log('🔧 建议清理认证数据并重新连接钱包');
            }
            
            // 只有在恢复失败后才清理数据并抛出错误
            localStorage.removeItem('current_user');
            localStorage.removeItem('walletconnect_auth');
            localStorage.removeItem('web3_auth');
            localStorage.removeItem('wallet_session');
            throw new AuthError('Web3认证会话已失效，请重新连接钱包');
          }
        }
      } catch (e) {
        console.log('⚠️ 解析Web3认证失败:', e);
        // 如果已经抛出了AuthError，直接重新抛出
        if (e instanceof AuthError) {
          throw e;
        }
      }
    }

    // 只有在确认不是Web3用户的情况下才尝试Supabase认证
    if (!hasValidWeb3Auth) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          throw new AuthError('用户未登录，请先登录');
        }

        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('🔑 使用Supabase Bearer token认证');
        return headers;
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }
        throw new AuthError('获取认证信息失败');
      }
    }

    // 如果到这里说明既没有Web3认证也没有Web2认证
    console.log('❌ 认证失败：既没有Web3认证也没有Web2认证');
    console.log('🔍 最终认证状态检查:', {
      hasValidWeb3Auth,
      clientSide: typeof window !== 'undefined',
      localStorage: typeof window !== 'undefined' ? {
        currentUser: localStorage.getItem('current_user'),
        walletconnectAuth: localStorage.getItem('walletconnect_auth'),
        web3Auth: localStorage.getItem('web3_auth')
      } : 'server-side'
    });
    throw new AuthError('用户未登录，请先登录');
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(url: string, config: RequestConfig): string {
    const method = config.method;
    const body = config.body ? JSON.stringify(config.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * 获取缓存数据
   */
  private getCachedData(key: string): any | null {
    if (!this.enableCache) return null;

    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * 设置缓存数据
   */
  private setCachedData(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    if (!this.enableCache) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 清除缓存
   */
  public clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 检查URL是否为公开端点（不需要认证）
   */
  private isPublicEndpoint(url: string): boolean {
    const publicEndpoints = [
      '/api/auth/web3/authenticate',
      '/api/auth/web3/verify-signature',
      '/api/auth/web3/get-nonce',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/verify',
      '/api/wechat',
      '/api/public'
    ];

    return publicEndpoints.some(endpoint => url.startsWith(endpoint));
  }

  /**
   * 核心请求方法
   */
  private async request<T>(
    url: string, 
    config: RequestConfig,
    attempt: number = 1
  ): Promise<APIResponse<T>> {
    const fullUrl = `${this.baseURL}${url}`;
    const cacheKey = this.getCacheKey(url, config);

    // 检查缓存 (仅对GET请求)
    if (config.method === 'GET' && config.cache !== false) {
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`🎯 缓存命中: ${url}`);
        return cachedData;
      }
    }

    try {
      // 准备头部
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.headers
      };

      // 对于非公开端点，获取认证头部
      if (!this.isPublicEndpoint(url)) {
        try {
          const authHeaders = await this.getAuthHeaders();
          headers = {
            ...headers,
            ...authHeaders
          };
        } catch (authError) {
          console.error(`❌ 获取认证头部失败: ${url}`, authError);
          // 如果是AuthError且明确要求重新认证，应该抛出错误而不是继续请求
          if (authError instanceof AuthError && authError.message.includes('重新连接钱包')) {
            throw authError;
          }
          // 其他认证错误，记录但不阻止请求继续
          console.log(`🔓 认证失败，作为匿名请求继续: ${url}`);
        }
      } else {
        console.log(`🔓 公开端点，跳过认证: ${url}`);
      }

      // 准备请求体
      const body = config.body ? JSON.stringify(config.body) : undefined;

      // 创建超时控制器
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log(`⏰ 请求超时: ${config.method} ${fullUrl}`);
        controller.abort();
      }, config.timeout || this.timeout);

      console.log(`🌐 API请求: ${config.method} ${fullUrl}`);

      // 发起请求
      const response = await fetch(fullUrl, {
        method: config.method,
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // 解析响应
      let data: APIResponse<T>;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new APIError('响应解析失败', response.status);
      }

      // 检查HTTP状态
      if (!response.ok) {
        const errorMessage = data.error || `HTTP ${response.status}`;
        
        if (response.status === 401) {
          throw new AuthError(errorMessage);
        }
        
        throw new APIError(errorMessage, response.status, data);
      }

      // 检查业务状态
      if (!data.success) {
        throw new APIError(data.error || '请求失败', response.status, data);
      }

      // 缓存成功的GET请求结果
      if (config.method === 'GET' && config.cache !== false) {
        this.setCachedData(cacheKey, data);
      }

      console.log(`✅ API成功: ${config.method} ${fullUrl}`);
      return data;

    } catch (error) {
      console.error(`❌ API失败: ${config.method} ${fullUrl}`, error);

      // 认证错误不重试，但提供更详细的错误信息
      if (error instanceof AuthError) {
        const errorDetails = {
          message: error.message,
          status: error.status,
          method: config.method,
          url: fullUrl,
          timestamp: new Date().toISOString(),
          errorName: error.name,
          // 检查localStorage中的认证状态
          authStatus: typeof window !== 'undefined' ? {
            hasCurrentUser: !!localStorage.getItem('current_user'),
            hasWalletConnectAuth: !!localStorage.getItem('walletconnect_auth'),
            hasWeb3Auth: !!localStorage.getItem('web3_auth'),
            hasWalletSession: !!localStorage.getItem('wallet_session')
          } : 'server-side'
        };
        
        console.error('🔐 认证错误详情:', errorDetails);
        console.error('🔐 错误类型:', error.constructor.name);
        console.error('🔐 错误消息:', error.message);
        console.error('🔐 错误堆栈:', error.stack);
        if (error instanceof AuthError) {
          console.error('🔐 AuthError详情:', {
            name: error.name,
            message: error.message,
            status: error.status
          });
        }
        throw error;
      }

      // 网络错误重试
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.log(`🔄 重试请求 (${attempt}/${this.retryAttempts}): ${url}`);
        await this.delay(this.retryDelay * attempt);
        return this.request(url, config, attempt + 1);
      }

      // 转换错误类型
      if (error instanceof APIError) {
        throw error;
      }

      // 特殊处理AbortError
      if (error.name === 'AbortError') {
        throw new APIError('请求超时，请稍后重试', 0);
      }

      throw new APIError(
        error instanceof Error ? error.message : '网络请求失败',
        0
      );
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: any): boolean {
    // 网络错误
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true;
    }
    
    // 超时错误 - 但是要避免无限重试
    if (error.name === 'AbortError') {
      console.log(`🔄 检测到超时错误，准备重试`);
      return true;
    }
    
    // 5xx服务器错误
    if (error instanceof APIError && error.status >= 500) {
      return true;
    }
    
    return false;
  }

  /**
   * GET请求
   */
  async get<T>(url: string, options: { 
    cache?: boolean; 
    timeout?: number; 
  } = {}): Promise<APIResponse<T>> {
    return this.request<T>(url, {
      method: 'GET',
      cache: options.cache,
      timeout: options.timeout
    });
  }

  /**
   * POST请求
   */
  async post<T>(url: string, data?: any, options: {
    timeout?: number;
  } = {}): Promise<APIResponse<T>> {
    // POST请求后清除相关缓存
    this.clearCache(url.split('?')[0]);
    
    return this.request<T>(url, {
      method: 'POST',
      body: data,
      timeout: options.timeout
    });
  }

  /**
   * PUT请求
   */
  async put<T>(url: string, data?: any, options: {
    timeout?: number;
  } = {}): Promise<APIResponse<T>> {
    // PUT请求后清除相关缓存
    this.clearCache(url.split('?')[0]);
    
    return this.request<T>(url, {
      method: 'PUT',
      body: data,
      timeout: options.timeout
    });
  }

  /**
   * DELETE请求
   */
  async delete<T>(url: string, options: {
    timeout?: number;
  } = {}): Promise<APIResponse<T>> {
    // DELETE请求后清除相关缓存
    this.clearCache(url.split('?')[0]);
    
    return this.request<T>(url, {
      method: 'DELETE',
      timeout: options.timeout
    });
  }

  /**
   * PATCH请求
   */
  async patch<T>(url: string, data?: any, options: {
    timeout?: number;
  } = {}): Promise<APIResponse<T>> {
    // PATCH请求后清除相关缓存
    this.clearCache(url.split('?')[0]);
    
    return this.request<T>(url, {
      method: 'PATCH',
      body: data,
      timeout: options.timeout
    });
  }

  /**
   * 分页请求辅助方法
   */
  async getPaginated<T>(url: string, params: {
    page?: number;
    pageSize?: number;
    [key: string]: any;
  } = {}): Promise<PaginatedResponse<T>> {
    const queryParams = new URLSearchParams();
    
    // 添加分页参数
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    
    // 添加其他参数
    Object.entries(params).forEach(([key, value]) => {
      if (key !== 'page' && key !== 'pageSize' && value !== undefined) {
        queryParams.set(key, value.toString());
      }
    });

    const fullUrl = `${url}?${queryParams.toString()}`;
    return this.get<T[]>(fullUrl).then(response => response as PaginatedResponse<T>);
  }
}

/**
 * 默认API客户端实例
 */
export const apiClient = new APIClient({
  enableCache: true,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
});

/**
 * 创建无缓存的API客户端
 */
export const uncachedApiClient = new APIClient({
  enableCache: false,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000
});

// 错误类型已在定义时导出 