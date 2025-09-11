import { ingestNotion } from '@/lib/connectors/notion'

async function main() {
  const args = process.argv.slice(2)
  const params: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { params[args[i].slice(2)] = args[i + 1]; i++ }
  }
  const category = params['category']
  const databaseId = params['db'] || params['databaseId']
  const pages = params['pages'] ? params['pages'].split(',').map(s => s.trim()).filter(Boolean) : undefined
  const tags = params['tags'] ? params['tags'].split(',').map(s => s.trim()).filter(Boolean) : []
  const tagPropertyName = params['tagProperty'] || params['tagPropertyName']
  const categoryPropertyName = params['categoryProperty'] || params['categoryPropertyName']
  const overrideCategoryWithNotion = ['1','true','yes'].includes(String(params['overrideCategory'] || '').toLowerCase())
  const maxChars = params['maxChars'] ? parseInt(params['maxChars'], 10) : undefined
  const overlapChars = params['overlapChars'] ? parseInt(params['overlapChars'], 10) : undefined
  const minChars = params['minChars'] ? parseInt(params['minChars'], 10) : undefined
  if (!category) {
    console.error('Usage: tsx scripts/ingest-notion.ts --category bazi (--db <databaseId> | --pages id1,id2) [--tags 财运,事业]')
    process.exit(1)
  }

  const res = await ingestNotion({ 
    category, 
    databaseId, 
    pageIds: pages, 
    tags,
    tagPropertyName,
    categoryPropertyName,
    overrideCategoryWithNotion,
    chunkOptions: { maxChars, overlapChars, minChars }
  })
  console.log(JSON.stringify(res, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
