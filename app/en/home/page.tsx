'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { Gift, ChevronRight, BookOpen, FileText, Target, Bot, Sparkles, Calendar, TrendingUp, Home, Book, Menu, Compass, SunMoon, X, Star, Share2, Users, BarChart3, CheckCircle, ArrowRight, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ReferralCodeManager from '@/components/ReferralCodeManager';
import PromoCodeRedeemer from '@/components/PromoCodeRedeemer';
import { getCurrentUnifiedUser } from '@/lib/auth';
import type { UserProfileResponse } from '@/types/fatebook';
import Logo from '@/components/Logo';
import UnifiedCheckinWelcome from '@/components/UnifiedCheckinWelcome';
import { supabase } from '@/lib/supabase';

import EnglishLayout from '@/components/EnglishLayout';
import { APP_CONFIG, isFeatureEnabled } from '@/lib/config/app-config';
import { apiClient } from '@/lib/api-client'

// 获取基于配置的英文功能卡片
const getEnglishFeatureCards = () => {
  const baseCards = [
    {
      id: 'daily-checkin',
      title: 'Daily Check-in',
      subtitle: 'Get Free Analysis & AI Chat',
      description: 'Check in daily for rewards, persistence pays off',
      icon: Calendar,
      gradient: 'from-blue-400 to-cyan-500',
      route: 'checkin'
    },
    {
      id: 'bazi',
      title: 'BaZi Natal',
      subtitle: 'Decode Your Destiny',
      description: 'Reveal life patterns through birth time analysis',
      icon: Target,
      gradient: 'from-amber-400 to-orange-500',
      route: '/en/bazi',
      feature: 'bazi'
    },
    {
      id: 'ziwei',
      title: 'ZiWei Astrology',
      subtitle: 'Ancient Chart Wisdom',
      description: 'Chinese astrology essence, predict life trends',
      icon: Compass,
      gradient: 'from-purple-400 to-pink-500',
      route: '/en/ziwei',
      feature: 'ziwei'
    },
    {
      id: 'ai-chat',
      title: 'AI Assistant',
      subtitle: 'Smart Astrology Chat',
      description: 'Get answers anytime, anywhere',
      icon: Bot,
      gradient: 'from-blue-400 to-cyan-500',
      route: '/en/chatbot',
      feature: 'chatbot'
    },
    {
      id: 'wiki',
      title: 'Knowledge Base',
      subtitle: 'Learn & Discover',
      description: 'Explore ancient wisdom and astrology guides',
      icon: BookOpen,
      gradient: 'from-indigo-400 to-purple-500',
      route: '/en/wiki'
    },
    {
      id: 'referral',
      title: 'Invite Benefits',
      subtitle: 'Earn Together',
      description: 'Invite friends and unlock exclusive rewards',
      icon: Users,
      gradient: 'from-green-400 to-emerald-500',
      route: '#referral',
      feature: 'referral'
    },
    {
      id: 'premium',
      title: 'Premium Features',
      subtitle: 'Unlock Full Access',
      description: 'Deep analysis, professional service',
      icon: Star,
      gradient: 'from-yellow-400 to-amber-500',
      route: '/membership?lang=en'
    }
  ];
  
  // 根据配置过滤功能卡片
  return baseCards.filter(card => {
    // 没有feature字段的卡片总是显示
    if (!card.feature) return true;
    
    // 检查功能是否启用
    if (card.feature === 'referral') {
      return isFeatureEnabled('referral');
    }
    
    if (card.feature === 'chatbot') {
      return isFeatureEnabled('chatbot');
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

export default function EnglishHomePage() {
  const router = useRouter();
  const featureCards = useMemo(() => getEnglishFeatureCards(), []);
  
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [isWeb3User, setIsWeb3User] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);


  // Get user info and profile with retry logic for Web3 users
  useEffect(() => {
    const getUser = async (retryCount = 0) => {
      if (retryCount === 0) {
        setIsLoadingUser(true);
      }
      
      try {
        // Use unified auth system to get user (now supports virtual email)
        const unifiedUser = await getCurrentUnifiedUser();
        setUser(unifiedUser);
        
        // Detect if it's a Web3 user - by specific Web3 email patterns or auth_type
        const web3User = unifiedUser?.email?.endsWith('@web3.local') || 
                        unifiedUser?.email?.endsWith('@web3.astrozi.app') || 
                        unifiedUser?.auth_type === 'web3' || 
                        (unifiedUser?.wallet_address && (unifiedUser?.email?.includes('@web3.local') || unifiedUser?.email?.includes('@web3.astrozi.app')));
        setIsWeb3User(web3User);
        
        console.log('🔍 User detection result:', {
          user: unifiedUser?.email,
          isWeb3: web3User,
          wallet: unifiedUser?.wallet_address,
          retry: retryCount
        });
        
        // If user is logged in, get profile info
        if (unifiedUser) {
          try {
            // For Web3 users, add a small delay to ensure session is ready
            if (web3User && retryCount === 0) {
              console.log('⏳ Web3用户首次加载，等待session完全就绪...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Get access_token, Web3 users may not have one
            let accessToken = null;
            if (typeof window !== 'undefined') {
              const { data: { session } } = await supabase.auth.getSession();
              accessToken = session?.access_token;
            }
            
            // If has access_token, get profile info
            if (accessToken) {
              const response = await apiClient.get<UserProfileResponse>('/api/user/profile');
              
              if (response.data?.success && response.data?.profile) {
                setUserProfile(response.data.profile);
              }
            } else {
              // Web3 users use basic info
            setUserProfile({
              nickname: unifiedUser.username || `Web3User${unifiedUser.wallet_address?.slice(-6) || ''}`,
              email: unifiedUser.email
            });
          }
          
          } catch (profileError) {
            console.error('Failed to get user profile:', profileError);
            
            // If it's a Web3 user and session error, try retry
            if (web3User && retryCount < 2 && profileError.message?.includes('Session')) {
              console.log(`🔄 Web3用户session错误，${retryCount + 1}秒后重试 (${retryCount + 1}/2)`);
              setTimeout(() => getUser(retryCount + 1), (retryCount + 1) * 1000);
              return;
            }
            
            // For Web3 users, still set basic profile even if API fails
            if (web3User && unifiedUser) {
              setUserProfile({
                nickname: unifiedUser.username || `Web3User${unifiedUser.wallet_address?.slice(-6) || ''}`,
                email: unifiedUser.email
              });
            }
          }
        }
        
        // Successfully got user info, set loading to false
        setIsLoadingUser(false);
        
      } catch (userError) {
        console.error('Failed to get user info:', userError);
        
        // Retry logic for initial user fetching
        if (retryCount < 1) {
          console.log('🔄 获取用户信息失败，1秒后重试...');
          setTimeout(() => getUser(retryCount + 1), 1000);
          return; // Don't set loading to false yet
        }
        
        // All retries failed, set loading to false
        setIsLoadingUser(false);
      }
    };
    
    getUser();
  }, []);

  // Auto-carousel feature removed, now using static card grid layout

  // Navigation handling
  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleCardClick = (route: string) => {
    if (route === '#referral') {
      handleReferral();
    } else {
      router.push(route);
    }
  };

  // Handle referral function
  const handleReferral = () => {
    if (!user) {
      // 根据配置确定认证路由
      const authRoute = '/en/login';
      router.push(authRoute);
      return;
    }
    // Logged in users show referral dialog
    setShowReferralDialog(true);
  };

  // Handle redeem function
  const handleRedeem = () => {
    if (!user) {
      // 根据配置确定认证路由
      const authRoute = '/en/login';
      router.push(authRoute);
      return;
    }
    // Logged in users show redeem dialog
    setShowRedeemDialog(true);
  };


  return (
    <EnglishLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl">

          {/* Loading State */}
          {isLoadingUser && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 px-4 py-2 rounded-lg shadow-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-600 border-t-transparent"></div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Loading user information...
                </span>
              </div>
            </div>
          )}

          {/* Welcome Section */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex justify-center items-center mb-4 sm:mb-6">
              <Logo className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 dark:text-amber-400" />
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
              Welcome to AstroZi
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
              Discover your life's hidden patterns through ancient wisdom and modern AI technology
            </p>
          </div>

          {/* Web3 Onboarding Guide - Only show for Web3 users in Web3 mode */}
          {isWeb3User && APP_CONFIG.mode === 'web3' && (
            <div className="mb-8 sm:mb-12">
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent mb-3 sm:mb-4 px-2">
                  🎉 Welcome Web3 Explorer!
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 px-4">
                  Get started with your exclusive Web3 benefits and unlock your destiny
                </p>
              </div>

              {/* Onboarding Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Step 1: Daily Check-in */}
                <Card className="relative overflow-hidden border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    STEP 1
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Daily Check-in
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
                      Sign in daily to earn free AI analysis credits and accumulate points for future airdrops
                    </p>
                    <div className="flex items-center text-green-600 dark:text-green-400 text-xs sm:text-sm font-medium">
                      <Zap className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>Free Credits Daily</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Chart Analysis */}
                <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
                  <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    STEP 2
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Decode Your Destiny
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
                      Create your birth chart to reveal your life's hidden patterns and unlock your destiny code
                    </p>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">
                      <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>Life Patterns Revealed</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 3: Invite Friends */}
                <Card className="relative overflow-hidden border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
                  <div className="absolute top-0 right-0 bg-orange-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    STEP 3
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Invite & Earn
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
                      Invite friends to join and complete check-ins. Both you and your friend get 3 free reports!
                    </p>
                    <div className="flex items-center text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium">
                      <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>3 Reports Each</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Step 4: Learn Knowledge */}
                <Card className="relative overflow-hidden border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                    STEP 4
                  </div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                      <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                      Master Wisdom
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 leading-relaxed">
                      Explore our comprehensive wiki to learn ancient astrology knowledge and deepen your understanding
                    </p>
                    <div className="flex items-center text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-medium">
                      <Book className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      <span>Ancient Wisdom</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Start Actions */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700 shadow-lg">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
                  🚀 Ready to Start Your Journey?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <Button
                    onClick={() => {
                      // Trigger check-in functionality - scroll to check-in section
                      const checkinSection = document.querySelector('[data-checkin-section]');
                      if (checkinSection) {
                        checkinSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        // Fallback: refresh page to show check-in section
                        window.location.reload();
                      }
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Check In Now
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/en/ziwei')}
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold py-3 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    <Compass className="w-5 h-5 mr-2" />
                    Create Chart
                  </Button>
                  
                  <Button
                    onClick={handleReferral}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Invite Friends
                  </Button>
                  
                  <Button
                    onClick={() => router.push('/en/wiki')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 sm:py-3 px-3 sm:px-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Learn Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {featureCards.map((card) => (
              <Card 
                key={card.id}
                className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl dark:bg-slate-800 dark:border-slate-700"
                onClick={() => handleCardClick(card.route)}
              >
                <CardContent className="p-4 sm:p-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg`}>
                    <card.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold mb-2 sm:mb-3">
                    {card.subtitle}
                  </p>
                  
                  <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4">
                    {card.description}
                  </p>
                  
                  <div className="flex items-center text-purple-600 dark:text-purple-400 text-xs sm:text-sm font-medium">
                    <span>Get Started</span>
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Unified Check-in Welcome Section */}
          <div data-checkin-section>
            <UnifiedCheckinWelcome 
              user={user}
              isWeb3User={isWeb3User}
              userProfile={userProfile}
            />
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Button
              variant="outline"
              onClick={() => handleNavigation('/charts?lang=en')}
              className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">My Charts</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleNavigation('/en/wiki')}
              className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Knowledge</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleReferral}
              className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <Share2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Invite Friends</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRedeem}
              className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 dark:border-slate-600 dark:hover:bg-slate-700"
            >
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm">Redeem Code</span>
            </Button>
          </div>

        </div>
      </div>

      {/* Referral Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Invite Friends
            </DialogTitle>
          </DialogHeader>
          <ReferralCodeManager />
        </DialogContent>
      </Dialog>

      {/* Redeem Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Redeem Code
            </DialogTitle>
          </DialogHeader>
          <PromoCodeRedeemer />
        </DialogContent>
      </Dialog>
    </EnglishLayout>
  );
} 
