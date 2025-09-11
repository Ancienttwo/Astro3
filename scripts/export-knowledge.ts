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
    if (args[i].startsWith('--')) {
      const k = args[i].slice(2)
      const v = args[i + 1]
      params[k] = v
      i++
    }
  }

  const { source, category, out } = params
  if (!source && !category) {
    console.error('Usage: tsx scripts/export-knowledge.ts --source <source> | --category <category> [--out file.json]')
    process.exit(1)
  }

  let query = supabase.from('fortune_knowledge').select('id, category, content, metadata')
  if (source) query = query.contains('metadata', { source })
  if (category) query = query.eq('category', category)
  const { data, error } = await query
  if (error) throw error

  await fs.mkdir('exports', { recursive: true })
  const file = out || path.join('exports', `knowledge-${source ? `source-${safe(source)}` : `cat-${safe(category)}`}.json`)
  await fs.writeFile(file, JSON.stringify({ exportedAt: new Date().toISOString(), count: data?.length || 0, items: data }, null, 2), 'utf-8')
  console.log(`Exported ${data?.length || 0} items -> ${file}`)
}

function safe(s?: string) {
  return (s || '').replace(/[^a-zA-Z0-9_-]+/g, '-')
}

main().catch((e) => { console.error(e); process.exit(1) })

