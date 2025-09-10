import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // 检查路径是否已经包含语言前缀
  const pathnameIsMissingLocale = !['/en', '/ja'].some(
    (locale) => pathname.startsWith(locale) || pathname === locale
  )

  // 如果是API路由、静态资源或特殊路径，直接通过
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return
  }

  // 重定向到默认语言（中文）不需要前缀
  if (pathnameIsMissingLocale) {
    // 对于根路径或中文路径，不需要重定向
    return
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有路径，除了以下路径：
    // - api 路由
    // - _next/static (静态文件)
    // - _next/image (图片优化文件)
    // - favicon.ico (网站图标)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}