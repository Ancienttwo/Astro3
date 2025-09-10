"use client";

import { useCallback } from 'react';
import { ErrorState } from '@/types/chatbot';
import { ERROR_MESSAGES } from '@/config/chatbot';

export function useChatError() {
  
  // 创建错误对象
  const createError = useCallback((
    type: ErrorState['type'], 
    message?: string, 
    code?: string,
    retryable = true
  ): ErrorState => {
    return {
      type,
      message: message || ERROR_MESSAGES[type] || ERROR_MESSAGES.unknown,
      code,
      retryable,
      timestamp: new Date()
    };
  }, []);

  // 从API响应解析错误
  const parseApiError = useCallback((error: any, response?: Response): ErrorState => {
    // 网络错误
    if (!navigator.onLine) {
      return createError('network', '网络连接已断开，请检查网络设置');
    }

    // HTTP状态码错误
    if (response) {
      switch (response.status) {
        case 401:
          return createError('auth', '登录状态已过期，请重新登录', '401');
        case 403:
          return createError('quota', 'ChatBot次数不足，请通过签到获得更多次数', '403', false);
        case 408:
        case 504:
          return createError('server', '请求超时，请稍后重试', response.status.toString());
        case 429:
          return createError('quota', '请求过于频繁，请稍后再试', '429');
        case 500:
        case 502:
        case 503:
          return createError('server', 'AI服务暂时不可用，请稍后重试', response.status.toString());
        default:
          return createError('server', `服务器错误 (${response.status})`, response.status.toString());
      }
    }

    // JavaScript错误
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      
      // 超时错误
      if (message.includes('timeout') || message.includes('aborted')) {
        return createError('server', '请求超时，请尝试简化您的问题');
      }
      
      // 网络错误
      if (message.includes('network') || message.includes('fetch')) {
        return createError('network');
      }
      
      // 认证错误
      if (message.includes('auth') || message.includes('unauthorized')) {
        return createError('auth');
      }
      
      return createError('unknown', error.message);
    }

    // 字符串错误
    if (typeof error === 'string') {
      return createError('unknown', error);
    }

    return createError('unknown');
  }, [createError]);

  // 验证输入内容
  const validateInput = useCallback((content: string): { valid: boolean; error?: ErrorState } => {
    // 检查内容长度
    if (!content.trim()) {
      return {
        valid: false,
        error: createError('validation', '请输入内容', 'EMPTY_CONTENT', false)
      };
    }

    if (content.length > 2000) {
      return {
        valid: false,
        error: createError('validation', ERROR_MESSAGES.tooLong, 'TOO_LONG', false)
      };
    }

    // 检查恶意内容（简单版本）
    const maliciousPatterns = [
      /script/i,
      /javascript/i,
      /onclick/i,
      /onerror/i,
      /<[^>]*>/g // HTML标签
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(content)) {
        return {
          valid: false,
          error: createError('validation', ERROR_MESSAGES.malicious, 'MALICIOUS_CONTENT', false)
        };
      }
    }

    return { valid: true };
  }, [createError]);

  // 检查是否可以重试
  const canRetry = useCallback((error: ErrorState, attemptCount: number, maxAttempts = 3): boolean => {
    if (!error.retryable) return false;
    if (attemptCount >= maxAttempts) return false;
    
    // 认证错误不重试
    if (error.type === 'auth') return false;
    
    // 配额错误不重试
    if (error.type === 'quota') return false;
    
    // 验证错误不重试
    if (error.type === 'validation') return false;
    
    return true;
  }, []);

  // 获取错误的用户友好提示
  const getErrorAction = useCallback((error: ErrorState): {
    action: string;
    buttonText?: string;
    actionType?: 'retry' | 'redirect' | 'refresh' | 'none';
  } => {
    switch (error.type) {
      case 'network':
        return {
          action: '请检查网络连接后重试',
          buttonText: '重试',
          actionType: 'retry'
        };
        
      case 'auth':
        return {
          action: '请重新登录后继续使用',
          buttonText: '去登录',
          actionType: 'redirect'
        };
        
      case 'quota':
        return {
          action: '请通过签到获得更多次数',
          buttonText: '去签到',
          actionType: 'redirect'
        };
        
      case 'validation':
        return {
          action: '请修改输入内容后重试',
          actionType: 'none'
        };
        
      case 'server':
        return {
          action: '服务暂时不可用，请稍后重试',
          buttonText: '重试',
          actionType: 'retry'
        };
        
      default:
        return {
          action: '发生未知错误，请刷新页面重试',
          buttonText: '刷新',
          actionType: 'refresh'
        };
    }
  }, []);

  // 记录错误（用于调试和监控）
  const logError = useCallback((error: ErrorState, context?: string) => {
    const errorInfo = {
      type: error.type,
      message: error.message,
      code: error.code,
      timestamp: error.timestamp,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('🚨 Chatbot错误:', errorInfo);

    // 在生产环境中，这里可以发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // 示例：发送到错误监控服务
      // errorReportingService.captureError(errorInfo);
    }
  }, []);

  return {
    createError,
    parseApiError,
    validateInput,
    canRetry,
    getErrorAction,
    logError
  };
} 