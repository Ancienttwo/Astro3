import { createClient } from '@supabase/supabase-js'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { SiliconFlowEmbeddings } from '@/lib/langchain/fortune-agent'
import { parsePdfBuffer } from './pdf-parser'
import { cleanChineseText, splitChineseChunks } from './chinese-chunker'
import pLimit from 'p-limit'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['。', '！', '？', '\n\n', '\n', ' ', '']
})

const embeddings = new SiliconFlowEmbeddings()

export async function searchKnowledge(q: string, category?: string, limit: number = 10) {
  if (!q) throw new Error('Query cannot be empty')
  const queryEmbedding = await embeddings.embedQuery(q)

  const { data, error } = await supabase.rpc('match_fortune_documents', {
    query_embedding: queryEmbedding as unknown as number[],
    match_count: limit,
    filter_category: category ?? null
  })

  if (error) throw error
  return data || []
}

export async function importKnowledge(category: string, content: string, metadata: Record<string, any> = {}) {
  if (!category || !content) throw new Error('Category and content are required')

  const docs = await splitter.splitText(content)
  let inserted = 0
  for (const chunk of docs) {
    const embedding = await embeddings.embedQuery(chunk)
    const { error } = await supabase.from('fortune_knowledge').insert({
      category,
      content: chunk,
      embedding,
      metadata
    })
    if (error) throw error
    inserted += 1
  }
  return { inserted }
}

// High-quality Chinese ingestion from plain text (after cleaning externally)
export async function importChineseText(params: {
  category: string
  text: string
  source?: string
  filetype?: 'pdf' | 'txt'
  extraMeta?: Record<string, any>
  chunkOptions?: { maxChars?: number; overlapChars?: number; minChars?: number }
}) {
  const { category, text, source, filetype, extraMeta, chunkOptions } = params
  if (!category || !text) throw new Error('Category and text are required')

  const chunks = splitChineseChunks(text, {
    maxChars: chunkOptions?.maxChars ?? 2800,
    overlapChars: chunkOptions?.overlapChars ?? 120,
    minChars: chunkOptions?.minChars ?? 200
  })

  const limit = pLimit(4)
  let inserted = 0
  await Promise.all(chunks.map((chunk, index) => limit(async () => {
    const embedding = await embeddings.embedQuery(chunk)
    const { error } = await supabase.from('fortune_knowledge').insert({
      category,
      content: chunk,
      embedding,
      metadata: {
        ...(extraMeta || {}),
        source: source || extraMeta?.source,
        filetype: filetype || extraMeta?.filetype,
        chunk_index: index,
        checksum: crypto.createHash('sha256').update(chunk).digest('hex')
      }
    })
    if (error) throw error
    inserted += 1
  })))

  return { inserted, chunks: chunks.length }
}

// Ingest from PDF buffer (parse -> clean -> split -> embed)
export async function importFromPdfBuffer(
  category: string,
  buf: Buffer,
  source?: string,
  extraMeta?: Record<string, any>,
  chunkOptions?: { maxChars?: number; overlapChars?: number; minChars?: number; removeHeadersFooters?: boolean }
) {
  const parsed = await parsePdfBuffer(buf)
  const cleaned = cleanChineseText(parsed.pages, { removeHeadersFooters: chunkOptions?.removeHeadersFooters ?? true })
  return importChineseText({
    category,
    text: cleaned,
    source: source || 'uploaded.pdf',
    filetype: 'pdf',
    extraMeta: {
      numpages: parsed.numpages,
      ...extraMeta
    },
    chunkOptions
  })
}

// Ingest from TXT buffer/string
export async function importFromTxtBuffer(
  category: string,
  buf: Buffer | string,
  source?: string,
  extraMeta?: Record<string, any>,
  chunkOptions?: { maxChars?: number; overlapChars?: number; minChars?: number }
) {
  const text = Buffer.isBuffer(buf) ? buf.toString('utf-8') : buf
  // Treat as a single page for cleaner
  const cleaned = cleanChineseText([text], { removeHeadersFooters: false })
  return importChineseText({
    category,
    text: cleaned,
    source: source || 'uploaded.txt',
    filetype: 'txt',
    extraMeta,
    chunkOptions
  })
}
