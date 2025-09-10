// lib/modules/fortune/i18n/fortune-dictionaries.ts - Fortune Module Dictionary Integration
import type { Dictionary } from '@/lib/i18n/dictionaries';

// Extend the main dictionary interface for fortune module
export interface FortuneDictionary extends Partial<Dictionary> {
  // Fortune-specific translations
  fortune: {
    // Module info
    title: string;
    subtitle: string;
    description: string;
    
    // Temple system
    temple: {
      title: string;
      name: string;
      location: string;
      deity: string;
      established: string;
      totalSlips: string;
      specialization: string;
      description: string;
      culturalContext: string;
      selectTemple: string;
      noTemplesAvailable: string;
      loadingTemples: string;
      templeInfo: string;
    };

    // Fortune slip
    slip: {
      title: string;
      number: string;
      level: string;
      category: string;
      content: string;
      interpretation: string;
      historicalContext: string;
      symbolism: string;
      drawSlip: string;
      randomSlip: string;
      yourSlip: string;
      upgradeRequired: string;
      loginRequired: string;
      slipContent: string;
      basicInterpretation: string;
      fullContent: string;
    };

    // Fortune levels
    fortuneLevel: {
      excellent: string;
      good: string;
      average: string;
      caution: string;
      warning: string;
    };

    // Categories (using existing category system from main dictionary if available)
    category: {
      career: string;
      wealth: string;
      marriage: string;
      health: string;
      study: string;
      travel: string;
      family: string;
      business: string;
      legal: string;
      general: string;
    };

    // AI interpretation
    ai: {
      title: string;
      analyzing: string;
      interpretation: string;
      question: string;
      askQuestion: string;
      getInterpretation: string;
      culturalStory: string;
      practicalAdvice: string;
      interpretationComplete: string;
      interpretationFailed: string;
      aiAnalysis: string;
      traditionalWisdom: string;
      modernGuidance: string;
    };

    // Authentication (extends main auth if available)
    auth: {
      login: string;
      register: string;
      logout: string;
      loginRequired: string;
      upgradeAccount: string;
      basicAccess: string;
      fullAccess: string;
      anonymousUser: string;
      guestMode: string;
      memberMode: string;
    };

    // QR Code & Referrals
    qr: {
      title: string;
      generate: string;
      scan: string;
      campaign: string;
      referralLink: string;
      downloadQR: string;
      printQR: string;
      shareLink: string;
      templeCode: string;
    };

    // Messages & Notifications
    message: {
      welcome: string;
      slipDrawn: string;
      interpretationSaved: string;
      shareSlip: string;
      copyLink: string;
      linkCopied: string;
      drawSuccess: string;
      drawFailed: string;
      saveSuccess: string;
      saveFailed: string;
    };

    // Errors (extends main error if available)
    error: {
      networkError: string;
      serverError: string;
      notFound: string;
      unauthorized: string;
      forbidden: string;
      invalidInput: string;
      slipNotFound: string;
      templeNotFound: string;
      interpretationFailed: string;
      loadFailed: string;
      saveFailed: string;
    };

    // Navigation
    nav: {
      home: string;
      temples: string;
      mySlips: string;
      history: string;
      settings: string;
      help: string;
      about: string;
      fortune: string;
      divination: string;
    };

    // Actions
    action: {
      draw: string;
      redraw: string;
      interpret: string;
      save: string;
      share: string;
      upgrade: string;
      tryAgain: string;
      goBack: string;
      viewDetails: string;
      learnMore: string;
    };

    // Status
    status: {
      ready: string;
      loading: string;
      success: string;
      error: string;
      completed: string;
      pending: string;
      failed: string;
    };

    // Time & Date
    time: {
      now: string;
      today: string;
      yesterday: string;
      thisWeek: string;
      thisMonth: string;
      thisYear: string;
      recent: string;
    };
  };
}

