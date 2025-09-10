-- 关帝灵签多语言AI解读系统 - 数据库Schema v2.0
-- 创建日期: 2025-01-31
-- 基于PRP文档的完整多语言支持架构

-- =============================================================================
-- 1. 核心数据表结构
-- =============================================================================

-- 主表：语言无关核心数据（保持现有结构兼容）
CREATE TABLE IF NOT EXISTS fortune_slips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slip_number INTEGER NOT NULL,
    temple_code VARCHAR(50) NOT NULL DEFAULT 'guandi',
    fortune_level VARCHAR(20) CHECK (fortune_level IN ('excellent', 'good', 'average', 'caution', 'warning')),
    categories TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 唯一约束：同一庙宇不能有重复签号
    UNIQUE(temple_code, slip_number)
);

-- 多语言翻译表
CREATE TABLE fortune_slips_i18n (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slip_id UUID NOT NULL REFERENCES fortune_slips(id) ON DELETE CASCADE,
    language_code VARCHAR(10) NOT NULL, -- 'zh-CN', 'zh-TW', 'en-US'
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    basic_interpretation TEXT NOT NULL,
    historical_context TEXT,
    symbolism TEXT,
    keywords TEXT[], -- 关键词标签
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 每个签文每种语言只能有一条记录
    UNIQUE(slip_id, language_code)
);

-- AI解读记录表
CREATE TABLE ai_interpretations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slip_id UUID NOT NULL REFERENCES fortune_slips(id) ON DELETE CASCADE,
    user_id UUID, -- 可以为null（匿名用户）
    level VARCHAR(20) NOT NULL CHECK (level IN ('basic', 'personalized', 'deep')),
    language_code VARCHAR(10) NOT NULL,
    user_info_hash VARCHAR(64), -- 匿名化用户信息hash（用于缓存）
    interpretation TEXT NOT NULL,
    model_used VARCHAR(50) DEFAULT 'gpt-4',
    generation_time_ms INTEGER,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户使用记录表
CREATE TABLE usage_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- 可以为null（匿名用户）
    session_id VARCHAR(100),
    action_type VARCHAR(50) NOT NULL, -- 'slip_draw', 'ai_interpretation', 'language_switch'
    resource_id UUID, -- 关联的资源ID（签文ID、解读ID等）
    language_code VARCHAR(10),
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 语言配置表
CREATE TABLE language_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(100) NOT NULL,
    flag_emoji VARCHAR(10),
    rtl BOOLEAN DEFAULT FALSE,
    date_format VARCHAR(50) DEFAULT 'YYYY-MM-DD',
    number_format VARCHAR(50) DEFAULT 'en-US',
    enabled BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. 索引优化
-- =============================================================================

-- 核心查询索引
CREATE INDEX IF NOT EXISTS idx_fortune_slips_temple_number 
ON fortune_slips(temple_code, slip_number);

CREATE INDEX IF NOT EXISTS idx_fortune_slips_level 
ON fortune_slips(fortune_level);

-- 多语言查询索引
CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_lookup 
ON fortune_slips_i18n(slip_id, language_code);

CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_language 
ON fortune_slips_i18n(language_code);

CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_content 
ON fortune_slips_i18n USING gin(to_tsvector('simple', content));

-- AI解读索引
CREATE INDEX IF NOT EXISTS idx_ai_interpretations_slip_lang 
ON ai_interpretations(slip_id, language_code, level);

CREATE INDEX IF NOT EXISTS idx_ai_interpretations_user_hash 
ON ai_interpretations(user_info_hash, level) 
WHERE user_info_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_interpretations_created 
ON ai_interpretations(created_at DESC);

