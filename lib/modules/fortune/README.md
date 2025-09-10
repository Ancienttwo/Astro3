# Fortune Module 解签模块

A modular, internationalized fortune divination system for traditional temple fortune reading with AI-powered interpretation.

## Features 功能特性

### Core Features 核心功能
- 🏛️ **Multi-Temple System** - Support for multiple temple fortune systems
- 🎋 **Fortune Slip Management** - Complete fortune slip drawing and display
- 🤖 **AI Interpretation** - AI-powered fortune interpretation with cultural stories
- 🌍 **Internationalization** - Multi-language support (簡中/繁中/English/日本語+)
- 📱 **QR Code Referrals** - Temple partnership and referral tracking
- 🔐 **Authentication Integration** - Seamless auth with tiered access
- 🎨 **Responsive Design** - Mobile-first responsive UI
- ⚙️ **Modular Architecture** - Easy integration and customization

### Language Support 语言支持

#### Phase 1 (Active 已激活)
- 🇨🇳 **简体中文** (zh-CN) - Simplified Chinese
- 🇹🇼 **繁體中文** (zh-TW) - Traditional Chinese  
- 🇺🇸 **English** (en-US) - English

#### Phase 2 (Planned 计划中)
- 🇯🇵 **日本語** (ja-JP) - Japanese
- 🇰🇷 **한국어** (ko-KR) - Korean
- 🇹🇭 **ไทย** (th-TH) - Thai
- 🇻🇳 **Tiếng Việt** (vi-VN) - Vietnamese

## Installation 安装

### 1. Database Setup 数据库设置

```bash
# Run fortune module migrations
supabase db push
```

Required migrations:
- `20250130000000_create_fortune_divination_system.sql`
- `20250130000001_seed_manmo_fortune_slips.sql`

### 2. Environment Variables 环境变量

```bash
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - AI Features (Dify)
DIFY_FORTUNE_MASTER_KEY=app-xxxx        # Chinese AI agent
DIFY_FORTUNE_MASTER_EN_KEY=app-xxxx     # English AI agent  
DIFY_FORTUNE_MASTER_JA_KEY=app-xxxx     # Japanese AI agent

# Optional - AI Base URL
DIFY_BASE_URL=https://api.dify.ai/v1
```

### 3. Module Import 模块导入

```typescript
// Import the full module
import FortuneModule from '@/lib/modules/fortune';

// Or import specific parts
import { useFortuneI18n, TempleSystemSelector } from '@/lib/modules/fortune';

// Initialize the module
await FortuneModule.init();
```

## Quick Start 快速开始

### Basic Usage 基础用法

```typescript
'use client';
import { TempleSystemSelector } from '@/lib/modules/fortune';
import { useState } from 'react';

export default function FortunePage() {
  const [selectedTemple, setSelectedTemple] = useState(null);

  return (
    <div>
      <TempleSystemSelector
        selectedTempleCode={selectedTemple?.temple_code}
        onTempleSelect={setSelectedTemple}
      />
    </div>
  );
}
```

### With Internationalization 国际化使用

```typescript
'use client';
import { useFortuneI18n } from '@/lib/modules/fortune';

export default function FortuneComponent() {
  const { t, locale, isEnglish } = useFortuneI18n();

  return (
    <div>
      <h1>{t('fortune.title')}</h1>
      <p>{t('fortune.description')}</p>
      <p>Current locale: {locale}</p>
    </div>
  );
}
```

## API Reference API参考

### Endpoints 端点

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/fortune/systems` | GET | Get temple systems |
| `/api/fortune/slips/{temple_code}/{slip_number}` | GET | Get fortune slip |
| `/api/fortune/random` | POST | Generate random slip |
| `/api/fortune/interpret` | POST | AI interpretation |

### Components 组件

#### TempleSystemSelector

Temple selection dialog component.

```typescript
interface TempleSystemSelectorProps {
  selectedTempleCode?: string;
  onTempleSelect: (temple: TempleSystem) => void;
  trigger?: React.ReactNode;
  className?: string;
}
```

#### FortuneSlipDisplay (Coming Soon)

Fortune slip display with traditional styling.

```typescript
interface FortuneSlipDisplayProps {
  slip: FortuneSlip;
  showFullContent?: boolean;
  onInterpretRequest?: (slip: FortuneSlip) => void;
  className?: string;
}
```

### Hooks 钩子函数

#### useFortuneI18n

Main internationalization hook.

```typescript
const {
  dict,           // Full dictionary
  locale,         // Current locale (zh-CN|zh-TW|en-US)
  t,              // Translation function
  isZhCN,         // Boolean: is simplified Chinese
  isZhTW,         // Boolean: is traditional Chinese  
  isEnglish,      // Boolean: is English
  isChinese,      // Boolean: is any Chinese variant
  formatMessage   // Message formatter with params
} = useFortuneI18n();
```

#### useLocalizedField

Get localized field from objects.

```typescript
const getLocalizedField = useLocalizedField();

