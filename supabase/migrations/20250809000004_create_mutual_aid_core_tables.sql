-- Migration: Create Mutual Aid Core Tables
-- Author: BMad Orchestrator  
-- Date: 2025-01-09
-- Description: Create core mutual aid system tables with proper relationships

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Mutual Aid Predictions Table (AI Analysis Results)
DROP TABLE IF EXISTS mutual_aid_predictions CASCADE;

CREATE TABLE mutual_aid_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  temple_system_id UUID REFERENCES temple_systems(id),
  
  -- Fortune Slip Analysis Results
  slip_number INTEGER,
  slip_title VARCHAR(200),
  slip_content TEXT,
  slip_interpretation TEXT,
  
  -- Bazi Analysis Results
  birth_date DATE,
  birth_time TIME,
  bazi_pillars JSONB,
  bazi_elements JSONB,
  bazi_analysis TEXT,
  
  -- Ziwei Analysis Results
  ziwei_chart JSONB,
  ziwei_palace_analysis JSONB,
  ziwei_interpretation TEXT,
  
  -- Adversity Analysis
  severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 10),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1.0),
  timeframe VARCHAR(50), -- "immediate", "short_term", "long_term"
  category VARCHAR(50), -- "financial", "health", "relationship", "career", etc.
  
  -- Analysis Weights and Factors
  analysis_weights JSONB, -- weights for different analysis components
  risk_factors JSONB,
  protective_factors JSONB,
  
  -- Recommendations
  support_recommendations TEXT,
  challenges TEXT,
  opportunities TEXT,
  advice TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- 2. Create Mutual Aid Requests Table
DROP TABLE IF EXISTS mutual_aid_requests CASCADE;

CREATE TABLE mutual_aid_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  analysis_id UUID REFERENCES mutual_aid_predictions(id) ON DELETE SET NULL,
  
  -- Request Details
  amount DECIMAL(18,6) NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL CHECK (LENGTH(reason) >= 50 AND LENGTH(reason) <= 1000),
  category VARCHAR(50) NOT NULL CHECK (category IN ('financial', 'medical', 'education', 'family', 'disaster', 'other')),
  severity_level INTEGER NOT NULL CHECK (severity_level >= 1 AND severity_level <= 10),
  urgency VARCHAR(20) NOT NULL CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  
  -- Public Information
  public_message TEXT CHECK (LENGTH(public_message) <= 300),
  supporting_documents JSONB DEFAULT '[]',
  
  -- Status and Workflow
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'completed', 'expired', 'cancelled')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  validation_completed_at TIMESTAMP WITH TIME ZONE,
  funding_started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  
  -- Administrative
  admin_notes TEXT,
  internal_flags JSONB DEFAULT '{}',
  
  -- Constraints
  CONSTRAINT valid_expiry CHECK (expires_at > created_at),
  CONSTRAINT valid_completion CHECK (completed_at IS NULL OR completed_at >= created_at)
);

-- 3. Create Mutual Aid Validations Table
DROP TABLE IF EXISTS mutual_aid_validations CASCADE;

CREATE TABLE mutual_aid_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES mutual_aid_requests(id) ON DELETE CASCADE,
  validator_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Validation Decision
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('approve', 'reject')),
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0.1 AND confidence_score <= 1.0),
  reason TEXT NOT NULL CHECK (LENGTH(reason) >= 20 AND LENGTH(reason) <= 500),
  
  -- Validation Context
  review_time_seconds INTEGER CHECK (review_time_seconds >= 10),
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent double validation
  UNIQUE(request_id, validator_id)
);

-- 4. Create Request Status History Table
DROP TABLE IF EXISTS request_status_history CASCADE;

CREATE TABLE request_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES mutual_aid_requests(id) ON DELETE CASCADE,
  from_status VARCHAR(20) NOT NULL,
  to_status VARCHAR(20) NOT NULL,
  changed_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT
);

-- 5. Create or update User Rewards Table (may exist from previous migrations)
DROP TABLE IF EXISTS user_rewards CASCADE;

CREATE TABLE user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(18,6) NOT NULL CHECK (amount > 0),
  reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('validation', 'contribution', 'bonus', 'referral')),
  description TEXT,
  
  -- Context
  validation_id UUID REFERENCES mutual_aid_validations(id) ON DELETE SET NULL,
  request_id UUID REFERENCES mutual_aid_requests(id) ON DELETE SET NULL,
  
  -- Transaction Details
  transaction_hash VARCHAR(66),
  blockchain_network VARCHAR(20) DEFAULT 'polygon',
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- 6. Create or update User NFTs Table
DROP TABLE IF EXISTS user_nfts CASCADE;

