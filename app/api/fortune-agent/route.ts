import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // 临时开关：未启用时直接返回占位响应，避免引入未安装的 langchain 依赖导致构建失败
    if (process.env.ENABLE_FORTUNE_AGENT !== 'true') {
      return NextResponse.json({
        success: true,
        data: {
          answer: 'Fortune Agent is currently disabled.',
          sources: [],
        }
      })
    }

    // 获取用户认证
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    // 解析请求
    const { query, category = 'general' } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: '请提供查询内容' },
        { status: 400 }
      )
    }

    // 动态导入，避免在未启用时打包依赖
    const { fortuneAgent } = await (eval('import')('@/lib/langchain/fortune-agent'))

    const result = await fortuneAgent({
      query,
      category,
      userId: user?.id
    })

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Fortune Agent Error:', error)
    return NextResponse.json(
      { error: '命理分析失败，请稍后重试' },
      { status: 500 }
    )
  }
}