// Chinese (Simplified) Dictionary
export const fortuneDictZH: FortuneDictionary = {
  fortune: {
    title: '解签系统',
    subtitle: 'AI智能解签平台',
    description: '体验传统庙宇解签文化，获得AI智能解读',
    
    temple: {
      title: '庙宇系统',
      name: '庙宇名称',
      location: '所在地区',
      deity: '主祀神祇',
      established: '建立年份',
      totalSlips: '签文总数',
      specialization: '专业领域',
      description: '庙宇介绍',
      culturalContext: '文化背景',
      selectTemple: '选择庙宇',
      noTemplesAvailable: '暂无可用的庙宇系统',
      loadingTemples: '正在加载庙宇信息...',
      templeInfo: '庙宇信息'
    },

    slip: {
      title: '签文',
      number: '签号',
      level: '签级',
      category: '类别',
      content: '签文内容',
      interpretation: '解签',
      historicalContext: '历史背景',
      symbolism: '象征意义',
      drawSlip: '求签',
      randomSlip: '随机抽签',
      yourSlip: '您的签文',
      upgradeRequired: '需要升级账户',
      loginRequired: '需要登录',
      slipContent: '签文内容',
      basicInterpretation: '基础解读',
      fullContent: '完整内容'
    },

    fortuneLevel: {
      excellent: '大吉',
      good: '吉',
      average: '中平',
      caution: '小心',
      warning: '凶'
    },

    category: {
      career: '事业',
      wealth: '财运',
      marriage: '姻缘',
      health: '健康',
      study: '学业',
      travel: '出行',
      family: '家庭',
      business: '生意',
      legal: '诉讼',
      general: '综合'
    },

    ai: {
      title: 'AI智能解签',
      analyzing: '正在分析签文...',
      interpretation: '智能解读',
      question: '您的问题',
      askQuestion: '询问具体问题',
      getInterpretation: '获取智能解读',
      culturalStory: '文化故事',
      practicalAdvice: '实用建议',
      interpretationComplete: '解读完成',
      interpretationFailed: '解读失败',
      aiAnalysis: 'AI分析',
      traditionalWisdom: '传统智慧',
      modernGuidance: '现代指导'
    },

    auth: {
      login: '登录',
      register: '注册',
      logout: '退出',
      loginRequired: '需要登录账户',
      upgradeAccount: '升级账户',
      basicAccess: '基础访问',
      fullAccess: '完整访问',
      anonymousUser: '游客用户',
      guestMode: '访客模式',
      memberMode: '会员模式'
    },

    qr: {
      title: '二维码',
      generate: '生成二维码',
      scan: '扫描二维码',
      campaign: '推广活动',
      referralLink: '推荐链接',
      downloadQR: '下载二维码',
      printQR: '打印二维码',
      shareLink: '分享链接',
      templeCode: '庙宇代码'
    },

    message: {
      welcome: '欢迎使用解签系统',
      slipDrawn: '您抽到了第{number}号签',
      interpretationSaved: '解读已保存到历史记录',
      shareSlip: '分享签文',
      copyLink: '复制链接',
      linkCopied: '链接已复制',
      drawSuccess: '抽签成功',
      drawFailed: '抽签失败',
      saveSuccess: '保存成功',
      saveFailed: '保存失败'
    },

    error: {
      networkError: '网络连接失败',
      serverError: '服务器错误',
      notFound: '未找到相关内容',
      unauthorized: '未授权访问',
      forbidden: '访问被禁止',
      invalidInput: '输入格式错误',
      slipNotFound: '签文未找到',
      templeNotFound: '庙宇未找到',
      interpretationFailed: 'AI解读失败',
      loadFailed: '加载失败',
      saveFailed: '保存失败'
    },

    nav: {
      home: '首页',
      temples: '庙宇',
      mySlips: '我的签文',
      history: '历史记录',
      settings: '设置',
      help: '帮助',
      about: '关于',
      fortune: '解签',
      divination: '占卜'
    },

    action: {
      draw: '抽签',
      redraw: '重新抽签',
      interpret: '解读',
      save: '保存',
      share: '分享',
      upgrade: '升级',
      tryAgain: '重试',
      goBack: '返回',
      viewDetails: '查看详情',
      learnMore: '了解更多'
    },

    status: {
      ready: '就绪',
      loading: '加载中',
      success: '成功',
      error: '错误',
      completed: '已完成',
      pending: '待处理',
      failed: '失败'
    },

    time: {
      now: '现在',
      today: '今天',
      yesterday: '昨天',
      thisWeek: '本周',
      thisMonth: '本月',
      thisYear: '今年',
      recent: '最近'
    }
  }
};

