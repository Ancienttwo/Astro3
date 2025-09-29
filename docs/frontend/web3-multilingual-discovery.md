# Phase 1 – Web3 Multilingual Unification Discovery

## 1. Locale & Routing Baseline
- `middleware.ts` registers locales `['zh', 'en', 'ja']` with `defaultLocale: 'zh'` and `localePrefix: 'as-needed'`, so `/` resolves to Chinese while `/en/*` and `/ja/*` are explicitly prefixed.
- Root `app/layout.tsx` pins `unstable_setRequestLocale('zh')`, whereas `app/en/layout.tsx` and `app/ja/layout.tsx` wrap children in locale-specific `NextIntlClientProvider` instances. There is no dedicated Web3 locale layout today.
- Most Web3 experiences live under unprefixed routes (`/web3`, `/leaderboard`, `/tasks`, `/web3-rewards`, etc.) and render English copy directly. Locale-prefixed equivalents generally do **not** exist, forcing English-only UX for core Web3 features.

## 2. Inventory of Web3-Relevant Routes
| Route | zh (root) | en | ja | Notes |
| --- | --- | --- | --- | --- |
| `/web3` | ✅ | ❌ | ❌ | Dashboard strings hardcoded in English (`app/web3/page.tsx`). |
| `/web3-rewards` | ✅ | ❌ | ❌ | English-only copy. |
| `/web3-profile` | ✅ | ❌ | ❌ | Depends on `Web3Layout`. |
| `/leaderboard` | ✅ | ❌ | ❌ | UI strings partly Chinese, partly English. |
| `/tasks` | ✅ | ❌ | ❌ | Uses `Web3Layout`; English copy. |
| `/wallet-auth` | ✅ | ✅ | ❌ | English localization via `/en/wallet-auth`; zh view still English-heavy. |
| `/fortune` | ✅ | ✅ | ❌ | Separate implementations (`app/fortune/page.tsx` vs `app/en/fortune/page.tsx`), diverging layouts. |
| `/bazi`, `/ziwei`, `/chatbot`, `/charts`, `/membership`, `/subscription`, `/profile`, `/preferences`, `/myprofile` | ✅ | ✅ | ✅ (partial) | Each maintains three physical files; behavior drifts between locales. |
| `/home` | ✅ | ✅ | ✅ | Chinese version is Web2-centric dashboard; English version differs significantly and is more marketing-focused. |
| `/wiki/*` | ✅ | ✅ | ❌ (most) | Extensive duplication; English tree far larger than Chinese. |
| `/wallet-guide` | ❌ | ✅ | ❌ | Exists only in English.

Key takeaways:
- Web3 navigation (`components/Web3Layout.tsx`) is English-only and links to `/en/...` slugs explicitly, so non-English locales cannot access feature-complete flows.
- Duplicate page implementations (e.g., `/fortune`) use distinct hooks (`useFortuneI18n` vs hardcoded fetches), increasing divergence risk.
- Japanese coverage exists for legacy experiences but not for Web3 dashboards; we effectively operate as zh/en today.

## 3. Recommended Target Locale Scope
- **Primary launch locales:** `zh` (default) and `en`. Both require full Web3 parity.
- **Japanese:** keep supportable but de-prioritize until zh/en parity lands. Provide fallback (e.g., zh copy) when localized assets are missing, and plan Phase 2.5 backlog for ja enablement.
- Document expectation that adding locales requires translation assets + QA sign-off before publish.

## 4. Canonical Routing Proposal
1. Introduce a locale segment with route groups:
   ```
   app/
     [locale]/
       layout.tsx         // wraps locale-aware providers
       (web3)/
         web3/page.tsx    // → /web3, /en/web3
         rewards/page.tsx // → /web3-rewards, /en/web3-rewards
         profile/page.tsx // → /web3-profile, ...
         tasks/page.tsx
         leaderboard/page.tsx
         wallet/
           auth/page.tsx
           guide/page.tsx
       (astro)/           // BaZi, ZiWei, chatbot, charts, etc.
         bazi/page.tsx
         ziwei/page.tsx
         fortune/page.tsx
         chatbot/page.tsx
   ```
   - Use parallel route groups `(web3)`/`(astro)` to scope layouts without changing external slugs.
   - Default locale (zh) is served from `/[locale]` via middleware rewrite, so `/web3` remains valid.
2. Provide shared `generateLocaleHref(locale, path)` helper so navigation/menu components build locale-safe URLs without string literals.
3. Create `app/(root)/page.tsx` that redirects to `/[locale]/web3` (Web3-first experience) instead of legacy `/home`.

## 5. Deprecation & Migration List
| Legacy Asset | Action | Rationale |
| --- | --- | --- |
| `app/home/page.tsx`, `app/default/page.tsx` | Replace with locale-prefixed Web3 dashboard; migrate any widgets needed for zh marketing. |
| `app/fortune/page.tsx` vs `app/en/fortune/page.tsx` | Converge into single localized page under `[locale]/(astro)/fortune`. |
| `app/mymembership`, `app/multilingual-demo-existing`, other Web2 demos | Archive or relocate outside primary routing tree to avoid confusion. |
| `components/EnglishLayout.tsx` and zh equivalents | Supersede with locale-aware `Web3Layout` + context-driven theming. |
| Hardcoded `/en/...` links in `components/Web3Layout.tsx`, `app/web3/page.tsx`, `app/tasks/page.tsx`, etc. | Replace with locale helper. |
| `/ja/*` Web3 gaps | Mark as pending; ensure default fallback until dedicated localisation delivered. |

## 6. Outstanding Questions / Alignments Needed
- Confirm stakeholder appetite for redirecting `/` → Web3 dashboard vs maintaining marketing landing page.
- Decide whether Japanese is a Phase 3 requirement or enters backlog (impacts translation tooling scope).
- Validate dependency telemetry (analytics, SEO) when moving to locale-prefixed routes.

## 7. Handover to Subsequent Phases
- Feed modular dictionary design (Phase 2) with the route inventory table to plan bundle boundaries (`web3/dashboard`, `astro/fortune`, etc.).
- Prioritize refactoring `Web3Layout` in Phase 3 since all core routes depend on it.
- Use deprecation list to seed migration epics and ensure QA scenarios cover zh/en flows for dashboard, rewards, tasks, wallet auth, and astro modules.
