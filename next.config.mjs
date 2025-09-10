/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig = {
  // 启用独立输出，适合容器化部署
  output: 'standalone',
  
  // 移除i18n配置，使用手动路由以支持App Router
  // Next.js 15 App Router 与传统 i18n 配置不兼容
  
  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // 使用Cloudflare图片优化
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // 实验性功能
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },

  // 性能优化
  compress: true,
  generateEtags: true,
  poweredByHeader: false,

  // 环境变量
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://your-domain.com',
  },

  // React配置
  reactStrictMode: true,

  // 跳过类型检查和ESLint（生产环境建议启用）
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },

  async redirects() {
    return [
      // 移除了所有 app.astrozi.ai 的重定向设置
      // 现在统一使用 astrozi.ai 域名，不再分离子域名
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // 改为SAMEORIGIN以支持微信浏览器
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // 开发环境不使用HSTS
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          }] : []),
          {
            key: 'Content-Security-Policy',
            value: process.env.NODE_ENV === 'production' 
              ? "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://js.stripe.com https://api.dify.ai; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com https://rsms.me; connect-src 'self' https://fbtumedqykpgichytumn.supabase.co https://api.stripe.com https://api.dify.ai wss://relay.walletconnect.com https://relay.walletconnect.com; frame-src https://js.stripe.com;"
              : "default-src 'self' 'unsafe-eval' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://js.stripe.com https://esm.sh; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://rsms.me; img-src 'self' data: https: http:; font-src 'self' data: https://fonts.gstatic.com https://rsms.me; connect-src 'self' http://localhost:* ws://localhost:* wss://relay.walletconnect.com https://relay.walletconnect.com https: https://esm.sh; frame-src 'self';", // 开发环境CSP，允许WalletConnect WebSocket连接和ESM模块
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? process.env.NEXT_PUBLIC_APP_URL || 'https://www.astrozi.ai'
              : '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    
    // Next.js 已经在生产环境默认移除 console.log
    // 这里不需要额外配置

    return config
  },
}

export default withBundleAnalyzer(nextConfig)
