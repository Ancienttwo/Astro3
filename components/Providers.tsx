"use client";

import { ReactNode, useEffect } from "react";
// import { RecordsProvider } from "@/contexts/RecordsContext"; // 已迁移到新架构
import { FateBookProvider } from "@/contexts/FateBookContext";
// 移除旧的语言提供者，使用新的 language-manager.ts 系统
import { PaidUserProvider } from "@/contexts/PaidUserContext";
import { setUserContext } from "@/lib/config/feature-flags";
import { supabase } from "@/lib/supabase";
import { initializeLanguage } from "@/lib/i18n/language-manager";

export function Providers({ children }: { children: ReactNode }) {
  // 初始化功能开关的用户上下文
  useEffect(() => {
    const initializeUserContext = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserContext({
            id: user.id,
            email: user.email,
            role: user.user_metadata?.role || 'user'
          });
        }
      } catch (error) {
        console.error('Failed to initialize user context for feature flags:', error);
      }
    };

    initializeUserContext();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserContext({
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'user'
        });
      } else {
        setUserContext({});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 初始化语言管理系统
  useEffect(() => {
    initializeLanguage();
  }, []);

  return (
    <PaidUserProvider>
      <FateBookProvider>
        {children}
      </FateBookProvider>
    </PaidUserProvider>
  );
} 