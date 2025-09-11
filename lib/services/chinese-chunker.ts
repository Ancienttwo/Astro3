// lib/services/chinese-chunker.ts
// Chinese-aware cleaning and chunking for PDF/TXT knowledge ingestion

export interface CleanOptions {
  removeHeadersFooters?: boolean
}

export interface SplitOptions {
  maxChars?: number
  minChars?: number
  overlapChars?: number
}

const DEFAULT_SPLIT: Required<SplitOptions> = {
  maxChars: 2800, // ~700 tokens (approx 4 chars/token for zh)
  minChars: 200,
  overlapChars: 120
}

// Heuristics to detect repeating headers/footers across pages
export function cleanChineseText(pages: string[], opts: CleanOptions = {}): string {
  if (!opts.removeHeadersFooters) {
    return pages.join('\n\n')
  }

  const firstLines: Record<string, number> = {}
  const lastLines: Record<string, number> = {}

  for (const page of pages) {
    const lines = page.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (!lines.length) continue
    const first = lines[0]
    const last = lines[lines.length - 1]
    if (first) firstLines[first] = (firstLines[first] || 0) + 1
    if (last) lastLines[last] = (lastLines[last] || 0) + 1
  }

  const threshold = Math.max(3, Math.floor(pages.length * 0.6))
  const commonFirst = new Set(Object.entries(firstLines).filter(([, c]) => c >= threshold).map(([k]) => k))
  const commonLast = new Set(Object.entries(lastLines).filter(([, c]) => c >= threshold).map(([k]) => k))

  const cleaned = pages.map(page => {
    const lines = page.split(/\r?\n/)
    const out: string[] = []
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      // drop headers/footers
      if (i === 0 && commonFirst.has(line)) continue
      if (i === lines.length - 1 && commonLast.has(line)) continue
      // drop page numbers
      if (/^第\s*\d+\s*页(\s*\/\s*共\s*\d+\s*页)?$/.test(line)) continue
      if (/^Page\s*\d+(\s*of\s*\d+)?$/i.test(line)) continue
      out.push(line)
    }
    return out.join('\n')
  })

  return cleaned.join('\n\n')
}

// Estimate tokens: for zh a rough rule-of-thumb ~ 0.25 tokens/char
function estimateTokensByChars(chars: number) {
  return Math.ceil(chars * 0.25)
}

// Hierarchical split: headings -> paragraphs -> sentences -> fallback
export function splitChineseChunks(text: string, options: SplitOptions = {}): string[] {
  const cfg = { ...DEFAULT_SPLIT, ...options }

  // Normalize line breaks and spaces
  let t = text.replace(/\u00A0/g, ' ').replace(/\r/g, '').replace(/\t/g, '  ')

  // First, split into sections by headings if possible
  const headingRe = new RegExp(
    [
      '^第[一二三四五六七八九十百千]+[章节编]\s+.+$', // 第三章 xxx
      '^[一二三四五六七八九十]+、\s*.+$', // 一、二、
      '^（[一二三四五六七八九十]+）\s*.+$', // （一）（二）
      '^\d+\.\d+(?:\.\d+)?\s+.+$' // 1.1 / 2.3.4
    ].join('|'),
    'm'
  )

  const sections: string[] = []
  let lastIdx = 0
  let match: RegExpExecArray | null
  const re = new RegExp(headingRe)
  while ((match = re.exec(t)) !== null) {
    const idx = match.index
    if (idx > lastIdx) sections.push(t.slice(lastIdx, idx))
    lastIdx = idx
  }
  sections.push(t.slice(lastIdx))

  const chunks: string[] = []
  for (const sec of sections) {
    splitSection(sec.trim(), cfg, chunks)
  }
  return chunks
}

function splitSection(section: string, cfg: Required<SplitOptions>, out: string[]) {
  if (!section) return
  if (section.length <= cfg.maxChars) {
    out.push(section)
    return
  }

  // Paragraph split (double newline)
  const paras = section.split(/\n{2,}/).map(s => s.trim()).filter(Boolean)
  // If paragraph split not effective, fallback to single newline
  const blocks = paras.length > 1 ? paras : section.split(/\n/).map(s => s.trim()).filter(Boolean)

  // Merge blocks into windows with overlap
  let buf: string[] = []
  let bufLen = 0

  const flush = (force = false) => {
    if (bufLen >= cfg.minChars || force) {
      const merged = buf.join('\n')
      // if still too long, sentence-level split
      if (merged.length > cfg.maxChars * 1.2) {
        splitBySentence(merged, cfg, out)
      } else {
        out.push(merged)
      }
      // create overlap context
      if (cfg.overlapChars > 0 && merged.length > cfg.overlapChars) {
        const overlap = merged.slice(merged.length - cfg.overlapChars)
        buf = [overlap]
        bufLen = overlap.length
      } else {
        buf = []
        bufLen = 0
      }
    }
  }

  for (const block of blocks) {
    if (!block) continue
    if (bufLen + block.length + 1 > cfg.maxChars) {
      flush(true)
    }
    buf.push(block)
    bufLen += block.length + 1
  }
  flush(true)
}

function splitBySentence(text: string, cfg: Required<SplitOptions>, out: string[]) {
  const sentences = text
    .split(/(?<=[。！？；…])/)
    .map(s => s.trim())
    .filter(Boolean)

  let buf: string[] = []
  let len = 0
  const pushBuf = (force = false) => {
    if (!buf.length) return
    if (len >= cfg.minChars || force) {
      out.push(buf.join(''))
      if (cfg.overlapChars > 0 && len > cfg.overlapChars) {
        const merged = buf.join('')
        const overlap = merged.slice(merged.length - cfg.overlapChars)
        buf = [overlap]
        len = overlap.length
      } else {
        buf = []
        len = 0
      }
    }
  }

  for (const s of sentences) {
    if (len + s.length > cfg.maxChars) {
      pushBuf(true)
    }
    buf.push(s)
    len += s.length
  }
  pushBuf(true)
}

