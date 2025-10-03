'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Crown,
  CreditCard,
  Palette,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Mail,
  Settings as SettingsIcon,
  Shield,
  AlertTriangle
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import HybridLanguageLayout from '@/components/layout/HybridLanguageLayout';
import { useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/lib/api-client';

type SupportedLanguage = 'zh' | 'en' | 'ja';

// 🎯 类型定义
interface SettingsItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  category: 'account' | 'services' | 'support' | 'system';
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface UserInfo {
  id: string;
  email: string;
  nickname?: string;
  profile_complete?: boolean;
  membership_level?: 'free' | 'premium' | 'vip';
}

export default function HybridSettingsPage() {
  const router = useRouter();
  const currentLocale = useLocale() as SupportedLanguage;
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // 🎨 设置项配置 - 多语言支持
  const getSettingsCategories = () => {
    const isEnglish = currentLocale === 'en';
    
    return [
      {
        title: isEnglish ? 'Account Management' : '账户管理',
        category: 'account' as const,
        items: [
          {
            id: 'profile',
            name: isEnglish ? 'My Profile' : '我的档案',
            href: '/settings-hybrid/profile',
            icon: User,
            description: isEnglish ? 'Manage birth info and personal data' : '管理出生信息和个人资料',
            category: 'account' as const
          },
          {
            id: 'preferences',
            name: isEnglish ? 'Preferences' : '个人偏好',
            href: '/preferences-hybrid',
            icon: Palette,
            description: isEnglish ? 'Personalize your experience' : '个性化您的体验',
            category: 'account' as const
          }
        ]
      },
      {
        title: isEnglish ? 'Service & Subscription' : '服务与订阅',
        category: 'services' as const,
        items: [
          {
            id: 'membership',
            name: isEnglish ? 'Membership Center' : '会员中心',
            href: '/membership-hybrid',
            icon: Crown,
            description: isEnglish ? 'View membership status and benefits' : '查看会员状态和权益',
            category: 'services' as const,
            badge: userInfo?.membership_level === 'free' 
              ? { text: isEnglish ? 'Free' : '免费版', variant: 'secondary' as const }
              : { text: isEnglish ? 'Member' : '会员', variant: 'default' as const }
          },
          {
            id: 'subscription',
            name: isEnglish ? 'Subscription Service' : '订阅服务',
            href: '/subscription-hybrid',
            icon: CreditCard,
            description: isEnglish ? 'Manage your subscription' : '管理您的订阅',
            category: 'services' as const
          }
        ]
      },
      {
        title: isEnglish ? 'Help & Support' : '帮助与支持',
        category: 'support' as const,
        items: [
          {
            id: 'help',
            name: isEnglish ? 'Help Center' : '帮助中心',
            href: '/help-center-hybrid',
            icon: HelpCircle,
            description: isEnglish ? 'FAQ and guides' : '常见问题和指南',
            category: 'support' as const
          }
        ]
      },
      {
        title: isEnglish ? 'System Settings' : '系统设置',
        category: 'system' as const,
        items: [
          {
            id: 'logout',
            name: isEnglish ? 'Sign Out' : '退出登录',
            href: '#logout',
            icon: LogOut,
            description: isEnglish ? 'Securely sign out of your account' : '安全退出您的账户',
            category: 'system' as const
          }
        ]
      }
    ];
  };

  // 🔄 获取用户信息
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get('/api/user/profile');

        if (response.success) {
          const profileData = response.data?.profile || {};
          setUserInfo({
            id: profileData.id || 'unknown',
            email: profileData.email || '',
            nickname: profileData.nickname,
            profile_complete: profileData.profile_complete,
            membership_level: 'free'
          });
        } else {
          setUserInfo({
            id: 'unknown',
            email: '',
            membership_level: 'free'
          });
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUserInfo({
          id: 'unknown',
          email: '',
          membership_level: 'free'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 🎯 处理设置项点击
  const handleItemClick = async (item: SettingsItem) => {
    if (item.id === 'logout') {
      await handleLogout();
    } else if (item.href.startsWith('#')) {
      console.log('处理锚点:', item.href);
    } else {
      // next-intl handles routing automatically
      router.push(item.href);
    }
  };

  // 🚪 登出处理
  const handleLogout = async () => {
    const isEnglish = currentLocale === 'en';
    const confirmMessage = isEnglish ? 'Are you sure you want to sign out?' : '确定要退出登录吗？';
    
    if (!window.confirm(confirmMessage)) return;

    setLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('登出失败:', error);
        const errorMessage = isEnglish ? 'Sign out failed, please try again' : '登出失败，请重试';
        alert(errorMessage);
      } else {
        setUserInfo(null);
        router.push('/');
      }
    } catch (error) {
      console.error('登出过程中发生错误:', error);
      const errorMessage = isEnglish ? 'Sign out failed, please try again' : '登出失败，请重试';
      alert(errorMessage);
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    const loadingText = 'Loading...';
    return (
      <AuthGuard>
        <HybridLanguageLayout
          title={currentLocale === 'en' ? 'Settings' : '设置'}
          description={currentLocale === 'en' ? 'Manage your account and preferences' : '管理您的账户和偏好设置'}
        >
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
              <p className="text-muted-foreground">{loadingText}</p>
            </div>
          </div>
        </HybridLanguageLayout>
      </AuthGuard>
    );
  }

  const isEnglish = currentLocale === 'en';
  const settingsCategories = getSettingsCategories();

  return (
    <AuthGuard>
      <HybridLanguageLayout 
        title={isEnglish ? 'Settings' : '设置'}
        description={isEnglish ? 'Manage your account and preferences' : '管理您的账户和偏好设置'}
      >
        <div className="max-w-2xl mx-auto">
          {/* 用户信息卡片 */}
          {userInfo && (
            <Card className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-purple-600" />
                  {isEnglish ? 'Account Overview' : '账户概览'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* 基本信息 */}
                  <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {userInfo.nickname || (isEnglish ? 'Nickname not set' : '未设置昵称')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {userInfo.email}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant={userInfo.profile_complete ? "default" : "secondary"}
                      className={userInfo.profile_complete ? "bg-green-100 text-green-800 border-green-200" : ""}
                    >
                      {userInfo.profile_complete 
                        ? (isEnglish ? 'Active' : '已激活')
                        : (isEnglish ? 'Incomplete' : '待完善')
                      }
                    </Badge>
                  </div>

                  {/* 会员状态 */}
                  <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5 text-amber-500" />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {isEnglish ? 'Membership Level' : '会员等级'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {isEnglish ? 'Enjoy exclusive benefits' : '享受专属权益和服务'}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-white/50">
                      {userInfo.membership_level === 'free' 
                        ? (isEnglish ? 'Free' : '免费版')
                        : (isEnglish ? 'Member' : '会员')
                      }
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 档案完善提醒 */}
          {userInfo && !userInfo.profile_complete && (
            <Alert className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <strong>{isEnglish ? 'Reminder:' : '提醒：'}</strong>{' '}
                {isEnglish 
                  ? 'Your profile is incomplete. Complete your profile for more accurate analysis.'
                  : '您的档案尚未完善，完善档案信息后可享受更精准的分析服务。'
                }
                <Button
                  variant="link"
                  className="p-0 h-auto ml-1 text-amber-700 dark:text-amber-300 underline"
                  onClick={() => {
                    router.push('/settings-hybrid/profile');
                  }}
                >
                  {isEnglish ? 'Complete Profile' : '完善档案'}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* 设置分类 */}
          <div className="space-y-6">
            {settingsCategories.map((category) => (
              <div key={category.category}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                  {category.title}
                </h2>
                
                <div className="space-y-2">
                  {category.items.map((item) => {
                    const Icon = item.icon;
                    const isLogout = item.id === 'logout';
                    
                    return (
                      <Card 
                        key={item.id}
                        className={`cursor-pointer hover:shadow-sm transition-all duration-200 hover:bg-accent/5 border-gray-100 ${
                          isLogout ? 'hover:border-red-200 hover:bg-red-50/50' : ''
                        }`}
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-5 h-5 ${
                                isLogout ? 'text-red-500' : 'text-primary dark:text-yellow-400'
                              }`} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h3 className={`font-medium text-sm ${
                                    isLogout ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                                  }`}>
                                    {loggingOut && isLogout 
                                      ? (isEnglish ? 'Signing out...' : '正在退出...')
                                      : item.name
                                    }
                                  </h3>
                                  {item.badge && (
                                    <Badge variant={item.badge.variant} className="text-xs">
                                      {item.badge.text}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${
                              isLogout ? 'text-red-400' : 'text-muted-foreground'
                            }`} />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                {category.category !== 'system' && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>

          {/* 版本信息 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isEnglish ? 'AstroZi v1.0.0' : '星玺命理 v1.0.0'} | 
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-gray-500 dark:text-gray-400 ml-1"
                onClick={() => {
                  router.push('/help-center-hybrid');
                }}
              >
                {isEnglish ? 'Contact Support' : '联系客服'}
              </Button>
            </p>
          </div>
        </div>
      </HybridLanguageLayout>
    </AuthGuard>
  );
}