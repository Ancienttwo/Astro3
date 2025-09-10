/**
 * 关帝灵签多语言AI解读系统 - 增强语言管理器
 * 作者: SuperClaude 架构师
 * 创建日期: 2025-01-31
 * 基于PRP文档设计的完整语言管理系统
 */

import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

// 支持的语言类型
export type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

// 语言配置接口
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl: boolean;
  dateFormat: string;
  numberFormat: string;
  enabled: boolean;
  sortOrder: number;
}

// 本地化内容接口
export interface LocalizedContent {
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  keywords?: string[];
}

// 签文多语言响应接口
export interface LocalizedSlip {
  id: string;
  slip_number: number;
  temple_code: string;
  fortune_level: string;
  categories: string[];
  language: SupportedLanguage;
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  keywords?: string[];
  translation_status: 'complete' | 'fallback' | 'missing';
  fallback_language?: SupportedLanguage;
}

// UI翻译接口
export interface UITranslations {
  [key: string]: string | UITranslations;
}

// 语言检测结果
export interface LanguageDetectionResult {
  detected: SupportedLanguage;
  confidence: number;
  sources: ('header' | 'query' | 'cookie' | 'default')[];
}

/**
 * 多语言管理器
 * 处理语言检测、内容本地化、翻译获取等功能
 */
export class I18nManager {
  private static instance: I18nManager;
  private languageConfigs: Map<SupportedLanguage, LanguageConfig> = new Map();
  private uiTranslations: Map<SupportedLanguage, UITranslations> = new Map();
  private initialized = false;

