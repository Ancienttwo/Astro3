'use client';

/**
 * Privy Context Provider
 * Wraps the application with Privy authentication context
 * Provides hooks and utilities for Web3 authentication
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PrivyProvider, usePrivy, useWallets, User as PrivyUser } from '@privy-io/react-auth';
import { privyConfig, PRIVY_APP_ID, formatWalletAddress } from '@/lib/privy-config';
import { toast } from 'sonner';
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager';

// Extended user type with additional fields
export interface ExtendedUser extends PrivyUser {
  supabaseJwt?: string;
  credits?: number;
  isPremium?: boolean;
  lastSignIn?: string;
}

// Authentication context type
interface AuthContextType {
  // User state
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Wallet state
  walletAddress: string | null;
  chainId: number | null;
  isWalletConnected: boolean;
  
  // Authentication methods
  login: () => Promise<void>;
  logout: () => Promise<void>;
  linkWallet: () => Promise<void>;
  unlinkWallet: (address: string) => Promise<void>;
  
  // Utility methods
  signMessage: (message: string) => Promise<string | null>;
  switchChain: (chainId: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  getSupabaseToken: () => Promise<string | null>;
}

// Create authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Internal authentication provider component
 */
function InternalAuthProvider({ children }: { children: React.ReactNode }) {
  const {
    authenticated,
    ready,
    user: privyUser,
    login: privyLogin,
    logout: privyLogout,
    linkWallet: privyLinkWallet,
    unlinkWallet: privyUnlinkWallet,
    signMessage: privySignMessage,
  } = usePrivy();
  
  const { wallets, ready: walletsReady } = useWallets();
  
  // Local state
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [supabaseJwt, setSupabaseJwt] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  // Derived state
  const activeWallet = wallets.find(w => w.connected);
  const walletAddress = activeWallet?.address || null;
  const chainId = activeWallet?.chainId || null;
  const isWalletConnected = !!activeWallet;
  const isLoading = !ready || !walletsReady || isLoadingUser;

  const emailFromPrivy = (u: PrivyUser | null) => {
    if (!u) return null;
    const arr = (u as any)?.email?.addresses;
    if (Array.isArray(arr) && arr.length > 0) return arr[0];
    return (u as any)?.email ?? null;
  };
  
  /**
   * Sync Privy user with Supabase backend
   */
  const syncUserWithSupabase = async (privyUser: PrivyUser) => {
    try {
      setIsLoadingUser(true);
      
      // Get Privy access token
      const privyToken = await privyUser.getAccessToken();
      
      // Call our API to verify and create/update user in Supabase
      const response = await fetch('/api/auth/privy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privyToken,
          userId: privyUser.id,
          walletAddress: privyUser.wallet?.address,
          linkedAccounts: privyUser.linkedAccounts,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync with backend');
      }
      
      const data = await response.json();
      
      // Update local state with extended user data
      const extendedUser: ExtendedUser = {
        ...privyUser,
        supabaseJwt: data.jwt,
        credits: data.credits,
        isPremium: data.isPremium,
        lastSignIn: data.lastSignIn,
      };
      
      setUser(extendedUser);
      setSupabaseJwt(data.jwt);

      // 统一：写入 current_user 以便 API 客户端携带 X-Wallet-Address
      try {
        localStorage.setItem('current_user', JSON.stringify({
          id: (data.session?.user?.id || privyUser.id),
          email: data.session?.user?.email || emailFromPrivy(privyUser) || undefined,
          wallet_address: privyUser.wallet?.address || undefined,
          auth_method: 'privy',
          username: privyUser?.github?.username || privyUser?.twitter?.username || privyUser?.discord?.username || 'PrivyUser',
        }));
      } catch {}

      // If server returned a standard Supabase session, set it now
      if (data.session?.access_token) {
        try {
          await supabaseSessionManager.setStandardSession(data.session);
          console.log('✅ Supabase session set via Privy auth');
        } catch (e) {
          console.warn('Failed to set Supabase session from Privy auth:', e);
        }
      }
      
      // Store JWT in localStorage for persistence
      if (data.jwt) {
        localStorage.setItem('supabase_jwt', data.jwt);
      }
      
      return extendedUser;
    } catch (error) {
      console.error('Failed to sync user with Supabase:', error);
      toast.error('同步用户数据失败 / Failed to sync user data');
      throw error;
    } finally {
      setIsLoadingUser(false);
    }
  };
  
  /**
   * Handle login
   */
  const login = async () => {
    try {
      await privyLogin();
      toast.success('登录成功 / Login successful');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('登录失败 / Login failed');
      throw error;
    }
  };
  
  /**
   * Handle logout
   */
  const logout = async () => {
    try {
      // Clear local storage
      localStorage.removeItem('supabase_jwt');
      localStorage.removeItem('current_user');
      
      // Clear state
      setUser(null);
      setSupabaseJwt(null);
      
      // Logout from Privy
      await privyLogout();
      
      toast.success('已退出登录 / Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('退出登录失败 / Logout failed');
      throw error;
    }
  };
  
  /**
   * Link additional wallet
   */
  const linkWallet = async () => {
    try {
      await privyLinkWallet();
      toast.success('钱包已连接 / Wallet linked');
      
      // Refresh user data
      if (privyUser) {
        await syncUserWithSupabase(privyUser);
      }
    } catch (error) {
      console.error('Failed to link wallet:', error);
      toast.error('连接钱包失败 / Failed to link wallet');
      throw error;
    }
  };
  
  /**
   * Unlink wallet
   */
  const unlinkWallet = async (address: string) => {
    try {
      await privyUnlinkWallet(address);
      toast.success('钱包已断开 / Wallet unlinked');
      
      // Refresh user data
      if (privyUser) {
        await syncUserWithSupabase(privyUser);
      }
    } catch (error) {
      console.error('Failed to unlink wallet:', error);
      toast.error('断开钱包失败 / Failed to unlink wallet');
      throw error;
    }
  };
  
  /**
   * Sign message with wallet
   */
  const signMessage = async (message: string): Promise<string | null> => {
    try {
      if (!activeWallet) {
        throw new Error('No active wallet');
      }
      
      const signature = await privySignMessage(message);
      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      toast.error('签名失败 / Failed to sign message');
      return null;
    }
  };
  
  /**
   * Switch blockchain network
   */
  const switchChain = async (chainId: number) => {
    try {
      if (!activeWallet) {
        throw new Error('No active wallet');
      }
      
      await activeWallet.switchChain(chainId);
      toast.success('已切换网络 / Network switched');
    } catch (error) {
      console.error('Failed to switch chain:', error);
      toast.error('切换网络失败 / Failed to switch network');
      throw error;
    }
  };
  
  /**
   * Refresh user data
   */
  const refreshUser = async () => {
    if (privyUser) {
      await syncUserWithSupabase(privyUser);
    }
  };
  
  /**
   * Get Supabase JWT token
   */
  const getSupabaseToken = async (): Promise<string | null> => {
    // Try to get from state first
    if (supabaseJwt) {
      return supabaseJwt;
    }
    
    // Try to get from localStorage
    const storedJwt = localStorage.getItem('supabase_jwt');
    if (storedJwt) {
      setSupabaseJwt(storedJwt);
      return storedJwt;
    }
    
    // If authenticated, sync with backend to get new JWT
    if (privyUser) {
      const extendedUser = await syncUserWithSupabase(privyUser);
      return extendedUser.supabaseJwt || null;
    }
    
    return null;
  };
  
  // Sync user data when Privy user changes
  useEffect(() => {
    if (authenticated && privyUser) {
      syncUserWithSupabase(privyUser).catch(console.error);
    } else {
      setUser(null);
      setSupabaseJwt(null);
    }
  }, [authenticated, privyUser?.id]);
  
  // Auto-connect wallet on mount if previously connected
  useEffect(() => {
    if (walletsReady && wallets.length > 0 && !isWalletConnected) {
      const lastConnectedAddress = localStorage.getItem('last_connected_wallet');
      const wallet = wallets.find(w => w.address === lastConnectedAddress);
      
      if (wallet && !wallet.connected) {
        wallet.connect().catch(console.error);
      }
    }
  }, [walletsReady, wallets]);
  
  // Store last connected wallet
  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('last_connected_wallet', walletAddress);
    }
  }, [walletAddress]);
  
  const contextValue: AuthContextType = {
    user,
    isAuthenticated: authenticated,
    isLoading,
    walletAddress,
    chainId,
    isWalletConnected,
    login,
    logout,
    linkWallet,
    unlinkWallet,
    signMessage,
    switchChain,
    refreshUser,
    getSupabaseToken,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Main Privy provider component
 * Wraps the app with Privy SDK provider
 */
const PRIVY_WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ||
  '';

const BSC_CHAIN = {
  id: 56,
  network: 'bsc',
  name: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed.binance.org'] },
    public: { http: ['https://bsc-dataseed.binance.org'] },
  },
  blockExplorers: {
    bscscan: { name: 'BscScan', url: 'https://bscscan.com' },
    default: { name: 'BscScan', url: 'https://bscscan.com' },
  },
} as const;

