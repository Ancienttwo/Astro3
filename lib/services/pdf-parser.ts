// lib/services/pdf-parser.ts
// Defer importing pdf-parse at runtime to avoid bundling test assets in build
let _pdfParse: any = null
async function getPdfParse() {
  if (!_pdfParse) {
    _pdfParse = (await (eval('import'))('pdf-parse')).default
  }
  return _pdfParse
}

export interface ParsedPdf {
  pages: string[]
  numpages: number
  info?: any
  metadata?: any
}

export async function parsePdfBuffer(buf: Buffer): Promise<ParsedPdf> {
  const pdf = await getPdfParse()
  const data = await pdf(buf, { pagerender: renderSimplePage })
  // pdf-parse returns text with \n\f page separators sometimes; split by form-feed as fallback
  const pages = data.text.includes('\f')
    ? data.text.split('\f').map(s => s.trim())
    : splitByHeuristicPages(data.text)
  return { pages, numpages: data.numpages || pages.length, info: data.info, metadata: data.metadata }
}

function renderSimplePage(pageData: any) {
  // default text rendering
  return pageData.getTextContent().then((textContent: any) => {
    const strings = textContent.items.map((item: any) => item.str)
    return strings.join('\n')
  })
}

function splitByHeuristicPages(text: string): string[] {
  // Try to split by two or three newlines followed by a page-like marker; fallback single chunk
  const parts = text.split(/\n{3,}/)
  if (parts.length >= 2) return parts
  return [text]
}
