-- Web3用户报告次数管理函数
-- 解决Web3用户与user_usage表的集成问题

-- ==================================================
-- 创建Web3用户使用统计表
-- ==================================================

-- 修改user_usage表以支持Web3用户
-- 添加wallet_address字段以支持Web3用户识别
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

-- ==================================================
-- Web3用户报告次数授予函数
-- ==================================================

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
            gen_random_uuid(), -- 生成随机UUID
            LOWER(p_wallet_address) || '@web3.local', -- 临时邮箱格式
            LOWER(p_wallet_address),
            'web3',
            0, 0, -- 免费报告默认为0
            p_reports_count, 0, -- 付费报告
            0, 0, -- chatbot默认为0
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

-- ==================================================
-- Web3用户免费报告次数授予函数
-- ==================================================

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
            gen_random_uuid(), -- 生成随机UUID
            LOWER(p_wallet_address) || '@web3.local', -- 临时邮箱格式
            LOWER(p_wallet_address),
            'web3',
            p_reports_count, 0, -- 免费报告
            0, 0, -- 付费报告默认为0
            0, 0, -- chatbot默认为0
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

-- ==================================================
-- 通用的grant_free_reports函数，支持Web2用户
-- ==================================================

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
        -- 这里需要获取用户邮箱，但如果没有，可以使用UUID作为临时标识
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
            p_user_id::TEXT || '@temp.local', -- 临时邮箱格式
            'web2',
            p_reports_count, 0, -- 免费报告
            0, 0, -- 付费报告默认为0
            0, 0, -- chatbot默认为0
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

-- ==================================================
-- Web3用户获取使用统计函数
-- ==================================================

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

-- ==================================================
-- 空投权重提升函数
-- ==================================================

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

-- ==================================================
-- 权限授予
-- ==================================================

-- 授予执行权限给应用用户
-- GRANT EXECUTE ON FUNCTION grant_paid_reports_to_web3_user TO app_user;
-- GRANT EXECUTE ON FUNCTION grant_free_reports_to_web3_user TO app_user;
-- GRANT EXECUTE ON FUNCTION grant_free_reports TO app_user;
-- GRANT EXECUTE ON FUNCTION get_web3_user_usage TO app_user;
-- GRANT EXECUTE ON FUNCTION boost_airdrop_weight TO app_user;