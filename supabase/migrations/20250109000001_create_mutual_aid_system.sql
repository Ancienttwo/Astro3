-- AstroZi Mutual Aid Token System Database Migration
-- Migration: 20250109000001_create_mutual_aid_system.sql
-- Description: Core tables for the Mutual Aid Token System
-- Author: AstroZi Development Team
-- Date: 2025-01-09

-- ==================================
-- 1. MUTUAL AID PREDICTIONS TABLE
-- ==================================

-- Store AI-powered adversity predictions
CREATE TABLE mutual_aid_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  
  -- Fortune slip context
  fortune_slip_number INTEGER NOT NULL,
  birth_data JSONB NOT NULL, -- {year, month, day, hour}
  jiaobei_confirmed BOOLEAN DEFAULT false,
  personal_context JSONB, -- {situation, duration, severity}
  
  -- AI analysis results
  severity_level INTEGER NOT NULL CHECK (severity_level >= 1 AND severity_level <= 10),
  mutual_aid_eligible BOOLEAN DEFAULT false,
  recommended_aid_amount DECIMAL(10,2) DEFAULT 0.00,
  
  -- Analysis weights and confidence
  analysis_weights JSONB NOT NULL, -- {fortuneSlipWeight, baziWeight, ziweiWeight, contextWeight}
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  
  -- Prediction details
  timeframe TEXT NOT NULL, -- e.g., "接下来7天"
  challenges TEXT[], -- Array of predicted challenges
  opportunities TEXT[], -- Array of predicted opportunities
  advice TEXT NOT NULL,
  
  -- Support recommendations
  support_recommendations JSONB NOT NULL, -- Array of {type, description, amount, priority}
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Indexes for performance
CREATE INDEX idx_mutual_aid_predictions_user_id ON mutual_aid_predictions(user_id);
CREATE INDEX idx_mutual_aid_predictions_wallet ON mutual_aid_predictions(wallet_address);
CREATE INDEX idx_mutual_aid_predictions_created_at ON mutual_aid_predictions(created_at DESC);
CREATE INDEX idx_mutual_aid_predictions_eligible ON mutual_aid_predictions(mutual_aid_eligible, created_at DESC);

-- ==================================
-- 2. MUTUAL AID REQUESTS TABLE
-- ==================================

-- Store community mutual aid requests
CREATE TABLE mutual_aid_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  prediction_id UUID REFERENCES mutual_aid_predictions(id) ON DELETE CASCADE,
  
  -- Request details
  status VARCHAR(20) DEFAULT 'pending_validation' CHECK (status IN ('pending_validation', 'approved', 'rejected', 'distributed', 'cancelled')),
  requested_amount DECIMAL(10,2) NOT NULL CHECK (requested_amount > 0),
  
  -- Additional context provided by user
  description TEXT NOT NULL,
  evidence_files TEXT[], -- Array of file URLs/hashes
  timeline TEXT NOT NULL,
  
  -- Validation process
  validation_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  required_approvals INTEGER DEFAULT 8,
  current_approvals INTEGER DEFAULT 0,
  current_rejections INTEGER DEFAULT 0,
  
  -- Distribution details
  distributed_amount DECIMAL(10,2) DEFAULT 0.00,
  distribution_tx_hash VARCHAR(66),
  distributed_at TIMESTAMP WITH TIME ZONE,
  
  -- Agreement confirmation
  agreement_accepted BOOLEAN DEFAULT false,
  agreement_timestamp TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_mutual_aid_requests_user_id ON mutual_aid_requests(user_id);
CREATE INDEX idx_mutual_aid_requests_wallet ON mutual_aid_requests(wallet_address);
CREATE INDEX idx_mutual_aid_requests_status ON mutual_aid_requests(status, created_at DESC);
CREATE INDEX idx_mutual_aid_requests_validation ON mutual_aid_requests(status, validation_deadline);
CREATE INDEX idx_mutual_aid_requests_prediction ON mutual_aid_requests(prediction_id);

-- ==================================
-- 3. COMMUNITY VALIDATIONS TABLE
-- ==================================

