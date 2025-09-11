import { createClient } from '@supabase/supabase-js'
import pLimit from 'p-limit'
import { SiliconFlowEmbeddings } from '@/lib/langchain/fortune-agent'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const embeddings = new SiliconFlowEmbeddings()

function checksum(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex')
}

export async function deleteBySource(source: string) {
  if (!source) throw new Error('source is required')
  const { error, count } = await supabase
    .from('fortune_knowledge')
    .delete({ count: 'exact' })
    .contains('metadata', { source })
  if (error) throw error
  return { deleted: count || 0 }
}

export async function dedupeBySource(source: string) {
  if (!source) throw new Error('source is required')
  const { data: rows, error } = await supabase
    .from('fortune_knowledge')
    .select('id, content, metadata')
    .contains('metadata', { source })
  if (error) throw error

  const seen = new Map<string, string>() // checksum -> id
  const dupIds: string[] = []
  const updateMeta: { id: string; metadata: any }[] = []

  for (const r of rows || []) {
    const sum = r?.metadata?.checksum || checksum(r.content)
    if (!r?.metadata?.checksum) {
      updateMeta.push({ id: r.id, metadata: { ...(r.metadata || {}), checksum: sum } })
    }
    if (seen.has(sum)) dupIds.push(r.id)
    else seen.set(sum, r.id)
  }

  // update missing checksum
  for (const u of updateMeta) {
    await supabase.from('fortune_knowledge').update({ metadata: u.metadata }).eq('id', u.id)
  }

  let deleted = 0
  if (dupIds.length) {
    const { error: delErr, count } = await supabase
      .from('fortune_knowledge')
      .delete({ count: 'exact' })
      .in('id', dupIds)
    if (delErr) throw delErr
    deleted = count || dupIds.length
  }
  return { scanned: rows?.length || 0, deleted, kept: seen.size }
}

export async function reembedBySource(source: string, batchSize = 16, concurrency = 4) {
  if (!source) throw new Error('source is required')
  const { data: rows, error } = await supabase
    .from('fortune_knowledge')
    .select('id, content')
    .contains('metadata', { source })
  if (error) throw error
  return reembedRows(rows || [], batchSize, concurrency)
}

export async function reembedByCategory(category: string, batchSize = 16, concurrency = 4) {
  if (!category) throw new Error('category is required')
  const { data: rows, error } = await supabase
    .from('fortune_knowledge')
    .select('id, content')
    .eq('category', category)
  if (error) throw error
  return reembedRows(rows || [], batchSize, concurrency)
}

export async function reembedAll(batchSize = 16, concurrency = 4) {
  const { data: rows, error } = await supabase
    .from('fortune_knowledge')
    .select('id, content')
  if (error) throw error
  return reembedRows(rows || [], batchSize, concurrency)
}

async function reembedRows(rows: { id: string; content: string }[], batchSize: number, concurrency: number) {
  let updated = 0
  const limit = pLimit(concurrency)

  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize)
    const vectors = await embeddings.embedDocuments(batch.map(b => b.content))
    await Promise.all(batch.map((row, idx) => limit(async () => {
      const { error } = await supabase
        .from('fortune_knowledge')
        .update({ embedding: vectors[idx] })
        .eq('id', row.id)
      if (error) throw error
      updated += 1
    })))
  }
  return { updated, total: rows.length }
}

