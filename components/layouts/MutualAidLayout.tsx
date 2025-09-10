'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import WalletConnector from '@/components/web3/WalletConnector';
import {
  useMutualAidStore,
  useIsWalletConnected,
  useUserProfile,
  useUnreadNotifications,
  useUIActions
} from '@/lib/stores/mutualAidStore';
import {
  Menu,
  X,
  Home,
  Zap,
  Users,
  Trophy,
  Settings,
  Bell,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Globe,
  Wallet,
  Heart,
  Shield,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  labelEn: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  requiresWallet?: boolean;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: '首页',
    labelEn: 'Home',
    href: '/mutual-aid',
    icon: Home
  },
  {
    label: '厄运预警',
    labelEn: 'Adversity Analysis',
    href: '/mutual-aid/analysis',
    icon: Zap,
    requiresWallet: true
  },
  {
    label: '社区验证',
    labelEn: 'Community Validation',
    href: '/mutual-aid/validation',
    icon: Users,
    requiresWallet: true
  },
  {
    label: '我的请求',
    labelEn: 'My Requests',
    href: '/mutual-aid/requests',
    icon: Heart,
    requiresWallet: true
  },
  {
    label: 'NFT收藏',
    labelEn: 'NFT Collection',
    href: '/mutual-aid/nfts',
    icon: Trophy,
    requiresWallet: true
  },
  {
    label: '排行榜',
    labelEn: 'Leaderboard',
    href: '/mutual-aid/leaderboard',
    icon: TrendingUp
  },
  {
    label: '社区治理',
    labelEn: 'Governance',
    href: '/mutual-aid/governance',
    icon: Shield,
    requiresWallet: true
  }
];

interface MutualAidLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showSidebar?: boolean;
}

export default function MutualAidLayout({
  children,
  title,
  subtitle,
  showHeader = true,
  showSidebar = true
}: MutualAidLayoutProps) {
  const pathname = usePathname();
  const isWalletConnected = useIsWalletConnected();
  const userProfile = useUserProfile();
  const unreadNotifications = useUnreadNotifications();
  const { sidebarOpen, theme, language } = useMutualAidStore((state) => state.ui);
  const { setSidebarOpen, setTheme, setLanguage, addNotification } = useUIActions();
  
  const [isMobile, setIsMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen, setSidebarOpen]);

  // Handle wallet connection
  const handleWalletConnect = (walletInfo: any) => {
    addNotification({
      type: 'success',
      title: '钱包连接成功',
      message: `已连接到 ${walletInfo.networkName}`
    });
  };

  const handleWalletDisconnect = () => {
    addNotification({
      type: 'info',
      title: '钱包已断开',
      message: '您已断开钱包连接'
    });
  };

  // Toggle theme
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Toggle language
  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  // Navigation helpers
  const getNavigationLabel = (item: NavigationItem) => {
    return language === 'en' ? item.labelEn : item.label;
  };

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const canAccessRoute = (item: NavigationItem) => {
    return !item.requiresWallet || isWalletConnected;
  };

  return (
    <div className={cn(
      "min-h-screen bg-background",
      theme === 'dark' && 'dark'
    )}>
      {/* Sidebar */}
      <AnimatePresence>
        {(showSidebar && sidebarOpen) && (
          <>
            {/* Overlay for mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                "fixed left-0 top-0 z-50 h-full bg-card border-r border-border",
                "flex flex-col",
                isCollapsed ? "w-16" : "w-70",
                isMobile ? "w-70" : ""
              )}
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  {!isCollapsed && (
                    <div>
                      <h2 className="text-lg font-bold text-primary">
                        AstroZi
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {language === 'en' ? 'Mutual Aid System' : '互助系统'}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    {!isMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1.5"
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-4 h-4" />
                        ) : (
                          <ChevronLeft className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                        className="p-1.5"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Wallet Connection */}
              <div className="p-4 border-b border-border">
                {isCollapsed ? (
                  <div className="flex justify-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      isWalletConnected ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                    )}>
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <WalletConnector
                    onWalletConnect={handleWalletConnect}
                    onWalletDisconnect={handleWalletDisconnect}
                  />
                )}
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4 space-y-2">
                {navigationItems.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={canAccessRoute(item) ? item.href : '#'}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        isActiveRoute(item.href) && "bg-primary text-primary-foreground",
                        !canAccessRoute(item) && "opacity-50 cursor-not-allowed",
                        isCollapsed && "justify-center px-2"
                      )}
                      onClick={(e) => {
                        if (!canAccessRoute(item)) {
                          e.preventDefault();
                          addNotification({
                            type: 'warning',
                            title: '需要连接钱包',
                            message: '请先连接钱包以访问此功能'
                          });
                        }
                      }}
                    >
                      <item.icon className={cn(
                        "w-5 h-5 flex-shrink-0",
                        isActiveRoute(item.href) && "text-primary-foreground"
                      )} />
                      
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">
                            {getNavigationLabel(item)}
                          </span>
                          
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Link>
                  </div>
                ))}
              </nav>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-border space-y-2">
                {/* Theme & Language Toggle */}
                <div className={cn(
                  "flex gap-2",
                  isCollapsed ? "justify-center" : ""
                )}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleTheme}
                    className="p-2"
                  >
                    {theme === 'light' ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Sun className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleLanguage}
                    className="p-2"
                  >
                    <Globe className="w-4 h-4" />
                  </Button>
                  
                  {!isCollapsed && (
                    <Link href="/mutual-aid/settings">
                      <Button variant="ghost" size="sm" className="p-2">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  )}
                </div>

                {/* User Info */}
                {!isCollapsed && isWalletConnected && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {language === 'en' ? 'Reputation' : '信誉分数'}
                      </span>
                      <span className="font-medium">
                        {userProfile.reputation.toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-muted-foreground">NFTs</span>
                      <span className="font-medium">
                        {userProfile.nftCollection.totalCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={cn(
        "transition-all duration-300",
        showSidebar && sidebarOpen && !isMobile && (isCollapsed ? "ml-16" : "ml-70"),
        showSidebar && !sidebarOpen && "ml-0"
      )}>
        {/* Top Header */}
        {showHeader && (
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Mobile Menu Button */}
                  {showSidebar && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSidebarOpen(!sidebarOpen)}
                      className="p-2 md:hidden"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  )}

                  {/* Page Title */}
                  <div>
                    {title && (
                      <h1 className="text-xl font-semibold">{title}</h1>
                    )}
                    {subtitle && (
                      <p className="text-sm text-muted-foreground">{subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Notifications */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative p-2"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs flex items-center justify-center"
                      >
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </Badge>
                    )}
                  </Button>

                  {/* Help */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <main className="p-4 min-h-[calc(100vh-4rem)]">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-30">
            <div className="flex items-center justify-around py-2 px-4">
              {navigationItems.slice(0, 5).map((item) => (
                <Link
                  key={item.href}
                  href={canAccessRoute(item) ? item.href : '#'}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                    "hover:bg-accent",
                    isActiveRoute(item.href) && "text-primary",
                    !canAccessRoute(item) && "opacity-50"
                  )}
                  onClick={(e) => {
                    if (!canAccessRoute(item)) {
                      e.preventDefault();
                      addNotification({
                        type: 'warning',
                        title: '需要连接钱包',
                        message: '请先连接钱包以访问此功能'
                      });
                    }
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">
                    {language === 'en' ? item.labelEn.split(' ')[0] : item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Padding for Bottom Nav */}
        {isMobile && <div className="h-16" />}
      </div>
    </div>
  );
}