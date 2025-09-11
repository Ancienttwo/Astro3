import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseEther } from 'viem'
import { bsc } from 'viem/chains'

const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org/'
const RECIPIENT_ADDRESS = '0xa047FFa6923BfE296B633A7b88f37dFcaAB93Cf3'

export async function POST(request: NextRequest) {
  try {
    const { txHash, planType, amount, userEmail } = await request.json()

    if (!txHash || !planType || !amount || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // 连接到BSC网络（viem）
    const client = createPublicClient({ chain: bsc, transport: http(BSC_RPC_URL) })
    
    // 获取交易详情
    const transaction = await client.getTransaction({ hash: txHash as `0x${string}` })
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // 验证交易状态
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` })
    
    if (!receipt || receipt.status !== 'success') {
      return NextResponse.json(
        { error: 'Transaction failed or pending' },
        { status: 400 }
      )
    }

    // 验证收款地址
    if ((transaction.to as string | null)?.toLowerCase() !== RECIPIENT_ADDRESS.toLowerCase()) {
      return NextResponse.json(
        { error: 'Invalid recipient address' },
        { status: 400 }
      )
    }

    // 验证金额 (BNB支付)
    const expectedAmountWei = parseEther(amount)
    if (transaction.value < expectedAmountWei) {
      return NextResponse.json(
        { error: 'Insufficient payment amount' },
        { status: 400 }
      )
    }

    // 验证交易时间（防止重放攻击）
    const currentTime = Math.floor(Date.now() / 1000)
    const transactionTime = (await client.getBlock({ blockNumber: receipt.blockNumber }))?.timestamp || 0
    
    if (currentTime - transactionTime > 3600) { // 1小时内的交易
      return NextResponse.json(
        { error: 'Transaction too old' },
        { status: 400 }
      )
    }

    // TODO: 检查交易是否已经被处理过（防止重复处理）
    // 这里需要查询数据库，检查txHash是否已存在

    // TODO: 激活用户订阅
    // 这里需要调用订阅激活逻辑，更新用户的会员状态

    // 记录支付成功
    console.log(`Web3 payment verified: ${txHash} for user ${userEmail}, plan: ${planType}, amount: ${amount} BNB`)

    // TODO: 保存支付记录到数据库
    // const paymentRecord = {
    //   txHash,
    //   userEmail,
    //   planType,
    //   amount,
    //   paymentMethod: 'web3_bnb',
    //   status: 'completed',
    //   verifiedAt: new Date()
    // }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      txHash,
      planType,
      amount
    })

  } catch (error) {
    console.error('Web3 payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
