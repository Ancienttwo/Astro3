'use client';

import React, { useState, useEffect } from 'react';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';

interface FortuneSlip {
  id: string;
  slip_number: number;
  temple_name: string;
  fortune_level: string;
  categories: string[];
  title: string;
  content: string;
  basic_interpretation: string;
  historical_context?: string;
  symbolism?: string;
  language: SupportedLanguage;
  api_version: string;
}

interface ApiResponse {
  success: boolean;
  data?: FortuneSlip;
  error?: string;
  meta: {
    language: SupportedLanguage;
    api_version: string;
    response_time: string;
  };
}

const LANGUAGES = [
  { code: 'zh-CN' as SupportedLanguage, name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW' as SupportedLanguage, name: '繁體中文', flag: '🇹🇼' },
  { code: 'en-US' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
];

const SLIP_NUMBERS = [7, 8];

export default function MultilingualDemoExisting() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('zh-CN');
  const [currentSlip, setCurrentSlip] = useState<number>(7);
  const [fortuneData, setFortuneData] = useState<FortuneSlip | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 获取签文数据
  const fetchFortuneSlip = async (slipNumber: number, language: SupportedLanguage) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/fortune/existing/slips/${slipNumber}?language=${language}`);
      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setFortuneData(data.data);
      } else {
        setError(data.error || 'Failed to fetch fortune slip');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载和语言/签文变化时重新加载
  useEffect(() => {
    fetchFortuneSlip(currentSlip, currentLanguage);
  }, [currentLanguage, currentSlip]);

  // 获取运势等级的颜色
  const getFortuneColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'caution': return 'text-orange-600 bg-orange-50';
      case 'warning': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // 获取运势等级的中文名称
  const getFortuneText = (level: string, language: SupportedLanguage) => {
    const levelMap = {
      'zh-CN': {
        excellent: '大吉',
        good: '吉',
        average: '中平',
        caution: '小心',
        warning: '凶'
      },
      'zh-TW': {
        excellent: '大吉',
        good: '吉',
        average: '中平',
        caution: '小心',
        warning: '凶'
      },
      'en-US': {
        excellent: 'Excellent',
        good: 'Good',
        average: 'Average',
        caution: 'Caution',
        warning: 'Warning'
      }
    };
    return levelMap[language]?.[level as keyof typeof levelMap[typeof language]] || level;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-900 mb-2">
            关帝灵签多语言系统演示
          </h1>
          <p className="text-amber-700">
            Guandi Fortune Slip Multilingual System Demo
          </p>
          <div className="mt-4 text-sm text-amber-600">
            API Version: 1.0-existing (Compatible with current database)
          </div>
        </div>

        {/* 控制面板 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 语言选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语言选择 / Language Selection
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      currentLanguage === lang.code
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-lg mb-1">{lang.flag}</div>
                    <div>{lang.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 签文选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                签文选择 / Fortune Slip Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SLIP_NUMBERS.map((num) => (
                  <button
                    key={num}
                    onClick={() => setCurrentSlip(num)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      currentSlip === num
                        ? 'bg-amber-100 border-amber-300 text-amber-800'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    第 {num} 签
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 签文内容 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
              <div className="text-gray-600">Loading...</div>
            </div>
          )}

          {error && (
            <div className="p-8 text-center">
              <div className="text-red-600 mb-2">❌ 加载失败</div>
              <div className="text-gray-600">{error}</div>
              <button
                onClick={() => fetchFortuneSlip(currentSlip, currentLanguage)}
                className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                重试
              </button>
            </div>
          )}

          {fortuneData && !loading && !error && (
            <div>
              {/* 签文头部 */}
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">
                    第 {fortuneData.slip_number} 签
                  </h2>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getFortuneColor(fortuneData.fortune_level)}`}>
                    {getFortuneText(fortuneData.fortune_level, currentLanguage)}
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mb-2">
                  {fortuneData.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {fortuneData.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/20 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              {/* 签文内容 */}
              <div className="p-6 space-y-6">
                {/* 签诗 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {currentLanguage === 'en-US' ? 'Fortune Poem' : '签诗'}
                  </h4>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {fortuneData.content}
                    </p>
                  </div>
                </div>

                {/* 基础解读 */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    {currentLanguage === 'en-US' ? 'Basic Interpretation' : '基础解读'}
                  </h4>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 leading-relaxed">
                      {fortuneData.basic_interpretation}
                    </p>
                  </div>
                </div>

                {/* 历史典故 */}
                {fortuneData.historical_context && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      {currentLanguage === 'en-US' ? 'Historical Context' : '历史典故'}
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                        {fortuneData.historical_context}
                      </p>
                    </div>
                  </div>
                )}

                {/* 象征意义 */}
                {fortuneData.symbolism && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                      {currentLanguage === 'en-US' ? 'Symbolism' : '象征意义'}
                    </h4>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                        {fortuneData.symbolism}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 技术信息 */}
              <div className="bg-gray-50 p-4 border-t">
                <div className="text-xs text-gray-500 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <strong>API版本:</strong> {fortuneData.api_version}
                  </div>
                  <div>
                    <strong>语言:</strong> {fortuneData.language}
                  </div>
                  <div>
                    <strong>庙宇:</strong> {fortuneData.temple_name}
                  </div>
                  <div>
                    <strong>ID:</strong> {fortuneData.id.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            系统说明 / System Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">功能特点:</h4>
              <ul className="space-y-1">
                <li>• 支持中英文多语言切换</li>
                <li>• 兼容现有数据库结构</li>
                <li>• 实时API数据获取</li>
                <li>• 响应式界面设计</li>
                <li>• 自动语言检测与回退</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">API端点:</h4>
              <ul className="space-y-1">
                <li>• GET /api/fortune/existing/slips/[slip_number]</li>
                <li>• 支持 ?language={zh-CN|zh-TW|en-US}</li>
                <li>• 返回完整签文数据</li>
                <li>• 包含元数据和错误处理</li>
                <li>• Edge Runtime 优化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}