-- AstroZi Web3 Cold Start: Task System Database Schema
-- English version to avoid encoding issues

-- Enable UUID extension  
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_key VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  task_type VARCHAR(20) NOT NULL DEFAULT 'onetime',
  category VARCHAR(20) NOT NULL DEFAULT 'newbie',
  points_reward INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_tasks table
CREATE TABLE IF NOT EXISTS public.user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  wallet_address VARCHAR(42),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_task UNIQUE NULLS NOT DISTINCT (user_id, wallet_address, task_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_wallet_address ON public.user_tasks(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON public.user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON public.user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_task_key ON public.tasks(task_key);
CREATE INDEX IF NOT EXISTS idx_tasks_is_active ON public.tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for clean re-run)
DROP POLICY IF EXISTS "Anyone can view active tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.user_tasks;
DROP POLICY IF EXISTS "Users can update own tasks" ON public.user_tasks;

-- Create RLS policies
CREATE POLICY "Anyone can view active tasks" ON public.tasks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can view own tasks" ON public.user_tasks
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

CREATE POLICY "Users can insert own tasks" ON public.user_tasks
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

CREATE POLICY "Users can update own tasks" ON public.user_tasks
  FOR UPDATE USING (
    auth.uid() = user_id OR 
    (auth.jwt() ->> 'wallet_address')::text = wallet_address
  );

-- Insert initial tasks data (English descriptions to avoid encoding issues)
INSERT INTO public.tasks (task_key, title, description, task_type, category, points_reward, sort_order, requirements) VALUES
-- Newbie tasks
('daily_checkin', 'Daily Check-in', 'Complete daily check-in to earn basic points', 'daily', 'newbie', 10, 1, '{"action": "checkin", "count": 1}'),
('create_chart', 'Create Birth Chart', 'Successfully create your first birth chart', 'onetime', 'newbie', 50, 2, '{"action": "create_chart", "count": 1}'),
('join_community', 'Join Community', 'Visit official Discord/Twitter community', 'onetime', 'newbie', 20, 3, '{"action": "visit_link", "platforms": ["discord", "twitter"]}'),
('web3_connect', 'Connect Web3 Wallet', 'Successfully connect your Web3 wallet', 'onetime', 'newbie', 30, 4, '{"action": "connect_wallet"}'),

-- Advanced tasks
('consecutive_checkin_7', 'Consecutive Check-in Challenge', 'Check in for 7 consecutive days', 'onetime', 'advanced', 200, 5, '{"action": "consecutive_checkin", "days": 7}'),
('invite_friend', 'Invite Friends', 'Successfully invite a friend to register and complete first check-in', 'onetime', 'advanced', 100, 6, '{"action": "referral", "count": 1}'),
('on_chain_checkin', 'On-Chain Check-in', 'Complete an on-chain check-in transaction', 'daily', 'advanced', 20, 7, '{"action": "on_chain_checkin", "count": 1}')

ON CONFLICT (task_key) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  points_reward = EXCLUDED.points_reward,
  updated_at = NOW();

-- Add helpful comments
COMMENT ON TABLE public.tasks IS 'AstroZi Task System - Task definitions table';
COMMENT ON TABLE public.user_tasks IS 'AstroZi Task System - User task progress table';
COMMENT ON COLUMN public.tasks.task_key IS 'Unique task identifier';
COMMENT ON COLUMN public.tasks.task_type IS 'Task type: daily, onetime, recurring';
COMMENT ON COLUMN public.tasks.category IS 'Task category: newbie, advanced';
COMMENT ON COLUMN public.user_tasks.status IS 'Task status: pending, completed, claimed';