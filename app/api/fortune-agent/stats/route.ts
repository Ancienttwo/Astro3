import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    if (process.env.ENABLE_FORTUNE_AGENT !== 'true') {
      return NextResponse.json({ success: true, data: {
        total_queries: 0,
        daily_queries: 0,
        popular_categories: [],
        average_response_time: null,
        token_usage: { total: 0, daily: 0 }
      } })
    }

    const { getUsageStats } = await (eval('import')('@/lib/services/usage-tracker'))
    const stats = await getUsageStats()
    return NextResponse.json({ success: true, data: stats })
  } catch (error) {
    console.error('Fortune stats error:', error)
    return NextResponse.json({ success: false, error: '统计获取失败' }, { status: 500 })
  }
}

