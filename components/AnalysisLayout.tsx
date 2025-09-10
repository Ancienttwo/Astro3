"use client"

import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react"
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Settings,
    LifeBuoy,
    LogOut,
    ChevronsLeft,
    ChevronsRight,
    User,
    Star,
    CalendarDays,
    Bot,
    X,
    Layers,
    Archive,
    Globe
} from "lucide-react";
import Logo from "./Logo";
import { FaMars, FaVenus } from 'react-icons/fa';
import { Button } from "@/components/ui/button";
// import { useRecords } from '@/contexts/RecordsContext'; // 已迁移到新架构
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
// import SimpleRecordCard from "./SimpleRecordCard"; // 已迁移到新架构

import { useIsMobile } from '@/hooks/useDeviceType';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import MediaInfo from "./MediaInfo";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import ReferralCodeManager from './ReferralCodeManager';
import PromoCodeRedeemer from './PromoCodeRedeemer';
import { supabase } from '@/lib/supabase';
import ZoomableLayout from './ZoomableLayout';

type CardControlContextType = {
  openCardId: string | null;
  setOpenCardId: (id: string | null) => void;
};

const CardControlContext = createContext<CardControlContextType | undefined>(undefined);

export const useCardControl = () => {
  const context = useContext(CardControlContext);
  if (!context) {
    throw new Error('useCardControl must be used within a CardControlProvider');
  }
  return context;
};

export const CardControlProvider = ({ children }: { children: ReactNode }) => {
  const [openCardId, setOpenCardId] = useState<string | null>(null);
  return (
    <CardControlContext.Provider value={{ openCardId, setOpenCardId }}>
      {children}
    </CardControlContext.Provider>
  );
};

// 基础导航项（不包含管理员专用功能）
const baseMainNavItems = [
    { name: '首页', icon: LayoutDashboard, subItems: [
        {name: '我的档案', href: '/profile'},
        {name: '我的星盘', href: '/my-charts'},
        {name: '万年历', href: '/calendar'},
        {name: '八字入门', href: '/wiki/bazi'},
        {name: '紫微入门', href: '/wiki/ziwei'},
        {name: '易经智慧', href: '/wiki/yijing'},
        {name: '会员中心', href: '/membership'},
        {name: '我的命书', href: '/charts'},
        {name: '命理百科', href: '/wiki'},
        {name: '订阅服务', href: '/subscription'},
        {name: '邀请好友', anchor: '#referral'},
        {name: '兑换码', anchor: '#redeem'}
    ], href: '/home' },
    { name: '百科', icon: Globe, subItems: [
        {name: '八字基础', href: '/wiki/bazi'},
        {name: '紫微斗数', href: '/wiki/ziwei'},
        {name: '五行理论', href: '/wiki/wuxing'},
        {name: '易经智慧', href: '/wiki/yijing'},
        {name: '六十四卦', href: '/wiki/yijing/sixtyfour-gua'}
    ], href: '/wiki' },
    { name: '排盘', icon: BarChart3, subItems: [
        {name: '八字排盘', href: '/create-chart?type=bazi'},
        {name: '紫微排盘', href: '/create-chart?type=ziwei'},
        {name: '批量导入', href: '/create-chart?mode=batch'}
    ], href: '/create-chart' },
    { name: '命书', icon: Archive, subItems: [
        {name: '我的命书', href: '/charts'},
        {name: '八字命盘', href: '/charts?type=bazi'},
        {name: '紫微命盘', href: '/charts?type=ziwei'},
        {name: '收藏夹', href: '/charts?category=favorites'},
        {name: '朋友圈', href: '/charts?category=friends'},
        {name: '家人圈', href: '/charts?category=family'}
    ], href: '/charts' },
    { name: 'AI大师', icon: Bot, subItems: [
        {name: '司天监正·星玄大人', anchor: '#ziwei-master'},
        {name: '玄虚道人', anchor: '#bazi-master'}
    ], href: '/chatbot' },
];

