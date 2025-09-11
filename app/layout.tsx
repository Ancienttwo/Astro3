import type { Metadata } from 'next'
// Temporarily disable all Google Fonts due to network issues
// import { Inter, Josefin_Sans, Rajdhani } from "next/font/google";
// import { Noto_Serif_SC } from "next/font/google";
import "./globals.css";
// import { RecordsProvider } from "@/contexts/RecordsContext"; // 已迁移到新架构
import { SettingsProvider } from "@/contexts/SettingsContext";
import { CardControlProvider } from "@/components/AnalysisLayout";
import { ThemeProvider } from "@/components/theme-provider";
import AuthGuard from "@/components/AuthGuard";
import ErrorBoundary from "@/components/ErrorBoundary";
import SEOHead from "@/components/SEOHead";
import { generateWebsiteStructuredData, generateOrganizationStructuredData } from "@/lib/seo/structured-data";
import { Providers } from "@/components/Providers";
import {NextIntlClientProvider} from 'next-intl';
import { zhDict } from '@/lib/i18n/dictionaries';
import { unstable_setRequestLocale } from 'next-intl/server';

// 统一配置架构导入
import { APP_CONFIG } from "@/lib/config/app-config";
import { DEPLOYMENT_CONFIG } from "@/lib/config/deployment-config";
import { CSS_VARIABLES } from "@/lib/config/ui-theme-config";

// Temporarily disable all Google Fonts due to network issues
// const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
// const notoSerifSC = Noto_Serif_SC({
//   weight: ['400', '700'],
//   variable: '--font-noto-serif-sc',
//   subsets: ['latin'],
//   display: 'swap',
// });
// const josefinSans = Josefin_Sans({
//   subsets: ['latin'],
//   weight: ['400', '700'],
//   variable: '--font-josefin-sans',
//   display: 'swap',
// });
// const rajdhani = Rajdhani({
//   subsets: ['latin'],
//   weight: ['300', '400', '500', '600', '700'],
//   variable: '--font-rajdhani',
//   display: 'swap',
// });

import { generateMetadata as generateSEOMetadata, pageSEOConfigs } from "@/lib/seo/metadata";

// 使用配置系统生成SEO元数据
export const metadata = generateSEOMetadata({
  title: DEPLOYMENT_CONFIG.seo.siteName,
  description: DEPLOYMENT_CONFIG.seo.description,
  keywords: DEPLOYMENT_CONFIG.seo.keywords,
  type: "website"
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f59e0b",
};

// 先保持全局动态渲染；后续逐页迁移到 Suspense/SSG 再移除此设置
// Remove global dynamic; pages that need CSR are marked individually

// 默认使用静态渲染；具体语言子树在各自 layout 中设置 locale

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pin default locale for static rendering of non-prefixed (ZH) pages.
  unstable_setRequestLocale('zh');
  // 应用CSS变量到根元素
  const cssVariablesStyle = Object.entries(CSS_VARIABLES).reduce((acc, [key, value]) => {
    acc[key as any] = value;
    return acc;
  }, {} as React.CSSProperties);

  return (
    <html lang={DEPLOYMENT_CONFIG.seo.locale.split('-')[0]} suppressHydrationWarning style={cssVariablesStyle}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        {/* Use web app capable meta for Android; iOS now prefers manifest display */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_CONFIG.ui.branding.productName} />
        
        {/* PWA图标配置 */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/icon-192.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" sizes="192x192" href="/icon-192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="512x512" href="/icon-512.svg" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-TileImage" content="/icon-512.svg" />
        <meta name="msapplication-TileColor" content="#f59e0b" />
      </head>
      <body className={`font-sans`} suppressHydrationWarning>
        <SEOHead 
          structuredData={[
            generateWebsiteStructuredData(),
            generateOrganizationStructuredData()
          ]}
        />
        
        <ErrorBoundary>
          <Providers>
            {/* Root provides zh messages for default (no prefix) pages; locale-specific layouts override */}
            <NextIntlClientProvider locale={'zh'} messages={zhDict as any}>
              <ThemeProvider
                attribute="class"
                defaultTheme="light"
                enableSystem
                disableTransitionOnChange
              >
                  <SettingsProvider>
                      <CardControlProvider>
                        <AuthGuard>
                          {children}
                        </AuthGuard>
                      </CardControlProvider>
                  </SettingsProvider>
              </ThemeProvider>
            </NextIntlClientProvider>
          </Providers>
        </ErrorBoundary>
        
        </body>
    </html>
  );
}
