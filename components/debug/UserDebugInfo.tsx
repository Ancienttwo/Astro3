'use client';

import { useState, useEffect } from 'react';
import { getCurrentUnifiedUser } from '@/lib/auth';
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager';

// 调试组件 - 显示当前用户状态
export default function UserDebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkUserState = async () => {
      try {
        // 检查localStorage数据
        const storedUser = localStorage.getItem('current_user');
        const walletConnectAuth = localStorage.getItem('walletconnect_auth');
        
        // 检查Web3会话恢复
        const web3User = await supabaseSessionManager.restoreWeb3Session();
        
        // 检查统一用户信息
        const unifiedUser = await getCurrentUnifiedUser();
        
        // 检查Supabase session
        const currentSession = await supabaseSessionManager.getCurrentSession();

        setDebugInfo({
          localStorage: {
            current_user: storedUser ? JSON.parse(storedUser) : null,
            walletconnect_auth: walletConnectAuth ? JSON.parse(walletConnectAuth) : null,
          },
          web3User,
          unifiedUser,
          supabaseSession: currentSession ? {
            user_id: currentSession.user.id,
            email: currentSession.user.email,
            expires_at: new Date(currentSession.expires_at! * 1000).toLocaleString(),
            user_metadata: currentSession.user.user_metadata
          } : null,
          isWeb3Detected: unifiedUser?.email?.endsWith('@web3.local') || 
                          unifiedUser?.email?.endsWith('@web3.astrozi.app') || 
                          unifiedUser?.auth_type === 'web3' || 
                          (unifiedUser?.wallet_address && (
                            unifiedUser?.email?.includes('@web3.local') || 
                            unifiedUser?.email?.includes('@web3.astrozi.app')
                          ))
        });
      } catch (error) {
        setDebugInfo({ error: error.message });
      }
    };

    checkUserState();
  }, []);

  // 只在开发环境显示
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
      >
        Debug User {isVisible ? '🔽' : '🔼'}
      </button>
      
      {isVisible && (
        <div className="mt-2 bg-black text-green-400 p-4 rounded max-w-md max-h-96 overflow-auto text-xs font-mono">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}