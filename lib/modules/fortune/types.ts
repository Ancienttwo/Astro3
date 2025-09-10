// lib/modules/fortune/types.ts - Fortune Module Type Definitions

// Core domain types
export interface TempleSystem {
  id: string;
  temple_name: string;
  temple_name_en?: string;
  temple_name_ja?: string;
  temple_code: string;
  location: string;
  deity: string;
  specialization: string[];
  total_slips: number;
  description: string;
  description_en?: string;
  description_ja?: string;
  cultural_context: string;
  cultural_context_en?: string;
  cultural_context_ja?: string;
  primary_color: string;
  secondary_color: string;
  theme_style: string;
  established_year: number;
  is_active: boolean;
  partnership_tier: 'basic' | 'premium' | 'enterprise';
  created_at: string;
  updated_at: string;
  // Computed fields
  display_name: string;
  display_description: string;
  display_cultural_context: string;
}

export interface FortuneSlip {
  id: string;
  temple_system_id: string;
  slip_number: number;
  title: string;
  title_en?: string;
  title_ja?: string;
  content: string;
  content_en?: string;
  content_ja?: string;
  basic_interpretation: string;
  basic_interpretation_en?: string;
  basic_interpretation_ja?: string;
  categories: string[];
  fortune_level: 'excellent' | 'good' | 'average' | 'caution' | 'warning';
  historical_context?: string;
  historical_context_en?: string;
  historical_context_ja?: string;
  symbolism?: string;
  symbolism_en?: string;
  symbolism_ja?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined temple information
  temple_name?: string;
  temple_code?: string;
  temple_primary_color?: string;
  temple_secondary_color?: string;
  // Computed fields
  display_title: string;
  display_content: string | null;
  display_basic_interpretation: string;
  display_historical_context: string;
  display_symbolism: string;
  access_level: 'basic' | 'full';
  requires_auth_for_details: boolean;
}

export interface DivinationHistory {
  id: string;
  user_id: string;
  fortune_slip_id: string;
  temple_system_id: string;
  question?: string;
  ai_interpretation?: string;
  interpretation_language: string;
  interpretation_type: 'basic' | 'detailed';
  ai_agent?: string;
  created_at: string;
}

export interface TempleReferralCampaign {
  id: string;
  temple_system_id: string;
  campaign_name: string;
  qr_code_data: string;
  landing_page_url: string;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
}

export interface TempleReferral {
  id: string;
  campaign_id: string;
  user_id?: string;
  visitor_ip: string;
  user_agent: string;
  referrer_url?: string;
  conversion_type: 'visit' | 'signup' | 'divination';
  created_at: string;
}

// API request/response types
export interface FortuneSystemsRequest {
  language?: string;
  include_inactive?: boolean;
}

export interface FortuneSystemsResponse {
  success: boolean;
  data: TempleSystem[];
  meta: {
    total: number;
    language: string;
    include_inactive: boolean;
  };
  error?: string;
  details?: string;
}

export interface FortuneSlipRequest {
  temple_code: string;
  slip_number: number;
  language?: string;
}

export interface FortuneSlipResponse {
  success: boolean;
  data: FortuneSlip;
  meta: {
    temple_code: string;
    slip_number: number;
    language: string;
    access_level: 'basic' | 'full';
    requires_upgrade: boolean;
  };
  error?: string;
  details?: string;
}

export interface RandomFortuneRequest {
  temple_code: string;
  category?: string;
  question?: string;
}

export interface RandomFortuneResponse {
  success: boolean;
  data: {
    temple_code: string;
    slip_number: number;
    temple_name: string;
    redirect_url: string;
    message: string;
  };
  meta: {
    temple_code: string;
    total_available_slips: number;
    category: string;
    language: string;
    generation_method: 'random';
  };
  error?: string;
  details?: string;
}

export interface FortuneInterpretationRequest {
  temple_code: string;
  slip_number: number;
  user_question?: string;
  categories?: string[];
  language?: string;
}

export interface FortuneInterpretationResponse {
  success: boolean;
  data: {
    temple_name: string;
    slip_number: number;
    slip_title: string;
    ai_interpretation: string;
    interpretation_language: string;
    user_question?: string;
    categories: string[];
    created_at: string;
  };
  meta: {
    temple_code: string;
    slip_number: number;
    language: string;
    ai_agent: string;
    user_id: string;
    conversation_id?: string;
    saved_to_history: boolean;
  };
  error?: string;
  details?: string;
}

// Component prop types
export interface TempleSystemSelectorProps {
  selectedTempleCode?: string;
  onTempleSelect: (temple: TempleSystem) => void;
  trigger?: React.ReactNode;
  language?: string;
  className?: string;
}

export interface FortuneSlipDisplayProps {
  slip: FortuneSlip;
  language?: string;
  showFullContent?: boolean;
  onInterpretRequest?: (slip: FortuneSlip, question?: string) => void;
  onUpgradeRequest?: () => void;
  className?: string;
}

export interface FortuneInterpreterProps {
  slip: FortuneSlip;
  userQuestion?: string;
  language?: string;
  onInterpretationComplete?: (interpretation: string) => void;
  className?: string;
}

export interface QRCodeGeneratorProps {
  templeCode: string;
  campaignName: string;
  landingPageUrl: string;
  size?: number;
  className?: string;
}

// Utility types
export type FortuneLanguage = 'zh' | 'en' | 'ja';
export type FortuneLevel = 'excellent' | 'good' | 'average' | 'caution' | 'warning';
export type AccessLevel = 'basic' | 'full';
export type ConversionType = 'visit' | 'signup' | 'divination';
export type PartnershipTier = 'basic' | 'premium' | 'enterprise';

// Error types
export interface FortuneError {
  code: string;
  message: string;
  details?: string;
  timestamp: string;
}

export interface FortuneValidationError extends FortuneError {
  field: string;
  value: any;
}

// State management types
export interface FortuneState {
  selectedTemple: TempleSystem | null;
  currentSlip: FortuneSlip | null;
  interpretation: string | null;
  loading: boolean;
  error: FortuneError | null;
  language: FortuneLanguage;
  userQuestion: string;
  accessLevel: AccessLevel;
}

export interface FortuneActions {
  setSelectedTemple: (temple: TempleSystem | null) => void;
  setCurrentSlip: (slip: FortuneSlip | null) => void;
  setInterpretation: (interpretation: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: FortuneError | null) => void;
  setLanguage: (language: FortuneLanguage) => void;
  setUserQuestion: (question: string) => void;
  setAccessLevel: (level: AccessLevel) => void;
  reset: () => void;
}

// Module registration types
export interface FortuneModule {
  name: string;
  version: string;
  dependencies: string[];
  routes: string[];
  components: string[];
  apis: string[];
  migrations: string[];
  config: any;
}

export interface FortuneModuleRegistry {
  modules: Record<string, FortuneModule>;
  activeModules: string[];
  registerModule: (module: FortuneModule) => void;
  unregisterModule: (name: string) => void;
  getModule: (name: string) => FortuneModule | null;
  isModuleActive: (name: string) => boolean;
}