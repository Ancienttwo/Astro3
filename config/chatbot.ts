import { Master, MasterType } from '@/types/chatbot';

// 多语言Master配置
export const MASTERS_CONFIG = {
  zh: {
    ziwei: {
      name: "司天监正·星玄大人",
      title: "紫微斗数宗师",
      avatar: "⭐",
      color: "from-purple-500 to-blue-500",
      welcome: "贫道司天监正，专研紫微斗数数十载。观君面相，必有要事相询？请将星盘的不同宫内星曜告知，本监为你详解玄机。",
      apiEndpoint: "/api/chat-dify-ziwei",
      agentType: "ziwei-chatbot"
    },
    bazi: {
      name: "玄虚道人",
      title: "盲派八字传人", 
      avatar: "🧙‍♂️",
      color: "from-orange-500 to-red-500",
      welcome: "老夫玄虚，虽目不能视，但凭手摸骨、耳听音，便知君之筋骨不凡。请提出八字问题，老夫为君点拨点拨。",
      apiEndpoint: "/api/chat-dify-bazi",
      agentType: "bazi-chatbot"
    }
  },
  en: {
    ziwei: {
      name: "Grand Astrologer Starlight",
      title: "Ziwei Doushu Master",
      avatar: "⭐",
      color: "from-purple-500 to-blue-500",
      welcome: "I am Grand Astrologer Starlight, devoted to the study of Ziwei Doushu for decades. I sense you have important matters to discuss. Please share your star chart details and palace configurations, and I shall reveal the celestial mysteries for you.",
      apiEndpoint: "/api/chat-dify-ziwei",
      agentType: "ziwei-chatbot-en"
    },
    bazi: {
      name: "Sage Meta",
      title: "Blind School BaZi Master",
      avatar: "🧙‍♂️",
      color: "from-orange-500 to-red-500",
      welcome: "I am Sage Meta. Though my eyes cannot see, I can perceive your extraordinary destiny through touch and sound. Please present your BaZi questions, and I shall offer you profound guidance.",
      apiEndpoint: "/api/chat-dify-bazi",
      agentType: "bazi-chatbot-en"
    }
  }
};

// 获取当前语言的Master配置
export function getMastersForLanguage(language: 'zh' | 'en' = 'zh'): Record<MasterType, Master> {
  return MASTERS_CONFIG[language];
}

// 向后兼容的MASTERS导出（默认中文）
export const MASTERS: Record<MasterType, Master> = getMastersForLanguage('zh');

// Chatbot设置
export const CHATBOT_CONFIG = {
  // 消息相关
  maxMessageLength: 2000,
  maxHistoryMessages: 10,
  maxLocalStorageMessages: 20,
  
  // API相关
  apiTimeout: 180000, // 3分钟
  retryAttempts: 2,
  retryDelay: 1000,
  
  // UI相关
  autoScrollDelay: 50,
  typingIndicatorDelay: 500,
  
  // 存储相关
  localStoragePrefix: 'chatbot_history_',
  sessionStoragePrefix: 'chatbot_session_',
};

// 错误消息配置
export const ERROR_MESSAGES = {
  network: '网络连接异常，请检查网络后重试',
  auth: '请先登录后再使用AI对话功能',
  quota: 'ChatBot次数不足，请通过签到获得更多次数',
  validation: '输入内容不符合要求，请修改后重试',
  server: 'AI服务暂时不可用，请稍后重试',
  unknown: '发生未知错误，请重试或联系客服',
  timeout: '请求超时，请尝试简化您的问题',
  tooLong: `消息过长，请控制在${CHATBOT_CONFIG.maxMessageLength}字符以内`,
  malicious: '输入内容包含不当信息，请修改后重试'
};

// 成功消息配置
export const SUCCESS_MESSAGES = {
  messageSaved: '消息已保存',
  historyClear: '聊天记录已清空',
  authSuccess: '登录成功',
}; 