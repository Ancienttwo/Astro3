'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft,
  Sparkles,
  User,
  Crown,
  Heart,
  Briefcase,
  DollarSign,
  Plane,
  Home,
  Scale,
  Clock,
  Baby,
  Search,
  Building,
  Stethoscope
} from 'lucide-react';
import SmartLayout from '@/components/SmartLayout';

// 签文数据接口
interface FortuneSlipData {
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
  timestamp: number;
  rawSlipData?: any;
}

// 询问类型配置
const inquiryTypes = [
  { 
    id: 'career', 
    key: '功名', 
    name: '功名', 
    nameEn: 'Career & Fame', 
    icon: Crown, 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: '事业发展、升迁考试、学业进步',
    descriptionEn: 'Career development, promotions, academic progress'
  },
  { 
    id: 'wealth', 
    key: '求財', 
    name: '求財', 
    nameEn: 'Wealth & Fortune', 
    icon: DollarSign, 
    color: 'bg-green-100 text-green-700 border-green-200',
    description: '财运投资、生意经营、收入状况',
    descriptionEn: 'Financial fortune, investments, business income'
  },
  { 
    id: 'marriage', 
    key: '婚姻', 
    name: '婚姻', 
    nameEn: 'Marriage & Romance', 
    icon: Heart, 
    color: 'bg-pink-100 text-pink-700 border-pink-200',
    description: '爱情关系、婚姻状况、感情发展',
    descriptionEn: 'Love relationships, marriage, emotional development'
  },
  { 
    id: 'business', 
    key: '生意', 
    name: '生意', 
    nameEn: 'Business & Trade', 
    icon: Building, 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: '商业合作、项目投资、贸易往来',
    descriptionEn: 'Business cooperation, project investment, trade'
  },
  { 
    id: 'health', 
    key: '疾病', 
    name: '疾病', 
    nameEn: 'Health & Illness', 
    icon: Stethoscope, 
    color: 'bg-red-100 text-red-700 border-red-200',
    description: '身体健康、疾病治疗、养生保健',
    descriptionEn: 'Physical health, illness treatment, wellness'
  },
  { 
    id: 'travel', 
    key: '出行', 
    name: '出行', 
    nameEn: 'Travel & Journey', 
    icon: Plane, 
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    description: '出差旅行、搬迁移居、出国发展',
    descriptionEn: 'Travel, relocation, overseas development'
  },
  { 
    id: 'family', 
    key: '丁口', 
    name: '丁口', 
    nameEn: 'Family & Population', 
    icon: Home, 
    color: 'bg-teal-100 text-teal-700 border-teal-200',
    description: '家庭关系、人际交往、团队合作',
    descriptionEn: 'Family relations, interpersonal relationships, teamwork'
  },
  { 
    id: 'legal', 
    key: '官司', 
    name: '官司', 
    nameEn: 'Legal Matters', 
    icon: Scale, 
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    description: '法律纠纷、合同争议、权益维护',
    descriptionEn: 'Legal disputes, contract issues, rights protection'
  },
  { 
    id: 'timing', 
    key: '時運', 
    name: '時運', 
    nameEn: 'Current Fortune', 
    icon: Clock, 
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: '当前运势、时机把握、转运方法',
    descriptionEn: 'Current fortune, timing opportunities, luck improvement'
  },
  { 
    id: 'children', 
    key: '六甲', 
    name: '六甲', 
    nameEn: 'Pregnancy & Birth', 
    icon: Baby, 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    description: '怀孕生子、子女教育、生育计划',
    descriptionEn: 'Pregnancy, children education, family planning'
  },
  { 
    id: 'lostItems', 
    key: '失物', 
    name: '失物', 
    nameEn: 'Lost Items', 
    icon: Search, 
    color: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    description: '寻找失物、追回损失、挽回机会',
    descriptionEn: 'Finding lost items, recovering losses, regaining opportunities'
  },
  { 
    id: 'general', 
    key: '綜合', 
    name: '綜合運勢', 
    nameEn: 'Overall Fortune', 
    icon: Sparkles, 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: '整体运势、人生指导、全面分析',
    descriptionEn: 'Overall fortune, life guidance, comprehensive analysis'
  }
];

