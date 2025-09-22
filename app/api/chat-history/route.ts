import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/server/db'

const supabaseAdmin = getSupabaseAdminClient()

// 获取聊天历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const masterType = searchParams.get('masterType')
    const limit = searchParams.get('limit') || '5'

    if (!userId || !masterType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 获取最近的聊天记录
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .select('*')
      .eq('user_id', userId)
      .eq('agent_type', masterType)
      .order('created_at', { ascending: true })
      .limit(parseInt(limit))

    if (error) {
      console.error('获取聊天历史失败:', error)
      return NextResponse.json(
        { error: '获取聊天历史失败' },
        { status: 500 }
      )
    }

    console.log(`📚 加载${data?.length || 0}条${masterType}聊天历史`)

    return NextResponse.json({
      messages: data || [],
      success: true
    })

  } catch (error) {
    console.error('聊天历史API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 保存聊天消息
export async function POST(request: NextRequest) {
  try {
    // 获取认证token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 })
    }

    const { 
      userId, 
      masterType, 
      messageId, 
      content, 
      role, 
      conversationId 
    } = await request.json()

    if (!userId || !masterType || !messageId || !content || !role) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证用户ID匹配
    if (userId !== user.id) {
      return NextResponse.json({ error: '用户ID不匹配' }, { status: 403 })
    }

    // 保存消息到数据库 - 使用管理员客户端绕过RLS
    const { data, error } = await supabaseAdmin
      .from('chat_history')
      .insert({
        user_id: userId,
        agent_type: masterType,
        message_type: role,
        content: content,
        conversation_id: conversationId
      })
      .select()

    if (error) {
      console.error('保存聊天消息失败:', error)
      return NextResponse.json(
        { error: '保存聊天消息失败' },
        { status: 500 }
      )
    }

    console.log(`💾 保存${role}消息到${masterType}历史记录`)

    return NextResponse.json({
      message: data?.[0] || null,
      success: true
    })

  } catch (error) {
    console.error('保存聊天消息API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

// 清空聊天历史
export async function DELETE(request: NextRequest) {
  try {
    // 获取认证token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未认证' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const masterType = searchParams.get('masterType')

    if (!userId || !masterType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 验证用户ID匹配
    if (userId !== user.id) {
      return NextResponse.json({ error: '用户ID不匹配' }, { status: 403 })
    }

    const { error } = await supabaseAdmin
      .from('chat_history')
      .delete()
      .eq('user_id', userId)
      .eq('agent_type', masterType)

    if (error) {
      console.error('清空聊天历史失败:', error)
      return NextResponse.json(
        { error: '清空聊天历史失败' },
        { status: 500 }
      )
    }

    console.log(`🗑️ 清空${masterType}聊天历史`)

    return NextResponse.json({
      success: true
    })

  } catch (error) {
    console.error('清空聊天历史API错误:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 
