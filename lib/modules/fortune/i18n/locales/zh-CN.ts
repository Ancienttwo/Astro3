// lib/modules/fortune/i18n/locales/zh-CN.ts - 简体中文翻译
import type { FortuneTranslationKeys } from '../index';

export const zhCN: FortuneTranslationKeys = {
  common: {
    loading: '加载中...',
    error: '错误',
    success: '成功',
    confirm: '确认',
    cancel: '取消',
    save: '保存',
    edit: '编辑',
    delete: '删除',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    search: '搜索',
    filter: '筛选',
    sort: '排序',
    language: '语言'
  },

  temple: {
    title: '庙宇系统',
    name: '庙宇名称',
    location: '所在地区',
    deity: '主祀神祊',
    established: '建立年份',
    totalSlips: '签文总数',
    specialization: '专业领域',
    description: '庙宇介绍',
    culturalContext: '文化背景',
    selectTemple: '选择庙宇',
    noTemplesAvailable: '暂无可用的庙宇系统',
    loadingTemples: '正在加载庙宇信息...'
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
    loginRequired: '需要登录'
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
    interpretationFailed: '解读失败'
  },

  auth: {
    login: '登录',
    register: '注册',
    logout: '退出',
    loginRequired: '需要登录账户',
    upgradeAccount: '升级账户',
    basicAccess: '基础访问',
    fullAccess: '完整访问',
    anonymousUser: '游客用户'
  },

  qr: {
    title: '二维码',
    generate: '生成二维码',
    scan: '扫描二维码',
    campaign: '推广活动',
    referralLink: '推荐链接',
    downloadQR: '下载二维码',
    printQR: '打印二维码'
  },

  message: {
    welcome: '欢迎使用解签系统',
    slipDrawn: '您抽到了第{{number}}号签',
    interpretationSaved: '解读已保存到历史记录',
    shareSlip: '分享签文',
    copyLink: '复制链接',
    linkCopied: '链接已复制'
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
    interpretationFailed: 'AI解读失败'
  },

  nav: {
    home: '首页',
    temples: '庙宇',
    mySlips: '我的签文',
    history: '历史记录',
    settings: '设置',
    help: '帮助',
    about: '关于'
  },

  meta: {
    title: '智能解签系统 - AI驱动的传统文化体验',
    description: '体验传统庙宇解签文化，获得AI智能解读，了解深层文化含义和实用人生指导',
    keywords: '解签,庙宇,AI解读,传统文化,占卜,运势,智能算命',
    ogTitle: '智能解签系统 - 传统与科技的完美结合',
    ogDescription: '在线体验传统庙宇解签，AI智能解读帮您理解签文深意，获得人生指导'
  }
};