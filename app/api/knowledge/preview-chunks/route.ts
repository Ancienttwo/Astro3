import { NextRequest, NextResponse } from 'next/server'
import { parsePdfBuffer } from '@/lib/services/pdf-parser'
import { cleanChineseText, splitChineseChunks } from '@/lib/services/chinese-chunker'

function toBool(v: any, def = false) {
  if (v === undefined || v === null || v === '') return def
  if (typeof v === 'boolean') return v
  const s = String(v).toLowerCase()
  return s === '1' || s === 'true' || s === 'yes'
}

export async function POST(request: NextRequest) {
  // Prevent static optimization from trying to execute pdf parsing during build
  // @ts-expect-error next-dynamic-flag
  (exports as any).dynamic = 'force-dynamic'
  try {
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const form = await request.formData()
      const file = form.get('file') as unknown as File | null
      const mode = (form.get('mode') as string) || 'auto'
      const maxChars = parseInt(String(form.get('maxChars') ?? '2800'), 10)
      const overlapChars = parseInt(String(form.get('overlapChars') ?? '120'), 10)
      const minChars = parseInt(String(form.get('minChars') ?? '200'), 10)
      const removeHeadersFooters = toBool(form.get('removeHeadersFooters'), true)

      if (!file) return NextResponse.json({ success: false, error: '缺少文件' }, { status: 400 })
      const arrayBuf = await file.arrayBuffer()
      const buf = Buffer.from(arrayBuf)

      let text = ''
      let detected = mode
      if (mode === 'pdf' || (mode === 'auto' && ((file as any).name?.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf'))) {
        const parsed = await parsePdfBuffer(buf)
        text = cleanChineseText(parsed.pages, { removeHeadersFooters })
        detected = 'pdf'
      } else {
        text = cleanChineseText([buf.toString('utf-8')], { removeHeadersFooters: false })
        detected = 'txt'
      }

      const chunks = splitChineseChunks(text, { maxChars, overlapChars, minChars })
      const stats = summarizeChunks(chunks)
      return NextResponse.json({ success: true, data: { mode: detected, ...stats } })
    }

    // JSON body: { text, maxChars, overlapChars, minChars }
    const { text, maxChars = 2800, overlapChars = 120, minChars = 200, removeHeadersFooters = false } = await request.json()
    if (!text) return NextResponse.json({ success: false, error: '缺少文本' }, { status: 400 })
    const cleaned = cleanChineseText([text], { removeHeadersFooters })
    const chunks = splitChineseChunks(cleaned, { maxChars, overlapChars, minChars })
    const stats = summarizeChunks(chunks)
    return NextResponse.json({ success: true, data: { mode: 'txt', ...stats } })
  } catch (error) {
    console.error('Preview chunks error:', error)
    return NextResponse.json({ success: false, error: '预览失败' }, { status: 500 })
  }
}

function summarizeChunks(chunks: string[]) {
  const items = chunks.map((c, i) => ({
    index: i,
    length: c.length,
    tokens: Math.ceil(c.length * 0.25),
    preview: c.slice(0, 160),
    content: c
  }))
  const totalChars = chunks.reduce((s, c) => s + c.length, 0)
  const totalTokens = Math.ceil(totalChars * 0.25)
  return { chunkCount: chunks.length, totalChars, totalTokens, chunks: items }
}
