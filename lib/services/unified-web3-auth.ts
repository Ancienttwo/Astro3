import { getSupabaseAdmin } from '@/lib/supabase';
import { verifyMessage } from 'viem';
import { NextRequest } from 'next/server';

interface Web3AuthConfig {
  chainId: number;
  rpcUrl: string;
  contractAddress?: string;
}

interface AuthResult {
  success: boolean;
  userId?: string;
  address?: string;
  error?: string;
  isNewUser?: boolean;
}

export class UnifiedWeb3AuthService {
  private static instance: UnifiedWeb3AuthService;
  private config: Web3AuthConfig;
  
  private constructor() {
    this.config = {
      chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '56'), // BSC Mainnet
      rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://bsc-dataseed.binance.org/',
    };
  }
  
  static getInstance(): UnifiedWeb3AuthService {
    if (!this.instance) {
      this.instance = new UnifiedWeb3AuthService();
    }
    return this.instance;
  }
  
  // Verify signature and authenticate user
  async authenticateWithSignature(
    address: string,
    message: string,
    signature: string,
    request: NextRequest
  ): Promise<AuthResult> {
    try {
      // Verify the signature
      const ok = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
      })
      if (!ok) {
        return {
          success: false,
          error: 'Invalid signature',
        };
      }
      
      // Check message validity (timestamp within 5 minutes)
      const messageMatch = message.match(/Timestamp: (\d+)/);
      if (messageMatch) {
        const timestamp = parseInt(messageMatch[1]);
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (now - timestamp > fiveMinutes) {
          return {
            success: false,
            error: 'Signature expired',
          };
        }
      }
      
      // Get or create user in database
      const supabase = getSupabaseAdmin();
      
      // Check if wallet already exists
      const { data: existingWallet } = await supabase
        .from('user_wallets')
        .select('user_id, is_primary')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (existingWallet) {
        // Existing user - update last login
        await supabase
          .from('user_wallets')
          .update({
            last_used_at: new Date().toISOString(),
            chain_id: this.config.chainId,
          })
          .eq('wallet_address', address.toLowerCase());
        
        return {
          success: true,
          userId: existingWallet.user_id,
          address: address.toLowerCase(),
          isNewUser: false,
        };
      }
      
      // New wallet - create user account
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          email: `${address.toLowerCase()}@web3.local`,
          auth_type: 'web3',
          username: `user_${address.substring(0, 8).toLowerCase()}`,
        })
        .select()
        .single();
      
      if (userError || !newUser) {
        return {
          success: false,
          error: 'Failed to create user account',
        };
      }
      
      // Create wallet record
      await supabase
        .from('user_wallets')
        .insert({
          user_id: newUser.id,
          wallet_address: address.toLowerCase(),
          chain_id: this.config.chainId,
          is_primary: true,
          verified_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        });
      
      // Initialize user credits
      await supabase
        .from('user_credits')
        .insert({
          user_id: newUser.id,
          free_credits: 10, // Welcome bonus
          paid_credits: 0,
        });
      
      return {
        success: true,
        userId: newUser.id,
        address: address.toLowerCase(),
        isNewUser: true,
      };
      
    } catch (error) {
      console.error('Web3 auth error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }
  
  // Link wallet to existing user
  async linkWalletToUser(
    userId: string,
    address: string,
    signature: string,
    message: string
  ): Promise<AuthResult> {
    try {
      // Verify signature
      const ok = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: (signature.startsWith('0x') ? signature : `0x${signature}`) as `0x${string}`,
      })
      if (!ok) {
        return {
          success: false,
          error: 'Invalid signature',
        };
      }
      
      const supabase = getSupabaseAdmin();
      
      // Check if wallet is already linked
      const { data: existing } = await supabase
        .from('user_wallets')
        .select('user_id')
        .eq('wallet_address', address.toLowerCase())
        .single();
      
      if (existing) {
        if (existing.user_id === userId) {
          return {
            success: true,
            userId,
            address: address.toLowerCase(),
          };
        }
        return {
          success: false,
          error: 'Wallet already linked to another account',
        };
      }
      
      // Link wallet to user
      const { error } = await supabase
        .from('user_wallets')
        .insert({
          user_id: userId,
          wallet_address: address.toLowerCase(),
          chain_id: this.config.chainId,
          is_primary: false, // Not primary if linking additional wallet
          verified_at: new Date().toISOString(),
          last_used_at: new Date().toISOString(),
        });
      
      if (error) {
        return {
          success: false,
          error: 'Failed to link wallet',
        };
      }
      
      return {
        success: true,
        userId,
        address: address.toLowerCase(),
      };
      
    } catch (error) {
      console.error('Link wallet error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to link wallet',
      };
    }
  }
  
  // Get user wallets
  async getUserWallets(userId: string) {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('user_wallets')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data;
  }
  
  // Remove wallet from user
  async removeWallet(userId: string, address: string) {
    const supabase = getSupabaseAdmin();
    
    // Check if it's the primary wallet
    const { data: wallet } = await supabase
      .from('user_wallets')
      .select('is_primary')
      .eq('user_id', userId)
      .eq('wallet_address', address.toLowerCase())
      .single();
    
    if (wallet?.is_primary) {
      throw new Error('Cannot remove primary wallet');
    }
    
    const { error } = await supabase
      .from('user_wallets')
      .delete()
      .eq('user_id', userId)
      .eq('wallet_address', address.toLowerCase());
    
    if (error) {
      throw error;
    }
    
    return true;
  }
  
  // Generate nonce for signing
  generateSignMessage(address: string): string {
    const timestamp = Date.now();
    const domain = process.env.NEXT_PUBLIC_APP_URL || 'https://astrozi.com';
    
    return `Welcome to AstroZi!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nTimestamp: ${timestamp}\nDomain: ${domain}`;
  }
}

export const web3Auth = UnifiedWeb3AuthService.getInstance();
