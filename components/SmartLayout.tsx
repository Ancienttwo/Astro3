'use client';

import { useState, useEffect } from 'react';
import { getCurrentUnifiedUser } from '@/lib/auth';
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager';
import Web3Layout from '@/components/Web3Layout';
import EnglishLayout from '@/components/EnglishLayout';
import UserDebugInfo from '@/components/debug/UserDebugInfo';

interface SmartLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  forceLayout?: 'web3' | 'english'; // 强制使用某种布局
}

export default function SmartLayout({ 
  children, 
  showNavigation = true, 
  forceLayout 
}: SmartLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [isWeb3User, setIsWeb3User] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectUserType = async () => {
      try {
        setIsLoading(true);
        
        // 如果强制指定布局，直接返回
        if (forceLayout) {
          setIsWeb3User(forceLayout === 'web3');
          setIsLoading(false);
          return;
        }

        // 首先尝试恢复 Web3 会话
        const web3User = await supabaseSessionManager.restoreWeb3Session();
        
        if (web3User) {
          setUser(web3User);
          setIsWeb3User(true);
          setIsLoading(false);
          return;
        }

        // 然后尝试获取统一用户信息
        const unifiedUser = await getCurrentUnifiedUser();
        
        if (unifiedUser) {
          setUser(unifiedUser);
          
          // 检测是否为 Web3 用户
          const isWeb3 = unifiedUser?.email?.endsWith('@web3.local') || 
                         unifiedUser?.email?.endsWith('@web3.astrozi.app') || 
                         unifiedUser?.auth_type === 'web3' || 
                         (unifiedUser?.wallet_address && (
                           unifiedUser?.email?.includes('@web3.local') || 
                           unifiedUser?.email?.includes('@web3.astrozi.app')
                         ));
          
          setIsWeb3User(isWeb3);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to detect user type:', error);
        setIsWeb3User(false);
        setIsLoading(false);
      }
    };

    detectUserType();
  }, [forceLayout]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F8F9FA] dark:from-[#1A2242] dark:via-[#252D47] dark:to-[#1A2242] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Loading...</p>
        </div>
      </div>
    );
  }

  // 根据用户类型选择布局
  if (isWeb3User) {
    return (
      <Web3Layout user={user} showNavigation={showNavigation}>
        {children}
        <UserDebugInfo />
      </Web3Layout>
    );
  }

  return (
    <EnglishLayout showNavigation={showNavigation}>
      {children}
      <UserDebugInfo />
    </EnglishLayout>
  );
}