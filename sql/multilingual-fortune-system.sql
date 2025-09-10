-- 关帝灵签多语言系统数据库设计
-- 创建日期: 2025-01-31
-- 版本: v1.0

-- ============================================================================
-- 1. 多语言翻译表
-- ============================================================================

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
    
    -- 外键约束（假设已存在fortune_divination_slips表）
    FOREIGN KEY (slip_id) REFERENCES fortune_divination_slips(id) ON DELETE CASCADE
);

-- ============================================================================
-- 2. 索引优化
-- ============================================================================

-- 复合索引：按语言和签文查询优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fortune_slips_i18n_lookup 
ON fortune_slips_i18n(slip_id, language_code);

-- 语言代码索引：统计和管理优化
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fortune_slips_i18n_language 
ON fortune_slips_i18n(language_code);

-- 包含索引：减少回表查询
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fortune_slips_i18n_content 
ON fortune_slips_i18n(language_code, slip_id) 
INCLUDE (title, content, basic_interpretation);

-- 全文搜索索引（支持多语言搜索）
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fortune_slips_i18n_fulltext 
ON fortune_slips_i18n USING gin(to_tsvector('simple', title || ' ' || content || ' ' || basic_interpretation));

-- ============================================================================
-- 3. AI解读记录表
-- ============================================================================

-- AI解读层级枚举
CREATE TYPE interpretation_level AS ENUM ('basic', 'personalized', 'deep');

-- AI解读记录表
CREATE TABLE IF NOT EXISTS ai_interpretations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slip_id UUID NOT NULL,
    user_id UUID, -- 可为空，支持匿名用户
    level interpretation_level NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    user_info_hash VARCHAR(64), -- 匿名化用户信息hash（用于缓存）
    interpretation TEXT NOT NULL,
    satisfaction_rating INTEGER CHECK (satisfaction_rating BETWEEN 1 AND 5),
    feedback TEXT,
    processing_time_ms INTEGER, -- AI生成耗时
    token_usage INTEGER, -- AI token使用量
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (slip_id) REFERENCES fortune_divination_slips(id) ON DELETE CASCADE
);

-- AI解读索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_interpretations_lookup 
ON ai_interpretations(slip_id, level, language_code);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_interpretations_user 
ON ai_interpretations(user_id, created_at DESC) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ai_interpretations_cache 
ON ai_interpretations(user_info_hash, slip_id, level, language_code) WHERE user_info_hash IS NOT NULL;

-- ============================================================================
-- 4. 用户使用记录表
-- ============================================================================

-- 用户行为类型
CREATE TYPE user_action_type AS ENUM ('slip_draw', 'ai_interpretation', 'language_switch');

