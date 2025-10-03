import {getRequestConfig} from 'next-intl/server';

import {coerceLocale, getNamespacesForPath, loadNamespaces, deepMerge} from './loader';
import {zhDict, enDict, jaDict} from '@/lib/i18n/dictionaries';

export default getRequestConfig(async ({requestLocale, request}) => {
  const locale = await requestLocale;
  const normalizedLocale = coerceLocale(locale);

  const legacyMessagesMap: Record<'zh' | 'en' | 'ja', Record<string, unknown>> = {
    zh: zhDict as Record<string, unknown>,
    en: enDict as Record<string, unknown>,
    ja: jaDict as Record<string, unknown>
  };

  // 修复：处理 request 为 undefined 的情况
  const pathname = request?.nextUrl?.pathname || '/';
  const namespaces = getNamespacesForPath(pathname);
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
