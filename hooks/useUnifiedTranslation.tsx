'use client'

import { usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { authTranslations } from '@/lib/i18n/auth-translations'
import { getDictionary } from '@/lib/i18n/dictionaries'

/**
 * 统一翻译Hook - 整合所有翻译系统
 * 优先级：LanguageContext > authTranslations > dictionaries
 */
export function useUnifiedTranslation() {
  const pathname = usePathname()
  
  // 添加错误处理，如果LanguageProvider不可用则使用路径检测
  let language: 'zh' | 'en' | 'ja'
  let contextT: (key: string) => string
  
  try {
    const context = useLanguage()
    language = context.language
    contextT = context.t
  } catch (error) {
    // 回退：使用路径检测语言
    language = pathname.startsWith('/ja') ? 'ja' : pathname.startsWith('/en') ? 'en' : 'zh'
    contextT = (key: string) => key // 简单回退，返回键名
  }
  
  // 检测当前语言
  const currentLang = (() => {
    if (pathname.startsWith('/ja')) return 'ja'
    if (pathname.startsWith('/en')) return 'en'
    return 'zh'
  })() as 'zh' | 'en' | 'ja'

  // 获取认证翻译
  const authT = authTranslations[currentLang]
  
  // 获取字典翻译
  const dictT = getDictionary(currentLang)

  /**
   * 统一翻译函数
   * @param key 翻译键
   * @param fallback 回退文本
   * @returns 翻译文本
   */
  const t = (key: string, fallback?: string): string => {
    // 1. 优先使用 LanguageContext
    const contextResult = contextT(key)
    if (contextResult !== key) return contextResult

    // 2. 尝试认证翻译
    if (authT && key in authT) {
      return authT[key as keyof typeof authT]
    }

    // 3. 尝试字典翻译 - 支持嵌套键名如 "common.save"
    const dictResult = getNestedValue(dictT, key)
    if (dictResult) return dictResult

    // 4. 返回回退文本或原键名
    return fallback || key
  }

  return {
    language: currentLang,
    t,
    contextT,
    authT,
    dictT
  }
}

/**
 * 获取嵌套对象值
 * @param obj 对象
 * @param path 路径，如 "common.save"
 * @returns 值或undefined
 */
function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

/**
 * 路径感知的翻译Hook
 * 根据当前路径自动选择合适的翻译系统
 */
export function usePathAwareTranslation() {
  const pathname = usePathname()
  const unified = useUnifiedTranslation()

  // 根据路径选择最佳翻译策略
  const isAuthPage = pathname.includes('/auth')
  const isJaPage = pathname.startsWith('/ja')
  const isEnPage = pathname.startsWith('/en')

  return {
    ...unified,
    isAuthPage,
    isJaPage,
    isEnPage,
    // 智能翻译：根据页面类型选择最佳翻译源
    smartT: (key: string, fallback?: string) => {
      if (isAuthPage) {
        // 认证页面优先使用 authTranslations
        const authResult = unified.authT?.[key as keyof typeof unified.authT]
        if (authResult) return authResult
      }
      return unified.t(key, fallback)
    }
  }
}