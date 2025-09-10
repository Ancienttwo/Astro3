import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additionalInfo?: Record<string, any>;
}

export const useGlobalError = () => {
  const handleError = useCallback((
    error: Error | unknown, 
    context?: ErrorContext,
    showToast: boolean = true
  ) => {
    // 确保错误是Error对象
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    // 构建错误数据
    const errorData = {
      message: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
      context: context || {}
    };
    
    // 记录到控制台
    console.error('Global Error Handler:', errorData);
    
    // 发送到错误监控服务（如果需要的话）
    try {
      // 在生产环境中可以发送到外部服务
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
    
    // 显示用户友好的错误消息
    if (showToast) {
      const userMessage = getUserFriendlyMessage(errorObj, context);
      toast({
        title: "操作失败",
        description: userMessage,
        variant: "destructive",
      });
    }
    
    return errorData;
  }, []);

  return { handleError };
};

// 将技术错误转换为用户友好的消息
function getUserFriendlyMessage(error: Error, context?: ErrorContext): string {
  const message = error.message.toLowerCase();
  
  // 网络错误
  if (message.includes('fetch') || message.includes('network') || message.includes('connection')) {
    return '网络连接失败，请检查网络后重试';
  }
  
  // 认证错误
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return '身份验证失败，请重新登录';
  }
  
  // 权限错误
  if (message.includes('permission') || message.includes('access denied')) {
    return '没有权限执行此操作';
  }
  
  // 数据验证错误
  if (message.includes('validation') || message.includes('invalid')) {
    return '输入数据格式不正确，请检查后重试';
  }
  
  // 服务器错误
  if (message.includes('500') || message.includes('server error')) {
    return '服务器暂时不可用，请稍后重试';
  }
  
  // 根据操作上下文提供更具体的消息
  if (context?.action) {
    switch (context.action) {
      case 'login':
        return '登录失败，请检查邮箱和密码';
      case 'register':
        return '注册失败，请稍后重试';
      case 'save':
        return '保存失败，请检查输入内容';
      case 'calculate':
        return '计算失败，请检查输入信息';
      case 'upload':
        return '上传失败，请检查文件格式';
      default:
        return '操作失败，请稍后重试';
    }
  }
  
  // 默认消息
  return error.message || '发生未知错误，请稍后重试';
}