'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

// Web3专用导航项 - 包含所有英文版功能
const web3NavItems = [
  {
    name: 'Home', 
    icon: LayoutDashboard, 
    href: '/web3',
    subItems: [
      {name: 'Dashboard', href: '/web3'},
      {name: 'Daily Tasks', href: '/web3#daily-tasks'},
      {name: 'Web3 Privileges', href: '/web3#privileges'},
      {name: 'Quick Actions', href: '/web3#quick-actions'},
      {name: 'Docs', href: 'https://metaport.gitbook.io/astrozi-whitepaper/', external: true}
    ]
  },
  {
    name: 'Analysis', 
    icon: BarChart3, 
    href: '#',
    subItems: [
      {name: 'BaZi Analysis', href: '/en/bazi'},
      {name: 'Zi Wei Dou Shu', href: '/en/ziwei'},
      {name: 'Guan Di Oracle', href: '/en/fortune'},
      {name: 'Create Chart', href: '/en/create-chart'},
      {name: 'My Charts', href: '/en/charts'}
    ]
  },
  {
    name: 'Wiki', 
    icon: Globe, 
    href: '/en/wiki',
    subItems: [
      {name: 'Knowledge Base', href: '/en/wiki'},
      {name: 'BaZi Guide', href: '/en/wiki/bazi'},
      {name: 'Zi Wei Guide', href: '/en/wiki/ziwei'},
      {name: 'Glossary', href: '/en/wiki/glossary'}
    ]
  },
  {
    name: 'AI Assistant', 
    icon: Bot, 
    href: '/en/chatbot',
    subItems: [
      {name: 'Chat with AI', href: '/en/chatbot'},
      {name: 'BaZi Master', href: '/en/chatbot#bazi-master'},
      {name: 'Zi Wei Master', href: '/en/chatbot#ziwei-master'},
      {name: 'General Guide', href: '/en/chatbot#general'}
    ]
  },
  {
    name: 'Web3 Features', 
    icon: Gift, 
    href: '#',
    subItems: [
      {name: 'Task Center', href: '/tasks'},
      {name: 'Leaderboard', href: '/leaderboard'},
      {name: 'Rewards Center', href: '/web3-rewards'},
      {name: 'Credits Manager', href: '/web3-credits'},
      {name: 'NFT Collection', href: '/web3-nfts'},
      {name: 'Staking Pool', href: '/web3-staking'}
    ]
  },
  {
    name: 'Profile', 
    icon: User, 
    href: '#',
    subItems: [
      {name: 'Web3 Profile', href: '/web3-profile'},
      {name: 'Birth Info', href: '/en/profile'},
      {name: 'Membership', href: '/en/membership'},
      {name: 'Subscription', href: '/en/subscription'}
    ]
  },
  {
    name: 'Settings', 
    icon: Settings, 
    href: '#',
    subItems: [
      {name: 'Web3 Settings', href: '/web3/settings'},
      {name: 'Preferences', href: '/en/preferences'},
      {name: 'Privacy & Security', href: '/web3/privacy'},
      {name: 'Help Center', href: '/en/help-center'},
      {name: 'Disconnect Wallet', anchor: '#disconnect'}
    ]
  }
];

// Web3移动端底部导航
const web3BottomNavItems = [
  {name: 'Home', icon: LayoutDashboard, href: '/web3'},
  {name: 'Analysis', icon: BarChart3, href: '/en/bazi'},
  {name: 'Wiki', icon: Globe, href: '/en/wiki'},
  {name: 'AI Chat', icon: Bot, href: '/en/chatbot'},
  {name: 'Menu', icon: Settings, href: '#menu'}
];

interface Web3LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  user?: {
    wallet_address?: string;
    username?: string;
  } | null;
}

