-- 性能优化索引
-- 根据Web2用户AI报告点数链路分析，添加必要的数据库索引

-- ==================================================
-- user_usage表优化索引
-- ==================================================

-- 1. 用户ID查询优化（主要查询路径）
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id_updated_at 
ON user_usage(user_id, updated_at DESC);

-- 2. Web3用户钱包地址查询优化
CREATE INDEX IF NOT EXISTS idx_user_usage_wallet_address_type 
ON user_usage(wallet_address, user_type) 
WHERE wallet_address IS NOT NULL;

-- 3. 用户类型分区索引
CREATE INDEX IF NOT EXISTS idx_user_usage_user_type_active 
ON user_usage(user_type, updated_at DESC) 
WHERE free_reports_limit > 0 OR paid_reports_purchased > 0;

-- 4. 邮箱查询优化（管理功能）
CREATE INDEX IF NOT EXISTS idx_user_usage_email_lower 
ON user_usage(LOWER(user_email));

-- 5. 复合查询优化（余额检查）
CREATE INDEX IF NOT EXISTS idx_user_usage_balance_check 
ON user_usage(user_id, free_reports_limit, free_reports_used, paid_reports_purchased, paid_reports_used);

-- ==================================================
-- checkin_records_web2表优化索引
-- ==================================================

-- 1. 用户签到查询优化
CREATE INDEX IF NOT EXISTS idx_checkin_web2_user_date 
ON checkin_records_web2(user_id, checkin_date DESC);

-- 2. 签到日期范围查询优化
CREATE INDEX IF NOT EXISTS idx_checkin_web2_date_range 
ON checkin_records_web2(checkin_date DESC, user_id);

-- 3. 连续签到天数查询优化
CREATE INDEX IF NOT EXISTS idx_checkin_web2_consecutive_days 
ON checkin_records_web2(user_id, consecutive_days DESC, checkin_date DESC);

-- 4. 最近签到记录查询优化
CREATE INDEX IF NOT EXISTS idx_checkin_web2_recent 
ON checkin_records_web2(user_id, created_at DESC);

-- 5. 报告奖励统计优化
CREATE INDEX IF NOT EXISTS idx_checkin_web2_reports_stats 
ON checkin_records_web2(user_id, reports_earned, checkin_date DESC) 
WHERE reports_earned > 0;

-- ==================================================
-- checkin_records_web3表优化索引（如果存在）
-- ==================================================

-- 1. Web3钱包地址查询优化
CREATE INDEX IF NOT EXISTS idx_checkin_web3_wallet_date 
ON checkin_records_web3(wallet_address, checkin_date DESC);

-- 2. 交易哈希唯一性查询优化
CREATE INDEX IF NOT EXISTS idx_checkin_web3_tx_hash 
ON checkin_records_web3(tx_hash);

-- 3. 区块号查询优化
CREATE INDEX IF NOT EXISTS idx_checkin_web3_block_number 
ON checkin_records_web3(block_number DESC) 
WHERE block_number IS NOT NULL;

-- ==================================================
-- user_points_web3表优化索引
-- ==================================================

-- 1. 钱包地址主查询优化
CREATE INDEX IF NOT EXISTS idx_user_points_web3_wallet 
ON user_points_web3(wallet_address, is_active);

-- 2. 积分余额查询优化
CREATE INDEX IF NOT EXISTS idx_user_points_web3_balance 
ON user_points_web3(wallet_address, chain_points_balance DESC);

-- 3. 空投权重查询优化
CREATE INDEX IF NOT EXISTS idx_user_points_web3_airdrop 
ON user_points_web3(wallet_address, airdrop_weight DESC);

-- 4. 最后签到时间优化
CREATE INDEX IF NOT EXISTS idx_user_points_web3_last_checkin 
ON user_points_web3(last_checkin_date DESC, wallet_address) 
WHERE is_active = true;

-- ==================================================
-- 其他相关表索引优化
-- ==================================================

-- 1. points_redemptions表优化
CREATE INDEX IF NOT EXISTS idx_points_redemptions_user 
ON points_redemptions(user_identifier, user_type, redemption_status);

CREATE INDEX IF NOT EXISTS idx_points_redemptions_item 
ON points_redemptions(item_id, redemption_status, created_at DESC);

