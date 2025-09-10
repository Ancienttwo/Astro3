-- Create nonces table for WalletConnect authentication
CREATE TABLE IF NOT EXISTS public.nonces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    address TEXT NOT NULL UNIQUE,
    nonce TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_nonces_address ON public.nonces(address);
CREATE INDEX IF NOT EXISTS idx_nonces_expires_at ON public.nonces(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.nonces ENABLE ROW LEVEL SECURITY;

-- Create policy for service role access
CREATE POLICY "Service role can manage nonces" ON public.nonces
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Function to create nonces table if not exists (for Edge Function compatibility)
CREATE OR REPLACE FUNCTION public.create_nonces_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This function ensures the table exists
    -- It's called from the Edge Function to handle cases where the table might not exist
    CREATE TABLE IF NOT EXISTS public.nonces (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        address TEXT NOT NULL UNIQUE,
        nonce TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Ensure indexes exist
    CREATE INDEX IF NOT EXISTS idx_nonces_address ON public.nonces(address);
    CREATE INDEX IF NOT EXISTS idx_nonces_expires_at ON public.nonces(expires_at);
END;
$$;

-- Add wallet_address column to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='wallet_address') THEN
        ALTER TABLE public.users ADD COLUMN wallet_address TEXT UNIQUE;
        CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);
    END IF;
END $$;

-- Add is_web3_user column to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_web3_user') THEN
        ALTER TABLE public.users ADD COLUMN is_web3_user BOOLEAN DEFAULT FALSE;
        CREATE INDEX IF NOT EXISTS idx_users_is_web3_user ON public.users(is_web3_user);
    END IF;
END $$;

-- Add auth_method column to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='auth_method') THEN
        ALTER TABLE public.users ADD COLUMN auth_method TEXT DEFAULT 'email';
        CREATE INDEX IF NOT EXISTS idx_users_auth_method ON public.users(auth_method);
    END IF;
END $$;

-- Update RLS policies for users table to include Web3 users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = id 
        OR 
        (is_web3_user = true AND wallet_address = LOWER(auth.jwt() ->> 'wallet_address'))
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = id 
        OR 
        (is_web3_user = true AND wallet_address = LOWER(auth.jwt() ->> 'wallet_address'))
    )
    WITH CHECK (
        auth.uid() = id 
        OR 
        (is_web3_user = true AND wallet_address = LOWER(auth.jwt() ->> 'wallet_address'))
    );

-- Function to clean up expired nonces (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_nonces()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count integer;
BEGIN
    DELETE FROM public.nonces 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.nonces TO service_role;
GRANT EXECUTE ON FUNCTION public.create_nonces_table_if_not_exists() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_nonces() TO service_role;