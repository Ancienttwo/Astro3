-- Create error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack TEXT,
  level VARCHAR(20) NOT NULL CHECK (level IN ('error', 'warning', 'info')),
  context JSONB,
  user_agent TEXT,
  url TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for querying
  INDEX idx_error_logs_created_at (created_at DESC),
  INDEX idx_error_logs_level (level),
  INDEX idx_error_logs_user_id (user_id),
  INDEX idx_error_logs_session_id (session_id)
);

-- Create performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  value NUMERIC NOT NULL,
  unit VARCHAR(50) NOT NULL,
  tags JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for querying
  INDEX idx_performance_metrics_created_at (created_at DESC),
  INDEX idx_performance_metrics_name (name),
  INDEX idx_performance_metrics_tags (tags) USING gin
);

-- Create API key tables for rotation system
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['read'],
  last_4 VARCHAR(4),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  deactivated_at TIMESTAMP WITH TIME ZONE,
  deactivation_reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_api_keys_user_id (user_id),
  INDEX idx_api_keys_key_hash (key_hash),
  INDEX idx_api_keys_is_active (is_active),
  INDEX idx_api_keys_expires_at (expires_at)
);

-- API key events table
CREATE TABLE IF NOT EXISTS api_key_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index
  INDEX idx_api_key_events_key_id (key_id),
  INDEX idx_api_key_events_created_at (created_at DESC)
);

-- API key usage tracking
CREATE TABLE IF NOT EXISTS api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint VARCHAR(255),
  status_code INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for rate limiting
  INDEX idx_api_key_usage_key_id_created (key_id, created_at DESC)
);

-- Create RLS policies for error logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own error logs"
  ON error_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert error logs"
  ON error_logs FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for performance metrics
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage performance metrics"
  ON performance_metrics FOR ALL
  USING (true);

-- Create RLS policies for API keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own API keys"
  ON api_keys FOR ALL
  USING (user_id = auth.uid());

-- Create RLS policies for API key events
ALTER TABLE api_key_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their API key events"
  ON api_key_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      WHERE api_keys.id = api_key_events.key_id
      AND api_keys.user_id = auth.uid()
    )
  );

-- Create RLS policies for API key usage
ALTER TABLE api_key_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their API key usage"
  ON api_key_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM api_keys
      WHERE api_keys.id = api_key_usage.key_id
      AND api_keys.user_id = auth.uid()
    )
  );

-- Function to clean up old error logs (keep 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  DELETE FROM performance_metrics
  WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function to auto-rotate old API keys
CREATE OR REPLACE FUNCTION auto_rotate_api_keys()
RETURNS void AS $$
BEGIN
  UPDATE api_keys
  SET is_active = false,
      deactivated_at = NOW(),
      deactivation_reason = 'auto-rotated'
  WHERE is_active = true
    AND created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;