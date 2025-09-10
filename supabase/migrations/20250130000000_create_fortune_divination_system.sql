-- Fortune Divination System Database Schema
-- This migration creates the complete multi-temple fortune divination system
-- including QR code referral tracking

-- Temple systems with cultural context and partnership data
CREATE TABLE IF NOT EXISTS public.temple_systems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    temple_name VARCHAR NOT NULL,
    temple_name_en VARCHAR,
    temple_name_ja VARCHAR,
    temple_code VARCHAR UNIQUE NOT NULL, -- For URL routing: 'wongtaisin', 'manmo', 'chekung'
    location VARCHAR,
    deity VARCHAR,
    specialization VARCHAR[], -- ['学业', '功名', '考试', '财运', '姻缘', '健康']
    total_slips INTEGER NOT NULL,
    description TEXT,
    description_en TEXT,
    description_ja TEXT,
    cultural_context TEXT,
    cultural_context_en TEXT,
    cultural_context_ja TEXT,
    primary_color VARCHAR DEFAULT '#d4af37',
    secondary_color VARCHAR DEFAULT '#8b4513',
    theme_style VARCHAR DEFAULT 'traditional',
    established_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    partnership_tier VARCHAR DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fortune slips for each temple system
CREATE TABLE IF NOT EXISTS public.fortune_slips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    temple_system_id UUID REFERENCES public.temple_systems(id) ON DELETE CASCADE,
    slip_number INTEGER NOT NULL,
    title VARCHAR NOT NULL,
    title_en VARCHAR,
    title_ja VARCHAR,
    content TEXT NOT NULL, -- Traditional Chinese fortune text/poem
    content_en TEXT,
    content_ja TEXT,
    basic_interpretation TEXT NOT NULL, -- For anonymous users
    basic_interpretation_en TEXT,
    basic_interpretation_ja TEXT,
    categories VARCHAR[] DEFAULT '{}', -- ['求财', '求姻缘', '求学业', '求健康', '求平安']
    fortune_level VARCHAR CHECK (fortune_level IN ('excellent', 'good', 'average', 'caution', 'warning')),
    historical_context TEXT,
    historical_context_en TEXT,
    historical_context_ja TEXT,
    symbolism TEXT, -- Symbolic meaning and imagery
    symbolism_en TEXT,
    symbolism_ja TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(temple_system_id, slip_number)
);

-- Temple referral campaigns and QR codes
CREATE TABLE IF NOT EXISTS public.temple_referral_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    temple_system_id UUID REFERENCES public.temple_systems(id) ON DELETE CASCADE,
    campaign_name VARCHAR NOT NULL, -- "Main Entrance QR", "Prayer Hall QR", "Tourist Guide QR"
    referral_code VARCHAR UNIQUE NOT NULL, -- "QR123456", auto-generated
    qr_code_url TEXT, -- Generated QR code image URL in Supabase storage
    qr_code_data JSONB, -- QR code generation metadata (size, format, etc.)
    landing_page_customization JSONB DEFAULT '{}', -- Temple-specific branding data
    campaign_description TEXT,
    target_audience VARCHAR, -- 'tourists', 'locals', 'pilgrims', 'general'
    placement_location VARCHAR, -- Physical location of QR code
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ, -- Optional expiration
    max_uses INTEGER, -- Optional usage limit
    current_uses INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track referral conversions and analytics
