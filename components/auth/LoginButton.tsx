'use client';

/**
 * Login Button Component
 * Provides unified login interface for Web3 wallets and social logins via Privy
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/PrivyContext';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatWalletAddress } from '@/lib/privy-config';
import { cn } from '@/lib/utils';

interface LoginButtonProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  showDropdown?: boolean;
}

export function LoginButton({
  className,
  variant = 'default',
  size = 'default',
  showDropdown = true
}: LoginButtonProps) {
  const {
    user,
    isAuthenticated,
    isLoading,
    walletAddress,
    login,
    logout,
    linkWallet
  } = useAuth();
  
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleLogin = async () => {
    try {
      setIsConnecting(true);
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleLinkWallet = async () => {
    try {
      setIsConnecting(true);
      await linkWallet();
    } catch (error) {
      console.error('Link wallet failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('min-w-[140px]', className)}
        disabled
      >
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }
  
  // Not authenticated - show login button
  if (!isAuthenticated) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('min-w-[140px]', className)}
        onClick={handleLogin}
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
            Connect
          </>
        )}
      </Button>
    );
  }
  
  // Authenticated - show user dropdown or simple button
  const displayName = walletAddress 
    ? formatWalletAddress(walletAddress)
    : user?.email?.split('@')[0] || 'User';
  
  if (!showDropdown) {
    return (
      <Button
        variant={variant}
        size={size}
        className={cn('min-w-[140px]', className)}
        onClick={handleLogout}
      >
        <User className="mr-2 h-4 w-4" />
        {displayName}
      </Button>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn('min-w-[140px]', className)}
        >
          <User className="mr-2 h-4 w-4" />
          {displayName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Account</p>
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
            {walletAddress && (
              <p className="text-xs leading-none text-muted-foreground font-mono">
                {walletAddress}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Show link wallet option if no wallet connected */}
        {!walletAddress && (
          <>
            <DropdownMenuItem onClick={handleLinkWallet} disabled={isConnecting}>
              <Wallet className="mr-2 h-4 w-4" />
              {isConnecting ? 'Linking...' : 'Link Wallet'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem onClick={() => window.location.href = '/dashboard'}>
          <User className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact login button for mobile or tight spaces
 */
export function CompactLoginButton({ className }: { className?: string }) {
  const { isAuthenticated, isLoading, login, logout } = useAuth();
  
  if (isLoading) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-9 w-9 p-0', className)}
        disabled
      >
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn('h-9 w-9 p-0', className)}
        onClick={login}
      >
        <Wallet className="h-4 w-4" />
      </Button>
    );
  }
  
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('h-9 w-9 p-0', className)}
      onClick={logout}
    >
      <LogOut className="h-4 w-4" />
    </Button>
  );
}