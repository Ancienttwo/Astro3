import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    if (process.env.ENABLE_FORTUNE_AGENT !== 'true') {
      return NextResponse.json({ success: true, data: [] })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const category = searchParams.get('category') || undefined
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (!q) {
      return NextResponse.json({ success: false, error: '缺少搜索关键词' }, { status: 400 })
    }

    const tagsParam = searchParams.get('tags') || ''
    const tags = tagsParam ? tagsParam.split(',').map(t => t.trim()).filter(Boolean) : []
    const { searchKnowledge } = await (eval('import')('@/lib/services/knowledge-service'))
    let results = await searchKnowledge(q, category, limit * 3)
    if (tags.length) {
      results = (results || []).filter((r: any) => {
        const t = (r.metadata?.tags as string[] | undefined) || []
        return tags.every(tag => t.includes(tag))
      })
    }
    results = results.slice(0, limit)
    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('Knowledge search error:', error)
    return NextResponse.json({ success: false, error: '搜索失败' }, { status: 500 })
  }
}
