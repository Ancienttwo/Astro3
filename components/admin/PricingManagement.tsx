'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  PieChart,
  Clock,
  Coins
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  PricingManager, 
  PriceMonitor, 
  type PricingConfig, 
  type RevenueStats 
} from '@/lib/pricing-manager';

export default function PricingManagement() {
  const [config, setConfig] = useState<PricingConfig>(PricingManager.getCurrentPricing());
  const [loading, setLoading] = useState(false);
  const [marketPrice, setMarketPrice] = useState<number | null>(null);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [editingConfig, setEditingConfig] = useState<Partial<PricingConfig>>({});

  // 获取市场价格
  const fetchMarketPrice = async () => {
    try {
      setLoading(true);
      const price = await PricingManager.fetchBNBPrice();
      setMarketPrice(price);
      setLastUpdate(new Date());
    } catch (error) {
      toast({
        title: "获取价格失败",
        description: "无法获取BNB市场价格",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 更新定价配置
  const updatePricing = async (updates: Partial<PricingConfig>) => {
    try {
      setLoading(true);
      const newConfig = PricingManager.updatePricing(updates);
      setConfig(newConfig);
      setEditingConfig({});
      
      toast({
        title: "定价更新成功",
        description: "新的定价配置已生效",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "更新失败",
        description: error.message || "无法更新定价配置",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 自动更新BNB价格
  const autoUpdateBNBPrice = async () => {
    try {
      setLoading(true);
      const newConfig = await PricingManager.updateBNBPrice();
      setConfig(newConfig);
      setMarketPrice(newConfig.bnbPriceUSD);
      setLastUpdate(new Date());
      
      toast({
        title: "价格自动更新",
        description: `BNB价格已更新为 $${newConfig.bnbPriceUSD}`,
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "自动更新失败",
        description: error.message || "无法自动更新BNB价格",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // 重置为默认配置
  const resetToDefault = () => {
    const defaultConfig = PricingManager.resetToDefault();
    setConfig(defaultConfig);
    setEditingConfig({});
    
    toast({
      title: "已重置",
      description: "定价配置已重置为默认值",
      variant: "default",
    });
  };

  // 计算价格建议
  const getPriceSuggestion = () => {
    if (!marketPrice) return null;
    
    return PricingManager.getPriceUpdateSuggestion(config.bnbPriceUSD, marketPrice);
  };

  // 计算收入分配
  const getRevenueDistribution = () => {
    return PricingManager.calculateRevenueDistribution(config.checkinPriceBNB, config);
  };

  // 初始化数据
  useEffect(() => {
    fetchMarketPrice();
  }, []);

  // 设置自动监控
  useEffect(() => {
    const monitor = PriceMonitor.getInstance();
    
    if (autoUpdate) {
      monitor.startMonitoring(30); // 每30分钟检查一次
      
      const callback = (newConfig: PricingConfig) => {
        setConfig(newConfig);
        toast({
          title: "价格监控提醒",
          description: "检测到BNB价格变化，建议更新定价",
          variant: "default",
        });
      };
      
      monitor.onPriceChange(callback);
      
      return () => {
        monitor.removeCallback(callback);
        monitor.stopMonitoring();
      };
    } else {
      monitor.stopMonitoring();
    }
  }, [autoUpdate]);

  const suggestion = getPriceSuggestion();
  const revenueDistribution = getRevenueDistribution();
  const priceDifference = marketPrice ? ((marketPrice - config.bnbPriceUSD) / config.bnbPriceUSD) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* 顶部统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">当前签到价格</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.checkinPriceBNB} BNB</div>
            <p className="text-xs text-muted-foreground">
              ≈ ${config.checkinPriceUSD} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BNB市场价格</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${marketPrice?.toFixed(2) || '加载中...'}
            </div>
            <div className="flex items-center text-xs">
              {priceDifference !== 0 && (
                <>
                  {priceDifference > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={priceDifference > 0 ? 'text-green-500' : 'text-red-500'}>
                    {priceDifference > 0 ? '+' : ''}{priceDifference.toFixed(1)}%
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">收入分配</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{config.platformFeePercent}%</div>
            <p className="text-xs text-muted-foreground">
              平台收入 | {config.gasReservePercent}% Gas储备
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 价格建议 */}
      {suggestion && (
        <Alert className={suggestion.shouldUpdate ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
          {suggestion.shouldUpdate ? (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className={suggestion.shouldUpdate ? "text-orange-800" : "text-green-800"}>
            {suggestion.reason}
            {suggestion.shouldUpdate && (
              <div className="mt-2">
                <Button 
                  size="sm" 
                  onClick={autoUpdateBNBPrice}
                  disabled={loading}
                >
                  应用建议价格
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* 定价配置 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 价格设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>价格设置</span>
            </CardTitle>
            <CardDescription>
              调整签到价格和BNB汇率
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usd-price">签到价格 (USD)</Label>
              <Input
                id="usd-price"
                type="number"
                step="0.01"
                value={editingConfig.checkinPriceUSD ?? config.checkinPriceUSD}
                onChange={(e) => setEditingConfig(prev => ({
                  ...prev,
                  checkinPriceUSD: e.target.value
                }))}
                placeholder="0.10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bnb-price">BNB价格 (USD)</Label>
              <div className="flex space-x-2">
                <Input
                  id="bnb-price"
                  type="number"
                  step="0.01"
                  value={editingConfig.bnbPriceUSD ?? config.bnbPriceUSD}
                  onChange={(e) => setEditingConfig(prev => ({
                    ...prev,
                    bnbPriceUSD: parseFloat(e.target.value) || 0
                  }))}
                  placeholder="500.00"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={fetchMarketPrice}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bnb-amount">对应BNB数量</Label>
              <Input
                id="bnb-amount"
                type="number"
                step="0.000001"
                value={editingConfig.checkinPriceBNB ?? config.checkinPriceBNB}
                onChange={(e) => setEditingConfig(prev => ({
                  ...prev,
                  checkinPriceBNB: e.target.value
                }))}
                placeholder="0.0002"
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => updatePricing(editingConfig)}
                disabled={loading || Object.keys(editingConfig).length === 0}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  '更新价格'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={resetToDefault}
                disabled={loading}
              >
                重置
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 收入分配设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>收入分配</span>
            </CardTitle>
            <CardDescription>
              设置平台收入和Gas储备的分配比例
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform-fee">平台费用 (%)</Label>
              <Input
                id="platform-fee"
                type="number"
                min="0"
                max="100"
                value={editingConfig.platformFeePercent ?? config.platformFeePercent}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  setEditingConfig(prev => ({
                    ...prev,
                    platformFeePercent: value,
                    gasReservePercent: 100 - value
                  }));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gas-reserve">Gas储备 (%)</Label>
              <Input
                id="gas-reserve"
                type="number"
                min="0"
                max="100"
                value={editingConfig.gasReservePercent ?? config.gasReservePercent}
                onChange={(e) => {
                  const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                  setEditingConfig(prev => ({
                    ...prev,
                    gasReservePercent: value,
                    platformFeePercent: 100 - value
                  }));
                }}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label>收入分配预览</Label>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>平台收入:</span>
                  <span>{revenueDistribution.platformFee} BNB (${revenueDistribution.platformFeeUSD})</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gas储备:</span>
                  <span>{revenueDistribution.gasReserve} BNB (${revenueDistribution.gasReserveUSD})</span>
                </div>
              </div>
            </div>

            <Progress 
              value={editingConfig.platformFeePercent ?? config.platformFeePercent} 
              className="h-2" 
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>平台 {editingConfig.platformFeePercent ?? config.platformFeePercent}%</span>
              <span>Gas {editingConfig.gasReservePercent ?? config.gasReservePercent}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 自动化设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>自动化设置</span>
          </CardTitle>
          <CardDescription>
            自动监控价格变化并提醒更新
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-update"
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
            <Label htmlFor="auto-update">启用价格监控</Label>
          </div>
          
          {autoUpdate && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                价格监控已启用，系统将每30分钟检查一次BNB价格变化。
                当价格变化超过5%时，会发送更新提醒。
              </AlertDescription>
            </Alert>
          )}

          {lastUpdate && (
            <div className="text-sm text-muted-foreground">
              最后更新: {lastUpdate.toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}