-- RLS 优化（按所有者限制）
-- 可重复执行，存在即跳过

-- 通用过程：为包含 user_id 的表创建 owner-only 策略
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN 
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'user_id'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_owner_select" ON public.%I', t.table_name, t.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_owner_insert" ON public.%I', t.table_name, t.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_owner_update" ON public.%I', t.table_name, t.table_name);
    EXECUTE format('DROP POLICY IF EXISTS "%s_owner_delete" ON public.%I', t.table_name, t.table_name);

    EXECUTE format($$CREATE POLICY "%s_owner_select" ON public.%I
      FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)$$, t.table_name, t.table_name);
    EXECUTE format($$CREATE POLICY "%s_owner_insert" ON public.%I
      FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)$$, t.table_name, t.table_name);
    EXECUTE format($$CREATE POLICY "%s_owner_update" ON public.%I
      FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)$$, t.table_name, t.table_name);
    EXECUTE format($$CREATE POLICY "%s_owner_delete" ON public.%I
      FOR DELETE USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)$$, t.table_name, t.table_name);
  END LOOP;
END$$;

-- 针对 web3_auth_sessions（按 wallet_address + nonce）开放只读（需要服务角色做写入）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web3_auth_sessions') THEN
    EXECUTE 'ALTER TABLE public.web3_auth_sessions ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS web3_auth_sessions_read ON public.web3_auth_sessions';
    EXECUTE 'DROP POLICY IF EXISTS web3_auth_sessions_write ON public.web3_auth_sessions';
    EXECUTE $$CREATE POLICY web3_auth_sessions_read ON public.web3_auth_sessions 
      FOR SELECT USING (true)$$; -- 任意可读（仅暴露非敏感列时使用；否则改用更严格条件）
    EXECUTE $$CREATE POLICY web3_auth_sessions_write ON public.web3_auth_sessions
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role') 
      WITH CHECK (auth.jwt() ->> 'role' = 'service_role')$$;
  END IF;
END$$;

-- 针对 user_profiles 进一步明确定义（owner-only）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles') THEN
    EXECUTE 'ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS user_profiles_select ON public.user_profiles';
    EXECUTE 'DROP POLICY IF EXISTS user_profiles_write ON public.user_profiles';
    EXECUTE $$CREATE POLICY user_profiles_select ON public.user_profiles
      FOR SELECT USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)$$;
    EXECUTE $$CREATE POLICY user_profiles_write ON public.user_profiles
      FOR ALL USING (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)
      WITH CHECK (auth.jwt() ->> 'role' = 'service_role' OR auth.uid() = user_id)$$;
  END IF;
END$$;

