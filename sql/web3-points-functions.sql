-- Web3积分系统专用数据库函数
-- 由于Web2用户直接获得报告次数，不需要积分系统

-- ==================================================
-- Web3签到处理函数
-- ==================================================

CREATE OR REPLACE FUNCTION handle_web3_checkin_sync(
    p_wallet_address TEXT,
    p_tx_hash TEXT,
    p_checkin_date DATE,
    p_consecutive_days INTEGER,
    p_points_earned INTEGER,
    p_airdrop_weight_earned DECIMAL(8,4),
    p_bnb_paid DECIMAL(20, 18),
    p_block_number BIGINT DEFAULT NULL,
    p_gas_used BIGINT DEFAULT NULL,
    p_reports_earned INTEGER DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_points_balance INTEGER;
    v_new_airdrop_weight DECIMAL(12,4);
    v_result JSON;
BEGIN
    -- 检查钱包地址格式
    IF p_wallet_address IS NULL OR LENGTH(p_wallet_address) != 42 THEN
        RAISE EXCEPTION 'Invalid wallet address format';
    END IF;
    
    -- 检查交易哈希是否已存在
    IF EXISTS (SELECT 1 FROM checkin_records_web3 WHERE tx_hash = p_tx_hash) THEN
        RAISE EXCEPTION 'Transaction hash already exists';
    END IF;
    
    -- 检查今天是否已签到
    IF EXISTS (
        SELECT 1 FROM checkin_records_web3 
        WHERE wallet_address = LOWER(p_wallet_address) 
        AND checkin_date = p_checkin_date
    ) THEN
        RAISE EXCEPTION 'Already checked in today';
    END IF;
    
    -- 开始事务处理
    BEGIN
        -- 插入签到记录
        INSERT INTO checkin_records_web3 (
            wallet_address,
            tx_hash,
            checkin_date,
            consecutive_days,
            points_earned,
            reports_earned,
            airdrop_weight_earned,
            bnb_paid,
            gas_used,
            block_number,
            bonus_multiplier
        ) VALUES (
            LOWER(p_wallet_address),
            p_tx_hash,
            p_checkin_date,
            p_consecutive_days,
            p_points_earned,
            p_reports_earned,
            p_airdrop_weight_earned,
            p_bnb_paid,
            p_gas_used,
            p_block_number,
            CASE 
                WHEN p_consecutive_days >= 100 THEN 5.00
                WHEN p_consecutive_days >= 60 THEN 4.00
                WHEN p_consecutive_days >= 30 THEN 3.00
                WHEN p_consecutive_days >= 15 THEN 2.00
                WHEN p_consecutive_days >= 7 THEN 1.50
                ELSE 1.00
            END
        );
        
        -- 更新或插入用户积分统计
        INSERT INTO user_points_web3 (
            wallet_address,
            chain_points_balance,
            total_chain_earned,
            total_bnb_spent,
            airdrop_weight,
            consecutive_days,
            last_checkin_date,
            last_tx_hash,
            is_active
        ) VALUES (
            LOWER(p_wallet_address),
            p_points_earned,
            p_points_earned,
            p_bnb_paid,
            p_airdrop_weight_earned,
            p_consecutive_days,
            p_checkin_date,
            p_tx_hash,
            true
        )
        ON CONFLICT (wallet_address) 
        DO UPDATE SET
            chain_points_balance = user_points_web3.chain_points_balance + p_points_earned,
            total_chain_earned = user_points_web3.total_chain_earned + p_points_earned,
            total_bnb_spent = user_points_web3.total_bnb_spent + p_bnb_paid,
            airdrop_weight = user_points_web3.airdrop_weight + p_airdrop_weight_earned,
            consecutive_days = p_consecutive_days,
            last_checkin_date = p_checkin_date,
            last_tx_hash = p_tx_hash,
            max_consecutive_days = GREATEST(user_points_web3.max_consecutive_days, p_consecutive_days),
            is_active = true,
            updated_at = NOW();
        
        -- 获取更新后的余额
        SELECT chain_points_balance, airdrop_weight 
        INTO v_new_points_balance, v_new_airdrop_weight
        FROM user_points_web3 
        WHERE wallet_address = LOWER(p_wallet_address);
        
        -- 为Web3用户授予AI报告次数
        IF p_reports_earned > 0 THEN
            -- 使用新的Web3用户报告授予函数
            PERFORM grant_free_reports_to_web3_user(p_wallet_address, p_reports_earned);
        END IF;
        
        -- 构建返回结果
        v_result := json_build_object(
            'success', true,
            'new_points_balance', v_new_points_balance,
            'new_airdrop_weight', v_new_airdrop_weight,
            'reports_granted', p_reports_earned,
            'tx_hash', p_tx_hash
        );
        
        RETURN v_result;
        
    EXCEPTION 
        WHEN OTHERS THEN
            -- 回滚事务并抛出错误
            RAISE EXCEPTION 'Error processing Web3 checkin: %', SQLERRM;
    END;
END;
$$;

-- ==================================================
-- Web3积分消费函数
-- ==================================================

CREATE OR REPLACE FUNCTION consume_web3_points(
    p_wallet_address TEXT,
    p_points_amount INTEGER,
    p_item_type TEXT,
    p_item_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_balance INTEGER;
    v_new_balance INTEGER;
    v_result JSON;
BEGIN
    -- 检查钱包地址
    IF p_wallet_address IS NULL OR LENGTH(p_wallet_address) != 42 THEN
        RAISE EXCEPTION 'Invalid wallet address format';
    END IF;
    
    -- 检查积分数量
    IF p_points_amount <= 0 THEN
        RAISE EXCEPTION 'Points amount must be positive';
    END IF;
    
    -- 获取当前积分余额
    SELECT chain_points_balance INTO v_current_balance
    FROM user_points_web3 
    WHERE wallet_address = LOWER(p_wallet_address);
    
    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- 检查余额是否足够
    IF v_current_balance < p_points_amount THEN
        RAISE EXCEPTION 'Insufficient points balance. Current: %, Required: %', v_current_balance, p_points_amount;
    END IF;
    
    -- 开始消费处理
    BEGIN
        -- 更新用户积分余额
        UPDATE user_points_web3 
        SET 
            chain_points_balance = chain_points_balance - p_points_amount,
            updated_at = NOW()
        WHERE wallet_address = LOWER(p_wallet_address);
        
        -- 记录兑换历史
        INSERT INTO points_redemptions (
            user_identifier,
            user_type,
            item_id,
            points_spent,
            quantity,
            redemption_status,
            item_delivered
        ) VALUES (
            LOWER(p_wallet_address),
            'web3',
            NULL, -- 如果有商品ID的话可以传入
            p_points_amount,
            1,
            'completed',
            true
        );
        
        -- 获取新余额
        SELECT chain_points_balance INTO v_new_balance
        FROM user_points_web3 
        WHERE wallet_address = LOWER(p_wallet_address);
        
        v_result := json_build_object(
            'success', true,
            'points_consumed', p_points_amount,
            'previous_balance', v_current_balance,
            'new_balance', v_new_balance,
            'item_type', p_item_type
        );
        
        RETURN v_result;
        
    EXCEPTION 
        WHEN OTHERS THEN
            RAISE EXCEPTION 'Error consuming Web3 points: %', SQLERRM;
    END;
END;
$$;

-- ==================================================
-- 空投资格更新函数
-- ==================================================

CREATE OR REPLACE FUNCTION update_airdrop_eligibility_for_user(
    p_wallet_address TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_stats RECORD;
    v_checkin_weight DECIMAL(12,4);
    v_activity_weight DECIMAL(12,4);
    v_total_weight DECIMAL(12,4);
    v_estimated_tokens DECIMAL(20,8);
    v_result JSON;
BEGIN
    -- 获取用户统计数据
    SELECT 
        airdrop_weight,
        consecutive_days,
        total_chain_earned,
        total_bnb_spent
    INTO v_user_stats
    FROM user_points_web3 
    WHERE wallet_address = LOWER(p_wallet_address);
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User not found';
    END IF;
    
    -- 计算各项权重
    -- 签到权重：基于累积的空投权重，最高100
    v_checkin_weight := LEAST(v_user_stats.airdrop_weight / 1000.0, 100.0);
    
    -- 活动权重：基于总积分和总消费，最高50
    v_activity_weight := LEAST(
        (v_user_stats.total_chain_earned / 1000.0 * 10.0) + 
        (v_user_stats.total_bnb_spent * 1000.0), -- BNB转换为权重
        50.0
    );
    
    -- 总权重
    v_total_weight := v_checkin_weight + v_activity_weight;
    
    -- 计算预估Token数量（基于10,000,000 AZI池子和100,000预期总权重）
    v_estimated_tokens := (v_total_weight / 100000.0) * 10000000.0;
    
    -- 更新空投资格记录
    INSERT INTO airdrop_eligibility (
        wallet_address,
        total_weight,
        checkin_weight,
        activity_weight,
        referral_weight,
        estimated_tokens,
        is_eligible,
        last_updated
    ) VALUES (
        LOWER(p_wallet_address),
        v_total_weight,
        v_checkin_weight,
        v_activity_weight,
        0.0, -- 推荐权重暂时为0
        v_estimated_tokens,
        true,
        NOW()
    )
    ON CONFLICT (wallet_address) 
    DO UPDATE SET
        total_weight = v_total_weight,
        checkin_weight = v_checkin_weight,
        activity_weight = v_activity_weight,
        estimated_tokens = v_estimated_tokens,
        last_updated = NOW();
    
    v_result := json_build_object(
        'success', true,
        'wallet_address', p_wallet_address,
        'total_weight', v_total_weight,
        'checkin_weight', v_checkin_weight,
        'activity_weight', v_activity_weight,
        'estimated_tokens', v_estimated_tokens
    );
    
    RETURN v_result;
END;
$$;

-- ==================================================
-- Web3用户每日统计更新函数
-- ==================================================

CREATE OR REPLACE FUNCTION update_daily_stats_web3()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_today DATE := CURRENT_DATE;
    v_web3_checkins INTEGER;
    v_web3_points_earned INTEGER;
    v_total_bnb_collected DECIMAL(20, 18);
    v_new_web3_users INTEGER;
BEGIN
    -- 获取今天的Web3统计数据
    SELECT 
        COUNT(*),
        COALESCE(SUM(points_earned), 0),
        COALESCE(SUM(bnb_paid), 0)
    INTO 
        v_web3_checkins,
        v_web3_points_earned,
        v_total_bnb_collected
    FROM checkin_records_web3 
    WHERE checkin_date = v_today;
    
    -- 获取今天新增的Web3用户数
    SELECT COUNT(*)
    INTO v_new_web3_users
    FROM user_points_web3 
    WHERE DATE(created_at) = v_today;
    
    -- 更新每日统计
    INSERT INTO daily_stats (
        stat_date,
        web2_active_users,
        web3_active_users,
        web2_checkins,
        web3_checkins,
        web2_points_earned,
        web3_points_earned,
        total_bnb_collected,
        new_web2_users,
        new_web3_users
    ) VALUES (
        v_today,
        0, -- Web2数据由其他函数处理
        (SELECT COUNT(*) FROM user_points_web3 WHERE last_checkin_date = v_today),
        0, -- Web2数据
        v_web3_checkins,
        0, -- Web2积分为0
        v_web3_points_earned,
        v_total_bnb_collected,
        0, -- Web2新用户
        v_new_web3_users
    )
    ON CONFLICT (stat_date)
    DO UPDATE SET
        web3_active_users = EXCLUDED.web3_active_users,
        web3_checkins = EXCLUDED.web3_checkins,
        web3_points_earned = EXCLUDED.web3_points_earned,
        total_bnb_collected = EXCLUDED.total_bnb_collected,
        new_web3_users = EXCLUDED.new_web3_users;
END;
$$;

-- ==================================================
-- 创建定时任务（需要pg_cron扩展）
-- ==================================================

-- 每天凌晨1点更新统计数据
-- SELECT cron.schedule('update-daily-stats', '0 1 * * *', 'SELECT update_daily_stats_web3();');

-- ==================================================
-- 权限授予
-- ==================================================

-- 如果有应用专用用户，授予执行权限
-- GRANT EXECUTE ON FUNCTION handle_web3_checkin_sync TO app_user;
-- GRANT EXECUTE ON FUNCTION consume_web3_points TO app_user;
-- GRANT EXECUTE ON FUNCTION update_airdrop_eligibility_for_user TO app_user;