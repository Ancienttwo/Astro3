-- Redis缓存优化策略
-- 针对AstroZi高频查询场景的缓存设计

-- ==================================================
-- 1. 缓存预热函数
-- ==================================================

-- AI分析结果缓存预热
CREATE OR REPLACE FUNCTION warmup_ai_analysis_cache()
RETURNS VOID AS $$
BEGIN
    -- 预热最近30天的热门分析
    PERFORM * FROM ai_analyses 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
    AND analysis_type IN ('bazi', 'ziwei')
    ORDER BY created_at DESC 
    LIMIT 1000;
    
    RAISE NOTICE 'AI分析缓存预热完成';
END;
$$ LANGUAGE plpgsql;

-- 用户积分缓存预热
CREATE OR REPLACE FUNCTION warmup_points_cache()
RETURNS VOID AS $$
BEGIN
    -- 预热活跃用户积分数据
    PERFORM * FROM mv_web3_comprehensive_leaderboard LIMIT 500;
    
    -- 预热Web2活跃用户
    PERFORM * FROM user_points_web2 
    WHERE points_balance > 0 
    ORDER BY points_balance DESC 
    LIMIT 1000;
    
    RAISE NOTICE '积分系统缓存预热完成';
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 2. 查询优化建议函数
-- ==================================================

CREATE OR REPLACE FUNCTION suggest_query_optimizations()
RETURNS TABLE(
    table_name text,
    optimization_type text,
    priority text,
    suggestion text,
    estimated_impact text
) AS $$
BEGIN
    -- 分析表大小和查询频率
    RETURN QUERY
    SELECT 
        t.tablename::text,
        'Index Optimization'::text,
        CASE 
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 100*1024*1024 THEN 'HIGH'
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 10*1024*1024 THEN 'MEDIUM'
            ELSE 'LOW'
        END::text,
        'Consider partitioning for large table: ' || pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename))::text,
        CASE 
            WHEN pg_total_relation_size(t.schemaname||'.'||t.tablename) > 100*1024*1024 THEN '40-60% query improvement'
            ELSE '20-30% query improvement'
        END::text
    FROM pg_tables t
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('ai_analyses', 'chat_history', 'translations', 'checkin_records_web2', 'checkin_records_web3')
    AND pg_total_relation_size(t.schemaname||'.'||t.tablename) > 10*1024*1024;
END;
$$ LANGUAGE plpgsql;