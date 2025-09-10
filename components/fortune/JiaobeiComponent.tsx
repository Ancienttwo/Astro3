'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  RotateCcw, 
  Calendar, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Sparkles,
  Coins,
  Trophy,
  Gift
} from 'lucide-react';
import { useWeb3User } from '@/hooks/useWeb3User';

// 筊杯结果类型 - 更新为与API一致的格式
type JiaobeiResult = '正正' | '反反' | '正反';

// 筊杯阶段状态
type JiaobeiStage = 'idle' | 'throwing' | 'result' | 'completed' | 'rejected';

// 筊杯历史记录
interface JiaobeiRecord {
  result: JiaobeiResult;
  timestamp: Date;
  count: number;
}

// NFT飞轮游戏状态
interface GameState {
  consecutiveSuccesses: number;
  gameState: 'in_progress' | 'success' | 'failed';
  pointsEarned?: number;
  canMintNFT?: boolean;
  completedTasks?: string[];
}

// 组件props接口
interface JiaobeiComponentProps {
  slip: any; // 待确认的签文
  drawId?: string; // 从NFT flywheel API获得的抽签ID
  isWeb3Mode?: boolean; // 是否使用Web3 NFT飞轮模式
  onConfirmed: (slip: any, gameData?: GameState) => void; // 确认签文回调
  onRejected: () => void; // 拒绝回调 
  onRedraw: () => void; // 重新抽签回调
  currentLanguage?: string;
}

