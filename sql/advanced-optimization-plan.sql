-- AstroZi 高级优化执行计划
-- 整合所有优化策略的统一执行脚本

-- ==================================================
-- 执行顺序说明
-- ==================================================
-- 1. 先执行基础优化: schema-based-optimization.sql
-- 2. 再执行此高级优化计划
-- 3. 最后执行验证: optimization-validation.sql

-- ==================================================
-- 注意: 执行此脚本前请先执行以下命令:
-- \i sql/redis-cache-optimization.sql
-- \i sql/data-archival-strategy.sql  
-- \i sql/ai-query-optimization.sql
-- ==================================================

-- ==================================================
-- 统一优化配置函数
-- ==================================================

-- 一键执行所有高级优化
CREATE OR REPLACE FUNCTION execute_advanced_optimizations()
RETURNS TEXT AS $$
DECLARE
    result_text TEXT := '';
    start_time TIMESTAMP := CURRENT_TIMESTAMP;
    rec RECORD;
BEGIN
    result_text := E'=== AstroZi 高级优化执行报告 ===\n';
    result_text := result_text || format('开始时间: %s\n\n', start_time);
    
    -- 1. 创建分区表
    PERFORM create_chat_history_partitions();
    result_text := result_text || E'✅ 聊天历史分区创建完成\n';
    
    -- 2. 优化AI元数据
    result_text := result_text || format('✅ AI元数据优化: %s 条记录\n', optimize_ai_metadata());
    
    -- 3. 刷新AI物化视图
    PERFORM refresh_ai_materialized_views();
    result_text := result_text || E'✅ AI物化视图刷新完成\n';
    
    -- 4. 缓存预热
    PERFORM warmup_ai_analysis_cache();
    PERFORM warmup_points_cache();
    result_text := result_text || E'✅ 缓存预热完成\n';
    
    -- 5. 清理任务
    result_text := result_text || E'✅ 维护任务:\n';
    result_text := result_text || run_maintenance_tasks();
    
    -- 6. 生成优化建议
    result_text := result_text || E'\n📊 优化建议:\n';
    FOR rec IN SELECT * FROM suggest_query_optimizations() LOOP
        result_text := result_text || format('• %s: %s [%s]\n', 
            rec.table_name, rec.suggestion, rec.priority);
    END LOOP;
    
    result_text := result_text || format(E'\n完成时间: %s\n', CURRENT_TIMESTAMP);
    result_text := result_text || format('总耗时: %s\n', CURRENT_TIMESTAMP - start_time);
    result_text := result_text || E'========================================\n';
    
    RETURN result_text;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 3. 智能性能调优函数
-- ==================================================

-- 自动检测并应用最佳配置
CREATE OR REPLACE FUNCTION auto_tune_database()
RETURNS TABLE(
    optimization_area TEXT,
    current_value TEXT,
    recommended_value TEXT,
    impact_level TEXT
) AS $$
BEGIN
    -- 分析当前数据库状态并提供调优建议
    RETURN QUERY
    WITH table_stats AS (
        SELECT 
            schemaname,
            relname as tablename,
            n_tup_ins + n_tup_upd + n_tup_del as total_writes,
            seq_scan,
            seq_tup_read,
            idx_scan,
            pg_total_relation_size(schemaname||'.'||relname) as table_size
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
    )
    SELECT 
        'Large Table Optimization'::TEXT,
        format('Table: %s, Size: %s', tablename, pg_size_pretty(table_size))::TEXT,
        'Consider partitioning or archival'::TEXT,
        CASE 
            WHEN table_size > 500*1024*1024 THEN 'HIGH'
            WHEN table_size > 100*1024*1024 THEN 'MEDIUM' 
            ELSE 'LOW'
        END::TEXT
    FROM table_stats
    WHERE table_size > 50*1024*1024
    
    UNION ALL
    
    SELECT 
        'Index Usage Optimization'::TEXT,
        format('Table: %s, Seq scans: %s, Index scans: %s', tablename, seq_scan, idx_scan)::TEXT,
        'Add missing indexes for frequently scanned tables'::TEXT,
        CASE 
            WHEN seq_scan > idx_scan AND seq_scan > 1000 THEN 'HIGH'
            WHEN seq_scan > idx_scan AND seq_scan > 100 THEN 'MEDIUM'
            ELSE 'LOW' 
        END::TEXT
    FROM table_stats
    WHERE seq_scan > idx_scan AND seq_scan > 50
    
    UNION ALL
    
    SELECT 
        'Write Performance'::TEXT,
        format('Table: %s, Total writes: %s', tablename, total_writes)::TEXT,
        'Consider write-optimized storage for high-write tables'::TEXT,
        CASE 
            WHEN total_writes > 100000 THEN 'HIGH'
            WHEN total_writes > 10000 THEN 'MEDIUM'
            ELSE 'LOW'
        END::TEXT
    FROM table_stats
    WHERE total_writes > 5000;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 4. 监控和告警系统
