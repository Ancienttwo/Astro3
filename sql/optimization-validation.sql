-- AstroZi 数据库优化验证和错误检查脚本
-- 创建日期: 2025-01-14
-- 说明: 验证优化效果，检查潜在问题，监控性能指标

-- ==================================================
-- 1. 索引创建验证
-- ==================================================

-- 检查所有优化索引是否创建成功
CREATE OR REPLACE VIEW v_optimization_index_status AS
SELECT 
    pi.schemaname,
    pi.tablename,
    pi.indexname,
    pi.indexdef,
    CASE 
        WHEN pi.indexname LIKE 'idx_%' THEN 'Optimization Index'
        WHEN pi.indexname LIKE '%_pkey' THEN 'Primary Key'
        WHEN pi.indexname LIKE '%_fkey' THEN 'Foreign Key'
        ELSE 'Other Index'
    END as index_type,
    pg_size_pretty(pg_relation_size(pc.oid)) as index_size
FROM pg_indexes pi
JOIN pg_class pc ON pc.relname = pi.indexname
WHERE pi.schemaname = 'public'
AND (pi.tablename LIKE '%user%' OR pi.tablename LIKE '%point%' OR pi.tablename LIKE '%checkin%' 
     OR pi.tablename LIKE '%airdrop%' OR pi.tablename LIKE '%ai_%' OR pi.tablename LIKE '%translation%')
ORDER BY pi.tablename, pi.indexname;

-- 统计优化索引创建情况
CREATE OR REPLACE VIEW v_optimization_summary AS
SELECT 
    CASE 
        WHEN pi.indexname LIKE 'idx_%' THEN 'Optimization Index'
        WHEN pi.indexname LIKE '%_pkey' THEN 'Primary Key'
        WHEN pi.indexname LIKE '%_fkey' THEN 'Foreign Key'
        ELSE 'Other Index'
    END as index_type,
    COUNT(*) as index_count,
    SUM(pg_relation_size(pc.oid)) as total_size_bytes,
    pg_size_pretty(SUM(pg_relation_size(pc.oid))) as total_size
FROM pg_indexes pi
JOIN pg_class pc ON pc.relname = pi.indexname
WHERE pi.schemaname = 'public'
AND pi.indexname LIKE 'idx_%'
GROUP BY CASE 
    WHEN pi.indexname LIKE 'idx_%' THEN 'Optimization Index'
    WHEN pi.indexname LIKE '%_pkey' THEN 'Primary Key'
    WHEN pi.indexname LIKE '%_fkey' THEN 'Foreign Key'
    ELSE 'Other Index'
END
ORDER BY index_count DESC;

-- ==================================================
-- 2. 物化视图状态检查
-- ==================================================

-- 检查物化视图状态
CREATE OR REPLACE VIEW v_materialized_view_status AS
SELECT 
    schemaname,
    matviewname,
    ispopulated,
    pg_size_pretty(pg_total_relation_size(oid)) as view_size,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE table_name = matviewname AND constraint_type = 'UNIQUE') as unique_indexes
FROM pg_matviews pm
JOIN pg_class pc ON pc.relname = pm.matviewname
WHERE schemaname = 'public';

-- ==================================================
-- 3. 查询性能基准测试
-- ==================================================