const JiaobeiComponent: React.FC<JiaobeiComponentProps> = ({
  slip,
  drawId,
  isWeb3Mode = false,
  onConfirmed,
  onRejected,
  onRedraw,
  currentLanguage = 'zh-TW'
}) => {
  // Web3用户状态
  const { user: web3User, isConnected: isWeb3Connected } = useWeb3User();
  
  // 状态管理
  const [stage, setStage] = useState<JiaobeiStage>('idle');
  const [confirmCount, setConfirmCount] = useState(0); // 连续"正反"的次数
  const [history, setHistory] = useState<JiaobeiRecord[]>([]);
  const [currentResult, setCurrentResult] = useState<JiaobeiResult | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(false);

  // 筊杯随机生成逻辑
  const generateJiaobeiResult = (): JiaobeiResult => {
    const random = Math.random();
    // 设置概率：正反 (50%), 正正 (25%), 反反 (25%)
    if (random < 0.5) return '正反';
    if (random < 0.75) return '正正';
    return '反反';
  };

  // 执行筊杯
  const throwJiaobei = async () => {
    if (stage === 'throwing' || loading) return;
    
    setIsAnimating(true);
    setStage('throwing');
    setLoading(true);
    
    try {
      // 模拟筊杯动画时间
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let result: JiaobeiResult;
      let apiResponse: any = null;
      
      if (isWeb3Mode && drawId && isWeb3Connected && web3User) {
        // Web3 NFT飞轮模式：调用API
        result = generateJiaobeiResult();
        
        const response = await fetch('/api/guandi/jiaobei', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Web3-User': btoa(encodeURIComponent(JSON.stringify(web3User)))
          },
          body: JSON.stringify({
            drawId,
            outcome: result
          })
        });
        
        if (response.ok) {
          apiResponse = await response.json();
          if (apiResponse.success) {
            setGameState({
              consecutiveSuccesses: apiResponse.data.consecutiveSuccesses,
              gameState: apiResponse.data.gameState,
              pointsEarned: apiResponse.data.pointsEarned,
              canMintNFT: apiResponse.data.canMintNFT,
              completedTasks: apiResponse.data.completedTasks
            });
          }
        } else {
          console.warn('Jiaobei API调用失败，使用传统模式');
        }
      } else {
        // 传统模式：纯客户端逻辑
        result = generateJiaobeiResult();
      }
      
      setCurrentResult(result);
      setIsAnimating(false);
      setStage('result');
      
      // 记录历史
      const record: JiaobeiRecord = {
        result,
        timestamp: new Date(),
        count: result === '正反' ? confirmCount + 1 : confirmCount
      };
      setHistory(prev => [...prev, record]);
      
      // 处理不同结果
      handleJiaobeiResult(result, apiResponse);
      
    } catch (error) {
      console.error('筊杯投掷失败:', error);
      setIsAnimating(false);
      setLoading(false);
      setStage('idle');
      alert(currentLanguage === 'en-US' ? 'Failed to throw Jiaobei, please try again' : 
            currentLanguage === 'zh-CN' ? '筊杯投掷失败，请重试' : '筊杯投掷失敗，請重試');
    } finally {
      setLoading(false);
    }
  };

  // 处理筊杯结果
  const handleJiaobeiResult = (result: JiaobeiResult, apiResponse?: any) => {
    // 如果有API响应，使用API的游戏状态
    if (apiResponse?.success && gameState) {
      switch (gameState.gameState) {
        case 'failed':
          // 失败 - 拒绝
          setStage('rejected');
          setTimeout(() => onRejected(), 3000);
          break;
          
        case 'success':
          // 成功 - 完成
          setStage('completed');
          setTimeout(() => onConfirmed(slip, gameState), 2000);
          break;
          
        case 'in_progress':
          // 继续游戏
          setConfirmCount(gameState.consecutiveSuccesses);
          if (result === '正正') {
            // 笑筊 - 重新开始但不退出
            setTimeout(() => setStage('idle'), 2000);
          } else {
            // 继续下一次
            setTimeout(() => setStage('idle'), 2000);
          }
          break;
      }
      return;
    }
    
    // 传统模式逻辑
    switch (result) {
      case '反反':
        // 阴筊 - 拒绝
        setStage('rejected');
        setTimeout(() => onRejected(), 3000);
        break;
        
      case '正正':
        // 笑筊 - 重新抽签
        setTimeout(() => {
          setStage('idle');
          onRedraw();
        }, 3000);
        break;
        
      case '正反':
        // 胜筊 - 计数
        const newCount = confirmCount + 1;
        setConfirmCount(newCount);
        
        if (newCount >= 3) {
          // 三次确认完成
          setStage('completed');
          setTimeout(() => onConfirmed(slip), 2000);
        } else {
          // 继续下一次
          setTimeout(() => setStage('idle'), 2000);
        }
        break;
    }
  };

  // 重置状态
  const resetJiaobei = () => {
    setStage('idle');
    setConfirmCount(0);
    setHistory([]);
    setCurrentResult(null);
    setIsAnimating(false);
  };

  // 获取结果显示文本
  const getResultText = (result: JiaobeiResult) => {
    const texts = {
      'zh-TW': {
        '正正': '笑筊 - 重新抽籤',
        '反反': '陰筊 - 明天再來', 
        '正反': '聖筊 - 神明同意'
      },
      'zh-CN': {
        '正正': '笑筊 - 重新抽签',
        '反反': '阴筊 - 明天再来',
        '正反': '圣筊 - 神明同意'
      },
      'en-US': {
        '正正': 'Laughing Blocks - Redraw',
        '反反': 'Negative Blocks - Try Tomorrow',
        '正反': 'Holy Blocks - Divine Approval'
      }
    };
    return texts[currentLanguage as keyof typeof texts]?.[result] || texts['zh-TW'][result];
  };

  // 获取阶段提示文本
  const getStageText = () => {
    const texts = {
      'zh-TW': {
        idle: '請虔誠擲筊，需連續三次聖筊才能確認此籤',
        throwing: '筊杯擲出中...',
        result: '筊杯結果',
        completed: '三次聖筊！神明已確認此籤',
        rejected: '神明不許，請明天再來'
      },
      'zh-CN': {
        idle: '请虔诚掷筊，需连续三次圣筊才能确认此签',
        throwing: '筊杯掷出中...',
        result: '筊杯结果',
        completed: '三次圣筊！神明已确认此签',
        rejected: '神明不许，请明天再来'
      },
      'en-US': {
        idle: 'Please throw the divination blocks devoutly. Three consecutive holy blocks needed to confirm this slip.',
        throwing: 'Throwing divination blocks...',
        result: 'Divination Result',
        completed: 'Three Holy Blocks! The deity has confirmed this slip',
        rejected: 'The deity refuses. Please come back tomorrow'
      }
    };
    return texts[currentLanguage as keyof typeof texts]?.[stage] || texts['zh-TW'][stage];
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 筊杯确认卡片 */}
      <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-center py-6">
          <CardTitle className="text-red-800 text-xl md:text-2xl font-bold flex items-center justify-center space-x-2">
            <Sparkles className="w-6 h-6" />
            <span>
              {currentLanguage === 'en-US' ? 'Divine Confirmation with Jiaobei' :
               currentLanguage === 'zh-CN' ? '筊杯确认' : '筊杯確認'}
            </span>
            <Sparkles className="w-6 h-6" />
          </CardTitle>
          <p className="text-red-700 text-sm mt-2">
            {getStageText()}
          </p>
        </CardHeader>
        
        <CardContent className="p-6">
          {/* 签文预览 */}
          <div className="bg-white p-4 rounded-lg border border-red-200 mb-6">
            <div className="text-center">
              <Badge variant="outline" className="border-red-400 text-red-600 mb-2">
                第 {slip.slip_number} 籤
              </Badge>
              <h3 className="text-lg font-bold text-red-800 mb-2">{slip.title}</h3>
              <p className="text-red-700 text-sm">
                {currentLanguage === 'en-US' ? 'Awaiting divine confirmation...' :
                 currentLanguage === 'zh-CN' ? '等待神明确认...' : '等待神明確認...'}
              </p>
            </div>
          </div>

          {/* 进度指示器 */}
          <div className="flex justify-center items-center space-x-4 mb-6">
            {[1, 2, 3].map((num) => (
              <div key={num} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${confirmCount >= num ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {confirmCount >= num ? '✓' : num}
                </div>
                <span className="text-xs text-gray-600 mt-1">
                  {currentLanguage === 'en-US' ? `${num}${num === 1 ? 'st' : num === 2 ? 'nd' : 'rd'}` : 
                   `第${num}次`}
                </span>
              </div>
            ))}
          </div>

          {/* 筊杯图片和操作区 */}
          <div className="text-center">
            <div 
              className={`inline-block cursor-pointer transition-transform duration-300 ${
                isAnimating ? 'animate-bounce scale-110' : 'hover:scale-105'
              } ${stage === 'throwing' ? 'cursor-not-allowed opacity-75' : ''}`}
              onClick={stage === 'idle' ? throwJiaobei : undefined}
            >
              <img 
                src="/jiaobei.jpg" 
                alt="筊杯"
                className="w-24 h-24 md:w-32 md:h-32 mx-auto object-contain rounded-lg shadow-md"
              />
            </div>
            
            {/* 操作按钮 */}
            <div className="mt-4">
              {stage === 'idle' && (
                <Button
                  onClick={throwJiaobei}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                  disabled={stage === 'throwing'}
                >
                  {currentLanguage === 'en-US' ? 'Throw Jiaobei' :
                   currentLanguage === 'zh-CN' ? '掷筊杯' : '擲筊杯'}
                </Button>
              )}
              
              {stage === 'throwing' && (
                <div className="flex items-center justify-center space-x-2 text-red-700">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-700"></div>
                  <span>{getStageText()}</span>
                </div>
              )}
            </div>
          </div>

          {/* 结果显示 */}
          {currentResult && stage === 'result' && (
            <div className="mt-6 p-4 bg-white rounded-lg border-2 border-dashed border-red-300">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {currentResult === '正正' && <span className="text-blue-600">正正</span>}
                  {currentResult === '反反' && <span className="text-red-600">反反</span>}
                  {currentResult === '正反' && <span className="text-green-600">正反</span>}
                </div>
                <p className="text-lg font-medium text-gray-800 mb-2">
                  {getResultText(currentResult)}
                </p>
                
                {/* Web3模式显示进度 */}
                {isWeb3Mode && gameState && (
                  <div className="mt-4 space-y-2">
                    {currentResult === '正反' && gameState.gameState === 'in_progress' && (
                      <p className="text-sm text-green-600">
                        已獲得 {gameState.consecutiveSuccesses} 次聖筊，還需 {3 - gameState.consecutiveSuccesses} 次
                      </p>
                    )}
                    
                    {gameState.pointsEarned && gameState.pointsEarned > 0 && (
                      <div className="flex items-center justify-center space-x-2 text-yellow-600">
                        <Coins className="w-4 h-4" />
                        <span className="font-medium">+{gameState.pointsEarned} 積分</span>
                      </div>
                    )}
                    
                    {gameState.canMintNFT && (
                      <div className="flex items-center justify-center space-x-2 text-purple-600">
                        <Gift className="w-4 h-4" />
                        <span className="font-medium">可鑄造NFT！</span>
                      </div>
                    )}
                    
                    {gameState.completedTasks && gameState.completedTasks.length > 0 && (
                      <div className="flex items-center justify-center space-x-2 text-blue-600">
                        <Trophy className="w-4 h-4" />
                        <span className="text-sm">完成 {gameState.completedTasks.length} 個任務</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* 传统模式显示进度 */}
                {!isWeb3Mode && currentResult === '正反' && confirmCount < 3 && (
                  <p className="text-sm text-green-600">
                    已獲得 {confirmCount} 次聖筊，還需 {3 - confirmCount} 次
                  </p>
                )}
              </div>
            </div>
          )}

          {/* 完成或拒绝状态 */}
          {stage === 'completed' && (
            <div className="mt-6 p-6 bg-green-50 rounded-lg border-2 border-green-300 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-green-800 mb-2">
                {getStageText()}
              </h3>
              <p className="text-green-700">
                {currentLanguage === 'en-US' ? 'Redirecting to fortune slip...' :
                 currentLanguage === 'zh-CN' ? '正在跳转到签文...' : '正在跳轉到籤文...'}
              </p>
            </div>
          )}

          {stage === 'rejected' && (
            <div className="mt-6 p-6 bg-red-50 rounded-lg border-2 border-red-300 text-center">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-red-800 mb-2">
                {getStageText()}
              </h3>
              <div className="flex items-center justify-center space-x-2 text-red-700">
                <Calendar className="w-4 h-4" />
                <span>
                  {currentLanguage === 'en-US' ? 'Please return tomorrow for another fortune' :
                   currentLanguage === 'zh-CN' ? '请明天重新求签' : '請明天重新求籤'}
                </span>
              </div>
            </div>
          )}

          {/* 历史记录 */}
          {history.length > 0 && (
            <div className="mt-6">
              <Separator className="mb-4" />
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                {currentLanguage === 'en-US' ? 'Jiaobei History' :
                 currentLanguage === 'zh-CN' ? '筊杯记录' : '筊杯記錄'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {history.map((record, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className={`
                      ${record.result === '正反' ? 'border-green-400 text-green-600' :
                        record.result === '正正' ? 'border-blue-400 text-blue-600' :
                        'border-red-400 text-red-600'}
                    `}
                  >
                    第{index + 1}次: {record.result}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JiaobeiComponent;