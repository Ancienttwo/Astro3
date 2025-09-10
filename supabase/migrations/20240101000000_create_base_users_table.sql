-- Create basic users table for WalletConnect integration
CREATE TABLE IF NOT EXISTS public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT,
    wallet_address TEXT UNIQUE,
    auth_type TEXT DEFAULT 'email',
    auth_provider TEXT DEFAULT 'email',
    user_type TEXT DEFAULT 'standard',
    is_web3_user BOOLEAN DEFAULT FALSE,
    auth_method TEXT DEFAULT 'email',
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_auth_type ON public.users(auth_type);
CREATE INDEX IF NOT EXISTS idx_users_is_web3_user ON public.users(is_web3_user);
CREATE INDEX IF NOT EXISTS idx_users_auth_method ON public.users(auth_method);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid()::text = id::text)
    WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Service role can manage users" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;