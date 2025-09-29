# Phase 2 – Modular i18n Architecture Plan

## Objectives
- Replace the monolithic `lib/i18n/dictionaries.ts` (3K+ LOC) with feature-scoped, locale-specific message bundles that can evolve independently.
- Provide a predictable loading pipeline for `next-intl` so Web3-first pages can request only the namespaces they need (`web3`, `astro`, `auth`, `common`).
- Deliver TypeScript-backed tooling and scripts that keep translators, engineers, and CI aligned on coverage and regressions.

## Current-State Issues
1. **Single giant dictionary:** `lib/i18n/dictionaries.ts` exports `zhDict`, `enDict`, `jaDict` as full objects. Importing any message pulls the entire bundle into the client, affects bundle size, and makes reviews painful.
2. **Ad-hoc module dictionaries:** Modules like Fortune extend the base dictionary via bespoke hooks (`lib/modules/fortune/i18n/fortune-dictionaries.ts`), duplicating patterns and risking drift from the main translation source.
3. **Hardcoded fallbacks:** Components such as `Web3Layout` embed raw English strings because adding fields to the giant dictionary is cumbersome.
4. **Missing typing:** `useI18n` returns `Dictionary` but downstream code bypasses typed access (e.g., `t.pages.settings.title`), so missing keys only surface at runtime.

## Proposed Architecture
### 1. File & Namespace Structure
Create a dedicated `i18n/messages` tree where each locale mirrors the same namespace layout.
```
i18n/
  messages/
    en/
      common.json
      navigation.json
      web3/dashboard.json
      web3/layout.json
      astro/fortune.json
    zh/
      common.json
      navigation.json
      web3/dashboard.json
      web3/layout.json
      astro/fortune.json
    ja/
      common.json            // optional during initial rollout
  index.ts                   // helper exports & typings
  loader.ts                  // message loading utilities
```
- Namespaces map to feature areas (`common`, `navigation`, `web3/dashboard`, `web3/layout`, `astro/fortune`, etc.).
- JSON keeps translators’ workflow simple while allowing tooling to validate keys.

### 2. Message Loading Pipeline
Leverage `next-intl` dynamic loaders instead of importing the full dictionary:
```ts
// i18n/loader.ts
const loadMessages = async (locale: Locale, namespaces: Namespace[]) => {
  const messages = await Promise.all(
    namespaces.map((ns) => import(`./messages/${locale}/${ns}.json`).then((mod) => mod.default))
  );
  return deepMerge(messages);
};
```
- Use a simple `deepMerge` utility to combine requested namespaces.
- `getRequestConfig` becomes namespace-aware:
```ts
export default getRequestConfig(async ({locale, request}) => {
  const namespaces = detectNamespacesFromRoute(request.nextUrl.pathname);
  return {
    locale,
    messages: await loadMessages(locale as Locale, namespaces)
  };
});
```
- For now, `detectNamespacesFromRoute` can rely on a static mapping (Phase 2 deliverable). Later we can support component-level namespace hints.

### 3. Typed Translation Hooks
- Generate a `Messages` type from the English bundle (source of truth) using `zod` or a custom generator.
- Update `lib/i18n/useI18n.ts` to return typed translator helpers:
```ts
export function useTranslations<Ns extends keyof Messages>(namespace: Ns) {
  const t = useNextIntlTranslations(namespace as string);
  return t as NamespaceTranslator<Messages[Ns]>;
}
```
- Provide helper types `NamespaceTranslator<T>` so components get autocompletion and compile-time safety.

### 4. Fortune & Module Integration
- Move `fortune-dictionaries.ts` content into `astro/fortune.json` & `astro/fortune.ai.json` namespaces.
- Update `useFortuneI18n` to call the shared loader via `useTranslations('astro.fortune')`; derive specialized helpers (`useFortuneTranslation`) from the typed namespace.

### 5. Tooling & Governance
- **Lint step:** add `scripts/i18n/check-messages.ts` to compare locale keys vs. English baseline.
- **Extraction:** optionally support `tsx` scanning for `t('web3.dashboard.title')` patterns to flag missing translations.
- **CI Gate:** integrate the check script into existing lint/test pipeline.
- **Documentation:** extend `TRANSLATION_SYSTEM_GUIDE.md` with new instructions for adding namespaces.
- **Routing:** use `lib/i18n/routing.ts` helpers to generate locale-aware URLs while supporting legacy routes that remain unprefixed during the migration.

## Implementation Roadmap
1. **Scaffold directories** with seed JSON files for `common`, `navigation`, `web3/dashboard`, `web3/layout`, `astro/fortune` (zh/en). Provide placeholder ja files or document fallback behavior.
2. **Refactor `i18n/request.ts`** to use the new loader and static namespace map (include Web3 routes first).
3. **Update hooks** (`lib/i18n/useI18n.ts`, `hooks/useI18n.tsx`) to consume typed messages and expose namespace-based translators.
4. **Migrate Fortune module** to new namespaces to deprecate bespoke dictionary extensions.
5. **Introduce tooling scripts** and add them to `package.json` (e.g., `pnpm i18n:lint`).
6. **Deprecate old dictionary exports** gradually—keep them temporarily for legacy components but mark with TODOs to migrate in Phases 3–4.

## Deliverables for Phase 2
- `i18n/messages/**` directory with baseline namespaces populated from existing copy.
- Updated `i18n/request.ts`, loader utilities, and typing helpers.
- Documentation updates (`docs/frontend/web3-i18n-architecture.md`, `TRANSLATION_SYSTEM_GUIDE.md`).
- Automation scripts ensuring locales remain in sync.

Successful completion unlocks Phase 3 (Web3 layout internationalization) by providing localized navigation and CTA strings via maintainable namespaces.
