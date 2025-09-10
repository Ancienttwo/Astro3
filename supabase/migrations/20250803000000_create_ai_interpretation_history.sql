-- 创建AI签文解读历史记录表
CREATE TABLE IF NOT EXISTS ai_interpretation_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    slip_number INTEGER NOT NULL,
    slip_title TEXT,
    inquiry_type TEXT NOT NULL,
    inquiry_name TEXT,
    ai_response TEXT NOT NULL,
    response_language TEXT DEFAULT 'zh-CN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引提升查询性能
CREATE INDEX IF NOT EXISTS idx_ai_history_user_id ON ai_interpretation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_history_created_at ON ai_interpretation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_history_slip_number ON ai_interpretation_history(slip_number);
CREATE INDEX IF NOT EXISTS idx_ai_history_inquiry_type ON ai_interpretation_history(inquiry_type);

-- 启用行级安全策略
ALTER TABLE ai_interpretation_history ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的解读记录
CREATE POLICY "Users can view their own AI interpretation history"
    ON ai_interpretation_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI interpretation history"
    ON ai_interpretation_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI interpretation history"
    ON ai_interpretation_history FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI interpretation history"
    ON ai_interpretation_history FOR DELETE
    USING (auth.uid() = user_id);

-- 创建更新时间戳的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_interpretation_history_updated_at 
    BEFORE UPDATE ON ai_interpretation_history 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 添加表注释
COMMENT ON TABLE ai_interpretation_history IS 'AI签文解读历史记录表';
COMMENT ON COLUMN ai_interpretation_history.id IS '记录唯一标识';
COMMENT ON COLUMN ai_interpretation_history.user_id IS '用户ID，外键关联users表';
COMMENT ON COLUMN ai_interpretation_history.slip_number IS '签文编号';
COMMENT ON COLUMN ai_interpretation_history.slip_title IS '签文标题';
COMMENT ON COLUMN ai_interpretation_history.inquiry_type IS '询问类型key（如career、wealth等）';
COMMENT ON COLUMN ai_interpretation_history.inquiry_name IS '询问类型名称（如功名、求財等）';
COMMENT ON COLUMN ai_interpretation_history.ai_response IS 'AI解读结果文本';
COMMENT ON COLUMN ai_interpretation_history.response_language IS '响应语言（zh-CN、en-US等）';
COMMENT ON COLUMN ai_interpretation_history.created_at IS '记录创建时间';
COMMENT ON COLUMN ai_interpretation_history.updated_at IS '记录更新时间';