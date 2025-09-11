import {getRequestConfig} from 'next-intl/server';

// Reuse existing dictionaries to avoid duplication during migration
export default getRequestConfig(async ({locale}) => {
  // Map/normalize locale codes
  const normalized = ((locale as string) || 'zh') as 'zh' | 'en' | 'ja';

  const dicts = await import('@/lib/i18n/dictionaries');
  const messagesMap: Record<'zh' | 'en' | 'ja', any> = {
    zh: (dicts as any).zhDict,
    en: (dicts as any).enDict,
    ja: (dicts as any).jaDict
  };

  return {
    locale: normalized,
    messages: messagesMap[normalized] ?? (dicts as any).zhDict
  };
});