-- 创建性能测试函数
CREATE OR REPLACE FUNCTION benchmark_optimized_queries()
RETURNS TABLE(
    test_name text,
    execution_time_ms numeric,
    rows_returned bigint,
    performance_level text
) AS $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    test_result record;
BEGIN
    -- 测试1: Web3用户排行榜查询
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO test_result FROM mv_web3_comprehensive_leaderboard LIMIT 100;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Web3 Leaderboard (Top 100)'::text,
        EXTRACT(MILLISECONDS FROM (end_time - start_time))::numeric,
        test_result.count,
        CASE 
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 50 THEN 'Excellent'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 200 THEN 'Good'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 1000 THEN 'Fair'
            ELSE 'Needs Improvement'
        END::text;

    -- 测试2: AI分析历史查询
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO test_result FROM ai_analyses 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'AI Analyses (Last 30 days)'::text,
        EXTRACT(MILLISECONDS FROM (end_time - start_time))::numeric,
        test_result.count,
        CASE 
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 100 THEN 'Excellent'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 500 THEN 'Good'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 2000 THEN 'Fair'
            ELSE 'Needs Improvement'
        END::text;

    -- 测试3: 用户积分查询
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO test_result FROM user_points_web2 upw2
    JOIN user_points_web3 upw3 ON upw2.user_id::text = upw3.wallet_address
    WHERE upw2.points_balance > 0 OR upw3.chain_points_balance > 0;
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Cross-table Points Query'::text,
        EXTRACT(MILLISECONDS FROM (end_time - start_time))::numeric,
        test_result.count,
        CASE 
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 200 THEN 'Excellent'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 1000 THEN 'Good'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 5000 THEN 'Fair'
            ELSE 'Needs Improvement'
        END::text;

    -- 测试4: 翻译系统查询
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO test_result FROM translations t
    JOIN translation_categories tc ON tc.id = t.category_id
    WHERE t.status = 'pending';
    end_time := clock_timestamp();
    
    RETURN QUERY SELECT 
        'Translation System Query'::text,
        EXTRACT(MILLISECONDS FROM (end_time - start_time))::numeric,
        test_result.count,
        CASE 
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 50 THEN 'Excellent'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 250 THEN 'Good'
            WHEN EXTRACT(MILLISECONDS FROM (end_time - start_time)) < 1000 THEN 'Fair'
            ELSE 'Needs Improvement'
        END::text;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 4. 数据完整性深度检查
-- ==================================================

-- 增强版数据完整性检查
CREATE OR REPLACE FUNCTION enhanced_data_integrity_check()
RETURNS TABLE(
    category text,
    check_name text,
    status text,
    issue_count bigint,
    severity text,
    recommendation text
) AS $$
BEGIN
    -- 检查1: Web3表数据一致性
    RETURN QUERY
    SELECT 
        'Web3 System'::text,
        'Multi-table Data Consistency'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        COUNT(*),
        CASE WHEN COUNT(*) = 0 THEN 'INFO' WHEN COUNT(*) < 10 THEN 'WARNING' ELSE 'CRITICAL' END::text,
        'Sync data between user_points_web3 and legacy web3_* tables'::text
    FROM (
        SELECT upw3.wallet_address
        FROM user_points_web3 upw3
        LEFT JOIN web3_user_stats wus ON wus.user_address = upw3.wallet_address
        WHERE upw3.is_active = true 
        AND (wus.user_address IS NULL OR upw3.consecutive_days != wus.consecutive_checkin_days)
    ) inconsistent_data;

    -- 检查2: 孤儿记录检查
    RETURN QUERY
    SELECT 
        'Data Integrity'::text,
        'Orphaned AI Analyses'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        COUNT(*),
        CASE WHEN COUNT(*) = 0 THEN 'INFO' WHEN COUNT(*) < 5 THEN 'WARNING' ELSE 'CRITICAL' END::text,
        'Clean up AI analyses without valid user charts'::text
    FROM ai_analyses aa
    LEFT JOIN user_charts uc ON uc.id = aa.chart_id
    WHERE uc.id IS NULL;

    -- 检查3: 用户档案完整性
    RETURN QUERY
    SELECT 
        'User System'::text,
        'Missing User Profiles'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        COUNT(*),
        CASE WHEN COUNT(*) = 0 THEN 'INFO' WHEN COUNT(*) < 20 THEN 'WARNING' ELSE 'CRITICAL' END::text,
        'Create profiles for users missing profile data'::text
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE up.id IS NULL AND u.created_at < CURRENT_DATE - INTERVAL '1 day';

    -- 检查4: 积分交易一致性
    RETURN QUERY
    SELECT 
        'Points System'::text,
        'Transaction Balance Consistency'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        COUNT(*),
        CASE WHEN COUNT(*) = 0 THEN 'INFO' WHEN COUNT(*) < 10 THEN 'WARNING' ELSE 'CRITICAL' END::text,
        'Recalculate points balances from transaction history'::text
    FROM (
        SELECT 
            upw2.user_id,
            upw2.points_balance,
            COALESCE(SUM(CASE WHEN pt.transaction_type = 'earn' THEN pt.points_amount 
                              WHEN pt.transaction_type = 'spend' THEN -pt.points_amount 
                              ELSE 0 END), 0) as calculated_balance
        FROM user_points_web2 upw2
        LEFT JOIN points_transactions_web2 pt ON pt.user_id = upw2.user_id
        GROUP BY upw2.user_id, upw2.points_balance
        HAVING upw2.points_balance != COALESCE(SUM(CASE WHEN pt.transaction_type = 'earn' THEN pt.points_amount 
                                                        WHEN pt.transaction_type = 'spend' THEN -pt.points_amount 
                                                        ELSE 0 END), 0)
    ) balance_inconsistencies;

    -- 检查5: 空投权重计算验证
    RETURN QUERY
    SELECT 
        'Airdrop System'::text,
        'Weight Calculation Accuracy'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        COUNT(*),
        CASE WHEN COUNT(*) = 0 THEN 'INFO' WHEN COUNT(*) < 5 THEN 'WARNING' ELSE 'CRITICAL' END::text,
        'Recalculate total_weight from component weights'::text
    FROM airdrop_eligibility
    WHERE ABS(total_weight - (checkin_weight + activity_weight + referral_weight + holding_weight + governance_weight)) > 0.001;

    -- 检查6: 过期会员清理
    RETURN QUERY
    SELECT 
        'Membership System'::text,
        'Expired Active Memberships'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        COUNT(*),
        CASE WHEN COUNT(*) = 0 THEN 'INFO' WHEN COUNT(*) < 10 THEN 'WARNING' ELSE 'CRITICAL' END::text,
        'Deactivate expired memberships'::text
    FROM user_memberships
    WHERE is_active = true AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 5. 性能监控仪表板