  // 默认语言配置
  private static readonly DEFAULT_CONFIGS: LanguageConfig[] = [
    {
      code: 'zh-CN',
      name: 'Chinese (Simplified)',
      nativeName: '简体中文',
      flag: '🇨🇳',
      rtl: false,
      dateFormat: 'YYYY年MM月DD日',
      numberFormat: 'zh-CN',
      enabled: true,
      sortOrder: 1
    },
    {
      code: 'zh-TW',
      name: 'Chinese (Traditional)',
      nativeName: '繁體中文',
      flag: '🇹🇼',
      rtl: false,
      dateFormat: 'YYYY年MM月DD日',
      numberFormat: 'zh-TW',
      enabled: true,
      sortOrder: 2
    },
    {
      code: 'en-US',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸',
      rtl: false,
      dateFormat: 'MMMM DD, YYYY',
      numberFormat: 'en-US',
      enabled: true,
      sortOrder: 3
    }
  ];

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): I18nManager {
    if (!I18nManager.instance) {
      I18nManager.instance = new I18nManager();
    }
    return I18nManager.instance;
  }

  /**
   * 初始化语言管理器
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // 从数据库加载语言配置
      await this.loadLanguageConfigs();
      
      // 加载UI翻译
      await this.loadUITranslations();
      
      this.initialized = true;
      console.log('✅ I18nManager initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize I18nManager:', error);
      // 使用默认配置作为后备
      this.loadDefaultConfigs();
      this.initialized = true;
    }
  }

  /**
   * 从数据库加载语言配置
   */
  private async loadLanguageConfigs(): Promise<void> {
    const { data, error } = await supabase
      .from('language_configs')
      .select('*')
      .eq('enabled', true)
      .order('sort_order');

    if (error) {
      console.warn('Failed to load language configs from database:', error);
      this.loadDefaultConfigs();
      return;
    }

    if (data && data.length > 0) {
      data.forEach(config => {
        this.languageConfigs.set(config.code as SupportedLanguage, {
          code: config.code as SupportedLanguage,
          name: config.name,
          nativeName: config.native_name,
          flag: config.flag_emoji,
          rtl: config.rtl || false,
          dateFormat: config.date_format || 'YYYY-MM-DD',
          numberFormat: config.number_format || 'en-US',
          enabled: config.enabled,
          sortOrder: config.sort_order || 0
        });
      });
    } else {
      this.loadDefaultConfigs();
    }
  }

  /**
   * 加载默认语言配置
   */
  private loadDefaultConfigs(): void {
    I18nManager.DEFAULT_CONFIGS.forEach(config => {
      this.languageConfigs.set(config.code, config);
    });
  }

  /**
   * 加载UI翻译
   */
  private async loadUITranslations(): Promise<void> {
    // TODO: 实现从数据库或文件加载UI翻译
    // 现在使用硬编码的基础翻译
    const basicTranslations = {
      'zh-CN': {
        'fortune.draw': '摇签',
        'fortune.interpret': 'AI解读',
        'fortune.levels.excellent': '上上签',
        'fortune.levels.good': '上签',
        'fortune.levels.average': '中签',
        'fortune.levels.caution': '下签',
        'fortune.levels.warning': '下下签',
        'ai.interpretation.basic': '基础解读',
        'ai.interpretation.personalized': '个性化解读',
        'ai.interpretation.deep': '深度解读',
        'language.switch': '切换语言'
      },
      'zh-TW': {
        'fortune.draw': '搖籤',
        'fortune.interpret': 'AI解讀',
        'fortune.levels.excellent': '上上籤',
        'fortune.levels.good': '上籤',
        'fortune.levels.average': '中籤',
        'fortune.levels.caution': '下籤',
        'fortune.levels.warning': '下下籤',
        'ai.interpretation.basic': '基礎解讀',
        'ai.interpretation.personalized': '個性化解讀',
        'ai.interpretation.deep': '深度解讀',
        'language.switch': '切換語言'
      },
      'en-US': {
        'fortune.draw': 'Draw Fortune',
        'fortune.interpret': 'AI Interpretation',
        'fortune.levels.excellent': 'Excellent',
        'fortune.levels.good': 'Good',
        'fortune.levels.average': 'Average',
        'fortune.levels.caution': 'Caution',
        'fortune.levels.warning': 'Warning',
        'ai.interpretation.basic': 'Basic Interpretation',
        'ai.interpretation.personalized': 'Personalized Interpretation',
        'ai.interpretation.deep': 'Deep Interpretation',
        'language.switch': 'Switch Language'
      }
    };

    Object.entries(basicTranslations).forEach(([lang, translations]) => {
      this.uiTranslations.set(lang as SupportedLanguage, translations);
    });
  }

  /**
   * 获取当前语言配置
   */
  public getCurrentLanguage(): LanguageConfig {
    return this.languageConfigs.get('zh-CN') || I18nManager.DEFAULT_CONFIGS[0];
  }

  /**
   * 获取所有可用语言
   */
  public getAvailableLanguages(): LanguageConfig[] {
    return Array.from(this.languageConfigs.values())
      .filter(config => config.enabled)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  /**
   * 验证语言代码
   */
  public validateLanguage(language: string | null): SupportedLanguage {
    if (language && this.languageConfigs.has(language as SupportedLanguage)) {
      const config = this.languageConfigs.get(language as SupportedLanguage);
      if (config?.enabled) {
        return language as SupportedLanguage;
      }
    }
    return 'zh-CN'; // 默认语言
  }

  /**
   * 从请求中检测用户语言偏好
   */
  public detectUserLanguage(request: NextRequest): LanguageDetectionResult {
    const sources: ('header' | 'query' | 'cookie' | 'default')[] = [];
    const candidates: { lang: SupportedLanguage; confidence: number; source: string }[] = [];

    // 1. 检查URL查询参数
    const queryLang = request.nextUrl.searchParams.get('language') || 
                     request.nextUrl.searchParams.get('lang');
    if (queryLang) {
      const validated = this.validateLanguage(queryLang);
      if (validated === queryLang) {
        candidates.push({ lang: validated, confidence: 0.9, source: 'query' });
        sources.push('query');
      }
    }

    // 2. 检查Cookie
    const cookieLang = request.cookies.get('preferred-language')?.value;
    if (cookieLang) {
      const validated = this.validateLanguage(cookieLang);
      if (validated === cookieLang) {
        candidates.push({ lang: validated, confidence: 0.8, source: 'cookie' });
        sources.push('cookie');
      }
    }

    // 3. 检查Accept-Language头
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const preferred = this.parseAcceptLanguage(acceptLanguage);
      if (preferred.length > 0) {
        preferred.forEach((lang, index) => {
          const validated = this.validateLanguage(lang);
          if (this.languageConfigs.has(validated)) {
            candidates.push({
              lang: validated,
              confidence: 0.7 - (index * 0.1),
              source: 'header'
            });
          }
        });
        sources.push('header');
      }
    }

    // 4. 默认语言
    if (candidates.length === 0) {
      candidates.push({ lang: 'zh-CN', confidence: 0.5, source: 'default' });
      sources.push('default');
    }

    // 选择最高置信度的语言
    const best = candidates.reduce((prev, current) => 
      prev.confidence > current.confidence ? prev : current
    );

    return {
      detected: best.lang,
      confidence: best.confidence,
      sources
    };
  }

  /**
   * 解析Accept-Language头
   */
  private parseAcceptLanguage(acceptLanguage: string): string[] {
    return acceptLanguage
      .split(',')
      .map(lang => {
        const [code, q] = lang.trim().split(';q=');
        return {
          code: code.trim(),
          quality: q ? parseFloat(q) : 1.0
        };
      })
      .sort((a, b) => b.quality - a.quality)
      .map(item => item.code);
  }

  /**
   * 获取签文的多语言内容
   */
  public async translateSlip(
    slipId: string,
    targetLang: SupportedLanguage
  ): Promise<LocalizedSlip | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // 使用数据库函数获取多语言内容
      const { data, error } = await supabase
        .rpc('get_fortune_slip_multilingual', {
          p_slip_id: slipId,
          p_language_code: targetLang
        });

      if (error) {
        console.error('Failed to get multilingual slip:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const slip = data[0];
      
      // 检查翻译状态
      let translationStatus: 'complete' | 'fallback' | 'missing' = 'missing';
      let fallbackLanguage: SupportedLanguage | undefined;

      if (slip.language_code === targetLang) {
        translationStatus = 'complete';
      } else if (slip.language_code) {
        translationStatus = 'fallback';
        fallbackLanguage = slip.language_code as SupportedLanguage;
      }

      return {
        id: slip.id,
        slip_number: slip.slip_number,
        temple_code: slip.temple_code,
        fortune_level: slip.fortune_level,
        categories: slip.categories || [],
        language: targetLang,
        title: slip.title || 'Title not available',
        content: slip.content || 'Content not available',
        basic_interpretation: slip.basic_interpretation || 'Interpretation not available',
        historical_context: slip.historical_context,
        symbolism: slip.symbolism,
        keywords: slip.keywords || [],
        translation_status: translationStatus,
        fallback_language: fallbackLanguage
      };

    } catch (error) {
      console.error('Error translating slip:', error);
      return null;
    }
  }

  /**
   * 获取UI翻译
   */
  public async getUITranslations(language: SupportedLanguage): Promise<UITranslations> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.uiTranslations.get(language) || {};
  }

  /**
   * 翻译UI文本
   */
  public translate(key: string, language: SupportedLanguage, fallback?: string): string {
    const translations = this.uiTranslations.get(language);
    if (!translations) {
      return fallback || key;
    }

    // 支持嵌套键（如 'fortune.levels.excellent'）
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return typeof value === 'string' ? value : (fallback || key);
  }

  /**
   * 格式化日期
   */
  public formatDate(date: Date, language: SupportedLanguage): string {
    const config = this.languageConfigs.get(language);
    if (!config) return date.toISOString();

    return new Intl.DateTimeFormat(config.numberFormat, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  }

  /**
   * 格式化数字
   */
  public formatNumber(number: number, language: SupportedLanguage): string {
    const config = this.languageConfigs.get(language);
    if (!config) return number.toString();

    return new Intl.NumberFormat(config.numberFormat).format(number);
  }

  /**
   * 记录语言使用统计
   */
  public async recordLanguageUsage(
    language: SupportedLanguage,
    userId?: string,
    sessionId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('usage_records')
        .insert({
          user_id: userId || null,
          session_id: sessionId || 'anonymous',
          action_type: 'language_switch',
          language_code: language,
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'language_manager'
          }
        });
    } catch (error) {
      console.error('Failed to record language usage:', error);
      // 不影响主要功能
    }
  }

  /**
   * 获取语言使用统计
   */
  public async getLanguageStats(days: number = 30): Promise<{ [key: string]: number }> {
    try {
      const { data, error } = await supabase
        .from('usage_records')
        .select('language_code')
        .eq('action_type', 'language_switch')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (error) {
        console.error('Failed to get language stats:', error);
        return {};
      }

      const stats: { [key: string]: number } = {};
      data?.forEach(record => {
        const lang = record.language_code || 'unknown';
        stats[lang] = (stats[lang] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting language stats:', error);
      return {};
    }
  }
}

// 导出单例实例
export const i18nManager = I18nManager.getInstance();