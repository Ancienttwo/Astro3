import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    if (process.env.ENABLE_FORTUNE_AGENT !== 'true') {
      return NextResponse.json({ success: false, error: 'Fortune Agent disabled' }, { status: 403 })
    }

    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    const role = (user as any)?.app_metadata?.role
    if (!user || role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const form = await request.formData()
    const file = form.get('file') as unknown as File | null
    const category = (form.get('category') as string) || ''
    const source = (form.get('source') as string) || ''
    const metaRaw = (form.get('metadata') as string) || '{}'
    let metadata: Record<string, any> = {}
    try { metadata = JSON.parse(metaRaw) } catch {}

    if (!file || !category) {
      return NextResponse.json({ success: false, error: '缺少文件或分类' }, { status: 400 })
    }

    const arrayBuf = await file.arrayBuffer()
    const buf = Buffer.from(arrayBuf)
    const filename = (file as any).name || 'upload'
    const lower = filename.toLowerCase()
    const isPdf = lower.endsWith('.pdf') || file.type === 'application/pdf'
    const isTxt = lower.endsWith('.txt') || file.type === 'text/plain'

    if (!isPdf && !isTxt) {
      return NextResponse.json({ success: false, error: '仅支持 PDF 与 TXT' }, { status: 400 })
    }

    const mod = await (eval('import')('@/lib/services/knowledge-service'))
    const result = isPdf
      ? await mod.importFromPdfBuffer(category, buf, source || filename, metadata)
      : await mod.importFromTxtBuffer(category, buf, source || filename, metadata)

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Knowledge upload error:', error)
    return NextResponse.json({ success: false, error: '上传处理失败' }, { status: 500 })
  }
}

