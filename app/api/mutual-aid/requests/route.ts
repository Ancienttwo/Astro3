import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { getCurrentUnifiedUser } from '@/lib/auth'

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
    // 使用现有认证检查
    const currentUser = await getCurrentUnifiedUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

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
      return NextResponse.json({ error: '获取请求列表失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: requests || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('获取请求列表错误:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

/**
 * POST /api/mutual-aid/requests - 提交互助请求
 */
export async function POST(request: NextRequest) {
  try {
    // 使用现有认证检查
    const currentUser = await getCurrentUnifiedUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: '需要登录' }, { status: 401 })
    }

    // 验证输入数据
    const body = await request.json()
    const validatedData = SubmitRequestSchema.parse(body)

    // 检查简单的金额限制
    const amount = parseFloat(validatedData.amount)
    if (amount > 1000) {
      return NextResponse.json({ 
        error: '请求金额不能超过1000',
        maxAmount: 1000
      }, { status: 400 })
    }

    // 创建互助请求
    const { data: newRequest, error: insertError } = await supabase
      .from('mutual_aid_requests')
      .insert({
        requester_id: currentUser.id,
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
      return NextResponse.json({ error: '提交请求失败' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newRequest,
      message: '互助请求已成功提交'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: '请求数据格式错误',
        details: error.errors
      }, { status: 400 })
    }

    console.error('提交互助请求错误:', error)
    return NextResponse.json({ error: '提交请求失败' }, { status: 500 })
  }
}