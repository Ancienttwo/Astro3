
-- 创建多语言翻译表
CREATE TABLE IF NOT EXISTS public.fortune_slips_i18n (
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
    
    -- 外键约束
    FOREIGN KEY (slip_id) REFERENCES public.fortune_slips(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_lookup 
ON public.fortune_slips_i18n(slip_id, language_code);

CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_language 
ON public.fortune_slips_i18n(language_code);

-- 启用RLS
ALTER TABLE public.fortune_slips_i18n ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：任何人都可以读取
CREATE POLICY "Anyone can view fortune translations" ON public.fortune_slips_i18n
    FOR SELECT
    USING (true);

-- Service role可以管理所有数据
CREATE POLICY "Service role can manage fortune translations" ON public.fortune_slips_i18n
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 授权
GRANT SELECT ON public.fortune_slips_i18n TO authenticated;
GRANT SELECT ON public.fortune_slips_i18n TO anon;
GRANT ALL ON public.fortune_slips_i18n TO service_role;
