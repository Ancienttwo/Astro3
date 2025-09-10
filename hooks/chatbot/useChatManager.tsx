"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { MasterType, Message } from '@/types/chatbot';
import { getMastersForLanguage } from '@/config/chatbot';
import { getLanguage } from '@/lib/utils/language';
import { useUserUsage } from '@/hooks/useUserUsage';
import { useChatState } from './useChatState';
import { useChatHistory } from './useChatHistory';
import { useChatError } from './useChatError';
import { useChatApi } from './useChatApi';

export function useChatManager() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, actions } = useChatState();
  const { loadHistory, saveMessage, clearHistory } = useChatHistory();
  const { validateInput, parseApiError, logError } = useChatError();
  const { sendMessage: apiSendMessage, cancelRequest } = useChatApi();
  const { usage, loading: usageLoading, fetchUsage } = useUserUsage();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeMasterRef = useRef<MasterType | null>(null);

  // 获取当前语言和对应的Master配置
  const currentLanguage = getLanguage(pathname);
  const MASTERS = getMastersForLanguage(currentLanguage === 'ja' ? 'zh' : currentLanguage); // 日语暂时用中文BOT
  const currentMaster = state.activeMaster ? MASTERS[state.activeMaster] : null;
  
  // 同步activeMaster到ref
  useEffect(() => {
    activeMasterRef.current = state.activeMaster;
  }, [state.activeMaster]);

  // 初始化用户认证
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        actions.setUser(user);
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      actions.setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [actions]);

  // 监听URL hash变化（用于初始化和BOT切换）
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      console.log('🔄 Hash变化检测:', hash, 'Current Master:', activeMasterRef.current);
      
      // 处理BOT切换
      if (hash === '#bazi-master') {
        if (activeMasterRef.current !== 'bazi') {
          console.log('🚀 切换到八字大师');
          // 取消当前进行的请求
          cancelRequest();
          // 清除之前的初始化标记
          initializationRef.current.clear();
          actions.setActiveMaster('bazi');
        }
      } else if (hash === '#ziwei-master') {
        if (activeMasterRef.current !== 'ziwei') {
          console.log('🚀 切换到紫微大师');
          // 取消当前进行的请求
          cancelRequest();
          // 清除之前的初始化标记
          initializationRef.current.clear();
          actions.setActiveMaster('ziwei');
        }
      } else if (!hash && !activeMasterRef.current) {
        // 没有选择master且无hash时，默认选择八字大师（避免循环）
        console.log('🎯 初始化默认选择八字大师');
        actions.setActiveMaster('bazi');
      }
    };

    // 初始加载时检查hash
    handleHashChange();

    // 监听hash变化（处理subnav切换）
    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []); // 移除依赖，避免重复监听

  // 防止重复初始化的标记
  const initializationRef = useRef<Set<string>>(new Set());

  // 初始化聊天历史
  useEffect(() => {
    if (!state.activeMaster) return;
    
    // 创建唯一标识，防止重复初始化
    const key = `${state.activeMaster}_${state.user?.id || 'guest'}`;
    if (initializationRef.current.has(key)) {
      console.log(`⏭️ 跳过重复初始化: ${key}`);
      return;
    }
    
    const initializeChatHistory = async () => {
      try {
        console.log(`📚 初始化${state.activeMaster}聊天历史 (${key})`);
        initializationRef.current.add(key);
        
        const history = await loadHistory(state.activeMaster, state.user?.id);
        
        if (history.length > 0) {
          actions.setMessages(history);
          console.log(`⚡ 恢复${history.length}条聊天记录`);
        } else {
          // 显示欢迎消息
          const master = MASTERS[state.activeMaster];
          const welcomeMsg: Message = {
            id: 'welcome_' + Date.now(),
            content: master.welcome,
            role: 'assistant',
            timestamp: new Date(),
            metadata: {
              masterType: state.activeMaster
            }
          };
          actions.setMessages([welcomeMsg]);
        }
      } catch (error) {
        console.error('初始化聊天历史失败:', error);
        // 即使出错也显示欢迎消息
        const master = MASTERS[state.activeMaster];
        if (master) {
          const welcomeMsg: Message = {
            id: 'welcome_' + Date.now(),
            content: master.welcome,
            role: 'assistant',
            timestamp: new Date(),
            metadata: {
              masterType: state.activeMaster
            }
          };
          actions.setMessages([welcomeMsg]);
        }
      }
    };

    initializeChatHistory();
  }, [state.activeMaster, state.user?.id]); // 🔥 简化依赖数组

  // 自动滚动到底部
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (state.messages.length > 0) {
      // 延迟滚动确保DOM更新完成
      setTimeout(scrollToBottom, 50);
    }
  }, [state.messages]);

  // 切换Master
  const switchMaster = (masterType: MasterType) => {
    console.log(`🔄 switchMaster调用: ${masterType}`);
    
    // 如果已经是当前Master，不执行切换
    if (state.activeMaster === masterType) {
      console.log(`⏭️ 已经是${masterType}，跳过切换`);
      return;
    }
    
    // 通过更新hash触发统一的切换逻辑
    window.location.hash = `#${masterType}-master`;
  };

  // 扣除使用次数
  const deductUsage = async (): Promise<boolean> => {
    if (!state.user?.id || !usage?.canUseChatbot) {
      actions.setShowSubscriptionDialog(true);
      return false;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return false;

      const response = await fetch('/api/user-usage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'increment',
          reportType: 'chatbot',
          amount: 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 刷新使用统计
          fetchUsage();
          return true;
        }
      }
      
      actions.setShowSubscriptionDialog(true);
      return false;
    } catch (error) {
      console.error('扣除使用次数失败:', error);
      return false;
    }
  };

  // 发送消息
  const sendMessage = async () => {
    console.log('📤 准备发送消息:', {
      inputLength: state.inputValue.trim().length,
      isLoading: state.isLoading,
      activeMaster: state.activeMaster,
      hasUser: !!state.user
    });

    // 基础验证
    if (!state.inputValue.trim() || state.isLoading || !state.activeMaster) {
      console.log('⏹️ 发送被阻止：基础验证失败');
      return;
    }

    if (!state.user?.id) {
      actions.setError('请先登录后再使用AI对话功能');
      return;
    }

    // 输入验证
    const validation = validateInput(state.inputValue.trim());
    if (!validation.valid) {
      actions.setError(validation.error!.message);
      return;
    }

    // 检查使用次数
    if (!usage?.canUseChatbot) {
      console.log('⏹️ 发送被阻止：ChatBot次数不足');
      actions.setShowSubscriptionDialog(true);
      return;
    }

    // 开始发送流程
    actions.setLoading(true);
    actions.setError(null);

    const userMessage: Message = {
      id: 'user_' + Date.now(),
      content: state.inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
      status: 'sending',
      metadata: {
        masterType: state.activeMaster
      }
    };

    // 添加用户消息
    actions.addMessage(userMessage);
    actions.setInputValue('');

    // 保存用户消息
    await saveMessage(userMessage, state.activeMaster, state.user.id);

    // 获取加载提示文本
    const getLoadingText = () => {
      const isZiwei = state.activeMaster === 'ziwei';
      
      if (currentLanguage === 'en') {
        return isZiwei ? 'Observing the celestial patterns...' : 'Calculating destiny patterns...';
      } else {
        return isZiwei ? '正在观察星象...' : '正在推算命理...';
      }
    };

    // 添加加载消息
    const loadingMessage: Message = {
      id: 'loading_' + Date.now(),
      content: getLoadingText(),
      role: 'assistant',
      timestamp: new Date(),
      metadata: {
        masterType: state.activeMaster
      }
    };
    actions.addMessage(loadingMessage);

    try {
      // 添加发送超时保护
      const sendTimeoutId = setTimeout(() => {
        console.warn('⏰ 发送消息超时，强制重置loading状态');
        actions.setLoading(false);
      }, 90000); // 90秒超时

      // 创建AI消息占位符，用于实时流式更新
      const aiMessage: Message = {
        id: 'ai_' + Date.now(),
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        status: 'sending',
        metadata: {
          masterType: state.activeMaster
        }
      };

      // 移除加载消息，添加AI消息占位符
      const newMessages = state.messages.filter(m => m.id !== loadingMessage.id);
      actions.setMessages([...newMessages, aiMessage]);

      // 发送到AI，支持实时流式更新
      const result = await apiSendMessage({
        message: userMessage.content,
        masterType: state.activeMaster,
        userId: state.user.id,
        history: state.messages,
        language: currentLanguage,
        onProgress: (content: string) => {
          // 实时更新AI消息内容
          actions.updateMessage(aiMessage.id, { 
            content,
            status: 'sending'
          });
        }
      });

      // 清除超时保护
      clearTimeout(sendTimeoutId);

      if (result.success && result.response) {
        // 扣除使用次数
        await deductUsage();

        // 更新用户消息状态
        actions.updateMessage(userMessage.id, { status: 'sent' });

        // 更新AI消息为最终状态
        actions.updateMessage(aiMessage.id, {
          content: result.response,
          status: 'sent',
          metadata: {
            masterType: state.activeMaster,
            conversationId: result.conversationId,
            characterCount: result.response.length
          }
        });

        // 保存AI消息
        await saveMessage({
          ...aiMessage,
          content: result.response,
          status: 'sent',
          metadata: {
            masterType: state.activeMaster,
            conversationId: result.conversationId,
            characterCount: result.response.length
          }
        }, state.activeMaster, state.user.id, result.conversationId);

      } else {
        throw new Error(result.error || 'AI服务返回异常');
      }

    } catch (error: any) {
      console.error('❌ 发送消息失败:', error);
      
      // 更新用户消息状态
      actions.updateMessage(userMessage.id, { status: 'error' });

      // 移除加载消息
      const newMessages = state.messages.filter(m => m.id !== loadingMessage.id);
      
      // 添加错误消息
      const errorMessage: Message = {
        id: 'error_' + Date.now(),
        content: '抱歉，连接出现问题，请稍后重试。',
        role: 'assistant',
        timestamp: new Date(),
        status: 'error',
        metadata: {
          masterType: state.activeMaster
        }
      };
      
      actions.setMessages([...newMessages, errorMessage]);
      
      // 记录错误
      const parsedError = parseApiError(error);
      logError(parsedError, 'sendMessage');
      actions.setError(parsedError.message);
      
    } finally {
      actions.setLoading(false);
    }
  };

  // 清空聊天历史
  const clearChatHistory = async () => {
    if (!state.activeMaster) return;
    
    try {
      await clearHistory(state.activeMaster, state.user?.id);
      
      // 重置为欢迎消息
      if (currentMaster) {
        const welcomeMsg: Message = {
          id: 'welcome_' + Date.now(),
          content: currentMaster.welcome,
          role: 'assistant',
          timestamp: new Date(),
          metadata: {
            masterType: state.activeMaster
          }
        };
        actions.setMessages([welcomeMsg]);
      }
      
      console.log('🗑️ 聊天历史已清空');
    } catch (error) {
      console.error('清空聊天历史失败:', error);
      actions.setError('清空历史记录失败');
    }
  };

  // 处理键盘输入
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 关闭订阅对话框
  const closeSubscriptionDialog = () => {
    actions.setShowSubscriptionDialog(false);
  };

  // 跳转到签到页面
  const goToCheckin = () => {
    router.push('/home');
  };

  return {
    // 状态
    state,
    currentMaster,
    usage,
    usageLoading,
    
    // Refs
    messagesEndRef,
    textareaRef,
    
    // 操作
    switchMaster,
    sendMessage,
    clearChatHistory,
    handleKeyDown,
    closeSubscriptionDialog,
    goToCheckin,
    
    // 状态更新
    setInputValue: actions.setInputValue,
    clearError: () => actions.setError(null),
    
    // 工具方法
    refreshUsage: fetchUsage
  };
} 