export default function Web3Layout({ children, showNavigation = true, user }: Web3LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  
  const [selectedNav, setSelectedNav] = useState<any>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedMobileNav, setExpandedMobileNav] = useState<string | null>(null);
  const [isSecondaryNavOpen, setIsSecondaryNavOpen] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState<string | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
    const activeItem = web3NavItems
      .filter(item => item.href && item.href !== '#')
      .sort((a, b) => b.href.length - a.href.length)
      .find(item => pathname.startsWith(item.href));
    
    return activeItem || web3NavItems[0];
  };
  
  useEffect(() => {
    const currentNav = getCurrentNav();
    setSelectedNav(currentNav);
  }, [pathname]);

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
    router.push('/en/wallet-auth');
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
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <Link href="/web3-profile" className="p-2 rounded hover:bg-[#FBCB0A]/10 transition-colors">
                  <Image src="/bnbchain_logo.png" alt="BNB Chain Profile" width={20} height={20} className="w-5 h-5" />
                </Link>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="text-[#3D0B5B] dark:text-[#FBCB0A] p-2"
                >
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                
                {/* 移动端下拉菜单 */}
                {showMobileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-[#FFFFFF] dark:bg-[#1A2242] border border-[#3D0B5B]/20 dark:border-[#FBCB0A]/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-[#3D0B5B] dark:text-[#FBCB0A] mb-4 font-rajdhani">Navigation</h3>
                      {web3NavItems.map((item) => {
                        const Icon = item.icon;
                        const isExpanded = expandedMobileNav === item.name;
                        
                        return (
                          <div key={item.name} className="mb-2">
                            <button
                              onClick={() => {
                                if (item.subItems && item.subItems.length > 0) {
                                  setExpandedMobileNav(isExpanded ? null : item.name);
                                } else {
                                  router.push(item.href);
                                  setShowMobileMenu(false);
                                }
                              }}
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 rounded-md transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className="h-5 w-5 text-[#3D0B5B] dark:text-[#FBCB0A]" />
                                <span className="text-[#333333] dark:text-[#E0E0E0] font-rajdhani">{item.name}</span>
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
                                {item.subItems.map((subItem: any, index: number) => (
                                  <button
                                    key={`${subItem.name}-${index}`}
                                    onClick={() => {
                                      if (subItem.href) {
                                        if ((subItem as any).external) {
                                          window.open(subItem.href, '_blank');
                                        } else {
                                          router.push(subItem.href);
                                        }
                                      } else if (subItem.anchor === '#disconnect') {
                                        setSettingsDialog('disconnect');
                                      }
                                      setShowMobileMenu(false);
                                      setExpandedMobileNav(null);
                                    }}
                                    className="w-full text-left p-2 text-sm text-[#333333] dark:text-[#E0E0E0] hover:text-[#3D0B5B] dark:hover:text-[#FBCB0A] hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 rounded-md transition-colors font-rajdhani"
                                  >
                                    {subItem.name}
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
                            <p className="text-[#3D0B5B] dark:text-[#FBCB0A] text-sm font-bold mb-1 font-rajdhani">Connected Wallet</p>
                            <div className="flex items-center justify-between">
                              <code className="text-[#333333] dark:text-[#E0E0E0] font-mono text-xs">
                                {user.wallet_address.slice(0, 8)}...{user.wallet_address.slice(-6)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyWalletAddress}
                                className="h-6 w-6 p-0 text-[#3D0B5B] dark:text-[#FBCB0A]"
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
              {web3BottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href === '#menu' ? '#' : item.href}
                    onClick={(e) => {
                      if (item.href === '#menu') {
                        e.preventDefault();
                        setShowMobileMenu(true);
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors font-rajdhani ${
                      isActive 
                        ? 'text-[#FBCB0A] dark:text-[#FBCB0A]' 
                        : 'text-[#333333] dark:text-[#E0E0E0] hover:text-[#FBCB0A] dark:hover:text-[#FBCB0A]'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span>{item.name}</span>
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
        <button onClick={() => router.push('/web3')} className="mb-8 hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 rounded-lg p-2 transition-colors">
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
          {web3NavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedNav?.name === item.name;
            const commonProps = {
              className: `p-3 rounded-lg transition-all duration-200 ${
                isSelected 
                  ? 'bg-[#FBCB0A] text-[#420868] dark:text-[#1A2242] shadow-md hover:bg-[#FBCB0A]/90' 
                  : 'hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 text-[#3D0B5B] dark:text-[#FBCB0A] hover:text-[#420868] dark:hover:text-[#FBCB0A]'
              }`,
              title: item.name,
            };

            if (item.href === '#') {
              return (
                <button 
                  key={item.name} 
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
                key={item.name} 
                href={item.href} 
                {...commonProps} 
                onClick={() => setSelectedNav(item)}
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
              {selectedNav ? selectedNav.name : ''}
            </h2>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                title="Collapse" 
                className="text-[#3D0B5B]/60 dark:text-[#FBCB0A]/60 hover:text-[#3D0B5B] dark:hover:text-[#FBCB0A] ml-2" 
                onClick={() => setIsSecondaryNavOpen(false)}
              >
                <ChevronsLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <nav className={`flex-1 flex flex-col overflow-y-auto ${!isSecondaryNavOpen && 'hidden'}`}>
            <div className="space-y-2">
              {selectedNav?.subItems?.map((subItem: any, index: number) => {
                const isActive = subItem.href ? pathname.startsWith(subItem.href.split('?')[0]) : false;
                
                return (
                  <button 
                    key={`${subItem.name}-${index}`}
                    onClick={() => {
                      if (subItem.href) {
                        if ((subItem as any).external) {
                          window.open(subItem.href, '_blank');
                        } else {
                          router.push(subItem.href);
                        }
                      } else if (subItem.anchor === '#disconnect') {
                        setSettingsDialog('disconnect');
                      } else if (subItem.anchor) {
                        // 处理其他锚点功能
                        if (subItem.anchor === '#daily-tasks') {
                          const element = document.getElementById('daily-tasks');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        } else if (subItem.anchor === '#privileges') {
                          const element = document.getElementById('privileges');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        } else if (subItem.anchor === '#quick-actions') {
                          const element = document.getElementById('quick-actions');
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }
                      }
                    }}
                    className={`flex items-center p-3 rounded-md font-rajdhani ${
                      isActive 
                        ? 'bg-[#FBCB0A]/20 dark:bg-[#FBCB0A]/20 text-[#3D0B5B] dark:text-[#FBCB0A]' 
                        : 'text-[#333333] dark:text-[#E0E0E0] hover:bg-[#FBCB0A]/10 dark:hover:bg-[#FBCB0A]/10 hover:text-[#3D0B5B] dark:hover:text-[#FBCB0A]'
                    } transition-colors duration-200 w-full text-left`}
                  >
                    {subItem.name}
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
                title="Toggle theme"
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
              Disconnect Wallet
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="space-y-4">
              <p className="text-[#333333] dark:text-[#E0E0E0]">
                Are you sure you want to disconnect your wallet? You'll need to reconnect to access Web3 features.
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
                  Disconnect
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSettingsDialog(null)}
                  className="font-rajdhani"
                >
                  Cancel
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