// lib/modules/fortune/i18n/locales/zh-TW.ts - 繁體中文翻譯
import type { FortuneTranslationKeys } from '../index';

export const zhTW: FortuneTranslationKeys = {
  common: {
    loading: '載入中...',
    error: '錯誤',
    success: '成功',
    confirm: '確認',
    cancel: '取消',
    save: '儲存',
    edit: '編輯',
    delete: '刪除',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    search: '搜尋',
    filter: '篩選',
    sort: '排序',
    language: '語言'
  },

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
    loadingTemples: '正在載入廟宇資訊...'
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
    loginRequired: '需要登入'
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
    interpretationFailed: '解讀失敗'
  },

  auth: {
    login: '登入',
    register: '註冊',
    logout: '登出',
    loginRequired: '需要登入帳戶',
    upgradeAccount: '升級帳戶',
    basicAccess: '基礎存取',
    fullAccess: '完整存取',
    anonymousUser: '訪客用戶'
  },

  qr: {
    title: '二維碼',
    generate: '產生二維碼',
    scan: '掃描二維碼',
    campaign: '推廣活動',
    referralLink: '推薦連結',
    downloadQR: '下載二維碼',
    printQR: '列印二維碼'
  },

  message: {
    welcome: '歡迎使用解籤系統',
    slipDrawn: '您抽到了第{{number}}號籤',
    interpretationSaved: '解讀已儲存到歷史記錄',
    shareSlip: '分享籤文',
    copyLink: '複製連結',
    linkCopied: '連結已複製'
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
    interpretationFailed: 'AI解讀失敗'
  },

  nav: {
    home: '首頁',
    temples: '廟宇',
    mySlips: '我的籤文',
    history: '歷史記錄',
    settings: '設定',
    help: '說明',
    about: '關於'
  },

  meta: {
    title: '智慧解籤系統 - AI驅動的傳統文化體驗',
    description: '體驗傳統廟宇解籤文化，獲得AI智慧解讀，了解深層文化含義和實用人生指導',
    keywords: '解籤,廟宇,AI解讀,傳統文化,占卜,運勢,智慧算命',
    ogTitle: '智慧解籤系統 - 傳統與科技的完美結合',
    ogDescription: '線上體驗傳統廟宇解籤，AI智慧解讀幫您理解籤文深意，獲得人生指導'
  }
};