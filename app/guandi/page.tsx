'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Flame, 
  Sparkles, 
  Shuffle,
  Search,
  BookOpen,
  Star,
  Crown,
  Menu,
  ArrowLeft
} from 'lucide-react';
import Logo from '@/components/Logo';
import Link from 'next/link';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { useTranslations, useLanguageStore } from '@/lib/i18n/language-manager';
import GuandiFortuneSlipLayout from '@/components/fortune/GuandiFortuneSlipLayout';
import JiaobeiComponent from '@/components/fortune/JiaobeiComponent';
import { useWeb3User } from '@/hooks/useWeb3User';

interface FortuneSlip {
  id: string;
  slip_number: number;
  title: string;
  content: string;
  basic_interpretation: string;
  categories: string[];
  fortune_level: 'excellent' | 'good' | 'average' | 'caution' | 'warning';
  historical_context?: string;
  symbolism?: string;
  database_story?: string;
  database_symbolism?: string;
  complete_data?: {
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
    language: string;
    ai_prompt_materials?: {
      database_story: string | null;
      database_symbolism: string | null;
      docx_story: string;
      modern_examples: string;
      classical_wisdom: string;
      fortune_predictions: {
        功名: string;
        六甲: string;
        求财: string;
        婚姻: string;
        农牧: string;
        失物: string;
        生意: string;
        丁口: string;
        出行: string;
        疾病: string;
        官司: string;
        时运: string;
      };
    };
  };
}

