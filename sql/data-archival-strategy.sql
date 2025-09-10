-- 数据归档和分区策略
-- 针对AI分析、聊天记录等大数据量表的优化

-- ==================================================
-- 1. 聊天历史分区策略
-- ==================================================

-- 创建聊天历史分区表
CREATE TABLE IF NOT EXISTS chat_history_partitioned (
    id uuid DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    conversation_id character varying,
    message_type character varying CHECK (message_type::text = ANY (ARRAY['user'::character varying, 'assistant'::character varying]::text[])),
    content text NOT NULL,
    agent_type character varying,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    
    -- 复合主键包含分区列
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE OR REPLACE FUNCTION create_chat_history_partitions()
RETURNS VOID AS $$
DECLARE
    start_date DATE;
    end_date DATE;
    partition_name TEXT;
BEGIN
    -- 创建未来12个月的分区
    FOR i IN 0..11 LOOP
        start_date := DATE_TRUNC('month', CURRENT_DATE + (i * INTERVAL '1 month'));
        end_date := start_date + INTERVAL '1 month';
        partition_name := 'chat_history_' || TO_CHAR(start_date, 'YYYY_MM');
        
        EXECUTE format('CREATE TABLE IF NOT EXISTS %I PARTITION OF chat_history_partitioned 
                       FOR VALUES FROM (%L) TO (%L)', 
                       partition_name, start_date, end_date);
    END LOOP;
    
    RAISE NOTICE '聊天历史分区创建完成';
END;
$$ LANGUAGE plpgsql;

-- 为分区表创建索引
CREATE INDEX IF NOT EXISTS idx_chat_history_part_user_id 
ON chat_history_partitioned(user_id);

CREATE INDEX IF NOT EXISTS idx_chat_history_part_conversation 
ON chat_history_partitioned(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_history_part_agent_type 
ON chat_history_partitioned(agent_type, created_at);

-- ==================================================
-- 2. AI分析结果归档策略
-- ==================================================

-- 创建AI分析归档表
CREATE TABLE IF NOT EXISTS ai_analyses_archive (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    chart_id uuid NOT NULL,
    analysis_type character varying NOT NULL CHECK (analysis_type::text = ANY (ARRAY['yongshen_analysis'::character varying, 'tiekou_zhiduan'::character varying, 'ziwei_reasoning'::character varying, 'sihua_reasoning'::character varying]::text[])),
    content text NOT NULL,
    agent_name character varying,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    PRIMARY KEY (id)
);

-- AI分析归档函数
CREATE OR REPLACE FUNCTION archive_old_ai_analyses(archive_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- 将超过指定天数的分析移动到归档表
    WITH archived_data AS (
        DELETE FROM ai_analyses 
        WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * archive_days
        RETURNING *
    )
    INSERT INTO ai_analyses_archive (
        id, user_id, chart_id, analysis_type, content, 
        agent_name, metadata, created_at, updated_at, archived_at
    )
    SELECT 
        id, user_id, chart_id, analysis_type, content,
        agent_name, metadata, created_at, updated_at, CURRENT_TIMESTAMP
    FROM archived_data;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RAISE NOTICE '已归档 % 条AI分析记录', archived_count;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 3. 翻译数据优化
-- ==================================================

-- 翻译完成状态优化索引
CREATE INDEX IF NOT EXISTS idx_translations_status_priority_updated 
ON translations(status, priority DESC, updated_at DESC) 
WHERE status IN ('pending', 'translated');

-- 翻译批量处理函数
CREATE OR REPLACE FUNCTION get_translation_batch(batch_size INTEGER DEFAULT 50)
RETURNS TABLE(
    id INTEGER,
    key VARCHAR,
    chinese_text TEXT,
    priority INTEGER,
    category_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.key,
        t.chinese_text,
        t.priority,
        tc.name as category_name
    FROM translations t
    LEFT JOIN translation_categories tc ON tc.id = t.category_id
    WHERE t.status = 'pending'
    ORDER BY t.priority DESC, t.created_at ASC
    LIMIT batch_size;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 4. 自动清理策略
-- ==================================================

-- Web3认证会话清理
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    DELETE FROM web3_auth_sessions 
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    RAISE NOTICE '清理了 % 个过期会话', cleaned_count;
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- 注册码清理
CREATE OR REPLACE FUNCTION cleanup_expired_registration_codes()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    DELETE FROM registration_codes 
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND is_used = false;
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    RAISE NOTICE '清理了 % 个过期注册码', cleaned_count;
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 5. 定期维护调度
-- ==================================================

-- 综合清理任务
CREATE OR REPLACE FUNCTION run_maintenance_tasks()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
    sessions_cleaned INTEGER;
    codes_cleaned INTEGER;
BEGIN
    -- 清理过期会话
    SELECT cleanup_expired_sessions() INTO sessions_cleaned;
    result_text := result_text || format('清理会话: %s 个\n', sessions_cleaned);
    
    -- 清理过期注册码
    SELECT cleanup_expired_registration_codes() INTO codes_cleaned;
    result_text := result_text || format('清理注册码: %s 个\n', codes_cleaned);
    
    -- 更新统计信息
    ANALYZE ai_analyses;
    ANALYZE chat_history;
    ANALYZE translations;
    result_text := result_text || '统计信息已更新\n';
    
    -- 缓存预热
    PERFORM warmup_ai_analysis_cache();
    PERFORM warmup_points_cache();
    result_text := result_text || '缓存预热完成\n';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;