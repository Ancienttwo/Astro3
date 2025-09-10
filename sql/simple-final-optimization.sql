-- 最终简化版优化脚本 - 一次执行，无错误
-- 只包含核心功能，避免复杂依赖

-- ==================================================
-- 核心缓存预热函数
-- ==================================================

CREATE OR REPLACE FUNCTION simple_cache_warmup()
RETURNS TEXT AS $$
BEGIN
    -- 简单的缓存预热
    PERFORM COUNT(*) FROM user_points_web2 WHERE points_balance > 0;
    PERFORM COUNT(*) FROM user_points_web3 WHERE is_active = true;
    PERFORM COUNT(*) FROM ai_analyses WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
    
    RETURN '缓存预热完成';
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 简单清理函数
-- ==================================================

CREATE OR REPLACE FUNCTION simple_cleanup()
RETURNS TEXT AS $$
DECLARE
    cleaned_sessions INTEGER;
    cleaned_codes INTEGER;
BEGIN
    -- 清理过期会话
    DELETE FROM web3_auth_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS cleaned_sessions = ROW_COUNT;
    
    -- 清理过期注册码
    DELETE FROM registration_codes WHERE expires_at < CURRENT_TIMESTAMP AND is_used = false;
    GET DIAGNOSTICS cleaned_codes = ROW_COUNT;
    
    RETURN format('清理完成: %s个会话, %s个注册码', cleaned_sessions, cleaned_codes);
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 系统状态检查
-- ==================================================

CREATE OR REPLACE FUNCTION simple_health_check()
RETURNS TEXT AS $$
DECLARE
    db_size TEXT;
    total_users INTEGER;
    total_analyses INTEGER;
    result TEXT;
BEGIN
    SELECT pg_size_pretty(pg_database_size(current_database())) INTO db_size;
    SELECT COUNT(*) INTO total_users FROM users;
    SELECT COUNT(*) INTO total_analyses FROM ai_analyses;
    
    result := format('数据库大小: %s, 用户数: %s, AI分析: %s', db_size, total_users, total_analyses);
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 一键优化执行
-- ==================================================

CREATE OR REPLACE FUNCTION simple_optimize_all()
RETURNS TEXT AS $$
DECLARE
    result TEXT := '';
BEGIN
    -- 1. 更新统计信息
    ANALYZE;
    result := result || '✅ 统计信息更新完成' || E'\n';
    
    -- 2. 缓存预热
    result := result || '✅ ' || simple_cache_warmup() || E'\n';
    
    -- 3. 清理任务
    result := result || '✅ ' || simple_cleanup() || E'\n';
    
    -- 4. 健康检查
    result := result || '📊 ' || simple_health_check() || E'\n';
    
    result := result || '🎉 优化完成!';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 立即执行优化
-- ==================================================

SELECT simple_optimize_all();

-- ==================================================
-- 使用说明
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE '==========================================';
    RAISE NOTICE '简化版优化完成!';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '可用命令:';
    RAISE NOTICE '• SELECT simple_optimize_all();          -- 一键优化';
    RAISE NOTICE '• SELECT simple_health_check();          -- 健康检查';
    RAISE NOTICE '• SELECT simple_cache_warmup();          -- 缓存预热';
    RAISE NOTICE '• SELECT simple_cleanup();               -- 清理任务';
    RAISE NOTICE '==========================================';
    RAISE NOTICE '这个脚本没有复杂依赖，可以直接使用！';
    RAISE NOTICE '==========================================';
END $$;