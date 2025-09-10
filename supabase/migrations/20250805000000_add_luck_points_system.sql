-- AstroZi Guandi NFT: $luck Points System Database Schema
-- Version: 1.0
-- Date: 2025-08-05

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 关帝每日抽签记录表
CREATE TABLE IF NOT EXISTS guandi_daily_draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(42) NOT NULL,
  draw_date DATE NOT NULL,
  attempts_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  consecutive_successes INTEGER DEFAULT 0,
  current_state VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'success', 'failed'
  fortune_slip_id UUID REFERENCES fortune_slips(id),
  luck_points_earned INTEGER DEFAULT 0,
  jiaobei_results JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_wallet_date UNIQUE (wallet_address, draw_date)
);

-- 关帝签文历史记录表
CREATE TABLE IF NOT EXISTS guandi_fortune_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(42) NOT NULL,
  fortune_slip_id UUID REFERENCES fortune_slips(id),
  slip_number INTEGER NOT NULL,
  draw_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  jiaobei_session_data JSONB, -- 完整的筊杯投掷历史
  luck_points_earned INTEGER DEFAULT 0,
  fortune_level VARCHAR(20), -- 从签文中提取的吉凶等级
  is_minted_as_nft BOOLEAN DEFAULT false,
  nft_token_id INTEGER,
  nft_contract_address VARCHAR(42),
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 合并到现有的积分系统，不创建单独的 $luck 积分表
-- 扩展现有的 user_points_web3 表，添加关帝灵签相关字段
ALTER TABLE user_points_web3 
ADD COLUMN IF NOT EXISTS guandi_nft_mints_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guandi_fortune_draws_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guandi_consecutive_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS guandi_max_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_guandi_draw_date DATE;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_guandi_daily_draws_wallet_date ON guandi_daily_draws(wallet_address, draw_date);
CREATE INDEX IF NOT EXISTS idx_guandi_daily_draws_state ON guandi_daily_draws(current_state);
CREATE INDEX IF NOT EXISTS idx_guandi_fortune_history_wallet ON guandi_fortune_history(wallet_address);
CREATE INDEX IF NOT EXISTS idx_guandi_fortune_history_date ON guandi_fortune_history(draw_date);
CREATE INDEX IF NOT EXISTS idx_guandi_fortune_history_nft ON guandi_fortune_history(is_minted_as_nft);
-- 索引已通过现有的 user_points_web3 表索引覆盖

-- 创建触发器以自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为guandi_daily_draws表创建更新时间触发器
DROP TRIGGER IF EXISTS update_guandi_daily_draws_updated_at ON guandi_daily_draws;
CREATE TRIGGER update_guandi_daily_draws_updated_at
    BEFORE UPDATE ON guandi_daily_draws
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建RLS(Row Level Security)策略
ALTER TABLE guandi_daily_draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE guandi_fortune_history ENABLE ROW LEVEL SECURITY;

-- guandi_daily_draws的RLS策略 - 用户只能查看自己的记录
CREATE POLICY "Users can view own daily draws" ON guandi_daily_draws
  FOR SELECT USING (
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

CREATE POLICY "Users can insert own daily draws" ON guandi_daily_draws
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

CREATE POLICY "Users can update own daily draws" ON guandi_daily_draws
  FOR UPDATE USING (
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

-- guandi_fortune_history的RLS策略
CREATE POLICY "Users can view own fortune history" ON guandi_fortune_history
  FOR SELECT USING (
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

CREATE POLICY "Users can insert own fortune history" ON guandi_fortune_history
  FOR INSERT WITH CHECK (
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

-- 积分交易通过现有的 user_points_web3 表和 chain_points_balance 字段处理

-- 插入初始的关帝任务到现有tasks表
INSERT INTO tasks (task_key, title, description, task_type, category, points_reward, sort_order, requirements) VALUES
-- 关帝灵签相关任务
('guandi_first_draw', '首次求签', '在关帝灵签完成第一次求签', 'onetime', 'newbie', 100, 10, '{"action": "guandi_fortune_draw", "count": 1}'),
('guandi_lucky_draw', '求得好签', '在关帝灵签求得中吉或以上签文', 'onetime', 'newbie', 150, 11, '{"action": "guandi_good_fortune", "fortune_levels": ["good", "excellent"]}'),
('guandi_daily_streak_3', '连续求签', '连续3天完成关帝灵签求签', 'onetime', 'advanced', 300, 12, '{"action": "guandi_daily_streak", "days": 3}'),
('guandi_daily_streak_7', '虔诚信徒', '连续7天完成关帝灵签求签', 'onetime', 'advanced', 500, 13, '{"action": "guandi_daily_streak", "days": 7}'),
('guandi_share_fortune', '分享好运', '将关帝灵签分享到社交媒体', 'onetime', 'newbie', 50, 14, '{"action": "guandi_share", "count": 1}'),
('guandi_collect_points', '积累积分', '通过关帝灵签累积获得1000积分', 'onetime', 'advanced', 200, 15, '{"action": "chain_points_milestone", "amount": 1000}')
ON CONFLICT (task_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points_reward = EXCLUDED.points_reward,
  updated_at = NOW();

-- 添加注释说明
COMMENT ON TABLE guandi_daily_draws IS '关帝灵签每日抽签记录表';
COMMENT ON TABLE guandi_fortune_history IS '关帝签文历史记录表';
COMMENT ON COLUMN guandi_daily_draws.current_state IS '抽签状态: pending=待开始, in_progress=进行中, success=成功, failed=失败';
COMMENT ON COLUMN user_points_web3.guandi_nft_mints_count IS '关帝灵签NFT铸造次数';
COMMENT ON COLUMN user_points_web3.guandi_fortune_draws_count IS '关帝灵签抽签总次数';
COMMENT ON COLUMN user_points_web3.guandi_consecutive_streak IS '关帝灵签连续抽签天数';
COMMENT ON COLUMN user_points_web3.guandi_max_streak IS '关帝灵签最大连续抽签天数';