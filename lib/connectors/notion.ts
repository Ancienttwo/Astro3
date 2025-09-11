import { Client } from '@notionhq/client'
import pLimit from 'p-limit'
import { importChineseText } from '@/lib/services/knowledge-service'

export interface NotionIngestOptions {
  category: string
  databaseId?: string
  pageIds?: string[]
  pageSize?: number
  concurrency?: number
  tags?: string[]
  tagPropertyName?: string // e.g., 'Tags' (multi_select)
  categoryPropertyName?: string // e.g., 'Category' (select or multi_select)
  overrideCategoryWithNotion?: boolean
  chunkOptions?: { maxChars?: number; overlapChars?: number; minChars?: number }
}

export async function ingestNotion(opts: NotionIngestOptions) {
  const notionToken = process.env.NOTION_TOKEN
  if (!notionToken) throw new Error('Missing NOTION_TOKEN')
  const notion = new Client({ auth: notionToken })

  const pageIds: string[] = []
  if (opts.pageIds && opts.pageIds.length) {
    pageIds.push(...opts.pageIds)
  } else if (opts.databaseId) {
    let cursor: string | undefined
    while (true) {
      const res = await notion.databases.query({
        database_id: opts.databaseId,
        start_cursor: cursor,
        page_size: opts.pageSize || 50
      })
      for (const row of res.results as any[]) {
        pageIds.push(row.id)
      }
      if (!res.has_more || !res.next_cursor) break
      cursor = res.next_cursor
    }
  } else {
    throw new Error('Provide either databaseId or pageIds')
  }

  const limit = pLimit(opts.concurrency || 3)
  let ok = 0, fail = 0
  const errors: Array<{ id: string; error: string }> = []

  await Promise.all(pageIds.map(pageId => limit(async () => {
    try {
      const page = await notion.pages.retrieve({ page_id: pageId }) as any
      const title = extractTitle(page) || pageId
      const tagsFromNotion = extractTagsFromProperties(page, opts.tagPropertyName)
      const notionCategory = extractCategoryFromProperties(page, opts.categoryPropertyName)
      const finalCategory = (opts.overrideCategoryWithNotion && notionCategory) ? notionCategory : opts.category
      const text = await renderPageToText(notion, pageId)
      await importChineseText({
        category: finalCategory,
        text,
        source: title,
        filetype: 'txt',
        extraMeta: {
          origin: 'notion',
          notion_page_id: pageId,
          title,
          tags: Array.from(new Set([...(opts.tags || []), ...tagsFromNotion]))
        },
        chunkOptions: opts.chunkOptions
      })
      ok += 1
    } catch (e: any) {
      fail += 1
      errors.push({ id: pageId, error: e?.message || String(e) })
    }
  })))

  return { total: pageIds.length, ok, fail, errors }
}

function extractTitle(page: any): string | undefined {
  const props = page?.properties || {}
  for (const key of Object.keys(props)) {
    const p = props[key]
    if (p?.type === 'title' && Array.isArray(p.title) && p.title.length > 0) {
      return p.title.map((t: any) => t?.plain_text || '').join('')
    }
  }
  return undefined
}

async function renderPageToText(notion: Client, pageId: string): Promise<string> {
  const lines: string[] = []
  await renderBlockChildren(notion, pageId, lines, 0)
  return lines.join('\n\n')
}

async function renderBlockChildren(notion: Client, blockId: string, out: string[], depth: number) {
  const res = await notion.blocks.children.list({ block_id: blockId, page_size: 100 })
  for (const block of res.results as any[]) {
    await renderBlock(notion, block, out, depth)
    if (block.has_children) {
      await renderBlockChildren(notion, block.id, out, depth + 1)
    }
  }
  if (res.has_more && res.next_cursor) {
    await renderBlockChildren(notion, blockId, out, depth)
  }
}

async function renderBlock(notion: Client, block: any, out: string[], depth: number) {
  const prepend = depth > 0 ? '' : ''
  switch (block.type) {
    case 'heading_1':
      out.push(`# ${plain(block.heading_1.rich_text)}`)
      break
    case 'heading_2':
      out.push(`## ${plain(block.heading_2.rich_text)}`)
      break
    case 'heading_3':
      out.push(`### ${plain(block.heading_3.rich_text)}`)
      break
    case 'paragraph':
      out.push(`${prepend}${plain(block.paragraph.rich_text)}`)
      break
    case 'bulleted_list_item':
      out.push(`- ${plain(block.bulleted_list_item.rich_text)}`)
      break
    case 'numbered_list_item':
      out.push(`1. ${plain(block.numbered_list_item.rich_text)}`)
      break
    case 'quote':
      out.push(`> ${plain(block.quote.rich_text)}`)
      break
    case 'to_do':
      out.push(`- [${block.to_do.checked ? 'x' : ' '}] ${plain(block.to_do.rich_text)}`)
      break
    case 'callout':
      out.push(`${plain(block.callout.rich_text)}`)
      break
    case 'divider':
      out.push('---')
      break
    case 'toggle':
      out.push(`${plain(block.toggle.rich_text)}`)
      break
    default:
      // Fallback to plain text if available
      const r = block[block.type]?.rich_text
      if (Array.isArray(r)) out.push(plain(r))
  }
}

function plain(rich: any[]): string {
  if (!Array.isArray(rich)) return ''
  return rich.map((t: any) => t?.plain_text || '').join('')
}

function extractTagsFromProperties(page: any, tagPropName?: string): string[] {
  const props = page?.properties || {}
  const key = tagPropName && props[tagPropName] ? tagPropName : findFirstPropertyOfType(props, 'multi_select')
  if (!key) return []
  const p = props[key]
  if (p?.type === 'multi_select' && Array.isArray(p.multi_select)) {
    return p.multi_select.map((o: any) => o?.name).filter(Boolean)
  }
  return []
}

function extractCategoryFromProperties(page: any, catPropName?: string): string | undefined {
  const props = page?.properties || {}
  const key = catPropName && props[catPropName] ? catPropName : (findFirstPropertyOfType(props, 'select') || findFirstPropertyOfType(props, 'status') || findFirstPropertyOfType(props, 'multi_select'))
  if (!key) return undefined
  const p = props[key]
  if (p?.type === 'select' && p.select) return p.select?.name
  if (p?.type === 'status' && p.status) return p.status?.name
  if (p?.type === 'multi_select' && Array.isArray(p.multi_select) && p.multi_select.length) return p.multi_select[0]?.name
  return undefined
}

function findFirstPropertyOfType(props: Record<string, any>, type: string): string | undefined {
  for (const k of Object.keys(props)) {
    if (props[k]?.type === type) return k
  }
  return undefined
}
