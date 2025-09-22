import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { resolveAuth } from '@/lib/auth-adapter'
import { ok, err } from '@/lib/api-response'
import { invalidateByExactPath } from '@/lib/edge/invalidate'
import { checkRateLimitRedis } from '@/lib/rate-limit-redis'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 验证模式
const SubmitRequestSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,18})?$/, '金额格式无效'),
  reason: z.string().min(50, '申请理由至少需要50字符').max(1000, '申请理由不能超过1000字符'),
  severityLevel: z.number().int().min(1).max(10),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['financial', 'medical', 'education', 'family', 'disaster', 'other']),
  supportingDocuments: z.array(z.string()).optional(),
  publicMessage: z.string().max(300).optional(),
})

/**
 * GET /api/mutual-aid/requests - 获取互助请求列表
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAuth(request)
    if (!auth.ok || !auth.id) return err(401, 'UNAUTHORIZED', '需要登录')

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10')))
    const offset = (page - 1) * limit

    // 直接查询requests表，利用现有数据库结构
    const { data: requests, error, count } = await supabase
      .from('mutual_aid_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('获取请求列表失败:', error)
      return err(500, 'LIST_FAILED', '获取请求列表失败')
    }

    return ok(requests || [], {
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('获取请求列表错误:', error)
    return err(500, 'INTERNAL_ERROR', '服务器错误')
  }
}

/**
 * POST /api/mutual-aid/requests - 提交互助请求
 */
export async function POST(request: NextRequest) {
  try {
    // 限流：防止重复刷提交
    const rl = await checkRateLimitRedis(request as any, {
      maxAttempts: 10,
      windowMs: 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
      bucket: 'mutual_aid_request_post'
    })
    if (!rl.allowed) return err(429, 'RATE_LIMITED', 'Too Many Requests')
    const auth = await resolveAuth(request)
    if (!auth.ok || !auth.id) return err(401, 'UNAUTHORIZED', '需要登录')

    // 验证输入数据
    const body = await request.json()
    const validatedData = SubmitRequestSchema.parse(body)

    // 检查简单的金额限制
    const amount = parseFloat(validatedData.amount)
    if (amount > 1000) {
      return err(400, 'AMOUNT_LIMIT', '请求金额不能超过1000', { maxAmount: 1000 })
    }

    // 创建互助请求
    const { data: newRequest, error: insertError } = await supabase
      .from('mutual_aid_requests')
      .insert({
        requester_id: auth.id!,
        amount: validatedData.amount,
        reason: validatedData.reason,
        category: validatedData.category,
        severity_level: validatedData.severityLevel,
        urgency: validatedData.urgency,
        public_message: validatedData.publicMessage,
        supporting_documents: validatedData.supportingDocuments || [],
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) {
      console.error('创建请求失败:', insertError)
      return err(500, 'CREATE_FAILED', '提交请求失败')
    }

    try {
      await invalidateByExactPath('/api/mutual-aid/requests','user')
      await invalidateByExactPath('/api/mutual-aid/requests/my','user')
      await invalidateByExactPath('/api/mutual-aid/validations','user')
      await invalidateByExactPath('/api/mutual-aid/user/stats','user')
    } catch {}

    return ok(newRequest, { message: '互助请求已成功提交' }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return err(400, 'INVALID_PAYLOAD', '请求数据格式错误', error.errors)
    }

    console.error('提交互助请求错误:', error)
    return err(500, 'INTERNAL_ERROR', '提交请求失败')
  }
}
