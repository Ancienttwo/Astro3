import { usePathname } from 'next/navigation'

/**
 * 检测当前路径是否为英文版本
 * @param pathname 路径名
 * @returns 是否为英文版本
 */
export function isEnglishVersion(pathname: string): boolean {
  return pathname.startsWith('/en')
}

/**
 * 检测当前路径是否为日语版本
 * @param pathname 路径名
 * @returns 是否为日语版本
 */
export function isJapaneseVersion(pathname: string): boolean {
  return pathname.startsWith('/ja')
}

/**
 * 获取当前语言环境
 * @param pathname 路径名
 * @returns 语言代码
 */
export function getLanguage(pathname: string): 'zh' | 'en' | 'ja' {
  if (isJapaneseVersion(pathname)) return 'ja'
  if (isEnglishVersion(pathname)) return 'en'
  return 'zh'
}

/**
 * 获取对应语言的路径
 * @param pathname 当前路径
 * @param targetLang 目标语言
 * @returns 转换后的路径
 */
export function getLanguagePath(pathname: string, targetLang: 'zh' | 'en' | 'ja'): string {
  // 移除现有语言前缀，获取基础路径
  let basePath = pathname
  if (pathname.startsWith('/en')) {
    basePath = pathname.replace('/en', '') || '/'
  } else if (pathname.startsWith('/ja')) {
    basePath = pathname.replace('/ja', '') || '/'
  }
  
  // 根据目标语言添加前缀
  if (targetLang === 'en') {
    return `/en${basePath}`
  } else if (targetLang === 'ja') {
    return `/ja${basePath}`
  } else {
    // 中文版本不需要前缀
    return basePath
  }
}

/**
 * 获取英文版本的路径（如果页面支持英文）
 * @param pathname 当前路径
 * @returns 英文版本路径或null
 */
export function getEnglishPath(pathname: string): string | null {
  // 支持英文版本的页面列表
  const supportedEnglishPages = [
    '/auth',
    '/bazi',
    '/ziwei',
    '/settings',
    '/charts',
    '/create-chart',
    '/wiki'
  ]
  
  let basePath = pathname
  if (pathname.startsWith('/en')) {
    basePath = pathname.replace('/en', '')
  } else if (pathname.startsWith('/ja')) {
    basePath = pathname.replace('/ja', '')
  }
  basePath = basePath || '/'
  
  if (supportedEnglishPages.includes(basePath)) {
    return `/en${basePath}`
  }
  
  return null
}

/**
 * 获取日语版本的路径（如果页面支持日语）
 * @param pathname 当前路径
 * @returns 日语版本路径或null
 */
export function getJapanesePath(pathname: string): string | null {
  // 支持日语版本的页面列表
  const supportedJapanesePages = [
    '/auth',
    '/bazi',
    '/ziwei',
    '/settings',
    '/charts',
    '/create-chart',
    '/wiki'
  ]
  
  let basePath = pathname
  if (pathname.startsWith('/en')) {
    basePath = pathname.replace('/en', '')
  } else if (pathname.startsWith('/ja')) {
    basePath = pathname.replace('/ja', '')
  }
  basePath = basePath || '/'
  
  if (supportedJapanesePages.includes(basePath)) {
    return `/ja${basePath}`
  }
  
  return null
}

/**
 * 获取中文版本的路径
 * @param pathname 当前路径
 * @returns 中文版本路径
 */
export function getChinesePath(pathname: string): string {
  if (pathname.startsWith('/en')) {
    return pathname.replace('/en', '') || '/'
  } else if (pathname.startsWith('/ja')) {
    return pathname.replace('/ja', '') || '/'
  }
  return pathname
} 