-- =====================================================
-- 完整的积分系统更新 - 包含所有修复
-- =====================================================

-- 1. 添加用户表字段
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

COMMENT ON COLUMN users.last_sign_in_at IS 'User last sign in timestamp';
COMMENT ON COLUMN users.password_hash IS 'Password hash for custom email authentication';

-- 2. 修改user_usage表以支持Web3用户
DO $$ 
BEGIN
    -- 检查wallet_address列是否存在，如果不存在则添加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_usage' 
        AND column_name = 'wallet_address'
    ) THEN
        ALTER TABLE user_usage ADD COLUMN wallet_address TEXT;
        CREATE INDEX IF NOT EXISTS idx_user_usage_wallet_address ON user_usage(wallet_address);
    END IF;
    
    -- 检查user_type列是否存在，如果不存在则添加
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_usage' 
        AND column_name = 'user_type'
    ) THEN
        ALTER TABLE user_usage ADD COLUMN user_type TEXT DEFAULT 'web2';
    END IF;
END $$;

-- 3. Web3用户报告次数授予函数
CREATE OR REPLACE FUNCTION grant_paid_reports_to_web3_user(
    p_wallet_address TEXT,
    p_reports_count INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_current_paid INTEGER := 0;
    v_current_used INTEGER := 0;
BEGIN
    -- 验证输入参数
    IF p_wallet_address IS NULL OR LENGTH(p_wallet_address) != 42 THEN
        RAISE EXCEPTION 'Invalid wallet address format';
    END IF;
    
    IF p_reports_count <= 0 THEN
        RAISE EXCEPTION 'Reports count must be positive';
    END IF;
    
    -- 检查是否已有记录
    SELECT 
        COALESCE(paid_reports_purchased, 0),
        COALESCE(paid_reports_used, 0)
    INTO v_current_paid, v_current_used
    FROM user_usage 
    WHERE wallet_address = LOWER(p_wallet_address) 
    AND user_type = 'web3';
    
    -- 如果没有记录，插入新记录
    IF NOT FOUND THEN
        INSERT INTO user_usage (
            user_id,
            user_email,
            wallet_address,
            user_type,
            free_reports_limit,
            free_reports_used,
            paid_reports_purchased,
            paid_reports_used,
            chatbot_limit,
            chatbot_used,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            LOWER(p_wallet_address) || '@web3.local',
            LOWER(p_wallet_address),
            'web3',
            0, 0,
            p_reports_count, 0,
            0, 0,
            NOW(),
            NOW()
        );
        
        v_current_paid := p_reports_count;
        v_current_used := 0;
    ELSE
        -- 更新现有记录
        UPDATE user_usage 
        SET 
            paid_reports_purchased = paid_reports_purchased + p_reports_count,
            updated_at = NOW()
        WHERE wallet_address = LOWER(p_wallet_address) 
        AND user_type = 'web3';
        
        v_current_paid = v_current_paid + p_reports_count;
    END IF;
    
    v_result := json_build_object(
        'success', true,
        'wallet_address', p_wallet_address,
        'reports_granted', p_reports_count,
        'total_paid_reports', v_current_paid,
        'reports_used', v_current_used,
        'reports_remaining', v_current_paid - v_current_used
    );
    
    RETURN v_result;
END;
$$;

-- 4. Web3用户免费报告次数授予函数
CREATE OR REPLACE FUNCTION grant_free_reports_to_web3_user(
    p_wallet_address TEXT,
    p_reports_count INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_current_free INTEGER := 0;
    v_current_used INTEGER := 0;
BEGIN
    -- 验证输入参数
    IF p_wallet_address IS NULL OR LENGTH(p_wallet_address) != 42 THEN
        RAISE EXCEPTION 'Invalid wallet address format';
    END IF;
    
    IF p_reports_count <= 0 THEN
        RAISE EXCEPTION 'Reports count must be positive';
    END IF;
    
    -- 检查是否已有记录
    SELECT 
        COALESCE(free_reports_limit, 0),
        COALESCE(free_reports_used, 0)
    INTO v_current_free, v_current_used
    FROM user_usage 
    WHERE wallet_address = LOWER(p_wallet_address) 
    AND user_type = 'web3';
    
    -- 如果没有记录，插入新记录
    IF NOT FOUND THEN
        INSERT INTO user_usage (
            user_id,
            user_email,
            wallet_address,
            user_type,
            free_reports_limit,
            free_reports_used,
            paid_reports_purchased,
            paid_reports_used,
            chatbot_limit,
            chatbot_used,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            LOWER(p_wallet_address) || '@web3.local',
            LOWER(p_wallet_address),
            'web3',
            p_reports_count, 0,
            0, 0,
            0, 0,
            NOW(),
            NOW()
        );
        
        v_current_free := p_reports_count;
        v_current_used := 0;
    ELSE
        -- 更新现有记录
        UPDATE user_usage 
        SET 
            free_reports_limit = free_reports_limit + p_reports_count,
            updated_at = NOW()
        WHERE wallet_address = LOWER(p_wallet_address) 
        AND user_type = 'web3';
        
        v_current_free = v_current_free + p_reports_count;
    END IF;
    
    v_result := json_build_object(
        'success', true,
        'wallet_address', p_wallet_address,
        'reports_granted', p_reports_count,
        'total_free_reports', v_current_free,
        'reports_used', v_current_used,
        'reports_remaining', v_current_free - v_current_used
    );
    
    RETURN v_result;
END;
$$;

-- 5. 通用的grant_free_reports函数，支持Web2用户
CREATE OR REPLACE FUNCTION grant_free_reports(
    p_user_id UUID,
    p_reports_count INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_current_free INTEGER := 0;
    v_current_used INTEGER := 0;
BEGIN
    -- 验证输入参数
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    IF p_reports_count <= 0 THEN
        RAISE EXCEPTION 'Reports count must be positive';
    END IF;
    
    -- 检查是否已有记录
    SELECT 
        COALESCE(free_reports_limit, 0),
        COALESCE(free_reports_used, 0)
    INTO v_current_free, v_current_used
    FROM user_usage 
    WHERE user_id = p_user_id;
    
    -- 如果没有记录，需要先创建
    IF NOT FOUND THEN
        INSERT INTO user_usage (
            user_id,
            user_email,
            user_type,
            free_reports_limit,
            free_reports_used,
            paid_reports_purchased,
            paid_reports_used,
            chatbot_limit,
            chatbot_used,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            p_user_id::TEXT || '@temp.local',
            'web2',
            p_reports_count, 0,
            0, 0,
            0, 0,
            NOW(),
            NOW()
        );
        
        v_current_free := p_reports_count;
        v_current_used := 0;
    ELSE
        -- 更新现有记录
        UPDATE user_usage 
        SET 
            free_reports_limit = free_reports_limit + p_reports_count,
            updated_at = NOW()
        WHERE user_id = p_user_id;
        
        v_current_free = v_current_free + p_reports_count;
    END IF;
    
    v_result := json_build_object(
        'success', true,
        'user_id', p_user_id,
        'reports_granted', p_reports_count,
        'total_free_reports', v_current_free,
        'reports_used', v_current_used,
        'reports_remaining', v_current_free - v_current_used
    );
    
    RETURN v_result;
END;
$$;

-- 6. Web3用户获取使用统计函数
CREATE OR REPLACE FUNCTION get_web3_user_usage(
    p_wallet_address TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_usage_data RECORD;
BEGIN
    -- 验证钱包地址
    IF p_wallet_address IS NULL OR LENGTH(p_wallet_address) != 42 THEN
        RAISE EXCEPTION 'Invalid wallet address format';
    END IF;
    
    -- 获取使用统计
    SELECT 
        COALESCE(free_reports_limit, 0) as free_limit,
        COALESCE(free_reports_used, 0) as free_used,
        COALESCE(paid_reports_purchased, 0) as paid_purchased,
        COALESCE(paid_reports_used, 0) as paid_used,
        COALESCE(chatbot_limit, 0) as chatbot_limit,
        COALESCE(chatbot_used, 0) as chatbot_used
    INTO v_usage_data
    FROM user_usage 
    WHERE wallet_address = LOWER(p_wallet_address) 
    AND user_type = 'web3';
    
    -- 如果没有记录，返回默认值
    IF NOT FOUND THEN
        v_result := json_build_object(
            'wallet_address', p_wallet_address,
            'free_reports_remaining', 0,
            'paid_reports_remaining', 0,
            'chatbot_remaining', 0,
            'total_reports_remaining', 0,
            'exists', false
        );
    ELSE
        v_result := json_build_object(
            'wallet_address', p_wallet_address,
            'free_reports_remaining', v_usage_data.free_limit - v_usage_data.free_used,
            'paid_reports_remaining', v_usage_data.paid_purchased - v_usage_data.paid_used,
            'chatbot_remaining', v_usage_data.chatbot_limit - v_usage_data.chatbot_used,
            'total_reports_remaining', (v_usage_data.free_limit - v_usage_data.free_used) + (v_usage_data.paid_purchased - v_usage_data.paid_used),
            'usage_stats', json_build_object(
                'free_limit', v_usage_data.free_limit,
                'free_used', v_usage_data.free_used,
                'paid_purchased', v_usage_data.paid_purchased,
                'paid_used', v_usage_data.paid_used,
                'chatbot_limit', v_usage_data.chatbot_limit,
                'chatbot_used', v_usage_data.chatbot_used
            ),
            'exists', true
        );
    END IF;
    
    RETURN v_result;
END;
$$;

-- 7. 空投权重提升函数
CREATE OR REPLACE FUNCTION boost_airdrop_weight(
    p_wallet_address TEXT,
    p_weight_increase DECIMAL(12,4)
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_current_weight DECIMAL(12,4) := 0;
    v_new_weight DECIMAL(12,4);
BEGIN
    -- 验证输入参数
    IF p_wallet_address IS NULL OR LENGTH(p_wallet_address) != 42 THEN
        RAISE EXCEPTION 'Invalid wallet address format';
    END IF;
    
    IF p_weight_increase <= 0 THEN
        RAISE EXCEPTION 'Weight increase must be positive';
    END IF;
    
    -- 获取当前权重
    SELECT COALESCE(airdrop_weight, 0)
    INTO v_current_weight
    FROM user_points_web3 
    WHERE wallet_address = LOWER(p_wallet_address);
    
    -- 如果用户不存在，创建记录
    IF NOT FOUND THEN
        INSERT INTO user_points_web3 (
            wallet_address,
            chain_points_balance,
            total_chain_earned,
            airdrop_weight,
            consecutive_days,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            LOWER(p_wallet_address),
            0,
            0,
            p_weight_increase,
            0,
            true,
            NOW(),
            NOW()
        );
        
        v_new_weight := p_weight_increase;
    ELSE
        -- 更新现有记录
        v_new_weight := v_current_weight + p_weight_increase;
        
        UPDATE user_points_web3 
        SET 
            airdrop_weight = v_new_weight,
            updated_at = NOW()
        WHERE wallet_address = LOWER(p_wallet_address);
    END IF;
    
    -- 更新空投资格
    PERFORM update_airdrop_eligibility_for_user(p_wallet_address);
    
    v_result := json_build_object(
        'success', true,
        'wallet_address', p_wallet_address,
        'weight_increase', p_weight_increase,
        'previous_weight', v_current_weight,
        'new_weight', v_new_weight
    );
    
    RETURN v_result;
END;
$$;

-- 8. 更新Web3签到函数以使用新的报告授予函数
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

-- 成功信息
SELECT 'Points system update completed successfully!' as status;