// Usage
const templeName = getLocalizedField(temple, 'temple_name');
```

## Configuration 配置

### Module Config 模块配置

```typescript
import { getFortuneConfig } from '@/lib/modules/fortune';

const config = getFortuneConfig();
// Returns configuration based on deployment target
```

### Deployment Targets 部署目标

- `unified-main` - Full featured (default)
- `web3-landing` - Web3 focused with blockchain integration
- `web2-global` - Global audience, English-first
- `development` - All features enabled for testing

### Feature Flags 功能开关

```typescript
import { isFortuneFeatureEnabled } from '@/lib/modules/fortune';

if (isFortuneFeatureEnabled('aiInterpretation')) {
  // Show AI interpretation features
}
```

## Database Schema 数据库架构

### Tables 数据表

1. **temple_systems** - Temple information
2. **fortune_slips** - Fortune slip content  
3. **temple_referral_campaigns** - QR campaigns
4. **temple_referrals** - Referral tracking
5. **divination_history** - User history

### Key Relationships 关键关系

```sql
temple_systems (1) -> (n) fortune_slips
temple_systems (1) -> (n) temple_referral_campaigns  
temple_referral_campaigns (1) -> (n) temple_referrals
fortune_slips (1) -> (n) divination_history
```

## Customization 定制化

### Theming 主题

Each temple has its own color scheme:

```typescript
interface TempleSystem {
  primary_color: string;    // Main brand color
  secondary_color: string;  // Accent color
  theme_style: 'traditional' | 'modern' | 'minimal';
}
```

### Adding New Languages 添加新语言

1. Create new dictionary file:
```typescript
// lib/modules/fortune/i18n/locales/ko-KR.ts
export const koKR: FortuneTranslationKeys = {
  fortune: {
    title: '운세',
    // ... translations
  }
};
```

2. Update language config:
```typescript
// lib/modules/fortune/i18n/index.ts
'ko-KR': {
  name: '한국어',
  nativeName: '한국어', 
  flag: '🇰🇷',
  status: 'active' // Change from 'planned'
}
```

3. Add to dictionary getter:
```typescript
// lib/modules/fortune/i18n/fortune-dictionaries.ts
export function getFortuneDictionary(locale: FortuneLocale) {
  switch (locale) {
    case 'ko-KR': return koKR;
    // ...
  }
}
```

## Deployment 部署

### Next.js Integration

Add to your Next.js app:

```typescript
// app/fortune/page.tsx
import { TempleSystemSelector } from '@/lib/modules/fortune';

export default function FortunePage() {
  return (
    <div>
      <TempleSystemSelector />
    </div>
  );
}
```

### Route Structure 路由结构

```
/fortune                 # Main fortune page
/fortune/temples         # Temple selection
/fortune/slips           # Fortune slip display
/fortune/history         # User history
/en/fortune             # English version
/ja/fortune             # Japanese version (planned)
```

## Development 开发

### Local Setup 本地设置

```bash
# Start Supabase locally
supabase start

# Start development server with local DB
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321 \
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key \
npm run dev
```

### Testing 测试

```bash
# Test temple systems API
curl http://localhost:3000/api/fortune/systems

# Test specific fortune slip
curl http://localhost:3000/api/fortune/slips/manmo/1
```

## Migration Guide 迁移指南

### From v0.x to v1.0

1. Update imports:
```typescript
// Old
import { useI18n } from '@/lib/i18n/useI18n';

// New  
import { useFortuneI18n } from '@/lib/modules/fortune';
```

2. Update component props:
```typescript
// Old
<TempleSystemSelector language="zh" />

// New - language auto-detected
<TempleSystemSelector />
```

3. Database migration:
```bash
supabase db push --include-all
```

## Contributing 贡献

### Adding New Temples 添加新庙宇

1. Insert temple data:
```sql
INSERT INTO temple_systems (
  temple_name, temple_code, location, deity, specialization, 
  total_slips, description, primary_color, secondary_color
) VALUES (
  '新庙宇', 'new_temple', '地址', '神祇', 
  ARRAY['专业1', '专业2'], 100, '介绍', '#color1', '#color2'
);
```

2. Add fortune slips:
```sql
INSERT INTO fortune_slips (
  temple_system_id, slip_number, title, content, 
  basic_interpretation, categories, fortune_level
) VALUES (
  temple_id, 1, '签文标题', '签文内容', 
  '基础解读', ARRAY['事业', '财运'], 'excellent'
);
```

### Translation Guidelines 翻译指南

- Keep fortune-specific terms in original language
- Translate UI elements and navigation
- Maintain cultural context in interpretations
- Use formal language for traditional content

## Support 支持

For questions and support:

- 📧 Email: support@astrozi.com
- 💬 Issues: GitHub Issues
- 📖 Docs: [Full Documentation](link)
- 🌟 Demo: [Live Demo](link)

## License 许可证

MIT License - see LICENSE file for details.

---

**Made with ❤️ by AstroZi Team**