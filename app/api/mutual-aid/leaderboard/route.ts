import { NextRequest, NextResponse } from 'next/server'
import { OptimizedQueries } from '@/lib/optimized-queries'

/**
 * GET /api/mutual-aid/leaderboard
 * 使用物化视图 + 缓存获取排行榜（真实数据源）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const limit = Math.max(parseInt(searchParams.get('limit') || '10', 10), 1)
    const offset = (page - 1) * limit
    const type = request.headers.get('X-Leaderboard-Type') || 'total'

    // 仅 total 分类生效；其他类型可扩展不同视图
    const result = await OptimizedQueries.getLeaderboard(type, limit, offset)
    const rows = (result?.data as any[]) || []

    // 无法轻易获取总数，这里通过是否满页判断 hasNext
    const hasNext = rows.length === limit

    return NextResponse.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: undefined,
        totalPages: undefined,
        hasNext,
        hasPrev: page > 1
      },
      type
    })
  } catch (error) {
    console.error('Leaderboard API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