// 基础设置项 - 与移动端保持一致
const baseDesktopSettingsItems = [
    {name: '我的档案', href: '/profile'},
    {name: '会员中心', href: '/membership'},
    {name: '订阅服务', href: '/subscription'},
    {name: '偏好设置', href: '/preferences'},
    {name: '联系我们', anchor: '#media-info'},
    {name: '帮助中心', href: '/help-center'},
    {name: '登出账号', anchor: '#logout'}
];

// 管理员专用设置项 (知识库管理已转移到DIFY，不再需要)
const adminDesktopSettingsItems: any[] = [];

// 静态构建完整导航项 - 避免Loading跳转
const getStaticNavItems = (isAdmin: boolean = false) => {
  const settingsItems = isAdmin 
    ? [...baseDesktopSettingsItems.slice(0, 2), ...adminDesktopSettingsItems, ...baseDesktopSettingsItems.slice(2)]
    : baseDesktopSettingsItems;
  
  return [
    ...baseMainNavItems,
    { 
      name: '设置', 
      icon: Settings, 
      subItems: settingsItems, 
      href: '#'
    }
  ];
};

const secondaryNavFooterItems = [
    // 帮助中心和登出账号已移至设置子目录
]

export default function AnalysisLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // const { records, selectedRecord, selectRecord } = useRecords(); // 已迁移到新架构
  const records: any[] = []; // 临时兼容
  const selectedRecord = null; // 临时兼容
  const selectRecord = (_: any) => {}; // 临时兼容
  const { openCardId, setOpenCardId } = useCardControl();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [mainNavItems, setMainNavItems] = useState<any[]>(getStaticNavItems(false)); // 初始化为基础导航项
  const [selectedNav, setSelectedNav] = useState<any>(null);
  const [isSecondaryNavOpen, setIsSecondaryNavOpen] = useState(true);
  const [settingsDialog, setSettingsDialog] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [homeDialog, setHomeDialog] = useState<string | null>(null);
  const [navInitialized, setNavInitialized] = useState(false);

  const isMobile = useIsMobile();
  
  const getCurrentNav = () => {
    if (!mainNavItems || mainNavItems.length === 0) {
      return null;
    }
    
    // 特殊处理紫微页面 - 显示自定义导航
    if (pathname.startsWith('/ziwei')) {
      return {
        name: '紫微导航',
        icon: mainNavItems[0].icon,
        subItems: [
          { name: '紫微星盘', targetId: 'ziwei-chart' },
          { name: '宿世因缘', targetId: 'lai-yin-analysis' },
          { name: '我的命宫', targetId: 'ming-gong-analysis' },
          { name: '生年四化', targetId: 'birth-year-sihua' },
          { name: '我的身宫', targetId: 'shen-gong-analysis' },
          { name: '命运之箭', targetId: 'destiny-arrow-analysis' }
        ]
      };
    }
    
    // 特殊处理八字页面 - 显示自定义导航
    if (pathname.startsWith('/bazi')) {
      return {
        name: '八字导航',
        icon: mainNavItems[0].icon,
        subItems: [
          { name: '八字命盘', targetId: 'bazi-chart' },
          { name: '日主五行', targetId: 'day-master-analysis' },
          { name: '五行分析', targetId: 'wuxing-analysis' },
          { name: '用神推理', targetId: 'yongshen-master' },
          { name: '铁口直断', targetId: 'tiekou-zhiduan' }
        ]
      };
    }
    
    // 特殊处理设置相关页面
    const settingsPages = ['/subscription', '/membership', '/settings', '/preferences', '/profile'];
    if (settingsPages.some(page => pathname.startsWith(page))) {
      return mainNavItems.find(item => item.name === '设置');
    }
    
    // 特殊处理排盘页面
    if (pathname.startsWith('/create-chart')) {
      return mainNavItems.find(item => item.name === '排盘');
    }
    
    // 特殊处理命书页面  
    if (pathname.startsWith('/charts')) {
      return mainNavItems.find(item => item.name === '命书');
    }
    
    // 特殊处理我的星盘页面 - 归属到首页
    if (pathname.startsWith('/my-charts')) {
      return mainNavItems.find(item => item.name === '首页');
    }
    
    const activeItem = mainNavItems
      .filter(item => item.href && item.href !== '#')
      .sort((a, b) => b.href.length - a.href.length)
      .find(item => pathname.startsWith(item.href));
    
    return activeItem || mainNavItems[0];
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        let userIsAdmin = false
        if (user) {
          setCurrentUser(user)
          // 简化权限判断，暂时不区分管理员
          userIsAdmin = false
          setIsAdmin(userIsAdmin)
        } else {
          userIsAdmin = false
          setIsAdmin(userIsAdmin)
        }
        const navItems = getStaticNavItems(userIsAdmin)
        setMainNavItems(navItems)
        setNavInitialized(true)
      } catch (error) {
        console.error('认证检查失败:', error)
        setIsAdmin(false)
        const navItems = getStaticNavItems(false)
        setMainNavItems(navItems)
        setNavInitialized(true)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!navInitialized) {
      return;
    }
    
    const currentNav = getCurrentNav();
    setSelectedNav(currentNav);
  }, [pathname, mainNavItems, navInitialized]);



  const handleNavClick = (path: string, anchor?: string) => {
    // 映射锚点ID到实际的卡片ID
    const getActualCardId = (anchorId: string, currentPath: string): string => {
      if (currentPath === '/bazi') {
        const baziMapping: { [key: string]: string } = {
          'bazi-chart': 'bazi-natal-chart',
          'wuxing-analysis': 'bazi-day-master-analysis', 
          'bazi-element-analysis': 'bazi-element-analysis',
          'yongshen-reasoning': 'yongshen-reasoning',
          'tiekou-zhiduan': 'tiekou-zhiduan'
        };
        return baziMapping[anchorId] || anchorId;
      } else if (currentPath === '/ziwei') {
        const ziweiMapping: { [key: string]: string } = {
          'ziwei-chart': 'ziwei-chart',
          'lai-yin-analysis': 'lai-yin-analysis',
          'ming-gong-analysis': 'ming-gong-analysis',
          'sihua-analysis': 'birth-year-sihua',
          'shen-gong-analysis': 'shen-gong-analysis',
          'destiny-arrow-analysis': 'destiny-arrow-analysis',
          'ziwei-reasoning-master': 'ziwei-reasoning-master'
        };
        return ziweiMapping[anchorId] || anchorId;
      }
      return anchorId;
    };

    if (path === pathname) {
      if (anchor) {
        const anchorId = anchor.substring(1);
        
                                // 特殊处理chatbot页面的BOT切换
                        if (path === '/chatbot' && (anchorId === 'ziwei-master' || anchorId === 'bazi-master')) {
                          // 直接更新URL hash，让chatbot页面的监听器处理
                          window.location.hash = anchor;
                          return;
                        }
        
        const cardId = getActualCardId(anchorId, path);
        setOpenCardId(cardId);
        
        // 延迟滚动以确保卡片已经打开
        setTimeout(() => {
          const element = document.getElementById(cardId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } else {
      // 跳转到其他页面
      router.push(path);
      if (anchor) {
        const anchorId = anchor.substring(1);
        const cardId = getActualCardId(anchorId, path);
        // 页面加载后自动打开卡片并滚动
        setTimeout(() => {
          setOpenCardId(cardId);
          setTimeout(() => {
            const element = document.getElementById(cardId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 200);
        }, 500);
      }
    }
  };

  // 处理二级导航点击
  const handleSubNavClick = (path: string, anchor?: string) => {
    handleNavClick(path, anchor);
  };

  const getActualCardId = (anchorId: string, currentPath: string): string => {
    if (currentPath === '/bazi') {
      const baziMapping: { [key: string]: string } = {
        'bazi-chart': 'bazi-natal-chart',
        'wuxing-analysis': 'bazi-day-master-analysis', 
        'bazi-element-analysis': 'bazi-element-analysis',
        'yongshen-reasoning': 'yongshen-reasoning',
        'tiekou-zhiduan': 'tiekou-zhiduan'
      };
      return baziMapping[anchorId] || anchorId;
    }
    return anchorId;
  };

  const handleBackToDashboard = () => {
    selectRecord(null);
    router.push('/dashboard');
  };

  const getDisplayName = (navName: string) => {
    if (isMobile) {
      // 移动端显示优化
    } else {
      // 桌面端特殊显示
      if (navName === '百科') return '命理百科';
    }
    return navName;
  };

  // 导航项现在是静态初始化的，不再需要Loading状态

  return (
    <ZoomableLayout 
      showZoomControl={true}
      zoomControlPosition="bottom-right"
      enableKeyboardShortcuts={true}
      onlyDesktop={true}
    >
      <div className="flex h-screen bg-background dark:bg-slate-900 text-foreground font-sans">
      {/* Main Nav (Icons) */}
      <aside className="w-20 bg-card dark:bg-slate-900/95 border-r border-border dark:border-slate-700 flex flex-col items-center p-4 space-y-6 shadow-sm">
        <button 
          onClick={() => router.push('/home')}
          className="text-primary hover:text-primary/80 dark:hover:text-amber-300 transition-colors duration-200 p-2 rounded-lg hover:bg-accent/10 dark:hover:bg-slate-800/60" 
          title="返回主页"
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <Logo size={48} />
          </div>
        </button>
        <nav className="flex-1 flex flex-col items-center space-y-4">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedNav?.name === item.name;
            const commonProps = {
                className: `p-3 rounded-lg transition-all duration-200 ${isSelected ? 'bg-yellow-400 dark:bg-amber-400 text-black shadow-md hover:bg-yellow-500 dark:hover:bg-amber-500' : 'hover:bg-accent/10 dark:hover:bg-slate-800/60 text-muted-foreground dark:text-slate-400 hover:text-primary dark:hover:text-amber-400'}`,
                title: item.name,
            };

            if (item.href === '#') {
                return (
                    <button key={item.name} {...commonProps} onClick={() => {
                        setSelectedNav(item);
                        if (!isSecondaryNavOpen) setIsSecondaryNavOpen(true);
                    }}>
                        <Icon size={24} />
                    </button>
                )
            }

            return (
              <Link key={item.name} href={item.href} {...commonProps} onClick={() => setSelectedNav(item)}>
                <Icon size={24} />
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Secondary Nav (Sub-items) & Content */}
      <div className="flex flex-1 overflow-hidden">
        <aside className={`bg-card dark:bg-slate-800/60 border-r border-border dark:border-slate-700 transition-all duration-300 flex flex-col shrink-0 shadow-sm ${isSecondaryNavOpen ? 'w-80 p-4' : 'w-0'}`} style={{ overflow: 'hidden' }}>
            <div className={`flex justify-between items-center mb-2 ${!isSecondaryNavOpen && 'hidden'}`}>
                <h2 className="text-xl font-semibold text-primary dark:text-yellow-400 whitespace-nowrap">{selectedNav ? getDisplayName(selectedNav.name) : ''}</h2>
                <div className="flex items-center">

                    <Button variant="ghost" size="icon" title="Collapse" className="text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-amber-400 ml-2" onClick={() => setIsSecondaryNavOpen(false)}>
                        <ChevronsLeft className="w-5 h-5" />
                    </Button>
                </div>
            </div>
            <nav className={`flex-1 flex flex-col overflow-y-auto ${!isSecondaryNavOpen && 'hidden'}`}>
                <div className="space-y-2">
                    {selectedNav?.name !== '设置' && selectedNav?.subItems?.map((subItem: any, index: number) => {
                        const isActive = subItem.anchor 
                            ? openCardId === getActualCardId(subItem.anchor.substring(1), pathname)
                            : subItem.href ? pathname.startsWith(subItem.href) : false;
                        return (
                            <button 
                                key={`${subItem.name}-${index}`}
                                                            onClick={() => {
                                if (subItem.href) {
                                    // 直接跳转到指定页面
                                    router.push(subItem.href);
                                } else if (subItem.anchor) {
                                    // 首页特殊功能处理
                                    if (selectedNav?.name === '首页' && subItem.anchor === '#referral') {
                                        setHomeDialog('referral');
                                    } else if (selectedNav?.name === '首页' && subItem.anchor === '#redeem') {
                                        setHomeDialog('redeem');
                                    } else {
                                        // 锚点跳转（用于分析页面内的卡片）
                                        handleSubNavClick(selectedNav?.href, subItem.anchor);
                                    }
                                } else if (subItem.targetId) {
                                    // 处理紫微页面的滚动导航
                                    const element = document.getElementById(subItem.targetId);
                                    if (element) {
                                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }
                                }
                            }}
                                className={`flex items-center p-3 rounded-md ${isActive ? 'bg-accent/20 dark:bg-amber-400/20 text-primary dark:text-amber-400' : 'text-muted-foreground dark:text-slate-300 hover:bg-accent/10 dark:hover:bg-slate-700/40'} transition-colors duration-200 w-full text-left`}
                            >
                                {subItem.name}
                            </button>
                        );
                    })}
                </div>
                <div className="space-y-2">
                    {selectedNav?.name === '设置' && selectedNav?.subItems && (
                        <>
                            {/* 重新构建的设置选项列表 */}
                            {selectedNav.subItems.map((subItem: any, index: number) => (
                                <button 
                                    key={`${subItem.name}-${index}`}
                                    onClick={() => {
                                        if (subItem.href) {
                                            // 直接跳转到指定页面
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
                <Button variant="ghost" size="icon" onClick={() => setIsSecondaryNavOpen(true)} className="absolute top-2 left-2 z-10 text-gray-400 dark:text-slate-400 hover:text-primary dark:hover:text-amber-400">
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

              {settingsDialog === 'appearance' && '偏好设置'}
              
              {settingsDialog === 'media-info' && '联系我们'}
              {settingsDialog === 'logout' && '登出确认'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">


            {settingsDialog === 'appearance' && (
              <div id="appearance" className="space-y-4">
                <h3 className="text-lg font-semibold text-primary dark:text-yellow-400">偏好设置</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground dark:text-slate-300">偏好设置功能开发中...</p>
                </div>
              </div>
            )}

            {settingsDialog === 'media-info' && (
              <div id="media-info">
                <MediaInfo />
              </div>
            )}

            {settingsDialog === 'logout' && (
              <div id="logout" className="space-y-4">
                <h3 className="text-lg font-semibold dark:text-amber-400">确认登出</h3>
                <p className="text-muted-foreground dark:text-slate-300">您确定要登出当前账户吗？</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive" onClick={async () => {
                    try {
                      await supabase.auth.signOut();
                      setCurrentUser(null);
                      setSettingsDialog(null);
                      // Redirect to landing page instead of auth page
                      router.push('/');
                    } catch (error) {
                      console.error('登出失败:', error);
                      // Still redirect to landing page even if logout fails
                      setSettingsDialog(null);
                      router.push('/');
                    }
                  }}>
                    确认登出
                  </Button>
                  <Button variant="outline" onClick={() => setSettingsDialog(null)}>
                    取消
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
              {homeDialog === 'referral' && '邀请好友'}
              {homeDialog === 'redeem' && '兑换码'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {homeDialog === 'referral' && (
              <div>
                <ReferralCodeManager />
              </div>
            )}
            {homeDialog === 'redeem' && (
              <div>
                <PromoCodeRedeemer />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ZoomableLayout>
  );
} 