// Traditional Chinese Dictionary
export const fortuneDictZH_TW: FortuneDictionary = {
  fortune: {
    title: '解籤系統',
    subtitle: 'AI智慧解籤平台',
    description: '體驗傳統廟宇解籤文化，獲得AI智慧解讀',
    
    temple: {
      title: '廟宇系統',
      name: '廟宇名稱',
      location: '所在地區',
      deity: '主祀神祇',
      established: '建立年份',
      totalSlips: '籤文總數',
      specialization: '專業領域',
      description: '廟宇介紹',
      culturalContext: '文化背景',
      selectTemple: '選擇廟宇',
      noTemplesAvailable: '暫無可用的廟宇系統',
      loadingTemples: '正在載入廟宇資訊...',
      templeInfo: '廟宇資訊'
    },

    slip: {
      title: '籤文',
      number: '籤號',
      level: '籤級',
      category: '類別',
      content: '籤文內容',
      interpretation: '解籤',
      historicalContext: '歷史背景',
      symbolism: '象徵意義',
      drawSlip: '求籤',
      randomSlip: '隨機抽籤',
      yourSlip: '您的籤文',
      upgradeRequired: '需要升級帳戶',
      loginRequired: '需要登入',
      slipContent: '籤文內容',
      basicInterpretation: '基礎解讀',
      fullContent: '完整內容'
    },

    fortuneLevel: {
      excellent: '大吉',
      good: '吉',
      average: '中平',
      caution: '小心',
      warning: '凶'
    },

    category: {
      career: '事業',
      wealth: '財運',
      marriage: '姻緣',
      health: '健康',
      study: '學業',
      travel: '出行',
      family: '家庭',
      business: '生意',
      legal: '訴訟',
      general: '綜合'
    },

    ai: {
      title: 'AI智慧解籤',
      analyzing: '正在分析籤文...',
      interpretation: '智慧解讀',
      question: '您的問題',
      askQuestion: '詢問具體問題',
      getInterpretation: '獲得智慧解讀',
      culturalStory: '文化故事',
      practicalAdvice: '實用建議',
      interpretationComplete: '解讀完成',
      interpretationFailed: '解讀失敗',
      aiAnalysis: 'AI分析',
      traditionalWisdom: '傳統智慧',
      modernGuidance: '現代指導'
    },

    auth: {
      login: '登入',
      register: '註冊',
      logout: '登出',
      loginRequired: '需要登入帳戶',
      upgradeAccount: '升級帳戶',
      basicAccess: '基礎存取',
      fullAccess: '完整存取',
      anonymousUser: '訪客用戶',
      guestMode: '訪客模式',
      memberMode: '會員模式'
    },

    qr: {
      title: '二維碼',
      generate: '產生二維碼',
      scan: '掃描二維碼',
      campaign: '推廣活動',
      referralLink: '推薦連結',
      downloadQR: '下載二維碼',
      printQR: '列印二維碼',
      shareLink: '分享連結',
      templeCode: '廟宇代碼'
    },

    message: {
      welcome: '歡迎使用解籤系統',
      slipDrawn: '您抽到了第{number}號籤',
      interpretationSaved: '解讀已儲存到歷史記錄',
      shareSlip: '分享籤文',
      copyLink: '複製連結',
      linkCopied: '連結已複製',
      drawSuccess: '抽籤成功',
      drawFailed: '抽籤失敗',
      saveSuccess: '儲存成功',
      saveFailed: '儲存失敗'
    },

    error: {
      networkError: '網路連線失敗',
      serverError: '伺服器錯誤',
      notFound: '未找到相關內容',
      unauthorized: '未授權存取',
      forbidden: '存取被禁止',
      invalidInput: '輸入格式錯誤',
      slipNotFound: '籤文未找到',
      templeNotFound: '廟宇未找到',
      interpretationFailed: 'AI解讀失敗',
      loadFailed: '載入失敗',
      saveFailed: '儲存失敗'
    },

    nav: {
      home: '首頁',
      temples: '廟宇',
      mySlips: '我的籤文',
      history: '歷史記錄',
      settings: '設定',
      help: '說明',
      about: '關於',
      fortune: '解籤',
      divination: '占卜'
    },

    action: {
      draw: '抽籤',
      redraw: '重新抽籤',
      interpret: '解讀',
      save: '儲存',
      share: '分享',
      upgrade: '升級',
      tryAgain: '重試',
      goBack: '返回',
      viewDetails: '查看詳情',
      learnMore: '了解更多'
    },

    status: {
      ready: '就緒',
      loading: '載入中',
      success: '成功',
      error: '錯誤',
      completed: '已完成',
      pending: '待處理',
      failed: '失敗'
    },

    time: {
      now: '現在',
      today: '今天',
      yesterday: '昨天',
      thisWeek: '本週',
      thisMonth: '本月',
      thisYear: '今年',
      recent: '最近'
    }
  }
};

