'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Gift, CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react';

interface RedeemResult {
  success: boolean;
  message: string;
  data?: {
    code: string;
    credits: number;
    activity: {
      id: number;
      name: string;
      type: string;
    };
    grant: {
      id: number;
      credits: number;
      grantedAt: string;
    };
    user: {
      email: string;
      username?: string;
    };
  };
  error?: string;
  details?: string;
  usedBy?: string;
  usedAt?: string;
  expiredAt?: string;
  previousGrant?: {
    credits: number;
    grantedAt: string;
  };
  timestamp: string;
}

export default function PromoCodeRedeemer() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);

  const handleRedeem = async () => {
    if (!code.trim()) {
      setResult({
        success: false,
        message: '请输入兑换码',
        error: '输入错误',
        details: '兑换码不能为空',
        timestamp: new Date().toISOString()
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/redeem-promo-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code.trim() }),
      });

      const data = await response.json();
      setResult(data);

      // 如果成功，清空输入框
      if (data.success) {
        setCode('');
      }

    } catch (error) {
      setResult({
        success: false,
        message: '网络错误',
        error: '请求失败',
        details: error instanceof Error ? error.message : '网络请求失败，请稍后重试',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleRedeem();
    }
  };

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-blue-600" />
          兑换码
        </CardTitle>
        <CardDescription>
          输入兑换码获得免费AI分析次数
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 输入区域 */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="请输入兑换码..."
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="flex-1 font-mono"
            />
            <Button 
              onClick={handleRedeem}
              disabled={isLoading || !code.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '兑换'
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            兑换码通常为8位字母数字组合，不区分大小写
          </p>
        </div>

        {/* 结果显示 */}
        {result && (
          <div className="space-y-3">
            {result.success ? (
              <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  <div className="space-y-3">
                    <div className="font-medium">{result.message}</div>
                    {result.data && (
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span>兑换码:</span>
                          <div className="flex items-center gap-1">
                            <code className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-300">
                              {result.data.code}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyCode(result.data!.code)}
                              className="h-6 w-6 p-0 hover:bg-green-200 dark:hover:bg-green-800"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>获得次数:</span>
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            +{result.data.credits} 次
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>活动:</span>
                          <span className="text-xs">{result.data.activity.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>兑换时间:</span>
                          <span className="text-xs">{formatDate(result.data.grant.grantedAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  <div className="space-y-3">
                    <div className="font-medium">{result.message}</div>
                    {result.details && (
                      <div className="text-sm">{result.details}</div>
                    )}
                    
                    {/* 已使用的详细信息 */}
                    {result.usedBy && result.usedAt && (
                      <div className="text-xs space-y-1 mt-2 p-3 bg-red-100 dark:bg-red-900 rounded">
                        <div>使用者: {result.usedBy.replace(/(.{2}).*(@.*)/, '$1***$2')}</div>
                        <div>使用时间: {formatDate(result.usedAt)}</div>
                      </div>
                    )}

                    {/* 过期信息 */}
                    {result.expiredAt && (
                      <div className="text-xs mt-2 p-3 bg-red-100 dark:bg-red-900 rounded">
                        过期时间: {formatDate(result.expiredAt)}
                      </div>
                    )}

                    {/* 之前兑换记录 */}
                    {result.previousGrant && (
                      <div className="text-xs space-y-1 mt-2 p-3 bg-red-100 dark:bg-red-900 rounded">
                        <div>之前兑换: {result.previousGrant.credits} 次</div>
                        <div>兑换时间: {formatDate(result.previousGrant.grantedAt)}</div>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* 使用说明 */}
        <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium">使用说明</h4>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <li>• 每个兑换码只能使用一次</li>
            <li>• 每个活动每人限兑换一次</li>
            <li>• 兑换码有效期内使用有效</li>
            <li>• 兑换成功后次数立即到账</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 