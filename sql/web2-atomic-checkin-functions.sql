-- Web2用户原子性签到函数
-- 解决数据一致性问题，确保签到记录和报告授予的原子性

-- ==================================================
-- 原子性Web2签到函数
-- ==================================================

CREATE OR REPLACE FUNCTION atomic_web2_checkin(
    p_user_id UUID,
    p_user_email TEXT,
    p_checkin_date DATE,
    p_consecutive_days INTEGER,
    p_reports_earned INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_bonus_multiplier DECIMAL(3,2);
BEGIN
    -- 验证输入参数
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    IF p_reports_earned < 0 THEN
        RAISE EXCEPTION 'Reports earned cannot be negative';
    END IF;
    
    -- 计算奖励倍数
    v_bonus_multiplier := CASE 
        WHEN p_consecutive_days >= 100 THEN 5.0
        WHEN p_consecutive_days >= 60 THEN 4.0
        WHEN p_consecutive_days >= 30 THEN 3.0
        WHEN p_consecutive_days >= 15 THEN 2.0
        WHEN p_consecutive_days >= 7 THEN 1.5
        ELSE 1.0
    END;
    
    -- 检查今天是否已经签到
    IF EXISTS (
        SELECT 1 FROM checkin_records_web2 
        WHERE user_id = p_user_id 
        AND checkin_date = p_checkin_date
    ) THEN
        RAISE EXCEPTION 'Already checked in today';
    END IF;
    
    -- 开始原子性事务处理
    BEGIN
        -- 1. 插入签到记录
        INSERT INTO checkin_records_web2 (
            user_id,
            checkin_date,
            consecutive_days,
            points_earned,
            reports_earned,
            bonus_multiplier,
            created_at
        ) VALUES (
            p_user_id,
            p_checkin_date,
            p_consecutive_days,
            0, -- Web2用户不获得积分
            p_reports_earned,
            v_bonus_multiplier,
            NOW()
        );
        
        -- 2. 授予免费报告次数（如果有的话）
        IF p_reports_earned > 0 THEN
            -- 调用已有的grant_free_reports函数
            PERFORM grant_free_reports(p_user_id, p_reports_earned);
        END IF;
        
        -- 3. 构建返回结果
        v_result := json_build_object(
            'success', true,
            'consecutive_days', p_consecutive_days,
            'reports_earned', p_reports_earned,
            'bonus_multiplier', v_bonus_multiplier,
            'checkin_date', p_checkin_date,
            'message', format('签到成功！获得 %s 次AI报告，连续签到 %s 天', p_reports_earned, p_consecutive_days)
        );
        
        RETURN v_result;
        
    EXCEPTION 
        WHEN OTHERS THEN
            -- 自动回滚所有操作
            RAISE EXCEPTION 'Web2 checkin failed: %', SQLERRM;
    END;
END;
$$;

-- ==================================================
-- Web2用户签到状态检查函数
-- ==================================================

CREATE OR REPLACE FUNCTION check_web2_checkin_status(
    p_user_id UUID,
    p_check_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_today_checkin RECORD;
    v_last_checkin RECORD;
    v_consecutive_days INTEGER := 0;
    v_can_checkin BOOLEAN := true;
BEGIN
    -- 验证输入参数
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    -- 检查今天是否已经签到
    SELECT * INTO v_today_checkin
    FROM checkin_records_web2 
    WHERE user_id = p_user_id 
    AND checkin_date = p_check_date;
    
    -- 如果今天已经签到，设置状态
    IF v_today_checkin.id IS NOT NULL THEN
        v_can_checkin := false;
        v_consecutive_days := v_today_checkin.consecutive_days;
    ELSE
        -- 获取最近的签到记录来计算连续天数
        SELECT * INTO v_last_checkin
        FROM checkin_records_web2 
        WHERE user_id = p_user_id 
        AND checkin_date < p_check_date
        ORDER BY checkin_date DESC 
        LIMIT 1;
        
        -- 计算连续签到天数
        IF v_last_checkin.id IS NOT NULL THEN
            IF v_last_checkin.checkin_date = p_check_date - INTERVAL '1 day' THEN
                -- 连续签到
                v_consecutive_days := v_last_checkin.consecutive_days + 1;
            ELSE
                -- 签到中断，重新开始
                v_consecutive_days := 1;
            END IF;
        ELSE
            -- 首次签到
            v_consecutive_days := 1;
        END IF;
    END IF;
    
    -- 计算预期奖励
    v_result := json_build_object(
        'can_checkin', v_can_checkin,
        'consecutive_days', v_consecutive_days,
        'expected_reports', CASE 
            WHEN v_consecutive_days >= 100 THEN 10
            WHEN v_consecutive_days >= 60 THEN 8
            WHEN v_consecutive_days >= 30 THEN 5
            WHEN v_consecutive_days >= 15 THEN 3
            WHEN v_consecutive_days >= 7 THEN 2
            ELSE 1
        END,
        'bonus_multiplier', CASE 
            WHEN v_consecutive_days >= 100 THEN 5.0
            WHEN v_consecutive_days >= 60 THEN 4.0
            WHEN v_consecutive_days >= 30 THEN 3.0
            WHEN v_consecutive_days >= 15 THEN 2.0
            WHEN v_consecutive_days >= 7 THEN 1.5
            ELSE 1.0
        END,
        'today_checkin', CASE 
            WHEN v_today_checkin.id IS NOT NULL THEN
                json_build_object(
                    'reports_earned', v_today_checkin.reports_earned,
                    'checkin_time', v_today_checkin.created_at
                )
            ELSE NULL
        END
    );
    
    RETURN v_result;
END;
$$;

-- ==================================================
-- Web2用户最近签到记录查询函数
-- ==================================================

CREATE OR REPLACE FUNCTION get_web2_recent_checkins(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_checkins JSON;
BEGIN
    -- 验证输入参数
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID cannot be null';
    END IF;
    
    IF p_limit <= 0 OR p_limit > 100 THEN
        p_limit := 10;
    END IF;
    
    -- 获取最近的签到记录
    SELECT json_agg(
        json_build_object(
            'checkin_date', checkin_date,
            'consecutive_days', consecutive_days,
            'reports_earned', reports_earned,
            'bonus_multiplier', bonus_multiplier,
            'created_at', created_at
        ) ORDER BY checkin_date DESC
    ) INTO v_checkins
    FROM checkin_records_web2 
    WHERE user_id = p_user_id 
    ORDER BY checkin_date DESC 
    LIMIT p_limit;
    
    v_result := json_build_object(
        'user_id', p_user_id,
        'recent_checkins', COALESCE(v_checkins, '[]'::json),
        'total_records', (
            SELECT COUNT(*) 
            FROM checkin_records_web2 
            WHERE user_id = p_user_id
        )
    );
    
    RETURN v_result;
END;
$$;

-- ==================================================
-- 数据完整性验证函数
-- ==================================================

CREATE OR REPLACE FUNCTION validate_web2_checkin_integrity(
    p_user_id UUID DEFAULT NULL,
    p_days_back INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_result JSON;
    v_inconsistencies JSON;
    v_total_checkins INTEGER;
    v_inconsistent_count INTEGER;
BEGIN
    -- 查找数据不一致的情况
    -- 签到记录存在但报告次数未正确授予的情况
    WITH inconsistent_checkins AS (
        SELECT 
            cr.user_id,
            cr.checkin_date,
            cr.reports_earned as expected_reports,
            uu.free_reports_limit,
            uu.updated_at as usage_updated_at,
            cr.created_at as checkin_created_at
        FROM checkin_records_web2 cr
        LEFT JOIN user_usage uu ON cr.user_id = uu.user_id
        WHERE 
            (p_user_id IS NULL OR cr.user_id = p_user_id)
            AND cr.checkin_date >= CURRENT_DATE - INTERVAL '%d days'
            AND cr.reports_earned > 0
            AND (
                uu.user_id IS NULL 
                OR uu.updated_at < cr.created_at
                OR uu.free_reports_limit = 0
            )
        ORDER BY cr.checkin_date DESC
    )
    SELECT 
        json_agg(
            json_build_object(
                'user_id', user_id,
                'checkin_date', checkin_date,
                'expected_reports', expected_reports,
                'current_free_limit', free_reports_limit,
                'issue_type', CASE 
                    WHEN free_reports_limit IS NULL THEN 'missing_usage_record'
                    WHEN usage_updated_at < checkin_created_at THEN 'stale_usage_record'
                    ELSE 'zero_reports_granted'
                END
            )
        ),
        COUNT(*)
    INTO v_inconsistencies, v_inconsistent_count
    FROM inconsistent_checkins;
    
    -- 获取总签到记录数
    SELECT COUNT(*) INTO v_total_checkins
    FROM checkin_records_web2 
    WHERE 
        (p_user_id IS NULL OR user_id = p_user_id)
        AND checkin_date >= CURRENT_DATE - INTERVAL '%d days';
    
    v_result := json_build_object(
        'validation_date', NOW(),
        'days_checked', p_days_back,
        'user_id', p_user_id,
        'total_checkins', v_total_checkins,
        'inconsistent_count', COALESCE(v_inconsistent_count, 0),
        'consistency_rate', CASE 
            WHEN v_total_checkins > 0 THEN 
                ROUND((v_total_checkins - COALESCE(v_inconsistent_count, 0))::DECIMAL / v_total_checkins * 100, 2)
            ELSE 100.0
        END,
        'inconsistencies', COALESCE(v_inconsistencies, '[]'::json),
        'status', CASE 
            WHEN COALESCE(v_inconsistent_count, 0) = 0 THEN 'healthy'
            WHEN COALESCE(v_inconsistent_count, 0) < v_total_checkins * 0.05 THEN 'minor_issues'
            ELSE 'needs_attention'
        END
    );
    
    RETURN v_result;
END;
$$;

-- ==================================================
-- 权限授予
-- ==================================================

-- 授予执行权限给应用用户
-- GRANT EXECUTE ON FUNCTION atomic_web2_checkin TO app_user;
-- GRANT EXECUTE ON FUNCTION check_web2_checkin_status TO app_user;
-- GRANT EXECUTE ON FUNCTION get_web2_recent_checkins TO app_user;
-- GRANT EXECUTE ON FUNCTION validate_web2_checkin_integrity TO app_user;

-- 成功消息
SELECT 'Web2 atomic checkin functions created successfully!' as status;