CREATE TABLE IF NOT EXISTS public.temple_referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.temple_referral_campaigns(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Null until registration
    session_id VARCHAR NOT NULL, -- Track anonymous sessions
    visitor_ip INET, -- For geographic analytics (anonymized)
    user_agent TEXT, -- Device/browser info
    visited_at TIMESTAMPTZ DEFAULT NOW(),
    registered_at TIMESTAMPTZ, -- When user actually registered
    first_divination_at TIMESTAMPTZ, -- When they used the fortune system
    conversion_value DECIMAL(10,2) DEFAULT 0, -- If they became paying user
    conversion_type VARCHAR, -- 'registration', 'first_divination', 'subscription', 'purchase'
    source_data JSONB DEFAULT '{}', -- Additional tracking data (geolocation, device, referrer)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User divination history (authenticated users only)
CREATE TABLE IF NOT EXISTS public.divination_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    fortune_slip_id UUID REFERENCES public.fortune_slips(id) ON DELETE SET NULL,
    temple_system_id UUID REFERENCES public.temple_systems(id) ON DELETE SET NULL, -- Redundant but useful for analytics
    question TEXT, -- User's specific question
    ai_interpretation TEXT, -- Detailed AI analysis
    interpretation_language VARCHAR DEFAULT 'zh',
    interpretation_type VARCHAR DEFAULT 'personal', -- 'personal', 'general', 'detailed'
    referral_campaign_id UUID REFERENCES public.temple_referral_campaigns(id) ON DELETE SET NULL, -- Track source
    ai_agent VARCHAR, -- Which Dify agent was used
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    is_bookmarked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_temple_systems_temple_code ON public.temple_systems(temple_code);
CREATE INDEX IF NOT EXISTS idx_temple_systems_is_active ON public.temple_systems(is_active);
CREATE INDEX IF NOT EXISTS idx_temple_systems_partnership_tier ON public.temple_systems(partnership_tier);

CREATE INDEX IF NOT EXISTS idx_fortune_slips_temple_system_id ON public.fortune_slips(temple_system_id);
CREATE INDEX IF NOT EXISTS idx_fortune_slips_slip_number ON public.fortune_slips(slip_number);
CREATE INDEX IF NOT EXISTS idx_fortune_slips_categories ON public.fortune_slips USING gin(categories);
CREATE INDEX IF NOT EXISTS idx_fortune_slips_fortune_level ON public.fortune_slips(fortune_level);
CREATE INDEX IF NOT EXISTS idx_fortune_slips_is_active ON public.fortune_slips(is_active);

CREATE INDEX IF NOT EXISTS idx_temple_referral_campaigns_temple_system_id ON public.temple_referral_campaigns(temple_system_id);
CREATE INDEX IF NOT EXISTS idx_temple_referral_campaigns_referral_code ON public.temple_referral_campaigns(referral_code);
CREATE INDEX IF NOT EXISTS idx_temple_referral_campaigns_is_active ON public.temple_referral_campaigns(is_active);
CREATE INDEX IF NOT EXISTS idx_temple_referral_campaigns_expires_at ON public.temple_referral_campaigns(expires_at);

CREATE INDEX IF NOT EXISTS idx_temple_referrals_campaign_id ON public.temple_referrals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_temple_referrals_user_id ON public.temple_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_temple_referrals_session_id ON public.temple_referrals(session_id);
CREATE INDEX IF NOT EXISTS idx_temple_referrals_visited_at ON public.temple_referrals(visited_at);
CREATE INDEX IF NOT EXISTS idx_temple_referrals_conversion_type ON public.temple_referrals(conversion_type);

CREATE INDEX IF NOT EXISTS idx_divination_history_user_id ON public.divination_history(user_id);
CREATE INDEX IF NOT EXISTS idx_divination_history_fortune_slip_id ON public.divination_history(fortune_slip_id);
CREATE INDEX IF NOT EXISTS idx_divination_history_temple_system_id ON public.divination_history(temple_system_id);
CREATE INDEX IF NOT EXISTS idx_divination_history_referral_campaign_id ON public.divination_history(referral_campaign_id);
CREATE INDEX IF NOT EXISTS idx_divination_history_created_at ON public.divination_history(created_at);
CREATE INDEX IF NOT EXISTS idx_divination_history_is_bookmarked ON public.divination_history(is_bookmarked);

-- Enable Row Level Security
ALTER TABLE public.temple_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fortune_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_referral_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temple_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divination_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for temple_systems (public read, admin write)
CREATE POLICY "Anyone can view active temple systems" ON public.temple_systems
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage temple systems" ON public.temple_systems
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policies for fortune_slips (public read, admin write)
CREATE POLICY "Anyone can view active fortune slips" ON public.fortune_slips
    FOR SELECT
    USING (is_active = true);

CREATE POLICY "Service role can manage fortune slips" ON public.fortune_slips
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policies for temple_referral_campaigns (restricted)
CREATE POLICY "Service role can manage referral campaigns" ON public.temple_referral_campaigns
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policies for temple_referrals (service role only)
CREATE POLICY "Service role can manage temple referrals" ON public.temple_referrals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policies for divination_history (users can only see their own)
CREATE POLICY "Users can view own divination history" ON public.divination_history
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR
        -- Allow Web3 users to access their history via wallet address
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id 
            AND is_web3_user = true 
            AND wallet_address = LOWER(auth.jwt() ->> 'wallet_address')
        )
    );

