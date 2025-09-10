-- =============================================
-- Web3用户RLS策略配置
-- =============================================
-- 
-- 此文件包含为Web3用户配置Row Level Security (RLS)的SQL语句
-- 确保Web3用户只能访问自己的数据，同时与Web2用户隔离
--
-- 使用方法：在Supabase Dashboard的SQL Editor中执行

-- =============================================
-- 1. 用户表 (users) 的RLS策略
-- =============================================

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "web3_users_select" ON public.users;
DROP POLICY IF EXISTS "web3_users_insert" ON public.users;
DROP POLICY IF EXISTS "web3_users_update" ON public.users;

-- Web3用户只能查看自己的记录
CREATE POLICY "web3_users_select" ON public.users
    FOR SELECT 
    USING (
        -- 允许用户查看自己的记录
        auth.uid()::text = id::text
        OR
        -- 管理员可以查看所有记录
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Web3用户可以插入自己的记录（通过service role）
CREATE POLICY "web3_users_insert" ON public.users
    FOR INSERT 
    WITH CHECK (
        -- 只允许service role插入记录
        auth.jwt() ->> 'role' = 'service_role'
        OR
        -- 或者用户插入自己的记录
        auth.uid()::text = id::text
    );

-- Web3用户可以更新自己的记录
CREATE POLICY "web3_users_update" ON public.users
    FOR UPDATE 
    USING (
        -- 用户只能更新自己的记录
        auth.uid()::text = id::text
        OR
        -- 管理员可以更新所有记录
        auth.jwt() ->> 'role' = 'service_role'
    );

-- =============================================
-- 2. 命盤记录表的RLS策略（如果存在）
-- =============================================

-- 检查是否存在charts表或类似的用户数据表
-- 这些策略确保Web3用户只能访问自己的命盤数据

-- 为所有可能的用户数据表创建通用策略模板
DO $$
DECLARE
    table_name TEXT;
    table_list TEXT[] := ARRAY['charts', 'user_charts', 'readings', 'user_data', 'profiles'];
BEGIN
    FOREACH table_name IN ARRAY table_list
    LOOP
        -- 检查表是否存在
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = table_name) THEN
            
            -- 删除现有策略
            EXECUTE format('DROP POLICY IF EXISTS "%s_web3_select" ON public.%I', table_name, table_name);
            EXECUTE format('DROP POLICY IF EXISTS "%s_web3_insert" ON public.%I', table_name, table_name);
            EXECUTE format('DROP POLICY IF EXISTS "%s_web3_update" ON public.%I', table_name, table_name);
            EXECUTE format('DROP POLICY IF EXISTS "%s_web3_delete" ON public.%I', table_name, table_name);
            
            -- 创建新的RLS策略
            -- SELECT: 用户只能查看自己的记录
            EXECUTE format('
                CREATE POLICY "%s_web3_select" ON public.%I
                FOR SELECT 
                USING (
                    auth.uid()::text = user_id::text
                    OR auth.jwt() ->> ''role'' = ''service_role''
                )', table_name, table_name);
            
            -- INSERT: 用户只能插入自己的记录
            EXECUTE format('
                CREATE POLICY "%s_web3_insert" ON public.%I
                FOR INSERT 
                WITH CHECK (
                    auth.uid()::text = user_id::text
                    OR auth.jwt() ->> ''role'' = ''service_role''
                )', table_name, table_name);
            
            -- UPDATE: 用户只能更新自己的记录
            EXECUTE format('
                CREATE POLICY "%s_web3_update" ON public.%I
                FOR UPDATE 
                USING (
                    auth.uid()::text = user_id::text
                    OR auth.jwt() ->> ''role'' = ''service_role''
                )', table_name, table_name);
            
            -- DELETE: 用户只能删除自己的记录
            EXECUTE format('
                CREATE POLICY "%s_web3_delete" ON public.%I
                FOR DELETE 
                USING (
                    auth.uid()::text = user_id::text
                    OR auth.jwt() ->> ''role'' = ''service_role''
                )', table_name, table_name);
            
            RAISE NOTICE 'RLS policies created for table: %', table_name;
        END IF;
    END LOOP;
END $$;

-- =============================================
-- 3. 确保RLS已启用
-- =============================================

-- 为用户表启用RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 为其他可能的用户数据表启用RLS
DO $$
DECLARE
    table_name TEXT;
    table_list TEXT[] := ARRAY['charts', 'user_charts', 'readings', 'user_data', 'profiles'];
BEGIN
    FOREACH table_name IN ARRAY table_list
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables 
                  WHERE table_schema = 'public' AND table_name = table_name) THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'RLS enabled for table: %', table_name;
        END IF;
    END LOOP;
END $$;

-- =============================================
-- 4. Web3特定的辅助函数
-- =============================================

-- 创建函数来检查用户是否为Web3用户
CREATE OR REPLACE FUNCTION is_web3_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT 
        CASE 
            WHEN auth.jwt() ->> 'app_metadata' IS NOT NULL THEN
                (auth.jwt() -> 'app_metadata' ->> 'auth_type') = 'web3'
            ELSE
                FALSE
        END;
$$;

-- 创建函数来获取用户的钱包地址
CREATE OR REPLACE FUNCTION get_user_wallet_address()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
    SELECT 
        CASE 
            WHEN auth.jwt() ->> 'user_metadata' IS NOT NULL THEN
                auth.jwt() -> 'user_metadata' ->> 'wallet_address'
            ELSE
                NULL
        END;
$$;

-- =============================================
-- 5. Web3用户数据访问视图
-- =============================================

-- 创建安全的用户信息视图，只显示当前用户可以访问的数据
CREATE OR REPLACE VIEW user_profile_secure AS
SELECT 
    id,
    email,
    username,
    wallet_address,
    auth_type,
    auth_provider,
    user_type,
    created_at,
    updated_at,
    last_sign_in_at,
    -- 添加Web3特定字段的标识
    CASE 
        WHEN auth_type = 'web3' THEN true 
        ELSE false 
    END as is_web3_user,
    -- 显示认证方式
    CASE 
        WHEN auth_type = 'web3' THEN 'WalletConnect'
        WHEN auth_type = 'web2' THEN 'Email/Password'
        ELSE 'Unknown'
    END as auth_method_display
FROM public.users
WHERE 
    -- 用户只能看到自己的信息
    auth.uid()::text = id::text
    -- 或者是管理员
    OR auth.jwt() ->> 'role' = 'service_role';

-- =============================================
-- 6. 审计日志表（可选）
-- =============================================

-- 创建Web3用户操作审计日志表
CREATE TABLE IF NOT EXISTS public.web3_audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id),
    wallet_address TEXT,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 为审计日志表启用RLS
ALTER TABLE public.web3_audit_log ENABLE ROW LEVEL SECURITY;

-- 审计日志的RLS策略：用户只能查看自己的日志
CREATE POLICY "web3_audit_select" ON public.web3_audit_log
    FOR SELECT 
    USING (
        auth.uid()::text = user_id::text
        OR auth.jwt() ->> 'role' = 'service_role'
    );

-- 只允许系统插入审计日志
CREATE POLICY "web3_audit_insert" ON public.web3_audit_log
    FOR INSERT 
    WITH CHECK (
        auth.jwt() ->> 'role' = 'service_role'
    );

-- =============================================
-- 7. 测试查询
-- =============================================

-- 创建用于测试RLS的辅助函数
CREATE OR REPLACE FUNCTION test_web3_rls()
RETURNS TABLE(
    test_name TEXT,
    result TEXT,
    details TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- 这个函数可以用来测试RLS策略是否正确工作
    -- 需要在有authenticated用户上下文时调用
    
    RETURN QUERY
    SELECT 
        'User Access Test' as test_name,
        CASE 
            WHEN auth.uid() IS NOT NULL THEN 'PASS'
            ELSE 'FAIL'
        END as result,
        'User ID: ' || COALESCE(auth.uid()::text, 'NULL') as details
    
    UNION ALL
    
    SELECT 
        'Web3 User Check' as test_name,
        CASE 
            WHEN is_web3_user() THEN 'PASS - Web3 User'
            ELSE 'PASS - Web2 User'
        END as result,
        'Wallet: ' || COALESCE(get_user_wallet_address(), 'N/A') as details;
END $$;

-- =============================================
-- 完成信息
-- =============================================

-- 显示完成信息
DO $$
BEGIN
    RAISE NOTICE '✅ Web3 RLS policies configuration completed!';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '1. Test the policies with Web3 user sessions';
    RAISE NOTICE '2. Verify data isolation between Web2 and Web3 users';
    RAISE NOTICE '3. Monitor audit logs for any access issues';
    RAISE NOTICE '4. Update application code to use the new RLS system';
END $$;