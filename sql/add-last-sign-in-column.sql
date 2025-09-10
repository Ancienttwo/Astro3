-- Add last_sign_in_at column to users table
-- Run this in your Supabase SQL editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Optional: Add password_hash column for future custom email auth
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add comment
COMMENT ON COLUMN users.last_sign_in_at IS 'User last sign in timestamp';
COMMENT ON COLUMN users.password_hash IS 'Password hash for custom email authentication';

-- =====================================================
-- 积分系统修复：添加Web3用户支持到user_usage表
-- =====================================================

-- 修改user_usage表以支持Web3用户
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