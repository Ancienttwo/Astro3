-- Web3 签到系统数据库表

-- 创建 Web3 签到记录表
CREATE TABLE IF NOT EXISTS web3_checkin_records (
    id BIGSERIAL PRIMARY KEY,
    user_address TEXT NOT NULL,
    tx_hash TEXT NOT NULL UNIQUE,
    consecutive_days INTEGER NOT NULL DEFAULT 1,
    credits_earned INTEGER NOT NULL DEFAULT 0,
    ai_reports_earned INTEGER NOT NULL DEFAULT 0,
    amount_paid DECIMAL(20, 18) NOT NULL DEFAULT 0, -- BNB amount in wei, stored as decimal
    block_number BIGINT,
    checkin_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建 Web3 用户统计表
CREATE TABLE IF NOT EXISTS web3_user_stats (
    id BIGSERIAL PRIMARY KEY,
    user_address TEXT NOT NULL UNIQUE,
    last_checkin_date DATE,
    consecutive_checkin_days INTEGER NOT NULL DEFAULT 0,
    total_checkin_days INTEGER NOT NULL DEFAULT 0,
    total_credits INTEGER NOT NULL DEFAULT 0,
    total_ai_reports INTEGER NOT NULL DEFAULT 0,
    total_spent DECIMAL(20, 18) NOT NULL DEFAULT 0, -- Total BNB spent
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_web3_checkin_records_user_address ON web3_checkin_records(user_address);
CREATE INDEX IF NOT EXISTS idx_web3_checkin_records_checkin_date ON web3_checkin_records(checkin_date);
CREATE INDEX IF NOT EXISTS idx_web3_checkin_records_tx_hash ON web3_checkin_records(tx_hash);
CREATE INDEX IF NOT EXISTS idx_web3_user_stats_user_address ON web3_user_stats(user_address);
CREATE INDEX IF NOT EXISTS idx_web3_user_stats_last_checkin_date ON web3_user_stats(last_checkin_date);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为两个表创建更新时间戳的触发器
CREATE TRIGGER update_web3_checkin_records_updated_at 
    BEFORE UPDATE ON web3_checkin_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_web3_user_stats_updated_at 
    BEFORE UPDATE ON web3_user_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为表添加注释
COMMENT ON TABLE web3_checkin_records IS 'Web3智能合约签到记录表';
COMMENT ON TABLE web3_user_stats IS 'Web3用户签到统计表';

-- 为列添加注释
COMMENT ON COLUMN web3_checkin_records.user_address IS '用户钱包地址';
COMMENT ON COLUMN web3_checkin_records.tx_hash IS '交易哈希';
COMMENT ON COLUMN web3_checkin_records.consecutive_days IS '连续签到天数';
COMMENT ON COLUMN web3_checkin_records.credits_earned IS '获得的积分';
COMMENT ON COLUMN web3_checkin_records.ai_reports_earned IS '获得的AI分析次数';
COMMENT ON COLUMN web3_checkin_records.amount_paid IS '支付的BNB数量(wei)';
COMMENT ON COLUMN web3_checkin_records.block_number IS '区块号';
COMMENT ON COLUMN web3_checkin_records.checkin_date IS '签到日期';

COMMENT ON COLUMN web3_user_stats.user_address IS '用户钱包地址';
COMMENT ON COLUMN web3_user_stats.last_checkin_date IS '最后签到日期';
COMMENT ON COLUMN web3_user_stats.consecutive_checkin_days IS '连续签到天数';
COMMENT ON COLUMN web3_user_stats.total_checkin_days IS '总签到天数';
COMMENT ON COLUMN web3_user_stats.total_credits IS '总积分';
COMMENT ON COLUMN web3_user_stats.total_ai_reports IS '总AI分析次数';
COMMENT ON COLUMN web3_user_stats.total_spent IS '总支出BNB数量';

-- 添加行级安全策略 (Row Level Security)
ALTER TABLE web3_checkin_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE web3_user_stats ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户只能访问自己的记录
CREATE POLICY "Users can view own checkin records" ON web3_checkin_records
    FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

CREATE POLICY "Users can view own stats" ON web3_user_stats
    FOR SELECT USING (user_address = current_setting('app.current_user_address', true));

-- 服务端可以插入和更新记录
CREATE POLICY "Service can manage checkin records" ON web3_checkin_records
    FOR ALL USING (current_setting('app.bypass_rls', true)::boolean = true);

CREATE POLICY "Service can manage user stats" ON web3_user_stats
    FOR ALL USING (current_setting('app.bypass_rls', true)::boolean = true);