-- Store community validation votes
CREATE TABLE community_validations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES mutual_aid_requests(id) ON DELETE CASCADE,
  validator_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  validator_wallet_address VARCHAR(42) NOT NULL,
  
  -- Vote details
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('approve', 'reject')),
  reasoning TEXT NOT NULL,
  confidence_level DECIMAL(3,2) DEFAULT 0.5 CHECK (confidence_level >= 0.0 AND confidence_level <= 1.0),
  
  -- Validator qualifications
  nft_token_ids INTEGER[] NOT NULL DEFAULT '{}', -- Array of owned NFT token IDs
  vote_weight DECIMAL(3,2) DEFAULT 1.0,
  validator_reputation DECIMAL(3,2) DEFAULT 1.0,
  
  -- Outcome tracking
  was_correct BOOLEAN, -- Set after final outcome
  reputation_change DECIMAL(3,2) DEFAULT 0.0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_community_validations_request_id ON community_validations(request_id);
CREATE INDEX idx_community_validations_validator ON community_validations(validator_user_id);
CREATE INDEX idx_community_validations_wallet ON community_validations(validator_wallet_address);
CREATE INDEX idx_community_validations_created_at ON community_validations(created_at DESC);

-- Unique constraint to prevent duplicate votes
ALTER TABLE community_validations ADD CONSTRAINT unique_validator_request 
  UNIQUE(request_id, validator_user_id);

-- ==================================
-- 4. AZI TOKEN DISTRIBUTIONS TABLE
-- ==================================

-- Track all AZI token distributions
CREATE TABLE azi_token_distributions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_user_id UUID REFERENCES auth.users(id),
  recipient_wallet_address VARCHAR(42) NOT NULL,
  
  -- Distribution details
  distribution_type VARCHAR(20) NOT NULL CHECK (distribution_type IN ('mutual_aid', 'validation_reward', 'referral_bonus', 'governance_reward', 'daily_bonus')),
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  
  -- Source reference
  source_id UUID, -- Can reference mutual_aid_requests, community_validations, etc.
  source_type VARCHAR(20), -- 'mutual_aid_request', 'community_validation', etc.
  
  -- Blockchain transaction
  tx_hash VARCHAR(66) NOT NULL,
  block_number BIGINT,
  gas_used INTEGER,
  gas_price DECIMAL(20,0), -- Wei amount
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  confirmation_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_azi_distributions_recipient ON azi_token_distributions(recipient_user_id);
CREATE INDEX idx_azi_distributions_wallet ON azi_token_distributions(recipient_wallet_address);
CREATE INDEX idx_azi_distributions_type ON azi_token_distributions(distribution_type, created_at DESC);
CREATE INDEX idx_azi_distributions_status ON azi_token_distributions(status, created_at DESC);
CREATE INDEX idx_azi_distributions_tx_hash ON azi_token_distributions(tx_hash);

-- ==================================
-- 5. GUANDI NFT METADATA TABLE
-- ==================================

