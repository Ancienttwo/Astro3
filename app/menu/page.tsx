'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Sparkles, Crown, BookOpen, Users, Settings, HelpCircle, Globe, ChevronDown } from 'lucide-react';
import Logo from '@/components/Logo';
import { Card, CardContent } from '@/components/ui/card';

const MenuPage: React.FC = () => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('simplified');

  // 语言配置
  const languages = [
    { code: 'simplified', name: '简体', flag: '🇨🇳' },
    { code: 'traditional', name: '繁體', flag: '🇹🇼' },
    { code: 'english', name: 'English', flag: '🇺🇸' }
  ];

  // 处理语言切换
  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    setShowLanguageMenu(false);
    console.log('切换语言:', langCode);
  };

  const menuItems = [
    {
      title: '首页',
      description: '返回主页',
      href: '/home',
      icon: Home,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '关帝灵签',
      description: '关圣帝君指点迷津',
      href: '/guandi',
      icon: Crown,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    {
      title: '算命占卜',
      description: 'AI八字紫微分析',
      href: '/create-chart',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '知识百科',
      description: '传统文化知识',
      href: '/wiki',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '会员中心',
      description: '会员权益管理',
      href: '/membership',
      icon: Users,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: '帮助中心',
      description: '使用帮助和支持',
      href: '/help-center',
      icon: HelpCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <div className="bg-white px-4 py-3 flex items-center border-b border-gray-200 sticky top-0 z-50 relative">
        {/* 左侧：Logo */}
        <Link
          href="/home"
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Logo size={24} />
        </Link>
        
        {/* 中间：标题（绝对居中） */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-lg font-bold text-gray-900">菜单</h1>
        </div>
        
        {/* 右侧：语言选择和首页 */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* 语言选择器 */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Globe className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* 语言下拉菜单 */}
            {showLanguageMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-60 min-w-[120px]">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                      currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-sm">{language.flag}</span>
                    <span className="text-sm">{language.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            href="/home"
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-5 h-5 text-gray-700" />
          </Link>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="container mx-auto px-4 py-6 max-w-md">
        <div className="space-y-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link key={index} href={item.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-lg ${item.bgColor}`}>
                        <Icon className={`w-6 h-6 ${item.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Logo size={20} />
            <span className="text-sm font-medium text-gray-600">AstroZi</span>
          </div>
          <p className="text-xs text-gray-500">传统文化与现代科技的完美结合</p>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;