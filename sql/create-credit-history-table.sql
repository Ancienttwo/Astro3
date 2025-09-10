-- 创建积分操作历史表
CREATE TABLE IF NOT EXISTS credit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_identifier TEXT NOT NULL, -- user_id for web2, wallet_address for web3
    user_type TEXT NOT NULL CHECK (user_type IN ('web2', 'web3')),
    credit_type TEXT NOT NULL CHECK (credit_type IN ('free_reports', 'paid_reports', 'chatbot')),
    amount INTEGER NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('grant', 'consume')),
    source TEXT NOT NULL, -- daily_checkin, admin_grant, referral_reward, purchase, consume
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_credit_history_user ON credit_history(user_identifier, user_type);
CREATE INDEX IF NOT EXISTS idx_credit_history_created_at ON credit_history(created_at);
CREATE INDEX IF NOT EXISTS idx_credit_history_operation ON credit_history(operation, credit_type);

-- 添加注释
COMMENT ON TABLE credit_history IS '积分操作历史记录表';
COMMENT ON COLUMN credit_history.user_identifier IS '用户标识：Web2用户为user_id，Web3用户为wallet_address';
COMMENT ON COLUMN credit_history.credit_type IS '积分类型：free_reports(免费报告), paid_reports(付费报告), chatbot(ChatBot)';
COMMENT ON COLUMN credit_history.operation IS '操作类型：grant(发放), consume(消费)';
COMMENT ON COLUMN credit_history.source IS '来源：daily_checkin(签到), admin_grant(管理员发放), referral_reward(推荐奖励), purchase(购买), consume(消费)';