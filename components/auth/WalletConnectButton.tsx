"use client";

/**
 * WalletConnect Button Component
 * 独立的钱包连接组件，不依赖Privy
 * 面向Web3原生用户的纯钱包登录入口
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, LogOut, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabaseSessionManager } from '@/lib/services/supabase-session-manager';
function formatWalletAddress(addr?: string | null) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function generateSIWEMessage({ domain, address, chainId, nonce, issuedAt }: { domain: string; address: string; chainId: number; nonce: string; issuedAt: string }) {
  return `${domain} wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to the app.\n\nURI: https://${domain}\nVersion: 1\nChain ID: ${chainId}\nNonce: ${nonce}\nIssued At: ${issuedAt}`;
}

interface WalletConnectButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  onSuccess?: (walletAddress: string) => void;
}

export function WalletConnectButton({
  className,
  variant = 'outline',
  size = 'default',
  onSuccess
}: WalletConnectButtonProps) {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      
      // 1. Connect wallet via wagmi (prefer injected, fallback to walletConnect/coinbase)
      const preferred = ['injected', 'walletConnect', 'coinbaseWallet'];
      const list = connectors.sort((a, b) => preferred.indexOf(a.id) - preferred.indexOf(b.id));
      const connector = list[0] || connectors[0];
      if (!connector) throw new Error('No wallet connector available');
      const res = await connect({ connector });
      const addr = (res?.accounts?.[0] || address) as string;
      const resolvedAddr = addr || address;
      if (!resolvedAddr) throw new Error('Failed to get wallet address');
      
      // 2. Generate nonce from server
      const nonceResponse = await fetch('/api/auth/walletconnect/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: resolvedAddr })
      });
      
      if (!nonceResponse.ok) {
        throw new Error('Failed to generate nonce');
      }
      
      const { nonce } = await nonceResponse.json();
      
      // 3. Generate and sign message
      const message = generateSIWEMessage({
        domain: window.location.host,
        address: resolvedAddr,
        chainId: 56, // BSC
        nonce,
        issuedAt: new Date().toISOString()
      });
      
      const signature = await signMessageAsync({ message });
      
      if (!signature) {
        throw new Error('Failed to sign message');
      }
      
      // 4. Verify signature and create session
      const authResponse = await fetch('/api/auth/walletconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: resolvedAddr,
          signature,
          message,
          nonce
        })
      });
      
      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }
      
      const data = await authResponse.json();
      const { jwt, user, session } = data;

      // Prefer the custom JWT for our API auth while still retaining Supabase tokens
      const authToken = jwt;
      const supabaseAccessToken = session?.access_token || null;
      const supabaseRefreshToken = session?.refresh_token || null;

      // 5. Store unified local state for API client
      // current_user for unified header builder
      localStorage.setItem('current_user', JSON.stringify({
        id: user.id,
        email: user.email,
        wallet_address: resolvedAddr,
        auth_method: 'walletconnect',
        username: user.username,
      }));
      // walletconnect_auth for Web3 header builder compatibility
      const expSec = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
      localStorage.setItem('walletconnect_auth', JSON.stringify({
        auth_token: supabaseAccessToken || authToken,
        refresh_token: supabaseRefreshToken || supabaseAccessToken || authToken,
        api_token: authToken,
        supabase_access_token: supabaseAccessToken || null,
        wallet_address: resolvedAddr,
        auth_method: 'walletconnect',
        expires_at: session?.expires_at || expSec,
      }));
      // Keep legacy keys for backward compatibility
      localStorage.setItem('wallet_jwt', authToken);
      localStorage.setItem('wallet_session', JSON.stringify({
        walletAddress: resolvedAddr,
        userId: user.id,
        expiresAt: (session?.expires_at ? session.expires_at * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000)
      }));

      // 6. Set standard Supabase session if provided (unified with Privy)
      if (session?.access_token) {
        try {
          await supabaseSessionManager.setStandardSession(session);
          console.log('✅ Supabase session set via WalletConnect');
          // Also store for api-client generic Supabase header
          localStorage.setItem('supabase_jwt', session.access_token);
        } catch (e) {
          console.warn('Failed to set Supabase session from WalletConnect:', e);
        }
      }

      toast.success('钱包连接成功 / Wallet connected');
      onSuccess?.(resolvedAddr);
      
      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error: any) {
      console.error('Wallet connection failed:', error);
      toast.error(error.message || '连接失败 / Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      disconnect();
      // Clear local storage
      localStorage.removeItem('wallet_jwt');
      localStorage.removeItem('wallet_session');
      
      // Call logout API
      await fetch('/api/auth/walletconnect', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('wallet_jwt') || localStorage.getItem('supabase_jwt') || ''}`
        }
      });
      
      setSession(null);
      setWalletAddress(null);
      
      toast.success('钱包已断开 / Wallet disconnected');
      router.push('/');
      
    } catch (error) {
      console.error('Disconnect failed:', error);
      toast.error('断开连接失败 / Failed to disconnect');
    }
  };

  const handleSwitchWallet = async () => {
    await handleDisconnect();
    await handleConnect();
  };

  // Not initialized
  // Connected state
  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <Wallet className="mr-2 h-4 w-4" />
            {formatWalletAddress(address)}
            <ChevronDown className="ml-2 h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">Web3 Wallet</p>
              <p className="text-xs text-muted-foreground font-mono">
                {address}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleSwitchWallet}>
            <Wallet className="mr-2 h-4 w-4" />
            Switch Wallet
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => router.push('/dashboard')}>
            Dashboard
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Not connected state
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}