CREATE TABLE user_nfts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- NFT Details
  token_id VARCHAR(100) NOT NULL,
  contract_address VARCHAR(42) NOT NULL,
  nft_type VARCHAR(50) NOT NULL CHECK (nft_type IN ('achievement', 'contribution_proof', 'validator_badge', 'special_award')),
  rarity VARCHAR(20) DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  
  -- Metadata
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  attributes JSONB DEFAULT '{}',
  
  -- Context
  earned_for_request_id UUID REFERENCES mutual_aid_requests(id) ON DELETE SET NULL,
  earned_for_validation_id UUID REFERENCES mutual_aid_validations(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(contract_address, token_id)
);

-- 7. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_mutual_aid_predictions_user_id ON mutual_aid_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_predictions_severity_level ON mutual_aid_predictions(severity_level);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_predictions_created_at ON mutual_aid_predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_predictions_expires_at ON mutual_aid_predictions(expires_at);

CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_requester_id ON mutual_aid_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_status ON mutual_aid_requests(status);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_category ON mutual_aid_requests(category);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_urgency ON mutual_aid_requests(urgency);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_severity_level ON mutual_aid_requests(severity_level);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_created_at ON mutual_aid_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_expires_at ON mutual_aid_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_requests_analysis_id ON mutual_aid_requests(analysis_id);