const PRIVY_LOGIN_METHODS = ['wallet', 'google', 'twitter', 'discord', 'github', 'apple'] as const;

export function PrivyAuthProvider({ children }: { children: React.ReactNode }) {
  if (!PRIVY_APP_ID) {
    console.error('Privy App ID is not configured');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h2>
          <p className="text-gray-600">Privy App ID is not configured. Please set NEXT_PUBLIC_PRIVY_APP_ID in your environment variables.</p>
        </div>
      </div>
    );
  }
  
  const privyProviderConfig = useMemo(
    () => ({
      appearance: privyConfig.appearance,
      loginMethods: [...PRIVY_LOGIN_METHODS],
      embeddedWallets: privyConfig.embeddedWallets,
      walletConnectCloudProjectId: PRIVY_WALLETCONNECT_PROJECT_ID || undefined,
      supportedChains: [BSC_CHAIN as any],
      defaultChain: BSC_CHAIN as any,
      mfa: privyConfig.mfa,
    }),
    [privyConfig.appearance, privyConfig.embeddedWallets, privyConfig.mfa]
  );

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={privyProviderConfig}
    >
      <InternalAuthProvider>
        {children}
      </InternalAuthProvider>
    </PrivyProvider>
  );
}

/**
 * Hook to use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within PrivyAuthProvider');
  }
  
  return context;
}

// Export additional Privy hooks for convenience
export { usePrivy, useWallets } from '@privy-io/react-auth';
