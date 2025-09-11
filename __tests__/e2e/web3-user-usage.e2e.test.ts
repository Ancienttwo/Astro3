/** @jest-environment node */

import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { config as dotenvConfig } from 'dotenv'

// 加载真实环境变量（覆盖 jest.setup.js 里可能注入的占位符）
dotenvConfig({ path: path.resolve(process.cwd(), '.env.local') })

/**
 * E2E 数据流测试：Web3 用户登录后的数据库通信与恢复逻辑
 *
 * 覆盖点：
 * - 使用 Web3 风格 JWT（camelCase walletAddress）访问 /api/user-usage
 * - 缺失记录自动创建（恢复逻辑）
 * - 删除后再次 GET 自动恢复
 * - 简单更新（PUT）生效
 */

function randomWalletAddress(): string {
  // 生成 20 字节随机十六进制并前缀 0x 作为以太坊地址
  const hex = crypto.randomBytes(20).toString('hex')
  return `0x${hex}`.toLowerCase()
}

function buildBearer(jwtToken: string): HeadersInit {
  return { Authorization: `Bearer ${jwtToken}` }
}

describe('E2E: Web3 user -> /api/user-usage -> DB create & recovery', () => {
  let api: { GET: Function; PUT: Function }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const jwtSecret = process.env.JWT_SECRET

  if (!supabaseUrl || !serviceKey || !jwtSecret) {
    // 让测试直观报错，便于排查环境问题
    throw new Error('Missing required env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / JWT_SECRET')
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceKey)

  const wallet = randomWalletAddress()
  const virtualEmail = `${wallet}@web3.astrozi.app`

  // 使用 camelCase 的 walletAddress 声明，验证后端兼容性
  const web3Jwt = jwt.sign(
    {
      userId: wallet, // 兜底 id
      walletAddress: wallet,
      email: virtualEmail,
      authType: 'web3',
    },
    jwtSecret,
    { algorithm: 'HS256', expiresIn: '10m' }
  )

  async function deleteUserUsageByWallet(addr: string) {
    await supabaseAdmin.from('user_usage').delete().eq('wallet_address', addr.toLowerCase())
  }

  beforeAll(async () => {
    // 动态加载路由，确保在dotenv之后
    api = await import('@/app/api/user-usage/route')
    // 确保初始状态干净
    await deleteUserUsageByWallet(wallet)
  })

  afterAll(async () => {
    // 清理测试数据
    await deleteUserUsageByWallet(wallet)
  })

  it('GET should create user_usage on first access (recovery) and return data', async () => {
    const req = new NextRequest(
      new Request('http://localhost/api/user-usage', { headers: buildBearer(web3Jwt) })
    )
    const res = await api.GET(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
    // 关键字段校验
    expect(body.data.user_type).toBe('web3')
    expect((body.data.wallet_address || '').toLowerCase()).toBe(wallet.toLowerCase())
  })

  it('DELETE row then GET again should recreate (recovery)', async () => {
    // 删除记录
    await deleteUserUsageByWallet(wallet)

    // 触发恢复逻辑
    const req = new NextRequest(
      new Request('http://localhost/api/user-usage', { headers: buildBearer(web3Jwt) })
    )
    const res = await api.GET(req)
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data).toBeDefined()
    expect((body.data.wallet_address || '').toLowerCase()).toBe(wallet.toLowerCase())
  })

  it('PUT should update a numeric field (chatbot_used +1)', async () => {
    // 先获取当前值
    const getReq = new NextRequest(
      new Request('http://localhost/api/user-usage', { headers: buildBearer(web3Jwt) })
    )
    const getRes = await api.GET(getReq)
    const getBody = await getRes.json()

    const currentUsed = Number(getBody?.data?.chatbot_used ?? 0)

    const payload = { updates: { chatbot_used: currentUsed + 1 } }
    const putReq = new NextRequest(
      new Request('http://localhost/api/user-usage', {
        method: 'PUT',
        headers: { ...buildBearer(web3Jwt), 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
    )

    const putRes = await api.PUT(putReq)
    expect(putRes.status).toBe(200)
    const putBody = await putRes.json()
    expect(putBody.success).toBe(true)
    expect(Number(putBody?.data?.chatbot_used)).toBe(currentUsed + 1)
  })
})
