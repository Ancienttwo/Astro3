import { createClient } from '@supabase/supabase-js'
import { SiliconFlowEmbeddings } from '@/lib/langchain/fortune-agent'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import * as fs from 'fs/promises'
import * as path from 'path'

// 初始化
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const embeddings = new SiliconFlowEmbeddings()

// 文本分割器
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
  separators: ['。', '！', '？', '\n\n', '\n', ' ', '']
})

// 导入命理知识
export async function importFortuneKnowledge(
  filePath: string,
  category: string
) {
  console.log(`开始导入 ${category} 知识...`)

  // 1. 读取文件
  const content = await fs.readFile(filePath, 'utf-8')

  // 2. 分割文本
  const docs = await splitter.createDocuments(
    [content],
    [{ category, source: path.basename(filePath) }]
  )

  // 3. 生成embeddings并存储
  for (const doc of docs) {
    const embedding = await embeddings.embedQuery(doc.pageContent)
    
    await supabase.from('fortune_knowledge').insert({
      category,
      content: doc.pageContent,
      embedding,
      metadata: doc.metadata
    })

    console.log(`已导入: ${doc.pageContent.substring(0, 50)}...`)
  }

  console.log(`完成导入 ${docs.length} 个文档片段`)
}

// 批量导入
async function main() {
  const knowledgeFiles = [
    { path: './data/bazi-knowledge.txt', category: 'bazi' },
    { path: './data/ziwei-knowledge.txt', category: 'ziwei' },
    { path: './data/guandi-slips.txt', category: 'guandi' }
  ]

  for (const file of knowledgeFiles) {
    await importFortuneKnowledge(file.path, file.category)
  }
}

// 运行导入
if (require.main === module) {
  main().catch(console.error)
}
