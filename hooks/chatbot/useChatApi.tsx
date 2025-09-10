"use client";

import { useCallback, useRef } from 'react';
import { MasterType, Message } from '@/types/chatbot';
import { MASTERS, CHATBOT_CONFIG } from '@/config/chatbot';
import { useChatError } from './useChatError';

interface SendMessageOptions {
  message: string;
  masterType: MasterType;
  userId: string;
  history?: Message[];
  onProgress?: (content: string) => void;
  language?: 'zh' | 'en';
}

interface SendMessageResult {
  success: boolean;
  response?: string;
  conversationId?: string;
  error?: any;
}

export function useChatApi() {
  const { parseApiError, validateInput, logError } = useChatError();
  const abortControllerRef = useRef<AbortController | null>(null);

  // 取消正在进行的请求
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log('🛑 API请求已取消');
    }
  }, []);

  // 准备请求历史
  const prepareHistory = useCallback((messages: Message[]): any[] => {
    return messages
      .filter(msg => 
        !msg.id.startsWith('welcome_') && 
        !msg.id.startsWith('loading_') &&
        !msg.id.startsWith('error_')
      )
      .slice(-CHATBOT_CONFIG.maxHistoryMessages)
      .map(msg => ({
        role: msg.role,
        content: msg.content
      }));
  }, []);

  // 发送消息到AI (现在支持真正的流式输出)
  const sendMessage = useCallback(async ({
    message,
    masterType,
    userId,
    history = [],
    onProgress,
    language = 'zh'
  }: SendMessageOptions): Promise<SendMessageResult> => {
    // 输入验证
    const validation = validateInput(message);
    if (!validation.valid) {
      const error = validation.error!;
      logError(error, 'sendMessage - 输入验证失败');
      return {
        success: false,
        error: error.message
      };
    }

    // 获取master配置
    const master = MASTERS[masterType];
    if (!master) {
      const errorMessage = `不支持的Master类型: ${masterType}`;
      logError({
        type: 'validation',
        message: errorMessage,
        timestamp: new Date()
      }, 'sendMessage - Master配置错误');
      return {
        success: false,
        error: errorMessage
      };
    }

    // 创建新的AbortController
    abortControllerRef.current = new AbortController();

    try {
      console.log(`🚀 发送消息到${master.name} (流式模式):`, {
        messageLength: message.length,
        historyLength: history.length,
        masterType
      });

      const preparedHistory = prepareHistory(history);
      
      const response = await fetch(master.apiEndpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          history: preparedHistory,
          botType: master.agentType,
          userId,
          language
        }),
        signal: abortControllerRef.current.signal
      });

      // 检查响应状态
      if (!response.ok) {
        const error = parseApiError(null, response);
        logError(error, `sendMessage - API响应错误: ${response.status}`);
        return {
          success: false,
          error: error.message
        };
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        const errorMessage = '无法获取流式响应读取器';
        logError({
          type: 'server',
          message: errorMessage,
          timestamp: new Date()
        }, 'sendMessage - 流式响应错误');
        return {
          success: false,
          error: errorMessage
        };
      }

      let fullResponse = '';
      let conversationId: string | undefined;
      
      try {
        // 添加超时保护
        const timeoutId = setTimeout(() => {
          console.warn('⏰ 流式响应超时，自动终止');
          reader.cancel();
        }, 60000); // 60秒超时

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            clearTimeout(timeoutId);
            break;
          }

          // 检查是否被取消
          if (abortControllerRef.current?.signal.aborted) {
            clearTimeout(timeoutId);
            break;
          }

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split('\n').filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'content' && data.content) {
                  // 累积完整响应
                  fullResponse += data.content;
                  
                  // 实时更新UI
                  if (onProgress) {
                    onProgress(fullResponse);
                  }
                } else if (data.type === 'end') {
                  // 流式响应结束
                  conversationId = data.conversationId;
                  console.log('✅ 流式响应完成:', {
                    responseLength: fullResponse.length,
                    conversationId
                  });
                  clearTimeout(timeoutId);
                } else if (data.type === 'error') {
                  // 流式响应错误
                  clearTimeout(timeoutId);
                  throw new Error(data.error || '流式响应出现错误');
                }
              } catch (parseError) {
                // 忽略解析错误，继续处理下一行
                console.warn('跳过无效的SSE数据:', line.substring(0, 100));
              }
            }
          }
        }
      } catch (streamError) {
        console.error('🌊 流式处理异常:', streamError);
        throw streamError;
      } finally {
        // 确保reader被正确释放
        try {
          reader.releaseLock();
          console.log('🔓 Stream reader已释放');
        } catch (releaseError) {
          console.warn('⚠️ Reader释放失败:', releaseError);
        }
      }

      // 验证最终响应
      if (!fullResponse) {
        const errorMessage = 'AI服务返回空响应';
        logError({
          type: 'server',
          message: errorMessage,
          timestamp: new Date()
        }, 'sendMessage - 空响应');
        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        response: fullResponse,
        conversationId
      };

    } catch (error: any) {
      // 如果是用户取消，不算错误
      if (error.name === 'AbortError') {
        console.log('🛑 请求被用户取消');
        return {
          success: false,
          error: '请求已取消'
        };
      }

      const parsedError = parseApiError(error);
      logError(parsedError, 'sendMessage - 请求异常');
      
      return {
        success: false,
        error: parsedError.message
      };
    } finally {
      abortControllerRef.current = null;
    }
  }, [validateInput, parseApiError, logError, prepareHistory]);

  // 模拟打字效果
  const simulateTyping = useCallback(async (
    text: string, 
    onProgress: (content: string) => void
  ): Promise<void> => {
    const chunkSize = 5; // 每次显示5个字符
    const delay = 30; // 30ms延迟

    for (let i = 0; i < text.length; i += chunkSize) {
      const chunk = text.slice(0, i + chunkSize);
      onProgress(chunk);
      
      // 如果请求被取消，停止打字效果
      if (abortControllerRef.current?.signal.aborted) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }, []);

  // 检查API健康状态
  const checkHealth = useCallback(async (masterType: MasterType): Promise<boolean> => {
    const master = MASTERS[masterType];
    if (!master) return false;

    try {
      const response = await fetch(master.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'ping',
          userId: 'health_check'
        })
      });

      return response.ok;
    } catch (error) {
      console.error(`${master.name} 健康检查失败:`, error);
      return false;
    }
  }, []);

  // 获取API统计信息
  const getApiStats = useCallback(() => {
    return {
      isRequestActive: !!abortControllerRef.current,
      supportedMasters: Object.keys(MASTERS),
      config: {
        maxMessageLength: CHATBOT_CONFIG.maxMessageLength,
        maxHistoryMessages: CHATBOT_CONFIG.maxHistoryMessages,
        apiTimeout: CHATBOT_CONFIG.apiTimeout
      }
    };
  }, []);

  return {
    sendMessage,
    cancelRequest,
    checkHealth,
    getApiStats,
    
    // 工具方法
    prepareHistory,
    
    // 状态
    get isRequestActive() {
      return !!abortControllerRef.current;
    }
  };
} 