-- ==================================================

-- 综合性能监控视图
CREATE OR REPLACE VIEW v_performance_dashboard AS
SELECT 
    'Database Size' as metric_category,
    'Total Database Size' as metric_name,
    pg_size_pretty(pg_database_size(current_database())) as metric_value,
    'INFO' as status
UNION ALL
SELECT 
    'Index Performance',
    'Total Optimization Indexes',
    (SELECT COUNT(*)::text FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%'),
    'INFO'
UNION ALL
SELECT 
    'Materialized Views',
    'Populated Views',
    (SELECT COUNT(*)::text FROM pg_matviews WHERE schemaname = 'public' AND ispopulated = true),
    CASE WHEN (SELECT COUNT(*) FROM pg_matviews WHERE schemaname = 'public' AND ispopulated = false) > 0 
         THEN 'WARNING' ELSE 'GOOD' END
UNION ALL
SELECT 
    'Data Integrity',
    'Failed Checks',
    (SELECT COUNT(*)::text FROM enhanced_data_integrity_check() WHERE status = 'FAIL'),
    CASE WHEN (SELECT COUNT(*) FROM enhanced_data_integrity_check() WHERE status = 'FAIL') = 0 
         THEN 'GOOD' ELSE 'WARNING' END
UNION ALL
SELECT 
    'System Activity',
    'Tables with Recent Activity',
    (SELECT COUNT(DISTINCT schemaname||'.'||relname)::text 
     FROM pg_stat_user_tables 
     WHERE n_tup_ins + n_tup_upd + n_tup_del > 0),
    'INFO';

-- ==================================================
-- 6. 自动化监控和报告
-- ==================================================

-- 生成完整的健康检查报告
CREATE OR REPLACE FUNCTION generate_health_report()
RETURNS TEXT AS $$
DECLARE
    report_text TEXT := '';
    rec RECORD;
BEGIN
    report_text := E'========================================\n';
    report_text := report_text || 'AstroZi Database Health Report\n';
    report_text := report_text || 'Generated at: ' || CURRENT_TIMESTAMP || E'\n';
    report_text := report_text || E'========================================\n\n';
    
    -- 性能仪表板
    report_text := report_text || E'PERFORMANCE DASHBOARD:\n';
    report_text := report_text || E'----------------------\n';
    FOR rec IN SELECT * FROM v_performance_dashboard LOOP
        report_text := report_text || format('• %s - %s: %s [%s]\n', 
            rec.metric_category, rec.metric_name, rec.metric_value, rec.status);
    END LOOP;
    
    report_text := report_text || E'\n';
    
    -- 数据完整性检查
    report_text := report_text || E'DATA INTEGRITY CHECKS:\n';
    report_text := report_text || E'-----------------------\n';
    FOR rec IN SELECT * FROM enhanced_data_integrity_check() LOOP
        report_text := report_text || format('• %s - %s: %s (%s issues) [%s]\n', 
            rec.category, rec.check_name, rec.status, rec.issue_count, rec.severity);
        IF rec.status = 'FAIL' THEN
            report_text := report_text || format('  → Recommendation: %s\n', rec.recommendation);
        END IF;
    END LOOP;
    
    report_text := report_text || E'\n';
    
    -- 性能基准测试
    report_text := report_text || E'PERFORMANCE BENCHMARKS:\n';
    report_text := report_text || E'------------------------\n';
    FOR rec IN SELECT * FROM benchmark_optimized_queries() LOOP
        report_text := report_text || format('• %s: %sms (%s rows) [%s]\n', 
            rec.test_name, ROUND(rec.execution_time_ms, 2), rec.rows_returned, rec.performance_level);
    END LOOP;
    
    report_text := report_text || E'\n========================================\n';
    
    RETURN report_text;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 7. 执行验证和生成报告
-- ==================================================

-- 立即执行健康检查
DO $$
DECLARE
    health_report TEXT;
BEGIN
    SELECT generate_health_report() INTO health_report;
    
    RAISE NOTICE '%', health_report;
    
    -- 检查是否有严重问题
    IF EXISTS (SELECT 1 FROM enhanced_data_integrity_check() WHERE severity = 'CRITICAL') THEN
        RAISE WARNING 'CRITICAL issues found! Please review the health report.';
    ELSIF EXISTS (SELECT 1 FROM enhanced_data_integrity_check() WHERE severity = 'WARNING') THEN
        RAISE NOTICE 'Some warnings found. Review recommended.';
    ELSE
        RAISE NOTICE 'All systems healthy! 🎉';
    END IF;
END $$;

-- ==================================================
-- 使用说明
-- ==================================================

-- 创建使用说明
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'OPTIMIZATION VALIDATION COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Available monitoring commands:';
    RAISE NOTICE '• Full Health Report: SELECT generate_health_report();';
    RAISE NOTICE '• Performance Dashboard: SELECT * FROM v_performance_dashboard;';
    RAISE NOTICE '• Data Integrity Check: SELECT * FROM enhanced_data_integrity_check();';
    RAISE NOTICE '• Performance Benchmarks: SELECT * FROM benchmark_optimized_queries();';
    RAISE NOTICE '• Index Status: SELECT * FROM v_optimization_index_status;';
    RAISE NOTICE '• Materialized Views: SELECT * FROM v_materialized_view_status;';
    RAISE NOTICE '';
    RAISE NOTICE 'Recommended monitoring frequency:';
    RAISE NOTICE '• Daily: SELECT generate_health_report();';
    RAISE NOTICE '• Weekly: SELECT * FROM benchmark_optimized_queries();';
    RAISE NOTICE '• Monthly: Full system review';
    RAISE NOTICE '========================================';
END $$;