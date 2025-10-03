# Phase 4: Dictionary Migration - Partial Summary

## 📊 Phase Status

**Current Status:** IN PROGRESS (50% Complete)
**Start Date:** 2025-10-03
**Last Updated:** 2025-10-03

---

## ✅ Completed Tasks

### 1. Infrastructure Setup (100%)
- ✅ Updated `i18n/messages/index.ts` to support dynamic namespace loading
- ✅ Updated `i18n/loader.ts` with route-based namespace mappings
- ✅ All three languages (zh, en, ja) fully configured

### 2. New Namespaces Created (3 of 7)

#### ✅ pages Namespace
**Purpose:** Centralized page titles and subtitles
**Files Created:**
- `i18n/messages/zh/pages.json` (7 pages)
- `i18n/messages/en/pages.json` (7 pages)
- `i18n/messages/ja/pages.json` (7 pages)

**Content:**
```json
{
  "bazi": { "title": "八字排盘", "subtitle": "传统八字命理分析" },
  "ziwei": { "title": "紫微斗数", "subtitle": "紫微斗数命盘分析" },
  "auth": { "title": "Web3 钱包登录", "subtitle": "..." },
  "settings": { "title": "设置", "subtitle": "..." },
  "charts": { "title": "命盘记录", "subtitle": "..." },
  "createChart": { "title": "创建命盘", "subtitle": "..." },
  "wiki": { "title": "知识百科", "subtitle": "..." }
}
```

**Route Mappings:** All major pages (/, /bazi, /ziwei, /charts, /settings, /wiki, /web3, /fortune, /guandi, /auth)

---

#### ✅ instructions Namespace
**Purpose:** User instruction texts for form-based pages
**Files Created:**
- `i18n/messages/zh/instructions.json`
- `i18n/messages/en/instructions.json`
- `i18n/messages/ja/instructions.json`

**Content:**
```json
{
  "fillForm": "请填写出生信息",
  "clickCalculate": "点击计算按钮生成命盘",
  "saveChart": "保存命盘到您的档案"
}
```

**Route Mappings:** `/bazi`, `/ziwei` (form-heavy pages)

---

#### ✅ astro/karmaPalace Namespace
**Purpose:** ZiWei astrology Karma Palace (来因宫) concept and explanations
**Files Created:**
- `i18n/messages/zh/astro/karmaPalace.json`
- `i18n/messages/en/astro/karmaPalace.json`
- `i18n/messages/ja/astro/karmaPalace.json`

**Content Structure:**
```json
{
  "title": "宿世因缘",
  "whatIsKarmaPalace": "什么是来因宫？",
  "whatIsKarmaPalaceDesc": "来因宫在紫微斗数中扮演着至关重要的角色...",
  "importanceOfKarmaPalace": "来因宫的重要性",
  "importanceOfKarmaPalaceDesc": "...",
  "yourKarmaPalaceIn": "您的来因宫在",
  "peopleAspect": "人",
  "mattersAspect": "事",
  "materialAspect": "物",
  "palaceReference": "十二宫位参考",
  "palaceReferenceDesc": "...",
  "palaceNames": {
    "self": "命宫",
    "siblings": "兄弟",
    "spouse": "夫妻",
    "children": "子女",
    "wealth": "财帛",
    "health": "疾厄",
    "travel": "迁移",
    "friends": "交友",
    "career": "官禄",
    "property": "田宅",
    "fortune": "福德",
    "parents": "父母"
  }
}
```

**Route Mappings:** `/ziwei` (ZiWei astrology pages)

---

## 🚧 Remaining Tasks

### 3. User-Related Namespaces (0 of 4)

#### ❌ user/profile Namespace
**Status:** NOT STARTED
**Priority:** HIGH (app/profile and app/myprofile pages actively using t.profile.*)
**Estimated Keys:** ~50+ keys

**Required Content:**
- Basic info fields (birthDate, birthTime, birthLocation, gender, nickname)
- Profile management (edit, save, cancel, saving states)
- Validation messages (genderEditLimitExceeded, birthInfoValidation)
- Profile stats (joinedDate, lastUpdated, editCount)

**Target Files:**
- `i18n/messages/{zh,en,ja}/user/profile.json`

**Route Mappings:** `/profile`, `/myprofile`

---

#### ❌ user/membership Namespace
**Status:** NOT STARTED
**Priority:** HIGH (app/membership page actively using t.membership.*)
**Estimated Keys:** ~35+ keys

**Required Content:**
- Membership status display (membershipStatus, premiumMember)
- Usage statistics (freeReports, paidReports, chatbotDialogs, expertReports)
- Account actions (exportData, importData, resetSettings, deleteAccount)
- Confirmation prompts and success/error messages

**Target Files:**
- `i18n/messages/{zh,en,ja}/user/membership.json`

**Route Mappings:** `/membership`, `/mymembership`

---

