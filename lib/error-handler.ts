// API错误处理工具

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public details?: any;

  constructor(message: string, status: number, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// 处理API响应，自动检查错误
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    let errorCode = response.status.toString();
    let errorDetails;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorCode = errorData.code || errorCode;
      errorDetails = errorData.details || errorData;
    } catch {
      // 如果无法解析JSON，使用默认错误消息
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiError('Invalid JSON response', 500, 'INVALID_JSON');
  }
}

// 封装fetch请求，自动处理错误
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    return await handleApiResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // 网络错误或其他错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError('网络连接失败', 0, 'NETWORK_ERROR');
    }
    
    throw new ApiError(
      error instanceof Error ? error.message : '未知错误',
      500,
      'UNKNOWN_ERROR'
    );
  }
}

// 重试机制
export async function apiRequestWithRetry<T>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(url, options);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // 如果是最后一次尝试，或者是不可重试的错误，直接抛出
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw lastError;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }

  throw lastError!;
}

// 判断错误是否可以重试
function isRetryableError(error: unknown): boolean {
  if (error instanceof ApiError) {
    // 网络错误或服务器错误可以重试
    return error.status === 0 || error.status >= 500;
  }
  
  if (error instanceof Error) {
    // 网络连接错误可以重试
    return error.message.includes('fetch') || error.message.includes('network');
  }
  
  return false;
}

// 错误日志记录
export function logError(error: Error, context?: Record<string, any>) {
  const errorLog = {
    message: error.message,
    stack: error.stack,
    name: error.name,
    timestamp: new Date().toISOString(),
    context: context || {},
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : ''
  };
  
  console.error('Error logged:', errorLog);
  
  // 在生产环境中，这里可以发送到监控服务
  if (process.env.NODE_ENV === 'production') {
    // 例如发送到 Sentry, LogRocket 等
    // sendToMonitoringService(errorLog);
  }
}