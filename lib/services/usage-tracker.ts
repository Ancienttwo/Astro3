import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function trackUsage(params: {
  userId?: string | null
  query: string
  category?: string
  response?: string
  tokensUsed?: number
  responseTimeMs?: number
}) {
  const { userId, query, category, response, tokensUsed } = params
  await supabase.from('agent_usage_logs').insert({
    user_id: userId ?? null,
    query,
    category: category ?? null,
    response: response ?? null,
    tokens_used: tokensUsed ?? null
  })
}

export async function getUsageStats() {
  // total queries
  const totalHead = await supabase
    .from('agent_usage_logs')
    .select('id', { count: 'exact', head: true })

  const now = Date.now()
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString()

  // daily queries
  const dailyHead = await supabase
    .from('agent_usage_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', dayAgo)

  // tokens usage (total and daily)
  const { data: tokenRowsTotal } = await supabase
    .from('agent_usage_logs')
    .select('tokens_used')

  const { data: tokenRowsDaily } = await supabase
    .from('agent_usage_logs')
    .select('tokens_used, created_at')
    .gte('created_at', dayAgo)

  const tokenTotal = (tokenRowsTotal || []).reduce((sum, r: any) => sum + (r.tokens_used || 0), 0)
  const tokenDaily = (tokenRowsDaily || []).reduce((sum, r: any) => sum + (r.tokens_used || 0), 0)

  // popular categories
  const { data: catRows } = await supabase
    .from('agent_usage_logs')
    .select('category')

  const categoryCount: Record<string, number> = {}
  for (const r of catRows || []) {
    const c = r.category || 'general'
    categoryCount[c] = (categoryCount[c] || 0) + 1
  }
  const popular = Object.entries(categoryCount)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    total_queries: totalHead.count || 0,
    daily_queries: dailyHead.count || 0,
    popular_categories: popular,
    average_response_time: null,
    token_usage: {
      total: tokenTotal,
      daily: tokenDaily
    }
  }
}

