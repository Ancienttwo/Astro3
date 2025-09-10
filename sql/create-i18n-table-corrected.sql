-- 创建关帝灵签多语言翻译表（修正版）
-- 修正外键引用正确的表名

-- 创建多语言翻译表
CREATE TABLE IF NOT EXISTS fortune_slips_i18n (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slip_id UUID NOT NULL,
    language_code VARCHAR(10) NOT NULL CHECK (language_code IN ('zh-CN', 'zh-TW', 'en-US')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    basic_interpretation TEXT NOT NULL,
    historical_context TEXT,
    symbolism TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个签文的每种语言只有一条记录
    UNIQUE(slip_id, language_code),
    
    -- 外键约束（引用正确的表名）
    FOREIGN KEY (slip_id) REFERENCES fortune_slips(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_lookup 
ON fortune_slips_i18n(slip_id, language_code);

CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_language 
ON fortune_slips_i18n(language_code);

-- 启用RLS
ALTER TABLE fortune_slips_i18n ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：允许所有人查看翻译
CREATE POLICY "Anyone can view fortune slip translations" ON fortune_slips_i18n
    FOR SELECT
    USING (true);

-- 创建RLS策略：service role可以管理所有翻译
CREATE POLICY "Service role can manage all translations" ON fortune_slips_i18n
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 授予权限
GRANT ALL ON fortune_slips_i18n TO service_role;
GRANT SELECT ON fortune_slips_i18n TO authenticated;
GRANT SELECT ON fortune_slips_i18n TO anon;