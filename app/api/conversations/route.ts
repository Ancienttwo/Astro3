import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    console.log(`📱 获取用户 ${userId} 的对话列表`)

    // 获取用户的所有对话
    const { data: conversations, error: conversationsError } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (conversationsError) {
      console.error('获取对话列表失败:', conversationsError)
      return NextResponse.json([], { status: 200 }) // 返回空数组而不是错误
    }

    if (!conversations || conversations.length === 0) {
      return NextResponse.json([])
    }
    
    // 为每个对话添加消息统计和最后一条消息
    const conversationsWithStats = await Promise.all(
      conversations.map(async (conversation) => {
        try {
          const { data: messages, error: messagesError } = await supabase
            .from('chat_messages')
            .select('content, is_user, created_at')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)

          if (messagesError) {
            console.error(`获取对话 ${conversation.id} 消息失败:`, messagesError)
            return {
              ...conversation,
              message_count: 0,
              last_message: '无法加载消息',
              user_message_count: 0
            }
          }

          const allMessages = await supabase
            .from('chat_messages')
            .select('is_user')
            .eq('conversation_id', conversation.id)

          const totalCount = allMessages.data?.length || 0
          const userCount = allMessages.data?.filter(msg => msg.is_user).length || 0
          const lastMessage = messages?.[0]
          
          return {
            ...conversation,
            message_count: totalCount,
            last_message: lastMessage?.content?.substring(0, 100) + (lastMessage?.content?.length > 100 ? '...' : '') || '暂无消息',
            user_message_count: userCount
          }
        } catch (error) {
          console.error(`Error getting stats for conversation ${conversation.id}:`, error)
          return {
            ...conversation,
            message_count: 0,
            last_message: '无法加载消息',
            user_message_count: 0
          }
        }
      })
    )

    return NextResponse.json(conversationsWithStats)

  } catch (error) {
    console.error('获取对话列表失败:', error)
    // 返回空数组而不是错误，确保前端可以正常显示
    return NextResponse.json([])
  }
} 