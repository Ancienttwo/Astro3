// lib/config/navigation-config.ts - 导航栏配置系统
import { 
  Home, 
  Calculator, 
  Sparkles, 
  User, 
  BookOpen,
  BarChart3,
  Plus,
  Globe,
  Archive,
  Bot,
  LayoutDashboard,
  Compass,
  Target,
  Users,
  Crown,
  Calendar,
  Settings,
  Coins
} from 'lucide-react';
import { APP_CONFIG, isFeatureEnabled } from './app-config';

export interface NavItem {
  name: string;
  nameZh: string;
  icon: any;
  href?: string;
  anchor?: string;
  subItems?: SubNavItem[];
  feature?: string; // 关联的功能标识
}

export interface SubNavItem {
  name: string;
  nameZh: string;
  href?: string;
  anchor?: string;
  feature?: string;
}

// 基础导航项配置
const BASE_NAV_ITEMS: NavItem[] = [
  { 
    name: 'Home', 
    nameZh: '首页',
    icon: LayoutDashboard, 
    subItems: [
      { name: 'My Profile', nameZh: '我的资料', href: '/profile' },
      { name: 'My Charts', nameZh: '我的命盘', href: '/charts' },
      { name: 'Calendar', nameZh: '万年历', href: '/calendar' },
      { name: 'Membership', nameZh: '会员中心', href: '/membership' },
      { name: 'Invite Friends', nameZh: '邀请好友', anchor: '#referral', feature: 'referral' },
      { name: 'Redeem Code', nameZh: '兑换码', anchor: '#redeem' }
    ], 
    href: '/home' 
  },
  { 
    name: 'Analysis', 
    nameZh: '命理分析',
    icon: Compass, 
    subItems: [
      { name: 'BaZi Chart', nameZh: '八字排盘', href: '/bazi', feature: 'bazi' },
      { name: 'Zi Wei Chart', nameZh: '紫微排盘', href: '/ziwei', feature: 'ziwei' },
      { name: 'I Ching Divination', nameZh: '易经占卜', href: '/yijing', feature: 'yijing' },
      { name: 'Liu Yao', nameZh: '六爻占卜', href: '/liuyao', feature: 'liuyao' },
      { name: 'Oracle Reading', nameZh: '签文解读', href: '/qianwen', feature: 'qianwen' }
    ], 
    href: '/create-chart' 
  },
  { 
    name: 'Wiki', 
    nameZh: '知识百科',
    icon: BookOpen, 
    subItems: [
      { name: 'BaZi Basics', nameZh: '八字基础', href: '/wiki/bazi', feature: 'bazi' },
      { name: 'Zi Wei Dou Shu', nameZh: '紫微斗数', href: '/wiki/ziwei', feature: 'ziwei' },
      { name: 'Five Elements', nameZh: '五行学说', href: '/wiki/wuxing' },
      { name: 'I Ching Wisdom', nameZh: '易经智慧', href: '/wiki/yijing' },
      { name: 'Traditional Calendar', nameZh: '传统历法', href: '/wiki/calendar' },
      { name: 'Astrology Guide', nameZh: '命理指南', href: '/wiki' }
    ], 
    href: '/wiki' 
  },
  { 
    name: 'AI Assistant', 
    nameZh: 'AI助手',
    icon: Bot, 
    subItems: [
      { name: 'BaZi Master', nameZh: '八字大师', href: '/chatbot#bazi-master', feature: 'bazi' },
      { name: 'Zi Wei Master', nameZh: '紫微大师', href: '/chatbot#ziwei-master', feature: 'ziwei' },
      { name: 'I Ching Sage', nameZh: '易经圣贤', href: '/chatbot#yijing-master', feature: 'yijing' },
      { name: 'General Chat', nameZh: '通用对话', href: '/chatbot' }
    ], 
    href: '/chatbot',
    feature: 'chatbot'
  },
  { 
    name: 'Charts', 
    nameZh: '我的命盘',
    icon: BarChart3, 
    href: '/charts' 
  }
];

// 根据配置过滤导航项
function filterNavItems(items: NavItem[], isEnglish: boolean = false): NavItem[] {
  return items.map(item => {
    // 过滤主项
    if (item.feature && !isFeatureEnabled(item.feature)) {
      return null;
    }
    
    // 过滤子项
    const filteredSubItems = item.subItems?.filter(subItem => {
      if (subItem.feature) {
        // 检查分析功能
        if (subItem.feature === 'bazi') return APP_CONFIG.features.analysis.bazi;
        if (subItem.feature === 'ziwei') return APP_CONFIG.features.analysis.ziwei;
        if (subItem.feature === 'yijing') return APP_CONFIG.features.analysis.yijing;
        if (subItem.feature === 'liuyao') return APP_CONFIG.features.analysis.liuyao;
        if (subItem.feature === 'qianwen') return APP_CONFIG.features.analysis.qianwen;
        if (subItem.feature === 'referral') return isFeatureEnabled('referral');
        if (subItem.feature === 'chatbot') return isFeatureEnabled('chatbot');
        return false;
      }
      return true;
    }) || [];

    return {
      ...item,
      subItems: filteredSubItems,
      // 根据语言选择名称
      name: isEnglish ? item.name : item.nameZh
    };
  }).filter(Boolean) as NavItem[];
}

// 获取导航配置
export function getNavigationConfig(isEnglish: boolean = false) {
  const filteredItems = filterNavItems(BASE_NAV_ITEMS, isEnglish);
  
  // 根据语言添加路径前缀
  const pathPrefix = isEnglish ? '/en' : '';
  
  return filteredItems.map(item => ({
    ...item,
    href: item.href ? `${pathPrefix}${item.href}` : undefined,
    subItems: item.subItems?.map(subItem => ({
      ...subItem,
      href: subItem.href ? `${pathPrefix}${subItem.href}` : undefined,
      name: isEnglish ? subItem.name : subItem.nameZh
    }))
  }));
}

// 获取移动端底部导航
export function getMobileBottomNav(isEnglish: boolean = false) {
  const coreItems = [
    { 
      name: isEnglish ? 'Home' : '首页', 
      icon: Home, 
      href: isEnglish ? '/en/home' : '/home' 
    },
    { 
      name: isEnglish ? 'Create' : '排盘', 
      icon: Plus, 
      href: isEnglish ? '/en/create-chart' : '/create-chart' 
    },
    { 
      name: isEnglish ? 'Charts' : '命盘', 
      icon: BarChart3, 
      href: isEnglish ? '/en/charts' : '/charts' 
    },
    { 
      name: isEnglish ? 'Wiki' : '百科', 
      icon: BookOpen, 
      href: isEnglish ? '/en/wiki' : '/wiki' 
    }
  ];

  // 根据配置添加条件项
  if (isFeatureEnabled('chatbot')) {
    coreItems.push({
      name: isEnglish ? 'AI' : 'AI助手', 
      icon: Bot, 
      href: isEnglish ? '/en/chatbot' : '/chatbot'
    });
  }

  return coreItems;
}

// 导航配置验证
export function validateNavigationConfig(): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // 检查Web3模式的功能限制
  if (APP_CONFIG.mode === 'web3') {
    if (APP_CONFIG.features.analysis.yijing) {
      warnings.push('Web3 mode should not include I Ching divination');
    }
    if (APP_CONFIG.features.analysis.liuyao) {
      warnings.push('Web3 mode should not include Liu Yao divination');
    }
    if (APP_CONFIG.features.analysis.qianwen) {
      warnings.push('Web3 mode should not include Oracle reading');
    }
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}