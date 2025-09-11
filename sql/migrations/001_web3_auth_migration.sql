-- Web3 Authentication Migration
-- Migrates from email-based to Web3/Privy authentication

-- 1. Modify users table for Web3 support
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privy_did TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS ens_name TEXT,
ADD COLUMN IF NOT EXISTS linked_accounts JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMPTZ;

-- Create index for Privy DID
CREATE INDEX IF NOT EXISTS idx_users_privy_did ON users(privy_did);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address_lower ON users(LOWER(wallet_address));

-- 2. Create user sessions table for JWT management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    privy_token TEXT,
    supabase_jwt TEXT NOT NULL,
    refresh_token TEXT,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- 3. Create account links table for multi-provider support
CREATE TABLE IF NOT EXISTS account_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    provider_metadata JSONB,
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    is_primary BOOLEAN DEFAULT FALSE,
    UNIQUE(provider, provider_account_id)
);

-- Create indexes for account links
CREATE INDEX IF NOT EXISTS idx_account_links_user_id ON account_links(user_id);
CREATE INDEX IF NOT EXISTS idx_account_links_provider ON account_links(provider);

-- 4. Create authentication logs table
CREATE TABLE IF NOT EXISTS auth_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'login', 'logout', 'link_wallet', 'unlink_wallet', etc.
    provider TEXT, -- 'wallet', 'google', 'twitter', etc.
    wallet_address TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for auth logs
CREATE INDEX IF NOT EXISTS idx_auth_logs_user_id ON auth_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_logs_created_at ON auth_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_logs_event_type ON auth_logs(event_type);

-- 5. Update user_credits table if exists
ALTER TABLE user_credits 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- 6. Create function to get or create user by Privy DID
CREATE OR REPLACE FUNCTION get_or_create_user_by_privy(
    p_privy_did TEXT,
    p_wallet_address TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL,
    p_linked_accounts JSONB DEFAULT '[]'::jsonb
)
RETURNS users AS $$
DECLARE
    v_user users;
    v_existing_user users;
BEGIN
    -- Try to find user by Privy DID
    SELECT * INTO v_existing_user FROM users WHERE privy_did = p_privy_did;
    
    IF v_existing_user.id IS NOT NULL THEN
        -- Update existing user
        UPDATE users 
        SET 
            wallet_address = COALESCE(p_wallet_address, wallet_address),
            email = COALESCE(p_email, email),
            linked_accounts = p_linked_accounts,
            last_sign_in = NOW(),
            updated_at = NOW()
        WHERE id = v_existing_user.id
        RETURNING * INTO v_user;
    ELSE
        -- Try to find by wallet address
        IF p_wallet_address IS NOT NULL THEN
            SELECT * INTO v_existing_user FROM users 
            WHERE LOWER(wallet_address) = LOWER(p_wallet_address);
        END IF;
        
        -- Try to find by email if no wallet match
        IF v_existing_user.id IS NULL AND p_email IS NOT NULL THEN
            SELECT * INTO v_existing_user FROM users 
            WHERE LOWER(email) = LOWER(p_email);
        END IF;
        
        IF v_existing_user.id IS NOT NULL THEN
            -- Update existing user with Privy DID
            UPDATE users 
            SET 
                privy_did = p_privy_did,
                wallet_address = COALESCE(p_wallet_address, wallet_address),
                linked_accounts = p_linked_accounts,
                last_sign_in = NOW(),
                updated_at = NOW()
            WHERE id = v_existing_user.id
            RETURNING * INTO v_user;
        ELSE
            -- Create new user
            INSERT INTO users (
                privy_did,
                wallet_address,
                email,
                username,
                linked_accounts,
                last_sign_in,
                created_at,
                updated_at
            ) VALUES (
                p_privy_did,
                p_wallet_address,
                p_email,
                COALESCE(
                    SUBSTRING(p_wallet_address FROM 1 FOR 6) || '...' || SUBSTRING(p_wallet_address FROM LENGTH(p_wallet_address) - 3),
                    SPLIT_PART(p_email, '@', 1),
                    'User_' || SUBSTRING(p_privy_did FROM 1 FOR 8)
                ),
                p_linked_accounts,
                NOW(),
                NOW(),
                NOW()
            )
            RETURNING * INTO v_user;
            
            -- Create initial credits record
            INSERT INTO user_credits (user_id, free_credits)
            VALUES (v_user.id, 10)
            ON CONFLICT (user_id) DO NOTHING;
        END IF;
    END IF;
    
    RETURN v_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to log authentication events
CREATE OR REPLACE FUNCTION log_auth_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_provider TEXT DEFAULT NULL,
    p_wallet_address TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL,
    p_success BOOLEAN DEFAULT TRUE,
    p_error_message TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO auth_logs (
        user_id,
        event_type,
        provider,
        wallet_address,
        ip_address,
        user_agent,
        metadata,
        success,
        error_message
    ) VALUES (
        p_user_id,
        p_event_type,
        p_provider,
        p_wallet_address,
        p_ip_address,
        p_user_agent,
        p_metadata,
        p_success,
        p_error_message
    );
END;
$$ LANGUAGE plpgsql;

-- 9. Row Level Security Policies
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions" ON user_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Users can view their own account links
CREATE POLICY "Users can view own account links" ON account_links
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own account links
CREATE POLICY "Users can manage own account links" ON account_links
    FOR ALL USING (auth.uid() = user_id);

-- Users can view their own auth logs
CREATE POLICY "Users can view own auth logs" ON auth_logs
    FOR SELECT USING (auth.uid() = user_id);

-- 10. Migration helper: Convert existing users
-- This marks existing users for migration prompts
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS needs_migration BOOLEAN DEFAULT FALSE;

-- Mark existing users without Privy DID for migration
UPDATE users 
SET needs_migration = TRUE 
WHERE privy_did IS NULL 
  AND wallet_address IS NULL
  AND email IS NOT NULL;

-- 11. Create scheduled job to clean sessions (if pg_cron is available)
-- Uncomment if using pg_cron extension
-- SELECT cron.schedule('clean-expired-sessions', '0 * * * *', 'SELECT clean_expired_sessions();');

-- Migration complete
COMMENT ON TABLE user_sessions IS 'Manages user sessions for Web3/Privy authentication';
COMMENT ON TABLE account_links IS 'Links multiple authentication providers to user accounts';
COMMENT ON TABLE auth_logs IS 'Audit log for authentication events';
COMMENT ON COLUMN users.privy_did IS 'Privy decentralized identifier for the user';
COMMENT ON COLUMN users.wallet_address IS 'Primary wallet address for Web3 users';
COMMENT ON COLUMN users.linked_accounts IS 'JSON array of linked social/wallet accounts from Privy';
COMMENT ON COLUMN users.needs_migration IS 'Flag for users who need to migrate from email to Web3';