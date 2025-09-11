import { google } from 'googleapis'
import pLimit from 'p-limit'
import { importFromPdfBuffer, importFromTxtBuffer, importChineseText } from '@/lib/services/knowledge-service'

export interface DriveIngestOptions {
  category: string
  folderId?: string
  fileIds?: string[]
  mimeWhitelist?: string[]
  concurrency?: number
  tags?: string[]
  chunkOptions?: { maxChars?: number; overlapChars?: number; minChars?: number; removeHeadersFooters?: boolean }
}

export async function ingestDrive(opts: DriveIngestOptions) {
  const email = process.env.GDRIVE_SERVICE_ACCOUNT_EMAIL
  let key = process.env.GDRIVE_PRIVATE_KEY
  if (!email || !key) throw new Error('Missing GDRIVE_SERVICE_ACCOUNT_EMAIL or GDRIVE_PRIVATE_KEY')
  key = key.replace(/\\n/g, '\n')
  const subject = process.env.GDRIVE_IMPERSONATE_SUBJECT

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    subject
  })

  const drive = google.drive({ version: 'v3', auth })
  const mimeOk = new Set(opts.mimeWhitelist || [
    'application/pdf',
    'text/plain',
    'application/vnd.google-apps.document'
  ])

  const files: Array<{ id: string; name: string; mimeType: string }> = []
  if (opts.fileIds && opts.fileIds.length) {
    for (const id of opts.fileIds) {
      const meta = await drive.files.get({ fileId: id, fields: 'id,name,mimeType' })
      const f = meta.data as any
      if (f?.id && f?.mimeType && mimeOk.has(f.mimeType)) files.push({ id: f.id, name: f.name, mimeType: f.mimeType })
    }
  } else if (opts.folderId) {
    let pageToken: string | undefined
    while (true) {
      const res = await drive.files.list({
        q: `'${opts.folderId}' in parents and trashed=false`,
        fields: 'nextPageToken, files(id,name,mimeType)',
        pageSize: 1000,
        pageToken
      })
      for (const f of res.data.files || []) {
        if (f.id && f.mimeType && mimeOk.has(f.mimeType)) {
          files.push({ id: f.id, name: f.name || f.id, mimeType: f.mimeType })
        }
      }
      if (!res.data.nextPageToken) break
      pageToken = res.data.nextPageToken as string
    }
  } else {
    throw new Error('Provide either folderId or fileIds')
  }

  const limit = pLimit(opts.concurrency || 3)
  // Lazy load turndown to avoid bundling when not installed
  let turndown: any = null
  try {
    const mod = await (eval('import'))('turndown')
    turndown = new mod.default()
  } catch {
    // If turndown is not available, we'll skip HTML→MD conversion
  }
  let ok = 0, fail = 0
  const errors: Array<{ id: string; error: string }> = []

  await Promise.all(files.map(file => limit(async () => {
    try {
      if (file.mimeType === 'application/pdf') {
        const resp = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' })
        const buf = Buffer.from(resp.data as any)
        await importFromPdfBuffer(opts.category, buf, file.name, {
          origin: 'gdrive',
          drive_file_id: file.id,
          mimeType: file.mimeType,
          tags: opts.tags || []
        }, opts.chunkOptions)
      } else if (file.mimeType === 'text/plain') {
        const resp = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'arraybuffer' })
        const buf = Buffer.from(resp.data as any)
        await importFromTxtBuffer(opts.category, buf, file.name, {
          origin: 'gdrive',
          drive_file_id: file.id,
          mimeType: file.mimeType,
          tags: opts.tags || []
        }, opts.chunkOptions)
      } else if (file.mimeType === 'application/vnd.google-apps.document') {
        // Export as HTML for richer structure, then convert to Markdown
        const resp = await drive.files.export({ fileId: file.id, mimeType: 'text/html' }, { responseType: 'arraybuffer' })
        const html = Buffer.from(resp.data as any).toString('utf-8')
        const md = turndown ? turndown.turndown(html) : html
        await importChineseText({
          category: opts.category,
          text: md,
          source: file.name,
          filetype: 'txt',
          extraMeta: {
            origin: 'gdrive',
            drive_file_id: file.id,
            mimeType: file.mimeType,
            exported_as: 'text/html',
            converted_to: 'markdown',
            tags: opts.tags || []
          },
          chunkOptions: opts.chunkOptions
        })
      }
      ok += 1
    } catch (e: any) {
      fail += 1
      errors.push({ id: file.id, error: e?.message || String(e) })
    }
  })))

  return { total: files.length, ok, fail, errors }
}
