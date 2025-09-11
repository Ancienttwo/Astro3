import { ingestDrive } from '@/lib/connectors/drive'

async function main() {
  const args = process.argv.slice(2)
  const params: Record<string, string> = {}
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { params[args[i].slice(2)] = args[i + 1]; i++ }
  }
  const category = params['category']
  const folderId = params['folder']
  const fileIds = params['files'] ? params['files'].split(',').map(s => s.trim()).filter(Boolean) : undefined
  const tags = params['tags'] ? params['tags'].split(',').map(s => s.trim()).filter(Boolean) : []
  const maxChars = params['maxChars'] ? parseInt(params['maxChars'], 10) : undefined
  const overlapChars = params['overlapChars'] ? parseInt(params['overlapChars'], 10) : undefined
  const minChars = params['minChars'] ? parseInt(params['minChars'], 10) : undefined
  const removeHeadersFooters = ['1','true','yes'].includes(String(params['removeHeadersFooters'] || '').toLowerCase())
  // Drive 不支持属性映射，但为对齐 CLI 允许透传以下参数（忽略）
  if (params['tagProperty'] || params['categoryProperty'] || params['overrideCategory']) {
    console.warn('[ingest-drive] --tagProperty / --categoryProperty / --overrideCategory are not applicable to Drive and will be ignored.')
  }
  if (!category || (!folderId && (!fileIds || !fileIds.length))) {
    console.error('Usage: tsx scripts/ingest-drive.ts --category bazi (--folder <folderId> | --files id1,id2) [--tags 财运,事业]')
    process.exit(1)
  }

  const res = await ingestDrive({ category, folderId, fileIds, tags, chunkOptions: { maxChars, overlapChars, minChars, removeHeadersFooters } })
  console.log(JSON.stringify(res, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
