-- Migration: Add auth_type column to user_charts table for data isolation
-- This ensures Web3 and Web2 users cannot access each other's charts
-- Date: 2025-01-21

-- Add auth_type column to user_charts table
ALTER TABLE user_charts 
ADD COLUMN IF NOT EXISTS auth_type VARCHAR(10) DEFAULT 'web2';

-- Create index on auth_type for better query performance
CREATE INDEX IF NOT EXISTS idx_user_charts_auth_type 
ON user_charts(auth_type);

-- Create composite index for user_id and auth_type for optimal filtering
CREATE INDEX IF NOT EXISTS idx_user_charts_user_auth 
ON user_charts(user_id, auth_type);

-- Update existing records to have auth_type = 'web2' if they're null
-- This assumes all existing charts were created by Web2 users
UPDATE user_charts 
SET auth_type = 'web2' 
WHERE auth_type IS NULL;

-- Add constraint to ensure auth_type is one of the valid values
ALTER TABLE user_charts 
ADD CONSTRAINT chk_auth_type 
CHECK (auth_type IN ('web2', 'web3'));

-- Add comment to document the purpose
COMMENT ON COLUMN user_charts.auth_type IS 'Authentication type used when chart was created: web2 (email/password) or web3 (wallet)';

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_charts' 
AND column_name = 'auth_type';