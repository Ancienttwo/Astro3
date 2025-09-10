-- AstroZi 完整优化执行脚本
-- 按正确顺序执行所有优化

-- ==================================================
-- 执行顺序 1: 基础优化
-- ==================================================
-- 执行基础优化...
\i sql/schema-based-optimization.sql

-- ==================================================
-- 执行顺序 2: 高级优化模块
-- ==================================================
-- 执行Redis缓存优化...
\i sql/redis-cache-optimization.sql

-- 执行数据归档策略...  
\i sql/data-archival-strategy.sql

-- 执行AI查询优化...
\i sql/ai-query-optimization.sql

-- 执行高级优化计划...
\i sql/advanced-optimization-plan.sql

-- ==================================================
-- 执行顺序 3: 验证和监控
-- ==================================================
-- 执行优化验证...
\i sql/optimization-validation.sql

-- ==================================================
-- 执行完成报告
-- ==================================================
DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'AstroZi 数据库优化完成!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '可用的监控命令:';
    RAISE NOTICE '• SELECT execute_advanced_optimizations();';
    RAISE NOTICE '• SELECT generate_health_report();';
    RAISE NOTICE '• SELECT generate_ai_performance_report();';
    RAISE NOTICE '• SELECT * FROM check_performance_alerts();';
    RAISE NOTICE '=========================================';
END $$;