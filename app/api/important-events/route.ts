import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // 获取认证token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 获取用户的重要事件记录
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('important_events')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // 用户档案不存在，返回空数组
        return NextResponse.json({ 
          success: true, 
          events: [] 
        })
      }
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      events: profile.important_events || [] 
    })
  } catch (error) {
    console.error('获取重要事件记录失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取认证token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 获取请求体数据
    const body = await request.json()
    const { title, description, event_date, event_type } = body

    if (!title || !event_date) {
      return NextResponse.json({ error: 'Title and event_date are required' }, { status: 400 })
    }

    // 生成事件ID
    const eventId = Date.now().toString()

    // 构造新事件对象
    const newEvent = {
      id: eventId,
      title,
      description: description || '',
      event_date,
      event_type: event_type || 'important',
      created_at: new Date().toISOString()
    }

    // 获取当前事件列表
    const { data: profile, error: getError } = await supabase
      .from('user_profiles')
      .select('important_events')
      .eq('user_id', user.id)
      .single()

    if (getError && getError.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    // 如果用户档案不存在，先创建档案
    if (getError && getError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          important_events: [newEvent]
        })

      if (insertError) {
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }
    } else {
      // 更新现有档案
      const currentEvents = profile.important_events || []
      const updatedEvents = [...currentEvents, newEvent]

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ important_events: updatedEvents })
        .eq('user_id', user.id)

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update events' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      event: newEvent 
    })
  } catch (error) {
    console.error('添加重要事件失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 获取认证token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    
    // 验证用户身份
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 获取要删除的事件ID
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    // 获取当前事件列表
    const { data: profile, error: getError } = await supabase
      .from('user_profiles')
      .select('important_events')
      .eq('user_id', user.id)
      .single()

    if (getError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 过滤掉要删除的事件
    const currentEvents = profile.important_events || []
    const filteredEvents = currentEvents.filter((event: any) => event.id !== eventId)

    // 更新数据库
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ important_events: filteredEvents })
      .eq('user_id', user.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      deletedEventId: eventId 
    })
  } catch (error) {
    console.error('删除重要事件失败:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 