import {getRequestConfig} from 'next-intl/server';

import {coerceLocale, getNamespacesForPath, loadNamespaces, deepMerge} from './loader';

export default getRequestConfig(async ({locale, request}) => {
  const normalizedLocale = coerceLocale(locale);

  const dicts = await import('@/lib/i18n/dictionaries');
  const legacyMessagesMap: Record<'zh' | 'en' | 'ja', Record<string, unknown>> = {
    zh: (dicts as any).zhDict,
    en: (dicts as any).enDict,
    ja: (dicts as any).jaDict
  };

  const namespaces = getNamespacesForPath(request.nextUrl.pathname);
  const modularMessages = await loadNamespaces(normalizedLocale, namespaces);

  const legacyMessages = legacyMessagesMap[normalizedLocale] ?? legacyMessagesMap.zh;
  const messages = deepMerge<Record<string, unknown>>(
    {},
    legacyMessages,
    modularMessages
  );

  return {
    locale: normalizedLocale,
    messages
  };
});
