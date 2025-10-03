import commonEn from './en/common.json';
import navigationEn from './en/navigation.json';
import errorsEn from './en/errors.json';
import formEn from './en/form.json';
import categoriesEn from './en/categories.json';
import pagesEn from './en/pages.json';
import instructionsEn from './en/instructions.json';
import baziEn from './en/bazi.json';
import ziweiEn from './en/ziwei.json';
import chartsEn from './en/charts.json';
import settingsEn from './en/settings.json';
import wikiEn from './en/wiki.json';
import web3DashboardEn from './en/web3/dashboard.json';
import web3LayoutEn from './en/web3/layout.json';
import web3TasksEn from './en/web3/tasks.json';
import web3AuthEn from './en/web3/auth.json';
import astroFortuneEn from './en/astro/fortune.json';
import astroKarmaPalaceEn from './en/astro/karmaPalace.json';

export const SUPPORTED_LOCALES = ['zh', 'en', 'ja'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';

export const NAMESPACES = [
  'common',
  'navigation',
  'errors',
  'form',
  'categories',
  'pages',
  'instructions',
  'bazi',
  'ziwei',
  'charts',
  'settings',
  'wiki',
  'web3/dashboard',
  'web3/layout',
  'web3/tasks',
  'web3/auth',
  'astro/fortune',
  'astro/karmaPalace'
] as const;
export type Namespace = (typeof NAMESPACES)[number];

export type Messages = {
  common: typeof commonEn;
  navigation: typeof navigationEn;
  errors: typeof errorsEn;
  form: typeof formEn;
  categories: typeof categoriesEn;
  pages: typeof pagesEn;
  instructions: typeof instructionsEn;
  bazi: typeof baziEn;
  ziwei: typeof ziweiEn;
  charts: typeof chartsEn;
  settings: typeof settingsEn;
  wiki: typeof wikiEn;
  'web3/dashboard': typeof web3DashboardEn;
  'web3/layout': typeof web3LayoutEn;
  'web3/tasks': typeof web3TasksEn;
  'web3/auth': typeof web3AuthEn;
  'astro/fortune': typeof astroFortuneEn;
  'astro/karmaPalace': typeof astroKarmaPalaceEn;
};

export type Translator = (key: string, values?: Record<string, unknown>) => string;

export type NamespaceLoaders = Record<Locale, Record<Namespace, () => Promise<Record<string, unknown>>>>;

export const MESSAGE_LOADERS: NamespaceLoaders = {
  en: {
    common: () => import('./en/common.json').then((m) => m.default),
    navigation: () => import('./en/navigation.json').then((m) => m.default),
    errors: () => import('./en/errors.json').then((m) => m.default),
    form: () => import('./en/form.json').then((m) => m.default),
    categories: () => import('./en/categories.json').then((m) => m.default),
    pages: () => import('./en/pages.json').then((m) => m.default),
    instructions: () => import('./en/instructions.json').then((m) => m.default),
    bazi: () => import('./en/bazi.json').then((m) => m.default),
    ziwei: () => import('./en/ziwei.json').then((m) => m.default),
    charts: () => import('./en/charts.json').then((m) => m.default),
    settings: () => import('./en/settings.json').then((m) => m.default),
    wiki: () => import('./en/wiki.json').then((m) => m.default),
    'web3/dashboard': () => import('./en/web3/dashboard.json').then((m) => m.default),
    'web3/layout': () => import('./en/web3/layout.json').then((m) => m.default),
    'web3/tasks': () => import('./en/web3/tasks.json').then((m) => m.default),
    'web3/auth': () => import('./en/web3/auth.json').then((m) => m.default),
    'astro/fortune': () => import('./en/astro/fortune.json').then((m) => m.default),
    'astro/karmaPalace': () => import('./en/astro/karmaPalace.json').then((m) => m.default)
  },
  zh: {
    common: () => import('./zh/common.json').then((m) => m.default),
    navigation: () => import('./zh/navigation.json').then((m) => m.default),
    errors: () => import('./zh/errors.json').then((m) => m.default),
    form: () => import('./zh/form.json').then((m) => m.default),
    categories: () => import('./zh/categories.json').then((m) => m.default),
    pages: () => import('./zh/pages.json').then((m) => m.default),
    instructions: () => import('./zh/instructions.json').then((m) => m.default),
    bazi: () => import('./zh/bazi.json').then((m) => m.default),
    ziwei: () => import('./zh/ziwei.json').then((m) => m.default),
    charts: () => import('./zh/charts.json').then((m) => m.default),
    settings: () => import('./zh/settings.json').then((m) => m.default),
    wiki: () => import('./zh/wiki.json').then((m) => m.default),
    'web3/dashboard': () => import('./zh/web3/dashboard.json').then((m) => m.default),
    'web3/layout': () => import('./zh/web3/layout.json').then((m) => m.default),
    'web3/tasks': () => import('./zh/web3/tasks.json').then((m) => m.default),
    'web3/auth': () => import('./zh/web3/auth.json').then((m) => m.default),
    'astro/fortune': () => import('./zh/astro/fortune.json').then((m) => m.default),
    'astro/karmaPalace': () => import('./zh/astro/karmaPalace.json').then((m) => m.default)
  },
  ja: {
    common: () => import('./ja/common.json').then((m) => m.default),
    navigation: () => import('./ja/navigation.json').then((m) => m.default),
    errors: () => import('./ja/errors.json').then((m) => m.default),
    form: () => import('./ja/form.json').then((m) => m.default),
    categories: () => import('./ja/categories.json').then((m) => m.default),
    pages: () => import('./ja/pages.json').then((m) => m.default),
    instructions: () => import('./ja/instructions.json').then((m) => m.default),
    bazi: () => import('./ja/bazi.json').then((m) => m.default),
    ziwei: () => import('./ja/ziwei.json').then((m) => m.default),
    charts: () => import('./ja/charts.json').then((m) => m.default),
    settings: () => import('./ja/settings.json').then((m) => m.default),
    wiki: () => import('./ja/wiki.json').then((m) => m.default),
    'web3/dashboard': () => import('./ja/web3/dashboard.json').then((m) => m.default),
    'web3/layout': () => import('./ja/web3/layout.json').then((m) => m.default),
    'web3/tasks': () => import('./ja/web3/tasks.json').then((m) => m.default),
    'web3/auth': () => import('./ja/web3/auth.json').then((m) => m.default),
    'astro/fortune': () => import('./ja/astro/fortune.json').then((m) => m.default),
    'astro/karmaPalace': () => import('./ja/astro/karmaPalace.json').then((m) => m.default)
  }
};

export function isSupportedLocale(locale: string | null | undefined): locale is Locale {
  return !!locale && SUPPORTED_LOCALES.includes(locale as Locale);
}

export function assertLocale(locale: string | null | undefined): Locale {
  return isSupportedLocale(locale) ? locale : DEFAULT_LOCALE;
}
