'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Heart,
  TrendingUp,
  Zap,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
}

interface PersonalContext {
  currentSituation: string;
  duration: string;
  severity: 'low' | 'medium' | 'high';
}

interface AnalysisResult {
  severityLevel: number;
  mutualAidEligible: boolean;
  recommendedAidAmount: string;
  timeframe: string;
  analysis: {
    fortuneSlipWeight: number;
    baziWeight: number;
    ziweiWeight: number;
    contextWeight: number;
    confidenceScore: number;
  };
  supportRecommendations: Array<{
    type: 'financial' | 'emotional' | 'practical';
    description: string;
    amount?: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  validationRequired: boolean;
  estimatedValidationTime: string;
}

interface AdversityAnalyzerProps {
  walletAddress?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onRequestAid?: (amount: string) => void;
}

const severityColors = {
  1: 'bg-emerald-500',
  2: 'bg-emerald-400', 
  3: 'bg-green-400',
  4: 'bg-yellow-400',
  5: 'bg-yellow-500',
  6: 'bg-orange-400',
  7: 'bg-orange-500',
  8: 'bg-red-400',
  9: 'bg-red-500',
  10: 'bg-red-600'
};

const priorityStyles = {
  high: 'border-red-200 bg-red-50 text-red-800',
  medium: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  low: 'border-gray-200 bg-gray-50 text-gray-800'
};

export default function AdversityAnalyzer({
  walletAddress,
  onAnalysisComplete,
  onRequestAid
}: AdversityAnalyzerProps) {
  const [step, setStep] = useState<'input' | 'jiaobei' | 'analyzing' | 'results'>('input');
  const [fortuneSlipNumber, setFortuneSlipNumber] = useState<number>(0);
  const [birthData, setBirthData] = useState<BirthData>({
    year: 2000,
    month: 1,
    day: 1,
    hour: 12
  });
  const [personalContext, setPersonalContext] = useState<PersonalContext>({
    currentSituation: '',
    duration: '',
    severity: 'medium'
  });
  const [jiaobeiResult, setJiaobeiResult] = useState<boolean | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialSubmit = () => {
    if (!fortuneSlipNumber || !personalContext.currentSituation) {
      setError('请填写所有必填信息');
      return;
    }
    setError(null);
    setStep('jiaobei');
  };

  const handleJiaobeiConfirm = (confirmed: boolean) => {
    setJiaobeiResult(confirmed);
    if (confirmed) {
      performAnalysis();
    } else {
      setError('筊杯确认失败，请重新抽签');
      setStep('input');
    }
  };

  const performAnalysis = async () => {
    setStep('analyzing');
    setLoading(true);
    
    try {
      const response = await fetch('/api/mutual-aid/adversity-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          fortuneSlipNumber,
          birthData,
          jiaobeiConfirmed: jiaobeiResult,
          personalContext
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysisResult(data.prediction);
        setStep('results');
        onAnalysisComplete?.(data.prediction);
      } else {
        throw new Error(data.error?.message || '分析失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (level: number) => {
    return severityColors[level as keyof typeof severityColors] || 'bg-gray-400';
  };

  const getSeverityText = (level: number) => {
    if (level <= 2) return '非常顺利';
    if (level <= 4) return '基本平稳';
    if (level <= 6) return '轻微挑战';
    if (level <= 8) return '需要注意';
    return '需要支援';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Zap className="w-6 h-6 text-primary" />
            厄运预警分析
          </CardTitle>
          <p className="text-muted-foreground">
            基于传统智慧和AI技术的困难预测与互助评估
          </p>
        </CardHeader>
        
        <CardContent>
          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* 抽签结果输入 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">抽签信息</h3>
                  <div>
                    <Label htmlFor="fortune-slip">关帝签号 *</Label>
                    <Input
                      id="fortune-slip"
                      type="number"
                      min="1"
                      max="100"
                      value={fortuneSlipNumber || ''}
                      onChange={(e) => setFortuneSlipNumber(parseInt(e.target.value))}
                      placeholder="请输入抽到的签号（1-100）"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* 生辰八字输入 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">生辰八字</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="birth-year">出生年</Label>
                      <Input
                        id="birth-year"
                        type="number"
                        min="1900"
                        max="2024"
                        value={birthData.year}
                        onChange={(e) => setBirthData(prev => ({
                          ...prev,
                          year: parseInt(e.target.value)
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth-month">出生月</Label>
                      <Select
                        value={birthData.month.toString()}
                        onValueChange={(value) => setBirthData(prev => ({
                          ...prev,
                          month: parseInt(value)
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}月
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="birth-day">出生日</Label>
                      <Input
                        id="birth-day"
                        type="number"
                        min="1"
                        max="31"
                        value={birthData.day}
                        onChange={(e) => setBirthData(prev => ({
                          ...prev,
                          day: parseInt(e.target.value)
                        }))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="birth-hour">出生时辰</Label>
                      <Select
                        value={birthData.hour.toString()}
                        onValueChange={(value) => setBirthData(prev => ({
                          ...prev,
                          hour: parseInt(value)
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i}时
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 个人情况输入 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">当前情况 *</h3>
                  <div>
                    <Label htmlFor="situation">遇到的困难或挑战</Label>
                    <Textarea
                      id="situation"
                      value={personalContext.currentSituation}
                      onChange={(e) => setPersonalContext(prev => ({
                        ...prev,
                        currentSituation: e.target.value
                      }))}
                      placeholder="请详细描述您当前面临的困难..."
                      className="mt-1 min-h-20"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="duration">持续时间</Label>
                      <Select
                        value={personalContext.duration}
                        onValueChange={(value) => setPersonalContext(prev => ({
                          ...prev,
                          duration: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择时间" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="week">最近一周</SelectItem>
                          <SelectItem value="month">最近一个月</SelectItem>
                          <SelectItem value="3months">最近三个月</SelectItem>
                          <SelectItem value="longer">更长时间</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="severity">严重程度</Label>
                      <Select
                        value={personalContext.severity}
                        onValueChange={(value: 'low' | 'medium' | 'high') => 
                          setPersonalContext(prev => ({ ...prev, severity: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">轻微困难</SelectItem>
                          <SelectItem value="medium">中等困难</SelectItem>
                          <SelectItem value="high">严重困难</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleInitialSubmit}
                  className="w-full"
                  size="lg"
                >
                  开始AI分析
                </Button>
              </motion.div>
            )}

            {step === 'jiaobei' && (
              <motion.div
                key="jiaobei"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center space-y-6 py-8"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center">
                  <Heart className="w-10 h-10 text-primary" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">筊杯确认</h3>
                  <p className="text-muted-foreground">
                    请虔诚地投掷筊杯，确认您的困难情况
                  </p>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleJiaobeiConfirm(false)}
                  >
                    阴杯（未确认）
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => handleJiaobeiConfirm(true)}
                  >
                    圣杯（确认）
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'analyzing' && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6 py-12"
              >
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI智能分析中...</h3>
                  <p className="text-muted-foreground mb-4">
                    正在综合关帝签、八字、紫微等传统智慧进行分析
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={85} className="h-2" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'results' && analysisResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* 分析结果概览 */}
                <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                  <div className="mb-4">
                    <div className={cn(
                      "w-20 h-20 mx-auto rounded-full flex items-center justify-center text-white text-2xl font-bold",
                      getSeverityColor(analysisResult.severityLevel)
                    )}>
                      {analysisResult.severityLevel}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">
                    {getSeverityText(analysisResult.severityLevel)}
                  </h3>
                  
                  <p className="text-muted-foreground mb-4">
                    困难等级：{analysisResult.severityLevel}/10
                  </p>
                  
                  {analysisResult.mutualAidEligible && (
                    <Badge variant="secondary" className="mb-4">
                      符合互助条件
                    </Badge>
                  )}
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    预测时间窗口：{analysisResult.timeframe}
                  </div>
                </div>

                {/* 分析权重 */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">分析权重分布</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>关帝签文</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.analysis.fortuneSlipWeight * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm font-medium">
                          {(analysisResult.analysis.fortuneSlipWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>八字分析</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.analysis.baziWeight * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm font-medium">
                          {(analysisResult.analysis.baziWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>紫微斗数</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.analysis.ziweiWeight * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm font-medium">
                          {(analysisResult.analysis.ziweiWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>个人情况</span>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={analysisResult.analysis.contextWeight * 100} 
                          className="w-20 h-2" 
                        />
                        <span className="text-sm font-medium">
                          {(analysisResult.analysis.contextWeight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span>分析信心度</span>
                        <span className="font-medium">
                          {(analysisResult.analysis.confidenceScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 支持建议 */}
                {analysisResult.supportRecommendations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">支持建议</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analysisResult.supportRecommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={cn(
                            "p-4 rounded-lg border",
                            priorityStyles[rec.priority]
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 flex-shrink-0 mt-0.5">
                              {rec.type === 'financial' && <DollarSign className="w-5 h-5" />}
                              {rec.type === 'emotional' && <Heart className="w-5 h-5" />}
                              {rec.type === 'practical' && <Info className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {rec.type === 'financial' ? '经济支持' : 
                                   rec.type === 'emotional' ? '情感支持' : '实际帮助'}
                                </Badge>
                                <Badge 
                                  variant={rec.priority === 'high' ? 'destructive' : 
                                          rec.priority === 'medium' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {rec.priority === 'high' ? '高优先级' :
                                   rec.priority === 'medium' ? '中优先级' : '低优先级'}
                                </Badge>
                              </div>
                              <p className="text-sm">{rec.description}</p>
                              {rec.amount && (
                                <p className="text-xs font-medium mt-1">
                                  建议金额：{rec.amount} AZI
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* 申请互助按钮 */}
                {analysisResult.mutualAidEligible && (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-6">
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium">符合社区互助条件</span>
                        </div>
                        
                        <div className="text-2xl font-bold text-primary">
                          建议申请：{analysisResult.recommendedAidAmount} AZI
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          需要社区验证，预计等待时间：{analysisResult.estimatedValidationTime}
                        </p>
                        
                        <Button
                          size="lg"
                          className="w-full"
                          onClick={() => onRequestAid?.(analysisResult.recommendedAidAmount)}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          申请社区互助
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}