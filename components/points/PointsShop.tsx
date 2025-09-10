'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  Zap, 
  Gift, 
  Award, 
  ShoppingCart, 
  Sparkles,
  TrendingUp,
  Crown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShopItem {
  id: string;
  item_type: string;
  item_name: string;
  item_description: string;
  points_cost: number;
  item_value: any;
  available_for: string;
  stock_limit?: number;
  purchase_limit_per_user?: number;
}

interface PointsShopProps {
  walletAddress?: string;
  userType: 'web2' | 'web3';
  currentBalance: number;
}

export default function PointsShop({ 
  walletAddress, 
  userType, 
  currentBalance 
}: PointsShopProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchShopItems();
  }, [userType]);

  const fetchShopItems = async () => {
    try {
      const response = await fetch(`/api/points/shop?user_type=${userType}`);
      const result = await response.json();
      
      if (result.success) {
        setItems(result.data.items);
      } else {
        toast({
          title: "获取商品失败",
          description: result.error || "请稍后重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching shop items:', error);
      toast({
        title: "网络错误",
        description: "获取商品列表时发生错误",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: ShopItem) => {
    if (userType === 'web2') {
      toast({
        title: "暂不支持",
        description: "Web2用户暂不支持积分商城，请直接通过签到获得AI报告次数",
        variant: "destructive"
      });
      return;
    }

    if (currentBalance < item.points_cost) {
      toast({
        title: "积分不足",
        description: `需要 ${item.points_cost} 积分，当前余额 ${currentBalance} 积分`,
        variant: "destructive"
      });
      return;
    }

    setPurchasing(item.id);

    try {
      const web3UserData = {
        walletAddress: walletAddress,
        chainId: 56,
        authType: 'web3'
      };

      const response = await fetch('/api/points/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Web3-User': btoa(encodeURIComponent(JSON.stringify(web3UserData)))
        },
        body: JSON.stringify({
          itemId: item.id,
          quantity: 1,
          userType: 'web3'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "兑换成功！",
          description: `成功兑换 ${item.item_name}，消耗 ${item.points_cost} 积分`,
        });
        
        // 刷新商品列表和余额
        fetchShopItems();
        window.location.reload(); // 简单刷新，实际项目中应该更新父组件状态
      } else {
        toast({
          title: "兑换失败",
          description: result.error || "请稍后重试",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
      toast({
        title: "兑换失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setPurchasing(null);
    }
  };

  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'ai_reports':
        return <Sparkles className="h-5 w-5" />;
      case 'airdrop_boost':
        return <TrendingUp className="h-5 w-5" />;
      case 'nft_badge':
        return <Award className="h-5 w-5" />;
      case 'premium_features':
        return <Crown className="h-5 w-5" />;
      default:
        return <Gift className="h-5 w-5" />;
    }
  };

  const getItemTypeColor = (itemType: string) => {
    switch (itemType) {
      case 'ai_reports':
        return 'border-blue-200 bg-blue-50';
      case 'airdrop_boost':
        return 'border-purple-200 bg-purple-50';
      case 'nft_badge':
        return 'border-yellow-200 bg-yellow-50';
      case 'premium_features':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getItemTypeText = (itemType: string) => {
    switch (itemType) {
      case 'ai_reports':
        return 'AI报告';
      case 'airdrop_boost':
        return '空投加速';
      case 'nft_badge':
        return 'NFT徽章';
      case 'premium_features':
        return '高级功能';
      default:
        return '其他';
    }
  };

  const canPurchase = (item: ShopItem) => {
    if (userType === 'web2' && item.available_for === 'web3') return false;
    if (userType === 'web3' && item.available_for === 'web2') return false;
    return currentBalance >= item.points_cost;
  };

  const categorizedItems = {
    ai_reports: items.filter(item => item.item_type === 'ai_reports'),
    airdrop_boost: items.filter(item => item.item_type === 'airdrop_boost'),
    nft_badge: items.filter(item => item.item_type === 'nft_badge'),
    premium_features: items.filter(item => item.item_type === 'premium_features')
  };

  if (userType === 'web2') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            积分商城
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Web2用户专享简化体验
            </h3>
            <p className="text-gray-500 mb-4">
              作为Web2用户，您可以通过免费签到直接获得AI报告次数，<br />
              无需复杂的积分兑换流程。
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
              去签到获得免费报告
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 余额显示 */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">当前积分余额</p>
              <p className="text-3xl font-bold text-blue-900">{currentBalance}</p>
            </div>
            <Coins className="h-12 w-12 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      {/* 商品分类 */}
      <Tabs defaultValue="ai_reports" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="ai_reports" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            AI报告
          </TabsTrigger>
          <TabsTrigger value="airdrop_boost" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            空投加速
          </TabsTrigger>
          <TabsTrigger value="nft_badge" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            NFT徽章
          </TabsTrigger>
          <TabsTrigger value="premium_features" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            高级功能
          </TabsTrigger>
        </TabsList>

        {/* AI报告 */}
        <TabsContent value="ai_reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedItems.ai_reports.map((item) => (
              <Card key={item.id} className={`${getItemTypeColor(item.item_type)} transition-all hover:shadow-md`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getItemIcon(item.item_type)}
                      <span className="text-lg">{item.item_name}</span>
                    </div>
                    <Badge variant="outline">{getItemTypeText(item.item_type)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.item_description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-blue-500" />
                      <span className="font-bold text-lg">{item.points_cost}</span>
                      <span className="text-gray-500">积分</span>
                    </div>
                    {item.item_value.discount && (
                      <Badge variant="secondary" className="bg-red-100 text-red-600">
                        {Math.round(item.item_value.discount * 100)}% OFF
                      </Badge>
                    )}
                  </div>
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={!canPurchase(item) || purchasing === item.id}
                    className="w-full"
                  >
                    {purchasing === item.id ? (
                      "兑换中..."
                    ) : !canPurchase(item) ? (
                      "积分不足"
                    ) : (
                      "立即兑换"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 空投加速 */}
        <TabsContent value="airdrop_boost" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedItems.airdrop_boost.map((item) => (
              <Card key={item.id} className={`${getItemTypeColor(item.item_type)} transition-all hover:shadow-md`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getItemIcon(item.item_type)}
                      <span className="text-lg">{item.item_name}</span>
                    </div>
                    <Badge variant="outline" className="border-purple-500 text-purple-600">
                      空投加速
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.item_description}</p>
                  <div className="bg-purple-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-purple-700">
                      立即获得 <span className="font-bold">+{item.item_value.weight_boost}</span> 空投权重
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-blue-500" />
                      <span className="font-bold text-lg">{item.points_cost}</span>
                      <span className="text-gray-500">积分</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={!canPurchase(item) || purchasing === item.id}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {purchasing === item.id ? (
                      "兑换中..."
                    ) : !canPurchase(item) ? (
                      "积分不足"
                    ) : (
                      "立即加速"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* NFT徽章 */}
        <TabsContent value="nft_badge" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedItems.nft_badge.map((item) => (
              <Card key={item.id} className={`${getItemTypeColor(item.item_type)} transition-all hover:shadow-md`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getItemIcon(item.item_type)}
                      <span className="text-lg">{item.item_name}</span>
                    </div>
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                      NFT收藏
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.item_description}</p>
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                    <p className="text-sm text-yellow-700">
                      独特的NFT徽章将铸造到您的钱包
                    </p>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-blue-500" />
                      <span className="font-bold text-lg">{item.points_cost}</span>
                      <span className="text-gray-500">积分</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={!canPurchase(item) || purchasing === item.id}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                  >
                    {purchasing === item.id ? (
                      "铸造中..."
                    ) : !canPurchase(item) ? (
                      "积分不足"
                    ) : (
                      "铸造NFT"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 高级功能 */}
        <TabsContent value="premium_features" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categorizedItems.premium_features.map((item) => (
              <Card key={item.id} className={`${getItemTypeColor(item.item_type)} transition-all hover:shadow-md`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getItemIcon(item.item_type)}
                      <span className="text-lg">{item.item_name}</span>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      高级功能
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.item_description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Coins className="h-4 w-4 text-blue-500" />
                      <span className="font-bold text-lg">{item.points_cost}</span>
                      <span className="text-gray-500">积分</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={!canPurchase(item) || purchasing === item.id}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {purchasing === item.id ? (
                      "解锁中..."
                    ) : !canPurchase(item) ? (
                      "积分不足"
                    ) : (
                      "立即解锁"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}