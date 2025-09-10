-- Migration: Complete User Profiles Table Upgrade
-- Author: BMad Orchestrator
-- Date: 2025-01-09  
-- Description: Add all required fields to user_profiles table for mutual aid system

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Add all mutual aid related fields to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42) UNIQUE;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Reputation and Trust System
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS reputation_score DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_contributions DECIMAL(18,6) DEFAULT 0.0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) DEFAULT 'unverified';

-- Validation System
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active_validator BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS validation_accuracy DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_validations INTEGER DEFAULT 0;

-- Permissions and Role
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]';

-- Activity Tracking
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Profile Status
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Add constraints safely using DO blocks
DO $$
BEGIN
  -- Add reputation score constraint
  BEGIN
    ALTER TABLE user_profiles ADD CONSTRAINT check_reputation_score 
      CHECK (reputation_score IS NULL OR (reputation_score >= 0 AND reputation_score <= 5.0));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Add validation accuracy constraint
  BEGIN
    ALTER TABLE user_profiles ADD CONSTRAINT check_validation_accuracy 
      CHECK (validation_accuracy IS NULL OR (validation_accuracy >= 0 AND validation_accuracy <= 1.0));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Add verification status constraint
  BEGIN
    ALTER TABLE user_profiles ADD CONSTRAINT check_verification_status 
      CHECK (verification_status IS NULL OR verification_status IN ('unverified', 'email_verified', 'kyc_verified', 'fully_verified'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
  
  -- Add role constraint
  BEGIN
    ALTER TABLE user_profiles ADD CONSTRAINT check_role 
      CHECK (role IS NULL OR role IN ('user', 'validator', 'moderator', 'admin'));
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3. Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_status ON user_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active_validator ON user_profiles(is_active_validator) WHERE is_active_validator = true;
CREATE INDEX IF NOT EXISTS idx_user_profiles_reputation_score ON user_profiles(reputation_score DESC) WHERE reputation_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_active ON user_profiles(is_active) WHERE is_active = true;

-- 4. Insert mutual aid temple system using correct existing schema
INSERT INTO temple_systems (
  temple_name,
  temple_name_en, 
  temple_name_ja,
  temple_code,
  location,
  deity,
  specialization,
  total_slips,
  description,
  description_en,
  description_ja,
  cultural_context,
  cultural_context_en,
  cultural_context_ja,
  primary_color,
  secondary_color,
  theme_style,
  established_year,
  is_active,
  partnership_tier
) VALUES (
  '互助預言系統',
  'Mutual Aid Fortune System',
  '相互援助占い体系',
  'mutual_aid',
  'Digital Realm',
  'AI Oracle',
  ARRAY['困境分析', '互助支持', '預測分析', 'AI諮詢'],
  100,
  '基於AI分析的互助預言系統，結合八字、紫微和簽文分析來評估困境狀況',
  'AI-powered mutual aid fortune system combining Bazi, Ziwei, and divination analysis for adversity assessment',
  'AIを活用した相互援助占いシステム、八字・紫微・おみくじ分析を組み合わせて困難な状況を評価',
  '現代科技與傳統占卜智慧的融合，為社區互助提供指導',
  'Integration of modern AI technology with traditional divination wisdom for community mutual aid',
  '現代技術と伝統的な占いの知恵を融合し、コミュニティの相互援助を導く',
  '#2563EB',
  '#1E40AF',
  'modern-gradient',
  2025,
  true,
  'premium'
) ON CONFLICT (temple_code) DO NOTHING;

-- 5. Create default admin user for mutual aid system (if user_id field is required)
INSERT INTO user_profiles (
  user_id,
  wallet_address,
  display_name,
  role,
  verification_status,
  reputation_score,
  is_active_validator,
  is_active
) VALUES (
  uuid_generate_v4(),
  '0x0000000000000000000000000000000000000000',
  'Mutual Aid System Admin',
  'admin',
  'fully_verified',
  5.0,
  true,
  true
) ON CONFLICT (wallet_address) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  role = EXCLUDED.role,
  verification_status = EXCLUDED.verification_status,
  reputation_score = EXCLUDED.reputation_score,
  is_active_validator = EXCLUDED.is_active_validator,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Update completed - user_profiles table ready for mutual aid system