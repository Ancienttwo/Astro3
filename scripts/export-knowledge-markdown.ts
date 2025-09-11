import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs/promises'
import * as path from 'path'

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env')
  const supabase = createClient(supabaseUrl, supabaseKey)

  const args = process.argv.slice(2)
  const params: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { params[args[i].slice(2)] = args[i + 1]; i++ }
  }
  const { source, category, out } = params
  if (!source && !category) {
    console.error('Usage: tsx scripts/export-knowledge-markdown.ts --source <source> | --category <category> [--out file.md]')
    process.exit(1)
  }

  let query = supabase.from('fortune_knowledge').select('id, category, content, metadata').order('created_at', { ascending: true })
  if (source) query = query.contains('metadata', { source })
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error

  const items = (data || []).sort((a: any, b: any) => (a.metadata?.chunk_index ?? 0) - (b.metadata?.chunk_index ?? 0))
  const lines: string[] = []
  lines.push(`# Exported Knowledge\n`)
  if (source) lines.push(`- Source: ${source}`)
  if (category) lines.push(`- Category: ${category}`)
  lines.push(`- Count: ${items.length}`)
  lines.push('\n---\n')
  items.forEach((it: any, idx: number) => {
    const title = it.metadata?.title || `Chunk #${idx} (index=${it.metadata?.chunk_index ?? '-'})`
    lines.push(`\n## ${escapeMd(title)}\n`)
    lines.push(it.content)
  })

  await fs.mkdir('exports', { recursive: true })
  const file = out || path.join('exports', `knowledge-${source ? `source-${safe(source)}` : `cat-${safe(category)}`}.md`)
  await fs.writeFile(file, lines.join('\n'), 'utf-8')
  console.log(`Exported Markdown -> ${file}`)
}

function escapeMd(s: string) {
  return s.replace(/[<>]/g, '')
}
function safe(s?: string) { return (s || '').replace(/[^a-zA-Z0-9_-]+/g, '-') }

main().catch((e) => { console.error(e); process.exit(1) })

