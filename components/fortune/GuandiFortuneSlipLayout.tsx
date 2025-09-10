'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Crown, 
  BookOpen, 
  Scroll, 
  Calendar,
  Star,
  Flame,
  Sparkles
} from 'lucide-react';
// import LoginGuidanceModal from '@/components/auth/LoginGuidanceModal'; // 移除，改为直接跳转
import AIPromptMaterialsDebug from '@/components/debug/AIPromptMaterialsDebug';

interface GuandiFortuneSlip {
  slip_number: number;
  historical_reference: string;
  fortune_grade: string;
  poem_verses: string;
  classical_overview: string;
  modern_explanation: string;
  historical_story: string;
  fortune_predictions: {
    功名: string;
    六甲: string;
    求財: string;
    婚姻: string;
    農牧: string;
    失物: string;
    生意: string;
    丁口: string;
    出行: string;
    疾病: string;
    官司: string;
    時運: string;
  };
  language: 'zh-CN' | 'zh-TW' | 'en-US';
}

interface GuandiFortuneSlipLayoutProps {
  fortuneSlip: GuandiFortuneSlip;
  onRequestAIInterpretation?: () => void;
  rawSlipData?: any; // 用于调试和AI Prompt工程
}

const GuandiFortuneSlipLayout: React.FC<GuandiFortuneSlipLayoutProps> = ({ 
  fortuneSlip, 
  onRequestAIInterpretation,
  rawSlipData
}) => {
  // const [showLoginModal, setShowLoginModal] = useState(false); // 移除模态框状态
  
  // 根据语言显示不同的UI文本
  const getLocalizedText = (zhText: string, enText: string) => {
    return fortuneSlip.language === 'en-US' ? enText : zhText;
  };

  // 处理AI解读请求 - 新的流程
  const handleAIInterpretation = () => {
    try {
      // 准备要保存的签文数据
      const slipDataForAI = {
        slip_number: fortuneSlip.slip_number,
        historical_reference: fortuneSlip.historical_reference,
        fortune_grade: fortuneSlip.fortune_grade,
        poem_verses: fortuneSlip.poem_verses,
        classical_overview: fortuneSlip.classical_overview,
        modern_explanation: fortuneSlip.modern_explanation,
        historical_story: fortuneSlip.historical_story,
        fortune_predictions: fortuneSlip.fortune_predictions,
        language: fortuneSlip.language,
        timestamp: Date.now(),
        rawSlipData: rawSlipData // 包含原始数据用于AI Prompt工程
      };

      // 保存到sessionStorage
      sessionStorage.setItem('fortuneSlipAIData', JSON.stringify(slipDataForAI));
      
      // 构建认证页面URL，包含回调和语言信息
      const authUrl = `/auth?callback=${encodeURIComponent('/aiguandi')}&lang=${fortuneSlip.language}&source=guandi`;
      
      // 跳转到认证页面
      window.location.href = authUrl;
      
      console.log('🔄 签文数据已保存，跳转到认证页面:', authUrl);
    } catch (error) {
      console.error('❌ 保存签文数据失败:', error);
      // 备用方案：直接跳转到认证页面
      window.location.href = '/auth';
    }
  };
  // 解析运势等级样式
  const getFortuneGradeStyle = (grade: string) => {
    if (grade.includes('大吉')) {
      return { 
        color: '#15803D', 
        bg: 'bg-green-50', 
        border: 'border-green-300',
        icon: '🟢'
      };
    } else if (grade.includes('上吉') || grade.includes('中吉')) {
      return { 
        color: '#2563EB', 
        bg: 'bg-blue-50', 
        border: 'border-blue-300',
        icon: '🔵'
      };
    } else if (grade.includes('中平')) {
      return { 
        color: '#D97706', 
        bg: 'bg-amber-50', 
        border: 'border-amber-300',
        icon: '🟡'
      };
    } else if (grade.includes('下吉')) {
      return { 
        color: '#DC2626', 
        bg: 'bg-red-50', 
        border: 'border-red-300',
        icon: '🟠'
      };
    } else {
      return { 
        color: '#7C2D12', 
        bg: 'bg-red-100', 
        border: 'border-red-400',
        icon: '🔴'
      };
    }
  };

  const gradeStyle = getFortuneGradeStyle(fortuneSlip.fortune_grade);

  // 分类12类吉凶判断 - 以JSON数据中的繁体字键名为主
  const fortuneCategories = [
    { key: '功名', label: getLocalizedText('功名', 'Career'), icon: '🎓', color: 'text-purple-700' },
    { key: '求財', label: getLocalizedText('求財', 'Wealth'), icon: '💰', color: 'text-green-700' },
    { key: '婚姻', label: getLocalizedText('婚姻', 'Marriage'), icon: '💕', color: 'text-pink-700' },
    { key: '生意', label: getLocalizedText('生意', 'Business'), icon: '🏪', color: 'text-blue-700' },
    { key: '出行', label: getLocalizedText('出行', 'Travel'), icon: '🚗', color: 'text-indigo-700' },
    { key: '疾病', label: getLocalizedText('疾病', 'Health'), icon: '🏥', color: 'text-red-700' },
    { key: '官司', label: getLocalizedText('官司', 'Legal'), icon: '⚖️', color: 'text-gray-700' },
    { key: '時運', label: getLocalizedText('時運', 'Fortune'), icon: '🍀', color: 'text-emerald-700' },
    { key: '六甲', label: getLocalizedText('六甲', 'Children'), icon: '👶', color: 'text-orange-700' },
    { key: '農牧', label: getLocalizedText('農牧', 'Farming'), icon: '🌾', color: 'text-yellow-700' },
    { key: '失物', label: getLocalizedText('失物', 'Lost Items'), icon: '🔍', color: 'text-cyan-700' },
    { key: '丁口', label: getLocalizedText('丁口', 'Family'), icon: '👨‍👩‍👧‍👦', color: 'text-teal-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 px-4">
      {/* 主标题与签诗合并卡片 - 红色主色配星光黄点缀 */}
      <Card className="border-2 border-red-400 bg-gradient-to-br from-red-50 to-red-100 shadow-lg">
        <CardContent className="p-6">
          <div className="bg-white p-6 rounded-lg border border-red-200">
            {/* 标题区域 */}
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-red-800 mb-2">
                {getLocalizedText(`第${fortuneSlip.slip_number}籤`, `Slip ${fortuneSlip.slip_number}`)}
              </h2>
              <h3 className="text-xl md:text-2xl font-semibold text-red-700 mb-3">
                {fortuneSlip.historical_reference}
              </h3>
              <Badge 
                className="bg-red-600 text-white px-4 py-2 text-lg font-bold shadow-md"
              >
                {fortuneSlip.fortune_grade}
              </Badge>
            </div>
            
            <Separator className="my-6 bg-red-200" />
            
            {/* 签诗内容 */}
            <div>
              <h4 className="text-center text-red-800 font-bold text-lg mb-4">
                {getLocalizedText('籤詩四句', 'Oracle Poem')}
              </h4>
              <pre className="text-red-900 text-lg md:text-xl leading-relaxed font-serif text-center whitespace-pre-wrap font-medium">
                {fortuneSlip.poem_verses}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 古典概述卡片 - 黄红组合设计 */}
      {fortuneSlip.classical_overview && (
        <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
          <CardHeader className="bg-yellow-400 text-center py-4">
            <CardTitle className="text-red-800 text-lg md:text-xl font-bold">
              {getLocalizedText('古典概述', 'Classical Overview')}
            </CardTitle>
            <p className="text-red-700 text-sm mt-1">{getLocalizedText('傳統解籤要義', 'Traditional Interpretation')}</p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="bg-white p-6 rounded-lg border border-yellow-300">
              <p className="text-red-900 leading-7 text-sm md:text-base">
                {fortuneSlip.classical_overview}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 白话解说卡片 - 黄红组合设计 */}
      {fortuneSlip.modern_explanation && (
        <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
          <CardHeader className="bg-yellow-400 text-center py-4">
            <CardTitle className="text-red-800 text-lg md:text-xl font-bold">
              {getLocalizedText('白話解說', 'Modern Explanation')}
            </CardTitle>
            <p className="text-red-700 text-sm mt-1">{getLocalizedText('現代通俗解釋', 'Contemporary Interpretation')}</p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="bg-white p-6 rounded-lg border border-yellow-300">
              <div className="text-red-900 leading-7 text-sm md:text-base space-y-4">
                {fortuneSlip.modern_explanation.split('\n').map((paragraph, index) => (
                  <p key={index} className={paragraph.trim() ? '' : 'hidden'}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史典故卡片 - 黄红组合设计 */}
      {fortuneSlip.historical_story && (
        <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
          <CardHeader className="bg-yellow-400 text-center py-4">
            <CardTitle className="text-red-800 text-lg md:text-xl font-bold">
              {getLocalizedText('歷史典故', 'Historical Allusion')}
            </CardTitle>
            <p className="text-red-700 text-sm mt-1">
              {fortuneSlip.historical_reference}
            </p>
          </CardHeader>
          
          <CardContent className="p-6">
            <div className="bg-white p-6 rounded-lg border border-yellow-300">
              <p className="text-red-900 leading-7 text-sm md:text-base">
                {fortuneSlip.historical_story}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 12类吉凶判断卡片 - 黄红组合设计 */}
      <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
        <CardHeader className="bg-yellow-400 text-center py-4">
          <CardTitle className="text-red-800 text-lg md:text-xl font-bold">
            {getLocalizedText('十二類吉凶判斷', 'Twelve Category Fortune Guide')}
          </CardTitle>
          <p className="text-red-700 text-sm mt-1">
            {getLocalizedText('根據所求之事查看具體指引', 'Specific guidance based on your inquiry')}
          </p>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {fortuneCategories.map((category) => {
              const prediction = fortuneSlip.fortune_predictions[category.key as keyof typeof fortuneSlip.fortune_predictions];
              return prediction ? (
                <div key={category.key} className="bg-white border border-yellow-300 rounded-lg p-3 md:p-4 shadow-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg md:text-xl">{category.icon}</span>
                    <h4 className="font-semibold text-sm md:text-base text-red-700">
                      {category.label}
                    </h4>
                  </div>
                  {/* 移动端和桌面端都显示2*2断语布局 */}
                  <div className="grid grid-cols-2 gap-1">
                    {(() => {
                      // 根据语言选择显示内容
                      let displayText = prediction;
                      
                      // 如果是英文模式且有judgment_en字段，优先使用英文翻译
                      if (fortuneSlip.language === 'en-US') {
                        // 尝试解析JSON获取英文翻译
                        try {
                          const parsed = JSON.parse(prediction);
                          if (parsed.judgment_en) {
                            displayText = parsed.judgment_en;
                          } else if (parsed.judgment) {
                            displayText = parsed.judgment;
                          }
                        } catch {
                          // 如果不是JSON格式，使用原文
                          displayText = prediction;
                        }
                      } else {
                        // 中文模式，提取judgment字段
                        try {
                          const parsed = JSON.parse(prediction);
                          if (parsed.judgment) {
                            displayText = parsed.judgment;
                          }
                        } catch {
                          displayText = prediction;
                        }
                      }
                      
                      return displayText.split(/[\s　]+/).slice(0, 4).map((phrase, idx) => (
                        <div key={idx} className="text-center bg-red-50 rounded px-1 py-0.5">
                          <span className="text-red-800 font-medium text-xs">
                            {phrase}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              ) : null;
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI解签引导卡片 - 黄红组合设计 */}
      {onRequestAIInterpretation && (
        <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-lg">
          <CardContent className="text-center py-8 px-6">
            <h3 className="text-xl md:text-2xl font-bold text-red-800 mb-4">
              {getLocalizedText('想要更深入的個人化解讀？', 'Want deeper personalized interpretation?')}
            </h3>
            
            <p className="text-red-700 mb-6 text-base md:text-lg">
              {getLocalizedText('AI系統結合歷史典故，為您提供量身定制的智慧指引', 'AI system combines historical context to provide customized wisdom guidance')}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-yellow-300 shadow-sm">
                <div className="text-red-700 font-medium">
                  {getLocalizedText('個性化解讀', 'Personalized Interpretation')}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-yellow-300 shadow-sm">
                <div className="text-red-700 font-medium">
                  {getLocalizedText('故事化表達', 'Narrative Expression')}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border border-yellow-300 shadow-sm">
                <div className="text-red-700 font-medium">
                  {getLocalizedText('智慧指引', 'Wisdom Guidance')}
                </div>
              </div>
            </div>

            <button
              onClick={handleAIInterpretation}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-yellow-100 px-8 py-3 rounded-lg text-lg font-semibold shadow-lg transition-all duration-200 hover:scale-105"
            >
              {getLocalizedText('開啟AI智慧解讀', 'Start AI Interpretation')}
            </button>
          </CardContent>
        </Card>
      )}


      {/* 开发调试：AI Prompt工程素材 */}
      {process.env.NODE_ENV === 'development' && rawSlipData && (
        <AIPromptMaterialsDebug slipData={rawSlipData} />
      )}
    </div>
  );
};

export default GuandiFortuneSlipLayout;