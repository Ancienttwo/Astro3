-- AstroZi Schema优化脚本 (基于实际数据库结构)
-- 创建日期: 2025-01-14
-- 说明: 根据现有复杂schema设计的性能优化方案

-- ==================================================
-- 1. 核心用户系统优化
-- ==================================================

-- 用户表复合索引 (支持多种查询模式)
CREATE INDEX IF NOT EXISTS idx_users_auth_type_email ON users(auth_type, email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address) WHERE wallet_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- 用户档案优化索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id_complete ON user_profiles(user_id, profile_complete);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_edit ON user_profiles(last_edit_at DESC) WHERE last_edit_at IS NOT NULL;

-- 用户使用情况索引
CREATE INDEX IF NOT EXISTS idx_user_usage_premium ON user_usage(is_premium_user, premium_expires_at);
CREATE INDEX IF NOT EXISTS idx_user_usage_checkin ON user_usage(last_checkin_date DESC, consecutive_checkin_days DESC);

-- ==================================================
-- 2. AI分析系统优化 (高频查询优化)
-- ==================================================

-- AI分析记录复合索引
CREATE INDEX IF NOT EXISTS idx_ai_analyses_user_chart ON ai_analyses(user_id, chart_id, analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_agent_type ON ai_analyses(agent_name, created_at DESC);

-- 分析任务状态索引
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_status_user ON analysis_tasks(status, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_tasks_type_status ON analysis_tasks(task_type, status, started_at DESC);

-- 用户图表索引
CREATE INDEX IF NOT EXISTS idx_user_charts_user_type ON user_charts(user_id, chart_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_charts_category ON user_charts(category, created_at DESC);

-- 聊天历史优化 (会话查询)
CREATE INDEX IF NOT EXISTS idx_chat_history_conversation ON chat_history(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_agent ON chat_history(user_id, agent_type, created_at DESC);

-- ==================================================
-- 3. 积分系统优化 (核心业务逻辑)
-- ==================================================

-- Web2积分表复合索引
CREATE INDEX IF NOT EXISTS idx_user_points_web2_user_active ON user_points_web2(user_id, consecutive_days DESC, last_checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_web2_balance ON user_points_web2(points_balance DESC) WHERE points_balance > 0;

-- Web2积分交易记录
CREATE INDEX IF NOT EXISTS idx_points_transactions_web2_user_type ON points_transactions_web2(user_id, transaction_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_transactions_web2_source ON points_transactions_web2(source_type, created_at DESC);

-- Web2签到记录优化
CREATE INDEX IF NOT EXISTS idx_checkin_records_web2_user_date ON checkin_records_web2(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_checkin_records_web2_consecutive ON checkin_records_web2(consecutive_days DESC, created_at DESC);

-- ==================================================
-- 4. Web3系统优化 (复杂的多表结构整合)
-- ==================================================

-- Web3积分主表优化
CREATE INDEX IF NOT EXISTS idx_user_points_web3_wallet_active ON user_points_web3(wallet_address, is_active, airdrop_weight DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_web3_airdrop_ranking ON user_points_web3(airdrop_weight DESC, total_chain_earned DESC) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_points_web3_consecutive ON user_points_web3(consecutive_days DESC, last_checkin_date DESC);

-- Web3签到记录 (主表)
CREATE INDEX IF NOT EXISTS idx_checkin_records_web3_wallet_date ON checkin_records_web3(wallet_address, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_checkin_records_web3_tx_block ON checkin_records_web3(tx_hash, block_number DESC);
CREATE INDEX IF NOT EXISTS idx_checkin_records_web3_airdrop ON checkin_records_web3(airdrop_weight_earned DESC, checkin_date DESC);

-- Web3旧表优化 (向后兼容)
CREATE INDEX IF NOT EXISTS idx_web3_checkin_records_user_date ON web3_checkin_records(user_address, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_web3_checkin_records_tx ON web3_checkin_records(tx_hash, block_number);

-- Web3用户统计表
CREATE INDEX IF NOT EXISTS idx_web3_user_stats_address_checkin ON web3_user_stats(user_address, last_checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_web3_user_stats_consecutive ON web3_user_stats(consecutive_checkin_days DESC, total_spent DESC);

-- Web3签到验证表
CREATE INDEX IF NOT EXISTS idx_web3_checkins_user_date ON web3_checkins(user_address, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_web3_checkins_verification ON web3_checkins(verification_status, created_at DESC);

-- Web3积分记录
CREATE INDEX IF NOT EXISTS idx_web3_points_user_type ON web3_points(user_id, point_type, created_at DESC);

-- ==================================================
-- 5. 空投系统优化 (复杂权重计算)
-- ==================================================

-- 空投资格主要查询索引
CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_ranking ON airdrop_eligibility(total_weight DESC, estimated_tokens DESC) WHERE is_eligible = true;
CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_wallet_snapshot ON airdrop_eligibility(wallet_address, snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_weights ON airdrop_eligibility(checkin_weight DESC, activity_weight DESC, referral_weight DESC);

-- 空投快照优化
CREATE INDEX IF NOT EXISTS idx_airdrop_snapshots_date_status ON airdrop_snapshots(snapshot_date DESC, status);

-- ==================================================
-- 6. 积分商城优化
-- ==================================================

-- 商品查询优化
CREATE INDEX IF NOT EXISTS idx_points_shop_items_available ON points_shop_items(available_for, is_active, item_type);
CREATE INDEX IF NOT EXISTS idx_points_shop_items_cost ON points_shop_items(points_cost ASC, is_active) WHERE is_active = true;

-- 兑换记录优化
CREATE INDEX IF NOT EXISTS idx_points_redemptions_user ON points_redemptions(user_identifier, user_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_points_redemptions_status ON points_redemptions(redemption_status, created_at DESC);

-- ==================================================
-- 7. 认证和安全系统优化
-- ==================================================

-- Web3认证会话
CREATE INDEX IF NOT EXISTS idx_web3_auth_sessions_wallet ON web3_auth_sessions(wallet_address, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_web3_auth_sessions_nonce ON web3_auth_sessions(nonce, expires_at) WHERE used_at IS NULL;

-- 注册码管理
CREATE INDEX IF NOT EXISTS idx_registration_codes_batch ON registration_codes(batch_name, is_used, expires_at);
CREATE INDEX IF NOT EXISTS idx_registration_codes_unused ON registration_codes(expires_at DESC) WHERE is_used = false;

-- ==================================================
-- 8. 支付和会员系统优化
-- ==================================================

-- 购买历史优化
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_product ON purchase_history(user_id, product_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_history_transaction ON purchase_history(transaction_id, payment_method);

-- 会员状态优化
CREATE INDEX IF NOT EXISTS idx_user_memberships_active ON user_memberships(user_id, is_active, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_memberships_expiring ON user_memberships(expires_at ASC) WHERE is_active = true;

-- 优惠码使用
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_code ON promo_code_usage(user_id, code_type, used_at DESC);

-- ==================================================
-- 9. 翻译系统优化 (AI内容管理)
-- ==================================================

-- 翻译主表优化
CREATE INDEX IF NOT EXISTS idx_translations_category_status ON translations(category_id, status, priority DESC);
CREATE INDEX IF NOT EXISTS idx_translations_key_status ON translations(key, status);
CREATE INDEX IF NOT EXISTS idx_translations_terminology ON translations(is_terminology, status) WHERE is_terminology = true;

-- 翻译分类索引
CREATE INDEX IF NOT EXISTS idx_translation_categories_parent ON translation_categories(parent_id, sort_order);

-- 翻译历史
CREATE INDEX IF NOT EXISTS idx_translation_history_translation ON translation_history(translation_id, changed_at DESC);

-- 翻译统计
CREATE INDEX IF NOT EXISTS idx_translation_stats_category ON translation_stats(category_id, updated_at DESC);

-- ==================================================
-- 10. 系统统计和监控优化
-- ==================================================

-- 每日统计优化
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_metrics ON daily_stats(web2_active_users DESC, web3_active_users DESC, stat_date DESC);

-- ==================================================
-- 物化视图创建 (复杂聚合查询优化)
-- ==================================================

-- Web3用户综合排行榜
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_web3_comprehensive_leaderboard AS
SELECT 
    upw3.wallet_address,
    upw3.chain_points_balance,
    upw3.total_chain_earned,
    upw3.total_bnb_spent,
    upw3.airdrop_weight,
    upw3.consecutive_days,
    upw3.max_consecutive_days,
    ae.total_weight as airdrop_total_weight,
    ae.estimated_tokens,
    COALESCE(wus.total_checkin_days, 0) as legacy_checkin_days,
    COALESCE(wus.total_spent, 0) as legacy_total_spent,
    ROW_NUMBER() OVER (ORDER BY upw3.airdrop_weight DESC, upw3.total_chain_earned DESC) as airdrop_rank,
    ROW_NUMBER() OVER (ORDER BY upw3.chain_points_balance DESC) as points_rank,
    CASE 
        WHEN upw3.airdrop_weight >= 50 THEN 'Platinum'
        WHEN upw3.airdrop_weight >= 30 THEN 'Gold'
        WHEN upw3.airdrop_weight >= 15 THEN 'Silver'
        ELSE 'Bronze'
    END as tier,
    upw3.last_checkin_date,
    upw3.updated_at
FROM user_points_web3 upw3
LEFT JOIN airdrop_eligibility ae ON ae.wallet_address = upw3.wallet_address 
    AND ae.is_eligible = true
LEFT JOIN web3_user_stats wus ON wus.user_address = upw3.wallet_address
WHERE upw3.is_active = true
ORDER BY upw3.airdrop_weight DESC, upw3.total_chain_earned DESC;

-- 为物化视图创建索引
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_web3_leaderboard_wallet 
ON mv_web3_comprehensive_leaderboard(wallet_address);

CREATE INDEX IF NOT EXISTS idx_mv_web3_leaderboard_airdrop_rank 
ON mv_web3_comprehensive_leaderboard(airdrop_rank);

CREATE INDEX IF NOT EXISTS idx_mv_web3_leaderboard_tier 
ON mv_web3_comprehensive_leaderboard(tier, airdrop_total_weight DESC);

-- 系统活跃度统计视图
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_system_activity_summary AS
SELECT 
    ds.stat_date,
    ds.web2_active_users + ds.web3_active_users as total_active_users,
    ds.web2_checkins + ds.web3_checkins as total_checkins,
    ds.web2_points_earned + ds.web3_points_earned as total_points_earned,
    ds.total_bnb_collected,
    ds.total_airdrop_weight,
    ds.new_web2_users + ds.new_web3_users as total_new_users,
    -- 计算增长率
    LAG(ds.web2_active_users + ds.web3_active_users) OVER (ORDER BY ds.stat_date) as prev_active_users,
    CASE 
        WHEN LAG(ds.web2_active_users + ds.web3_active_users) OVER (ORDER BY ds.stat_date) > 0 
        THEN ROUND(((ds.web2_active_users + ds.web3_active_users)::NUMERIC / 
                    LAG(ds.web2_active_users + ds.web3_active_users) OVER (ORDER BY ds.stat_date) - 1) * 100, 2)
        ELSE 0 
    END as user_growth_rate,
    -- AI系统使用统计
    (SELECT COUNT(*) FROM analysis_tasks WHERE DATE(created_at) = ds.stat_date) as ai_analyses_count,
    (SELECT COUNT(*) FROM analysis_tasks WHERE DATE(completed_at) = ds.stat_date AND status = 'completed') as ai_completed_count
FROM daily_stats ds
ORDER BY ds.stat_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_system_activity_date 
ON mv_system_activity_summary(stat_date DESC);

-- ==================================================
-- 复杂查询优化函数
-- ==================================================

-- 计算用户综合积分 (跨多个系统)
CREATE OR REPLACE FUNCTION calculate_user_comprehensive_score(input_user_id uuid, input_wallet_address text DEFAULT NULL)
RETURNS TABLE(
    user_id uuid,
    wallet_address text,
    web2_points integer,
    web3_points integer,
    airdrop_weight numeric,
    total_ai_analyses bigint,
    consecutive_days integer,
    comprehensive_score numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(input_user_id, u.id) as user_id,
        COALESCE(input_wallet_address, u.wallet_address) as wallet_address,
        COALESCE(upw2.points_balance, 0) as web2_points,
        COALESCE(upw3.chain_points_balance, 0) as web3_points,
        COALESCE(upw3.airdrop_weight, 0::numeric) as airdrop_weight,
        COALESCE(ai_count.analyses_count, 0) as total_ai_analyses,
        GREATEST(COALESCE(upw2.consecutive_days, 0), COALESCE(upw3.consecutive_days, 0)) as consecutive_days,
        -- 综合评分计算
        (COALESCE(upw2.points_balance, 0) * 0.2 + 
         COALESCE(upw3.chain_points_balance, 0) * 0.3 + 
         COALESCE(upw3.airdrop_weight, 0) * 100 * 0.4 + 
         COALESCE(ai_count.analyses_count, 0) * 5 * 0.1)::numeric as comprehensive_score
    FROM users u
    LEFT JOIN user_points_web2 upw2 ON upw2.user_id = u.id
    LEFT JOIN user_points_web3 upw3 ON upw3.wallet_address = u.wallet_address
    LEFT JOIN (
        SELECT user_id, COUNT(*) as analyses_count 
        FROM ai_analyses 
        GROUP BY user_id
    ) ai_count ON ai_count.user_id = u.id
    WHERE (input_user_id IS NULL OR u.id = input_user_id)
    AND (input_wallet_address IS NULL OR u.wallet_address = input_wallet_address);
END;
$$ LANGUAGE plpgsql;

-- Web3数据整合函数 (处理多个重复表)
CREATE OR REPLACE FUNCTION sync_web3_data_integrity()
RETURNS TABLE(
    wallet_address text,
    main_table_points integer,
    legacy_total_credits integer,
    main_consecutive_days integer,
    legacy_consecutive_days integer,
    discrepancy_found boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        upw3.wallet_address,
        upw3.chain_points_balance as main_table_points,
        COALESCE(wus.total_credits, 0) as legacy_total_credits,
        upw3.consecutive_days as main_consecutive_days,
        COALESCE(wus.consecutive_checkin_days, 0) as legacy_consecutive_days,
        (upw3.chain_points_balance != COALESCE(wus.total_credits, 0) OR 
         upw3.consecutive_days != COALESCE(wus.consecutive_checkin_days, 0)) as discrepancy_found
    FROM user_points_web3 upw3
    LEFT JOIN web3_user_stats wus ON wus.user_address = upw3.wallet_address
    WHERE upw3.is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- 维护和监控函数
-- ==================================================

-- 刷新所有物化视图
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_web3_comprehensive_leaderboard;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_system_activity_summary;
    RAISE NOTICE '所有物化视图已刷新完成';
EXCEPTION
    WHEN OTHERS THEN
        -- 如果CONCURRENTLY失败，尝试普通刷新
        REFRESH MATERIALIZED VIEW mv_web3_comprehensive_leaderboard;
        REFRESH MATERIALIZED VIEW mv_system_activity_summary;
        RAISE NOTICE '物化视图已刷新完成 (非并发模式)';
END;
$$ LANGUAGE plpgsql;

-- 数据库完整性检查
CREATE OR REPLACE FUNCTION comprehensive_data_integrity_check()
RETURNS TABLE(
    check_category text,
    check_name text,
    status text,
    details text,
    affected_records bigint
) AS $$
BEGIN
    -- 检查Web3数据一致性
    RETURN QUERY
    SELECT 
        'Web3 Consistency'::text,
        'Points Balance Sync'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        'Inconsistent points between main and legacy tables'::text,
        COUNT(*)
    FROM sync_web3_data_integrity()
    WHERE discrepancy_found = true;
    
    -- 检查空投资格计算
    RETURN QUERY
    SELECT 
        'Airdrop System'::text,
        'Weight Calculation'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        'Invalid airdrop weight calculations'::text,
        COUNT(*)
    FROM airdrop_eligibility
    WHERE total_weight != (checkin_weight + activity_weight + referral_weight + holding_weight + governance_weight);
    
    -- 检查用户数据一致性
    RETURN QUERY
    SELECT 
        'User System'::text,
        'Profile Consistency'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        'Users without profiles'::text,
        COUNT(*)
    FROM users u
    LEFT JOIN user_profiles up ON up.user_id = u.id
    WHERE up.id IS NULL;
    
    -- 检查AI分析孤儿记录
    RETURN QUERY
    SELECT 
        'AI System'::text,
        'Orphaned Analyses'::text,
        CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END::text,
        'AI analyses without valid user charts'::text,
        COUNT(*)
    FROM ai_analyses aa
    LEFT JOIN user_charts uc ON uc.id = aa.chart_id
    WHERE uc.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- 执行完成
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'AstroZi Schema 复杂优化完成!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '优化内容包括:';
    RAISE NOTICE '1. 50+ 复合索引 (AI分析、积分、Web3、翻译系统)';
    RAISE NOTICE '2. 2个物化视图 (Web3排行榜、系统活跃度)';
    RAISE NOTICE '3. 复杂计算函数 (综合评分、数据整合)';
    RAISE NOTICE '4. 完整性检查 (跨表数据验证)';
    RAISE NOTICE '========================================';
    RAISE NOTICE '推荐执行命令:';
    RAISE NOTICE '• 刷新视图: SELECT refresh_all_materialized_views();';
    RAISE NOTICE '• 数据检查: SELECT * FROM comprehensive_data_integrity_check();';
    RAISE NOTICE '• 综合评分: SELECT * FROM calculate_user_comprehensive_score(user_uuid);';
    RAISE NOTICE '========================================';
END $$;