-- ==================================================

-- 性能告警检查
CREATE OR REPLACE FUNCTION check_performance_alerts()
RETURNS TABLE(
    alert_type TEXT,
    severity TEXT,
    message TEXT,
    action_required TEXT
) AS $$
BEGIN
    -- 检查慢查询
    RETURN QUERY
    SELECT 
        'Slow Queries'::TEXT,
        'WARNING'::TEXT,
        'Multiple slow queries detected'::TEXT,
        'Review query execution plans and add indexes'::TEXT
    WHERE EXISTS (
        SELECT 1 FROM benchmark_optimized_queries() 
        WHERE performance_level IN ('Fair', 'Needs Improvement')
    );
    
    -- 检查磁盘空间
    RETURN QUERY
    SELECT 
        'Disk Usage'::TEXT,
        CASE 
            WHEN pg_database_size(current_database()) > 10*1024*1024*1024 THEN 'CRITICAL'
            WHEN pg_database_size(current_database()) > 5*1024*1024*1024 THEN 'WARNING'
            ELSE 'INFO'
        END::TEXT,
        format('Database size: %s', pg_size_pretty(pg_database_size(current_database())))::TEXT,
        'Consider data archival or cleanup'::TEXT
    WHERE pg_database_size(current_database()) > 1*1024*1024*1024;
    
    -- 检查连接数
    RETURN QUERY
    SELECT 
        'Connection Pool'::TEXT,
        'INFO'::TEXT,
        format('Active connections: %s', COUNT(*))::TEXT,
        'Monitor connection pool efficiency'::TEXT
    FROM pg_stat_activity
    WHERE state = 'active'
    GROUP BY 1,2,4
    HAVING COUNT(*) > 20;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 5. 定期任务调度建议
-- ==================================================

-- 生成cron任务配置
CREATE OR REPLACE FUNCTION generate_cron_schedule()
RETURNS TEXT AS $$
BEGIN
    RETURN E'# AstroZi 数据库维护 Cron 配置\n' ||
           E'# 添加到 crontab -e\n\n' ||
           E'# 每日凌晨2点 - 完整维护\n' ||
           E'0 2 * * * psql -d astrozi -c "SELECT run_maintenance_tasks();"\n\n' ||
           E'# 每4小时 - 缓存预热\n' ||
           E'0 */4 * * * psql -d astrozi -c "SELECT warmup_ai_analysis_cache(); SELECT warmup_points_cache();"\n\n' ||
           E'# 每周日凌晨3点 - AI物化视图刷新\n' ||
           E'0 3 * * 0 psql -d astrozi -c "SELECT refresh_ai_materialized_views();"\n\n' ||
           E'# 每月1号 - 数据归档\n' ||
           E'0 4 1 * * psql -d astrozi -c "SELECT archive_old_ai_analyses(365);"\n\n' ||
           E'# 每小时 - 性能告警检查\n' ||
           E'0 * * * * psql -d astrozi -c "SELECT * FROM check_performance_alerts();" | grep -v "0 rows" && echo "Performance alerts detected!"\n';
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 执行高级优化
-- ==================================================

-- 注释掉自动执行，改为手动调用
-- SELECT execute_advanced_optimizations();

-- 显示调优建议
DO $$
DECLARE
    tuning_rec RECORD;
    alert_rec RECORD;
    cron_config TEXT;
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AUTO-TUNING RECOMMENDATIONS:';
    RAISE NOTICE '========================================';
    
    FOR tuning_rec IN SELECT * FROM auto_tune_database() LOOP
        RAISE NOTICE '• %: %s → %s [%s]', 
            tuning_rec.optimization_area, 
            tuning_rec.current_value,
            tuning_rec.recommended_value,
            tuning_rec.impact_level;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PERFORMANCE ALERTS:';
    RAISE NOTICE '========================================';
    
    FOR alert_rec IN SELECT * FROM check_performance_alerts() LOOP
        RAISE NOTICE '🚨 %: %s [%s]', 
            alert_rec.alert_type,
            alert_rec.message,
            alert_rec.severity;
        RAISE NOTICE '   Action: %s', alert_rec.action_required;
    END LOOP;
    
    -- 显示Cron配置
    SELECT generate_cron_schedule() INTO cron_config;
    RAISE NOTICE '';
    RAISE NOTICE '%', cron_config;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Available optimization commands:';
    RAISE NOTICE '• SELECT execute_advanced_optimizations();';
    RAISE NOTICE '• SELECT generate_ai_performance_report();';
    RAISE NOTICE '• SELECT get_user_ai_recommendations(user_uuid);';
    RAISE NOTICE '• SELECT * FROM auto_tune_database();';
    RAISE NOTICE '• SELECT * FROM check_performance_alerts();';
    RAISE NOTICE '========================================';
END $$;