export default function AiGuandiPage() {
  const [fortuneData, setFortuneData] = useState<FortuneSlipData | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [showResponse, setShowResponse] = useState(false);
  const router = useRouter();

  // 获取本地化文本
  const getLocalizedText = (zhText: string, enText: string) => {
    return fortuneData?.language === 'en-US' ? enText : zhText;
  };

  // 页面加载时从sessionStorage恢复签文数据
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem('fortuneSlipAIData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // 检查数据是否过期（1小时）
        const isExpired = Date.now() - parsedData.timestamp > 60 * 60 * 1000;
        
        if (isExpired) {
          console.log('⚠️ 签文数据已过期，清理sessionStorage');
          sessionStorage.removeItem('fortuneSlipAIData');
          router.push('/guandi');
          return;
        }
        
        setFortuneData(parsedData);
        console.log('✅ 签文数据恢复成功:', parsedData.slip_number);
      } else {
        console.log('❌ 未找到签文数据，跳转回guandi页面');
        router.push('/guandi');
      }
    } catch (error) {
      console.error('❌ 恢复签文数据失败:', error);
      router.push('/guandi');
    }
  }, [router]);

  // 处理询问类型选择
  const handleInquirySelect = (inquiryId: string) => {
    setSelectedInquiry(inquiryId);
    setShowResponse(false);
    setAiResponse('');
  };

  // 开始AI解读
  const startAIInterpretation = async () => {
    if (!selectedInquiry || !fortuneData) return;

    setIsLoading(true);
    setShowResponse(true);
    setAiResponse('');

    try {
      const selectedType = inquiryTypes.find(type => type.id === selectedInquiry);
      if (!selectedType) return;

      // 构建AI请求数据
      const requestData = {
        fortuneSlip: fortuneData,
        inquiryType: selectedType,
        language: fortuneData.language
      };

      console.log('🤖 开始AI解读请求:', requestData);

      // 调用真实的AI流式API
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('用户未登录');
      }

      const response = await fetch('/api/ai-interpretation-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.status === 401) {
        // 未授权，重新跳转到登录
        window.location.href = '/auth?callback=' + encodeURIComponent('/aiguandi');
        return;
      }

      if (response.status === 403) {
        // 配额不足
        const errorData = await response.json();
        setAiResponse(errorData.error);
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsLoading(false);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            
            if (data === '[DONE]') {
              setIsLoading(false);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setAiResponse(prev => prev + parsed.content);
              }
              if (parsed.error) {
                console.error('AI服务错误:', parsed.error);
                setAiResponse(parsed.error);
                setIsLoading(false);
                break;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ AI解读失败:', error);
      setIsLoading(false);
      setAiResponse(getLocalizedText('抱歉，AI解读服务暂时不可用，请稍后重试。', 'Sorry, AI interpretation service is temporarily unavailable. Please try again later.'));
    }
  };

  if (!fortuneData) {
    return (
      <SmartLayout>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-red-700">Loading fortune slip data...</p>
          </div>
        </div>
      </SmartLayout>
    );
  }

  return (
    <SmartLayout>
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 返回按钮 */}
          <div className="mb-6">
            <Button
              onClick={() => router.push('/guandi')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {getLocalizedText('返回求签', 'Back to Fortune')}
            </Button>
          </div>

          {/* 签文概要卡片 */}
          <Card className="border-2 border-red-400 bg-gradient-to-br from-red-50 to-red-100 shadow-lg mb-6">
            <CardHeader className="bg-red-600 text-center py-4">
              <CardTitle className="text-yellow-100 text-xl font-bold">
                {getLocalizedText(`第${fortuneData.slip_number}籤 - AI智慧解讀`, `Slip ${fortuneData.slip_number} - AI Interpretation`)}
              </CardTitle>
              <p className="text-yellow-200 text-sm">
                {fortuneData.historical_reference}
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-white p-4 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-3">
                  <Badge className="bg-red-600 text-white">
                    {fortuneData.fortune_grade}
                  </Badge>
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-red-900 text-sm leading-relaxed">
                  {fortuneData.poem_verses}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 询问类型选择 */}
          <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg mb-6">
            <CardHeader className="bg-yellow-400 text-center py-4">
              <CardTitle className="text-red-800 text-lg font-bold">
                {getLocalizedText('請選擇您的所求之事', 'Please Select Your Inquiry Type')}
              </CardTitle>
              <p className="text-red-700 text-sm mt-1">
                {getLocalizedText('選擇最符合您當前關注的問題', 'Choose the issue you are most concerned about')}
              </p>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {inquiryTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleInquirySelect(type.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedInquiry === type.id
                        ? 'border-red-400 bg-red-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    } ${type.color}`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <type.icon className="w-6 h-6" />
                      <span className="font-medium text-sm">
                        {getLocalizedText(type.name, type.nameEn)}
                      </span>
                      <span className="text-xs text-center leading-tight">
                        {getLocalizedText(type.description, type.descriptionEn)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 开始解读按钮 */}
          {selectedInquiry && (
            <div className="text-center mb-6">
              <Button
                onClick={startAIInterpretation}
                disabled={isLoading}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-yellow-100 px-8 py-3 text-lg font-semibold shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-100"></div>
                    <span>{getLocalizedText('AI解讀中...', 'AI Interpreting...')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>{getLocalizedText('開始AI智慧解讀', 'Start AI Interpretation')}</span>
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* AI解读结果 */}
          {showResponse && (
            <Card className="border-2 border-green-400 bg-green-50 shadow-lg">
              <CardHeader className="bg-green-400 text-center py-4">
                <CardTitle className="text-green-800 text-lg font-bold">
                  {getLocalizedText('AI智慧解讀結果', 'AI Interpretation Result')}
                </CardTitle>
                <p className="text-green-700 text-sm mt-1">
                  {getLocalizedText('基於歷史典故與現代智慧的個性化指引', 'Personalized guidance based on historical wisdom and modern insights')}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <div className="text-green-900 leading-7 whitespace-pre-wrap">
                    {aiResponse || (
                      <div className="flex items-center space-x-2 text-green-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        <span>{getLocalizedText('正在為您生成個性化解讀...', 'Generating personalized interpretation...')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SmartLayout>
  );
}