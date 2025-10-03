import {getRequestConfig} from 'next-intl/server';

import {coerceLocale, getNamespacesForPath, loadNamespaces} from './loader';

export default getRequestConfig(async ({requestLocale, request}) => {
  const locale = await requestLocale;
  const normalizedLocale = coerceLocale(locale);

  // Load modular namespaces based on route
  const pathname = request?.nextUrl?.pathname || '/';
  const namespaces = getNamespacesForPath(pathname);
  const messages = await loadNamespaces(normalizedLocale, namespaces);

  return {
    locale: normalizedLocale,
    messages
  };
});
