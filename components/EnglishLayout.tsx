'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Calculator, 
  Sparkles, 
  User, 
  BookOpen,
  LogOut,
  Settings,
  Languages,
  BarChart3,
  Plus,
  ChevronsLeft,
  ChevronsRight,
  Globe,
  Archive,
  Bot,
  LayoutDashboard,
  Menu,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/useDeviceType';
import { getNavigationConfig, getMobileBottomNav } from '@/lib/config/navigation-config';
import { APP_CONFIG } from '@/lib/config/app-config';
// 通用英文布局组件 - 支持Web2和Web3配置
// Web3版本: 核心功能（紫微、八字、Wiki、Chatbot、邀请）
// Web2版本: 完整功能（包括易经、六爻、签文等）

// 使用配置系统获取英文导航项目
const getEnglishNavItems = () => {
  const configNavItems = getNavigationConfig(true); // true for English
  
  // 添加图标映射
  return configNavItems.map(item => ({
    ...item,
    icon: getIconForNavItem(item.name)
  }));
};

// 图标映射函数
const getIconForNavItem = (name: string) => {
  const iconMap: Record<string, any> = {
    'Home': LayoutDashboard,
    'Analysis': BarChart3,
    'Wiki': Globe,
    'AI Assistant': Bot,
    'Charts': Archive,
    'Settings': Settings
  };
  return iconMap[name] || LayoutDashboard;
};

// 英文版设置项（统一使用/en/前缀）
const englishSettingsItems = [
  {name: 'My Profile', href: '/en/profile'},
  {name: 'Membership', href: '/en/membership'},
  {name: 'Subscription', href: '/en/subscription'},
  {name: 'Preferences', href: '/en/preferences'},
  {name: 'Contact Us', anchor: '#media-info'},
  {name: 'Help Center', href: '/en/help-center'},
  {name: 'Logout', anchor: '#logout'}
];

// 完整的英文导航项（包含设置）
const getCompleteEnglishNavItems = () => {
  const configNavItems = getEnglishNavItems();
  return [
    ...configNavItems,
    { 
      name: 'Settings', 
      icon: Settings, 
      subItems: englishSettingsItems, 
      href: '#'
    }
  ];
};

// 使用配置系统获取移动端底部导航
const getBottomNavItems = () => {
  return getMobileBottomNav(true); // true for English
};

