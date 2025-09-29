'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type {LucideIcon} from 'lucide-react';
import { 
  Home, 
  Settings,
  User,
  Gift,
  CreditCard,
  Menu,
  ChevronRight,
  ChevronDown,
  X,
  Sun,
  Moon,
  Wallet,
  Copy,
  Shield,
  LogOut,
  HelpCircle,
  Globe,
  Archive,
  Bot,
  BarChart3,
  Plus,
  BookOpen,
  Calculator,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/useDeviceType';
import { useTheme } from 'next-themes';
import ZoomableLayout from './ZoomableLayout';
import {useLocale, useTranslations} from 'next-intl';
import {assertLocale} from '@/i18n/messages';
import {buildLocaleHref} from '@/lib/i18n/routing';
import {useNamespaceTranslations} from '@/lib/i18n/useI18n';


interface Web3LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  user?: {
    wallet_address?: string;
    username?: string;
  } | null;
}

type NavSubItem = {
  key: string;
  label: string;
  href?: string;
  external?: boolean;
  action?: 'disconnect';
};

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  external?: boolean;
  subItems?: NavSubItem[];
};

type MobileNavItem = {
  key: string;
  label: string;
  href?: string;
  external?: boolean;
  action?: 'menu';
  icon: LucideIcon;
};

const DOCS_URL = 'https://metaport.gitbook.io/astrozi-whitepaper/';

