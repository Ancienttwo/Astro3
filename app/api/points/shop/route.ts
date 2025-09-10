import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyAuthToken } from '@/lib/api-auth';
import { ethers } from 'ethers';

// 获取积分商城商品列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user_type') || 'both'; // 'web2', 'web3', 'both'

    // 获取商品列表
    let query = supabaseAdmin
      .from('points_shop_items')
      .select('*')
      .eq('is_active', true);

    if (userType !== 'both') {
      query = query.in('available_for', [userType, 'both']);
    }

    const { data: items, error } = await query.order('points_cost', { ascending: true });

    if (error) {
      console.error('Error fetching shop items:', error);
      return NextResponse.json({ error: 'Failed to fetch shop items' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        items: items || [],
        categories: {
          ai_reports: items?.filter(item => item.item_type === 'ai_reports') || [],
          premium_features: items?.filter(item => item.item_type === 'premium_features') || [],
          airdrop_boost: items?.filter(item => item.item_type === 'airdrop_boost') || [],
          nft_badge: items?.filter(item => item.item_type === 'nft_badge') || []
        }
      }
    });

  } catch (error) {
    console.error('Shop API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 兑换积分商品
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity = 1, userType } = body;

    if (!itemId || !['web2', 'web3'].includes(userType)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    // 获取商品信息
    const { data: item, error: itemError } = await supabaseAdmin
      .from('points_shop_items')
      .select('*')
      .eq('id', itemId)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      return NextResponse.json({ error: 'Item not found or inactive' }, { status: 404 });
    }

    // 检查商品是否适用于用户类型
    if (item.available_for !== 'both' && item.available_for !== userType) {
      return NextResponse.json({ error: 'Item not available for this user type' }, { status: 403 });
    }

    const totalCost = item.points_cost * quantity;
    let userIdentifier: string;
    let currentBalance: number;

    if (userType === 'web2') {
      // Web2用户验证
      const authResult = await verifyAuthToken(request);
      if (!authResult.success || !authResult.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      userIdentifier = authResult.user.id;

      // Web2用户暂时没有积分系统，直接返回错误
      return NextResponse.json({ 
        error: 'Web2 users do not have a points system. They receive AI reports directly from check-ins.' 
      }, { status: 400 });

    } else {
      // Web3用户验证
      const web3UserHeader = request.headers.get('X-Web3-User');
      if (!web3UserHeader) {
        return NextResponse.json({ error: 'Web3 user header missing' }, { status: 401 });
      }

      const web3User = JSON.parse(decodeURIComponent(atob(web3UserHeader)));
      const walletAddress = web3User.walletAddress?.toLowerCase();

      if (!walletAddress || !ethers.isAddress(walletAddress)) {
        return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
      }

      userIdentifier = walletAddress;

      // 获取Web3用户积分余额
      const { data: pointsData, error: pointsError } = await supabaseAdmin
        .from('user_points_web3')
        .select('chain_points_balance')
        .eq('wallet_address', walletAddress)
        .single();

      if (pointsError || !pointsData) {
        return NextResponse.json({ error: 'User points data not found' }, { status: 404 });
      }

      currentBalance = pointsData.chain_points_balance;
    }

    // 检查积分余额
    if (currentBalance < totalCost) {
      return NextResponse.json({ 
        error: `Insufficient points. Required: ${totalCost}, Available: ${currentBalance}` 
      }, { status: 400 });
    }

    // 检查库存限制
    if (item.stock_limit !== null) {
      const { count: soldCount } = await supabaseAdmin
        .from('points_redemptions')
        .select('*', { count: 'exact' })
        .eq('item_id', itemId)
        .eq('redemption_status', 'completed');

      if ((soldCount || 0) + quantity > item.stock_limit) {
        return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
      }
    }

    // 检查用户购买限制
    if (item.purchase_limit_per_user !== null) {
      const { count: userPurchaseCount } = await supabaseAdmin
        .from('points_redemptions')
        .select('*', { count: 'exact' })
        .eq('item_id', itemId)
        .eq('user_identifier', userIdentifier)
        .eq('user_type', userType)
        .eq('redemption_status', 'completed');

      if ((userPurchaseCount || 0) + quantity > item.purchase_limit_per_user) {
        return NextResponse.json({ error: 'Purchase limit exceeded' }, { status: 400 });
      }
    }

    // 执行兑换
    const redemptionResult = await processRedemption({
      userIdentifier,
      userType,
      item,
      quantity,
      totalCost
    });

    if (!redemptionResult.success) {
      return NextResponse.json({ error: redemptionResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        redemptionId: redemptionResult.redemptionId,
        itemName: item.item_name,
        pointsSpent: totalCost,
        quantity,
        newBalance: redemptionResult.newBalance,
        deliveryDetails: redemptionResult.deliveryDetails
      }
    });

  } catch (error) {
    console.error('Redemption API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// 处理兑换逻辑
async function processRedemption({
  userIdentifier,
  userType,
  item,
  quantity,
  totalCost
}: {
  userIdentifier: string;
  userType: string;
  item: any;
  quantity: number;
  totalCost: number;
}) {
  try {
    // 消费积分
    if (userType === 'web3') {
      const { data: consumeResult, error: consumeError } = await supabaseAdmin.rpc(
        'consume_web3_points',
        {
          p_wallet_address: userIdentifier,
          p_points_amount: totalCost,
          p_item_type: item.item_type,
          p_item_description: item.item_name
        }
      );

      if (consumeError) {
        return { success: false, error: 'Failed to consume points' };
      }
    }

    // 记录兑换
    const { data: redemption, error: redemptionError } = await supabaseAdmin
      .from('points_redemptions')
      .insert({
        user_identifier: userIdentifier,
        user_type: userType,
        item_id: item.id,
        points_spent: totalCost,
        quantity,
        redemption_status: 'completed',
        item_delivered: true,
        delivery_details: {
          item_type: item.item_type,
          item_value: item.item_value,
          delivered_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (redemptionError) {
      return { success: false, error: 'Failed to record redemption' };
    }

    // 发放物品
    const deliveryResult = await deliverItem(userIdentifier, userType, item, quantity);

    // 获取新余额
    let newBalance = 0;
    if (userType === 'web3') {
      const { data: balanceData } = await supabaseAdmin
        .from('user_points_web3')
        .select('chain_points_balance')
        .eq('wallet_address', userIdentifier)
        .single();
      
      newBalance = balanceData?.chain_points_balance || 0;
    }

    return {
      success: true,
      redemptionId: redemption.id,
      newBalance,
      deliveryDetails: deliveryResult
    };

  } catch (error) {
    console.error('Process redemption error:', error);
    return { success: false, error: 'Internal processing error' };
  }
}

// 发放物品
async function deliverItem(userIdentifier: string, userType: string, item: any, quantity: number) {
  try {
    const itemValue = item.item_value;

    switch (item.item_type) {
      case 'ai_reports':
        // 发放AI报告次数
        const reportsCount = (itemValue.reports || 1) * quantity;
        
        if (userType === 'web3') {
          // 为Web3用户增加付费报告次数
          const { error: grantError } = await supabaseAdmin.rpc('grant_paid_reports_to_web3_user', {
            p_wallet_address: userIdentifier,
            p_reports_count: reportsCount
          });
          
          if (grantError) {
            console.error('Error granting reports to Web3 user:', grantError);
            throw new Error('Failed to grant reports to Web3 user');
          }
        }
        
        return {
          type: 'ai_reports',
          reports_granted: reportsCount,
          message: `Successfully granted ${reportsCount} AI report credits`
        };

      case 'airdrop_boost':
        // 增加空投权重 (仅Web3用户)
        if (userType === 'web3' && itemValue.weight_boost) {
          const weightBoost = itemValue.weight_boost * 1000; // 转换为合约精度
          
          await supabaseAdmin.rpc('boost_airdrop_weight', {
            p_wallet_address: userIdentifier,
            p_weight_increase: weightBoost
          });
          
          return {
            type: 'airdrop_boost',
            weight_boost: itemValue.weight_boost,
            message: `Successfully boosted airdrop weight by ${itemValue.weight_boost}`
          };
        }
        break;

      case 'nft_badge':
        // NFT徽章发放 (仅Web3用户)
        if (userType === 'web3') {
          // 这里可以集成NFT铸造逻辑
          return {
            type: 'nft_badge',
            nft_type: itemValue.nft_type,
            message: `NFT badge ${itemValue.nft_type} will be minted to your wallet`
          };
        }
        break;

      case 'premium_features':
        // 高级功能解锁 (主要针对Web2用户)
        return {
          type: 'premium_features',
          features: itemValue.features,
          duration_days: itemValue.duration_days,
          message: `Premium features unlocked for ${itemValue.duration_days} days`
        };

      default:
        return {
          type: 'unknown',
          message: 'Item delivered successfully'
        };
    }

    return {
      type: item.item_type,
      message: 'Item delivered successfully'
    };

  } catch (error) {
    console.error('Deliver item error:', error);
    return {
      type: 'error',
      message: 'Failed to deliver item'
    };
  }
}