interface EnglishLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export default function EnglishLayout({ children, showNavigation = true }: EnglishLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  
  const [mainNavItems] = useState(getCompleteEnglishNavItems());
  const [selectedNav, setSelectedNav] = useState<any>(null);
  const [isSecondaryNavOpen, setIsSecondaryNavOpen] = useState(true);
  const [settingsDialog, setSettingsDialog] = useState<string | null>(null);
  const [homeDialog, setHomeDialog] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedMobileNav, setExpandedMobileNav] = useState<string | null>(null);
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
  
  const getCurrentNav = () => {
    if (!mainNavItems || mainNavItems.length === 0) {
      return null;
    }
    
    // 特殊处理紫微页面 - 显示自定义导航
    if (pathname.startsWith('/en/ziwei')) {
      return {
        name: 'Ziwei Navigation',
        icon: mainNavItems[0].icon,
        subItems: [
          { name: 'Ziwei Chart', targetId: 'ziwei-chart' },
          { name: 'Karmic Origin', targetId: 'lai-yin-analysis' },
          { name: 'Life Palace', targetId: 'ming-gong-analysis' },
          { name: 'Four Transformations', targetId: 'birth-year-sihua' },
          { name: 'Body Palace', targetId: 'shen-gong-analysis' },
          { name: 'Destiny Arrow', targetId: 'destiny-arrow-analysis' }
        ]
      };
    }
    
    // 特殊处理八字页面 - 显示自定义导航
    if (pathname.startsWith('/en/bazi')) {
      return {
        name: 'BaZi Navigation',
        icon: mainNavItems[0].icon,
        subItems: [
          { name: 'BaZi Chart', targetId: 'bazi-chart' },
          { name: 'Day Master', targetId: 'day-master-analysis' },
          { name: 'Elements', targetId: 'wuxing-analysis' },
          { name: 'Deity', targetId: 'yongshen-master' },
          { name: 'Prediction', targetId: 'tiekou-zhiduan' }
        ]
      };
    }
    
    // 特殊处理设置相关页面
    const settingsPages = ['/en/subscription', '/en/membership', '/en/settings', '/en/preferences', '/settings', '/en/profile'];
    if (settingsPages.some(page => pathname.startsWith(page))) {
      return mainNavItems.find(item => item.name === 'Settings');
    }
    
    // 特殊处理排盘页面
    if (pathname.startsWith('/en/create-chart')) {
      return mainNavItems.find(item => item.name === 'Create');
    }
    
    // 特殊处理命书页面  
    if (pathname.startsWith('/en/charts')) {
      return mainNavItems.find(item => item.name === 'Natal');
    }
    
    // 特殊处理我的档案相关页面 - 归属到首页 (仅处理中文路径)
    if (pathname.startsWith('/my-charts') && !pathname.startsWith('/en/')) {
      return mainNavItems.find(item => item.name === 'Home');
    }
    
    // 特殊处理Wiki页面
    if (pathname.startsWith('/en/wiki')) {
      return mainNavItems.find(item => item.name === 'Wiki');
    }
    
    // 特殊处理chatbot页面
    if (pathname.startsWith('/chatbot') || pathname.startsWith('/en/chatbot')) {
      return mainNavItems.find(item => item.name === 'AI Master');
    }
    
    const activeItem = mainNavItems
      .filter(item => item.href && item.href !== '#')
      .sort((a, b) => b.href.length - a.href.length)
      .find(item => pathname.startsWith(item.href.split('?')[0]));
    
    return activeItem || mainNavItems[0];
  };
  
  useEffect(() => {
    const currentNav = getCurrentNav();
    setSelectedNav(currentNav);
  }, [pathname, mainNavItems]);
  
  const getDisplayName = (navName: string) => {
    return navName;
  };
  
  const handleSubNavClick = (path: string, anchor?: string) => {
    if (anchor) {
      // 处理锚点功能
      if (selectedNav?.name === 'Home' && anchor === '#referral') {
        setHomeDialog('referral');
      } else if (selectedNav?.name === 'Home' && anchor === '#redeem') {
        setHomeDialog('redeem');
      } else if (selectedNav?.name === 'AI Master' && (anchor === '#ziwei-master' || anchor === '#bazi-master')) {
        // 处理AI Master的anchor，直接设置window.location.hash
        window.location.hash = anchor;
      }
    } else if (path) {
      router.push(path);
    }
  };
  
  // 移动端直接返回移动端布局
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 dark:from-gray-900 dark:via-gray-800/20 dark:to-primary/10">
        {/* 移动端顶部导航栏 */}
        {showNavigation && (
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-gray-800">
            <div className="container flex h-16 items-center justify-between px-4">
              <Link href="/en/home" className="flex items-center space-x-2">
                <Logo className="h-8 w-8" />
                <span className="text-xl font-bold text-primary dark:text-yellow-400">
                  AstroZi
                </span>
              </Link>
              
              {/* 移动端MENU按钮 */}
              <div className="flex items-center space-x-4" ref={mobileMenuRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="flex items-center space-x-2"
                >
                  <Menu className="h-4 w-4" />
                  <span className="hidden sm:inline">MENU</span>
                </Button>
                
                {/* 移动端下拉菜单 */}
                {showMobileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Navigation</h3>
                      {mainNavItems.map((item) => {
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
                              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                <Icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-900 dark:text-gray-100">{item.name}</span>
                              </div>
                              {item.subItems && item.subItems.length > 0 && (
                                isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-500" />
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
                                        router.push(subItem.href);
                                      } else if (subItem.anchor) {
                                        handleSubNavClick(item.href, subItem.anchor);
                                      } else if (subItem.targetId) {
                                        const element = document.getElementById(subItem.targetId);
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }
                                      setShowMobileMenu(false);
                                      setExpandedMobileNav(null);
                                    }}
                                    className="w-full text-left p-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                                  >
                                    {subItem.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
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
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t dark:border-gray-800">
            <div className="grid grid-cols-5 gap-1 p-2">
              {getBottomNavItems().map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex flex-col items-center justify-center p-2 text-xs font-medium transition-colors hover:text-primary dark:hover:text-yellow-400"
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
        {showNavigation && (
          <div className="md:hidden h-16" />
        )}
      </div>
    );
  }

  // 桌面端使用左侧导航模式
  return (
    <div className="h-screen bg-background dark:bg-slate-900 text-foreground font-sans flex overflow-hidden">
      {/* Primary Nav (Main icons) */}
      <aside className="bg-card dark:bg-slate-800/90 border-r border-border dark:border-slate-700 w-20 flex flex-col items-center py-4 shadow-sm">
        <button onClick={() => router.push('/en/home')} className="mb-8 hover:bg-accent/10 dark:hover:bg-slate-800/60 rounded-lg p-2 transition-colors">
          <div className="w-12 h-12 flex items-center justify-center">
            <Logo size={48} />
          </div>
        </button>
        <nav className="flex-1 flex flex-col items-center space-y-4">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedNav?.name === item.name;
            const commonProps = {
              className: `p-3 rounded-lg transition-all duration-200 ${
                isSelected 
                  ? 'bg-yellow-400 dark:bg-amber-400 text-black shadow-md hover:bg-yellow-500 dark:hover:bg-amber-500' 
                  : 'hover:bg-accent/10 dark:hover:bg-slate-800/60 text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-amber-400'
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
        
        {/* 移除语言切换功能 - 用户可在preferences中更改 */}
      </aside>

      {/* Secondary Nav (Sub-items) & Content */}
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-card dark:bg-slate-800/60 border-r border-border dark:border-slate-700 transition-all duration-300 flex flex-col shrink-0 shadow-sm ${
          isSecondaryNavOpen ? 'w-80 p-4' : 'w-0'
        }`} style={{ overflow: 'hidden' }}>
          <div className={`flex justify-between items-center mb-2 ${!isSecondaryNavOpen && 'hidden'}`}>
            <h2 className="text-xl font-semibold text-primary dark:text-yellow-400 whitespace-nowrap">
              {selectedNav ? getDisplayName(selectedNav.name) : ''}
            </h2>
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                title="Collapse" 
                className="text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-amber-400 ml-2" 
                onClick={() => setIsSecondaryNavOpen(false)}
              >
                <ChevronsLeft className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <nav className={`flex-1 flex flex-col overflow-y-auto ${!isSecondaryNavOpen && 'hidden'}`}>
            <div className="space-y-2">
              {selectedNav?.name !== 'Settings' && selectedNav?.subItems?.map((subItem: any, index: number) => {
                const isActive = subItem.href ? pathname.startsWith(subItem.href.split('?')[0]) : false;
                
                return (
                  <button 
                    key={`${subItem.name}-${index}`}
                    onClick={() => {
                      if (subItem.href) {
                        router.push(subItem.href);
                      } else if (subItem.anchor) {
                        handleSubNavClick(selectedNav?.href, subItem.anchor);
                      } else if (subItem.targetId) {
                        // 处理紫微页面的滚动导航
                        const element = document.getElementById(subItem.targetId);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }
                    }}
                    className={`flex items-center p-3 rounded-md ${
                      isActive 
                        ? 'bg-accent/20 dark:bg-amber-400/20 text-primary dark:text-amber-400' 
                        : 'text-muted-foreground dark:text-slate-300 hover:bg-accent/10 dark:hover:bg-slate-700/40'
                    } transition-colors duration-200 w-full text-left`}
                  >
                    {subItem.name}
                  </button>
                );
              })}
              
              {selectedNav?.name === 'Settings' && selectedNav?.subItems && (
                <>
                  {selectedNav.subItems.map((subItem: any, index: number) => (
                    <button 
                      key={`${subItem.name}-${index}`}
                      onClick={() => {
                        if (subItem.href) {
                          router.push(subItem.href);
                        } else if (subItem.anchor) {
                          const dialogKey = subItem.anchor.substring(1);
                          setSettingsDialog(dialogKey);
                        }
                      }}
                      className="flex items-center p-3 rounded-md text-foreground dark:text-slate-200 hover:bg-accent/10 dark:hover:bg-slate-700/40 hover:text-primary dark:hover:text-amber-400 transition-colors duration-200 w-full text-left"
                    >
                      {subItem.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto relative">
          {!isSecondaryNavOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSecondaryNavOpen(true)} 
              className="absolute top-2 left-2 z-10 text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-amber-400"
            >
              <ChevronsRight className="w-5 h-5" />
            </Button>
          )}
          <div className="flex-1 p-2 lg:p-4">
            {children}
          </div>
        </main>
      </div>

      {/* 设置对话框 */}
      <Dialog open={!!settingsDialog} onOpenChange={() => setSettingsDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="dark:text-amber-400">
              {settingsDialog === 'media-info' && 'Contact Us'}
              {settingsDialog === 'logout' && 'Logout Confirmation'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {settingsDialog === 'media-info' && (
              <div id="media-info">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary dark:text-yellow-400">Contact Us</h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground dark:text-slate-300">Contact feature coming soon...</p>
                  </div>
                </div>
              </div>
            )}

            {settingsDialog === 'logout' && (
              <div id="logout" className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-amber-400">Confirm Logout</h3>
                <p className="text-muted-foreground dark:text-slate-300">Are you sure you want to logout?</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive" onClick={async () => {
                    try {
                      // Import signOut function and clear user session
                      const { signOut } = await import('@/lib/auth');
                      await signOut();
                      setSettingsDialog(null);
                      // Redirect to landing page instead of auth page
                      router.push('/');
                    } catch (error) {
                      console.error('Logout failed:', error);
                      // Still redirect to landing page even if logout fails
                      setSettingsDialog(null);
                      router.push('/');
                    }
                  }}>
                    Confirm Logout
                  </Button>
                  <Button variant="outline" onClick={() => setSettingsDialog(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 首页功能对话框 */}
      <Dialog open={!!homeDialog} onOpenChange={() => setHomeDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {homeDialog === 'referral' && 'Invite Friends'}
              {homeDialog === 'redeem' && 'Redeem Code'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {homeDialog === 'referral' && (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary dark:text-yellow-400">Invite Friends</h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground dark:text-slate-300">Referral feature coming soon...</p>
                  </div>
                </div>
              </div>
            )}
            {homeDialog === 'redeem' && (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary dark:text-yellow-400">Redeem Code</h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground dark:text-slate-300">Redeem code feature coming soon...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 导出简化版本的页面包装器
export function EnglishPageWrapper({ children, title, showNavigation = true }: {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
}) {
  return (
    <EnglishLayout showNavigation={showNavigation}>
      {title && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-primary dark:text-yellow-400">
            {title}
          </h1>
        </div>
      )}
      {children}
    </EnglishLayout>
  );
} 