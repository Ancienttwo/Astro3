-- Sprint 3: 数据库性能优化（复合索引 + 物化视图）
-- 注意：包含 CREATE INDEX CONCURRENTLY，需要在非事务块中执行

-- =============== 实用函数：判断表是否存在再建索引 ===============
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_charts') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_charts_match 
             ON user_charts(user_id, chart_type, name, birth_year, birth_month, birth_day, birth_hour, gender)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'web3_auth_sessions') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web3_auth_sessions_wallet_nonce 
             ON web3_auth_sessions(wallet_address, nonce)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web3_auth_sessions_expires 
             ON web3_auth_sessions(expires_at DESC)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'web3_sessions') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web3_sessions_nonce ON web3_sessions(nonce)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_web3_sessions_expires ON web3_sessions(expires_at DESC)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temple_systems') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_temple_systems_code_active 
             ON temple_systems(temple_code, is_active)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fortune_slips') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_fortune_slips_lookup 
             ON fortune_slips(temple_system_id, slip_number, is_active)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analysis_tasks') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_analysis_tasks_user_status_type_created 
             ON analysis_tasks(user_id, status, task_type, created_at DESC)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_conversations') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_created 
             ON chat_conversations(user_id, created_at DESC)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_created 
             ON chat_messages(conversation_id, created_at)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_profiles_user 
             ON user_profiles(user_id)';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_usage') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_usage_user 
             ON user_usage(user_id)';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_user_usage_wallet_type 
             ON user_usage(wallet_address, user_type)';
  END IF;
END$$;

-- =============== 物化视图：签文快速查找（活跃系统） ===============
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fortune_slips')
     AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'temple_systems') THEN
    -- 创建 MV（如果不存在）
    IF NOT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_fortune_slips_active'
    ) THEN
      EXECUTE $$CREATE MATERIALIZED VIEW mv_fortune_slips_active AS
        SELECT t.temple_code,
               f.slip_number,
               f.id AS slip_id
        FROM fortune_slips f
        JOIN temple_systems t ON t.id = f.temple_system_id
        WHERE f.is_active = true AND t.is_active = true$$;
      EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_fortune_slips_active_lookup 
               ON mv_fortune_slips_active(temple_code, slip_number)';
    END IF;
  END IF;
END$$;

-- =============== 物化视图：用户任务状态汇总 ===============
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analysis_tasks') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_analysis_tasks_user_counts'
    ) THEN
      EXECUTE $$CREATE MATERIALIZED VIEW mv_analysis_tasks_user_counts AS
        SELECT user_id, status, COUNT(*) AS cnt
        FROM analysis_tasks
        GROUP BY user_id, status$$;
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_mv_analysis_tasks_user_counts ON mv_analysis_tasks_user_counts(user_id, status)';
    END IF;
  END IF;
END$$;

-- 刷新指令（部署后可按需调用）：
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fortune_slips_active;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analysis_tasks_user_counts;

