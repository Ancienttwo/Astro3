'use client';

import React, { useState, useEffect, useRef } from 'react';

type SupportedLanguage = 'zh-CN' | 'zh-TW' | 'en-US';
type InterpretationLevel = 'basic' | 'personalized' | 'deep';

interface UserContext {
  gender?: 'male' | 'female';
  age?: number;
  concern_area?: 'career' | 'love' | 'health' | 'finance' | 'study' | 'general';
  specific_question?: string;
  current_situation?: string;
  emotional_state?: 'anxious' | 'hopeful' | 'confused' | 'calm';
}

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
}

interface AIInterpretation {
  level: InterpretationLevel;
  language: SupportedLanguage;
  interpretation: string;
  key_insights: string[];
  practical_advice: string[];
  confidence_score: number;
  interpretation_id: string;
  created_at: string;
  model_used: string;
  token_usage?: {
    total_tokens: number;
  };
}

const LANGUAGES = [
  { code: 'zh-CN' as SupportedLanguage, name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW' as SupportedLanguage, name: '繁體中文', flag: '🇹🇼' },
  { code: 'en-US' as SupportedLanguage, name: 'English', flag: '🇺🇸' },
];

const LEVELS = [
  { code: 'basic' as InterpretationLevel, name: '基础解读', description: '基于签文的标准解读' },
  { code: 'personalized' as InterpretationLevel, name: '个性化解读', description: '结合个人背景的定制解读' },
  { code: 'deep' as InterpretationLevel, name: '深度解读', description: '包含灵性指导的全面解读' },
];

const CONCERN_AREAS = [
  { code: 'career', name: '事业发展' },
  { code: 'love', name: '感情婚姻' },
  { code: 'health', name: '健康养生' },
  { code: 'finance', name: '财运投资' },
  { code: 'study', name: '学业考试' },
  { code: 'general', name: '综合运势' },
];

const EMOTIONAL_STATES = [
  { code: 'anxious', name: '焦虑不安' },
  { code: 'hopeful', name: '充满希望' },
  { code: 'confused', name: '迷茫困惑' },
  { code: 'calm', name: '平静冷静' },
];

export default function AIFortuneDemoPage() {
  // 基本状态
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('zh-CN');
  const [currentLevel, setCurrentLevel] = useState<InterpretationLevel>('basic');
  const [currentSlip, setCurrentSlip] = useState<number>(7);
  
  // 用户上下文
  const [userContext, setUserContext] = useState<UserContext>({});
  
  // 数据状态
  const [fortuneSlip, setFortuneSlip] = useState<FortuneSlip | null>(null);
  const [aiInterpretation, setAIInterpretation] = useState<AIInterpretation | null>(null);
  
  // UI状态
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [useStreaming, setUseStreaming] = useState<boolean>(true);
  
  // 引用
  const eventSourceRef = useRef<EventSource | null>(null);
  const streamContentRef = useRef<HTMLDivElement>(null);

  // 获取AI解读 (非流式)
  const fetchAIInterpretation = async () => {
    setLoading(true);
    setError(null);
    setAIInterpretation(null);
    setStreamingContent('');

    const requestBody = {
      slip_number: currentSlip,
      language: currentLanguage,
      level: currentLevel,
      user_context: (currentLevel === 'personalized' || currentLevel === 'deep') ? userContext : undefined
    };

    try {
      const response = await fetch('/api/fortune/ai-interpret', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        setFortuneSlip(data.data.fortune_slip);
        setAIInterpretation(data.data.ai_interpretation);
      } else {
        setError(data.error || 'AI解读失败');
      }

    } catch (err) {
      setError('网络请求失败');
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 流式AI解读
  const fetchStreamingInterpretation = async () => {
    setLoading(true);
    setError(null);
    setAIInterpretation(null);
    setStreamingContent('');
    setIsStreaming(true);

    // 关闭之前的连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const queryParams = new URLSearchParams({
      slip_number: currentSlip.toString(),
      language: currentLanguage,
      level: currentLevel,
    });

    try {
      const eventSource = new EventSource(`/api/fortune/ai-interpret/stream?${queryParams}`);
      eventSourceRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const eventData = JSON.parse(event.data);
          
          switch (eventData.type) {
            case 'start':
              console.log('🎬 Stream started:', eventData.data);
              setStreamingContent('🤖 AI正在思考中...\n\n');
              break;
              
            case 'chunk':
              setStreamingContent(prev => prev + eventData.data.content);
              // 自动滚动到底部
              if (streamContentRef.current) {
                streamContentRef.current.scrollTop = streamContentRef.current.scrollHeight;
              }
              break;
              
            case 'complete':
              console.log('✅ Stream completed');
              setFortuneSlip(eventData.data.fortune_slip);
              setAIInterpretation(eventData.data.interpretation);
              setIsStreaming(false);
              setLoading(false);
              break;
              
            case 'error':
              console.error('❌ Stream error:', eventData.data.error);
              setError(eventData.data.error);
              setIsStreaming(false);
              setLoading(false);
              break;
              
            case 'usage':
              console.log('📊 Usage stats:', eventData.data);
              break;
          }
        } catch (parseError) {
          console.error('Failed to parse SSE data:', parseError);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        setError('流式连接错误');
        setIsStreaming(false);
        setLoading(false);
        eventSource.close();
      };

    } catch (err) {
      setError('无法建立流式连接');
      setIsStreaming(false);
      setLoading(false);
      console.error('Streaming error:', err);
    }
  };

  // 开始解读
  const startInterpretation = () => {
    if (useStreaming) {
      fetchStreamingInterpretation();
    } else {
      fetchAIInterpretation();
    }
  };

  // 停止流式解读
  const stopStreaming = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
    setLoading(false);
  };

  // 清理effect
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            🤖 AI签文解读系统演示
          </h1>
          <p className="text-purple-700">
            Guandi Fortune AI Interpretation Demo - Phase 2
          </p>
          <div className="mt-4 text-sm text-purple-600">
            三层AI解读：基础 → 个性化 → 深度灵性指导
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：配置面板 */}
          <div className="space-y-6">
            {/* 基础设置 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">基础设置</h3>
              
              {/* 签文选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择签文
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[7, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => setCurrentSlip(num)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        currentSlip === num
                          ? 'bg-purple-100 border-purple-300 text-purple-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      第 {num} 签
                    </button>
                  ))}
                </div>
              </div>

              {/* 语言选择 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解读语言
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLanguage(lang.code)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        currentLanguage === lang.code
                          ? 'bg-purple-100 border-purple-300 text-purple-800'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-lg mb-1">{lang.flag}</div>
                      <div>{lang.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 解读级别 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解读级别
                </label>
                <div className="space-y-2">
                  {LEVELS.map((level) => (
                    <label key={level.code} className="flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        value={level.code}
                        checked={currentLevel === level.code}
                        onChange={(e) => setCurrentLevel(e.target.value as InterpretationLevel)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-800">{level.name}</div>
                        <div className="text-sm text-gray-600">{level.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 流式输出选项 */}
              <div className="mb-4">
                <label className="flex items-center p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useStreaming}
                    onChange={(e) => setUseStreaming(e.target.checked)}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">启用流式输出</div>
                    <div className="text-sm text-gray-600">实时显示AI解读过程</div>
                  </div>
                </label>
              </div>
            </div>

            {/* 用户背景 (个性化和深度解读需要) */}
            {(currentLevel === 'personalized' || currentLevel === 'deep') && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">个人信息</h3>
                
                <div className="space-y-4">
                  {/* 性别和年龄 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                      <select
                        value={userContext.gender || ''}
                        onChange={(e) => setUserContext({...userContext, gender: e.target.value as 'male' | 'female'})}
                        className="w-full p-2 border rounded-lg"
                      >
                        <option value="">请选择</option>
                        <option value="male">男</option>
                        <option value="female">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
                      <input
                        type="number"
                        value={userContext.age || ''}
                        onChange={(e) => setUserContext({...userContext, age: parseInt(e.target.value) || undefined})}
                        className="w-full p-2 border rounded-lg"
                        placeholder="例如：28"
                      />
                    </div>
                  </div>

                  {/* 关注领域 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">关注领域</label>
                    <select
                      value={userContext.concern_area || ''}
                      onChange={(e) => setUserContext({...userContext, concern_area: e.target.value as any})}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">请选择</option>
                      {CONCERN_AREAS.map(area => (
                        <option key={area.code} value={area.code}>{area.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 具体问题 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">具体问题</label>
                    <textarea
                      value={userContext.specific_question || ''}
                      onChange={(e) => setUserContext({...userContext, specific_question: e.target.value})}
                      className="w-full p-2 border rounded-lg resize-none"
                      rows={3}
                      placeholder="请描述您想咨询的具体问题..."
                    />
                  </div>

                  {/* 当前状况 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">当前状况</label>
                    <textarea
                      value={userContext.current_situation || ''}
                      onChange={(e) => setUserContext({...userContext, current_situation: e.target.value})}
                      className="w-full p-2 border rounded-lg resize-none"
                      rows={2}
                      placeholder="简单描述您的现状..."
                    />
                  </div>

                  {/* 情绪状态 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">情绪状态</label>
                    <select
                      value={userContext.emotional_state || ''}
                      onChange={(e) => setUserContext({...userContext, emotional_state: e.target.value as any})}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">请选择</option>
                      {EMOTIONAL_STATES.map(state => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex gap-4">
                <button
                  onClick={startInterpretation}
                  disabled={loading || isStreaming}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading || isStreaming ? '🤖 AI解读中...' : '🎯 开始AI解读'}
                </button>
                
                {isStreaming && (
                  <button
                    onClick={stopStreaming}
                    className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
                  >
                    停止
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 右侧：解读结果 */}
          <div className="space-y-6">
            {/* 错误显示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-red-600 mr-2">❌</div>
                  <div className="text-red-800">{error}</div>
                </div>
              </div>
            )}

            {/* 流式输出显示 */}
            {useStreaming && (isStreaming || streamingContent) && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    🎬 实时AI解读
                  </h3>
                  {isStreaming && (
                    <div className="flex items-center text-sm text-purple-600">
                      <div className="animate-pulse mr-2">●</div>
                      生成中...
                    </div>
                  )}
                </div>
                <div
                  ref={streamContentRef}
                  className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm"
                >
                  {streamingContent || '等待AI开始解读...'}
                </div>
              </div>
            )}

            {/* AI解读结果 */}
            {aiInterpretation && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    🤖 AI解读结果
                  </h3>
                  <div className="text-sm text-gray-500">
                    {aiInterpretation.model_used} | 置信度: {(aiInterpretation.confidence_score * 100).toFixed(1)}%
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">完整解读</h4>
                    <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                      {aiInterpretation.interpretation}
                    </div>
                  </div>

                  {aiInterpretation.token_usage && (
                    <div className="text-xs text-gray-500 border-t pt-2">
                      Token使用: {aiInterpretation.token_usage.total_tokens} | 
                      解读ID: {aiInterpretation.interpretation_id} | 
                      生成时间: {new Date(aiInterpretation.created_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 签文信息 */}
            {fortuneSlip && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">📜 签文信息</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">第 {fortuneSlip.slip_number} 签</span>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                      {fortuneSlip.fortune_level}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">签名：</span>
                    <span className="text-gray-800">{fortuneSlip.title}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-700">签诗：</span>
                    <div className="text-gray-800 whitespace-pre-line">{fortuneSlip.content}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {fortuneSlip.categories.map((category, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🎓 使用说明</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">基础解读</h4>
              <ul className="space-y-1">
                <li>• 基于传统签文的标准解读</li>
                <li>• 无需个人信息</li>
                <li>• 适合快速了解签文含义</li>
                <li>• 响应速度最快</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">个性化解读</h4>
              <ul className="space-y-1">
                <li>• 结合个人背景定制</li>
                <li>• 需要填写基本信息</li>
                <li>• 提供针对性建议</li>
                <li>• 更贴近个人需求</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">深度解读</h4>
              <ul className="space-y-1">
                <li>• 包含灵性指导</li>
                <li>• 深层含义解析</li>
                <li>• 人生哲学启发</li>
                <li>• 最全面的解读体验</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}