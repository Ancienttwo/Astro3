/**
 * Privy Token Verification Service
 * Server-side verification of Privy authentication tokens
 */

import { PrivyClient } from '@privy-io/server-auth';
import { NextRequest } from 'next/server';

// Cache for Privy client instance
let privyClient: PrivyClient | null = null;

/**
 * Get or create Privy client instance
 */
function getPrivyClient(): PrivyClient {
  if (!privyClient) {
    const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
    const appSecret = process.env.PRIVY_APP_SECRET;
    
    if (!appId || !appSecret) {
      throw new Error('Privy configuration missing: NEXT_PUBLIC_PRIVY_APP_ID or PRIVY_APP_SECRET');
    }
    
    privyClient = new PrivyClient(appId, appSecret);
  }
  
  return privyClient;
}

/**
 * Verify Privy authentication token
 */
export async function verifyPrivyToken(token: string) {
  try {
    const privy = getPrivyClient();
    const verification = await privy.verifyAuthToken(token as any);
    return verification;
  } catch (error) {
    console.error('Privy token verification failed:', error);
    return null;
  }
}

/**
 * Extract Privy token from request
 */
export function getPrivyTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check X-Privy-Token header
  const privyHeader = request.headers.get('X-Privy-Token');
  if (privyHeader) {
    return privyHeader;
  }
  
  return null;
}

/**
 * Verify request authentication with Privy
 */
export async function verifyPrivyRequest(request: NextRequest) {
  const token = getPrivyTokenFromRequest(request);
  
  if (!token) {
    return {
      authenticated: false,
      error: 'No authentication token provided'
    };
  }
  
  const verification = await verifyPrivyToken(token);
  
  if (!verification) {
    return {
      authenticated: false,
      error: 'Invalid or expired token'
    };
  }
  
  return {
    authenticated: true,
    userId: (verification as any).userId || (verification as any).sub || null,
    claims: verification
  };
}

/**
 * Extract user information from Privy user object
 */
export function extractPrivyUserInfo(privyUser: any) {
  const userId = privyUser.id || privyUser.userId;
  
  // Extract email (different structures possible)
  let email = null;
  if (privyUser.email) {
    if (typeof privyUser.email === 'string') {
      email = privyUser.email;
    } else if (privyUser.email.address) {
      email = privyUser.email.address;
    } else if (Array.isArray(privyUser.email.addresses) && privyUser.email.addresses.length > 0) {
      email = privyUser.email.addresses[0];
    }
  }
  
  // Extract wallet address
  const walletAddress = privyUser.wallet?.address || null;
  
  // Extract social account info
  const socialAccounts = [];
  if (privyUser.google) {
    socialAccounts.push({
      provider: 'google',
      email: privyUser.google.email,
      name: privyUser.google.name
    });
  }
  if (privyUser.twitter) {
    socialAccounts.push({
      provider: 'twitter',
      username: privyUser.twitter.username,
      name: privyUser.twitter.name
    });
  }
  if (privyUser.discord) {
    socialAccounts.push({
      provider: 'discord',
      username: privyUser.discord.username,
      email: privyUser.discord.email
    });
  }
  if (privyUser.github) {
    socialAccounts.push({
      provider: 'github',
      username: privyUser.github.username,
      name: privyUser.github.name
    });
  }
  if (privyUser.apple) {
    socialAccounts.push({
      provider: 'apple',
      email: privyUser.apple.email
    });
  }
  
  // Generate username from available data
  let username = null;
  if (privyUser.google?.name) {
    username = privyUser.google.name;
  } else if (privyUser.twitter?.username) {
    username = privyUser.twitter.username;
  } else if (privyUser.discord?.username) {
    username = privyUser.discord.username;
  } else if (privyUser.github?.username) {
    username = privyUser.github.username;
  } else if (walletAddress) {
    username = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  } else if (email) {
    username = email.split('@')[0];
  } else {
    username = 'PrivyUser';
  }
  
  return {
    privyId: userId,
    email,
    walletAddress,
    username,
    socialAccounts,
    hasWallet: !!walletAddress,
    hasSocial: socialAccounts.length > 0
  };
}
