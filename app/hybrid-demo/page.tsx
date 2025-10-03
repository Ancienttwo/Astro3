'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  ArrowRight, 
  CheckCircle, 
  Languages, 
  Settings,
  Info,
  ExternalLink,
  Code
} from 'lucide-react';
import HybridLanguageLayout from '@/components/layout/HybridLanguageLayout';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

type SupportedLanguage = 'zh' | 'en' | 'ja';

export default function HybridArchitectureDemo() {
  const router = useRouter();
  const currentLocale = useLocale() as SupportedLanguage;
  const isEnglish = currentLocale === 'en';

  const architectureFeatures = [
    {
      title: isEnglish ? 'URL Parameter Sync' : 'URL参数同步',
      description: isEnglish 
        ? 'Language preference automatically synced to URL parameters (?lang=zh-CN)'
        : '语言偏好自动同步到URL参数 (?lang=zh-CN)',
      icon: Globe,
      status: 'active'
    },
    {
      title: isEnglish ? 'Persistent Storage' : '持久化存储',
      description: isEnglish 
        ? 'User language preferences saved in localStorage'
        : '用户语言偏好保存在localStorage中',
      icon: Settings,
      status: 'active'
    },
    {
      title: isEnglish ? 'Real-time Switching' : '实时切换',
      description: isEnglish 
        ? 'Content updates instantly without page reload'
        : '内容即时更新，无需重新加载页面',
      icon: Languages,
      status: 'active'
    },
    {
      title: isEnglish ? 'SEO Friendly' : 'SEO友好',
      description: isEnglish 
        ? 'Search engines can index different language versions'
        : '搜索引擎可以索引不同语言版本',
      icon: ExternalLink,
      status: 'active'
    }
  ];

  const examplePages = [
    {
      name: isEnglish ? 'Settings (Hybrid)' : '设置页面（混合）',
      route: '/settings-hybrid',
      description: isEnglish 
        ? 'Settings page using query parameter i18n'
        : '使用查询参数国际化的设置页面',
      type: 'hybrid'
    },
    {
      name: isEnglish ? 'BaZi Analysis (Path-based)' : '八字分析（路径）',
      route: currentLocale === 'en' ? '/en/bazi' : currentLocale === 'ja' ? '/ja/bazi' : '/bazi',
      description: isEnglish
        ? 'Professional feature with dedicated path structure'
        : '专业功能，使用独立路径结构',
      type: 'path'
    },
    {
      name: isEnglish ? 'Chatbot (Path-based)' : '聊天机器人（路径）',
      route: currentLocale === 'en' ? '/en/chatbot' : currentLocale === 'ja' ? '/ja/chatbot' : '/chatbot',
      description: isEnglish
        ? 'AI chatbot with path-based internationalization'
        : 'AI聊天机器人，使用路径国际化',
      type: 'path'
    }
  ];

  const handleNavigate = (route: string, type: 'hybrid' | 'path') => {
    // next-intl handles routing automatically via middleware
    router.push(route);
  };

  return (
    <HybridLanguageLayout
      title={isEnglish ? 'Hybrid i18n Architecture Demo' : '混合国际化架构演示'}
      description={isEnglish 
        ? 'Demonstrating dual internationalization approach'
        : '演示双重国际化方法'
      }
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 架构介绍 */}
        <Card className="border-2 border-dashed border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              {isEnglish ? 'Architecture Overview' : '架构概览'}
            </CardTitle>
            <CardDescription>
              {isEnglish 
                ? 'This demo showcases our hybrid internationalization approach combining path-based and query parameter methods.'
                : '此演示展示了我们结合路径和查询参数方法的混合国际化方法。'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>{isEnglish ? 'Current Language:' : '当前语言：'}</strong> {currentLocale}
                {' | '}
                <strong>{isEnglish ? 'URL:' : 'URL：'}</strong>
                <code className="bg-muted px-1 py-0.5 rounded text-xs ml-1">
                  {typeof window !== 'undefined' ? window.location.href : 'loading...'}
                </code>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* 语言切换器演示 */}
        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Language Switcher Demo' : '语言切换器演示'}</CardTitle>
            <CardDescription>
              {isEnglish 
                ? 'Try different language switcher variants'
                : '尝试不同的语言切换器变体'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">{isEnglish ? 'Select Dropdown' : '下拉选项'}</h4>
                <LanguageSwitcher variant="select" size="md" />
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">{isEnglish ? 'Button Group' : '按钮组'}</h4>
                <LanguageSwitcher variant="buttons" size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 架构特性 */}
        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Architecture Features' : '架构特性'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {architectureFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{feature.title}</h4>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 示例页面 */}
        <Card>
          <CardHeader>
            <CardTitle>{isEnglish ? 'Example Pages' : '示例页面'}</CardTitle>
            <CardDescription>
              {isEnglish 
                ? 'Experience different internationalization approaches'
                : '体验不同的国际化方法'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {examplePages.map((page, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{page.name}</h4>
                      <Badge variant={page.type === 'hybrid' ? 'default' : 'secondary'}>
                        {page.type === 'hybrid' 
                          ? (isEnglish ? 'Query Param' : '查询参数')
                          : (isEnglish ? 'Path-based' : '路径前缀')
                        }
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{page.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate(page.route, page.type)}
                    className="ml-4"
                  >
                    {isEnglish ? 'Visit' : '访问'}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 技术说明 */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">
              {isEnglish ? 'Technical Implementation' : '技术实现'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong>{isEnglish ? 'Professional Pages:' : '专业页面：'}</strong>
              <code className="ml-2 bg-background px-2 py-0.5 rounded">/bazi, /en/bazi, /ja/bazi</code>
              <p className="text-muted-foreground mt-1">
                {isEnglish 
                  ? 'Path-based structure for SEO optimization and professional features'
                  : '路径结构用于SEO优化和专业功能'
                }
              </p>
            </div>
            <div>
              <strong>{isEnglish ? 'Auxiliary Pages:' : '辅助页面：'}</strong>
              <code className="ml-2 bg-background px-2 py-0.5 rounded">/settings?lang=zh-TW</code>
              <p className="text-muted-foreground mt-1">
                {isEnglish 
                  ? 'Query parameter approach for easier maintenance and more language variants'
                  : '查询参数方法便于维护和支持更多语言变体'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </HybridLanguageLayout>
  );
}