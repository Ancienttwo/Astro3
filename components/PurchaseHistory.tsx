"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ShoppingBag, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Clock,
  RefreshCw,
  Package,
  Zap
} from 'lucide-react';
import { SafeCrown } from '@/components/ui/safe-icon';
import { getCurrentUnifiedUser } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

interface PurchaseRecord {
  id: string;
  type: 'usage' | 'reports' | 'premium';
  amount: number;
  quantity: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'wechat' | 'alipay' | 'stripe' | 'mock';
  createdAt: string;
  description: string;
}

export function PurchaseHistory() {
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchaseHistory = async () => {
      try {
        setLoading(true);
        
        // 获取认证session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.log('❌ 用户未登录，不显示购买记录');
          // 用户未登录时不显示错误，只是显示空状态
          setPurchases([]);
          setError(null);
          return;
        }

        // 实际API调用
        const response = await fetch('/api/purchase-history', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          credentials: 'include',
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || '获取购买记录失败');
        }
        
        if (data.success) {
          setPurchases(data.data || []);
        } else {
          throw new Error(data.error || '获取购买记录失败');
        }
        
      } catch (err) {
        // 不要设置错误状态，只是静默处理
        console.log('获取购买记录失败:', err);
        setPurchases([]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchaseHistory();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'pending':
        return '处理中';
      case 'failed':
        return '失败';
      case 'refunded':
        return '已退款';
      default:
        return '未知';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
      case 'refunded':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300';
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'wechat':
        return '微信支付';
      case 'alipay':
        return '支付宝';
      case 'stripe':
        return '信用卡';
      case 'mock':
        return '模拟支付';
      default:
        return '其他';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'usage':
        return <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'reports':
        return <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'premium':
        return <SafeCrown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <ShoppingBag className="h-5 w-5 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">加载购买记录...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="text-sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重新加载
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (purchases.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">暂无购买记录</p>
            <p className="text-sm text-gray-500">开始使用我们的服务，记录将显示在这里</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          购买记录
          <Badge variant="secondary" className="text-xs">
            {purchases.length} 条记录
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {purchases.map((purchase, index) => (
            <div key={purchase.id}>
              <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    {getTypeIcon(purchase.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {purchase.description}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getStatusColor(purchase.status)}`}
                      >
                        {getStatusIcon(purchase.status)}
                        <span className="ml-1">{getStatusText(purchase.status)}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(purchase.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        {getPaymentMethodText(purchase.paymentMethod)}
                      </span>
                      {purchase.quantity > 1 && (
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {purchase.quantity} 次
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-lg text-gray-900 dark:text-white">
                    ¥{purchase.amount.toFixed(2)}
                  </p>
                  {purchase.status === 'pending' && (
                    <Button variant="outline" size="sm" className="mt-2 text-xs">
                      查看详情
                    </Button>
                  )}
                </div>
              </div>
              
              {index < purchases.length - 1 && (
                <Separator className="my-2" />
              )}
            </div>
          ))}
        </div>
        
        {/* 统计信息 */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {purchases.length}
              </p>
              <p className="text-sm text-gray-500">总订单数</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ¥{purchases.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">总消费金额</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {purchases.filter(p => p.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-500">成功订单</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {purchases.reduce((sum, p) => sum + (p.status === 'completed' ? p.quantity : 0), 0)}
              </p>
              <p className="text-sm text-gray-500">累计次数</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 