"use client"

import { useEffect, useMemo } from 'react'
import { useWeb3User } from './useWeb3User'
import { useLanguage, type SupportedLanguage } from '@/lib/contexts/language-context'

// 用户类型枚举
export type UserType = 'web2' | 'web3' | 'guest'

// 统一用户接口
export interface UnifiedUser {
  id?: string
  email?: string
  username?: string
  wallet_address?: string
  auth_method?: 'email' | 'walletconnect' | 'web3_jwt'
  avatar_url?: string
}

// UseUserContext 返回类型
export interface UseUserContextReturn {
  // 用户类型和信息
  userType: UserType
  isWeb3User: boolean
  isWeb2User: boolean
  isGuest: boolean
  user: UnifiedUser | null
  
  // 语言管理
  language: SupportedLanguage
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  
  // 布局决策
  shouldUseWeb3Layout: boolean
  
  // 状态
  isLoading: boolean
  error: string | null
}

/**
 * 统一用户上下文Hook
 * 整合Web3用户检测和语言管理，提供智能默认策略
 */
export function useUserContext(): UseUserContextReturn {
  const web3State = useWeb3User()
  const languageState = useLanguage()

  // 用户类型判断
  const userType: UserType = useMemo(() => {
    if (web3State.isWeb3User) return 'web3'
    // TODO: 添加Web2用户检测逻辑
    // if (hasWeb2Auth) return 'web2' 
    return 'guest'
  }, [web3State.isWeb3User])

  // 统一用户信息
  const user: UnifiedUser | null = useMemo(() => {
    if (web3State.web3User) {
      return {
        username: web3State.web3User.username,
        wallet_address: web3State.web3User.wallet_address,
        auth_method: web3State.web3User.auth_method
      }
    }
    // TODO: 添加Web2用户信息映射
    return null
  }, [web3State.web3User])

  // 智能语言选择逻辑
  const getSmartDefaultLanguage = (): SupportedLanguage => {
    // 如果用户手动设置过语言，优先使用用户选择
    if (languageState.state.detectionSource === 'user') {
      return languageState.state.currentLanguage
    }

    // Web3用户智能策略
    if (web3State.isWeb3User) {
      // Web3环境通常使用英文，除非明确检测到中文地区
      const browserLang = typeof navigator !== 'undefined' 
        ? navigator.language || navigator.languages?.[0] 
        : ''
      
      // 中文地区的Web3用户仍然可能偏好中文
      if (browserLang.startsWith('zh-CN') || browserLang.includes('CN')) {
        return 'zh-CN'
      } else if (browserLang.startsWith('zh-TW') || browserLang.startsWith('zh-Hant')) {
        return 'zh-TW'  
      } else {
        return 'en-US'  // 默认英文
      }
    }

    // Web2用户使用原有检测逻辑
    return languageState.state.currentLanguage
  }

  // 应用智能语言选择
  const smartLanguage = useMemo(() => {
    return getSmartDefaultLanguage()
  }, [web3State.isWeb3User, languageState.state.currentLanguage, languageState.state.detectionSource])

  // 自动应用智能语言选择（仅在必要时）
  useEffect(() => {
    const currentLang = languageState.state.currentLanguage
    const shouldUpdate = smartLanguage !== currentLang && 
                        languageState.state.detectionSource !== 'user'

    if (shouldUpdate && !languageState.state.isLoading) {
      console.log(`🌐 智能语言切换: ${currentLang} → ${smartLanguage} (用户类型: ${userType})`)
      languageState.changeLanguage(smartLanguage)
    }
  }, [smartLanguage, userType, languageState, web3State.isWeb3User])

  // 布局决策逻辑
  const shouldUseWeb3Layout = useMemo(() => {
    return web3State.isWeb3User && !web3State.isLoading
  }, [web3State.isWeb3User, web3State.isLoading])

  // 组合错误状态
  const error = web3State.isLoading ? null : languageState.state.error

  return {
    // 用户类型和信息
    userType,
    isWeb3User: userType === 'web3',
    isWeb2User: userType === 'web2', 
    isGuest: userType === 'guest',
    user,
    
    // 语言管理
    language: languageState.state.currentLanguage,
    changeLanguage: languageState.changeLanguage,
    
    // 布局决策
    shouldUseWeb3Layout,
    
    // 状态
    isLoading: web3State.isLoading || languageState.state.isLoading,
    error
  }
}

/**
 * 便捷Hooks
 */

// 获取用户类型
export const useUserType = () => {
  const { userType, isWeb3User, isWeb2User, isGuest } = useUserContext()
  return { userType, isWeb3User, isWeb2User, isGuest }
}

// 获取布局信息
export const useLayoutDecision = () => {
  const { shouldUseWeb3Layout, userType } = useUserContext()
  return { shouldUseWeb3Layout, userType }
}

// 获取用户和语言信息
export const useUserPreferences = () => {
  const { user, language, changeLanguage, userType } = useUserContext()
  return { user, language, changeLanguage, userType }
}