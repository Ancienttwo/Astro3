import { ChatOpenAI } from '@langchain/openai'
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase'
import { createClient } from '@supabase/supabase-js'
import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { Embeddings } from '@langchain/core/embeddings'

// SiliconFlow统一API配置
const SILICONFLOW_CONFIG = {
  baseURL: process.env.SILICONFLOW_BASE_URL || 'https://api.siliconflow.com/v1',
  apiKey: process.env.SILICONFLOW_API_KEY!,
}

// 可用模型列表
const AVAILABLE_MODELS = {
  // DeepSeek V3.1 (深度推理)
  deepseek: 'deepseek-ai/DeepSeek-V3',
  
  // Qwen3 Thinking 系列 - 最新推理模型
  qwen235b: 'Qwen/Qwen3-235B-A22B-Thinking-2507', // 通用对话，强大推理能力
  qwen30b: 'Qwen/Qwen3-30B-A3B-Thinking-2507',    // 快速对话，平衡性能
  
  // Qwen2.5 系列 (备选)
  qwen72b: 'Qwen/Qwen2.5-72B-Instruct',
  qwen32b: 'Qwen/Qwen2.5-32B-Instruct',
  
  // Embeddings
  embedding: 'Qwen/Qwen3-Embedding-8B' // Qwen3最新embedding模型
}

// SiliconFlow Embeddings实现
export class SiliconFlowEmbeddings extends Embeddings {
  private apiKey: string
  private baseURL: string
  private model: string

  constructor(model?: string) {
    super({})
    this.apiKey = SILICONFLOW_CONFIG.apiKey
    this.baseURL = SILICONFLOW_CONFIG.baseURL
    // 使用Qwen3-Embedding-8B作为默认embedding模型
    this.model = model || process.env.EMBEDDING_MODEL || AVAILABLE_MODELS.embedding
  }

  async embedDocuments(documents: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseURL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.model,
        input: documents
      })
    })
    
    if (!response.ok) {
      throw new Error(`SiliconFlow API error: ${response.statusText}`)
    }
    
    const data = await response.json()
    return data.data.map((item: any) => item.embedding)
  }

  async embedQuery(document: string): Promise<number[]> {
    const embeddings = await this.embedDocuments([document])
    return embeddings[0]
  }
}

// 初始化Supabase客户端
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 使用SiliconFlow embeddings
const embeddings = new SiliconFlowEmbeddings()

// 初始化向量存储
const vectorStore = new SupabaseVectorStore(
  embeddings,
  {
    client: supabase,
    tableName: 'fortune_knowledge',
    queryName: 'match_fortune_documents'
  }
)

// 命理Agent主函数
export async function fortuneAgent({
  query,
  category = 'general',
  userId
}: {
  query: string
  category?: string
  userId?: string
}) {
  // 1. RAG检索相关知识
  const relevantDocs = await vectorStore.similaritySearch(
    query,
    5, // 返回前5个相关文档
    { category } // 按类别过滤
  )

  // 2. 构建增强Prompt
  const promptTemplate = PromptTemplate.fromTemplate(`
你是一位精通中国传统命理的大师，请基于以下知识库内容回答用户问题。

相关知识：
{context}

用户问题：{question}

请提供专业、准确且易于理解的解答。
`)

  // 3. 初始化LLM - 通过SiliconFlow使用模型
  const selectedModel = process.env.FORTUNE_MODEL || 'qwen235b' // 默认使用Qwen3-235B
  const modelName = AVAILABLE_MODELS[selectedModel as keyof typeof AVAILABLE_MODELS] || AVAILABLE_MODELS.qwen235b
  
  const model = new ChatOpenAI({
    modelName,
    temperature: 0.7,
    openAIApiKey: SILICONFLOW_CONFIG.apiKey,
    configuration: {
      baseURL: SILICONFLOW_CONFIG.baseURL
    }
  })

  // 4. 创建处理链
  const chain = RunnableSequence.from([
    {
      context: () => relevantDocs.map(doc => doc.pageContent).join('\n\n'),
      question: () => query
    },
    promptTemplate,
    model
  ])

  // 5. 执行并返回结果
  const response = await chain.invoke({})
  
  // 6. 记录使用情况（可选）
  if (userId) {
    await supabase.from('agent_usage_logs').insert({
      user_id: userId,
      query,
      category,
      response: response.content,
      tokens_used: response.usage?.total_tokens || 0
    })
  }

  return {
    answer: response.content,
    sources: relevantDocs.map(doc => doc.metadata),
    usage: response.usage
  }
}

// 流式命理Agent（用于SSE端点）
export async function fortuneAgentStream({
  query,
  category = 'general',
  onToken
}: {
  query: string
  category?: string
  onToken: (token: string) => void
}) {
  // 1. RAG检索相关知识
  const relevantDocs = await vectorStore.similaritySearch(query, 5, { category })

  // 2. Prompt
  const promptTemplate = PromptTemplate.fromTemplate(`
你是一位精通中国传统命理的大师，请基于以下知识库内容回答用户问题。

相关知识：
{context}

用户问题：{question}

请提供专业、准确且易于理解的解答。
`)

  // 3. 模型
  const selectedModel = process.env.FORTUNE_MODEL || 'qwen235b'
  const modelName = AVAILABLE_MODELS[selectedModel as keyof typeof AVAILABLE_MODELS] || AVAILABLE_MODELS.qwen235b

  const model = new ChatOpenAI({
    modelName,
    temperature: 0.7,
    openAIApiKey: SILICONFLOW_CONFIG.apiKey,
    configuration: { baseURL: SILICONFLOW_CONFIG.baseURL }
  })

  // 4. 构建链并流式输出
  const chain = RunnableSequence.from([
    {
      context: () => relevantDocs.map(doc => doc.pageContent).join('\n\n'),
      question: () => query
    },
    promptTemplate,
    model
  ])

  const stream = await chain.stream({})
  for await (const chunk of stream as any) {
    const token = typeof chunk === 'string' ? chunk : (chunk?.content ?? '')
    if (token) onToken(String(token))
  }
}
