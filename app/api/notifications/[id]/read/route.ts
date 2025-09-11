import { NextRequest, NextResponse } from 'next/server'

/**
 * PATCH /api/notifications/[id]/read
 * 将通知标记为已读（占位实现，不做持久化）
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Missing notification id' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true, message: '已标记为已读', id })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}

