'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, TrendingUp, Users, Gift, Share2, Activity, 
  RefreshCw, Calendar, Target, DollarSign, Zap, AlertCircle 
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsData {
  timeRange: string;
  startDate: string;
  promocodes: {
    total: number;
    used: number;
    usageRate: number;
    totalCreditsGranted: number;
    activities: any[];
  };
  referrals: {
    totalReferralCodes: number;
    totalReferrals: number;
    successfulReferrals: number;
    totalRewardsCredits: number;
    conversionRate: number;
  };
  users: {
    newUsers: number;
    totalUsers: number;
    activeUsers: number;
    activationRate: number;
  };
  usage: {
    totalAnalyses: number;
    freeAnalyses: number;
    paidAnalyses: number;
    paidConversionRate: number;
  };
  trends: any[];
  generatedAt: string;
}

export default function AnalyticsManager() {
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  // 时间范围选项
  const timeRangeOptions = [
    { value: '7d', label: '最近7天' },
    { value: '30d', label: '最近30天' },
    { value: '90d', label: '最近90天' },
    { value: '1y', label: '最近1年' }
  ];

  // 加载分析数据
  const loadAnalytics = async (selectedTimeRange = timeRange) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?timeRange=${selectedTimeRange}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
        toast.success('数据加载成功');
      } else {
        setError(data.message || '数据加载失败');
        toast.error(data.message || '数据加载失败');
      }
    } catch (error) {
      const errorMsg = '网络请求失败，请稍后重试';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('获取分析数据失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (newTimeRange: string) => {
    setTimeRange(newTimeRange);
    loadAnalytics(newTimeRange);
  };

  // 初始加载
  useEffect(() => {
    loadAnalytics();
  }, []);

  // 格式化百分比
  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  // 格式化数字
  const formatNumber = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* 页头 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                运营数据分析
              </CardTitle>
              <CardDescription>
                实时监控运营活动效果和用户行为数据
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => loadAnalytics()}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 错误提示 */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-muted-foreground">正在加载数据...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析数据展示 */}
      {analytics && !isLoading && (
        <>
          {/* 关键指标概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 用户指标 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  用户概况
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{formatNumber(analytics.users.totalUsers)}</span>
                    <Badge variant="outline">总用户</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>新增用户</span>
                    <span className="font-medium">+{analytics.users.newUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>活跃用户</span>
                    <span className="font-medium">{analytics.users.activeUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>活跃率</span>
                    <span className="font-medium text-green-600">
                      {formatPercent(analytics.users.activationRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 兑换码指标 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gift className="h-4 w-4 text-orange-500" />
                  兑换码效果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{analytics.promocodes.total}</span>
                    <Badge variant="outline">总发放</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>已使用</span>
                    <span className="font-medium">{analytics.promocodes.used}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>使用率</span>
                    <span className="font-medium text-blue-600">
                      {formatPercent(analytics.promocodes.usageRate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>发放次数</span>
                    <span className="font-medium">{analytics.promocodes.totalCreditsGranted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 推荐系统指标 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-green-500" />
                  推荐效果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{analytics.referrals.totalReferralCodes}</span>
                    <Badge variant="outline">推荐码</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>推荐次数</span>
                    <span className="font-medium">{analytics.referrals.totalReferrals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>成功推荐</span>
                    <span className="font-medium">{analytics.referrals.successfulReferrals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>转化率</span>
                    <span className="font-medium text-green-600">
                      {formatPercent(analytics.referrals.conversionRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI使用指标 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  AI分析使用
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-2xl font-bold">{formatNumber(analytics.usage.totalAnalyses)}</span>
                    <Badge variant="outline">总分析</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>免费分析</span>
                    <span className="font-medium">{analytics.usage.freeAnalyses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>付费分析</span>
                    <span className="font-medium">{analytics.usage.paidAnalyses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>付费转化率</span>
                    <span className="font-medium text-purple-600">
                      {formatPercent(analytics.usage.paidConversionRate)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 详细分析 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 兑换码活动详情 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  兑换码活动详情
                </CardTitle>
                <CardDescription>
                  各个活动的兑换码使用情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics.promocodes.activities.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.promocodes.activities.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <p className="font-medium">{activity.name || '未命名活动'}</p>
                          <p className="text-sm text-muted-foreground">
                            创建时间: {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">
                            {activity.type || '兑换码'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>暂无活动数据</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 奖励发放统计 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  奖励发放统计
                </CardTitle>
                <CardDescription>
                  免费次数的发放和使用情况
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Gift className="h-8 w-8 text-orange-500" />
                      <div>
                        <p className="font-medium">兑换码奖励</p>
                        <p className="text-sm text-muted-foreground">通过兑换码获得的次数</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{analytics.promocodes.totalCreditsGranted}</p>
                      <p className="text-sm text-muted-foreground">次</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Share2 className="h-8 w-8 text-green-500" />
                      <div>
                        <p className="font-medium">推荐奖励</p>
                        <p className="text-sm text-muted-foreground">通过推荐获得的次数</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{analytics.referrals.totalRewardsCredits}</p>
                      <p className="text-sm text-muted-foreground">次</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>总奖励发放</span>
                      <span className="font-bold">
                        {analytics.promocodes.totalCreditsGranted + analytics.referrals.totalRewardsCredits} 次
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 数据更新时间 */}
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>数据统计时间范围: {timeRangeOptions.find(opt => opt.value === timeRange)?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>最后更新: {new Date(analytics.generatedAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
} 