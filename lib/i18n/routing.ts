import {DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES} from '@/i18n/messages';

type BuildOptions = {
  localize?: boolean;
};

function normalizePath(path: string): string {
  if (!path) {
    return '/';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.startsWith('/')) {
    return path;
  }
  return `/${path}`;
}

export function buildLocalePath(locale: Locale, path: string, options?: BuildOptions): string {
  const normalized = normalizePath(path);
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  const shouldLocalize = options?.localize !== false;

  if (!shouldLocalize || locale === DEFAULT_LOCALE) {
    return normalized;
  }

  // Avoid double prefixing if path already includes locale segment
  const segments = normalized.split('/').filter(Boolean);
  const first = segments[0];
  if (SUPPORTED_LOCALES.includes(first as Locale)) {
    return normalized;
  }

  return `/${locale}${normalized}`;
}

export function buildLocaleHref(locale: Locale, path: string, hash?: string, options?: BuildOptions): string {
  const base = buildLocalePath(locale, path, options);
  if (!hash) {
    return base;
  }
  const sanitizedHash = hash.startsWith('#') ? hash : `#${hash}`;
  return `${base}${sanitizedHash}`;
}
