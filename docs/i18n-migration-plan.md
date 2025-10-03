# i18n Architecture Migration Plan

## 🎯 Objective
Unify all i18n systems into next-intl framework for consistency, performance, and maintainability.

## 📊 Current State Analysis

### Systems to Consolidate
1. **next-intl** (Primary) - Modern, SSR-ready
2. **Fortune module i18n** - Separate system with different language codes
3. **Zustand language-manager** - Client-side state management
4. **dictionaries.ts** - Legacy 3067-line monolithic file

### Dependencies Found
- `language-manager.ts`: 7 files
- `fortune/i18n`: 3 files
- `dictionaries.ts`: Loaded in `i18n/request.ts`

## 🗺️ Migration Phases

### Phase 1: Preparation (Current)
- [x] Analyze current architecture
- [x] Identify all dependencies
- [ ] Create migration plan document
- [ ] Backup critical files

### Phase 2: Namespace Expansion
- [ ] Add new namespaces to `i18n/messages/index.ts`:
  - `bazi` - 八字系统
  - `ziwei` - 紫微斗数
  - `charts` - 命盘管理
  - `settings` - 设置页面
  - `wiki` - 知识库
- [ ] Create empty JSON files for each namespace

### Phase 3: Dictionary Migration
- [ ] Extract sections from `dictionaries.ts` to JSON files:
  - `common` → `i18n/messages/{locale}/common.json` (merge)
  - `form` → `i18n/messages/{locale}/form.json` (new)
  - `pages.bazi` → `i18n/messages/{locale}/bazi.json` (new)
  - `pages.ziwei` → `i18n/messages/{locale}/ziwei.json` (new)
  - `pages.charts` → `i18n/messages/{locale}/charts.json` (new)
  - `pages.settings` → `i18n/messages/{locale}/settings.json` (new)
  - `pages.wiki` → `i18n/messages/{locale}/wiki.json` (new)
  - `instructions` → merge into relevant namespaces
  - `errors` → `i18n/messages/{locale}/errors.json` (new)
  - `categories` → `i18n/messages/{locale}/categories.json` (new)

### Phase 4: Fortune Module Integration
- [ ] Unify language codes:
  - `zh-CN` / `zh-TW` → `zh` (keep Traditional Chinese for content)
  - `en-US` → `en`
  - `ja-JP` → `ja`
- [ ] Migrate Fortune translations:
  - `lib/modules/fortune/i18n/locales/zh-CN.ts` → `i18n/messages/zh/astro/fortune.json`
  - `lib/modules/fortune/i18n/locales/zh-TW.ts` → Add `traditional` variants
  - `lib/modules/fortune/i18n/locales/en-US.ts` → `i18n/messages/en/astro/fortune.json`
  - `lib/modules/fortune/i18n/locales/ja-JP.ts` → `i18n/messages/ja/astro/fortune.json`
- [ ] Update Fortune components to use `useTranslations()` from next-intl
- [ ] Remove `lib/modules/fortune/i18n/` directory

### Phase 5: Component Updates
- [ ] Replace `useLanguageStore` with next-intl hooks:
  - `useTranslations()` for translations
  - `useLocale()` for current locale
  - `useRouter()` + locale paths for language switching
- [ ] Update files:
  - [ ] `components/Providers.tsx`
  - [ ] `components/ui/language-switcher.tsx`
  - [ ] `components/layout/HybridLanguageLayout.tsx`
  - [ ] `components/i18n/LanguageSelector.tsx`
  - [ ] `app/settings-hybrid/page.tsx`
  - [ ] `app/hybrid-demo/page.tsx`
  - [ ] `app/guandi/page.tsx`
  - [ ] `components/DailyCheckinCard.tsx`
  - [ ] `app/en/fortune/page.tsx`
  - [ ] `components/fortune/TempleSystemSelector.tsx`
  - [ ] `app/fortune/page.tsx`

### Phase 6: Cleanup
- [ ] Remove legacy files:
  - [ ] `lib/i18n/language-manager.ts` (4000+ lines)
  - [ ] `lib/i18n/enhanced-language-manager.ts`
  - [ ] `lib/i18n/dictionaries.ts` (3067 lines)
  - [ ] `lib/modules/fortune/i18n/` (entire directory)
  - [ ] `lib/i18n/japanese-*.ts` files (move content to JSON)
