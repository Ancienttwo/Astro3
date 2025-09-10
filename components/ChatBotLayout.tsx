"use client";

import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { useIsMobile } from '@/hooks/useDeviceType';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Menu, Home, Compass, SunMoon, Target, Book } from 'lucide-react';

interface ChatBotLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  input?: ReactNode;
  className?: string;
  title?: string;
}

export default function ChatBotLayout({ 
  children, 
  header, 
  input,
  className,
  title = "AI智能问答"
}: ChatBotLayoutProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 导航处理
  const handleNavigation = (route: string) => {
    router.push(route);
    setShowMenu(false);
  };

  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* 固定顶部容器 - 包含导航栏和聊天头部 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* 顶部导航栏 */}
        <div className="bg-white px-4 py-1 flex items-center justify-between border-b border-gray-100">
          {/* 左侧 Logo */}
          <button 
            onClick={() => handleNavigation('/home')}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Logo size={28} variant="app" />
          </button>
          
          {/* 中间 App 名称 */}
          <h1 className="text-lg font-bold text-gray-900">{title}</h1>
          
          {/* 右侧菜单图标 */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* 下拉菜单 */}
            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                <button
                  onClick={() => handleNavigation('/bazi')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <Compass className="w-4 h-4 mr-3" />
                  八字分析
                </button>
                <button
                  onClick={() => handleNavigation('/ziwei')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <SunMoon className="w-4 h-4 mr-3" />
                  紫微斗数
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => handleNavigation('/create-chart')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <Target className="w-4 h-4 mr-3" />
                  排盘
                </button>
                <button
                  onClick={() => handleNavigation('/charts')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <Book className="w-4 h-4 mr-3" />
                  命书
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => handleNavigation('/home')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <Home className="w-4 h-4 mr-3" />
                  回到首页
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 聊天头部 - 紧贴在导航栏下方 */}
        {header && (
          <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
            {header}
          </div>
        )}
      </div>

      {/* 主要内容区 - 为固定的顶部容器留出空间 */}
      <div className="flex-1 flex flex-col pt-32 pb-24 md:pb-6">
        {/* 聊天内容 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-4xl mx-auto w-full px-2 md:px-4">
            <Card className="h-full flex flex-col mt-4 shadow-lg border-gray-200/50 bg-white/95 backdrop-blur-sm">
              <CardContent className="flex-1 overflow-y-auto p-3 md:p-6 bg-gradient-to-b from-white/0 to-gray-50/20">
                {children}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 固定底部输入框 */}
      {input && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 shadow-lg">
          <div className="max-w-4xl mx-auto px-2 md:px-4">
            {input}
          </div>
        </div>
      )}
    </div>
  );
} 