#### ❌ user/subscription Namespace
**Status:** NOT STARTED
**Priority:** MEDIUM (app/subscription page using t.subscription.*)
**Estimated Keys:** ~30+ keys

**Required Content:**
- Subscription plans comparison (membershipComparison, chooseYourPlan)
- Credit purchase (purchaseCredits, buyCredits, unitPrice)
- Plan features (mostPopular, recommended, bestValue)
- FAQ section (faqMembershipExpiry, faqUpgradePlans, etc.)

**Target Files:**
- `i18n/messages/{zh,en,ja}/user/subscription.json`

**Route Mappings:** `/subscription`

---

#### ❌ user/preferences Namespace
**Status:** NOT STARTED
**Priority:** MEDIUM (app/preferences page using t.preferences.*)
**Estimated Keys:** ~15+ keys

**Required Content:**
- Theme settings (lightMode, darkMode, systemMode)
- Language settings (chinese, english, japanese)
- UI preferences (currentTheme, currentLanguage)
- Coming soon placeholders

**Target Files:**
- `i18n/messages/{zh,en,ja}/user/preferences.json`

**Route Mappings:** `/preferences`

---

### 4. Astrology Term Expansions (Optional - Future Enhancement)

#### ❌ Expand ziwei.json
**Status:** NOT STARTED
**Priority:** LOW (can be done post-Phase 4)
**Scope:** Add detailed star descriptions from dictionaries.ts

**Content to Add:**
- primaryStars translations (14 main stars)
- starDetails for each star (coreEssence, symbolism, keyTraits, etc.)
- ~200+ additional keys

**Approach:** This can be deferred to Phase 6 or 7 as it's primarily enhancement, not migration of actively used translations.

---

#### ❌ Expand bazi.json
**Status:** NOT STARTED
**Priority:** LOW (can be done post-Phase 4)
**Scope:** Add detailed BaZi term translations if dictionaries.ts contains them

**Approach:** Review dictionaries.ts bazi section and determine if expansion is necessary.

---

## 📈 Progress Metrics

### Files Modified/Created in Phase 4:
1. ✅ `i18n/messages/index.ts` - Added pages, instructions, astro/karmaPalace
2. ✅ `i18n/loader.ts` - Updated route mappings
3. ✅ `i18n/messages/{zh,en,ja}/pages.json` - Created (3 files)
4. ✅ `i18n/messages/{zh,en,ja}/instructions.json` - Created (3 files)
5. ✅ `i18n/messages/{zh,en,ja}/astro/karmaPalace.json` - Created (3 files)

**Total Files Modified:** 11
**Total Translation Keys Added:** ~35 keys across 3 namespaces

### Remaining Work Estimate:
- **user/profile:** 50 keys × 3 languages = 150 translation entries
- **user/membership:** 35 keys × 3 languages = 105 translation entries
- **user/subscription:** 30 keys × 3 languages = 90 translation entries
- **user/preferences:** 15 keys × 3 languages = 45 translation entries

**Total Remaining:** ~390 translation entries across 12 files

---

## 🎯 Next Steps (Priority Order)

### Immediate Next Task:
1. ✅ Create `user/` subdirectory structure
2. ⏳ Extract profile translations from dictionaries.ts (lines 682-735)
3. ⏳ Create `i18n/messages/{zh,en,ja}/user/profile.json`
4. ⏳ Update index.ts and loader.ts for user/profile namespace
5. ⏳ Repeat for membership, subscription, preferences

### Phase 4 Completion Criteria:
- [ ] All actively used dictionaries.ts namespaces migrated
- [ ] All user-related pages (profile, membership, subscription, preferences) using new namespace system
- [ ] Route mappings updated for all user pages
- [ ] No breaking changes to existing functionality

### Post-Phase 4 (Phase 5+):
- Migrate components still using `language-manager.ts`
- Remove legacy `dictionaries.ts` file
- Comprehensive testing across all 3 languages

---

## 🔍 Technical Notes

### Namespace Organization Strategy:
- **Core UI:** `common`, `navigation`, `errors`, `form`
- **Pages:** `pages`, `instructions`
- **Features:** `bazi`, `ziwei`, `charts`, `settings`, `wiki`
- **Astrology:** `astro/fortune`, `astro/karmaPalace`
- **Web3:** `web3/dashboard`, `web3/layout`, `web3/tasks`, `web3/auth`
- **User:** `user/profile`, `user/membership`, `user/subscription`, `user/preferences`

### Backward Compatibility:
`i18n/request.ts` continues to use `deepMerge()` to combine:
1. Legacy dictionaries.ts translations
2. New modular namespace translations

This ensures no breaking changes during migration.

### Type Safety:
All new namespaces registered in `Messages` type definition for compile-time checking.

---

**Phase Lead:** Claude Code
**Documentation:** Auto-updated during migration
**Review Status:** Pending user approval for next batch (user/* namespaces)
