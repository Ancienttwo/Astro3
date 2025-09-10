"use client"

import { useState, useEffect, ReactNode, useRef } from "react"
import {
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Settings,
    LifeBuoy,
    LogOut,
    PlusCircle,
    User,
    Star,
    CalendarDays,
    Bot,
    X,
    Layers,
    SunMoon,
    Compass,
    Archive,
    Globe,
    ArrowLeft,
    ChevronRight,
    Calendar,
    Menu
} from "lucide-react";
import { SafeCrown } from '@/components/ui/safe-icon';
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
// import { useRecords } from '@/contexts/RecordsContext'; // 已迁移到新架构
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
// import SimpleRecordCard from "./SimpleRecordCard"; // 已迁移到新架构
import { 
  FadeUp, 
  StaggerContainer, 
  StaggerItem 
} from "@/components/ui/scroll-reveal";
import { BOTTOM_NAV_ITEMS } from '@/lib/navigation';

import { useCardControl } from './AnalysisLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MediaInfo from "./MediaInfo";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import { getCurrentUnifiedUser, signOut } from '@/lib/auth';
import type { UnifiedUser } from '@/lib/auth';

// 移动端导航状态类型
type MobileNavMode = 'main' | 'subNav' | 'content';

// 导航项接口
interface NavItem {
  name: string;
  icon: any;
  subItems: { name: string; anchor?: string; href?: string }[];
  href: string;
  pageHref?: string;
}

// 基础导航项（不包含管理员专用功能）
const baseNavItems: NavItem[] = [
    { name: '百科', icon: Globe, subItems: [], href: '/wiki' },
    { name: '命书', icon: BookOpen, subItems: [], href: '/charts' },
    { name: '排盘', icon: BarChart3, subItems: [], href: '/create-chart' },
    { name: 'AI大师', icon: Bot, subItems: [
        {name: '玄虚道人', anchor: '#bazi-master'},
        {name: '司天监正·星玄大人', anchor: '#ziwei-master'}
    ], href: '/chatbot' },
];

// 基础设置项
const baseSettingsItems = [
    {name: '我的档案', href: '/profile'},
    {name: '会员中心', href: '/membership'},
    {name: '订阅服务', href: '/subscription'},
    {name: '偏好设置', href: '/preferences'},
    {name: '联系我们', anchor: '#media-info'},
    {name: '帮助中心', href: '/help-center'},
    {name: '登出账号', anchor: '#logout'}
];

interface MobileNavigationProps {
  children: ReactNode;
  hideBottomNav?: boolean;
}

