'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { getCurrentUnifiedUser } from '@/lib/auth';
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager';
import Web3Layout from '@/components/Web3Layout';
import ChatBotLayout from '@/components/ChatBotLayout';

interface SmartChatBotLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  input?: ReactNode;
  className?: string;
  title?: string;
}

export default function SmartChatBotLayout({ 
  children, 
  header, 
  input,
  className,
  title = "AI Intelligent Q&A"
}: SmartChatBotLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [isWeb3User, setIsWeb3User] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const detectUserType = async () => {
      try {
        setIsLoading(true);
        
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
        console.error('Failed to detect user type for chatbot:', error);
        setIsWeb3User(false);
        setIsLoading(false);
      }
    };

    detectUserType();
  }, []);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F8F9FA] dark:from-[#1A2242] dark:via-[#252D47] dark:to-[#1A2242] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#3D0B5B] dark:border-[#FBCB0A] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  // Web3 用户使用 Web3Layout，但内容保持聊天机器人的样式
  if (isWeb3User) {
    return (
      <Web3Layout user={user} showNavigation={true}>
        <div className="flex flex-col h-full">
          {/* 聊天机器人特有的头部 */}
          {header && (
            <div className="shrink-0 bg-[#FFFFFF] dark:bg-[#1A2242] border-b border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20">
              {header}
            </div>
          )}
          
          {/* 聊天内容区域 */}
          <div className={`flex-1 overflow-hidden ${className || ''}`}>
            {children}
          </div>
          
          {/* 聊天机器人特有的输入框 */}
          {input && (
            <div className="shrink-0 bg-[#FFFFFF] dark:bg-[#1A2242] border-t border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20">
              {input}
            </div>
          )}
        </div>
      </Web3Layout>
    );
  }

  // Web2 用户使用原有的 ChatBotLayout
  return (
    <ChatBotLayout 
      header={header}
      input={input}
      className={className}
      title={title}
    >
      {children}
    </ChatBotLayout>
  );
}