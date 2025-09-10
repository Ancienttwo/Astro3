import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUnifiedUser } from '@/lib/auth';

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

// 模拟购买记录数据
const mockPurchases: PurchaseRecord[] = [
  {
    id: '1',
    type: 'usage',
    amount: 24.9,
    quantity: 15,
    status: 'completed',
    paymentMethod: 'stripe',
    createdAt: '2024-01-15T10:30:00Z',
    description: '标准套餐 - 15次AI分析'
  },
  {
    id: '2',
    type: 'usage',
    amount: 9.9,
    quantity: 5,
    status: 'completed',
    paymentMethod: 'wechat',
    createdAt: '2024-01-10T14:20:00Z',
    description: '基础套餐 - 5次AI分析'
  },
  {
    id: '3',
    type: 'reports',
    amount: 19.9,
    quantity: 1,
    status: 'completed',
    paymentMethod: 'alipay',
    createdAt: '2024-01-05T09:15:00Z',
    description: '紫微斗数详细报告解锁'
  },
  {
    id: '4',
    type: 'premium',
    amount: 99.9,
    quantity: 1,
    status: 'pending',
    paymentMethod: 'stripe',
    createdAt: '2024-01-20T16:45:00Z',
    description: 'VIP会员 - 一年无限次数'
  },
  {
    id: '5',
    type: 'usage',
    amount: 59.9,
    quantity: 50,
    status: 'completed',
    paymentMethod: 'wechat',
    createdAt: '2024-01-01T08:00:00Z',
    description: '高级套餐 - 50次AI分析'
  }
];

export async function GET(request: NextRequest) {
  try {
    // 验证用户登录状态
    const user = await getCurrentUnifiedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    // TODO: 从数据库获取真实的购买记录
    // const purchases = await getPurchaseHistory(user.id);
    
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 返回模拟数据（按时间倒序）
    const sortedPurchases = mockPurchases.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: sortedPurchases,
      summary: {
        total_orders: sortedPurchases.length,
        total_amount: sortedPurchases
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0),
        successful_orders: sortedPurchases.filter(p => p.status === 'completed').length,
        total_quantity: sortedPurchases
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.quantity, 0)
      }
    });

  } catch (error) {
    console.error('获取购买记录失败:', error);
    return NextResponse.json(
      { error: '获取购买记录失败' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const user = await getCurrentUnifiedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: '缺少订单ID' },
        { status: 400 }
      );
    }

    // TODO: 实现订单详情查询
    // const orderDetails = await getOrderDetails(orderId, user.id);
    
    // 模拟订单详情
    const order = mockPurchases.find(p => p.id === orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: '订单不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        paymentDetails: {
          transactionId: `tx_${order.id}_${Date.now()}`,
          paymentTime: order.createdAt,
          refundable: order.status === 'completed' && 
            new Date().getTime() - new Date(order.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 // 7天内可退款
        }
      }
    });

  } catch (error) {
    console.error('获取订单详情失败:', error);
    return NextResponse.json(
      { error: '获取订单详情失败' },
      { status: 500 }
    );
  }
} 