'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到控制台
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 记录错误到外部服务（如果有的话）
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // 在生产环境中，这里可以发送错误到监控服务
    // 例如 Sentry, LogRocket 等
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // 发送到API或第三方服务
      // await fetch('/api/log-error', {
      //   method: 'POST',
      //   body: JSON.stringify(errorData),
      //   headers: { 'Content-Type': 'application/json' }
      // });
      
      console.warn('Error logged:', errorData);
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">应用程序遇到了一个错误</p>
                  <p className="text-sm text-muted-foreground">
                    {this.state.error?.message || '未知错误'}
                  </p>
                </div>
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={this.handleReset} 
                variant="outline" 
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
              <Button 
                onClick={this.handleReload} 
                variant="default" 
                className="flex-1"
              >
                刷新页面
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-xs bg-muted p-3 rounded">
                <summary className="cursor-pointer font-medium mb-2">
                  开发者信息
                </summary>
                <pre className="whitespace-pre-wrap text-xs">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap text-xs mt-2">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;