// English Dictionary
export const fortuneDictEN: FortuneDictionary = {
  fortune: {
    title: 'Fortune Reading System',
    subtitle: 'AI-Powered Oracle Platform',
    description: 'Experience traditional temple fortune reading with AI interpretation',
    
    temple: {
      title: 'Temple Systems',
      name: 'Temple Name',
      location: 'Location',
      deity: 'Primary Deity',
      established: 'Established Year',
      totalSlips: 'Total Slips',
      specialization: 'Specializations',
      description: 'Description',
      culturalContext: 'Cultural Context',
      selectTemple: 'Select Temple',
      noTemplesAvailable: 'No temples available',
      loadingTemples: 'Loading temple information...',
      templeInfo: 'Temple Information'
    },

    slip: {
      title: 'Fortune Slip',
      number: 'Slip Number',
      level: 'Fortune Level',
      category: 'Category',
      content: 'Content',
      interpretation: 'Interpretation',
      historicalContext: 'Historical Context',
      symbolism: 'Symbolism',
      drawSlip: 'Draw Slip',
      randomSlip: 'Random Slip',
      yourSlip: 'Your Fortune Slip',
      upgradeRequired: 'Upgrade Required',
      loginRequired: 'Login Required',
      slipContent: 'Slip Content',
      basicInterpretation: 'Basic Interpretation',
      fullContent: 'Full Content'
    },

    fortuneLevel: {
      excellent: 'Excellent',
      good: 'Good',
      average: 'Average',
      caution: 'Caution',
      warning: 'Warning'
    },

    category: {
      career: 'Career',
      wealth: 'Wealth',
      marriage: 'Marriage',
      health: 'Health',
      study: 'Study',
      travel: 'Travel',
      family: 'Family',
      business: 'Business',
      legal: 'Legal',
      general: 'General'
    },

    ai: {
      title: 'AI Fortune Reading',
      analyzing: 'Analyzing fortune slip...',
      interpretation: 'AI Interpretation',
      question: 'Your Question',
      askQuestion: 'Ask a Specific Question',
      getInterpretation: 'Get AI Interpretation',
      culturalStory: 'Cultural Story',
      practicalAdvice: 'Practical Advice',
      interpretationComplete: 'Interpretation Complete',
      interpretationFailed: 'Interpretation Failed',
      aiAnalysis: 'AI Analysis',
      traditionalWisdom: 'Traditional Wisdom',
      modernGuidance: 'Modern Guidance'
    },

    auth: {
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      loginRequired: 'Login Required',
      upgradeAccount: 'Upgrade Account',
      basicAccess: 'Basic Access',
      fullAccess: 'Full Access',
      anonymousUser: 'Anonymous User',
      guestMode: 'Guest Mode',
      memberMode: 'Member Mode'
    },

    qr: {
      title: 'QR Code',
      generate: 'Generate QR Code',
      scan: 'Scan QR Code',
      campaign: 'Campaign',
      referralLink: 'Referral Link',
      downloadQR: 'Download QR',
      printQR: 'Print QR',
      shareLink: 'Share Link',
      templeCode: 'Temple Code'
    },

    message: {
      welcome: 'Welcome to Fortune Reading System',
      slipDrawn: 'You have drawn slip #{number}',
      interpretationSaved: 'Interpretation saved to history',
      shareSlip: 'Share Fortune Slip',
      copyLink: 'Copy Link',
      linkCopied: 'Link Copied',
      drawSuccess: 'Draw Successful',
      drawFailed: 'Draw Failed',
      saveSuccess: 'Save Successful',
      saveFailed: 'Save Failed'
    },

    error: {
      networkError: 'Network connection failed',
      serverError: 'Server error',
      notFound: 'Content not found',
      unauthorized: 'Unauthorized access',
      forbidden: 'Access forbidden',
      invalidInput: 'Invalid input format',
      slipNotFound: 'Fortune slip not found',
      templeNotFound: 'Temple not found',
      interpretationFailed: 'AI interpretation failed',
      loadFailed: 'Load failed',
      saveFailed: 'Save failed'
    },

    nav: {
      home: 'Home',
      temples: 'Temples',
      mySlips: 'My Slips',
      history: 'History',
      settings: 'Settings',
      help: 'Help',
      about: 'About',
      fortune: 'Fortune',
      divination: 'Divination'
    },

    action: {
      draw: 'Draw',
      redraw: 'Redraw',
      interpret: 'Interpret',
      save: 'Save',
      share: 'Share',
      upgrade: 'Upgrade',
      tryAgain: 'Try Again',
      goBack: 'Go Back',
      viewDetails: 'View Details',
      learnMore: 'Learn More'
    },

    status: {
      ready: 'Ready',
      loading: 'Loading',
      success: 'Success',
      error: 'Error',
      completed: 'Completed',
      pending: 'Pending',
      failed: 'Failed'
    },

    time: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      thisYear: 'This Year',
      recent: 'Recent'
    }
  }
};

// Main dictionary getter function that integrates with existing system
export function getFortuneDictionary(locale: 'zh-CN' | 'zh-TW' | 'en-US' = 'zh-CN'): FortuneDictionary {
  switch (locale) {
    case 'zh-TW':
      return fortuneDictZH_TW;
    case 'en-US':
      return fortuneDictEN;
    case 'zh-CN':
    default:
      return fortuneDictZH;
  }
}

// Helper function to get specific fortune translation
export function getFortuneTranslation(
  key: string, 
  locale: 'zh-CN' | 'zh-TW' | 'en-US' = 'zh-CN', 
  params?: Record<string, string | number>
): string {
  const dict = getFortuneDictionary(locale);
  
  // Navigate through nested keys (e.g., 'fortune.temple.title')
  const keys = key.split('.');
  let value: any = dict;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  
  let result = value || key; // fallback to key if not found
  
  // Simple parameter replacement
  if (params && typeof result === 'string') {
    for (const [param, val] of Object.entries(params)) {
      result = result.replace(`{${param}}`, String(val));
    }
  }
  
  return result;
}