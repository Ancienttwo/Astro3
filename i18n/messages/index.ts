import commonEn from './en/common.json';
import navigationEn from './en/navigation.json';
import web3DashboardEn from './en/web3/dashboard.json';
import web3LayoutEn from './en/web3/layout.json';
import web3TasksEn from './en/web3/tasks.json';
import web3AuthEn from './en/web3/auth.json';
import astroFortuneEn from './en/astro/fortune.json';

export const SUPPORTED_LOCALES = ['zh', 'en', 'ja'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';

export const NAMESPACES = [
  'common',
  'navigation',
  'web3/dashboard',
  'web3/layout',
  'web3/tasks',
  'web3/auth',
  'astro/fortune'
] as const;
export type Namespace = (typeof NAMESPACES)[number];

export type Messages = {
  common: typeof commonEn;
  navigation: typeof navigationEn;
  'web3/dashboard': typeof web3DashboardEn;
  'web3/layout': typeof web3LayoutEn;
  'web3/tasks': typeof web3TasksEn;
  'web3/auth': typeof web3AuthEn;
  'astro/fortune': typeof astroFortuneEn;
};

export type Translator = (key: string, values?: Record<string, unknown>) => string;

export type NamespaceLoaders = Record<Locale, Record<Namespace, () => Promise<Record<string, unknown>>>>;

export const MESSAGE_LOADERS: NamespaceLoaders = {
  en: {
    common: () => import('./en/common.json').then((m) => m.default),
    navigation: () => import('./en/navigation.json').then((m) => m.default),
    'web3/dashboard': () => import('./en/web3/dashboard.json').then((m) => m.default),
    'web3/layout': () => import('./en/web3/layout.json').then((m) => m.default),
    'web3/tasks': () => import('./en/web3/tasks.json').then((m) => m.default),
    'web3/auth': () => import('./en/web3/auth.json').then((m) => m.default),
    'astro/fortune': () => import('./en/astro/fortune.json').then((m) => m.default)
  },
  zh: {
    common: () => import('./zh/common.json').then((m) => m.default),
    navigation: () => import('./zh/navigation.json').then((m) => m.default),
    'web3/dashboard': () => import('./zh/web3/dashboard.json').then((m) => m.default),
    'web3/layout': () => import('./zh/web3/layout.json').then((m) => m.default),
    'web3/tasks': () => import('./zh/web3/tasks.json').then((m) => m.default),
    'web3/auth': () => import('./zh/web3/auth.json').then((m) => m.default),
    'astro/fortune': () => import('./zh/astro/fortune.json').then((m) => m.default)
  },
  ja: {
    common: () => import('./ja/common.json').then((m) => m.default),
    navigation: () => import('./ja/navigation.json').then((m) => m.default),
    'web3/dashboard': () => import('./ja/web3/dashboard.json').then((m) => m.default),
    'web3/layout': () => import('./ja/web3/layout.json').then((m) => m.default),
    'web3/tasks': () => import('./ja/web3/tasks.json').then((m) => m.default),
    'web3/auth': () => import('./ja/web3/auth.json').then((m) => m.default),
    'astro/fortune': () => import('./ja/astro/fortune.json').then((m) => m.default)
  }
};

export function isSupportedLocale(locale: string | null | undefined): locale is Locale {
  return !!locale && SUPPORTED_LOCALES.includes(locale as Locale);
}

export function assertLocale(locale: string | null | undefined): Locale {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}