-- 2. airdrop_eligibility表优化
CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_wallet 
ON airdrop_eligibility(wallet_address, is_eligible, last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_weight 
ON airdrop_eligibility(total_weight DESC, wallet_address) 
WHERE is_eligible = true;

-- ==================================================
-- 分析查询优化视图
-- ==================================================

-- 创建用户活跃度分析视图
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    uu.user_id,
    uu.user_email,
    uu.user_type,
    uu.wallet_address,
    -- 报告使用统计
    uu.free_reports_limit,
    uu.free_reports_used,
    uu.paid_reports_purchased,
    uu.paid_reports_used,
    (uu.free_reports_limit - uu.free_reports_used + uu.paid_reports_purchased - uu.paid_reports_used) as total_reports_remaining,
    -- 签到统计
    COALESCE(checkin_stats.total_checkins, 0) as total_checkins,
    COALESCE(checkin_stats.max_consecutive_days, 0) as max_consecutive_days,
    checkin_stats.last_checkin_date,
    checkin_stats.total_reports_earned,
    -- 活跃度指标
    CASE 
        WHEN checkin_stats.last_checkin_date >= CURRENT_DATE - INTERVAL '7 days' THEN 'active'
        WHEN checkin_stats.last_checkin_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'inactive'
        ELSE 'dormant'
    END as activity_status,
    uu.created_at,
    uu.updated_at
FROM user_usage uu
LEFT JOIN (
    SELECT 
        user_id,
        COUNT(*) as total_checkins,
        MAX(consecutive_days) as max_consecutive_days,
        MAX(checkin_date) as last_checkin_date,
        SUM(reports_earned) as total_reports_earned
    FROM checkin_records_web2 
    GROUP BY user_id
) checkin_stats ON uu.user_id = checkin_stats.user_id
WHERE uu.user_type = 'web2';

-- 为视图创建索引
CREATE INDEX IF NOT EXISTS idx_user_activity_summary_status 
ON user_usage(user_type, updated_at DESC) 
WHERE user_type = 'web2';

-- ==================================================
-- 查询性能统计函数
-- ==================================================

CREATE OR REPLACE FUNCTION get_query_performance_stats()
RETURNS TABLE(
    table_name TEXT,
    index_name TEXT,
    index_size TEXT,
    table_size TEXT,
    index_usage_count BIGINT
) 
LANGUAGE SQL AS $$
    SELECT 
        pui.schemaname||'.'||pui.relname as table_name,
        pui.indexrelname as index_name,
        pg_size_pretty(pg_relation_size(pui.indexrelid)) as index_size,
        pg_size_pretty(pg_relation_size(pui.relid)) as table_size,
        pui.idx_tup_read as index_usage_count
    FROM pg_stat_user_indexes pui
    WHERE pui.schemaname = 'public' 
    AND pui.relname IN ('user_usage', 'checkin_records_web2', 'checkin_records_web3', 'user_points_web3')
    ORDER BY pg_relation_size(pui.indexrelid) DESC;
$$;

-- ==================================================
-- 清理未使用的索引（谨慎执行）
-- ==================================================

-- 查询未使用的索引（仅查询，不删除）
CREATE OR REPLACE FUNCTION find_unused_indexes()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    index_size TEXT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
) 
LANGUAGE SQL AS $$
    SELECT 
        pui.schemaname,
        pui.relname as tablename,
        pui.indexrelname as indexname,
        pg_size_pretty(pg_relation_size(pui.indexrelid)) as index_size,
        pui.idx_tup_read,
        pui.idx_tup_fetch
    FROM pg_stat_user_indexes pui
    WHERE pui.schemaname = 'public'
    AND pui.idx_tup_read = 0
    AND pui.idx_tup_fetch = 0
    AND pui.indexrelname NOT LIKE '%_pkey'  -- 保留主键
    ORDER BY pg_relation_size(pui.indexrelid) DESC;
$$;

-- ==================================================
-- 监控和告警设置
-- ==================================================

-- 创建性能监控表
CREATE TABLE IF NOT EXISTS query_performance_log (
    id SERIAL PRIMARY KEY,
    query_type VARCHAR(50) NOT NULL,
    execution_time_ms INTEGER NOT NULL,
    affected_rows INTEGER,
    query_params JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 为性能日志表创建索引
CREATE INDEX IF NOT EXISTS idx_query_performance_log_type_time 
ON query_performance_log(query_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_query_performance_log_slow_queries 
ON query_performance_log(execution_time_ms DESC, created_at DESC) 
WHERE execution_time_ms > 1000;

-- ==================================================
-- 缓存策略建议
-- ==================================================

-- 注释说明：推荐的Redis缓存键格式
-- user_usage:{user_id} - 用户使用统计（TTL: 300秒）
-- user_balance:{user_type}:{identifier} - 用户余额（TTL: 60秒）
-- checkin_status:{user_id}:{date} - 签到状态（TTL: 86400秒）
-- recent_checkins:{user_id} - 最近签到记录（TTL: 600秒）

-- 成功消息
SELECT 'Performance optimization indexes created successfully!' as status,
       'Total indexes created: ' || (
           SELECT COUNT(*) 
           FROM pg_indexes 
           WHERE schemaname = 'public' 
           AND indexname LIKE 'idx_%'
       ) as index_count;