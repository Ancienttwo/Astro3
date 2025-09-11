-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 创建命理知识库表
CREATE TABLE IF NOT EXISTS fortune_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建向量索引
CREATE INDEX fortune_knowledge_embedding_idx 
ON fortune_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 创建分类索引
CREATE INDEX fortune_knowledge_category_idx 
ON fortune_knowledge(category);

-- 创建相似性搜索函数
CREATE OR REPLACE FUNCTION match_fortune_documents(
  query_embedding vector(1536),
  match_count INT DEFAULT 5,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    fk.id,
    fk.content,
    fk.metadata,
    1 - (fk.embedding <=> query_embedding) AS similarity
  FROM fortune_knowledge fk
  WHERE 
    (filter_category IS NULL OR fk.category = filter_category)
  ORDER BY fk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 创建使用日志表
CREATE TABLE IF NOT EXISTS agent_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  query TEXT NOT NULL,
  category TEXT,
  response TEXT,
  tokens_used INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS策略
ALTER TABLE fortune_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_usage_logs ENABLE ROW LEVEL SECURITY;

-- 知识库公开读取
CREATE POLICY "Public read access" ON fortune_knowledge
  FOR SELECT USING (true);

-- 用户只能查看自己的使用记录
CREATE POLICY "Users can view own logs" ON agent_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 服务端可以插入日志
CREATE POLICY "Service role can insert logs" ON agent_usage_logs
  FOR INSERT WITH CHECK (true);