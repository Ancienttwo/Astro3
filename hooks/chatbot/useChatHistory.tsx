"use client";

import { useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Message, MasterType } from '@/types/chatbot';
import { CHATBOT_CONFIG } from '@/config/chatbot';

export function useChatHistory() {
  
  // 生成存储键
  const getStorageKey = useCallback((masterType: MasterType, userId?: string) => {
    return `${CHATBOT_CONFIG.localStoragePrefix}${masterType}_${userId || 'guest'}`;
  }, []);

  // 保存消息到localStorage
  const saveToLocalStorage = useCallback((message: Message, masterType: MasterType, userId?: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = getStorageKey(masterType, userId);
      const existingHistory = localStorage.getItem(storageKey);
      let history: Message[] = [];
      
      if (existingHistory) {
        history = JSON.parse(existingHistory);
      }
      
      // 避免重复添加
      if (!history.find(msg => msg.id === message.id)) {
        history.push(message);
        
        // 保留最近的消息
        if (history.length > CHATBOT_CONFIG.maxLocalStorageMessages) {
          history = history.slice(-CHATBOT_CONFIG.maxLocalStorageMessages);
        }
        
        localStorage.setItem(storageKey, JSON.stringify(history));
        console.log(`💾 保存消息到localStorage: ${masterType}`);
      }
    } catch (error) {
      console.error('保存消息到localStorage失败:', error);
    }
  }, [getStorageKey]);

  // 从localStorage加载聊天历史
  const loadFromLocalStorage = useCallback((masterType: MasterType, userId?: string): Message[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const storageKey = getStorageKey(masterType, userId);
      const existingHistory = localStorage.getItem(storageKey);
      
      if (existingHistory) {
        const history: Message[] = JSON.parse(existingHistory);
        console.log(`📚 从localStorage加载${history.length}条${masterType}聊天记录`);
        
        // 确保时间戳为Date对象
        return history.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error('从localStorage加载聊天历史失败:', error);
    }
    
    return [];
  }, [getStorageKey]);

  // 清空localStorage聊天历史
  const clearLocalStorage = useCallback((masterType: MasterType, userId?: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const storageKey = getStorageKey(masterType, userId);
      localStorage.removeItem(storageKey);
      console.log(`🗑️ 清空localStorage ${masterType}聊天历史`);
    } catch (error) {
      console.error('清空localStorage聊天历史失败:', error);
    }
  }, [getStorageKey]);

  // 保存消息到Supabase
  const saveToSupabase = useCallback(async (message: Message, masterType: MasterType, userId: string, conversationId?: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/chat-history', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId,
          masterType,
          messageId: message.id,
          content: message.content,
          role: message.role,
          conversationId
        }),
      });

      if (!response.ok) {
        throw new Error('保存到Supabase失败');
      }
      
      console.log(`💾 保存消息到Supabase: ${masterType}`);
    } catch (error) {
      console.error('保存聊天消息到Supabase失败:', error);
    }
  }, []);

  // 从Supabase加载聊天历史
  const loadFromSupabase = useCallback(async (masterType: MasterType, userId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`/api/chat-history?userId=${userId}&masterType=${masterType}&limit=${CHATBOT_CONFIG.maxHistoryMessages}`);
      
      if (response.ok) {
        const data = await response.json();
        const supabaseHistory = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.message_type,
          timestamp: new Date(msg.created_at),
          metadata: {
            masterType,
            conversationId: msg.conversation_id
          }
        }));
        
        if (supabaseHistory.length > 0) {
          console.log(`📚 从Supabase加载${supabaseHistory.length}条${masterType}聊天记录`);
          return supabaseHistory;
        }
      }
    } catch (error) {
      console.error('从Supabase加载聊天历史失败:', error);
    }
    
    return [];
  }, []);

  // 清空Supabase聊天历史
  const clearSupabase = useCallback(async (masterType: MasterType, userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      
      const response = await fetch(`/api/chat-history?userId=${userId}&masterType=${masterType}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      if (response.ok) {
        console.log('🗑️ 清空Supabase聊天历史成功');
      }
    } catch (error) {
      console.error('清空Supabase聊天历史失败:', error);
    }
  }, []);

  // 统一加载聊天历史（优先Supabase，fallback到localStorage）
  const loadHistory = useCallback(async (masterType: MasterType, userId?: string): Promise<Message[]> => {
    console.log(`🔍 loadHistory调用: ${masterType}, userId: ${userId || 'guest'}`);
    
    if (!userId) {
      // 未登录用户，只使用localStorage
      return loadFromLocalStorage(masterType, userId);
    }
    
    try {
      // 先从localStorage快速加载
      const localHistory = loadFromLocalStorage(masterType, userId);
      
      // 然后从Supabase加载更完整的历史
      const supabaseHistory = await loadFromSupabase(masterType, userId);
      
      // 如果Supabase有数据且与本地不同，使用Supabase数据
      if (supabaseHistory.length > 0 && supabaseHistory.length !== localHistory.length) {
        console.log(`🔄 同步：从Supabase更新为${supabaseHistory.length}条记录`);
        return supabaseHistory;
      }
      
      // 否则使用本地数据
      console.log(`📚 使用本地历史：${localHistory.length}条记录`);
      return localHistory;
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      // 出错时使用本地数据作为fallback
      return loadFromLocalStorage(masterType, userId);
    }
  }, []); // 🔥 移除所有依赖，因为内部函数都是稳定的

  // 统一保存消息（同时保存到localStorage和Supabase）
  const saveMessage = useCallback(async (message: Message, masterType: MasterType, userId?: string, conversationId?: string) => {
    // 总是保存到localStorage作为备份
    saveToLocalStorage(message, masterType, userId);
    
    // 如果有userId，也保存到Supabase
    if (userId) {
      await saveToSupabase(message, masterType, userId, conversationId);
    }
  }, [saveToLocalStorage, saveToSupabase]);

  // 统一清空聊天历史
  const clearHistory = useCallback(async (masterType: MasterType, userId?: string) => {
    // 清空localStorage
    clearLocalStorage(masterType, userId);
    
    // 如果有userId，也清空Supabase
    if (userId) {
      await clearSupabase(masterType, userId);
    }
  }, [clearLocalStorage, clearSupabase]);

  return {
    loadHistory,
    saveMessage,
    clearHistory,
    
    // 提供细粒度控制方法
    localStorage: {
      load: loadFromLocalStorage,
      save: saveToLocalStorage,
      clear: clearLocalStorage
    },
    supabase: {
      load: loadFromSupabase,
      save: saveToSupabase,
      clear: clearSupabase
    }
  };
} 