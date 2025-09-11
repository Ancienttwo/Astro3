'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MutualAidLayout from '@/components/layouts/MutualAidLayout';
import ResponsiveCard from '@/components/ui/responsive-card';
import { useResponsiveDesign } from '@/lib/utils/responsive';

// State management hooks
import {
  useMutualAidStore,
  useUserProfile,
  useWeb3State,
  useUIState,
  useIsWalletConnected,
  useUIActions,
  useWeb3Actions,
  useMutualAidActions
} from '@/lib/stores/mutualAidStore';

// React Query hooks
import {
  useUserStats,
  useSystemStats,
  useMyRequests,
  usePendingValidations,
  useSubmitValidation,
  useAdversityAnalysis
} from '@/lib/api/queries';

// Sync manager
import { useSyncManager, useOfflineFirst } from '@/lib/services/syncManager';

import {
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  Users,
  Activity,
  Settings,
  Download,
  Upload,
  Clock,
  TrendingUp
} from 'lucide-react';

export default function StateManagementDemoPage() {
  const { isMobile, isOnline, currentBreakpoint } = useResponsiveDesign();
  
  // Zustand store state
  const userProfile = useUserProfile();
  const web3State = useWeb3State();
  const uiState = useUIState();
  const isWalletConnected = useIsWalletConnected();
  
  // Zustand actions
  const { setTheme, setLanguage, addNotification } = useUIActions();
  const { connectWallet, updateBalance } = useWeb3Actions();
  const { updateReputation, updateUserStats } = useMutualAidActions();
  
  // React Query state
  const { data: userStats, isLoading: userStatsLoading } = useUserStats();
  const { data: systemStats, isLoading: systemStatsLoading } = useSystemStats();
  const { data: myRequests, isLoading: requestsLoading } = useMyRequests();
  const { data: pendingValidations, isLoading: validationsLoading } = usePendingValidations();
  
  // React Query mutations
  const validationMutation = useSubmitValidation();
  const analysisMutation = useAdversityAnalysis();
  
  // Sync manager
  const { syncState, performSync, addPendingChange } = useSyncManager();
  const { executeOfflineFirst, isOffline, hasPendingChanges } = useOfflineFirst();
  
  // Local demo state
  const [demoData, setDemoData] = useState({
    testMessage: '',
    mockValidation: {
      requestId: 'demo-request-1',
      vote: 'approve' as const,
      confidence: 85,
      reason: '申请理由充分，符合互助条件'
    }
  });

  // Demo functions
  const handleTestNotification = () => {
    addNotification({
      type: 'info',
      title: '状态管理演示',
      message: `当前断点: ${currentBreakpoint}, 设备: ${isMobile ? '移动端' : '桌面端'}`
    });
  };

  const handleMockWalletConnect = () => {
    connectWallet({
      address: '0x1234...5678',
      networkId: 56,
      networkName: 'BSC Mainnet',
      balance: {
        native: '1.5',
        azi: '100.0',
        luck: '2500'
      }
    });
    
    addNotification({
      type: 'success',
      title: '钱包连接成功',
      message: '模拟钱包已连接到BSC主网'
    });
  };

  const handleTestOfflineOperation = async () => {
    const result = await executeOfflineFirst(
      // 在线操作
      () => validationMutation.mutateAsync({
        requestId: demoData.mockValidation.requestId,
        data: {
          vote: demoData.mockValidation.vote,
          confidence: demoData.mockValidation.confidence,
          reason: demoData.mockValidation.reason
        }
      }),
      // 离线回退数据
      { success: true, cached: true },
      'validation_submit'
    );
    
    addNotification({
      type: isOffline ? 'warning' : 'success',
      title: isOffline ? '离线操作已缓存' : '验证提交成功',
      message: isOffline ? '网络恢复后将自动同步' : '您的验证已成功提交'
    });
  };

  const handleForceSync = async () => {
    const success = await performSync();
    addNotification({
      type: success ? 'success' : 'error',
      title: success ? '同步成功' : '同步失败',
      message: success ? '所有数据已同步到最新状态' : '同步过程中遇到错误，请稍后重试'
    });
  };

  const handleTestAnalysis = async () => {
    try {
      const result = await analysisMutation.mutateAsync({
        slipNumber: 42,
        userInfo: {
          birthDate: '1990-01-01',
          location: 'Shanghai'
        },
        situation: demoData.testMessage || '最近工作压力很大，想了解一下运势变化'
      });
      
      addNotification({
        type: 'info',
        title: 'AI分析完成',
        message: '分析结果已生成，建议等级：中等关注'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'AI分析失败',
        message: '分析服务暂时不可用，请稍后重试'
      });
    }
  };

  const getStateStatusColor = (isLoading: boolean, hasData: boolean) => {
    if (isLoading) return 'bg-yellow-100 text-yellow-800';
    if (hasData) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStateStatusText = (isLoading: boolean, hasData: boolean) => {
    if (isLoading) return '加载中';
    if (hasData) return '已就绪';
    return '未加载';
  };

  return (
    <MutualAidLayout 
      title="状态管理系统演示"
      subtitle="展示 Zustand + React Query + Sync Manager 完整数据流"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 系统状态概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveCard
            title="系统状态概览"
            variant="gradient"
            className="mb-8"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {isOnline ? (
                    <Wifi className="w-6 h-6 text-green-600" />
                  ) : (
                    <WifiOff className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {isOnline ? '在线' : '离线'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {isWalletConnected ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {isWalletConnected ? '已连接' : '未连接'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {syncState.isSyncing ? (
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                  ) : (
                    <RefreshCw className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <p className="text-sm font-medium">
                  {syncState.isSyncing ? '同步中' : '已同步'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Database className="w-6 h-6 text-purple-600" />
                  {hasPendingChanges && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                      {syncState.pendingChanges.length}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium">
                  {hasPendingChanges ? '有待同步' : '数据一致'}
                </p>
              </div>
            </div>
            
            {syncState.lastSync && (
              <div className="mt-4 pt-4 border-t text-center text-sm text-muted-foreground">
                上次同步: {new Date(syncState.lastSync).toLocaleString()}
              </div>
            )}
          </ResponsiveCard>
        </motion.div>

        {/* 主要演示区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Tabs defaultValue="zustand" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="zustand">Zustand</TabsTrigger>
              <TabsTrigger value="react-query">React Query</TabsTrigger>
              <TabsTrigger value="sync-manager">Sync Manager</TabsTrigger>
              <TabsTrigger value="responsive">响应式</TabsTrigger>
            </TabsList>

            {/* Zustand 状态管理演示 */}
            <TabsContent value="zustand" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Zustand Store 状态
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">用户状态</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>钱包地址:</span>
                          <span className="font-mono">
                            {userProfile.walletAddress || '未连接'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>信誉分数:</span>
                          <span>{userProfile.reputation.toFixed(1)}/5.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NFT数量:</span>
                          <span>{userProfile.nftCollection.totalCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>申请历史:</span>
                          <span>{userProfile.mutualAidHistory.length} 条</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">UI状态</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>主题:</span>
                          <Badge variant="outline">{uiState.theme}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>语言:</span>
                          <Badge variant="outline">{uiState.language}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>未读通知:</span>
                          <Badge>{uiState.notifications.filter(n => !n.read).length}</Badge>
                        </div>
                      </div>
                    </div>

                    {isWalletConnected && (
                      <div>
                        <h4 className="font-medium mb-2">Web3状态</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>网络:</span>
                            <span>{web3State.networkName || 'Unknown'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>AZI余额:</span>
                            <span>{web3State.balance.azi}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Luck积分:</span>
                            <span>{web3State.balance.luck}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>状态操作演示</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">主题切换</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={uiState.theme === 'light' ? 'default' : 'outline'}
                          onClick={() => setTheme('light')}
                        >
                          浅色
                        </Button>
                        <Button
                          size="sm"
                          variant={uiState.theme === 'dark' ? 'default' : 'outline'}
                          onClick={() => setTheme('dark')}
                        >
                          深色
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">语言切换</h4>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={uiState.language === 'zh' ? 'default' : 'outline'}
                          onClick={() => setLanguage('zh')}
                        >
                          中文
                        </Button>
                        <Button
                          size="sm"
                          variant={uiState.language === 'en' ? 'default' : 'outline'}
                          onClick={() => setLanguage('en')}
                        >
                          English
                        </Button>
                      </div>
                    </div>

                    {!isWalletConnected && (
                      <div>
                        <h4 className="font-medium mb-2">模拟钱包连接</h4>
                        <Button onClick={handleMockWalletConnect} className="w-full">
                          连接模拟钱包
                        </Button>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">通知测试</h4>
                      <Button onClick={handleTestNotification} variant="outline" className="w-full">
                        发送测试通知
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* React Query 演示 */}
            <TabsContent value="react-query" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Query 状态监控
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">用户统计</span>
                        <Badge 
                          className={getStateStatusColor(userStatsLoading, !!userStats)}
                        >
                          {getStateStatusText(userStatsLoading, !!userStats)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">系统统计</span>
                        <Badge 
                          className={getStateStatusColor(systemStatsLoading, !!systemStats)}
                        >
                          {getStateStatusText(systemStatsLoading, !!systemStats)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">我的申请</span>
                        <Badge 
                          className={getStateStatusColor(requestsLoading, !!myRequests)}
                        >
                          {getStateStatusText(requestsLoading, !!myRequests)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm">待验证列表</span>
                        <Badge 
                          className={getStateStatusColor(validationsLoading, !!pendingValidations)}
                        >
                          {getStateStatusText(validationsLoading, !!pendingValidations)}
                        </Badge>
                      </div>
                    </div>

                    {userStats && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2">用户数据示例</h4>
                        <div className="text-sm space-y-1">
                          <div>验证次数: {userStats.totalValidationsPerformed || 0}</div>
                          <div>准确率: {(userStats.validationAccuracy || 0).toFixed(1)}%</div>
                          <div>社区排名: #{userStats.communityRank || 0}</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Mutation 操作演示</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">AI分析测试</h4>
                      <Textarea
                        placeholder="描述您的当前情况..."
                        value={demoData.testMessage}
                        onChange={(e) => setDemoData(prev => ({
                          ...prev,
                          testMessage: e.target.value
                        }))}
                        className="mb-2"
                      />
                      <Button
                        onClick={handleTestAnalysis}
                        disabled={analysisMutation.isPending}
                        className="w-full"
                      >
                        {analysisMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        开始AI分析
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">验证操作测试</h4>
                      <div className="space-y-2 text-sm">
                        <div>申请ID: {demoData.mockValidation.requestId}</div>
                        <div>投票: {demoData.mockValidation.vote === 'approve' ? '赞成' : '反对'}</div>
                        <div>置信度: {demoData.mockValidation.confidence}%</div>
                      </div>
                      <Button
                        onClick={handleTestOfflineOperation}
                        disabled={validationMutation.isPending}
                        variant="outline"
                        className="w-full mt-2"
                      >
                        {validationMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Users className="w-4 h-4 mr-2" />
                        )}
                        提交验证（支持离线）
                      </Button>
                    </div>

                    {(analysisMutation.isError || validationMutation.isError) && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          操作失败: {analysisMutation.error?.message || validationMutation.error?.message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Sync Manager 演示 */}
            <TabsContent value="sync-manager" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5" />
                      同步状态
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>网络状态:</span>
                        <Badge variant={syncState.isOnline ? 'default' : 'destructive'}>
                          {syncState.isOnline ? '在线' : '离线'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>同步状态:</span>
                        <Badge variant={syncState.isSyncing ? 'secondary' : 'outline'}>
                          {syncState.isSyncing ? '同步中' : '空闲'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>待同步变更:</span>
                        <Badge variant={syncState.pendingChanges.length > 0 ? 'destructive' : 'default'}>
                          {syncState.pendingChanges.length}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span>同步错误:</span>
                        <Badge variant={syncState.syncErrors.length > 0 ? 'destructive' : 'default'}>
                          {syncState.syncErrors.length}
                        </Badge>
                      </div>
                    </div>

                    {syncState.lastSync && (
                      <div className="pt-3 border-t text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>上次同步: {new Date(syncState.lastSync).toLocaleString()}</span>
                        </div>
                      </div>
                    )}

                    {syncState.syncErrors.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <h5 className="font-medium text-red-800 mb-1">同步错误:</h5>
                        <div className="text-sm text-red-700 space-y-1">
                          {syncState.syncErrors.map((error, index) => (
                            <div key={index}>• {error}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>同步操作</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">手动同步</h4>
                      <Button
                        onClick={handleForceSync}
                        disabled={syncState.isSyncing}
                        className="w-full"
                      >
                        {syncState.isSyncing ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        强制同步
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">离线优先操作</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        此操作演示了离线优先的数据处理策略
                      </p>
                      <Button
                        onClick={handleTestOfflineOperation}
                        variant="outline"
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        测试离线优先操作
                      </Button>
                    </div>

                    {hasPendingChanges && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h5 className="font-medium text-yellow-800 mb-1">待同步操作:</h5>
                        <div className="text-sm text-yellow-700 space-y-1">
                          {syncState.pendingChanges.map((change, index) => (
                            <div key={index}>
                              • {change.type} ({new Date(change.timestamp).toLocaleTimeString()})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 响应式演示 */}
            <TabsContent value="responsive" className="space-y-6">
              <ResponsiveCard
                title="响应式状态监控"
                variant="glass"
                className="mb-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-sm font-medium">当前断点</div>
                    <Badge variant="outline">{currentBreakpoint}</Badge>
                  </div>
                  
                  <div className="text-center">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-sm font-medium">设备类型</div>
                    <Badge variant={isMobile ? 'default' : 'secondary'}>
                      {isMobile ? '移动端' : '桌面端'}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <Wifi className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-sm font-medium">网络状态</div>
                    <Badge variant={isOnline ? 'default' : 'destructive'}>
                      {isOnline ? '在线' : '离线'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">查询优化程度</span>
                      <span className="text-sm text-muted-foreground">
                        {isMobile ? '85%' : '100%'}
                      </span>
                    </div>
                    <Progress value={isMobile ? 85 : 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">缓存效率</span>
                      <span className="text-sm text-muted-foreground">
                        {isOnline ? '90%' : '60%'}
                      </span>
                    </div>
                    <Progress value={isOnline ? 90 : 60} className="h-2" />
                  </div>
                </div>
              </ResponsiveCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MutualAidLayout>
  );
}
