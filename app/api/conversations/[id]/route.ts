import { NextRequest, NextResponse } from 'next/server'
import { ChatService } from '@/lib/services/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const conversationId = resolvedParams.id

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversation ID' },
        { status: 400 }
      )
    }

    // 删除对话（会级联删除所有消息）
    await ChatService.deleteConversation(conversationId)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('删除对话失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const conversationId = resolvedParams.id

    if (!conversationId) {
      return NextResponse.json(
        { error: 'Missing conversation ID' },
        { status: 400 }
      )
    }

    // 获取对话的所有消息
    const messages = await ChatService.getConversationMessages(conversationId)

    return NextResponse.json(messages)

  } catch (error) {
    console.error('获取对话消息失败:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 