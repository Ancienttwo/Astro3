// lib/modules/fortune/index.ts - Fortune Module Main Entry Point
export * from './config';
export * from './types';
export * from './i18n';

// Re-export i18n utilities
export { 
  useFortuneI18n, 
  useFortuneTranslation, 
  useFortuneLocale,
  useIsChineseLocale,
  useLocalizedField,
  useFortuneTimeFormat,
  useFortuneNumberFormat,
  useFortuneErrorMessage
} from './i18n/useFortuneI18n';

export {
  getFortuneDictionary,
  getFortuneTranslation,
  type FortuneDictionary
} from './i18n/fortune-dictionaries';

// Module metadata
export const FORTUNE_MODULE_INFO = {
  name: 'fortune',
  version: '1.0.0',
  description: 'Modular fortune divination system with multi-language support',
  author: 'AstroZi Team',
  dependencies: [
    '@radix-ui/react-dialog',
    '@radix-ui/react-select', 
    'lucide-react',
    'next',
    'react'
  ],
  features: [
    'Temple system management',
    'Fortune slip drawing and display',
    'AI-powered interpretation',
    'Multi-language support (zh-CN, zh-TW, en-US, ja-JP+)',
    'QR code referral system',
    'Authentication integration',
    'Responsive design',
    'Customizable theming'
  ],
  routes: [
    '/fortune',
    '/fortune/temples',
    '/fortune/slips',
    '/fortune/history',
    '/en/fortune',
    '/ja/fortune'
  ],
  apis: [
    '/api/fortune/systems',
    '/api/fortune/slips',
    '/api/fortune/random',
    '/api/fortune/interpret'
  ],
  components: [
    'TempleSystemSelector',
    'FortuneSlipDisplay',
    'FortuneInterpreter',
    'QRCodeGenerator'
  ],
  migrations: [
    '20250130000000_create_fortune_divination_system.sql',
    '20250130000001_seed_manmo_fortune_slips.sql'
  ]
} as const;

// Module configuration validator
export function validateFortuneModule() {
  const errors: string[] = [];
  
  // Check required environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      errors.push(`Missing required environment variable: ${envVar}`);
    }
  }
  
  // Check optional but recommended environment variables
  const optionalEnvVars = [
    'DIFY_FORTUNE_MASTER_KEY',
    'DIFY_FORTUNE_MASTER_EN_KEY',
    'DIFY_FORTUNE_MASTER_JA_KEY'
  ];
  
  const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar]);
  if (missingOptional.length > 0) {
    console.warn('Fortune Module: Missing optional environment variables for AI features:', missingOptional);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: missingOptional.length > 0 ? [`Missing optional AI config: ${missingOptional.join(', ')}`] : []
  };
}

// Module initialization function
export async function initializeFortuneModule() {
  const validation = validateFortuneModule();
  
  if (!validation.isValid) {
    throw new Error(`Fortune Module initialization failed: ${validation.errors.join(', ')}`);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Fortune Module initialized with warnings:', validation.warnings);
  }
  
  console.log('Fortune Module initialized successfully');
  return true;
}

// Export component types for external use
export type { TempleSystemSelectorProps } from '@/components/fortune/TempleSystemSelector';

// Export utility functions
export { normalizeFortuneLanguage, getActiveFortuneLanguages, getPlannedFortuneLanguages } from './i18n';

// Default export for easy importing
export default {
  ...FORTUNE_MODULE_INFO,
  init: initializeFortuneModule,
  validate: validateFortuneModule
};