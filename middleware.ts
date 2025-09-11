import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

// Configure locale handling via next-intl
const intlMiddleware = createIntlMiddleware({
  // Supported locales
  locales: ['zh', 'en', 'ja'],
  // Default locale without prefix
  defaultLocale: 'zh',
  localePrefix: 'as-needed'
})

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If path looks like a static asset (has an extension), do not localize.
  // Additionally, if it is locale-prefixed, rewrite to the root static path.
  if (/\.[^/]+$/.test(pathname)) {
    const segments = pathname.split('/')
    const first = segments[1]
    if (['en', 'zh', 'ja'].includes(first)) {
      const url = request.nextUrl.clone()
      url.pathname = '/' + segments.slice(2).join('/')
      return NextResponse.rewrite(url)
    }
    return NextResponse.next()
  }

  // Delegate locale routing/detection to next-intl for non-static routes
  const response = intlMiddleware(request)

  // Preserve existing security headers
  const isProd = process.env.NODE_ENV === 'production'
  const securityHeaders: Record<string, string> = {
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(self)'
  }

  const devCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net https://*.supabase.co https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' http://localhost:* ws://localhost:* https: wss: https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.sentry.io https://auth.privy.io https://api.privy.io https://*.privy.io wss://relay.walletconnect.com https://relay.walletconnect.com",
    "frame-src 'self' https://js.stripe.com https://*.privy.io",
    "worker-src 'self' blob:"
  ].join('; ')

  const prodCsp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net https://*.supabase.co https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.sentry.io https://auth.privy.io https://api.privy.io https://*.privy.io wss://relay.walletconnect.com https://relay.walletconnect.com",
    "frame-src 'self' https://js.stripe.com https://*.privy.io"
  ].join('; ')

  securityHeaders['Content-Security-Policy'] = isProd ? prodCsp : devCsp

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    // Skip all requests that include a file extension (e.g., assets),
    // api routes, Next internals, and Vercel internals
    '/((?!api|_next|_vercel|.*\..*).*)'
  ],
}
