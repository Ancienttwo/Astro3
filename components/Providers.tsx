"use client";

import { ReactNode, useEffect } from "react";
import type { Session } from "@supabase/supabase-js";
// import { RecordsProvider } from "@/contexts/RecordsContext"; // 已迁移到新架构
import { FateBookProvider } from "@/contexts/FateBookContext";
// 移除旧的语言提供者，使用新的 language-manager.ts 系统
import { PaidUserProvider } from "@/contexts/PaidUserContext";
import { setUserContext } from "@/lib/config/feature-flags";
import { supabase } from "@/lib/supabase";
import { initializeLanguage } from "@/lib/i18n/language-manager";
import { Web3Provider } from "@/lib/web3/providers/Web3Provider";
import dynamic from "next/dynamic";
const PrivyAuthProviderNoSSR = dynamic(
  () => import("@/contexts/PrivyContext").then(m => m.PrivyAuthProvider),
  { ssr: false }
);
import QueryProvider from "@/components/providers/QueryProvider";
import LanguageProvider from "@/lib/contexts/language-context";

export function Providers({ children }: { children: ReactNode }) {
  // 初始化功能开关的用户上下文
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const persistSupabaseToken = (session: Session | null) => {
      try {
        if (session?.access_token) {
          localStorage.setItem('supabase_jwt', session.access_token);
        } else {
          localStorage.removeItem('supabase_jwt');
        }
      } catch (storageError) {
        console.warn('Failed to persist Supabase token to localStorage:', storageError);
      }
    };

    const initializeUserContext = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        persistSupabaseToken(session ?? null);

        if (session?.user) {
          setUserContext({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || 'user'
          });
        } else {
          setUserContext({});
        }
      } catch (error) {
        console.error('Failed to initialize user context for feature flags:', error);
      }
    };

    initializeUserContext();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      persistSupabaseToken(session ?? null);

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
    <QueryProvider>
      <Web3Provider>
        <PrivyAuthProviderNoSSR>
          <LanguageProvider>
            <PaidUserProvider>
              <FateBookProvider>{children}</FateBookProvider>
            </PaidUserProvider>
          </LanguageProvider>
        </PrivyAuthProviderNoSSR>
      </Web3Provider>
    </QueryProvider>
  );
}
