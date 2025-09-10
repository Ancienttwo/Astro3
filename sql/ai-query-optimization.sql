-- AI查询性能专项优化
-- 针对八字、紫微等AI分析的高频查询优化

-- ==================================================
-- 1. AI分析专用物化视图
-- ==================================================

-- 用户AI分析统计视图
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_user_ai_statistics AS
SELECT 
    uc.user_id,
    COUNT(DISTINCT uc.id) as total_charts,
    COUNT(DISTINCT aa.id) as total_analyses,
    COUNT(DISTINCT CASE WHEN aa.analysis_type = 'yongshen_analysis' THEN aa.id END) as yongshen_count,
    COUNT(DISTINCT CASE WHEN aa.analysis_type = 'ziwei_reasoning' THEN aa.id END) as ziwei_count,
    COUNT(DISTINCT CASE WHEN uc.chart_type = 'bazi' THEN uc.id END) as bazi_charts,
    COUNT(DISTINCT CASE WHEN uc.chart_type = 'ziwei' THEN uc.id END) as ziwei_charts,
    MAX(aa.created_at) as last_analysis_date,
    AVG(LENGTH(aa.content)) as avg_analysis_length
FROM user_charts uc
LEFT JOIN ai_analyses aa ON aa.chart_id = uc.id
GROUP BY uc.user_id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_user_ai_stats_user_id 
ON mv_user_ai_statistics(user_id);

-- AI分析热门内容视图
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_popular_ai_analyses AS
SELECT 
    aa.analysis_type,
    aa.agent_name,
    COUNT(*) as usage_count,
    AVG(LENGTH(aa.content)) as avg_content_length,
    DATE_TRUNC('day', aa.created_at) as analysis_date,
    EXTRACT(HOUR FROM aa.created_at) as peak_hour
FROM ai_analyses aa
WHERE aa.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY aa.analysis_type, aa.agent_name, DATE_TRUNC('day', aa.created_at), EXTRACT(HOUR FROM aa.created_at)
ORDER BY usage_count DESC;

CREATE INDEX IF NOT EXISTS idx_mv_popular_ai_type_date 
ON mv_popular_ai_analyses(analysis_type, analysis_date DESC);

-- ==================================================
-- 2. 智能查询路由函数
-- ==================================================