-- 用户使用记录表
CREATE TABLE IF NOT EXISTS user_usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID, -- 可为空，支持匿名用户
    session_id VARCHAR(255) NOT NULL, -- 会话ID，用于匿名用户追踪
    action_type user_action_type NOT NULL,
    resource_id VARCHAR(255) NOT NULL, -- 签文ID、解读ID等
    language_code VARCHAR(10) NOT NULL,
    metadata JSONB DEFAULT '{}', -- 额外的元数据
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 分区表（按月分区）
CREATE TABLE user_usage_records_y2025m01 PARTITION OF user_usage_records 
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE user_usage_records_y2025m02 PARTITION OF user_usage_records 
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- 使用记录索引
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_usage_records_user_time 
ON user_usage_records(user_id, created_at DESC) WHERE user_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_usage_records_session_time 
ON user_usage_records(session_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_usage_records_action_time 
ON user_usage_records(action_type, created_at DESC);

-- ============================================================================
-- 5. 数据迁移：现有中文数据
-- ============================================================================

-- 将现有中文签文数据迁移到多语言表
INSERT INTO fortune_slips_i18n (
    slip_id, 
    language_code, 
    title, 
    content, 
    basic_interpretation,
    historical_context,
    symbolism
)
SELECT 
    id,
    'zh-CN',
    title,
    content,
    basic_interpretation,
    historical_context,
    symbolism
FROM fortune_divination_slips
WHERE temple_code = 'guandi'
ON CONFLICT (slip_id, language_code) DO NOTHING;

-- ============================================================================
-- 6. 触发器：自动更新时间戳
-- ============================================================================

-- 创建更新触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为fortune_slips_i18n表添加更新触发器
CREATE TRIGGER update_fortune_slips_i18n_updated_at 
    BEFORE UPDATE ON fortune_slips_i18n 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. 视图：便于查询
-- ============================================================================

-- 多语言签文完整信息视图
CREATE OR REPLACE VIEW v_fortune_slips_multilingual AS
SELECT 
    fs.id as slip_id,
    fs.slip_number,
    fs.temple_code,
    fs.fortune_level,
    fs.categories,
    fsi.language_code,
    fsi.title,
    fsi.content,
    fsi.basic_interpretation,
    fsi.historical_context,
    fsi.symbolism,
    fs.created_at as slip_created_at,
    fsi.updated_at as translation_updated_at
FROM fortune_divination_slips fs
LEFT JOIN fortune_slips_i18n fsi ON fs.id = fsi.slip_id
WHERE fs.temple_code = 'guandi'
ORDER BY fs.slip_number, fsi.language_code;

-- 签文翻译完整度统计视图
CREATE OR REPLACE VIEW v_translation_completeness AS
SELECT 
    temple_code,
    COUNT(*) as total_slips,
    COUNT(CASE WHEN zh_cn_count > 0 THEN 1 END) as zh_cn_translated,
    COUNT(CASE WHEN zh_tw_count > 0 THEN 1 END) as zh_tw_translated,
    COUNT(CASE WHEN en_us_count > 0 THEN 1 END) as en_us_translated,
    ROUND(100.0 * COUNT(CASE WHEN zh_cn_count > 0 THEN 1 END) / COUNT(*), 2) as zh_cn_completion_rate,
    ROUND(100.0 * COUNT(CASE WHEN zh_tw_count > 0 THEN 1 END) / COUNT(*), 2) as zh_tw_completion_rate,
    ROUND(100.0 * COUNT(CASE WHEN en_us_count > 0 THEN 1 END) / COUNT(*), 2) as en_us_completion_rate
FROM (
    SELECT 
        fs.temple_code,
        fs.id,
        COUNT(CASE WHEN fsi.language_code = 'zh-CN' THEN 1 END) as zh_cn_count,
        COUNT(CASE WHEN fsi.language_code = 'zh-TW' THEN 1 END) as zh_tw_count,
        COUNT(CASE WHEN fsi.language_code = 'en-US' THEN 1 END) as en_us_count
    FROM fortune_divination_slips fs
    LEFT JOIN fortune_slips_i18n fsi ON fs.id = fsi.slip_id
    GROUP BY fs.temple_code, fs.id
) translation_stats
GROUP BY temple_code;

-- ============================================================================
-- 8. 存储过程：常用查询优化
-- ============================================================================

-- 获取指定语言的签文信息
CREATE OR REPLACE FUNCTION get_fortune_slip_by_language(
    p_temple_code VARCHAR(50),
    p_slip_number INTEGER,
    p_language_code VARCHAR(10) DEFAULT 'zh-CN'
)
RETURNS TABLE(
    slip_id UUID,
    slip_number INTEGER,
    temple_code VARCHAR(50),
    fortune_level VARCHAR(20),
    categories TEXT[],
    language_code VARCHAR(10),
    title VARCHAR(200),
    content TEXT,
    basic_interpretation TEXT,
    historical_context TEXT,
    symbolism TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fs.id,
        fs.slip_number,
        fs.temple_code,
        fs.fortune_level::VARCHAR(20),
        fs.categories,
        COALESCE(fsi.language_code, 'zh-CN'),
        COALESCE(fsi.title, fs.title),
        COALESCE(fsi.content, fs.content),
        COALESCE(fsi.basic_interpretation, fs.basic_interpretation),
        fsi.historical_context,
        fsi.symbolism
    FROM fortune_divination_slips fs
    LEFT JOIN fortune_slips_i18n fsi ON fs.id = fsi.slip_id AND fsi.language_code = p_language_code
    WHERE fs.temple_code = p_temple_code AND fs.slip_number = p_slip_number;
END;
$$ LANGUAGE plpgsql;

-- 随机获取签文（支持多语言）
CREATE OR REPLACE FUNCTION get_random_fortune_slip(
    p_temple_code VARCHAR(50),
    p_language_code VARCHAR(10) DEFAULT 'zh-CN'
)
RETURNS TABLE(
    slip_id UUID,
    slip_number INTEGER,
    temple_code VARCHAR(50),
    fortune_level VARCHAR(20),
    categories TEXT[],
    language_code VARCHAR(10),
    title VARCHAR(200),
    content TEXT,
    basic_interpretation TEXT,
    historical_context TEXT,
    symbolism TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM get_fortune_slip_by_language(
        p_temple_code,
        (SELECT fs.slip_number 
         FROM fortune_divination_slips fs 
         WHERE fs.temple_code = p_temple_code 
         ORDER BY RANDOM() 
         LIMIT 1),
        p_language_code
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. 数据完整性检查
-- ============================================================================

-- 检查孤立的翻译记录
CREATE OR REPLACE FUNCTION check_orphaned_translations()
RETURNS TABLE(
    orphaned_translation_id UUID,
    slip_id UUID,
    language_code VARCHAR(10)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fsi.id,
        fsi.slip_id,
        fsi.language_code
    FROM fortune_slips_i18n fsi
    LEFT JOIN fortune_divination_slips fs ON fsi.slip_id = fs.id
    WHERE fs.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 检查缺失翻译的签文
CREATE OR REPLACE FUNCTION check_missing_translations(p_language_code VARCHAR(10))
RETURNS TABLE(
    slip_id UUID,
    slip_number INTEGER,
    temple_code VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fs.id,
        fs.slip_number,
        fs.temple_code
    FROM fortune_divination_slips fs
    LEFT JOIN fortune_slips_i18n fsi ON fs.id = fsi.slip_id AND fsi.language_code = p_language_code
    WHERE fsi.id IS NULL
    ORDER BY fs.temple_code, fs.slip_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 10. 初始数据验证
-- ============================================================================

-- 验证数据迁移结果
DO $$
DECLARE
    total_slips INTEGER;
    migrated_slips INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_slips FROM fortune_divination_slips WHERE temple_code = 'guandi';
    SELECT COUNT(*) INTO migrated_slips FROM fortune_slips_i18n WHERE language_code = 'zh-CN';
    
    RAISE NOTICE '关帝签文总数: %, 已迁移中文翻译: %', total_slips, migrated_slips;
    
    IF total_slips != migrated_slips THEN
        RAISE WARNING '数据迁移不完整！请检查迁移过程。';
    ELSE
        RAISE NOTICE '✅ 数据迁移完成！';
    END IF;
END $$;

-- ============================================================================
-- 总结和使用说明
-- ============================================================================

/*
多语言关帝灵签系统数据库架构已创建完成！

📋 主要功能：
1. ✅ 多语言翻译支持（简体中文、繁体中文、英文）
2. ✅ AI解读记录和缓存系统
3. ✅ 用户行为追踪和分析
4. ✅ 性能优化索引和视图
5. ✅ 数据完整性保证

🚀 主要API函数：
- get_fortune_slip_by_language(temple_code, slip_number, language) -- 获取指定语言签文
- get_random_fortune_slip(temple_code, language) -- 随机获取签文
- check_missing_translations(language) -- 检查缺失翻译
- check_orphaned_translations() -- 检查孤立翻译

📊 统计视图：
- v_fortune_slips_multilingual -- 完整多语言签文信息
- v_translation_completeness -- 翻译完整度统计

🎯 下一步工作：
1. 添加繁体中文和英文翻译数据
2. 开发多语言API端点
3. 实现前端语言切换功能
4. 集成AI解读服务

使用示例：
-- 获取关帝第1签的英文版本
SELECT * FROM get_fortune_slip_by_language('guandi', 1, 'en-US');

-- 随机获取关帝签文（繁体中文）
SELECT * FROM get_random_fortune_slip('guandi', 'zh-TW');

-- 检查英文翻译完整度
SELECT * FROM v_translation_completeness WHERE temple_code = 'guandi';
*/