-- 使用记录索引
CREATE INDEX IF NOT EXISTS idx_usage_records_user_action 
ON usage_records(user_id, action_type, created_at DESC) 
WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_usage_records_session 
ON usage_records(session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_usage_records_created 
ON usage_records(created_at DESC);

-- =============================================================================
-- 3. 视图定义
-- =============================================================================

-- 完整签文视图（包含多语言内容）
CREATE OR REPLACE VIEW v_fortune_slips_complete AS
SELECT 
    fs.id,
    fs.slip_number,
    fs.temple_code,
    fs.fortune_level,
    fs.categories,
    fs.metadata,
    fsi.language_code,
    fsi.title,
    fsi.content,
    fsi.basic_interpretation,
    fsi.historical_context,
    fsi.symbolism,
    fsi.keywords,
    fs.created_at,
    fs.updated_at
FROM fortune_slips fs
LEFT JOIN fortune_slips_i18n fsi ON fs.id = fsi.slip_id;

-- AI解读统计视图
CREATE OR REPLACE VIEW v_ai_interpretation_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    language_code,
    level,
    COUNT(*) as total_interpretations,
    AVG(generation_time_ms) as avg_generation_time,
    AVG(satisfaction_rating) as avg_satisfaction,
    COUNT(CASE WHEN satisfaction_rating >= 4 THEN 1 END) as positive_ratings
FROM ai_interpretations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), language_code, level;

-- 使用统计视图
CREATE OR REPLACE VIEW v_usage_stats AS
SELECT 
    DATE_TRUNC('day', created_at) as date,
    language_code,
    action_type,
    COUNT(*) as total_actions,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT session_id) as unique_sessions
FROM usage_records
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), language_code, action_type;

-- =============================================================================
-- 4. 触发器和函数
-- =============================================================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为各表添加更新时间戳触发器
DROP TRIGGER IF EXISTS update_fortune_slips_updated_at ON fortune_slips;
CREATE TRIGGER update_fortune_slips_updated_at 
    BEFORE UPDATE ON fortune_slips 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fortune_slips_i18n_updated_at ON fortune_slips_i18n;
CREATE TRIGGER update_fortune_slips_i18n_updated_at 
    BEFORE UPDATE ON fortune_slips_i18n 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_interpretations_updated_at ON ai_interpretations;
CREATE TRIGGER update_ai_interpretations_updated_at 
    BEFORE UPDATE ON ai_interpretations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 5. 数据初始化
-- =============================================================================

-- 插入支持的语言配置
INSERT INTO language_configs (code, name, native_name, flag_emoji, sort_order) VALUES
('zh-CN', 'Chinese (Simplified)', '简体中文', '🇨🇳', 1),
('zh-TW', 'Chinese (Traditional)', '繁體中文', '🇹🇼', 2),
('en-US', 'English', 'English', '🇺🇸', 3)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    native_name = EXCLUDED.native_name,
    flag_emoji = EXCLUDED.flag_emoji,
    sort_order = EXCLUDED.sort_order;

-- =============================================================================
-- 6. 数据迁移函数
-- =============================================================================

-- 迁移现有中文数据的函数
CREATE OR REPLACE FUNCTION migrate_existing_chinese_data()
RETURNS INTEGER AS $$
DECLARE
    migrated_count INTEGER := 0;
    slip_record RECORD;
BEGIN
    -- 检查是否存在旧表结构的数据需要迁移
    FOR slip_record IN 
        SELECT id, slip_number, temple_code, fortune_level, categories,
               title, content, basic_interpretation, historical_context, symbolism
        FROM fortune_slips 
        WHERE title IS NOT NULL -- 假设有旧数据需要迁移
    LOOP
        -- 插入到多语言表
        INSERT INTO fortune_slips_i18n (
            slip_id, language_code, title, content, basic_interpretation,
            historical_context, symbolism
        ) VALUES (
            slip_record.id, 'zh-CN', 
            slip_record.title, slip_record.content, slip_record.basic_interpretation,
            slip_record.historical_context, slip_record.symbolism
        ) ON CONFLICT (slip_id, language_code) DO NOTHING;
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 7. 实用查询函数
-- =============================================================================