export default function Web3Layout({ children, showNavigation = true, user }: Web3LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const locale = assertLocale(useLocale());
  const tNavigation = useTranslations('navigation');
  const tLayout = useNamespaceTranslations('web3/layout');
  const toLocaleHref = (path: string, hash?: string, options?: { localize?: boolean }) =>
    buildLocaleHref(locale, path, hash, options);
  
  const navItems = useMemo<NavItem[]>(() => [
    {
      key: 'home',
      label: tLayout('navItems.home.label'),
      icon: LayoutDashboard,
      href: toLocaleHref('/web3', undefined, { localize: false }),
      subItems: [
        { key: 'dashboard', label: tLayout('navItems.home.subItems.dashboard'), href: toLocaleHref('/web3', undefined, { localize: false }) },
        { key: 'dailyTasks', label: tLayout('navItems.home.subItems.dailyTasks'), href: toLocaleHref('/web3', 'daily-tasks', { localize: false }) },
        { key: 'privileges', label: tLayout('navItems.home.subItems.privileges'), href: toLocaleHref('/web3', 'privileges', { localize: false }) },
        { key: 'quickActions', label: tLayout('navItems.home.subItems.quickActions'), href: toLocaleHref('/web3', 'quick-actions', { localize: false }) },
        { key: 'docs', label: tLayout('navItems.home.subItems.docs'), href: DOCS_URL, external: true }
      ]
    },
    {
      key: 'analysis',
      label: tLayout('navItems.analysis.label'),
      icon: BarChart3,
      href: undefined,
      subItems: [
        { key: 'bazi', label: tLayout('navItems.analysis.subItems.bazi'), href: toLocaleHref('/bazi') },
        { key: 'ziwei', label: tLayout('navItems.analysis.subItems.ziwei'), href: toLocaleHref('/ziwei') },
        { key: 'fortune', label: tLayout('navItems.analysis.subItems.fortune'), href: toLocaleHref('/fortune') },
        { key: 'createChart', label: tLayout('navItems.analysis.subItems.createChart'), href: toLocaleHref('/create-chart') },
        { key: 'myCharts', label: tLayout('navItems.analysis.subItems.myCharts'), href: toLocaleHref('/charts') }
      ]
    },
    {
      key: 'wiki',
      label: tLayout('navItems.wiki.label'),
      icon: Globe,
      href: toLocaleHref('/wiki'),
      subItems: [
        { key: 'wikiHome', label: tLayout('navItems.wiki.subItems.wikiHome'), href: toLocaleHref('/wiki') },
        { key: 'baziGuide', label: tLayout('navItems.wiki.subItems.baziGuide'), href: toLocaleHref('/wiki/bazi') },
        { key: 'ziweiGuide', label: tLayout('navItems.wiki.subItems.ziweiGuide'), href: toLocaleHref('/wiki/ziwei') },
        { key: 'glossary', label: tLayout('navItems.wiki.subItems.glossary'), href: toLocaleHref('/wiki', 'glossary') }
      ]
    },
    {
      key: 'aiAssistant',
      label: tLayout('navItems.aiAssistant.label'),
      icon: Bot,
      href: toLocaleHref('/chatbot'),
      subItems: [
        { key: 'chat', label: tLayout('navItems.aiAssistant.subItems.chat'), href: toLocaleHref('/chatbot') },
        { key: 'baziMaster', label: tLayout('navItems.aiAssistant.subItems.baziMaster'), href: toLocaleHref('/chatbot', 'bazi-master') },
        { key: 'ziweiMaster', label: tLayout('navItems.aiAssistant.subItems.ziweiMaster'), href: toLocaleHref('/chatbot', 'ziwei-master') },
        { key: 'general', label: tLayout('navItems.aiAssistant.subItems.general'), href: toLocaleHref('/chatbot', 'general') }
      ]
    },
    {
      key: 'web3Features',
      label: tLayout('navItems.web3Features.label'),
      icon: Gift,
      href: undefined,
      subItems: [
        { key: 'tasks', label: tLayout('navItems.web3Features.subItems.tasks'), href: toLocaleHref('/tasks', undefined, { localize: false }) },
        { key: 'leaderboard', label: tLayout('navItems.web3Features.subItems.leaderboard'), href: toLocaleHref('/leaderboard', undefined, { localize: false }) },
        { key: 'rewards', label: tLayout('navItems.web3Features.subItems.rewards'), href: toLocaleHref('/web3-rewards', undefined, { localize: false }) },
        { key: 'credits', label: tLayout('navItems.web3Features.subItems.credits'), href: toLocaleHref('/web3-credits', undefined, { localize: false }) },
        { key: 'nfts', label: tLayout('navItems.web3Features.subItems.nfts'), href: toLocaleHref('/web3-nfts', undefined, { localize: false }) },
        { key: 'staking', label: tLayout('navItems.web3Features.subItems.staking'), href: toLocaleHref('/web3-staking', undefined, { localize: false }) }
      ]
    },
    {
      key: 'profile',
      label: tLayout('navItems.profile.label'),
      icon: User,
      href: undefined,
      subItems: [
        { key: 'web3Profile', label: tLayout('navItems.profile.subItems.web3Profile'), href: toLocaleHref('/web3-profile', undefined, { localize: false }) },
        { key: 'birthInfo', label: tLayout('navItems.profile.subItems.birthInfo'), href: toLocaleHref('/profile') },
        { key: 'membership', label: tLayout('navItems.profile.subItems.membership'), href: toLocaleHref('/membership') },
        { key: 'subscription', label: tLayout('navItems.profile.subItems.subscription'), href: toLocaleHref('/subscription') }
      ]
    },
    {
      key: 'settings',
      label: tLayout('navItems.settings.label'),
      icon: Settings,
      href: undefined,
      subItems: [
        { key: 'web3Settings', label: tLayout('navItems.settings.subItems.web3Settings'), href: toLocaleHref('/web3/settings', undefined, { localize: false }) },
        { key: 'preferences', label: tLayout('navItems.settings.subItems.preferences'), href: toLocaleHref('/preferences') },
        { key: 'privacy', label: tLayout('navItems.settings.subItems.privacy'), href: toLocaleHref('/web3/privacy', undefined, { localize: false }) },
        { key: 'helpCenter', label: tLayout('navItems.settings.subItems.helpCenter'), href: toLocaleHref('/help-center') },
        { key: 'disconnect', label: tLayout('navItems.settings.subItems.disconnect'), action: 'disconnect' }
      ]
    }
  ], [locale, tLayout]);

  const bottomNavItems = useMemo<MobileNavItem[]>(() => [
    { key: 'home', label: tLayout('navItems.home.label'), href: toLocaleHref('/web3', undefined, { localize: false }), icon: LayoutDashboard },
    { key: 'analysis', label: tLayout('navItems.analysis.label'), href: toLocaleHref('/bazi'), icon: BarChart3 },
    { key: 'wiki', label: tLayout('navItems.wiki.label'), href: toLocaleHref('/wiki'), icon: Globe },
    { key: 'aiAssistant', label: tLayout('navItems.aiAssistant.label'), href: toLocaleHref('/chatbot'), icon: Bot },
    { key: 'menu', label: tNavigation('menu'), action: 'menu', icon: Settings }
  ], [locale, tLayout, tNavigation]);

  const [selectedNav, setSelectedNav] = useState<NavItem | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedMobileNav, setExpandedMobileNav] = useState<string | null>(null);
  const [isSecondaryNavOpen, setIsSecondaryNavOpen] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileMenus = () => {
    setShowMobileMenu(false);
    setExpandedMobileNav(null);
  };

  const scrollToSection = (sectionId: string, basePath?: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (typeof window !== 'undefined') {
        const pathForHash = basePath && basePath.length > 0 ? basePath : window.location.pathname;
        const normalizedPath = pathForHash.startsWith('/') ? pathForHash : `/${pathForHash}`;
        window.history.replaceState(null, '', `${normalizedPath}#${sectionId}`);
      }
    }
  };

  const handleSubItemClick = (subItem: NavSubItem) => {
    if (subItem.external && subItem.href) {
      window.open(subItem.href, '_blank');
      return;
    }

    if (subItem.action === 'disconnect') {
      setSettingsDialog('disconnect');
      return;
    }

    if (!subItem.href) {
      return;
    }

    if (subItem.href.startsWith('http://') || subItem.href.startsWith('https://')) {
      window.open(subItem.href, '_blank');
      return;
    }

    const [routePath, hash] = subItem.href.split('#');
    const normalizedRoutePath = routePath || pathname;

    if (hash && normalizedRoutePath === pathname) {
      scrollToSection(hash, normalizedRoutePath);
    } else if (hash && normalizedRoutePath !== pathname) {
      router.push(subItem.href);
    } else {
      router.push(normalizedRoutePath);
    }
  };

  // 处理移动端菜单外部点击关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setShowMobileMenu(false);
        setExpandedMobileNav(null);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取当前选中的导航项
  const getCurrentNav = () => {
    const activeItem = navItems.find((item) => {
      if (item.href && pathname.startsWith(item.href)) {
        return true;
      }
      return item.subItems?.some((subItem) => {
        if (!subItem.href) return false;
        const [routePath] = subItem.href.split('#');
        if (!routePath) return false;
        return pathname.startsWith(routePath);
      });
    });

    return activeItem ?? navItems[0] ?? null;
  };

  useEffect(() => {
    const currentNav = getCurrentNav();
    setSelectedNav(currentNav);
  }, [pathname, navItems]);

  // 复制钱包地址
  const copyWalletAddress = () => {
    if (user?.wallet_address) {
      navigator.clipboard.writeText(user.wallet_address);
    }
  };

  // 处理断开钱包连接
  const handleDisconnectWallet = async () => {
    // 清理localStorage
    localStorage.removeItem('current_user');
    localStorage.removeItem('walletconnect_auth');
    localStorage.removeItem('wallet_session');
    
    // 重定向到认证页面
    router.push(toLocaleHref('/wallet-auth'));
  };

  // 移动端布局
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#F8F9FA] dark:from-[#1A2242] dark:via-[#252D47] dark:to-[#1A2242]">
        {/* 移动端顶部导航栏 */}
        {showNavigation && (
          <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 dark:bg-[#1A2242]/95 backdrop-blur-md border-b border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20">
            <div className="container flex h-16 items-center justify-between px-4">
              <Link href="/web3" className="flex items-center space-x-2">
                <Image 
                  src={theme === 'dark' ? '/Logo_Dark.png' : '/logo_light.png'} 
                  alt="AstroZi Logo" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8" 
                />
                <span className="text-[#3D0B5B] dark:text-[#FBCB0A] font-bold text-xl font-rajdhani">
                  ASTROZI
                </span>
              </Link>
              
              {/* 主题切换、BNB Chain logo和菜单按钮 */}
              <div className="flex items-center space-x-1" ref={mobileMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="text-[#3D0B5B] dark:text-[#FBCB0A] p-2"
                  title={tLayout('themeToggle')}
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <Link href={toLocaleHref('/web3-profile', undefined, { localize: false })} className="p-2 rounded hover:bg-[#FBCB0A]/10 transition-colors">
                  <Image src="/bnbchain_logo.png" alt="BNB Chain Profile" width={20} height={20} className="w-5 h-5" />
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-[#3D0B5B] dark:text-[#FBCB0A] p-2"
                  aria-label={tNavigation('menu')}
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                
                {/* 移动端下拉菜单 */}
                {showMobileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[#FFFFFF] dark:bg-[#1A2242] border border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[#3D0B5B] dark:text-[#FBCB0A] mb-4 font-rajdhani">{tLayout('navigationHeading')}</h3>
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const isExpanded = expandedMobileNav === item.key;
                        
                        return (
                          <div key={item.key} className="mb-2">
                            <button
                              onClick={() => {
                                if (item.subItems && item.subItems.length > 0) {
                                  setExpandedMobileNav(isExpanded ? null : item.key);
                                } else {
                                  handleSubItemClick({ key: item.key, label: item.label, href: item.href, external: item.external });
                                  closeMobileMenus();
                                }
                              }}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 rounded-md transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className="h-5 w-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                                <span className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">{item.label}</span>
                              </div>
                              {item.subItems && item.subItems.length > 0 && (
                                isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                                )
                              )}
                            </button>
                            
                            {/* 子菜单 */}
                            {isExpanded && item.subItems && (
                              <div className="ml-8 mt-2 space-y-1">
                                {item.subItems.map((subItem, index) => (
                                  <button
                                    key={`${subItem.key}-${index}`}
                                    onClick={() => {
                                      handleSubItemClick(subItem);
                                      closeMobileMenus();
                                    }}
                                    className="w-full text-left p-2 text-sm text-[#333333] dark:text-[#E0E0E0] hover:text-[#3D0B5B] dark:hover:text-[#FBCB0A] hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 rounded-md transition-colors font-rajdhani"
                                  >
                                    {subItem.label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* 钱包信息 */}
                      {user?.wallet_address && (
                        <>
                          <div className="border-t border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 mt-4 pt-4">
                            <p className="text-[#3D0B5B] dark:text-[#FBCB0A] text-sm font-bold mb-1 font-rajdhani">{tLayout('wallet.connected')}</p>
                            <div className="flex items-center justify-between">
                              <code className="text-[#333333] dark:text-[#E0E0E0] font-mono text-xs">
                                {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyWalletAddress}
                                className="h-6 w-6 p-0 text-[#3D0B5B] dark:text-[#FBCB0A]"
                                aria-label={tLayout('wallet.copy')}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>
        )}

        {/* 主要内容区域 */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>

        {/* 移动端底部导航 */}
        {showNavigation && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF]/95 dark:bg-[#1A2242]/95 backdrop-blur-md border-t border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20">
            <div className="grid grid-cols-5 gap-1 p-2">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const [routePath] = (item.href ?? '').split('#');
                const isActive = item.href ? pathname.startsWith(routePath) : false;
                const href = item.href ?? '#';
                return (
                  <Link
                    key={item.key}
                    href={item.action === 'menu' ? '#' : href}
                    onClick={(e) => {
                      if (item.action === 'menu') {
                        e.preventDefault();
                        setShowMobileMenu(true);
                        return;
                      }
                      if (item.href && item.href.startsWith('http')) {
                        e.preventDefault();
                        window.open(item.href, '_blank');
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors font-rajdhani ${
                      isActive 
                        ? 'text-[#FBCB0A] dark:text-[#FBCB0A]' 
                        : 'text-[#333333] dark:text-[#E0E0E0] hover:text-[#FBCB0A] dark:hover:text-[#FBCB0A]'
                    }`}
                    aria-label={item.label}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        {/* 移动端底部导航的占位空间 */}
        {showNavigation && <div className="md:hidden h-16" />}
      </div>
    );
  }

  // 桌面端布局（带二级导航，与英文版一致）
  return (
    <ZoomableLayout 
      showZoomControl={true}
      zoomControlPosition="bottom-right"
      enableKeyboardShortcuts={true}
      onlyDesktop={true}
    >
      <div className="h-screen bg-[#FFFFFF] dark:bg-[#1A2242] text-[#333333] dark:text-[#E0E0E0] font-rajdhani flex overflow-hidden">
      {/* 主导航栏 */}
      <aside className="bg-[#FFFFFF] dark:bg-[#1A2242] border-r border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 w-20 flex flex-col items-center py-4 shadow-sm">
        <button onClick={() => router.push(toLocaleHref('/web3', undefined, { localize: false }))} className="mb-8 hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 rounded-lg p-2 transition-colors">
          <div className="w-12 h-12 flex items-center justify-center">
            <Image 
              src={theme === 'dark' ? '/Logo_Dark.png' : '/logo_light.png'} 
              alt="AstroZi Logo" 
              width={40} 
              height={40} 
              className="w-10 h-10" 
            />
          </div>
        </button>
        
        <nav className="flex-1 flex flex-col items-center space-y-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedNav?.key === item.key;
            const commonProps = {
              className: `p-3 rounded-lg transition-all duration-200 ${
                isSelected 
                  ? 'bg-[#FBCB0A] text-[#420868] dark:text-[#1A2242] shadow-md hover:bg-[#FBCB0A]/90' 
                  : 'hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 text-[#3D0B5B] dark:text-[#FBCB0A] hover:text-[#420868] dark:hover:text-[#FBCB0A]'
              }`,
              title: item.label,
            };

            if (!item.href) {
              return (
                <button 
                  key={item.key} 
                  {...commonProps} 
                  onClick={() => {
                    setSelectedNav(item);
                    if (!isSecondaryNavOpen) setIsSecondaryNavOpen(true);
                  }}
                >
                  <Icon size={24} />
                </button>
              );
            }

            return (
              <Link 
                key={item.key} 
                href={item.href}
                {...commonProps} 
                onClick={() => {
                  setSelectedNav(item);
                  if (item.subItems && item.subItems.length > 0 && !isSecondaryNavOpen) {
                    setIsSecondaryNavOpen(true);
                  }
                }}
              >
                <Icon size={24} />
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 二级导航和内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 二级导航栏 */}
        <aside className={`bg-[#FFFFFF] dark:bg-[#1A2242] border-r border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 transition-all duration-300 flex flex-col shrink-0 shadow-sm ${
          isSecondaryNavOpen ? 'w-60 p-4' : 'w-0'
        }`} style={{ overflow: 'hidden' }}>
          <div className={`flex justify-between items-center mb-2 ${!isSecondaryNavOpen && 'hidden'}`}>
            <h2 className="text-xl font-semibold text-[#3D0B5B] dark:text-[#FBCB0A] whitespace-nowrap font-rajdhani">
              {selectedNav ? selectedNav.label : ''}
            </h2>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                title={tLayout('secondaryNav.collapse')} 
                className="text-[#3D0B5B]/60 dark:text-[#FBCB0A]/60 hover:text-[#3D0B5B] dark:hover:text-[#FBCB0A] ml-2" 
                onClick={() => setIsSecondaryNavOpen(false)}
              >
                <ChevronsLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <nav className={`flex-1 flex flex-col overflow-y-auto ${!isSecondaryNavOpen && 'hidden'}`}>
            <div className="space-y-2">
              {(selectedNav?.subItems ?? []).map((subItem, index) => {
                const [routePath] = (subItem.href ?? '').split('#');
                const isActive = subItem.href ? pathname.startsWith(routePath) : false;

                return (
                  <button 
                    key={`${subItem.key}-${index}`}
                    onClick={() => {
                      handleSubItemClick(subItem);
                      closeMobileMenus();
                    }}
                    className={`flex items-center p-3 rounded-md font-rajdhani ${
                      isActive 
                        ? 'bg-[#FBCB0A]/20 dark:bg-[#FBCB0A]/20 text-[#3D0B5B] dark:text-[#FBCB0A]' 
                        : 'text-[#333333] dark:text-[#E0E0E0] hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 hover:text-[#3D0B5B] dark:hover:text-[#FBCB0A]'
                    } transition-colors duration-200 w-full text-left`}
                  >
                    {subItem.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* 内容区域 */}
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {!isSecondaryNavOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSecondaryNavOpen(true)} 
              className="absolute top-2 left-2 z-10 text-[#3D0B5B]/60 dark:text-[#FBCB0A]/60 hover:text-[#3D0B5B] dark:hover:text-[#FBCB0A]"
              title={tLayout('secondaryNav.expand')}
            >
              <ChevronsRight className="w-5 h-5" />
            </Button>
          )}
          
          {/* 顶部信息栏 */}
          <div className="bg-[#FFFFFF] dark:bg-[#1A2242] border-b border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 px-6 py-3">
            <div className="flex items-center justify-end space-x-3">
              {/* 主题切换按钮 */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="text-[#3D0B5B] dark:text-[#FBCB0A] hover:bg-[#FBCB0A]/10"
                title={tLayout('themeToggle')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              {/* 钱包信息 */}
              {user?.wallet_address && (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#FBCB0A]/10 dark:bg-[#FBCB0A]/10 border border-[#FBCB0A]/20">
                  <Image src="/bnbchain_logo.png" alt="BNB Chain" width={16} height={16} className="w-4 h-4" />
                  <code className="text-[#333333] dark:text-[#E0E0E0] font-mono text-sm">
                    {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyWalletAddress}
                    className="h-6 w-6 p-0 text-[#3D0B5B] dark:text-[#FBCB0A] hover:text-[#420868] dark:hover:text-[#E0E0E0]"
                    aria-label={tLayout('wallet.copy')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 p-2 lg:p-4">
            {children}
          </div>
        </main>
      </div>

      {/* 断开连接对话框 */}
      <Dialog open={settingsDialog === 'disconnect'} onOpenChange={() => setSettingsDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#3D0B5B] dark:text-[#FBCB0A] font-rajdhani">
              {tLayout('wallet.disconnectTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="space-y-4">
              <p className="text-[#333333] dark:text-[#E0E0E0]">
                {tLayout('wallet.disconnectMessage')}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleDisconnectWallet();
                    setSettingsDialog(null);
                  }}
                  className="font-rajdhani"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {tLayout('wallet.disconnectConfirm')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSettingsDialog(null)}
                  className="font-rajdhani"
                >
                  {tLayout('wallet.disconnectCancel')}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ZoomableLayout>
  );
}
