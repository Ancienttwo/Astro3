/**
 * 多语言API中间件
 * 基于PRP文档设计的统一多语言支持中间件
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 */

import { NextRequest, NextResponse } from 'next/server';
import { i18nManager, type SupportedLanguage } from '@/lib/i18n/enhanced-language-manager';

// API响应包装器接口
export interface MultilingualAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    language: SupportedLanguage;
    fallback_used: boolean;
    translation_available: boolean;
    request_id: string;
    timestamp: string;
  };
}

// 中间件配置
export interface MultilingualMiddlewareConfig {
  enableAutoDetection: boolean;
  fallbackLanguage: SupportedLanguage;
  setCookies: boolean;
  trackUsage: boolean;
  cacheHeaders: boolean;
}

// 默认配置
const DEFAULT_CONFIG: MultilingualMiddlewareConfig = {
  enableAutoDetection: true,
  fallbackLanguage: 'zh-CN',
  setCookies: true,
  trackUsage: true,
  cacheHeaders: true
};

/**
 * 多语言API中间件类
 */
export class MultilingualAPIMiddleware {
  private config: MultilingualMiddlewareConfig;

  constructor(config: Partial<MultilingualMiddlewareConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 处理多语言请求的主要中间件函数
   */
  public async handleRequest(
    request: NextRequest,
    handler: (req: NextRequest, lang: SupportedLanguage) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // 初始化语言管理器
      await i18nManager.initialize();

      // 检测和验证语言
      const detectedLanguage = this.config.enableAutoDetection 
        ? i18nManager.detectUserLanguage(request)
        : { detected: this.config.fallbackLanguage, confidence: 1.0, sources: ['default'] };

      const language = detectedLanguage.detected;

      // 生成请求ID
      const requestId = this.generateRequestId();

      // 记录语言使用（如果启用）
      if (this.config.trackUsage) {
        const sessionId = request.headers.get('x-session-id') || 'anonymous';
        await i18nManager.recordLanguageUsage(language, undefined, sessionId);
      }

      // 调用实际的处理器
      const response = await handler(request, language);

      // 增强响应
      return this.enhanceResponse(response, {
        language,
        detectionResult: detectedLanguage,
        requestId
      });

    } catch (error) {
      console.error('Multilingual middleware error:', error);
      
      // 返回错误响应
      return NextResponse.json<MultilingualAPIResponse>({
        success: false,
        error: 'Multilingual middleware error',
        meta: {
          language: this.config.fallbackLanguage,
          fallback_used: true,
          translation_available: false,
          request_id: this.generateRequestId(),
          timestamp: new Date().toISOString()
        }
      }, { status: 500 });
    }
  }

  /**
   * 增强API响应
   */
  private enhanceResponse(
    response: NextResponse,
    context: {
      language: SupportedLanguage;
      detectionResult: any;
      requestId: string;
    }
  ): NextResponse {
    // 添加语言相关的头部
    if (this.config.cacheHeaders) {
      response.headers.set('Content-Language', context.language);
      response.headers.set('Vary', 'Accept-Language');
      response.headers.set('X-Language-Detection', JSON.stringify({
        detected: context.language,
        confidence: context.detectionResult.confidence,
        sources: context.detectionResult.sources
      }));
    }

    // 设置语言偏好Cookie
    if (this.config.setCookies) {
      response.cookies.set('preferred-language', context.language, {
        maxAge: 30 * 24 * 60 * 60, // 30天
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    }

    // 添加请求ID
    response.headers.set('X-Request-ID', context.requestId);
    response.headers.set('X-Response-Timestamp', new Date().toISOString());

    return response;
  }

  /**
   * 生成唯一请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 创建标准化的API响应
   */
  public static createResponse<T>(
    data: T,
    language: SupportedLanguage,
    options: {
      fallbackUsed?: boolean;
      translationAvailable?: boolean;
      requestId?: string;
    } = {}
  ): MultilingualAPIResponse<T> {
    return {
      success: true,
      data,
      meta: {
        language,
        fallback_used: options.fallbackUsed || false,
        translation_available: options.translationAvailable ?? true,
        request_id: options.requestId || `resp_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * 创建错误响应
   */
  public static createErrorResponse(
    error: string,
    language: SupportedLanguage = 'zh-CN',
    status: number = 400,
    requestId?: string
  ): NextResponse<MultilingualAPIResponse> {
    return NextResponse.json<MultilingualAPIResponse>({
      success: false,
      error,
      meta: {
        language,
        fallback_used: false,
        translation_available: false,
        request_id: requestId || `err_${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }, { status });
  }
}

/**
 * 便捷的中间件装饰器
 */
export function withMultilingualSupport(
  handler: (req: NextRequest, lang: SupportedLanguage) => Promise<NextResponse>,
  config?: Partial<MultilingualMiddlewareConfig>
) {
  const middleware = new MultilingualAPIMiddleware(config);
  
  return async (request: NextRequest, context?: any) => {
    return middleware.handleRequest(request, handler);
  };
}

/**
 * 语言验证中间件
 */
export async function validateLanguageMiddleware(
  request: NextRequest
): Promise<{ language: SupportedLanguage; isValid: boolean }> {
  await i18nManager.initialize();
  
  const languageParam = request.nextUrl.searchParams.get('language') || 
                       request.nextUrl.searchParams.get('lang');
  
  if (languageParam) {
    const validated = i18nManager.validateLanguage(languageParam);
    return {
      language: validated,
      isValid: validated === languageParam
    };
  }

  // 使用自动检测
  const detected = i18nManager.detectUserLanguage(request);
  return {
    language: detected.detected,
    isValid: true
  };
}

/**
 * 签文多语言获取辅助函数
 */
export async function getMultilingualSlip(
  templeCode: string,
  slipNumber: number,
  language: SupportedLanguage
) {
  try {
    const slip = await i18nManager.translateSlip(
      `${templeCode}_${slipNumber}`, // 简化的ID生成，实际应该查询数据库
      language
    );

    if (!slip) {
      return null;
    }

    return {
      ...slip,
      api_version: '2.0',
      multilingual_support: true
    };
  } catch (error) {
    console.error('Error getting multilingual slip:', error);
    return null;
  }
}

/**
 * 缓存键生成器
 */
export function generateCacheKey(
  endpoint: string,
  params: Record<string, any>,
  language: SupportedLanguage
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {} as Record<string, any>);

  const paramString = JSON.stringify(sortedParams);
  const hash = Buffer.from(paramString).toString('base64').slice(0, 10);
  
  return `multilingual:${endpoint}:${language}:${hash}`;
}

/**
 * 响应缓存中间件
 */
export class ResponseCacheMiddleware {
  private static cache = new Map<string, { data: any; expires: number }>();

  public static get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expires) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  public static set(key: string, data: any, ttlSeconds: number = 300): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + (ttlSeconds * 1000)
    });
  }

  public static clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

// 导出默认中间件实例
export const multilingualMiddleware = new MultilingualAPIMiddleware();