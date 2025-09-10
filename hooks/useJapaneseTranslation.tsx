'use client'

import { useUnifiedTranslation } from './useUnifiedTranslation'
import { japaneseUITranslations } from '@/lib/i18n/japanese-ui-translations'
import { japaneseCulturalAdaptations } from '@/lib/i18n/japanese-cultural-adaptations'

/**
 * 日语专用翻译Hook
 * 整合所有日语翻译资源，提供文化适应性翻译
 */
export function useJapaneseTranslation() {
  const { language, t: unifiedT } = useUnifiedTranslation()

  /**
   * 日语优先翻译函数
   * @param key 翻译键，支持嵌套路径如 "pages.home.title"
   * @param fallback 回退文本
   * @returns 日语翻译文本
   */
  const jt = (key: string, fallback?: string): string => {
    // 如果不是日语环境，使用统一翻译
    if (language !== 'ja') {
      return unifiedT(key, fallback)
    }

    // 尝试从日语UI翻译获取
    const uiResult = getNestedTranslation(japaneseUITranslations, key)
    if (uiResult) return uiResult

    // 尝试从文化适应翻译获取
    const culturalResult = getNestedTranslation(japaneseCulturalAdaptations, key)
    if (culturalResult) return culturalResult

    // 回退到统一翻译系统
    return unifiedT(key, fallback)
  }

  /**
   * 文化敏感翻译函数
   * 专门用于需要文化适应的内容
   */
  const ct = (key: string, fallback?: string): string => {
    if (language !== 'ja') {
      return unifiedT(key, fallback)
    }

    const culturalResult = getNestedTranslation(japaneseCulturalAdaptations, key)
    if (culturalResult) return culturalResult

    return jt(key, fallback)
  }

  /**
   * 格式化日期为日语格式
   */
  const formatDate = (date: Date): string => {
    if (language !== 'ja') {
      return date.toLocaleDateString()
    }

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    })
  }

  /**
   * 格式化时间为日语格式
   */
  const formatTime = (date: Date): string => {
    if (language !== 'ja') {
      return date.toLocaleTimeString()
    }

    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  /**
   * 格式化数字为日语格式
   */
  const formatNumber = (num: number): string => {
    if (language !== 'ja') {
      return num.toString()
    }

    return num.toLocaleString('ja-JP')
  }

  /**
   * 获取礼貌用语
   */
  const getPoliteExpression = (type: keyof typeof japaneseCulturalAdaptations.politeExpressions): string => {
    if (language !== 'ja') {
      return unifiedT(type)
    }

    return japaneseCulturalAdaptations.politeExpressions[type] || unifiedT(type)
  }

  /**
   * 获取商务礼仪用语
   */
  const getBusinessGreeting = (type: keyof typeof japaneseCulturalAdaptations.businessEtiquette.greetings): string => {
    if (language !== 'ja') {
      return unifiedT(type)
    }

    return japaneseCulturalAdaptations.businessEtiquette.greetings[type] || unifiedT(type)
  }

  return {
    language,
    jt, // 日语翻译
    ct, // 文化翻译
    t: unifiedT, // 统一翻译
    formatDate,
    formatTime,
    formatNumber,
    getPoliteExpression,
    getBusinessGreeting,
    // 便捷访问器
    ui: japaneseUITranslations,
    cultural: japaneseCulturalAdaptations,
    isJapanese: language === 'ja'
  }
}

/**
 * 获取嵌套翻译值
 * @param obj 翻译对象
 * @param path 嵌套路径，如 "pages.home.title"
 * @returns 翻译值或undefined
 */
function getNestedTranslation(obj: any, path: string): string | undefined {
  return path.split('.').reduce((current, key) => {
    return current?.[key]
  }, obj)
}

/**
 * 日语页面专用Hook
 * 为日语页面提供完整的翻译和格式化支持
 */
export function useJapanesePage() {
  const translation = useJapaneseTranslation()

  const {
    jt,
    ct,
    formatDate,
    formatTime,
    formatNumber,
    getPoliteExpression,
    getBusinessGreeting,
    isJapanese
  } = translation

  // 页面专用翻译函数
  const pageT = (section: string, key: string, fallback?: string): string => {
    return jt(`pages.${section}.${key}`, fallback)
  }

  // 表单专用翻译函数
  const formT = (key: string, fallback?: string): string => {
    return jt(`form.${key}`, fallback)
  }

  // 状态专用翻译函数
  const statusT = (key: string, fallback?: string): string => {
    return jt(`status.${key}`, fallback)
  }

  // 操作专用翻译函数
  const actionT = (key: string, fallback?: string): string => {
    return jt(`actions.${key}`, fallback)
  }

  return {
    ...translation,
    pageT,
    formT,
    statusT,
    actionT,
    // 常用翻译快捷方式
    loading: statusT('loading'),
    saving: statusT('saving'),
    saved: statusT('saved'),
    error: statusT('error'),
    success: statusT('success'),
    confirm: actionT('confirm'),
    cancel: actionT('cancel'),
    save: actionT('save') || formT('buttons.save'),
    reset: actionT('reset') || formT('buttons.reset')
  }
}