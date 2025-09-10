-- 测试高级优化函数
-- 验证所有函数是否正确定义

-- ==================================================
-- 测试函数存在性
-- ==================================================

-- 检查所有优化函数是否存在
SELECT 
    routine_name,
    routine_type,
    data_type as return_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
    'execute_advanced_optimizations',
    'auto_tune_database', 
    'check_performance_alerts',
    'generate_cron_schedule',
    'warmup_ai_analysis_cache',
    'warmup_points_cache',
    'suggest_query_optimizations',
    'create_chat_history_partitions',
    'archive_old_ai_analyses',
    'cleanup_expired_sessions',
    'run_maintenance_tasks',
    'optimize_ai_metadata',
    'refresh_ai_materialized_views'
)
ORDER BY routine_name;

-- ==================================================
-- 安全测试高级优化函数
-- ==================================================

-- 测试执行高级优化 (安全模式)
DO $$
DECLARE
    result_text TEXT;
BEGIN
    BEGIN
        SELECT execute_advanced_optimizations() INTO result_text;
        RAISE NOTICE 'Advanced optimizations executed successfully';
        RAISE NOTICE '%', LEFT(result_text, 500) || '...';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Advanced optimizations failed: %', SQLERRM;
    END;
END $$;

-- ==================================================
-- 测试基础功能
-- ==================================================

-- 测试调优建议
DO $$
DECLARE
    rec RECORD;
    count INTEGER := 0;
BEGIN
    -- 检查函数是否存在
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'auto_tune_database' AND routine_schema = 'public') THEN
        FOR rec IN SELECT * FROM auto_tune_database() LIMIT 3 LOOP
            count := count + 1;
            RAISE NOTICE 'Tuning suggestion %: % - %', count, rec.optimization_area, rec.recommended_value;
        END LOOP;
        
        IF count = 0 THEN
            RAISE NOTICE 'No tuning suggestions (system already optimized)';
        END IF;
    ELSE
        RAISE NOTICE 'auto_tune_database() function not found - please run advanced-optimization-plan.sql first';
    END IF;
END $$;

-- 测试性能告警
DO $$
DECLARE
    rec RECORD;
    count INTEGER := 0;
BEGIN
    FOR rec IN SELECT * FROM check_performance_alerts() LIMIT 3 LOOP
        count := count + 1;
        RAISE NOTICE 'Alert %: % - %', count, rec.alert_type, rec.message;
    END LOOP;
    
    IF count = 0 THEN
        RAISE NOTICE 'No performance alerts (system healthy)';
    END IF;
END $$;

-- ==================================================
-- 显示可用命令
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '测试完成! 可用的高级优化命令:';
    RAISE NOTICE '• SELECT execute_advanced_optimizations();';
    RAISE NOTICE '• SELECT * FROM auto_tune_database();';
    RAISE NOTICE '• SELECT * FROM check_performance_alerts();';
    RAISE NOTICE '• SELECT generate_cron_schedule();';
    RAISE NOTICE '==========================================';
END $$;