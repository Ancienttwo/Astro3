import React from 'react';
import { useSearchParams } from 'next/navigation';
import { authTranslations, type AuthTranslation } from '@/lib/i18n/auth-translations';

export function useAuthTranslation(): AuthTranslation {
  const searchParams = useSearchParams();
  const langParam = searchParams.get('lang');
  
  if (langParam === 'en') {
    return authTranslations.en;
  } else if (langParam === 'ja') {
    return authTranslations.ja || authTranslations.zh; // Fallback to zh if ja not available
  }
  
  return authTranslations.zh;
}