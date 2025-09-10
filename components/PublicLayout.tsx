"use client";

import { useState, useEffect, ReactNode } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Globe,
  ChevronsLeft,
  ChevronsRight,
  User,
  LogIn
} from 'lucide-react';
import Logo from './Logo';
import { Button } from '@/components/ui/button';

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
}

// 百科导航项
const wikiNavItems = [
  { name: '八字基础', href: '/wiki/bazi' },
  { name: '紫微斗数', href: '/wiki/ziwei' },
  { name: '五行理论', href: '/wiki/wuxing' },
  { name: '易经智慧', href: '/wiki/yijing' },
  { name: '学派对比', href: '/wiki/ziwei-vs-bazi' },
];

export default function PublicLayout({ children, title }: PublicLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile();
  
  const [isNavOpen, setIsNavOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // 确保组件已挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 移动端自动隐藏侧边栏
  useEffect(() => {
    if (isMobile) {
      setIsNavOpen(false);
    }
  }, [isMobile]);

  // 防止hydration mismatch，初始渲染时显示桌面版
  if (!mounted) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        {/* 主导航 */}
        <aside className="w-20 bg-card border-r border-border flex flex-col items-center p-4 space-y-6 shadow-sm">
          <button 
            onClick={() => router.push('/')}
            className="text-primary hover:text-primary/80 transition-colors duration-200 p-2 rounded-lg hover:bg-accent/10" 
            title="返回主页"
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <Logo size={48} />
            </div>
          </button>
          
          <nav className="flex-1 flex flex-col items-center space-y-4">
            <Link
              href="/wiki"
              className="p-3 rounded-lg transition-all duration-200 bg-yellow-400 text-black shadow-md hover:bg-yellow-500"
              title="命理百科"
            >
              <Globe size={24} />
            </Link>
          </nav>

          {/* 登录按钮 */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/auth')}
            className="text-muted-foreground hover:text-primary"
            title="登录账户"
          >
            <User size={20} />
          </Button>
        </aside>

        {/* 子导航和内容区域 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 子导航 */}
          <aside className="w-80 p-4 bg-card border-r border-border transition-all duration-300 flex flex-col shrink-0 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">命理百科</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                title="收起导航" 
                className="text-gray-400 hover:text-primary" 
                onClick={() => setIsNavOpen(false)}
              >
                <ChevronsLeft className="w-5 h-5" />
              </Button>
            </div>
            
            <nav className="flex-1 flex flex-col overflow-y-auto">
              <div className="space-y-2">
                {wikiNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center p-3 rounded-md transition-colors duration-200 w-full text-left ${
                        isActive 
                          ? 'bg-accent/20 text-primary' 
                          : 'text-muted-foreground hover:bg-accent/10 hover:text-primary'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </aside>

          {/* 主内容区域 */}
          <main className="flex-1 flex flex-col overflow-y-auto relative">
            <div className="flex-1 p-2 lg:p-4">
              {title && (
                <div className="text-center mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
                  <p className="text-muted-foreground mt-2">深入了解中华传统命理学</p>
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 移动端渲染简化版
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* 移动端顶部栏 */}
        <header className="bg-card border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size={32} />
            <div>
              <h1 className="font-semibold text-foreground">AstroZi 星玺</h1>
              {title && (
                <p className="text-sm text-muted-foreground">{title}</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/auth')}
            className="flex items-center space-x-1"
          >
            <LogIn size={16} />
            <span>登录</span>
          </Button>
        </header>
        
        {/* 移动端内容 */}
        <main className="p-4">
          {children}
        </main>
      </div>
    );
  }

  // 桌面端渲染完整版
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* 主导航 */}
      <aside className="w-20 bg-card border-r border-border flex flex-col items-center p-4 space-y-6 shadow-sm">
        <button 
          onClick={() => router.push('/')}
          className="text-primary hover:text-primary/80 transition-colors duration-200 p-2 rounded-lg hover:bg-accent/10" 
          title="返回主页"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <Logo size={48} />
          </div>
        </button>
        
        <nav className="flex-1 flex flex-col items-center space-y-4">
          <Link
            href="/wiki"
            className="p-3 rounded-lg transition-all duration-200 bg-yellow-400 text-black shadow-md hover:bg-yellow-500"
            title="命理百科"
          >
            <Globe size={24} />
          </Link>
        </nav>

        {/* 登录按钮 */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push('/auth')}
          className="text-muted-foreground hover:text-primary"
          title="登录账户"
        >
          <User size={20} />
        </Button>
      </aside>

      {/* 子导航和内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 子导航 */}
        <aside className={`bg-card border-r border-border transition-all duration-300 flex flex-col shrink-0 shadow-sm ${isNavOpen ? 'w-80 p-4' : 'w-0'}`} style={{ overflow: 'hidden' }}>
          <div className={`flex justify-between items-center mb-4 ${!isNavOpen && 'hidden'}`}>
            <h2 className="text-xl font-semibold text-primary">命理百科</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              title="收起导航" 
              className="text-gray-400 hover:text-primary" 
              onClick={() => setIsNavOpen(false)}
            >
              <ChevronsLeft className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className={`flex-1 flex flex-col overflow-y-auto ${!isNavOpen && 'hidden'}`}>
            <div className="space-y-2">
              {wikiNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center p-3 rounded-md transition-colors duration-200 w-full text-left ${
                      isActive 
                        ? 'bg-accent/20 text-primary' 
                        : 'text-muted-foreground hover:bg-accent/10 hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {!isNavOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsNavOpen(true)} 
              className="absolute top-2 left-2 z-10 text-gray-400 hover:text-primary"
              title="展开导航"
            >
              <ChevronsRight className="w-5 h-5" />
            </Button>
          )}
          
          <div className="flex-1 p-2 lg:p-4">
            {title && !isMobile && (
              <div className="text-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
                <p className="text-muted-foreground mt-2">深入了解中华传统命理学</p>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 