-- Store NFT metadata and rarity information
CREATE TABLE guandi_nft_metadata (
  token_id SERIAL PRIMARY KEY,
  owner_user_id UUID REFERENCES auth.users(id),
  owner_wallet_address VARCHAR(42) NOT NULL,
  
  -- Fortune slip association
  fortune_slip_number INTEGER NOT NULL,
  fortune_slip_title VARCHAR(100) NOT NULL,
  fortune_slip_title_en VARCHAR(100),
  
  -- NFT attributes
  rarity VARCHAR(20) NOT NULL CHECK (rarity IN ('common', 'epic', 'legendary')),
  rarity_score INTEGER NOT NULL CHECK (rarity_score >= 1 AND rarity_score <= 100),
  
  -- Visual attributes
  image_url TEXT NOT NULL,
  metadata_uri TEXT NOT NULL,
  attributes JSONB NOT NULL, -- Array of {trait_type, value} objects
  
  -- Utility properties
  governance_weight INTEGER DEFAULT 1,
  validation_weight DECIMAL(3,2) DEFAULT 1.0,
  transferable BOOLEAN DEFAULT true,
  
  -- Blockchain data
  mint_tx_hash VARCHAR(66) NOT NULL,
  mint_block_number BIGINT,
  current_tx_hash VARCHAR(66), -- Latest transfer transaction
  
  -- Transfer history
  transfer_count INTEGER DEFAULT 0,
  last_transfer_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  minted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_guandi_nft_owner ON guandi_nft_metadata(owner_user_id);
CREATE INDEX idx_guandi_nft_wallet ON guandi_nft_metadata(owner_wallet_address);
CREATE INDEX idx_guandi_nft_rarity ON guandi_nft_metadata(rarity, minted_at DESC);
CREATE INDEX idx_guandi_nft_slip ON guandi_nft_metadata(fortune_slip_number);
CREATE INDEX idx_guandi_nft_mint_tx ON guandi_nft_metadata(mint_tx_hash);

-- ==================================
-- 6. USER REPUTATION SCORES TABLE
-- ==================================

-- Track user reputation and trust scores
CREATE TABLE user_reputation_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  
  -- Reputation metrics
  overall_score DECIMAL(3,2) DEFAULT 3.0 CHECK (overall_score >= 0.0 AND overall_score <= 5.0),
  validation_accuracy DECIMAL(3,2) DEFAULT 0.5 CHECK (validation_accuracy >= 0.0 AND validation_accuracy <= 1.0),
  community_trust DECIMAL(3,2) DEFAULT 3.0 CHECK (community_trust >= 0.0 AND community_trust <= 5.0),
  
  -- Activity counters
  total_validations INTEGER DEFAULT 0,
  correct_validations INTEGER DEFAULT 0,
  mutual_aid_received_count INTEGER DEFAULT 0,
  mutual_aid_received_amount DECIMAL(10,2) DEFAULT 0.00,
  nft_collection_count INTEGER DEFAULT 0,
  governance_participation INTEGER DEFAULT 0,
  
  -- Trust indicators
  account_age_days INTEGER DEFAULT 0,
  verified_identity BOOLEAN DEFAULT false,
  referrals_made INTEGER DEFAULT 0,
  referrals_successful INTEGER DEFAULT 0,
  
  -- Calculated metrics
  validation_power DECIMAL(3,2) DEFAULT 1.0,
  max_aid_eligibility DECIMAL(10,2) DEFAULT 50.00,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_reputation_wallet ON user_reputation_scores(wallet_address);
CREATE INDEX idx_user_reputation_score ON user_reputation_scores(overall_score DESC);
CREATE INDEX idx_user_reputation_validation_power ON user_reputation_scores(validation_power DESC);
CREATE INDEX idx_user_reputation_updated_at ON user_reputation_scores(updated_at DESC);

-- ==================================
-- 7. GOVERNANCE PROPOSALS TABLE
-- ==================================

-- Community governance proposals
CREATE TABLE governance_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  proposer_wallet_address VARCHAR(42) NOT NULL,
  
  -- Proposal details
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(30) NOT NULL, -- 'tokenomics', 'platform_improvement', 'feature_request', etc.
  proposal_type VARCHAR(30) NOT NULL,
  
  -- Implementation details
  implementation_plan JSONB, -- {timeline, estimatedCost, team, etc.}
  staking_amount DECIMAL(10,2) DEFAULT 100.00,
  staking_tx_hash VARCHAR(66),
  
  -- Voting details
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'passed', 'rejected', 'executed')),
  voting_start_date TIMESTAMP WITH TIME ZONE,
  voting_end_date TIMESTAMP WITH TIME ZONE,
  required_quorum DECIMAL(10,2) DEFAULT 3000.00,
  
  -- Vote counts
  votes_for_count INTEGER DEFAULT 0,
  votes_for_weight DECIMAL(10,2) DEFAULT 0.00,
  votes_against_count INTEGER DEFAULT 0,
  votes_against_weight DECIMAL(10,2) DEFAULT 0.00,
  votes_abstain_count INTEGER DEFAULT 0,
  votes_abstain_weight DECIMAL(10,2) DEFAULT 0.00,
  
  -- Execution
  execution_tx_hash VARCHAR(66),
  executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_governance_proposals_proposer ON governance_proposals(proposer_user_id);
CREATE INDEX idx_governance_proposals_status ON governance_proposals(status, created_at DESC);
CREATE INDEX idx_governance_proposals_category ON governance_proposals(category, status);
CREATE INDEX idx_governance_proposals_voting ON governance_proposals(status, voting_end_date);

-- ==================================
-- 8. GOVERNANCE VOTES TABLE
-- ==================================

-- Individual governance votes
CREATE TABLE governance_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES governance_proposals(id) ON DELETE CASCADE,
  voter_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  voter_wallet_address VARCHAR(42) NOT NULL,
  
  -- Vote details
  vote VARCHAR(10) NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  reasoning TEXT,
  vote_weight DECIMAL(3,2) DEFAULT 1.0,
  
  -- Qualifying NFTs
  nft_token_ids INTEGER[] NOT NULL DEFAULT '{}',
  total_governance_power INTEGER DEFAULT 1,
  
  -- Blockchain transaction
  tx_hash VARCHAR(66) NOT NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_governance_votes_proposal ON governance_votes(proposal_id);