const GuandiOracle: React.FC = () => {
  const [manualSlipNumber, setManualSlipNumber] = useState('');
  const [currentSlip, setCurrentSlip] = useState<FortuneSlip | null>(null);
  const [pendingSlip, setPendingSlip] = useState<FortuneSlip | null>(null); // 待确认的签文
  const [pendingDrawId, setPendingDrawId] = useState<string | null>(null); // NFT flywheel 抽签ID
  const [showJiaobei, setShowJiaobei] = useState(false); // 是否显示筊杯确认
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('random');
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [dailyDrawStatus, setDailyDrawStatus] = useState<any>(null);

  // 使用新的语言系统和Web3状态
  const { t } = useTranslations();
  const { currentLanguage } = useLanguageStore();
  const { user: web3User, isConnected: isWeb3Connected } = useWeb3User();
  
  // 调试语言状态
  useEffect(() => {
    console.log('🔍 当前语言状态变化:', currentLanguage);
    console.log('🔍 翻译对象:', t);
  }, [currentLanguage, t]);

  // 检查Web3用户的每日抽签状态
  useEffect(() => {
    if (isWeb3Connected && web3User?.walletAddress) {
      checkDailyDrawStatus();
    }
  }, [isWeb3Connected, web3User]);

  // 检查每日抽签状态
  const checkDailyDrawStatus = async () => {
    if (!isWeb3Connected || !web3User?.walletAddress) return;
    
    try {
      const response = await fetch(`/api/guandi/draw?wallet_address=${web3User.walletAddress}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDailyDrawStatus(data.data);
        }
      }
    } catch (error) {
      console.error('检查每日抽签状态失败:', error);
    }
  };

  // 关帝庙的颜色主题
  const themeColors = {
    primary: '#8B0000', // 深红色
    secondary: '#FFD700', // 金色
    accent: '#DC143C' // 猩红色
  };

  // 处理语言切换（会自动重新获取签文）
  const handleLanguageChange = async (newLanguage: string) => {
    console.log('🌐 语言切换触发:', newLanguage); // 调试日志
    console.log('🔄 当前语言状态:', currentLanguage); // 调试日志
    console.log('📋 当前签文状态:', currentSlip ? `第${currentSlip.slip_number}签` : '无签文'); // 调试日志
    
    if (currentSlip) {
      console.log('🔄 重新获取签文...'); // 调试日志
      // 重新获取当前签文的新语言版本
      await refetchCurrentSlip(newLanguage);
    } else {
      console.log('ℹ️ 没有当前签文，跳过重新获取'); // 调试日志
    }
  };

  // 重新获取当前签文
  const refetchCurrentSlip = async (language?: string) => {
    if (!currentSlip) return;
    
    try {
      setLoading(true);
      const lang = language || currentLanguage;
      console.log('🔄 重新获取签文，语言:', lang, '签号:', currentSlip.slip_number); // 调试日志
      const response = await fetch(`/api/fortune/slips/guandi/${currentSlip.slip_number}?language=${lang}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📄 API响应数据:', data); // 调试日志
        if (data.success) {
          setCurrentSlip(data.data);
        }
      }
    } catch (error) {
      console.error('重新获取签文失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 随机摇签
  const handleRandomDraw = async () => {
    setIsShaking(true);
    setLoading(true);

    try {
      // 模拟摇签动画
      await new Promise(resolve => setTimeout(resolve, 1500));

      let drawData, slipData;

      if (isWeb3Connected && web3User?.walletAddress) {
        // 检查每日限制
        if (dailyDrawStatus && !dailyDrawStatus.canDrawToday) {
          alert(
            currentLanguage === 'en-US' ? 'You have already drawn today. Please come back tomorrow.' :
            currentLanguage === 'zh-CN' ? '您今天已经抽过签了，请明天再来。' :
            '您今天已經抽過籤了，請明天再來。'
          );
          return;
        }

        // Web3 NFT flywheel模式：使用新的抽签API
        const response = await fetch('/api/guandi/draw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Web3-User': btoa(encodeURIComponent(JSON.stringify(web3User)))
          },
          body: JSON.stringify({ action: 'start_draw' })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            drawData = data.data;
            slipData = drawData.fortuneSlip;
            setPendingDrawId(drawData.drawId);
          } else {
            alert(data.error || (
              currentLanguage === 'en-US' ? 'Failed to draw fortune slip, please try again' :
              currentLanguage === 'zh-CN' ? '抽签失败，请重试' : '抽籤失敗，請重試'
            ));
            return;
          }
        } else {
          alert(
            currentLanguage === 'en-US' ? 'Failed to draw fortune slip, please try again' :
            currentLanguage === 'zh-CN' ? '抽签失败，请重试' : '抽籤失敗，請重試'
          );
          return;
        }
      } else {
        // 传统模式：使用原有的随机API
        const response = await fetch('/api/fortune/random', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            temple_code: 'guandi',
            language: currentLanguage
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // 获取完整签文信息
            const slipResponse = await fetch(`/api/fortune/slips/guandi/${data.data.slip_number}?language=${currentLanguage}`);
            if (slipResponse.ok) {
              const slipResponseData = await slipResponse.json();
              if (slipResponseData.success) {
                slipData = slipResponseData.data;
              } else {
                alert('獲取籤文失敗，請重試');
                return;
              }
            }
          } else {
            alert(data.error || '搖籤失敗，請重試');
            return;
          }
        } else {
          alert('搖籤失敗，請重試');
          return;
        }
      }

      // 设置待确认的签文，显示筊杯确认界面
      setPendingSlip(slipData);
      setShowJiaobei(true);
      
      // 更新每日抽签状态
      if (isWeb3Connected && web3User?.walletAddress) {
        checkDailyDrawStatus();
      }

    } catch (error) {
      console.error('摇签错误:', error);
      alert(
        currentLanguage === 'en-US' ? 'Failed to draw fortune, please try again' :
        currentLanguage === 'zh-CN' ? '摇签失败，请重试' : '搖籤失敗，請重試'
      );
    } finally {
      setIsShaking(false);
      setLoading(false);
    }
  };

  // 手动查询签文
  const handleManualQuery = async () => {
    const slipNum = parseInt(manualSlipNumber);
    if (!slipNum || slipNum < 1 || slipNum > 100) {
      alert('請輸入1-100之間的籤號');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/fortune/slips/guandi/${slipNum}?language=${currentLanguage}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // 手动查询也需要筊杯确认
          setPendingSlip(data.data);
          setShowJiaobei(true);
          setManualSlipNumber(''); // 清空输入
        } else {
          alert(data.error || '未找到該籤文');
        }
      } else {
        alert('未找到該籤文');
      }
    } catch (error) {
      console.error('查询错误:', error);
      alert('查詢失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 筊杯确认成功回调
  const handleJiaobeiConfirmed = (confirmedSlip: FortuneSlip, gameData?: any) => {
    setCurrentSlip(confirmedSlip);
    setShowJiaobei(false);
    setPendingSlip(null);
    setPendingDrawId(null);
    
    // 处理Web3奖励
    if (gameData && isWeb3Connected) {
      // 显示获得的奖励
      if (gameData.pointsEarned > 0) {
        alert(
          currentLanguage === 'en-US' ? `Congratulations! You earned ${gameData.pointsEarned} points!` :
          currentLanguage === 'zh-CN' ? `恭喜！获得 ${gameData.pointsEarned} 积分！` :
          `恭喜！獲得 ${gameData.pointsEarned} 積分！`
        );
      }
      
      // 更新每日抽签状态
      checkDailyDrawStatus();
    }
  };

  // 筊杯拒绝回调
  const handleJiaobeiRejected = () => {
    setShowJiaobei(false);
    setPendingSlip(null);
    setPendingDrawId(null);
    
    // 更新每日抽签状态
    if (isWeb3Connected && web3User?.walletAddress) {
      checkDailyDrawStatus();
    }
    
    // 显示明天再来的提示
    alert(
      currentLanguage === 'en-US' ? 'The deity has declined. Please come back tomorrow.' :
      currentLanguage === 'zh-CN' ? '神明不许，请明天再来求签。' :
      '神明不許，請明天再來求籤。'
    );
  };

  // 筊杯要求重新抽签回调
  const handleJiaobeiRedraw = () => {
    setShowJiaobei(false);
    setPendingSlip(null);
    setPendingDrawId(null);
    
    // 显示重新抽签的提示
    alert(
      currentLanguage === 'en-US' ? 'The deity suggests drawing a new fortune slip.' :
      currentLanguage === 'zh-CN' ? '神明示意重新抽签。' :
      '神明示意重新抽籤。'
    );
  };

  // 获取吉凶等级的显示样式
  const getFortuneStyle = (level: string) => {
    switch (level) {
      case 'excellent':
        return { color: '#22C55E', icon: '大吉', bg: 'bg-green-50' };
      case 'good':
        return { color: '#3B82F6', icon: '中吉', bg: 'bg-blue-50' };
      case 'average':
        return { color: '#F59E0B', icon: '平', bg: 'bg-yellow-50' };
      case 'caution':
        return { color: '#EF4444', icon: '小凶', bg: 'bg-red-50' };
      case 'warning':
        return { color: '#DC2626', icon: '大凶', bg: 'bg-red-100' };
      default:
        return { color: '#6B7280', icon: '未知', bg: 'bg-gray-50' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-amber-800">
      {/* 顶部导航栏 - 使用Web2风格 */}
      <div className="bg-white px-4 py-1 flex items-center border-b border-gray-100 relative sticky top-0 z-50">
        {/* 左侧：Logo */}
        <Link
          href="/home"
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img 
            src="/logo_light.png" 
            alt="Logo" 
            className="w-6 h-6 object-contain"
          />
        </Link>
        
        {/* 中间：标题（绝对居中） */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-lg font-bold text-gray-900">{t.guandi.templeName}</h1>
        </div>
        
        {/* 右侧：语言选择和菜单 */}
        <div className="flex items-center space-x-2 ml-auto">
          {/* 语言选择器 */}
          <LanguageSelector 
            compact={true}
            align="right"
            onLanguageChange={handleLanguageChange}
          />
          
          <div className="relative">
            <button 
              onClick={() => setShowMainMenu(!showMainMenu)}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
            
            {/* 主菜单下拉 */}
            {showMainMenu && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-60 min-w-[160px]">
                <Link 
                  href="/home"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                  onClick={() => setShowMainMenu(false)}
                >
                  <span className="text-sm text-gray-700">🏠 首頁</span>
                </Link>
                <Link 
                  href="/create-chart"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                  onClick={() => setShowMainMenu(false)}
                >
                  <span className="text-sm text-gray-700">✨ 算命占卜</span>
                </Link>
                <Link 
                  href="/wiki"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 border-b border-gray-100"
                  onClick={() => setShowMainMenu(false)}
                >
                  <span className="text-sm text-gray-700">📖 知識百科</span>
                </Link>
                <Link 
                  href="/membership"
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center space-x-2 rounded-b-lg"
                  onClick={() => setShowMainMenu(false)}
                >
                  <span className="text-sm text-gray-700">👥 會員中心</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 主要内容区 - 红色简洁设计 */}
      <div className="bg-gradient-to-br from-red-800 to-red-900">
        <div className="text-center py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.guandi.templeName}
            </h1>
            
            <p className="text-yellow-300 text-lg md:text-xl mb-6">
              {currentLanguage === 'en-US' 
                ? 'Lord Guandi Protects · Divine Guidance · Life Direction'
                : currentLanguage === 'zh-TW'
                ? '關帝護佑 · 靈驗如神 · 指點迷津'
                : '关帝护佑 · 灵验如神 · 指点迷津'
              }
            </p>
            
            <div className="flex flex-row items-center justify-center space-x-3 md:space-x-6 text-red-200 text-xs md:text-base">
              <div className="flex items-center">
                <Flame className="w-4 h-4 mr-1 text-yellow-400" />
                <span>
                  {currentLanguage === 'en-US' ? 'Loyalty & Courage' : 
                   currentLanguage === 'zh-TW' ? '忠義仁勇' : '忠义仁勇'}
                </span>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                <span>
                  {currentLanguage === 'en-US' ? 'God of War & Wealth' : 
                   currentLanguage === 'zh-TW' ? '武財神' : '武财神'}
                </span>
              </div>
              <div className="flex items-center">
                <Sparkles className="w-4 h-4 mr-1 text-yellow-400" />
                <span>
                  {currentLanguage === 'en-US' ? 'Dharma Protector' : 
                   currentLanguage === 'zh-TW' ? '護法神' : '护法神'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Web3用户状态显示 */}
        {isWeb3Connected && web3User?.walletAddress && dailyDrawStatus && (
          <div className="max-w-4xl mx-auto mb-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-300">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {currentLanguage === 'en-US' ? 'Web3 Fortune Drawer' :
                         currentLanguage === 'zh-CN' ? 'Web3求签者' : 'Web3求籤者'}
                      </span>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      {`${web3User.walletAddress.slice(0, 6)}...${web3User.walletAddress.slice(-4)}`}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-4 h-4 text-yellow-600" />
                      <span className="text-gray-700">
                        {dailyDrawStatus.userStats?.chainPointsBalance || 0} 積分
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span className="text-gray-700">
                        連續 {dailyDrawStatus.userStats?.consecutiveStreak || 0} 天
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span className="text-gray-700">
                        抽籤 {dailyDrawStatus.userStats?.guangdiDrawsCount || 0} 次
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 今日状态提示 */}
                <div className="mt-3 pt-3 border-t border-yellow-200">
                  {dailyDrawStatus.canDrawToday ? (
                    <div className="flex items-center space-x-2 text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        {currentLanguage === 'en-US' ? 'Ready to draw today\'s fortune!' :
                         currentLanguage === 'zh-CN' ? '今日可以求签！' : '今日可以求籤！'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-700">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {currentLanguage === 'en-US' ? 'Today\'s fortune completed. Come back tomorrow!' :
                         currentLanguage === 'zh-CN' ? '今日求签已完成，明天再来！' : '今日求籤已完成，明天再來！'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="random" className="flex items-center space-x-2">
              <Shuffle className="w-4 h-4" />
              <span>{t.fortune.drawFortune}</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>{t.fortune.manualQuery}</span>
            </TabsTrigger>
          </TabsList>

          {/* 虔诚摇签模式 - 红色简洁设计 */}
          <TabsContent value="random" className="space-y-6">
            <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
              <CardHeader className="bg-yellow-400 text-center py-4">
                <CardTitle className="text-red-800 text-lg md:text-xl font-bold">
                  {t.guandi.devotionalMeditation}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="bg-white p-6 rounded-lg border border-yellow-300">
                  <div className="text-center space-y-4">
                    <div className="text-red-900 space-y-3 text-base md:text-lg">
                      <p className="font-semibold">弟子（姓名）誠心祈求關聖帝君</p>
                      <p>今年（年齡）歲，懇請帝君指點</p>
                      <p>所求之事：（心中默念您的問題）</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-red-200">
                      {/* 摇签筒按钮 - 居中显示 */}
                      <div 
                        className={`inline-block cursor-pointer transition-transform ${
                          isShaking ? 'animate-bounce' : 'hover:scale-105'
                        } ${loading ? 'cursor-not-allowed opacity-75' : ''}`}
                        onClick={loading ? undefined : handleRandomDraw}
                      >
                        <img 
                          src="/0.webp" 
                          alt="摇签筒" 
                          className="w-20 h-20 md:w-24 md:h-24 mx-auto object-contain"
                        />
                      </div>
                      
                      <p className="text-red-700 text-sm font-medium mt-3">
                        {loading ? (
                          <span className="flex items-center justify-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                            <span>{isShaking ? '搖籤中...' : '查詢中...'}</span>
                          </span>
                        ) : (
                          '點擊搖籤'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </TabsContent>

          {/* 手动查签模式 - 红色简洁设计 */}
          <TabsContent value="manual" className="space-y-6">
            <Card className="border-2 border-yellow-400 bg-yellow-50 shadow-lg">
              <CardHeader className="bg-yellow-400 text-center py-4">
                <CardTitle className="text-red-800 text-lg md:text-xl font-bold">
                  {t.fortune.manualQuery}
                </CardTitle>
                <p className="text-red-700 text-xs md:text-sm mt-1">
                  {currentLanguage === 'en-US' 
                    ? 'If you have already drawn a fortune slip offline, please enter the slip number to view detailed interpretation'
                    : '如果您已在線下求得籤文，請輸入籤號查看詳細解籤'
                  }
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-white p-6 rounded-lg border border-red-200">
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <label htmlFor="slipNumber" className="block text-sm font-medium text-red-800 mb-2">
                        {currentLanguage === 'en-US' ? 'Slip Number (1-100)' : '籤號 (1-100)'}
                      </label>
                      <Input
                        id="slipNumber" 
                        type="number"
                        min="1"
                        max="100"
                        placeholder={currentLanguage === 'en-US' ? 'Enter slip number' : '請輸入籤號'}
                        value={manualSlipNumber}
                        onChange={(e) => setManualSlipNumber(e.target.value)}
                        className="border-red-200 focus:border-red-400"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleManualQuery}
                        disabled={loading}
                        className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-6"
                      >
                        {loading ? t.fortune.querying : t.fortune.query}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 筊杯确认界面 */}
        {showJiaobei && pendingSlip && (
          <div className="mt-8">
            <JiaobeiComponent
              slip={pendingSlip}
              drawId={pendingDrawId}
              isWeb3Mode={isWeb3Connected && !!web3User?.walletAddress}
              onConfirmed={handleJiaobeiConfirmed}
              onRejected={handleJiaobeiRejected}
              onRedraw={handleJiaobeiRedraw}
              currentLanguage={currentLanguage}
            />
          </div>
        )}

        {/* 签文显示 - 使用新的完整布局 */}
        {currentSlip && !showJiaobei && (
          <div className="mt-8">
            <GuandiFortuneSlipLayout 
              rawSlipData={currentSlip}
              fortuneSlip={{
                slip_number: currentSlip.slip_number,
                historical_reference: currentSlip.title || currentSlip.complete_data?.historical_reference || '关帝灵签',
                fortune_grade: currentSlip.complete_data?.fortune_grade || 
                              (currentSlip.fortune_level === 'excellent' ? '甲甲 大吉' : 
                               currentSlip.fortune_level === 'good' ? '甲乙 上吉' :
                               currentSlip.fortune_level === 'average' ? '乙丙 中平' :
                               currentSlip.fortune_level === 'caution' ? '丙丁 下吉' : '丁戊 下下'),
                poem_verses: currentSlip.content || currentSlip.complete_data?.poem_verses,
                classical_overview: currentSlip.historical_context || currentSlip.complete_data?.classical_overview || '',
                modern_explanation: currentSlip.basic_interpretation || currentSlip.complete_data?.modern_explanation,
                historical_story: currentSlip.symbolism || currentSlip.complete_data?.historical_story || '',
                fortune_predictions: currentSlip.complete_data?.fortune_predictions || {
                  功名: '功名运势有待查询',
                  六甲: '子嗣运势有待查询', 
                  求财: '财运有待查询',
                  婚姻: '姻缘运势有待查询',
                  农牧: '农牧运势有待查询',
                  失物: '失物寻找有待查询',
                  生意: '生意运势有待查询',
                  丁口: '人丁运势有待查询',
                  出行: '出行运势有待查询',
                  疾病: '健康运势有待查询',
                  官司: '诉讼运势有待查询',
                  时运: '时运有待查询'
                },
                language: currentLanguage
              }}
              onRequestAIInterpretation={() => {
                // 登录引导现在由组件内部处理
                console.log('AI解读请求');
              }}
            />
            
            {/* 重新摇签按钮 */}
            <div className="text-center mt-8">
              <Button
                onClick={() => {
                  setCurrentSlip(null);
                  setPendingSlip(null);
                  setShowJiaobei(false);
                }}
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-50 px-8 py-3 text-lg"
              >
                🎲 重新求籤
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuandiOracle;