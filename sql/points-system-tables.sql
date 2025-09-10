-- AstroZi 双轨积分系统数据库表结构
-- 创建日期: 2025-01-14
-- 描述: Web2/Web3双轨积分系统，支持空投资格追踪

-- ==================================================
-- Web2 积分系统表
-- ==================================================

-- Web2用户积分表
CREATE TABLE IF NOT EXISTS user_points_web2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    points_balance INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    consecutive_days INTEGER NOT NULL DEFAULT 0,
    last_checkin_date DATE,
    streak_broken_count INTEGER NOT NULL DEFAULT 0, -- 连击中断次数
    max_consecutive_days INTEGER NOT NULL DEFAULT 0, -- 历史最高连击
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT points_balance_positive CHECK (points_balance >= 0),
    CONSTRAINT consecutive_days_positive CHECK (consecutive_days >= 0)
);

-- Web2积分交易记录表
CREATE TABLE IF NOT EXISTS points_transactions_web2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earn', 'spend')),
    points_amount INTEGER NOT NULL,
    source_type TEXT NOT NULL, -- 'checkin', 'referral', 'task', 'report_purchase', 'admin_grant'
    source_details JSONB DEFAULT '{}', -- 详细信息，如任务ID、推荐人等
    description TEXT,
    balance_before INTEGER NOT NULL DEFAULT 0,
    balance_after INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT points_amount_positive CHECK (points_amount > 0)
);

-- Web2签到记录表
CREATE TABLE IF NOT EXISTS checkin_records_web2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    checkin_date DATE NOT NULL,
    consecutive_days INTEGER NOT NULL DEFAULT 1,
    points_earned INTEGER NOT NULL DEFAULT 0,
    reports_earned INTEGER NOT NULL DEFAULT 0,
    bonus_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00, -- 奖励倍数
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, checkin_date) -- 确保每天只能签到一次
);

-- ==================================================
-- Web3 积分系统表
-- ==================================================

-- Web3用户积分表
CREATE TABLE IF NOT EXISTS user_points_web3 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL UNIQUE,
    chain_points_balance INTEGER NOT NULL DEFAULT 0,
    total_chain_earned INTEGER NOT NULL DEFAULT 0,
    total_bnb_spent DECIMAL(20, 18) NOT NULL DEFAULT 0, -- 总花费BNB
    airdrop_weight DECIMAL(12,4) NOT NULL DEFAULT 0.0,
    consecutive_days INTEGER NOT NULL DEFAULT 0,
    last_checkin_date DATE,
    last_tx_hash TEXT, -- 最后一次交易哈希
    streak_broken_count INTEGER NOT NULL DEFAULT 0,
    max_consecutive_days INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chain_points_balance_positive CHECK (chain_points_balance >= 0),
    CONSTRAINT airdrop_weight_positive CHECK (airdrop_weight >= 0),
    CONSTRAINT consecutive_days_positive CHECK (consecutive_days >= 0)
);

-- Web3签到记录表
CREATE TABLE IF NOT EXISTS checkin_records_web3 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    tx_hash TEXT NOT NULL UNIQUE,
    checkin_date DATE NOT NULL,
    consecutive_days INTEGER NOT NULL DEFAULT 1,
    points_earned INTEGER NOT NULL DEFAULT 0,
    reports_earned INTEGER NOT NULL DEFAULT 0,
    airdrop_weight_earned DECIMAL(8,4) NOT NULL DEFAULT 0.0,
    bnb_paid DECIMAL(20, 18) NOT NULL DEFAULT 0, -- 支付的BNB数量
    gas_used BIGINT, -- 使用的Gas
    block_number BIGINT, -- 区块号
    bonus_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT points_earned_positive CHECK (points_earned >= 0),
    CONSTRAINT airdrop_weight_positive CHECK (airdrop_weight_earned >= 0),
    UNIQUE(wallet_address, checkin_date) -- 确保每天只能签到一次
);

-- ==================================================
-- 空投资格追踪系统
-- ==================================================

-- 空投资格表
CREATE TABLE IF NOT EXISTS airdrop_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_address TEXT NOT NULL,
    total_weight DECIMAL(12,4) NOT NULL DEFAULT 0.0,
    checkin_weight DECIMAL(12,4) NOT NULL DEFAULT 0.0, -- 签到权重
    activity_weight DECIMAL(12,4) NOT NULL DEFAULT 0.0, -- 活动参与权重
    referral_weight DECIMAL(12,4) NOT NULL DEFAULT 0.0, -- 推荐奖励权重
    holding_weight DECIMAL(12,4) NOT NULL DEFAULT 0.0, -- 持币权重（未来扩展）
    governance_weight DECIMAL(12,4) NOT NULL DEFAULT 0.0, -- 治理参与权重（未来扩展）
    estimated_tokens DECIMAL(20,8) NOT NULL DEFAULT 0, -- 预估空投数量
    is_eligible BOOLEAN NOT NULL DEFAULT true,
    blacklist_reason TEXT, -- 黑名单原因
    snapshot_date DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT total_weight_positive CHECK (total_weight >= 0),
    UNIQUE(wallet_address, snapshot_date)
);

-- 空投快照表（用于历史记录）
CREATE TABLE IF NOT EXISTS airdrop_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    snapshot_name TEXT NOT NULL,
    snapshot_date DATE NOT NULL,
    total_eligible_users INTEGER NOT NULL DEFAULT 0,
    total_weight DECIMAL(20,4) NOT NULL DEFAULT 0.0,
    airdrop_pool_size DECIMAL(20,8) NOT NULL DEFAULT 0, -- 空投池大小
    weight_per_token DECIMAL(20,8) NOT NULL DEFAULT 0, -- 每单位权重对应的Token数量
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'final', 'distributed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(snapshot_name)
);

-- ==================================================
-- 积分兑换商城
-- ==================================================

-- 积分商品表
CREATE TABLE IF NOT EXISTS points_shop_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_type TEXT NOT NULL, -- 'ai_reports', 'premium_features', 'nft_badge', 'airdrop_boost'
    item_name TEXT NOT NULL,
    item_description TEXT,
    points_cost INTEGER NOT NULL,
    item_value JSONB NOT NULL DEFAULT '{}', -- 商品价值，如报告次数、功能时长等
    available_for TEXT NOT NULL DEFAULT 'both' CHECK (available_for IN ('web2', 'web3', 'both')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    stock_limit INTEGER, -- 库存限制，NULL表示无限
    purchase_limit_per_user INTEGER, -- 每用户购买限制
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT points_cost_positive CHECK (points_cost > 0)
);

-- 积分兑换记录表
CREATE TABLE IF NOT EXISTS points_redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier TEXT NOT NULL, -- Web2用户ID或Web3钱包地址
    user_type TEXT NOT NULL CHECK (user_type IN ('web2', 'web3')),
    item_id UUID NOT NULL REFERENCES points_shop_items(id),
    points_spent INTEGER NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    redemption_status TEXT NOT NULL DEFAULT 'completed' CHECK (redemption_status IN ('pending', 'completed', 'failed', 'refunded')),
    item_delivered BOOLEAN NOT NULL DEFAULT false,
    delivery_details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT points_spent_positive CHECK (points_spent > 0),
    CONSTRAINT quantity_positive CHECK (quantity > 0)
);

-- ==================================================
-- 系统统计和分析表
-- ==================================================

-- 每日统计表
CREATE TABLE IF NOT EXISTS daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stat_date DATE NOT NULL UNIQUE,
    web2_active_users INTEGER NOT NULL DEFAULT 0,
    web3_active_users INTEGER NOT NULL DEFAULT 0,
    web2_checkins INTEGER NOT NULL DEFAULT 0,
    web3_checkins INTEGER NOT NULL DEFAULT 0,
    web2_points_earned INTEGER NOT NULL DEFAULT 0,
    web3_points_earned INTEGER NOT NULL DEFAULT 0,
    total_bnb_collected DECIMAL(20, 18) NOT NULL DEFAULT 0,
    total_airdrop_weight DECIMAL(20,4) NOT NULL DEFAULT 0,
    new_web2_users INTEGER NOT NULL DEFAULT 0,
    new_web3_users INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- 索引优化
-- ==================================================