-- 获取用户最佳AI分析建议
CREATE OR REPLACE FUNCTION get_user_ai_recommendations(input_user_id UUID)
RETURNS TABLE(
    recommended_analysis_type TEXT,
    priority_score NUMERIC,
    reason TEXT,
    estimated_accuracy NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH user_stats AS (
        SELECT * FROM mv_user_ai_statistics WHERE user_id = input_user_id
    ),
    user_charts AS (
        SELECT chart_type, COUNT(*) as chart_count 
        FROM user_charts 
        WHERE user_id = input_user_id 
        GROUP BY chart_type
    )
    SELECT 
        CASE 
            WHEN us.yongshen_count < us.ziwei_count THEN 'yongshen_analysis'
            WHEN us.ziwei_count < 3 THEN 'ziwei_reasoning'
            ELSE 'tiekou_zhiduan'
        END::TEXT as recommended_analysis_type,
        CASE 
            WHEN us.total_analyses < 5 THEN 10.0
            WHEN us.last_analysis_date < CURRENT_DATE - INTERVAL '7 days' THEN 8.0
            ELSE 5.0
        END::NUMERIC as priority_score,
        CASE 
            WHEN us.total_analyses < 5 THEN 'New user - comprehensive analysis recommended'
            WHEN us.last_analysis_date < CURRENT_DATE - INTERVAL '7 days' THEN 'User returning after break'
            ELSE 'Regular user - advanced analysis'
        END::TEXT as reason,
        CASE 
            WHEN us.total_charts >= 3 THEN 0.95
            WHEN us.total_charts >= 1 THEN 0.85
            ELSE 0.75
        END::NUMERIC as estimated_accuracy
    FROM user_stats us
    CROSS JOIN user_charts uc
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 3. AI内容相似度分析
-- ==================================================

-- 查找相似AI分析内容 (防重复生成)
CREATE OR REPLACE FUNCTION find_similar_analyses(
    chart_id_input UUID,
    analysis_type_input TEXT,
    similarity_threshold NUMERIC DEFAULT 0.8
) RETURNS TABLE(
    similar_analysis_id UUID,
    similarity_score NUMERIC,
    content_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        aa.id as similar_analysis_id,
        -- 简单的相似度计算(基于内容长度和关键词)
        (CASE 
            WHEN LENGTH(aa.content) BETWEEN LENGTH(target.content) * 0.8 AND LENGTH(target.content) * 1.2 
            THEN 0.8 
            ELSE 0.3 
        END)::NUMERIC as similarity_score,
        LEFT(aa.content, 200)::TEXT as content_preview,
        aa.created_at
    FROM ai_analyses aa
    CROSS JOIN (
        SELECT content FROM ai_analyses 
        WHERE chart_id = chart_id_input 
        AND analysis_type = analysis_type_input 
        ORDER BY created_at DESC 
        LIMIT 1
    ) target
    WHERE aa.chart_id != chart_id_input
    AND aa.analysis_type = analysis_type_input
    AND aa.created_at >= CURRENT_DATE - INTERVAL '90 days'
    AND LENGTH(aa.content) > 100
    ORDER BY similarity_score DESC
    LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 4. AI性能监控函数
-- ==================================================

-- AI系统性能报告
CREATE OR REPLACE FUNCTION generate_ai_performance_report()
RETURNS TEXT AS $$
DECLARE
    report TEXT := '';
    daily_analyses INTEGER;
    avg_response_time NUMERIC;
    popular_type TEXT;
    active_users INTEGER;
BEGIN
    -- 今日分析数量
    SELECT COUNT(*) INTO daily_analyses 
    FROM ai_analyses 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    -- 获取最受欢迎的分析类型
    SELECT analysis_type INTO popular_type
    FROM mv_popular_ai_analyses 
    WHERE analysis_date = CURRENT_DATE 
    ORDER BY usage_count DESC 
    LIMIT 1;
    
    -- 活跃用户数
    SELECT COUNT(DISTINCT user_id) INTO active_users
    FROM ai_analyses aa
    JOIN user_charts uc ON uc.id = aa.chart_id
    WHERE aa.created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    -- 构建报告
    report := E'=== AI系统性能报告 ===\n';
    report := report || format('今日AI分析: %s 次\n', COALESCE(daily_analyses, 0));
    report := report || format('热门分析类型: %s\n', COALESCE(popular_type, 'N/A'));
    report := report || format('7日活跃用户: %s 人\n', COALESCE(active_users, 0));
    report := report || format('报告生成时间: %s\n', CURRENT_TIMESTAMP);
    
    RETURN report;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 5. 批量优化操作
-- ==================================================

-- 批量更新AI分析元数据
CREATE OR REPLACE FUNCTION optimize_ai_metadata()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- 更新空的metadata字段
    UPDATE ai_analyses 
    SET metadata = jsonb_build_object(
        'content_length', LENGTH(content),
        'word_count', array_length(string_to_array(content, ' '), 1),
        'analysis_complexity', 
        CASE 
            WHEN LENGTH(content) > 2000 THEN 'complex'
            WHEN LENGTH(content) > 1000 THEN 'medium'
            ELSE 'simple'
        END,
        'updated_at', CURRENT_TIMESTAMP
    )
    WHERE metadata IS NULL OR metadata = '{}';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RAISE NOTICE '更新了 % 条AI分析元数据', updated_count;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- 刷新AI相关物化视图
CREATE OR REPLACE FUNCTION refresh_ai_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_user_ai_statistics;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_popular_ai_analyses;
    RAISE NOTICE 'AI物化视图刷新完成';
EXCEPTION
    WHEN OTHERS THEN
        REFRESH MATERIALIZED VIEW mv_user_ai_statistics;
        REFRESH MATERIALIZED VIEW mv_popular_ai_analyses;
        RAISE NOTICE 'AI物化视图刷新完成 (非并发模式)';
END;
$$ LANGUAGE plpgsql;