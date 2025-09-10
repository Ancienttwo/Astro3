-- 添加自定义邮箱认证支持的字段
-- 执行时间：2025-07-21

-- 1. 添加password_hash字段（用于自定义邮箱认证）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. 添加last_sign_in_at字段（记录最后登录时间）
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- 3. 更新auth_type字段的约束，添加'custom_email'选项
-- 首先检查是否已有约束
DO $$
BEGIN
    -- 删除旧的约束（如果存在）
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_auth_type_check' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_auth_type_check;
    END IF;
    
    -- 添加新的约束，包含'custom_email'选项
    ALTER TABLE users 
    ADD CONSTRAINT users_auth_type_check 
    CHECK (auth_type IN ('supabase', 'web3', 'wechat', 'custom_email'));
END $$;

-- 4. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_auth_type_email 
ON users(auth_type, email) 
WHERE auth_type = 'custom_email';

-- 5. 添加注释
COMMENT ON COLUMN users.password_hash IS '自定义邮箱认证的密码哈希（仅用于custom_email认证类型）';
COMMENT ON COLUMN users.last_sign_in_at IS '用户最后登录时间';

-- 6. 更新RLS策略（如果需要）
-- 确保自定义邮箱用户也能访问自己的数据
DO $$
BEGIN
    -- 检查是否存在用户查看策略
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can view own profile'
    ) THEN
        -- 更新现有策略以包含自定义邮箱用户
        DROP POLICY IF EXISTS "Users can view own profile" ON users;
    END IF;
    
    -- 创建新的策略
    CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (
        auth.uid() = id OR  -- Supabase Auth用户
        auth_type = 'web3' OR  -- Web3用户（通过其他方式验证）
        auth_type = 'custom_email'  -- 自定义邮箱用户（通过其他方式验证）
    );
END $$;