CREATE POLICY "Users can insert own divination records" ON public.divination_history
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        OR
        -- Allow Web3 users to insert via wallet address
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id 
            AND is_web3_user = true 
            AND wallet_address = LOWER(auth.jwt() ->> 'wallet_address')
        )
    );

CREATE POLICY "Users can update own divination records" ON public.divination_history
    FOR UPDATE
    TO authenticated
    USING (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id 
            AND is_web3_user = true 
            AND wallet_address = LOWER(auth.jwt() ->> 'wallet_address')
        )
    )
    WITH CHECK (
        auth.uid() = user_id
        OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = user_id 
            AND is_web3_user = true 
            AND wallet_address = LOWER(auth.jwt() ->> 'wallet_address')
        )
    );

CREATE POLICY "Service role can manage all divination history" ON public.divination_history
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Functions for analytics and management

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    code TEXT;
    exists_check INTEGER;
BEGIN
    LOOP
        -- Generate code like 'QR' + 6 random uppercase letters/numbers
        code := 'QR' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6));
        
        -- Check if code already exists
        SELECT COUNT(*) INTO exists_check 
        FROM public.temple_referral_campaigns 
        WHERE referral_code = code;
        
        -- Exit loop if unique
        EXIT WHEN exists_check = 0;
    END LOOP;
    
    RETURN code;
END;
$$;

