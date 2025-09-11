import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs/promises'

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase env')

  const supabase = createClient(supabaseUrl, supabaseKey)

  const args = process.argv.slice(2)
  const params: Record<string, string | boolean> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const k = args[i].slice(2)
      const isBool = args[i + 1]?.startsWith('--') || args[i + 1] === undefined
      if (isBool) { params[k] = true } else { params[k] = args[i + 1]; i++ }
    }
  }

  const file = params['file'] as string
  const replace = !!params['replace']
  const source = (params['source'] as string) || ''
  if (!file) {
    console.error('Usage: tsx scripts/reimport-knowledge.ts --file exports/xxx.json [--replace] [--source overrideSource]')
    process.exit(1)
  }

  const raw = await fs.readFile(file, 'utf-8')
  const json = JSON.parse(raw)
  const items = (json.items || json) as Array<{ category: string; content: string; metadata?: any }>
  if (!Array.isArray(items)) throw new Error('Invalid input JSON')

  const overrideSource = source || undefined
  const effectiveSource = overrideSource || mostCommonSource(items)

  if (replace && effectiveSource) {
    console.log(`Deleting existing chunks by source="${effectiveSource}"...`)
    const { error } = await supabase.from('fortune_knowledge').delete().contains('metadata', { source: effectiveSource })
    if (error) throw error
  }

  let inserted = 0
  for (const it of items) {
    const meta = { ...(it.metadata || {}), source: overrideSource || it.metadata?.source }
    const { error } = await supabase.from('fortune_knowledge').insert({
      category: it.category,
      content: it.content,
      metadata: meta
    })
    if (error) throw error
    inserted += 1
  }
  console.log(`Reimported ${inserted} items`) 
}

function mostCommonSource(items: Array<{ metadata?: any }>) {
  const counts: Record<string, number> = {}
  for (const it of items) {
    const s = it.metadata?.source
    if (s) counts[s] = (counts[s] || 0) + 1
  }
  return Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]
}

main().catch((e) => { console.error(e); process.exit(1) })

