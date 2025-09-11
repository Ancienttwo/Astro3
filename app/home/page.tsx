"use client";
// @ts-expect-error next-dynamic-flag
export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Gift, ChevronRight, Bot, User, Calendar, TrendingUp, Compass, Share2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReferralCodeManager from '@/components/ReferralCodeManager';
import PromoCodeRedeemer from '@/components/PromoCodeRedeemer';
import { DailyCheckinCard } from '@/components/DailyCheckinCard';
import { useDailyCheckin } from '@/hooks/useDailyCheckin';
import { supabase } from '@/lib/supabase';
import { getCurrentUnifiedUser } from '@/lib/auth';
import { apiClient } from '@/lib/api-client';

import { AdaptiveLayout } from '@/components/layout/adaptive-layout';
import { APP_CONFIG, isFeatureEnabled } from '@/lib/config/app-config';
import { getCrossDomainAuthUrl } from '@/lib/config/deployment-config';
import type { UnifiedUser, UserProfile } from '@/types/user';

// 获取基于配置的功能卡片
const getFeatureCards = (isEnglish: boolean) => {
  const baseCards = {
    zh: [
      {
        id: 'daily-checkin',
        title: '每日签到',
        subtitle: '领取免费分析次数和AI对话',
        description: '每天签到获得福利，坚持有惊喜',
        icon: '📅',
        gradient: 'from-blue-400 to-cyan-500',
        route: 'checkin'
      },
      {
        id: 'bazi',
        title: 'BaZi Natal',
        subtitle: '探索命运密码', 
        description: '基于出生时间，解读人生格局',
        icon: '🎯',
        gradient: 'from-amber-400 to-orange-500',
        route: '/bazi',
        feature: 'bazi'
      },
      {
        id: 'ziwei',
        title: 'ZiWei Astrology',
        subtitle: '洞察命盘奥秘',
        description: '中华命理精髓，预测人生走向',
        icon: '🔮',
        gradient: 'from-purple-400 to-pink-500',
        route: '/ziwei',
        feature: 'ziwei'
      },
      {
        id: 'wiki',
        title: '命理百科',
        subtitle: '学习传统智慧',
        description: '易经、紫微、八字知识库',
        icon: '📚',
        gradient: 'from-indigo-400 to-purple-500',
        route: '/wiki'
      },
      {
        id: 'referral',
        title: '邀请好友',
        subtitle: '免费获得三次AI报告分析！',
        description: '分享链接，好友注册即可获得奖励',
        icon: '🎁',
        gradient: 'from-green-400 to-emerald-500',
        route: 'referral',
        feature: 'referral'
      },
      {
        id: 'premium',
        title: '会员专享',
        subtitle: '解锁全部功能',
        description: '深度分析，专业服务',
        icon: '⭐',
        gradient: 'from-yellow-400 to-amber-500',
        route: '/membership'
      }
    ],
    en: [
      {
        id: 'daily-checkin',
        title: 'Daily Check-in',
        subtitle: 'Get Free Analysis & AI Chat',
        description: 'Check in daily for rewards, persistence pays off',
        icon: '📅',
        gradient: 'from-blue-400 to-cyan-500',
        route: 'checkin'
      },
      {
        id: 'bazi',
        title: 'BaZi Natal',
        subtitle: 'Decode Your Destiny',
        description: 'Reveal life patterns through birth time analysis',
        icon: '🎯',
        gradient: 'from-amber-400 to-orange-500',
        route: '/en/bazi',
        feature: 'bazi'
      },
      {
        id: 'ziwei',
        title: 'ZiWei Astrology',
        subtitle: 'Ancient Chart Wisdom',
        description: 'Chinese astrology essence, predict life trends',
        icon: '🔮',
        gradient: 'from-purple-400 to-pink-500',
        route: '/en/ziwei',
        feature: 'ziwei'
      },
      {
        id: 'wiki',
        title: 'Knowledge Base',
        subtitle: 'Learn Ancient Wisdom',
        description: 'I-Ching, Ziwei, BaZi knowledge center',
        icon: '📚',
        gradient: 'from-indigo-400 to-purple-500',
        route: '/en/wiki'
      },
      {
        id: 'referral',
        title: 'Invite Friends',
        subtitle: 'Get 3 Free AI Analysis Reports!',
        description: 'Share link, friends register to get rewards',
        icon: '🎁',
        gradient: 'from-green-400 to-emerald-500',
        route: 'referral',
        feature: 'referral'
      },
      {
        id: 'premium',
        title: 'Premium Features',
        subtitle: 'Unlock Full Access',
        description: 'Deep analysis, professional service',
        icon: '⭐',
        gradient: 'from-yellow-400 to-amber-500',
        route: '/membership?lang=en'
      }
    ]
  };
  
  const cards = isEnglish ? baseCards.en : baseCards.zh;
  
  // 根据配置过滤功能卡片
  return cards.filter(card => {
    // 没有feature字段的卡片总是显示
    if (!card.feature) return true;
    
    // 检查功能是否启用
    if (card.feature === 'referral') {
      return isFeatureEnabled('referral');
    }
    
    if (card.feature === 'bazi') {
      return APP_CONFIG.features.analysis.bazi;
    }
    
    if (card.feature === 'ziwei') {
      return APP_CONFIG.features.analysis.ziwei;
    }
    
    return true;
  });
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');
  const isEnglish = langParam === 'en';
  const currentFeatureCards = useMemo(() => getFeatureCards(isEnglish), [isEnglish]);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [showCheckinDialog, setShowCheckinDialog] = useState(false);

  const { 
    canCheckinToday,
    checkinStatus, 
    performCheckin, 
    fetchCheckinStatus,
    getCheckinSummary,
    getNextConsecutiveReward
  } = useDailyCheckin();

  // 获取用户信息和profile - 优化为并行执行
  useEffect(() => {
    const getUser = async () => {
      try {
        // 使用统一认证系统获取用户，支持Web2和Web3
        const unifiedUser = await getCurrentUnifiedUser();
        setUser(unifiedUser);
        
        // 如果用户已登录，并行获取profile信息和签到状态
        if (unifiedUser) {
          // 并行执行多个操作
          const promises = [];
          
          // 获取access_token
          const sessionPromise = typeof window !== 'undefined' 
            ? supabase.auth.getSession()
            : Promise.resolve({ data: { session: null } });
          
          promises.push(sessionPromise);
          promises.push(fetchCheckinStatus());
          
          const [sessionResult] = await Promise.allSettled(promises);
          
          // 处理session结果
          if (sessionResult.status === 'fulfilled') {
            const { data: { session } } = sessionResult.value;
            const accessToken = session?.access_token;
            
            if (accessToken) {
              // 如果有access_token，获取profile信息
              try {
                const response = await apiClient.get('/api/user/profile');
                
                if (response?.success && response.data?.success && response.data.profile) {
                  setUserProfile(response.data.profile);
                }
              } catch (profileError) {
                console.error('获取profile失败:', profileError);
                // 设置默认profile
                setUserProfile({
                  nickname: unifiedUser.username || `用户${unifiedUser.id?.slice(-6) || ''}`,
                  email: unifiedUser.email
                });
              }
            } else {
              // Web3用户使用基本信息
              setUserProfile({
                nickname: unifiedUser.username || `Web3User${unifiedUser.wallet_address?.slice(-6) || ''}`,
                email: unifiedUser.email
              });
            }
          }
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };
    
    getUser();
  }, [fetchCheckinStatus]);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % currentFeatureCards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentFeatureCards.length]);

  // 导航处理
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleCardClick = (route: string) => {
    if (route === 'referral') {
      handleReferral();
    } else if (route === 'checkin') {
      handleCheckin();
    } else {
      router.push(route);
    }
  };

  // 处理邀请功能
  const handleReferral = () => {
    if (!user) {
      // 根据配置确定认证路由，支持跨域
      const crossDomainUrl = getCrossDomainAuthUrl('web2');
      if (crossDomainUrl && APP_CONFIG.mode === 'web3') {
        // Web3版本用户可以跳转到Web2域名进行传统登录
        window.location.href = crossDomainUrl;
        return;
      }
      
      const authRoute = APP_CONFIG.mode === 'web3' ? '/wallet-auth' : '/auth';
      router.push(isEnglish ? `/en${authRoute}` : authRoute);
      return;
    }
    // 已登录用户显示邀请弹窗
    setShowReferralDialog(true);
  };

  // 处理兑换码功能
  const handleRedeem = () => {
    if (!user) {
      // 根据配置确定认证路由，支持跨域
      const crossDomainUrl = getCrossDomainAuthUrl('web2');
      if (crossDomainUrl && APP_CONFIG.mode === 'web3') {
        // Web3版本用户可以跳转到Web2域名进行传统登录
        window.location.href = crossDomainUrl;
        return;
      }
      
      const authRoute = APP_CONFIG.mode === 'web3' ? '/wallet-auth' : '/auth';
      router.push(isEnglish ? `/en${authRoute}` : authRoute);
      return;
    }
    // 已登录用户显示兑换码弹窗
    setShowRedeemDialog(true);
  };



  // 签到处理 - 弹出签到对话框
  const handleCheckin = () => {
    setShowCheckinDialog(true);
  };

  // 获取签到数据
  const checkinSummary = getCheckinSummary();
  const nextReward = getNextConsecutiveReward();

  // 计算连续签到进度
  const consecutiveDays = checkinSummary.consecutiveDays;
  const progress7Days = Math.min(consecutiveDays / 7, 1) * 100;
  const progress30Days = Math.min(consecutiveDays / 30, 1) * 100;
  const daysTo7 = Math.max(0, 7 - consecutiveDays);
  const daysTo30 = Math.max(0, 30 - consecutiveDays);

  return (
    <AdaptiveLayout 
      title={isEnglish ? 'Welcome to AstroZi' : '欢迎来到星玺世界'}
      description={isEnglish ? 'Discover your destiny through ancient wisdom' : '通过古老智慧探索您的命运'}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <div className="px-4 py-4 space-y-6 max-w-7xl mx-auto">
        {/* 滚动卡片区域 */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
            >
              {currentFeatureCards.map((card, index) => (
                <div
                  key={card.id}
                  className="w-full flex-shrink-0"
                  onClick={() => handleCardClick(card.route)}
                >
                  <Card className={`bg-gradient-to-r ${card.gradient} border-0 cursor-pointer hover:scale-[1.02] transition-transform`}>
                    <CardContent className="p-6 text-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-4xl">{card.icon}</div>
                        <ChevronRight className="w-6 h-6 opacity-70" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{card.title}</h3>
                      <p className="text-lg opacity-90 mb-1">{card.subtitle}</p>
                      <p className="text-sm opacity-75">{card.description}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* 指示点 */}
          <div className="flex justify-center mt-4 space-x-2">
            {currentFeatureCards.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentCardIndex ? 'bg-purple-500' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentCardIndex(index)}
              />
            ))}
          </div>
        </div>


        {/* 打招呼和登录提醒区域 */}
        <Card className="border border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-4">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {isEnglish ? 'Hello' : '你好'}，{userProfile?.nickname || user?.username || user?.email?.split('@')[0] || (isEnglish ? 'User' : '用户')}！
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isEnglish ? 'Welcome back, continue exploring your destiny code' : '欢迎回来，继续探索您的命运密码'}
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <button 
                    onClick={handleCheckin}
                    className={`p-3 rounded-full transition-all duration-200 ${
                        canCheckinToday() 
                        ? 'bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-600 dark:text-green-400 hover:scale-105' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    }`}
                    title={canCheckinToday() ? (isEnglish ? 'Click to check in for rewards' : '点击签到获取奖励') : (isEnglish ? 'Checked in today' : '今日已签到')}
                  >
                    {canCheckinToday() ? (
                      <Gift className="w-6 h-6" />
                    ) : (
                      <Calendar className="w-6 h-6" />
                    )}
                  </button>
                  <span className="text-xs text-gray-500 mt-1">
                    {canCheckinToday() ? (isEnglish ? 'Check In' : '签到') : (isEnglish ? 'Checked' : '已签到')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isEnglish ? 'Welcome to AstroZi' : '欢迎来到星玺世界'}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {isEnglish ? 'Login to unlock full features and start your astrology journey' : '登录后解锁完整功能，开启您的命理之旅'}
                </p>
                <Button 
                  onClick={() => {
                    // 支持跨域认证
                    const crossDomainUrl = getCrossDomainAuthUrl('web2');
                    if (crossDomainUrl && APP_CONFIG.mode === 'web3') {
                      window.location.href = crossDomainUrl;
                      return;
                    }
                    
                    const authRoute = APP_CONFIG.mode === 'web3' ? '/wallet-auth' : '/auth';
                    handleNavigation(isEnglish ? `/en${authRoute}` : authRoute);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2"
                >
                  {isEnglish ? 'Login Now' : '立即登录'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 签到状态提示 */}
        {checkinStatus && getCheckinSummary().hasCheckedInToday && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-green-800 dark:text-green-200">{isEnglish ? 'Checked in today!' : '今日已签到！'}</h3>
                <p className="text-xs text-green-700 dark:text-green-300">{isEnglish ? 'Got free analysis credits and ChatBot conversations' : '获得免费分析次数和ChatBot对话次数'}</p>
              </div>
            </div>
          </div>
        )}

          {/* 签到和最新动态 2*1 布局 - 仅桌面端显示 */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 每日签到 */}
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <Gift className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-800 dark:text-green-200">
                        {isEnglish ? 'Daily Check-in' : '每日签到'}
                      </h3>
                      <p className="text-green-600 dark:text-green-400 text-sm">
                        {isEnglish ? 'Get free analysis credits' : '获得免费分析次数'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleCheckin}
                    disabled={!canCheckinToday()}
                    className={`px-6 py-3 rounded-lg transition-all ${
                      canCheckinToday() 
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {canCheckinToday() ? (isEnglish ? 'Check In Now' : '立即签到') : (isEnglish ? 'Checked In' : '已签到')}
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      {isEnglish ? 'Basic Reward' : '基础奖励'}
                    </span>
                    <span className="text-green-600 dark:text-green-400 text-sm">
                      {isEnglish ? '1 AI Analysis + 10 ChatBot' : '1次AI分析 + 10次ChatBot'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      {isEnglish ? '7 Days Streak' : '连续7天'}
                    </span>
                    <span className="text-green-600 dark:text-green-400 text-sm">
                      {isEnglish ? '+2 AI Analysis' : '额外2次AI分析'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      {isEnglish ? '30 Days Streak' : '连续30天'}
                    </span>
                    <span className="text-green-600 dark:text-green-400 text-sm">
                      {isEnglish ? '+5 AI Analysis' : '额外5次AI分析'}
                    </span>
                  </div>
                </div>
                
                {/* 连续签到进度条 */}
                <div className="mt-6 p-4 bg-white dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-green-700 dark:text-green-300 font-medium">
                      {isEnglish ? 'Check-in Streak' : '连续签到进度'}
                    </span>
                    <span className="text-green-600 dark:text-green-400 text-sm">
                      {consecutiveDays}{isEnglish ? ' days' : '天'}
                    </span>
                  </div>
                  
                  {/* 第一阶段进度条 (7天) */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {isEnglish ? '7-Day Streak Reward' : '连续7天奖励'}
                      </span>
                      <span className={`text-xs ${progress7Days >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                        {progress7Days >= 100 ? (isEnglish ? 'Achieved' : '已达成') : (isEnglish ? `${daysTo7} days left` : `还需${daysTo7}天`)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progress7Days}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 第二阶段进度条 (30天) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {isEnglish ? '30-Day Streak Reward' : '连续30天奖励'}
                      </span>
                      <span className={`text-xs ${progress30Days >= 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-500'}`}>
                        {progress30Days >= 100 ? (isEnglish ? 'Achieved' : '已达成') : (isEnglish ? `${daysTo30} days left` : `还需${daysTo30}天`)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress30Days >= 100 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-gray-400 to-gray-500'
                        }`}
                        style={{ width: `${progress30Days}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* 进度说明 */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {isEnglish ? 'Completed' : '已完成'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {isEnglish ? 'Incomplete' : '未完成'}
                      </span>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
          
            {/* 最新动态 */}
            <Card className="border border-gray-200 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">最新动态</h3>
                    <p className="text-gray-600 dark:text-slate-400 text-sm">了解平台最新功能</p>
                  </div>
                </div>
          
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">每日签到功能上线</p>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">完成签到获得免费分析次数</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <Bot className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">AI大师功能优化</p>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">更智能的命理分析助手</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                    <User className="w-5 h-5 text-amber-500" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">会员体系升级</p>
                      <p className="text-gray-600 dark:text-slate-400 text-sm">更多专业功能等您体验</p>
                    </div>
                  </div>
                </div>
            </CardContent>
          </Card>
          </div>

          {/* 移动端功能网格 - 10个方形功能（原始AstroAPP设计）*/}
          <div className="block md:hidden">
            <div className="grid grid-cols-5 gap-3">
              {/* 第一行 */}
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/charts')}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">🌟</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">我的</span>
                </CardContent>
              </Card>
              
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/bazi')}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">🎯</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">八字</span>
                </CardContent>
              </Card>
              
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/ziwei')}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">🔮</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">紫微</span>
                </CardContent>
              </Card>
              
              {APP_CONFIG.features.analysis.yijing && (
                <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/wiki/yijing/sixtyfour-gua')}>
                  <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                    <div className="text-lg mb-1">☯️</div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">易经</span>
                  </CardContent>
                </Card>
              )}
              
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/membership')}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">⭐</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">会员</span>
                </CardContent>
              </Card>
              
              {/* 第二行 */}
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/calendar')}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">📅</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">万年历</span>
                </CardContent>
              </Card>
              
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/wiki')}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">📚</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">百科</span>
                </CardContent>
              </Card>
              
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/subscription')}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">💳</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">订阅</span>
                </CardContent>
              </Card>
              
              {isFeatureEnabled('referral') && (
                <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={handleReferral}>
                  <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                    <div className="text-lg mb-1">👥</div>
                    <span className="text-xs text-gray-700 dark:text-gray-300">邀请</span>
                  </CardContent>
                </Card>
              )}
              
              <Card className="aspect-square border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow" onClick={handleRedeem}>
                <CardContent className="p-2 text-center h-full flex flex-col justify-center">
                  <div className="text-lg mb-1">🎁</div>
                  <span className="text-xs text-gray-700 dark:text-gray-300">兑换码</span>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 桌面端快速功能区域 - 与移动端一致的10个按钮 */}
          <Card className="hidden md:block border border-gray-200 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" />
                快速功能
              </h3>
              
              {/* 桌面端功能网格 - 与移动端一致 */}
              <div className="grid grid-cols-5 gap-4 mb-6">
                {/* 第一行 */}
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleNavigation('/charts')}
                >
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">🌟</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">我的</span>
                </div>
                
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleNavigation('/bazi')}
                >
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">🎯</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">八字</span>
                </div>
                
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleNavigation('/ziwei')}
                >
                  <div className="w-12 h-12 bg-pink-100 dark:bg-pink-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">🔮</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">紫微</span>
                </div>
                
                {APP_CONFIG.features.analysis.yijing && (
                  <div 
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => handleNavigation('/wiki/yijing/sixtyfour-gua')}
                  >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-800/50 rounded-lg flex items-center justify-center mb-2">
                      <div className="text-lg">☯️</div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center">易经</span>
                  </div>
                )}
                
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleNavigation('/membership')}
                >
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">⭐</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">会员</span>
                </div>
                
                {/* 第二行 */}
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleNavigation('/calendar')}
                >
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">📅</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">万年历</span>
                </div>
                
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleNavigation('/wiki')}
                >
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">📚</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">百科</span>
                </div>
                
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => handleNavigation('/subscription')}
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">💳</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">订阅</span>
                </div>
                
                {isFeatureEnabled('referral') && (
                  <div 
                    className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={handleReferral}
                  >
                    <div className="w-12 h-12 bg-teal-100 dark:bg-teal-800/50 rounded-lg flex items-center justify-center mb-2">
                      <div className="text-lg">👥</div>
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 text-center">邀请</span>
                  </div>
                )}
                
                <div 
                  className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={handleRedeem}
                >
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-800/50 rounded-lg flex items-center justify-center mb-2">
                    <div className="text-lg">🎁</div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400 text-center">兑换码</span>
                </div>
              </div>
              
              {/* 快速入门说明 */}
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  点击上方图标快速访问相应功能，开启您的命理探索之旅
                </p>
              </div>
            </CardContent>
          </Card>
          

        </div>
      </div>

      {/* 邀请功能弹窗 */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-600" />
              {isEnglish ? 'Invite Friends' : '邀请好友'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <ReferralCodeManager />
          </div>
        </DialogContent>
      </Dialog>

      {/* 签到弹窗 */}
      <Dialog open={showCheckinDialog} onOpenChange={setShowCheckinDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              {isEnglish ? 'Daily Check-in' : '每日签到'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <DailyCheckinCard onCheckinSuccess={() => {
              // 签到成功后可以做一些处理
              setTimeout(() => {
                setShowCheckinDialog(false);
              }, 2000);
            }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* 兑换码弹窗 */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>兑换码</DialogTitle>
          </DialogHeader>
          <PromoCodeRedeemer />
        </DialogContent>
      </Dialog>

    </AdaptiveLayout>
  );
} 
