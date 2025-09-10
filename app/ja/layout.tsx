'use client'

// Temporarily disable Google Fonts due to network issues
// import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { useEffect } from 'react'

// const inter = Inter({ subsets: ['latin'] })

export default function JapaneseRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // 设置页面语言为日语
    document.documentElement.lang = 'ja'
    
    // 清理函数，在组件卸载时恢复默认语言
    return () => {
      document.documentElement.lang = 'en'
    }
  }, [])

  return (
    <div className={`font-noto-sans-jp leading-japanese tracking-japanese`}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </div>
  )
}