# Web3 Multilingual Unification Plan

## Background & Objectives
- Current routing simultaneously maintains Web2 Chinese pages (`/home`, `/fortune`) and Web3 English experiences (`/web3`, `/en/...`), causing duplicated maintenance.
- Goal: deliver a single Web3-first experience that supports multiple locales (zh default, en, optional ja) with consistent UX, layout, and feature exposure.
- Success criteria: locale-prefixed routing without duplicate code paths, shared Web3 layout with localized navigation, clear translation ownership, and regression-free rollout.

## Current Pain Points
1. Fragmented routing: `app/<route>/page.tsx`, `app/en/<route>/page.tsx`, `app/ja/<route>/page.tsx` coexist; `app/en/settings/page.tsx` is only a redirect shell.
2. Web3 modules hardcode English strings (`components/Web3Layout.tsx`, `app/web3/page.tsx`, `app/web3-rewards/page.tsx`).
3. Internationalization relies on monolithic dictionaries (`lib/i18n/dictionaries.ts` >3k LOC) with limited reuse for Web3 content.
4. Fortune and other vertical modules run custom i18n hooks, increasing divergence from Next-Intl.
5. Translation workflow lacks formal staging/testing; no automated regression for multi-locale views.

## Proposed Approach (Phased)

### Phase 1 – Discovery & Scope Lock
- Audit active Web3 routes and dependent components (dashboard, rewards, tasks, leaderboard, profile, etc.).
- Align target locale set (zh mandatory default, en required, ja optional based on product decision).
- Define canonical routing structure (recommend `app/[locale]/(web3)/...` with `defaultLocale=zh` for prefixless paths) and deprecation list for legacy Web2 pages.
- Deliverables: architecture RFC, prioritized migration backlog, stakeholder sign-off.

### Phase 2 – Translation Architecture Refactor
- Split `lib/i18n/dictionaries.ts` into feature-scoped message bundles (e.g. `i18n/web3/dashboard.ts`).
- Establish message IDs keyed by feature + semantic intent; provide TypeScript types for compile-time safety.
- Introduce translation source-of-truth (e.g. JSON/YAML or external TMS) and extraction script.
- Deliverables: new dictionary structure, documentation for translators, lint/check scripts.

### Phase 3 – Web3 Layout Internationalization
- Refactor `components/Web3Layout.tsx` to consume Next-Intl messages; move nav/menu definitions to locale-aware config.
- Ensure layout routing helpers generate locale-prefixed links automatically; add fallback for default locale.
- Update shared Web3 components (badges, CTA copy) to use translated strings.
- Deliverables: localized Web3 shell, smoke tests covering nav in zh/en.

### Phase 4 – Page-Level Migrations
- Iteratively convert Web3 pages to localized variants using shared components (start with `app/web3/page.tsx`, `app/web3-rewards/page.tsx`, `app/tasks/page.tsx`, `app/leaderboard/page.tsx`).
- Migrate API calls and metadata to respect locale (e.g. query params `language=en` from Fortune module).
- Remove duplicate `/en/*` directories once equivalent localized pages ship; update redirects.
- Deliverables: unified page set, removed legacy routes, updated sitemap/SEO metadata.

### Phase 5 – QA, Observability & Rollout
- Expand automated coverage: snapshot/visual tests per locale, Playwright journeys for critical flows.
- Implement locale toggle smoke tests, ensure middleware & caching behave correctly.
- Prepare rollback plan and deployment checklist; communicate user-facing changes.
- Deliverables: test reports, monitoring dashboards, release notes.

## Cross-Cutting Considerations
- **Governance:** Assign translation ownership, review cadence, and SLA for new strings.
- **Performance:** Evaluate bundle size impact from locale messages; leverage dynamic imports where possible.
- **Accessibility:** Revisit content semantics when translating; ensure locale toggles are keyboard-accessible.
- **Analytics:** Update tracking to include locale dimension for usage insights.

## Initial Task Suggestions
1. `Phase 1 | Discovery`: catalog Web3 routes, components, and legacy Web2 pages earmarked for removal.
2. `Phase 2 | i18n Architecture`: prototype modularized dictionaries and message loading strategy.
3. `Phase 3 | Layout`: build locale-aware navigation config and refactor `Web3Layout` to consume it.
4. `Phase 4 | Migrations`: convert `app/web3/page.tsx` to typed translation hooks and remove English hardcoding.
5. `Phase 5 | QA`: design and automate locale smoke tests (Playwright, Jest DOM snapshots).

## Risks & Mitigations
- **Scope creep** from overlapping Web2 features → maintain strict backlog and phased QA gates.
- **Translation backlog** delaying rollout → prioritize English/Zh parity first, stage optional locales.
- **Regression risk** from routing rewrites → add middleware/unit tests and feature flags for staged release.

## Next Steps
- Confirm stakeholder alignment on phased plan.
- Spin up dedicated Task Master epic and subtasks per phase.
- Schedule POC sprint for Phase 3 layout refactor to validate approach before full migration.