- [ ] Remove unused imports
- [ ] Run type checks: `npm run type-check`
- [ ] Run linter: `npm run lint`

### Phase 7: Testing
- [ ] Test all language switches (zh ↔ en ↔ ja)
- [ ] Test all pages:
  - [ ] Home page
  - [ ] Bazi calculator
  - [ ] Ziwei calculator
  - [ ] Fortune/Guandi pages
  - [ ] Web3 pages (dashboard, tasks, auth)
  - [ ] Settings pages
- [ ] Test SSR rendering
- [ ] Test dynamic language switching
- [ ] Test URL routing with locale prefixes

### Phase 8: Documentation
- [ ] Update `CLAUDE.md` with new i18n guidelines
- [ ] Create developer guide: `docs/i18n-guide.md`
- [ ] Update component documentation
- [ ] Add JSDoc comments to utility functions

## 🔧 Technical Implementation

### New Namespace Structure
```
i18n/messages/
├── {locale}/
│   ├── common.json          # Buttons, forms, universal UI
│   ├── navigation.json      # Menu, links
│   ├── errors.json          # Error messages
│   ├── form.json            # Form labels, validation
│   ├── categories.json      # Category names
│   ├── bazi.json            # 八字 calculator
│   ├── ziwei.json           # 紫微斗数 calculator
│   ├── charts.json          # Chart management
│   ├── settings.json        # Settings page
│   ├── wiki.json            # Knowledge base
│   ├── astro/
│   │   └── fortune.json     # Fortune slip system
│   └── web3/
│       ├── auth.json        # Wallet auth
│       ├── dashboard.json   # Dashboard
│       ├── tasks.json       # Task system
│       └── layout.json      # Web3 layout
```

### Usage Pattern (After Migration)
```typescript
// ✅ Standard usage
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('bazi');
  return <h1>{t('title')}</h1>;
}

// ✅ Multiple namespaces
function ComplexComponent() {
  const tCommon = useTranslations('common');
  const tBazi = useTranslations('bazi');

  return (
    <>
      <button>{tCommon('submit')}</button>
      <h1>{tBazi('title')}</h1>
    </>
  );
}

// ✅ Language switching
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  const switchLanguage = (newLocale: string) => {
    router.push(`/${newLocale}/current-path`);
  };

  return <button onClick={() => switchLanguage('en')}>English</button>;
}
```

## ⚠️ Risk Mitigation

### Backup Strategy
1. Create git branch: `migration/unify-i18n`
2. Keep legacy files until full testing complete
3. Gradual rollout: test in development → staging → production

### Rollback Plan
If critical issues arise:
1. Revert to previous commit
2. Re-enable legacy systems temporarily
3. Fix issues in separate branch
4. Retry migration

### Language Code Mapping
```typescript
// Temporary compatibility layer during migration
const LEGACY_TO_NEW_LOCALE: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-TW': 'zh', // Note: Traditional Chinese content preserved in translations
  'en-US': 'en',
  'ja-JP': 'ja'
};
```

## 📈 Success Metrics
- [ ] Zero runtime errors related to i18n
- [ ] All pages render correctly in all 3 languages
- [ ] No duplicate translation systems
- [ ] Reduced bundle size (remove ~7000 lines of legacy code)
- [ ] Type-safe translations with full IDE autocomplete

## 🕐 Timeline Estimate
- Phase 1: 30 minutes (✅ Complete)
- Phase 2: 30 minutes
- Phase 3: 2 hours (large dictionary split)
- Phase 4: 1 hour
- Phase 5: 2 hours (11 component files)
- Phase 6: 30 minutes
- Phase 7: 1 hour (testing)
- Phase 8: 30 minutes (documentation)

**Total: ~8 hours of focused work**

## 📝 Notes
- Traditional Chinese (繁體) vs Simplified (简体) can be handled via translation variants within the `zh` locale
- Fortune slip content should preserve traditional Chinese characters regardless of language setting
- Web3 components already use modular i18n - less work needed
- Consider adding `zh-Hant` variant support in Phase 2 if needed

---

**Status**: Phase 1 Complete ✅
**Next**: Begin Phase 2 - Namespace Expansion