CREATE INDEX IF NOT EXISTS idx_mutual_aid_validations_request_id ON mutual_aid_validations(request_id);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_validations_validator_id ON mutual_aid_validations(validator_id);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_validations_vote ON mutual_aid_validations(vote);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_validations_created_at ON mutual_aid_validations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mutual_aid_validations_confidence_score ON mutual_aid_validations(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_request_status_history_request_id ON request_status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_request_status_history_changed_at ON request_status_history(changed_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_rewards_reward_type ON user_rewards(reward_type);
CREATE INDEX IF NOT EXISTS idx_user_rewards_created_at ON user_rewards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_rewards_status ON user_rewards(status);

CREATE INDEX IF NOT EXISTS idx_user_nfts_owner_id ON user_nfts(owner_id);
CREATE INDEX IF NOT EXISTS idx_user_nfts_nft_type ON user_nfts(nft_type);
CREATE INDEX IF NOT EXISTS idx_user_nfts_rarity ON user_nfts(rarity);
CREATE INDEX IF NOT EXISTS idx_user_nfts_created_at ON user_nfts(created_at DESC);

-- 8. Create Views for Common Queries
CREATE OR REPLACE VIEW active_mutual_aid_requests AS
SELECT 
  r.*,
  p.reputation_score as requester_reputation,
  p.verification_status as requester_verification,
  pred.severity_level as ai_severity_level,
  pred.confidence_score as ai_confidence,
  COUNT(v.id) as validation_count,
  COUNT(CASE WHEN v.vote = 'approve' THEN 1 END) as approval_count,
  COUNT(CASE WHEN v.vote = 'reject' THEN 1 END) as rejection_count
FROM mutual_aid_requests r
JOIN user_profiles p ON r.requester_id = p.id
LEFT JOIN mutual_aid_predictions pred ON r.analysis_id = pred.id
LEFT JOIN mutual_aid_validations v ON r.id = v.request_id
WHERE r.status IN ('pending', 'under_review', 'approved')
  AND r.expires_at > NOW()
  AND COALESCE(p.is_active, true) = true
GROUP BY r.id, p.reputation_score, p.verification_status, pred.severity_level, pred.confidence_score;

CREATE OR REPLACE VIEW validator_performance AS
SELECT 
  p.id as validator_id,
  p.wallet_address,
  p.reputation_score,
  COUNT(v.id) as total_validations,
  COUNT(CASE WHEN v.vote = 'approve' THEN 1 END) as approvals,
  COUNT(CASE WHEN v.vote = 'reject' THEN 1 END) as rejections,
  AVG(v.confidence_score) as avg_confidence,
  COALESCE(
    COUNT(CASE 
      WHEN (v.vote = 'approve' AND r.status IN ('approved', 'completed')) OR 
           (v.vote = 'reject' AND r.status = 'rejected') 
      THEN 1 
    END) * 1.0 / NULLIF(COUNT(v.id), 0), 
    0
  ) as accuracy_rate,
  MAX(v.created_at) as last_validation_at
FROM user_profiles p
JOIN mutual_aid_validations v ON p.id = v.validator_id
JOIN mutual_aid_requests r ON v.request_id = r.id
WHERE COALESCE(p.is_active_validator, false) = true
  AND r.status NOT IN ('pending', 'under_review')
GROUP BY p.id, p.wallet_address, p.reputation_score;

CREATE OR REPLACE VIEW user_mutual_aid_stats AS
SELECT 
  p.id as user_id,
  p.wallet_address,
  p.reputation_score,
  
  -- Request Statistics
  COUNT(DISTINCT r.id) as total_requests,
  COUNT(DISTINCT CASE WHEN r.status = 'approved' THEN r.id END) as approved_requests,
  COUNT(DISTINCT CASE WHEN r.status = 'completed' THEN r.id END) as completed_requests,
  COUNT(DISTINCT CASE WHEN r.status = 'rejected' THEN r.id END) as rejected_requests,
  COALESCE(SUM(CASE WHEN r.status IN ('approved', 'completed') THEN r.amount END), 0) as total_funded_amount,
  
  -- Validation Statistics
  COUNT(DISTINCT v.id) as total_validations,
  COUNT(DISTINCT CASE WHEN v.vote = 'approve' THEN v.id END) as approval_validations,
  COUNT(DISTINCT CASE WHEN v.vote = 'reject' THEN v.id END) as rejection_validations,
  
  -- Reward Statistics
  COALESCE(SUM(CASE WHEN rew.status = 'completed' THEN rew.amount END), 0) as total_rewards,
  COUNT(DISTINCT CASE WHEN rew.status = 'completed' THEN rew.id END) as total_reward_transactions,
  
  -- NFT Statistics
  COUNT(DISTINCT n.id) as total_nfts,
  
  -- Activity
  GREATEST(
    COALESCE(MAX(r.created_at), '1970-01-01'::timestamp with time zone),
    COALESCE(MAX(v.created_at), '1970-01-01'::timestamp with time zone)
  ) as last_activity
  
FROM user_profiles p
LEFT JOIN mutual_aid_requests r ON p.id = r.requester_id
LEFT JOIN mutual_aid_validations v ON p.id = v.validator_id
LEFT JOIN user_rewards rew ON p.id = rew.user_id
LEFT JOIN user_nfts n ON p.id = n.owner_id
WHERE COALESCE(p.is_active, true) = true
GROUP BY p.id, p.wallet_address, p.reputation_score;

-- 9. Create Essential Stored Procedures
CREATE OR REPLACE FUNCTION update_validator_stats(
  user_id UUID,
  validation_approved BOOLEAN
) RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    total_validations = COALESCE(total_validations, 0) + 1,
    validation_accuracy = COALESCE((
      SELECT 
        COUNT(CASE 
          WHEN (v.vote = 'approve' AND r.status IN ('approved', 'completed')) OR 
               (v.vote = 'reject' AND r.status = 'rejected') 
          THEN 1 
        END) * 1.0 / NULLIF(COUNT(v.id), 0)
      FROM mutual_aid_validations v
      JOIN mutual_aid_requests r ON v.request_id = r.id
      WHERE v.validator_id = user_id
        AND r.status NOT IN ('pending', 'under_review')
    ), 0),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION award_validation_reward(
  user_id UUID,
  amount DECIMAL(18,6),
  validation_id UUID
) RETURNS UUID AS $$
DECLARE
  reward_id UUID;
BEGIN
  INSERT INTO user_rewards (
    user_id, 
    amount, 
    reward_type, 
    description, 
    validation_id,
    status
  ) VALUES (
    user_id,
    amount,
    'validation',
    'Reward for validation contribution',
    validation_id,
    'completed'
  ) RETURNING id INTO reward_id;
  
  -- Update user total contributions
  UPDATE user_profiles 
  SET 
    total_contributions = COALESCE(total_contributions, 0) + amount,
    updated_at = NOW()
  WHERE id = user_id;
  
  RETURN reward_id;
END;
$$ LANGUAGE plpgsql;

-- 10. Create Triggers
CREATE OR REPLACE FUNCTION trigger_update_reputation() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Update reputation when request status changes
    UPDATE user_profiles 
    SET 
      reputation_score = LEAST(5.0, GREATEST(0.0, 
        COALESCE((
          SELECT 
            (COUNT(CASE WHEN status IN ('approved', 'completed') THEN 1 END) * 1.0 / 
             NULLIF(COUNT(*), 0)) * 5.0
          FROM mutual_aid_requests 
          WHERE requester_id = NEW.requester_id
        ), 0.0)
      )),
      updated_at = NOW()
    WHERE id = NEW.requester_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_reputation_on_request_status_change ON mutual_aid_requests;
CREATE TRIGGER update_reputation_on_request_status_change
  AFTER UPDATE ON mutual_aid_requests
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_reputation();

-- 11. Grant permissions
GRANT SELECT, INSERT, UPDATE ON mutual_aid_requests TO authenticated;
GRANT SELECT, INSERT ON mutual_aid_validations TO authenticated;  
GRANT SELECT ON mutual_aid_predictions TO authenticated;
GRANT SELECT ON request_status_history TO authenticated;
GRANT SELECT ON user_rewards TO authenticated;
GRANT SELECT ON user_nfts TO authenticated;
GRANT SELECT ON active_mutual_aid_requests TO authenticated;
GRANT SELECT ON validator_performance TO authenticated;
GRANT SELECT ON user_mutual_aid_stats TO authenticated;

-- Migration complete - Core mutual aid system tables ready