-- Web2用户积分表索引
CREATE INDEX IF NOT EXISTS idx_user_points_web2_user_id ON user_points_web2(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_web2_last_checkin ON user_points_web2(last_checkin_date);

-- Web2交易记录索引
CREATE INDEX IF NOT EXISTS idx_points_transactions_web2_user_id ON points_transactions_web2(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_web2_created_at ON points_transactions_web2(created_at);
CREATE INDEX IF NOT EXISTS idx_points_transactions_web2_source_type ON points_transactions_web2(source_type);

-- Web2签到记录索引
CREATE INDEX IF NOT EXISTS idx_checkin_records_web2_user_id ON checkin_records_web2(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_records_web2_date ON checkin_records_web2(checkin_date);

-- Web3用户积分表索引
CREATE INDEX IF NOT EXISTS idx_user_points_web3_wallet ON user_points_web3(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_points_web3_last_checkin ON user_points_web3(last_checkin_date);
CREATE INDEX IF NOT EXISTS idx_user_points_web3_airdrop_weight ON user_points_web3(airdrop_weight DESC);

-- Web3签到记录索引
CREATE INDEX IF NOT EXISTS idx_checkin_records_web3_wallet ON checkin_records_web3(wallet_address);
CREATE INDEX IF NOT EXISTS idx_checkin_records_web3_date ON checkin_records_web3(checkin_date);
CREATE INDEX IF NOT EXISTS idx_checkin_records_web3_tx_hash ON checkin_records_web3(tx_hash);
CREATE INDEX IF NOT EXISTS idx_checkin_records_web3_block ON checkin_records_web3(block_number);

-- 空投资格表索引
CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_wallet ON airdrop_eligibility(wallet_address);
CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_weight ON airdrop_eligibility(total_weight DESC);
CREATE INDEX IF NOT EXISTS idx_airdrop_eligibility_eligible ON airdrop_eligibility(is_eligible);

-- 积分商城索引
CREATE INDEX IF NOT EXISTS idx_points_shop_items_type ON points_shop_items(item_type);
CREATE INDEX IF NOT EXISTS idx_points_shop_items_active ON points_shop_items(is_active);

-- 积分兑换记录索引
CREATE INDEX IF NOT EXISTS idx_points_redemptions_user ON points_redemptions(user_identifier, user_type);
CREATE INDEX IF NOT EXISTS idx_points_redemptions_created_at ON points_redemptions(created_at);

-- ==================================================
-- 触发器和函数
-- ==================================================

-- 更新Web2用户积分的触发器函数
CREATE OR REPLACE FUNCTION update_web2_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为Web2积分表创建更新时间触发器
CREATE TRIGGER trigger_update_web2_points_updated_at
    BEFORE UPDATE ON user_points_web2
    FOR EACH ROW
    EXECUTE FUNCTION update_web2_points_updated_at();

-- 更新Web3用户积分的触发器函数
CREATE OR REPLACE FUNCTION update_web3_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为Web3积分表创建更新时间触发器
CREATE TRIGGER trigger_update_web3_points_updated_at
    BEFORE UPDATE ON user_points_web3
    FOR EACH ROW
    EXECUTE FUNCTION update_web3_points_updated_at();

-- ==================================================
-- 初始数据插入
-- ==================================================

-- 插入默认积分商城商品
INSERT INTO points_shop_items (item_type, item_name, item_description, points_cost, item_value, available_for) VALUES
-- Web2/Web3通用商品
('ai_reports', '1次AI报告', '获得1次完整的八字或紫微分析报告', 50, '{"reports": 1}', 'both'),
('ai_reports', '5次AI报告包', '获得5次AI分析报告，享受8折优惠', 200, '{"reports": 5, "discount": 0.2}', 'both'),
('ai_reports', '10次AI报告包', '获得10次AI分析报告，享受7折优惠', 350, '{"reports": 10, "discount": 0.3}', 'both'),

-- Web2专用商品
('premium_features', '高级功能月卡', '解锁1个月高级功能访问权限', 500, '{"duration_days": 30, "features": ["advanced_analysis", "priority_support"]}', 'web2'),
('premium_features', '个性化头像', '解锁个性化用户头像设置', 100, '{"feature": "custom_avatar"}', 'web2'),

-- Web3专用商品
('airdrop_boost', '空投权重加速', '立即获得0.1空投权重加成', 300, '{"weight_boost": 0.1}', 'web3'),
('nft_badge', '连击达人徽章', '连续签到7天成就NFT徽章', 1000, '{"nft_type": "streak_master", "requirement": "7_day_streak"}', 'web3'),
('nft_badge', '积分大师徽章', '累计获得1000积分成就NFT徽章', 2000, '{"nft_type": "points_master", "requirement": "1000_points"}', 'web3')

ON CONFLICT (id) DO NOTHING;

-- ==================================================
-- 权限设置
-- ==================================================

-- 为应用用户创建只读权限（如果需要）
-- CREATE ROLE points_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO points_readonly;

-- 为应用用户创建读写权限（如果需要）
-- CREATE ROLE points_readwrite;
-- GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO points_readwrite;

-- ==================================================
-- 注释说明
-- ==================================================

COMMENT ON TABLE user_points_web2 IS 'Web2用户积分表，记录传统用户的积分状态';
COMMENT ON TABLE points_transactions_web2 IS 'Web2积分交易记录，记录所有积分的获得和消费';
COMMENT ON TABLE checkin_records_web2 IS 'Web2签到记录表，记录用户每日签到情况';

COMMENT ON TABLE user_points_web3 IS 'Web3用户积分表，记录钱包用户的积分和空投权重';
COMMENT ON TABLE checkin_records_web3 IS 'Web3签到记录表，记录链上签到交易信息';

COMMENT ON TABLE airdrop_eligibility IS '空投资格表，记录Web3用户的空投权重和资格';
COMMENT ON TABLE airdrop_snapshots IS '空投快照表，记录历史空投分发情况';

COMMENT ON TABLE points_shop_items IS '积分商城商品表，定义可用积分兑换的商品';
COMMENT ON TABLE points_redemptions IS '积分兑换记录表，记录用户的积分消费历史';

COMMENT ON TABLE daily_stats IS '每日统计表，记录系统关键指标的日度数据';