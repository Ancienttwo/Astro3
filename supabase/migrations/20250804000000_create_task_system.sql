-- AstroZi Web3 Cold Start: Task System Database Schema
-- Version: 1.0
-- Date: 2025-08-04

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 任务定义表 - 存储所有可用任务的配置信息
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_key VARCHAR(50) UNIQUE NOT NULL, -- 任务唯一标识符，如 'daily_checkin', 'create_chart'
  title VARCHAR(100) NOT NULL, -- 任务标题
  description TEXT, -- 任务描述
  task_type VARCHAR(20) NOT NULL DEFAULT 'onetime', -- 任务类型: 'daily', 'onetime', 'recurring'
  category VARCHAR(20) NOT NULL DEFAULT 'newbie', -- 任务分类: 'newbie', 'advanced'
  points_reward INTEGER NOT NULL DEFAULT 0, -- 积分奖励
  is_active BOOLEAN DEFAULT true, -- 是否启用该任务
  sort_order INTEGER DEFAULT 0, -- 显示排序
  requirements JSONB, -- 任务完成要求（JSON格式）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户任务进度表 - 记录用户任务完成状态
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- Web2用户ID（来自auth.users）
  wallet_address VARCHAR(42), -- Web3用户钱包地址
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- 任务状态: 'pending', 'completed', 'claimed'
  progress INTEGER DEFAULT 0, -- 任务进度（用于连续签到等需要计数的任务）
  completed_at TIMESTAMP WITH TIME ZONE, -- 完成时间
  claimed_at TIMESTAMP WITH TIME ZONE, -- 领取奖励时间
  metadata JSONB, -- 额外元数据（如连续签到天数等）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 确保每个用户对每个任务只有一条记录
  CONSTRAINT unique_user_task UNIQUE NULLS NOT DISTINCT (user_id, wallet_address, task_id)
);

-- 为user_tasks表创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_wallet_address ON user_tasks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_completed_at ON user_tasks(completed_at);

-- 为tasks表创建索引
CREATE INDEX IF NOT EXISTS idx_tasks_task_key ON tasks(task_key);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_sort_order ON tasks(sort_order);

-- 插入初始任务数据
INSERT INTO tasks (task_key, title, description, task_type, category, points_reward, sort_order, requirements) VALUES
-- 新手任务
('daily_checkin', '每日签到', '完成一次每日签到', 'daily', 'newbie', 10, 1, '{"action": "checkin", "count": 1}'),
('create_chart', '创建命盘', '成功创建你的第一个命盘', 'onetime', 'newbie', 50, 2, '{"action": "create_chart", "count": 1}'),
('join_community', '加入社区', '点击链接访问Discord/Twitter', 'onetime', 'newbie', 20, 3, '{"action": "visit_link", "platforms": ["discord", "twitter"]}'),

-- 进阶任务
('invite_friend', '邀请好友', '成功邀请一位好友注册并完成签到', 'onetime', 'advanced', 100, 4, '{"action": "referral", "count": 1}'),
('consecutive_checkin_7', '连续签到', '连续签到7天', 'onetime', 'advanced', 200, 5, '{"action": "consecutive_checkin", "days": 7}'),

-- Web3特有任务  
('web3_connect', 'Web3钱包连接', '成功连接Web3钱包', 'onetime', 'newbie', 30, 6, '{"action": "connect_wallet"}'),
('on_chain_checkin', '链上签到', '完成一次链上签到', 'daily', 'advanced', 20, 7, '{"action": "on_chain_checkin", "count": 1}')

ON CONFLICT (task_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points_reward = EXCLUDED.points_reward,
  updated_at = NOW();

-- 创建触发器以自动更新updated_at字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为tasks表创建更新时间触发器
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为user_tasks表创建更新时间触发器  
DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON user_tasks;
CREATE TRIGGER update_user_tasks_updated_at
    BEFORE UPDATE ON user_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 创建RLS(Row Level Security)策略
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- tasks表的RLS策略 - 所有用户都可以查看活跃任务
CREATE POLICY "Anyone can view active tasks" ON tasks
  FOR SELECT USING (is_active = true);

-- user_tasks表的RLS策略 - 用户只能查看和修改自己的任务记录
CREATE POLICY "Users can view own tasks" ON user_tasks
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

CREATE POLICY "Users can insert own tasks" ON user_tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

CREATE POLICY "Users can update own tasks" ON user_tasks
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

-- 添加注释说明
COMMENT ON TABLE tasks IS 'AstroZi任务系统 - 任务定义表';
COMMENT ON TABLE user_tasks IS 'AstroZi任务系统 - 用户任务进度表';

COMMENT ON COLUMN tasks.task_key IS '任务唯一标识符';
COMMENT ON COLUMN tasks.task_type IS '任务类型: daily=每日任务, onetime=一次性任务, recurring=周期性任务';
COMMENT ON COLUMN tasks.category IS '任务分类: newbie=新手任务, advanced=进阶任务';
COMMENT ON COLUMN tasks.requirements IS '任务完成要求的JSON配置';

COMMENT ON COLUMN user_tasks.status IS '任务状态: pending=待完成, completed=已完成, claimed=已领取奖励';
COMMENT ON COLUMN user_tasks.progress IS '任务进度计数器';
COMMENT ON COLUMN user_tasks.metadata IS '任务相关的额外元数据';