export default function MobileNavigation({ children, hideBottomNav = false }: MobileNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();
  // const { records, selectedRecord, selectRecord } = useRecords(); // 已迁移到新架构
  const records: any[] = []; // 临时兼容
  const selectedRecord = null; // 临时兼容
  const selectRecord = (_: any) => {}; // 临时兼容
  const { openCardId, setOpenCardId } = useCardControl();
  
  // 移动端导航状态
  const [navMode, setNavMode] = useState<MobileNavMode>(() => {
    // 🔥 初始化时就判断chatbot页面
    if (pathname === '/chatbot') {
      console.log('⚡ 初始化时检测到chatbot页面，设置为main模式（等待mainNavItems加载）');
      return 'main';
    }
    return 'main';
  });
  const [selectedNav, setSelectedNav] = useState<NavItem | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState<string | null>(null);
  const [mainNavItems, setMainNavItems] = useState<NavItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UnifiedUser | null>(null);
  const [selectedRecordCategory, setSelectedRecordCategory] = useState<string | null>(null);
  const [isManualNavigation, setIsManualNavigation] = useState(false);
  const [pendingNavState, setPendingNavState] = useState<{nav: NavItem | null, mode: MobileNavMode} | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);

  // 获取当前导航项
  const getCurrentNav = () => {
    // 特殊处理会员中心页面
    if (pathname.startsWith('/membership')) {
      return {
        name: '会员中心',
        icon: SafeCrown,
        subItems: [],
        href: '/membership'
      };
    }
    
    // 特殊处理订阅服务页面
    if (pathname.startsWith('/subscription')) {
      return {
        name: '订阅服务',
        icon: SafeCrown,
        subItems: [],
        href: '/subscription'
      };
    }
    
    // 特殊处理帮助中心页面
    if (pathname.startsWith('/help-center')) {
      return {
        name: '帮助中心',
        icon: LifeBuoy,
        subItems: [],
        href: '/help-center'
      };
    }
    
    // 特殊处理设置页面 - 应该显示为独立页面
    if (pathname.startsWith('/settings')) {
      return {
        name: '设置',
        icon: Settings,
        subItems: [],
        href: '/settings'
      };
    }
    
    // 特殊处理我的档案页面
    if (pathname.startsWith('/profile')) {
      return {
        name: '我的档案',
        icon: User,
        subItems: [],
        href: '/profile'
      };
    }
    
    // 特殊处理偏好设置页面 - 应该显示为独立页面
    if (pathname.startsWith('/preferences')) {
      return {
        name: '偏好设置',
        icon: Settings,
        subItems: [],
        href: '/preferences'
      };
    }
    
    // 特殊处理八字页面 - 现在归属于排盘功能
    if (pathname.startsWith('/bazi')) {
      return {
        name: '八字命盘',
        icon: Compass,
        subItems: [],
        href: '/bazi'
      };
    }
    
    // 特殊处理紫微页面 - 现在归属于排盘功能
    if (pathname.startsWith('/ziwei')) {
      return {
        name: 'ZiWei Astrology',
        icon: SunMoon,
        subItems: [],
        href: '/ziwei'
      };
    }
    
    // 特殊处理英文版紫微页面 - 提供完整的导航菜单
    if (pathname.startsWith('/en/ziwei')) {
      return {
        name: 'ZiWei Astrology',
        icon: SunMoon,
        subItems: [
          { name: 'Zi Wei Chart', anchor: '#ziwei-chart' },
          { name: 'Previous Life Karma', anchor: '#lai-yin-analysis' },
          { name: 'My Life Palace', anchor: '#ming-gong-analysis' },
          { name: 'Birth Year Four Transformations', anchor: '#birth-year-sihua' },
          { name: 'My Body Palace', anchor: '#shen-gong-analysis' },
          { name: 'Destiny Arrow', anchor: '#destiny-arrow-analysis' },
          { name: 'Back to Home', href: '/en/home' }
        ],
        href: '/en/ziwei'
      };
    }
    
    // 特殊处理chatbot页面 - 需要返回AI大师导航项
    if (pathname.startsWith('/chatbot')) {
      // 🔥 优先从mainNavItems查找，如果为空则从baseNavItems查找
      let aiNav = mainNavItems.find(item => item.name === 'AI大师');
      if (!aiNav && mainNavItems.length === 0) {
        aiNav = baseNavItems.find(item => item.name === 'AI大师');
      }
      console.log('🔍 chatbot页面getCurrentNav:', { 
        mainNavItemsLength: mainNavItems.length,
        baseNavItemsLength: baseNavItems.length,
        aiNavFound: !!aiNav,
        aiNavSubItems: aiNav?.subItems?.length || 0,
        source: mainNavItems.length > 0 ? 'mainNavItems' : 'baseNavItems'
      });
      return aiNav || null;
    }
    
    const activeItem = mainNavItems
      .filter(item => item.href && item.href !== '#')
      .sort((a, b) => b.href.length - a.href.length)
      .find(item => pathname.startsWith(item.href));
    
    return activeItem || null;
  };

  // 检测是否在内容页面
  const isInContentPage = () => {
    return ['/dashboard', '/bazi', '/ziwei', '/chatbot', '/charts', '/create-chart', '/membership', '/subscription', '/settings', '/preferences', '/home', '/wiki', '/calendar', '/help-center', '/profile', '/en/'].some(path => pathname.startsWith(path));
  };

  // 初始化导航项和权限检查
  useEffect(() => {
    const initializeNavigation = async () => {
      try {
        // 获取当前用户信息
        const user = await getCurrentUnifiedUser();
        setCurrentUser(user);
        
        // 不再检查管理员权限，直接使用基础设置项
        const settingsItems = baseSettingsItems;
        
        // 构建完整导航项
        const navItems = [
          ...baseNavItems,
          { name: '设置', icon: Settings, subItems: settingsItems, href: '#' }
        ];
        
        setMainNavItems(navItems);
      } catch (error) {
        console.error('初始化导航失败:', error);
        // 即使出错也要设置基础导航项
        const navItems = [
          ...baseNavItems,
          { name: '设置', icon: Settings, subItems: baseSettingsItems, href: '#' }
        ];
        setMainNavItems(navItems);
      }
    };
    
    initializeNavigation();
  }, []);

  // 处理点击外部关闭菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [addMenuRef]);

  // 处理待定导航状态
  useEffect(() => {
    if (pendingNavState && pathname === '/chatbot') {
      console.log('✅ 应用待定的导航状态:', pendingNavState);
      setSelectedNav(pendingNavState.nav);
      setNavMode(pendingNavState.mode);
      setPendingNavState(null);
    }
  }, [pathname, pendingNavState]);

  useEffect(() => {
    if (mainNavItems.length > 0) {
      // 如果有待定状态，跳过自动处理，等待上面的useEffect处理
      if (pendingNavState) {
        console.log('⏭️ 跳过自动路径处理，因为有待定的导航状态');
        return;
      }
      
      // 如果是手动导航，跳过自动路径处理
      if (isManualNavigation) {
        console.log('⏭️ 跳过自动路径处理，因为这是手动导航');
        setIsManualNavigation(false);
        return;
      }
      
      const currentNav = getCurrentNav();
      console.log('🔍 MobileNavigation Debug:', { 
        pathname, 
        currentNav: currentNav?.name, 
        currentNavSubItems: currentNav?.subItems?.length || 0,
        isInContentPage: isInContentPage(),
        navMode,
        isManualNavigation,
        hasPendingNavState: !!pendingNavState
      });
      
      if (currentNav && isInContentPage()) {
        // 特殊处理chatbot页面 - 当有待定状态时优先显示SubNav
        if (pathname === '/chatbot' && currentNav.name === 'AI大师') {
          console.log('🤖 chatbot页面检测到AI大师导航项，当前navMode:', navMode);
          // 如果有待定状态或者不是SubNav模式，则设置为SubNav
          if (pendingNavState || navMode !== 'subNav') {
            console.log('🔄 设置chatbot页面为SubNav模式');
            setSelectedNav(currentNav);
            setNavMode('subNav');
          }
          return;
        }
        
        // 检查当前导航项是否有子项
        if (currentNav.subItems && currentNav.subItems.length > 0) {
          // 有子项的导航项应该显示SubNav模式，但不覆盖用户手动操作
          if (navMode !== 'subNav') {
            console.log('🔄 设置SubNav模式，因为有子项:', currentNav.name);
            setSelectedNav(currentNav);
            setNavMode('subNav');
          }
        } else {
          // 只有在不是子导航模式时才设置为content模式
          if (navMode !== 'subNav') {
            setNavMode('content');
            setSelectedNav(currentNav);
          }
        }
      } else {
        // 如果在根路径，跳转到首页
        if (pathname === '/') {
          console.log('🔄 根路径重定向到首页');
          router.push('/home');
          return;
        }
        // 如果在首页，只有在不是子导航模式时才显示内容模式
        if (pathname === '/home') {
          // 添加延迟检查，避免立即覆盖用户的子导航选择
          setTimeout(() => {
            if (navMode !== 'subNav' && !pendingNavState) {
              setNavMode('content');
              setSelectedNav(null); // 首页不需要选中特定导航项
            }
          }, 50);
          return;
        }
        // 检查是否是内容页面，如果是则不重定向
        if (isInContentPage()) {
          console.log('✅ 内容页面，不重定向');
          setNavMode('content');
          setSelectedNav(null);
          return;
        }
        // 对于其他情况，也跳转到首页而不是显示主导航
        console.log('❌ 不是内容页面，重定向到首页');
        router.push('/home');
      }
    } else {
      // 🔥 修复关键问题：在mainNavItems加载完成之前，特殊处理chatbot页面
      if (pathname === '/chatbot') {
        console.log('⚡ chatbot页面等待mainNavItems加载，当前navMode:', navMode);
        // 保持当前状态，等待mainNavItems加载完成
        return;
      }
    }
  }, [pathname, mainNavItems, isManualNavigation, pendingNavState]);

  // 处理一级导航点击
  const handleMainNavClick = (item: NavItem) => {
    setIsManualNavigation(true);
    
    if (item.href === '#') {
      // 特殊处理（如命运图书馆）
      setSelectedNav(item);
      setNavMode('subNav');
    } else if (item.subItems.length > 0) {
      // 有子项的导航，先显示二级导航
      setSelectedNav(item);
      // 使用setTimeout确保状态更新不会被路径监听覆盖
      setTimeout(() => {
        setNavMode('subNav');
      }, 10);
    } else {
      // 直接跳转
      router.push(item.href);
    }
  };

  // 处理二级导航点击
  const handleSubNavClick = (path: string, anchor?: string) => {
    setIsManualNavigation(true);
    // 映射锚点ID到实际的卡片ID
    const getActualCardId = (anchorId: string, currentPath: string): string => {
      if (currentPath === '/bazi') {
        const baziMapping: { [key: string]: string } = {
          'bazi-chart': 'bazi-natal-chart',
          'wuxing-analysis': 'bazi-day-master-analysis', 
          'bazi-element-analysis': 'bazi-element-analysis'
        };
        return baziMapping[anchorId] || anchorId;
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
          console.log('🔄 移动端切换BOT:', anchorId);
          // 🔥 延迟切换到content模式，给chatbot页面时间更新状态
          setTimeout(() => {
            setNavMode('content');
          }, 100);
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
      setNavMode('content');
    } else {
      // 跳转到其他页面
      router.push(path);
      if (anchor) {
        const anchorId = anchor.substring(1);
        
        // 特殊处理chatbot页面的BOT切换
        if (path === '/chatbot' && (anchorId === 'ziwei-master' || anchorId === 'bazi-master')) {
          // 页面加载后设置hash，让chatbot页面的监听器处理
          setTimeout(() => {
            window.location.hash = anchor;
            console.log('🔄 移动端跳转后切换BOT:', anchorId);
            // 🔥 给chatbot页面时间更新状态后再切换到content模式
            setTimeout(() => {
              setNavMode('content');
            }, 200);
          }, 500);
          return;
        }
        
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
      setNavMode('content');
    }
  };

  // 返回导航模式
  const handleBackToNav = () => {
    setIsManualNavigation(true);
    
    if (navMode === 'content') {
      if (selectedNav?.subItems.length) {
        setNavMode('subNav');
      } else {
        // 🎯 智能返回：使用浏览器历史记录返回上一页
        // 这样从 settings -> profile 返回时，会回到 settings 而不是 home
        try {
          // 检查是否有历史记录可以返回
          if (window.history.length > 1) {
            router.back();
          } else {
            // 如果没有历史记录，则跳转到首页
            router.push('/home');
          }
        } catch (error) {
          // 降级处理：如果出错就跳转到首页
          console.warn('返回上一页失败，跳转到首页:', error);
          router.push('/home');
        }
        setSelectedNav(null);
      }
    } else if (navMode === 'subNav') {
      // 从子导航返回时，也使用智能返回逻辑
      try {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/home');
        }
      } catch (error) {
        console.warn('从子导航返回失败，跳转到首页:', error);
        router.push('/home');
      }
      setNavMode('content');
      setSelectedNav(null);
    }
  };

  // 获取移动端显示名称
  const getDisplayName = (navName: string) => {
    if (navName === '八字命盘') return '八字';
    if (navName === 'ZiWei Astrology') return 'ZiWei';
    return navName;
  };

  // 渲染Tab导航
  const renderTabNavigation = () => {
    const categories = [
      { key: 'all', label: '全部' },
      { key: 'friends', label: '朋友' },
      { key: 'family', label: '家人' },
      { key: 'clients', label: '客户' },
      { key: 'favorites', label: '最爱' },
      { key: 'others', label: '其他' }
    ];
    
    const currentCategory = selectedRecordCategory || 'all';
    
    return (
      <div className="border-b border-gray-200 dark:border-slate-600 -mx-4 px-4">
        <div className="flex w-full">
          {categories.map((category) => {
            const isActive = currentCategory === category.key;
            
            return (
              <button
                key={category.key}
                onClick={() => setSelectedRecordCategory(category.key === 'all' ? null : category.key)}
                className={`flex-1 py-2 text-xs font-medium border-b-2 transition-all duration-200 ${
                  isActive 
                    ? "border-yellow-400 dark:border-amber-400 text-yellow-600 dark:text-amber-400 bg-yellow-50 dark:bg-amber-400/10" 
                    : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-500"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染命书列表
  const renderRecordsList = () => {
    try {
      const currentCategory = selectedRecordCategory || 'all';
      const filteredRecords = currentCategory === 'all' 
        ? records
        : records.filter(record => {
            const recordCategory = (record as any).category || 'others';
            return recordCategory === currentCategory;
          });
      
      // 显示迁移提示
      return (
        <div className="text-center py-8 text-muted-foreground dark:text-slate-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p className="font-semibold">命盘功能已迁移</p>
          <p className="text-sm mt-1">请前往 <span className="text-yellow-600">/charts</span> 页面使用新的命盘管理系统</p>
          <button 
            onClick={() => router.push('/charts')}
            className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 transition-colors"
          >
            前往新版命盘
          </button>
        </div>
      );

      if (false) { // 旧代码，已禁用
        const categoryLabels = {
          'friends': '朋友',
          'family': '家人',
          'clients': '客户',
          'favorites': '最爱',
          'others': '其他'
        };
        
        return (
          <div className="text-center py-8 text-muted-foreground dark:text-slate-400">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p>
              {currentCategory !== 'all' 
                ? `暂无${categoryLabels[currentCategory as keyof typeof categoryLabels] || '未知'}分类的记录`
                : '还没有命书记录'
              }
            </p>
            {currentCategory === 'all' && (
              <p className="text-sm mt-1">点击右上角 + 号创建您的第一个命盘</p>
            )}
          </div>
        );
      }
    } catch (error) {
      console.error('渲染命书列表时出错:', error);
      return (
        <div className="text-center py-8 text-muted-foreground dark:text-slate-400">
          <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>加载命书列表时出现错误</p>
        </div>
      );
    }
  };

  // 渲染主导航页面
  const renderMainNav = () => {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Logo size={88} variant="app" className="mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground dark:text-slate-400">正在跳转到主页...</p>
        </div>
      </div>
    );
  };

  // 渲染二级导航页面
  const renderSubNav = () => {
    if (!selectedNav) return null;

    return (
      <div className="flex-1 flex flex-col">
        {/* 顶部导航栏 - 与Home页面格式一致 */}
        <div className="bg-white px-4 py-1 flex items-center justify-between border-b border-gray-100 relative">
          <button
            onClick={handleBackToNav}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <h1 className="text-lg font-bold text-gray-900">{getDisplayName(selectedNav.name)}</h1>
          
          {/* 右侧菜单按钮 */}
          <div className="relative">
            <button 
              onClick={() => setShowAddMenu(prev => !prev)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* 下拉菜单 */}
            {showAddMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                <button
                  onClick={() => { 
                    router.push('/home');
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  回到首页
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1 p-4 pb-20">
          
          {/* 命书页面的新增按钮 */}
          {selectedNav.name === '命书' && (
            <div className="mb-6">
              <div className="relative" ref={addMenuRef}>
                <button
                  onClick={() => setShowAddMenu(prev => !prev)}
                  className="p-2 rounded-lg hover:bg-accent/10 dark:hover:bg-slate-700/40 text-primary dark:text-amber-400"
                >
                  <PlusCircle size={20} />
                </button>
                {showAddMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg z-50 py-2">
                    <button
                      onClick={() => { 
                        selectRecord(null); 
                        router.push('/create-chart');
                        setShowAddMenu(false);
                        // 更新导航状态
                        const createChartNav = mainNavItems.find(item => item.href === '/create-chart');
                        if (createChartNav) {
                          setSelectedNav(createChartNav);
                          setNavMode('content');
                        }
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-700/60 text-gray-700 dark:text-slate-200 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 mr-3 inline" />
                      排盘
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedNav.name === '命书' ? (
            <div className="space-y-4">
              {/* 分类Tab导航 */}
              {renderTabNavigation()}

              {/* 命书列表 */}
              <div className="space-y-3">
                {renderRecordsList()}
              </div>
            </div>
          ) : (
            <StaggerContainer className="space-y-3">
              {selectedNav.subItems.map((subItem) => (
                <StaggerItem key={subItem.name}>
                  <button
                  key={subItem.name}
                  onClick={() => {
                    if (selectedNav.name === '设置') {
                      if (subItem.href) {
                        // 直接跳转到指定页面
                        router.push(subItem.href);
                        setNavMode('content');
                      } else if (subItem.anchor) {
                        const dialogKey = subItem.anchor.substring(1);
                        setSettingsDialog(dialogKey);
                      }
                    } else if (selectedNav.name === '百科' && subItem.href) {
                      // 百科子项直接跳转到独立页面
                      router.push(subItem.href);
                      setNavMode('content');
                    } else if (selectedNav.name === 'Zi Wei Dou Shu' && subItem.href) {
                      // 英文版紫微页面的特殊处理
                      router.push(subItem.href);
                      setNavMode('content');
                    } else {
                      handleSubNavClick(selectedNav.href, subItem.anchor);
                    }
                  }}
                  className="w-full p-4 bg-card dark:bg-slate-800/60 rounded-xl border border-border dark:border-slate-700 hover:bg-accent/10 dark:hover:bg-slate-700/40 transition-all duration-200 flex items-center justify-between"
                >
                  <span className="text-base font-medium dark:text-slate-200">{subItem.name}</span>
                  <ChevronRight size={16} className="text-muted-foreground dark:text-slate-400" />
                </button>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </div>
    );
  };

  // 渲染内容页面
  const renderContent = () => {
    // 如果是首页，直接显示内容，不需要顶部导航栏
    if (pathname === '/home') {
      return (
        <div className="flex-1 overflow-y-auto">
          <div className="pb-20">
            {children}
          </div>
        </div>
      );
    }

    // 其他页面显示完整的内容页面布局
    return (
      <div className="flex-1 flex flex-col">
        {/* 顶部导航栏 */}
        <div className="bg-white px-4 py-1 flex items-center justify-between border-b border-gray-100 relative">
          <button
            onClick={handleBackToNav}
            className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          {selectedNav && (
            <h1 className="text-lg font-bold text-gray-900">{getDisplayName(selectedNav.name)}</h1>
          )}
          
          {/* MENU按钮 - 添加下拉功能 */}
          <div className="relative">
            <button 
              onClick={() => setShowAddMenu(prev => !prev)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* 下拉菜单 */}
            {showAddMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
                <button
                  onClick={() => { 
                    router.push('/bazi');
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <Compass className="w-4 h-4 mr-3" />
                  八字命盘
                </button>
                <button
                  onClick={() => { 
                    router.push('/ziwei');
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <SunMoon className="w-4 h-4 mr-3" />
                  ZiWei Astrology
                </button>
                <button
                  onClick={() => { 
                    router.push('/create-chart');
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  排盘
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => { 
                    router.push('/home');
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <CalendarDays className="w-4 h-4 mr-3" />
                  每日签到
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={() => { 
                    router.push('/home');
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700 transition-colors flex items-center"
                >
                  <LayoutDashboard className="w-4 h-4 mr-3" />
                  回到首页
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-24">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // 渲染底部导航栏
  const renderBottomNav = () => {
    // 使用统一的底部导航配置，完全按照HOME页面格式
    return (
      <div className="mobile-bottom-nav">
        <div className="flex items-center justify-around">
          {BOTTOM_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            // 检查当前页面是否匹配导航项
            const isActive = pathname === item.route || pathname.startsWith(item.route + '/');
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  // AI导航项点击时的处理
              if (item.id === 'ai') {
                const aiNav = mainNavItems.find(nav => nav.name === 'AI大师');
                if (aiNav) {
                  console.log('🔄 底部AI按钮点击，设置待定状态');
                  
                  // 设置待定的导航状态
                  setPendingNavState({ nav: aiNav, mode: 'subNav' });
                  
                  // 如果不在chatbot页面，需要跳转
                  if (pathname !== '/chatbot') {
                    console.log('📍 跳转到chatbot页面');
                    router.push('/chatbot');
                  } else {
                    console.log('📍 已在chatbot页面，直接应用SubNav');
                    setSelectedNav(aiNav);
                    setNavMode('subNav');
                    setPendingNavState(null);
                  }
                  return;
                }
              }
                  router.push(item.route);
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-50 transition-colors min-w-0 flex-1"
              >
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-600 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // 移除频繁的调试信息以提升性能

  return (
    <div className="h-screen bg-background dark:bg-slate-900 text-foreground font-sans flex flex-col">
      {/* 根据导航模式渲染不同内容 */}
      {navMode === 'main' && renderMainNav()}
      {navMode === 'subNav' && renderSubNav()}
      {navMode === 'content' && renderContent()}
      
      {/* 底部导航栏 */}
      {!hideBottomNav && renderBottomNav()}

            {/* 设置对话框 */}
      <Dialog open={!!settingsDialog} onOpenChange={() => setSettingsDialog(null)}>
        <DialogContent className="max-w-sm max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {settingsDialog === 'subscription' && '订阅服务'}
              {settingsDialog === 'media-info' && '联系我们'}
              {settingsDialog === 'logout' && '登出确认'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {settingsDialog === 'subscription' && (
              <div id="subscription" className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-primary mb-2">订阅服务</h3>
                  <p className="text-sm text-muted-foreground">选择适合您的套餐</p>
                </div>
                <div className="space-y-3">
                  <div className="border rounded-lg p-3 bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">专业版</h4>
                        <p className="text-xs text-muted-foreground">完整功能</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">¥99</div>
                        <div className="text-xs text-muted-foreground">/月</div>
                      </div>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                      <li>• 无限次分析</li>
                      <li>• AI专业解读</li>
                      <li>• 详细运势</li>
                    </ul>
                    <button className="w-full bg-primary text-white py-2 rounded-lg text-sm">
                      立即订阅
                    </button>
                  </div>
                  <div className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">基础版</h4>
                        <p className="text-xs text-muted-foreground">基本体验</p>
                      </div>
                      <div className="text-lg font-bold text-muted-foreground">免费</div>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                      <li>• 每日3次分析</li>
                      <li>• 基础命盘</li>
                    </ul>
                    <button className="w-full border border-border py-2 rounded-lg text-sm">
                      当前版本
                    </button>
                  </div>
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
                <h3 className="text-lg font-semibold">确认登出</h3>
                <p className="text-muted-foreground">您确定要登出当前账户吗？</p>
                <div className="flex gap-2 mt-4">
                  <Button variant="destructive" onClick={async () => {
                    try {
                      await signOut();
                      setCurrentUser(null);
                      setSettingsDialog(null);
                      router.push('/auth');
                    } catch (error) {
                      console.error('登出失败:', error);
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
    </div>
  );
} 