-- Function to track referral visit
CREATE OR REPLACE FUNCTION public.track_referral_visit(
    p_campaign_id UUID,
    p_session_id VARCHAR,
    p_visitor_ip INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_source_data JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referral_id UUID;
    campaign_active BOOLEAN;
    campaign_expired BOOLEAN;
    usage_exceeded BOOLEAN;
BEGIN
    -- Check if campaign is active and not expired
    SELECT 
        is_active,
        (expires_at IS NOT NULL AND expires_at < NOW()),
        (max_uses IS NOT NULL AND current_uses >= max_uses)
    INTO campaign_active, campaign_expired, usage_exceeded
    FROM public.temple_referral_campaigns
    WHERE id = p_campaign_id;
    
    -- Validate campaign
    IF NOT campaign_active OR campaign_expired OR usage_exceeded THEN
        RAISE EXCEPTION 'Campaign is inactive, expired, or usage limit exceeded';
    END IF;
    
    -- Insert referral tracking record
    INSERT INTO public.temple_referrals (
        campaign_id,
        session_id,
        visitor_ip,
        user_agent,
        source_data
    ) VALUES (
        p_campaign_id,
        p_session_id,
        p_visitor_ip,
        p_user_agent,
        p_source_data
    ) RETURNING id INTO referral_id;
    
    -- Update campaign usage count
    UPDATE public.temple_referral_campaigns
    SET current_uses = current_uses + 1,
        updated_at = NOW()
    WHERE id = p_campaign_id;
    
    RETURN referral_id;
END;
$$;

-- Function to track referral conversion
CREATE OR REPLACE FUNCTION public.track_referral_conversion(
    p_session_id VARCHAR,
    p_user_id UUID,
    p_conversion_type VARCHAR,
    p_conversion_value DECIMAL DEFAULT 0
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    -- Update the referral record with conversion data
    UPDATE public.temple_referrals
    SET 
        user_id = p_user_id,
        registered_at = CASE 
            WHEN p_conversion_type = 'registration' AND registered_at IS NULL 
            THEN NOW() 
            ELSE registered_at 
        END,
        first_divination_at = CASE 
            WHEN p_conversion_type = 'first_divination' AND first_divination_at IS NULL 
            THEN NOW() 
            ELSE first_divination_at 
        END,
        conversion_type = p_conversion_type,
        conversion_value = conversion_value + p_conversion_value
    WHERE session_id = p_session_id;
    
    -- Check if any rows were updated
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN rows_affected > 0;
END;
$$;

-- Function to get temple analytics
CREATE OR REPLACE FUNCTION public.get_temple_analytics(
    p_temple_system_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
    p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH campaign_stats AS (
        SELECT 
            c.id as campaign_id,
            c.campaign_name,
            c.referral_code,
            COUNT(r.id) as total_visits,
            COUNT(r.user_id) as conversions,
            COUNT(CASE WHEN r.first_divination_at IS NOT NULL THEN 1 END) as divinations,
            COALESCE(SUM(r.conversion_value), 0) as total_value,
            CASE 
                WHEN COUNT(r.id) > 0 
                THEN ROUND((COUNT(r.user_id)::DECIMAL / COUNT(r.id)) * 100, 2)
                ELSE 0 
            END as conversion_rate
        FROM public.temple_referral_campaigns c
        LEFT JOIN public.temple_referrals r ON c.id = r.campaign_id
            AND r.visited_at BETWEEN p_start_date AND p_end_date
        WHERE c.temple_system_id = p_temple_system_id
        GROUP BY c.id, c.campaign_name, c.referral_code
    )
    SELECT jsonb_build_object(
        'temple_id', p_temple_system_id,
        'period', jsonb_build_object(
            'start_date', p_start_date,
            'end_date', p_end_date
        ),
        'summary', jsonb_build_object(
            'total_campaigns', COUNT(*),
            'total_visits', COALESCE(SUM(total_visits), 0),
            'total_conversions', COALESCE(SUM(conversions), 0),
            'total_divinations', COALESCE(SUM(divinations), 0),
            'total_value', COALESCE(SUM(total_value), 0),
            'average_conversion_rate', CASE 
                WHEN COUNT(*) > 0 
                THEN ROUND(AVG(conversion_rate), 2)
                ELSE 0 
            END
        ),
        'campaigns', jsonb_agg(
            jsonb_build_object(
                'campaign_id', campaign_id,
                'campaign_name', campaign_name,
                'referral_code', referral_code,
                'visits', total_visits,
                'conversions', conversions,
                'divinations', divinations,
                'conversion_rate', conversion_rate,
                'total_value', total_value
            )
        )
    ) INTO result
    FROM campaign_stats;
    
    RETURN COALESCE(result, '{}'::JSONB);
END;
$$;

-- Function to clean up expired referral data
CREATE OR REPLACE FUNCTION public.cleanup_expired_referrals()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete referrals from expired campaigns (older than 1 year)
    DELETE FROM public.temple_referrals 
    WHERE campaign_id IN (
        SELECT id FROM public.temple_referral_campaigns 
        WHERE expires_at < NOW() - INTERVAL '1 year'
    );
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete the expired campaigns themselves
    DELETE FROM public.temple_referral_campaigns 
    WHERE expires_at < NOW() - INTERVAL '1 year';
    
    RETURN deleted_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON public.temple_systems TO service_role;
GRANT ALL ON public.fortune_slips TO service_role;
GRANT ALL ON public.temple_referral_campaigns TO service_role;
GRANT ALL ON public.temple_referrals TO service_role;
GRANT ALL ON public.divination_history TO service_role;

GRANT EXECUTE ON FUNCTION public.generate_referral_code() TO service_role;
GRANT EXECUTE ON FUNCTION public.track_referral_visit(UUID, VARCHAR, INET, TEXT, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.track_referral_conversion(VARCHAR, UUID, VARCHAR, DECIMAL) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_temple_analytics(UUID, TIMESTAMPTZ, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_referrals() TO service_role;

-- Grant read access to authenticated users for public tables
GRANT SELECT ON public.temple_systems TO authenticated;
GRANT SELECT ON public.fortune_slips TO authenticated;

-- Insert initial temple systems data
INSERT INTO public.temple_systems (
    temple_name, temple_name_en, temple_name_ja, temple_code, location, deity, 
    specialization, total_slips, description, description_en, description_ja,
    cultural_context, cultural_context_en, cultural_context_ja,
    primary_color, secondary_color, established_year
) VALUES 
(
    '香港黄大仙庙', 'Hong Kong Wong Tai Sin Temple', '香港黄大仙廟', 'wongtaisin',
    '香港九龙竹园', '黄大仙师',
    ARRAY['祈福', '求财', '姻缘', '健康', '学业', '事业'], 100,
    '香港最著名的道教庙宇，以"有求必应"闻名，每年吸引数百万信众和游客前来祈福。',
    'The most famous Taoist temple in Hong Kong, renowned for granting wishes and attracting millions of devotees and tourists annually.',
    '香港で最も有名な道教寺院で、「願いを叶える」ことで知られ、毎年数百万人の信者と観光客が参拝します。',
    '黄大仙师以医术济世，后得道成仙。庙宇建于1921年，是香港重要的宗教文化地标。',
    'Wong Tai Sin was known for his healing powers and later achieved immortality. The temple was built in 1921 and is an important religious and cultural landmark in Hong Kong.',
    '黄大仙師は医術で世を救い、後に仙人となりました。寺院は1921年に建立され、香港の重要な宗教文化のランドマークです。',
    '#dc143c', '#ffd700', 1921
),
(
    '香港文武庙', 'Hong Kong Man Mo Temple', '香港文武廟', 'manmo',
    '香港上环荷李活道', '文昌帝君、关圣帝君',
    ARRAY['学业', '功名', '考试', '文学', '武略'], 100,
    '供奉文昌帝君和关圣帝君的古老庙宇，是香港最古老的庙宇之一，专门庇佑学子和读书人。',
    'An ancient temple dedicated to the gods of literature and war, one of Hong Kong''s oldest temples, specially protecting students and scholars.',
    '文学と武芸の神を祀る古い寺院で、香港最古の寺院の一つ、特に学生と学者を守護しています。',
    '文昌帝君掌管文运学业，关圣帝君司武略忠义。庙宇建于1847年，香炉常年香火鼎盛。',
    'Man Cheong oversees literary fortune and academic success, while Kwan Ti governs martial strategy and loyalty. Built in 1847, the temple''s incense burners burn continuously.',
    '文昌帝君は学問運を司り、関聖帝君は武略と忠義を司ります。1847年に建立され、香炉には絶えず線香が焚かれています。',
    '#8b0000', '#ffd700', 1847
),
(
    '香港车公庙', 'Hong Kong Che Kung Temple', '香港車公廟', 'chekung',
    '香港沙田', '车公元帅',
    ARRAY['驱邪', '避凶', '保平安', '化解灾难', '转运'], 60,
    '供奉南宋名将车公的庙宇，以转运和驱邪避凶著称，每年农历新年期间香火最盛。',
    'A temple dedicated to General Che Kung of the Southern Song Dynasty, famous for changing luck and warding off evil spirits, busiest during Chinese New Year.',
    '南宋の名将車公を祀る寺院で、運気を変え、邪気を払うことで有名。旧正月期間中が最も賑わいます。',
    '车公元帅为南宋抗元名将，后被奉为神明。庙宇以转运风车闻名，信众转动风车祈求转运。',
    'General Che Kung was a famous anti-Yuan general of the Southern Song Dynasty, later deified. The temple is famous for its fortune-changing windmill that devotees turn to pray for better luck.',
    '車公元帥は南宋の抗元名将で、後に神として祀られました。寺院は運気を変える風車で有名で、信者は風車を回して幸運を祈ります。',
    '#191970', '#c0c0c0', 1993
);

-- Create trigger to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_temple_systems_updated_at 
    BEFORE UPDATE ON public.temple_systems 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fortune_slips_updated_at 
    BEFORE UPDATE ON public.fortune_slips 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_temple_referral_campaigns_updated_at 
    BEFORE UPDATE ON public.temple_referral_campaigns 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_divination_history_updated_at 
    BEFORE UPDATE ON public.divination_history 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();