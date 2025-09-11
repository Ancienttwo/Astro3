/**
 * Privy Configuration
 * Central configuration for Privy SDK authentication
 * Supports wallet connections and social logins
 */

import { WalletWithMetadata } from '@privy-io/react-auth';

// Privy App Configuration
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';

// Validate configuration
if (typeof window !== 'undefined' && !PRIVY_APP_ID) {
  console.warn('⚠️ NEXT_PUBLIC_PRIVY_APP_ID is not set. Privy authentication will not work.');
}

// Supported chains configuration
export const SUPPORTED_CHAINS = [
  {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet',
    rpcUrl: `https://eth-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  },
  {
    id: 56,
    name: 'BSC',
    network: 'bsc',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
  },
  {
    id: 137,
    name: 'Polygon',
    network: 'polygon',
    rpcUrl: `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_KEY}`,
  },
];

// Default chain for the application
export const DEFAULT_CHAIN_ID = 56; // BSC as default

// Privy configuration object
export const privyConfig = {
  // App ID from Privy dashboard
  appId: PRIVY_APP_ID,
  
  // Appearance configuration
  appearance: {
    theme: 'light' as const,
    accentColor: '#8B5CF6', // Purple theme matching the app
    logo: '/logo_light.png',
    appName: 'AstroZi',
    appDescription: 'AI-Powered Chinese Astrology Assistant',
    
    // Custom styles
    styles: {
      modalBackground: '#ffffff',
      modalBorder: '1px solid #e5e7eb',
      modalBorderRadius: '16px',
      buttonBackground: '#8B5CF6',
      buttonText: '#ffffff',
      buttonBorderRadius: '8px',
    },
  },
  
  // Login methods configuration
  loginMethods: {
    // Wallet login methods
    wallet: {
      enabled: true,
      // Supported wallet types
      wallets: [
        'metamask',
        'walletconnect',
        'coinbase_wallet',
        'trust_wallet',
        'okx_wallet',
        'rainbow',
        'phantom',
        'rabby',
      ],
    },
    
    // Social login methods
    google: {
      enabled: true,
    },
    twitter: {
      enabled: true,
    },
    discord: {
      enabled: true,
    },
    github: {
      enabled: true,
    },
    apple: {
      enabled: true,
    },
    
    // Disable email login as per requirement
    email: {
      enabled: false,
    },
    sms: {
      enabled: false,
    },
  },
  
  // Embedded wallet configuration
  embeddedWallets: {
    createOnLogin: 'users-without-wallets', // Create embedded wallet for social logins
    noPromptOnSignature: false, // Always show signature prompts for security
    waitForTransactionConfirmation: true,
  },
  
  // Chain configuration
  defaultChain: DEFAULT_CHAIN_ID,
  supportedChains: SUPPORTED_CHAINS.map(chain => chain.id),
  
  // Additional configuration
  clientAnalyticsEnabled: true, // Enable analytics
  mfa: {
    enabled: true, // Enable multi-factor authentication
    methods: ['sms', 'totp'], // Supported MFA methods
  },
  
  // Legal and compliance
  termsAndConditionsUrl: '/terms',
  privacyPolicyUrl: '/privacy',
};

/**
 * Helper function to format wallet address
 */
export const formatWalletAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Helper function to get chain name by ID
 */
export const getChainName = (chainId: number): string => {
  const chain = SUPPORTED_CHAINS.find(c => c.id === chainId);
  return chain?.name || 'Unknown';
};

/**
 * Helper function to check if wallet is supported
 */
export const isWalletSupported = (wallet: WalletWithMetadata): boolean => {
  const supportedWalletTypes = privyConfig.loginMethods.wallet.wallets;
  return supportedWalletTypes.includes(wallet.walletClientType as any);
};

/**
 * Helper function to get wallet display name
 */
export const getWalletDisplayName = (walletType: string): string => {
  const walletNames: Record<string, string> = {
    metamask: 'MetaMask',
    walletconnect: 'WalletConnect',
    coinbase_wallet: 'Coinbase Wallet',
    trust_wallet: 'Trust Wallet',
    okx_wallet: 'OKX Wallet',
    rainbow: 'Rainbow',
    phantom: 'Phantom',
    rabby: 'Rabby',
  };
  
  return walletNames[walletType] || walletType;
};

/**
 * Helper function to get social provider display name
 */
export const getSocialProviderName = (provider: string): string => {
  const providerNames: Record<string, string> = {
    google: 'Google',
    twitter: 'Twitter',
    discord: 'Discord',
    github: 'GitHub',
    apple: 'Apple',
  };
  
  return providerNames[provider] || provider;
};

/**
 * Error messages for authentication
 */
export const AUTH_ERROR_MESSAGES = {
  WALLET_CONNECTION_FAILED: '钱包连接失败，请重试 / Wallet connection failed, please try again',
  SIGNATURE_REJECTED: '签名被拒绝 / Signature rejected',
  NETWORK_ERROR: '网络错误，请检查连接 / Network error, please check connection',
  UNSUPPORTED_CHAIN: '不支持的链 / Unsupported chain',
  SESSION_EXPIRED: '会话已过期，请重新登录 / Session expired, please login again',
  INVALID_TOKEN: '无效的认证令牌 / Invalid authentication token',
  USER_NOT_FOUND: '用户不存在 / User not found',
  SERVER_ERROR: '服务器错误，请稍后重试 / Server error, please try again later',
};

/**
 * Success messages for authentication
 */
export const AUTH_SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功 / Login successful',
  LOGOUT_SUCCESS: '已退出登录 / Logged out successfully',
  WALLET_CONNECTED: '钱包已连接 / Wallet connected',
  WALLET_DISCONNECTED: '钱包已断开 / Wallet disconnected',
};

export default privyConfig;
