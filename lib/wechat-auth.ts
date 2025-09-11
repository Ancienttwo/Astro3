/**
 * 微信认证模块
 * 支持微信OAuth2.0登录和用户信息获取
 */

import crypto from 'crypto'
import axios from 'axios'

export interface WechatConfig {
  appId: string
  appSecret: string
  redirectUri: string
}

export interface WechatUserInfo {
  openid: string
  nickname: string
  sex: number
  province: string
  city: string
  country: string
  headimgurl: string
  unionid?: string
}

export interface WechatAccessToken {
  access_token: string
  expires_in: number
  refresh_token: string
  openid: string
  scope: string
  unionid?: string
}

export class WechatAuth {
  private config: WechatConfig

  constructor(config: WechatConfig) {
    this.config = config
  }

  /**
   * 生成微信OAuth2.0授权URL
   * @param state 状态参数，用于防止CSRF攻击
   * @returns 授权URL
   */
  getAuthUrl(state: string = this.generateState()): string {
    const params = new URLSearchParams({
      appid: this.config.appId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'snsapi_userinfo',
      state: state
    })

    return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`
  }

  /**
   * 通过授权码获取访问令牌
   * @param code 授权码
   * @returns 访问令牌信息
   */
  async getAccessToken(code: string): Promise<WechatAccessToken> {
    const url = 'https://api.weixin.qq.com/sns/oauth2/access_token'
    const params = {
      appid: this.config.appId,
      secret: this.config.appSecret,
      code: code,
      grant_type: 'authorization_code'
    }

    try {
      const response = await axios.get(url, { params })
      const data = response.data

      if (data.errcode) {
        throw new Error(`微信认证失败: ${data.errmsg}`)
      }

      return data
    } catch (error) {
      console.error('获取微信访问令牌失败:', error)
      throw error
    }
  }

  /**
   * 刷新访问令牌
   * @param refreshToken 刷新令牌
   * @returns 新的访问令牌信息
   */
  async refreshAccessToken(refreshToken: string): Promise<WechatAccessToken> {
    const url = 'https://api.weixin.qq.com/sns/oauth2/refresh_token'
    const params = {
      appid: this.config.appId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }

    try {
      const response = await axios.get(url, { params })
      const data = response.data

      if (data.errcode) {
        throw new Error(`刷新令牌失败: ${data.errmsg}`)
      }

      return data
    } catch (error) {
      console.error('刷新微信访问令牌失败:', error)
      throw error
    }
  }

  /**
   * 获取用户信息
   * @param accessToken 访问令牌
   * @param openid 用户OpenID
   * @returns 用户信息
   */
  async getUserInfo(accessToken: string, openid: string): Promise<WechatUserInfo> {
    const url = 'https://api.weixin.qq.com/sns/userinfo'
    const params = {
      access_token: accessToken,
      openid: openid,
      lang: 'zh_CN'
    }

    try {
      const response = await axios.get(url, { params })
      const data = response.data

      if (data.errcode) {
        throw new Error(`获取用户信息失败: ${data.errmsg}`)
      }

      return data
    } catch (error) {
      console.error('获取微信用户信息失败:', error)
      throw error
    }
  }

  /**
   * 验证访问令牌是否有效
   * @param accessToken 访问令牌
   * @param openid 用户OpenID
   * @returns 是否有效
   */
  async validateAccessToken(accessToken: string, openid: string): Promise<boolean> {
    const url = 'https://api.weixin.qq.com/sns/auth'
    const params = {
      access_token: accessToken,
      openid: openid
    }

    try {
      const response = await axios.get(url, { params })
      const data = response.data

      return data.errcode === 0
    } catch (error) {
      console.error('验证微信访问令牌失败:', error)
      return false
    }
  }

  /**
   * 生成随机状态参数
   * @returns 随机状态字符串
   */
  private generateState(): string {
    return crypto.randomBytes(16).toString('hex')
  }

  /**
   * 验证状态参数
   * @param state 状态参数
   * @returns 是否有效
   */
  validateState(state: string): boolean {
    // 这里可以实现更复杂的状态验证逻辑
    // 比如检查状态是否过期、是否在有效列表中等
    return !!state && state.length === 32
  }
}

// 工厂函数，用于创建微信认证实例
export function createWechatAuth(): WechatAuth {
  const config: WechatConfig = {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
    redirectUri: process.env.WECHAT_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/wechat/auth/callback`
  }

  if (!config.appId || !config.appSecret) {
    throw new Error('微信认证配置缺失，请检查环境变量 WECHAT_APP_ID 和 WECHAT_APP_SECRET')
  }

  return new WechatAuth(config)
} 
