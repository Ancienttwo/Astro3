'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Users, Gift, Share2, Copy, ExternalLink, CheckCircle, XCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { DualAuthManager, Web3Auth } from '@/lib/dual-auth-system';
import { supabase } from '@/lib/supabase';

interface ReferralRecord {
  id: number;
  referee_email: string;
  status: string;
  referrer_reward: number;
  referee_reward: number;
  created_at: string;
  reward_granted_at?: string;
}

interface ReferralData {
  code: string;
  totalReferred: number;
  totalRewards: number;
  createdAt: string;
  records: ReferralRecord[];
  shareText: string;
  shareUrl: string;
  isExisting?: boolean;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: ReferralData | null;
  error?: string;
  details?: string;
  timestamp: string;
}

// 创建双轨认证请求头（架构修复：先检查session再获取用户）
async function createAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  try {
    // 优先检查Supabase session（架构修复：避免依赖可能失效的getCurrentUser）
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (session && !sessionError) {
      // Web2用户认证
      headers['Authorization'] = `Bearer ${session.access_token}`;
    } else {
      // 检查Web3用户
      const web3User = Web3Auth.getCurrentUser();
      if (web3User) {
        headers['X-Web3-User'] = btoa(encodeURIComponent(JSON.stringify(web3User)));
      } else {
        throw new Error('用户未登录');
      }
    }

    return headers;
  } catch (error) {
    console.error('创建认证头失败:', error);
    throw error;
  }
}

export default function ReferralCodeManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 组件加载时获取推荐码信息
  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 使用双轨认证创建请求头
      const headers = await createAuthHeaders();

      const response = await fetch('/api/referral/generate-code', {
        headers
      });
      const data: ApiResponse = await response.json();

      if (data.success) {
        setReferralData(data.data); // data.data 可能为 null，这是正常的
      } else if (data.error === '需要登录') {
        setError('请先登录后再使用推荐功能');
      } else {
        setError(data.details || '查询推荐码失败');
      }
    } catch (error: any) {
      if (error.message === '用户未登录' || error.message === 'Web2用户认证失败') {
        setError('请先登录后再使用推荐功能');
      } else {
        setError('网络请求失败，请稍后重试');
      }
      console.error('获取推荐码失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateReferralCode = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // 使用双轨认证创建请求头
      const headers = await createAuthHeaders();

      const response = await fetch('/api/referral/generate-code', {
        method: 'POST',
        headers,
      });

      const data: ApiResponse = await response.json();

      if (data.success && data.data) {
        setReferralData(data.data);
        if (!data.data.isExisting) {
          toast.success('推荐码生成成功！');
        }
      } else {
        setError(data.details || '生成推荐码失败');
        toast.error(data.message || '生成失败');
      }
    } catch (error: any) {
      let errorMsg = '网络请求失败，请稍后重试';
      if (error.message === '用户未登录' || error.message === 'Web2用户认证失败') {
        errorMsg = '请先登录后再生成推荐码';
        toast.error('请先登录');
      } else {
        toast.error(errorMsg);
      }
      setError(errorMsg);
      console.error('生成推荐码失败:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type}已复制到剪贴板`);
    } catch (error) {
      toast.error('复制失败，请手动复制');
    }
  };

  const shareToSocial = (platform: string) => {
    if (!referralData) return;

    const { shareText, shareUrl } = referralData;
    let url = '';

    switch (platform) {
      case 'wechat':
        // 微信分享需要特殊处理，这里只复制链接
        copyToClipboard(shareUrl, '推荐链接');
        toast.success('链接已复制，请在微信中分享');
        break;
      case 'weibo':
        url = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
        break;
      case 'qq':
        url = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
        break;
      default:
        copyToClipboard(shareUrl, '推荐链接');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const formatEmail = (email: string) => {
    return email.replace(/(.{2}).*(@.*)/, '$1***$2');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>加载推荐码信息...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-300">
              <div className="space-y-3">
                <div className="font-medium">加载失败</div>
                <div className="text-sm">{error}</div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={fetchReferralData}
                  className="mt-2"
                >
                  重试
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 推荐码卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            我的推荐码
          </CardTitle>
          <CardDescription>
            分享推荐码，邀请好友注册获得奖励
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {referralData ? (
            <div className="space-y-6">
              {/* 推荐码显示 */}
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-1">
                  <div className="text-sm text-blue-700 dark:text-blue-300">您的推荐码</div>
                  <div className="text-2xl font-mono font-bold text-blue-900 dark:text-blue-100">
                    {referralData.code}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(referralData.code, '推荐码')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </Button>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {referralData.totalReferred}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">成功推荐</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {referralData.totalRewards}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">获得奖励</div>
                </div>
              </div>

              {/* 分享选项 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">分享推荐链接</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(referralData.shareUrl, '推荐链接')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制链接
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(referralData.shareText, '分享文案')}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制文案
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* 推荐奖励说明 */}
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <Gift className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-300">
                    <div className="space-y-2">
                      <div className="font-medium">推荐奖励规则</div>
                      <div className="text-sm space-y-1">
                        <div>• 好友通过您的推荐码注册，您获得 <strong>3次</strong> 免费分析</div>
                        <div>• 好友注册成功后获得 <strong>3次</strong> 免费分析</div>
                        <div>• 奖励立即到账，无需等待</div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-4">
              <Users className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="space-y-2">
                <h3 className="font-medium">还没有推荐码</h3>
                <p className="text-sm text-gray-500">
                  生成推荐码，邀请好友注册获得奖励
                </p>
              </div>
              <Button 
                onClick={generateReferralCode}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Share2 className="h-4 w-4 mr-2" />
                )}
                生成推荐码
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 推荐记录 */}
      {referralData && referralData.records && referralData.records.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              推荐记录
            </CardTitle>
            <CardDescription>
              您的推荐历史记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referralData.records.map((record, index) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {formatEmail(record.referee_email)}
                      </span>
                      <Badge 
                        variant={record.status === 'rewarded' ? 'default' : 'secondary'}
                        className={record.status === 'rewarded' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : ''}
                      >
                        {record.status === 'rewarded' ? '已奖励' : '待奖励'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      注册时间: {formatDate(record.created_at)}
                      {record.reward_granted_at && (
                        <span className="ml-2">
                          | 奖励时间: {formatDate(record.reward_granted_at)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      +{record.referrer_reward} 次
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 