-- 获取签文多语言内容的函数
CREATE OR REPLACE FUNCTION get_fortune_slip_multilingual(
    p_temple_code VARCHAR(50),
    p_slip_number INTEGER,
    p_language_code VARCHAR(10) DEFAULT 'zh-CN'
)
RETURNS TABLE(
    id UUID,
    slip_number INTEGER,
    temple_code VARCHAR(50),
    fortune_level VARCHAR(20),
    categories TEXT[],
    language_code VARCHAR(10),
    title VARCHAR(500),
    content TEXT,
    basic_interpretation TEXT,
    historical_context TEXT,
    symbolism TEXT,
    keywords TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fs.id, fs.slip_number, fs.temple_code, fs.fortune_level, fs.categories,
        COALESCE(fsi.language_code, 'zh-CN') as language_code,
        COALESCE(fsi.title, 'Title not available') as title,
        COALESCE(fsi.content, 'Content not available') as content,
        COALESCE(fsi.basic_interpretation, 'Interpretation not available') as basic_interpretation,
        fsi.historical_context,
        fsi.symbolism,
        fsi.keywords
    FROM fortune_slips fs
    LEFT JOIN fortune_slips_i18n fsi ON fs.id = fsi.slip_id AND fsi.language_code = p_language_code
    WHERE fs.temple_code = p_temple_code AND fs.slip_number = p_slip_number;
END;
$$ LANGUAGE plpgsql;

-- 获取随机签文的函数
CREATE OR REPLACE FUNCTION get_random_fortune_slip(
    p_temple_code VARCHAR(50) DEFAULT 'guandi',
    p_language_code VARCHAR(10) DEFAULT 'zh-CN'
)
RETURNS TABLE(
    id UUID,
    slip_number INTEGER,
    temple_code VARCHAR(50),
    fortune_level VARCHAR(20),
    categories TEXT[],
    language_code VARCHAR(10),
    title VARCHAR(500),
    content TEXT,
    basic_interpretation TEXT,
    historical_context TEXT,
    symbolism TEXT,
    keywords TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM get_fortune_slip_multilingual(
        p_temple_code,
        (SELECT slip_number FROM fortune_slips 
         WHERE temple_code = p_temple_code 
         ORDER BY RANDOM() 
         LIMIT 1),
        p_language_code
    );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 8. 权限和安全设置
-- =============================================================================

-- RLS策略（如果启用行级安全）
ALTER TABLE ai_interpretations ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能查看自己的AI解读记录
CREATE POLICY ai_interpretations_user_access ON ai_interpretations
    FOR ALL TO authenticated
    USING (auth.uid() = user_id);

-- 创建策略：匿名用户可以查看基础解读
CREATE POLICY ai_interpretations_anonymous_basic ON ai_interpretations
    FOR SELECT TO anon
    USING (level = 'basic' AND user_id IS NULL);

-- =============================================================================
-- 9. 性能优化建议
-- =============================================================================

-- 分区表（如果数据量很大）
-- CREATE TABLE ai_interpretations_2025 PARTITION OF ai_interpretations
-- FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- 定期清理策略（删除90天前的匿名使用记录）
-- CREATE OR REPLACE FUNCTION cleanup_old_usage_records()
-- RETURNS INTEGER AS $$
-- BEGIN
--     DELETE FROM usage_records 
--     WHERE user_id IS NULL 
--     AND created_at < NOW() - INTERVAL '90 days';
--     
--     GET DIAGNOSTICS result = ROW_COUNT;
--     RETURN result;
-- END;
-- $$ LANGUAGE plpgsql;

COMMENT ON TABLE fortune_slips IS '签文主表：存储语言无关的核心数据';
COMMENT ON TABLE fortune_slips_i18n IS '签文多语言翻译表：存储各语言版本的内容';
COMMENT ON TABLE ai_interpretations IS 'AI解读记录表：存储用户请求的AI解读结果';
COMMENT ON TABLE usage_records IS '使用记录表：用于分析和统计用户行为';
COMMENT ON TABLE language_configs IS '语言配置表：管理支持的语言设置';

-- 创建完成提示
SELECT 'Multilingual Fortune System Schema Created Successfully!' as status;