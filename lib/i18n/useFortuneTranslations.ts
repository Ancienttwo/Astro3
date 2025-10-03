// Unified Fortune translations hook using next-intl
// Replaces lib/modules/fortune/i18n/useFortuneI18n.ts

'use client';

import { useTranslations, useLocale } from 'next-intl';

/**
 * Hook for Fortune module translations using next-intl
 *
 * @example
 * const { t, locale, getLocalizedField } = useFortuneTranslations();
 *
 * // Access nested keys
 * t('temple.title')          // "庙宇系统"
 * t('slip.drawSlip')         // "求签"
 * t('ai.analyzing')          // "正在分析签文..."
 */
export function useFortuneTranslations() {
  const t = useTranslations('astro/fortune');
  const locale = useLocale(); // Returns 'zh', 'en', or 'ja'

  /**
   * Get localized field value from database objects
   * Handles field_name, field_name_en, field_name_ja pattern
   *
   * @example
   * const name = getLocalizedField(temple, 'temple_name');
   * // If locale is 'en', tries: temple_name_en → temple_name
   */
  const getLocalizedField = <T extends Record<string, any>>(
    obj: T,
    fieldName: string
  ): string => {
    if (!obj) return '';

    // Map next-intl locale codes to database field suffixes
    const localeSuffixMap: Record<string, string> = {
      'en': '_en',
      'ja': '_ja',
      'zh': '' // No suffix for Chinese (default)
    };

    const suffix = localeSuffixMap[locale] || '';
    const localizedField = `${fieldName}${suffix}`;

    // Try localized field first, fallback to base field
    return obj[localizedField] || obj[fieldName] || '';
  };

  return {
    /** Translation function for astro/fortune namespace */
    t,
    /** Current locale (zh, en, ja) */
    locale,
    /** Get localized field from database objects */
    getLocalizedField
  };
}

/**
 * Standalone utility for getting localized fields outside of React components
 */
export function getLocalizedFieldValue<T extends Record<string, any>>(
  obj: T,
  fieldName: string,
  locale: string
): string {
  if (!obj) return '';

  const localeSuffixMap: Record<string, string> = {
    'en': '_en',
    'ja': '_ja',
    'zh': ''
  };

  const suffix = localeSuffixMap[locale] || '';
  const localizedField = `${fieldName}${suffix}`;

  return obj[localizedField] || obj[fieldName] || '';
}
