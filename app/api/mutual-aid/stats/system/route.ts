import { NextResponse } from 'next/server'
import { OptimizedQueries } from '@/lib/optimized-queries'

/**
 * GET /api/mutual-aid/stats/system
 * 返回系统统计（真实数据源：数据库视图 + 缓存）
 */
export async function GET() {
  try {
    const overview = await OptimizedQueries.getSystemOverview()
    return NextResponse.json({ success: true, data: overview })
  } catch (error) {
    console.error('System stats API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system stats' },
      { status: 500 }
    )
  }
}
