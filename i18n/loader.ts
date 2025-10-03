import type {Locale, Namespace} from './messages';
import {DEFAULT_LOCALE, MESSAGE_LOADERS, SUPPORTED_LOCALES} from './messages';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge<T extends Record<string, unknown>>(...objects: Array<Partial<T> | undefined>): T {
  const result: Record<string, unknown> = {};

  for (const object of objects) {
    if (!object) continue;

    for (const [key, value] of Object.entries(object)) {
      if (isPlainObject(value)) {
        const existing = result[key];
        result[key] = deepMerge(
          (isPlainObject(existing) ? (existing as Record<string, unknown>) : {}) as Partial<T>,
          value as Partial<T>
        );
      } else {
        result[key] = value;
      }
    }
  }

  return result as T;
}

const ROUTE_NAMESPACE_MAP: Array<{ pattern: RegExp; namespaces: Namespace[] }> = [
  {
    pattern: /^\/(auth|login|wallet-auth|privy-auth)(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'form', 'errors', 'web3/layout', 'web3/auth']
  },
  {
    pattern: /^\/$/,
    namespaces: ['common', 'navigation', 'pages']
  },
  {
    pattern: /^\/bazi(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'instructions', 'form', 'errors', 'bazi', 'categories']
  },
  {
    pattern: /^\/ziwei(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'instructions', 'form', 'errors', 'ziwei', 'categories', 'astro/karmaPalace']
  },
  {
    pattern: /^\/charts(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'charts', 'errors']
  },
  {
    pattern: /^\/settings(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'settings', 'form', 'errors']
  },
  {
    pattern: /^\/wiki(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'wiki']
  },
  {
    pattern: /^\/web3(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'web3/layout', 'web3/dashboard', 'errors']
  },
  {
    pattern: /^\/web3-rewards(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'web3/layout', 'web3/dashboard']
  },
  {
    pattern: /^\/web3-profile(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'web3/layout', 'web3/dashboard']
  },
  {
    pattern: /^\/leaderboard(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'web3/layout', 'web3/dashboard']
  },
  {
    pattern: /^\/tasks(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'web3/layout', 'web3/dashboard', 'web3/tasks']
  },
  {
    pattern: /^\/wallet-(?:auth|guide)(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'web3/layout']
  },
  {
    pattern: /^\/(fortune|guandi)(?:\/|$)/,
    namespaces: ['common', 'navigation', 'pages', 'astro/fortune', 'categories', 'errors']
  }
];

function normalizePath(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return '/';
  }

  const maybeLocale = segments[0];
  if (SUPPORTED_LOCALES.includes(maybeLocale as Locale)) {
    segments.shift();
  }

  return segments.length > 0 ? `/${segments.join('/')}` : '/';
}

export function getNamespacesForPath(pathname: string): Namespace[] {
  const normalized = normalizePath(pathname);
  const namespaces = new Set<Namespace>(['common', 'navigation']);

  for (const entry of ROUTE_NAMESPACE_MAP) {
    if (entry.pattern.test(normalized)) {
      entry.namespaces.forEach((ns) => namespaces.add(ns));
    }
  }

  return Array.from(namespaces);
}

export async function loadNamespaces(locale: Locale, namespaces: Namespace[]): Promise<Record<string, unknown>> {
  const loaderMap = MESSAGE_LOADERS[locale] ?? MESSAGE_LOADERS[DEFAULT_LOCALE];
  const results: Record<string, unknown>[] = [];

  for (const namespace of namespaces) {
    const loader = loaderMap[namespace];
    if (!loader) continue;

    const messages = await loader();
    results.push({ [namespace]: messages });
  }

  return deepMerge<Record<string, unknown>>({}, ...results);
}

export function coerceLocale(locale: string | null | undefined): Locale {
  return SUPPORTED_LOCALES.includes((locale ?? '') as Locale) ? (locale as Locale) : DEFAULT_LOCALE;
}