CREATE INDEX idx_governance_votes_voter ON governance_votes(voter_user_id);
CREATE INDEX idx_governance_votes_created_at ON governance_votes(created_at DESC);

-- Unique constraint to prevent duplicate votes
ALTER TABLE governance_votes ADD CONSTRAINT unique_voter_proposal 
  UNIQUE(proposal_id, voter_user_id);

-- ==================================
-- 9. SYSTEM CONFIGURATION TABLE
-- ==================================

-- Store system-wide configuration parameters
CREATE TABLE system_configuration (
  key VARCHAR(50) PRIMARY KEY,
  value TEXT NOT NULL,
  value_type VARCHAR(20) DEFAULT 'string' CHECK (value_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default configuration values
INSERT INTO system_configuration (key, value, value_type, description, is_public) VALUES
('mutual_aid_pool_percentage', '60', 'number', 'Percentage of tokens allocated to mutual aid pool', true),
('max_validation_time_hours', '24', 'number', 'Maximum hours for community validation', true),
('min_validation_approvals', '8', 'number', 'Minimum approvals required for aid distribution', true),
('max_aid_amount_per_request', '100.00', 'number', 'Maximum AZI tokens per single aid request', true),
('nft_rarity_weights', '{"common": 89, "epic": 9, "legendary": 2}', 'json', 'NFT rarity distribution percentages', true),
('governance_quorum_threshold', '3000.00', 'number', 'Minimum voting weight required for governance quorum', true),
('reputation_decay_days', '90', 'number', 'Days after which reputation starts to decay without activity', false),
('max_daily_fortune_readings', '3', 'number', 'Maximum fortune readings per user per day', true);

-- ==================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==================================

-- Enable RLS on all tables
ALTER TABLE mutual_aid_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mutual_aid_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE azi_token_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guandi_nft_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;

-- Predictions: Users can only see their own predictions
CREATE POLICY "Users can view own predictions" ON mutual_aid_predictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own predictions" ON mutual_aid_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Requests: Users can see their own requests, validators can see pending requests
CREATE POLICY "Users can view own requests" ON mutual_aid_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Validators can view pending requests" ON mutual_aid_requests
  FOR SELECT USING (status = 'pending_validation');

CREATE POLICY "Users can create own requests" ON mutual_aid_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Validations: Validators can see all validations, users can see validations for their requests
CREATE POLICY "Validators can view all validations" ON community_validations
  FOR SELECT USING (auth.uid() = validator_user_id);

CREATE POLICY "Request owners can view related validations" ON community_validations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM mutual_aid_requests 
      WHERE id = request_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Validators can create validations" ON community_validations
  FOR INSERT WITH CHECK (auth.uid() = validator_user_id);

-- Distributions: Users can view their own distributions
CREATE POLICY "Users can view own distributions" ON azi_token_distributions
  FOR SELECT USING (auth.uid() = recipient_user_id);

-- NFTs: Users can view their own NFTs, public view for marketplace
CREATE POLICY "Users can view own NFTs" ON guandi_nft_metadata
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Public can view NFT metadata for marketplace" ON guandi_nft_metadata
  FOR SELECT USING (true); -- Public read for marketplace functionality

-- Reputation: Public read, users can only update their own
CREATE POLICY "Public can view reputation scores" ON user_reputation_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can update own reputation" ON user_reputation_scores
  FOR UPDATE USING (auth.uid() = user_id);

-- Governance: Public read for proposals and votes
CREATE POLICY "Public can view governance proposals" ON governance_proposals
  FOR SELECT USING (true);

CREATE POLICY "Users can create proposals" ON governance_proposals
  FOR INSERT WITH CHECK (auth.uid() = proposer_user_id);

CREATE POLICY "Public can view governance votes" ON governance_votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON governance_votes
  FOR INSERT WITH CHECK (auth.uid() = voter_user_id);

-- ==================================
-- FUNCTIONS AND TRIGGERS
-- ==================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_mutual_aid_predictions_updated_at BEFORE UPDATE ON mutual_aid_predictions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_mutual_aid_requests_updated_at BEFORE UPDATE ON mutual_aid_requests
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_community_validations_updated_at BEFORE UPDATE ON community_validations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_guandi_nft_metadata_updated_at BEFORE UPDATE ON guandi_nft_metadata
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_reputation_scores_updated_at BEFORE UPDATE ON user_reputation_scores
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_governance_proposals_updated_at BEFORE UPDATE ON governance_proposals
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to calculate validation vote results
CREATE OR REPLACE FUNCTION calculate_validation_result(request_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_approve_weight DECIMAL(10,2);
  total_reject_weight DECIMAL(10,2);
  required_approvals INTEGER;
BEGIN
  -- Get required approvals threshold
  SELECT mar.required_approvals INTO required_approvals
  FROM mutual_aid_requests mar
  WHERE mar.id = request_uuid;

  -- Calculate weighted vote totals
  SELECT 
    COALESCE(SUM(CASE WHEN vote = 'approve' THEN vote_weight ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN vote = 'reject' THEN vote_weight ELSE 0 END), 0)
  INTO total_approve_weight, total_reject_weight
  FROM community_validations cv
  WHERE cv.request_id = request_uuid;

  -- Update request with current vote counts
  UPDATE mutual_aid_requests
  SET 
    current_approvals = total_approve_weight,
    current_rejections = total_reject_weight,
    updated_at = NOW()
  WHERE id = request_uuid;

  -- Check if validation is complete
  IF total_approve_weight >= required_approvals THEN
    UPDATE mutual_aid_requests
    SET status = 'approved', completed_at = NOW()
    WHERE id = request_uuid;
  ELSIF total_reject_weight >= required_approvals THEN
    UPDATE mutual_aid_requests
    SET status = 'rejected', completed_at = NOW()
    WHERE id = request_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate validation results
CREATE OR REPLACE FUNCTION trigger_calculate_validation_result()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_validation_result(NEW.request_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_validation_result_trigger
  AFTER INSERT OR UPDATE ON community_validations
  FOR EACH ROW EXECUTE PROCEDURE trigger_calculate_validation_result();

-- ==================================
-- VIEWS FOR COMMON QUERIES
-- ==================================

-- View for active mutual aid requests with validation progress
CREATE VIEW active_mutual_aid_requests AS
SELECT 
  mar.id,
  mar.wallet_address,
  mar.requested_amount,
  mar.description,
  mar.created_at,
  mar.validation_deadline,
  mar.required_approvals,
  mar.current_approvals,
  mar.current_rejections,
  (mar.current_approvals * 100.0 / mar.required_approvals) as approval_percentage,
  (mar.validation_deadline - NOW()) as time_remaining,
  urs.overall_score as requester_reputation,
  COUNT(cv.id) as total_votes
FROM mutual_aid_requests mar
LEFT JOIN user_reputation_scores urs ON mar.user_id = urs.user_id
LEFT JOIN community_validations cv ON mar.id = cv.request_id
WHERE mar.status = 'pending_validation'
GROUP BY mar.id, urs.overall_score;

-- View for user mutual aid statistics
CREATE VIEW user_mutual_aid_stats AS
SELECT 
  u.id as user_id,
  urs.wallet_address,
  urs.overall_score,
  urs.validation_accuracy,
  COALESCE(SUM(CASE WHEN atd.distribution_type = 'mutual_aid' THEN atd.amount ELSE 0 END), 0) as total_aid_received,
  COUNT(CASE WHEN mar.status = 'approved' THEN 1 END) as successful_requests,
  COUNT(CASE WHEN mar.status = 'rejected' THEN 1 END) as rejected_requests,
  COUNT(cv.id) as validations_performed,
  COUNT(CASE WHEN cv.was_correct = true THEN 1 END) as correct_validations,
  COUNT(gnm.token_id) as nft_count,
  COALESCE(MAX(gnm.minted_at), u.created_at) as last_activity
FROM auth.users u
LEFT JOIN user_reputation_scores urs ON u.id = urs.user_id
LEFT JOIN mutual_aid_requests mar ON u.id = mar.user_id
LEFT JOIN azi_token_distributions atd ON u.id = atd.recipient_user_id
LEFT JOIN community_validations cv ON u.id = cv.validator_user_id
LEFT JOIN guandi_nft_metadata gnm ON u.id = gnm.owner_user_id
GROUP BY u.id, urs.wallet_address, urs.overall_score, urs.validation_accuracy;

-- ==================================
-- INITIAL DATA AND CONFIGURATION
-- ==================================

-- Grant necessary permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Migration completed successfully
COMMENT ON SCHEMA public IS 'AstroZi Mutual Aid Token System - Database schema completed on 2025-01-09';