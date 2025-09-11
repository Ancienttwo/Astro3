# Source Tree

## Project Structure Overview

```
Astro3/
├── app/                      # Next.js App Router pages and API routes
├── components/               # React components organized by feature
├── lib/                      # Utilities, services, and configurations
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definitions
├── contexts/                 # React Context providers
├── stores/                   # Zustand state stores
├── data/                     # Static data and constants
├── public/                   # Static assets
├── scripts/                  # Build and utility scripts
├── sql/                      # Database migrations and queries
├── supabase/                 # Supabase configuration
├── contracts/                # Smart contracts
├── deployment/               # Deployment configurations
├── docs/                     # Documentation
├── test-results/             # Test output files
├── web-bundles/              # Web bundle configurations
└── config files              # Root configuration files
```

## Core Directories

### `/app` - Application Routes
Next.js 15 App Router structure with file-based routing:

```
app/
├── api/                      # API routes
│   ├── auth/                 # Authentication endpoints
│   ├── user/                 # User management
│   ├── divination/           # Fortune telling APIs
│   ├── payment/              # Payment processing
│   ├── admin/                # Admin endpoints
│   └── health/               # Health check
├── auth/                     # Authentication pages
│   ├── login/
│   ├── register/
│   └── callback/
├── dashboard/                # User dashboard
├── bazi/                     # Bazi calculator
├── ziwei/                    # Ziwei astrology
├── guandi/                   # Guandi divination
├── profile/                  # User profile
├── settings/                 # Settings pages
├── admin/                    # Admin panel
└── [locale]/                 # Internationalized routes
```

### `/components` - UI Components
Feature-based component organization:

```
components/
├── ui/                       # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   └── ...
├── layout/                   # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Navigation.tsx
│   └── Sidebar.tsx
├── auth/                     # Authentication components
│   ├── LoginForm.tsx
│   ├── RegisterForm.tsx
│   └── WalletConnect.tsx
├── divination/               # Divination features
│   ├── BaziCalculator.tsx
│   ├── ZiweiChart.tsx
│   └── GuandiSlip.tsx
├── payment/                  # Payment components
│   ├── CheckoutForm.tsx
│   ├── PricingCard.tsx
│   └── SubscriptionManager.tsx
├── shared/                   # Shared components
│   ├── LanguageSelector.tsx
│   ├── ThemeToggle.tsx
│   └── LoadingSpinner.tsx
└── charts/                   # Chart visualizations
    ├── AstrologyChart.tsx
    └── StatisticsChart.tsx
```

### `/lib` - Core Libraries
Business logic and utilities:

```
lib/
├── supabase/                 # Supabase clients
│   ├── client.ts            # Browser client
│   ├── server.ts            # Server client
│   └── admin.ts             # Admin client
├── api/                      # API utilities
│   ├── fetcher.ts
│   ├── endpoints.ts
│   └── errors.ts
├── auth/                     # Auth utilities
│   ├── session.ts
│   ├── jwt.ts
│   └── permissions.ts
├── utils/                    # General utilities
│   ├── format.ts
│   ├── validation.ts
│   ├── date.ts
│   └── cn.ts                # Class name helper
├── astrology/                # Astrology calculations
│   ├── bazi.ts
│   ├── ziwei.ts
│   └── lunar.ts
├── payment/                  # Payment processing
│   ├── stripe.ts
│   └── credits.ts
├── email/                    # Email services
│   ├── templates.ts
│   └── sender.ts
├── web3/                     # Web3 utilities
│   ├── wallet.ts
│   ├── contracts.ts
│   └── chains.ts
└── redis/                    # Redis caching
    ├── client.ts
    └── cache.ts
```

### `/hooks` - Custom React Hooks
Reusable React hooks:

```
hooks/
├── useAuth.ts                # Authentication state
├── useUser.ts                # User data
├── useTranslation.ts         # i18n translations
├── useLocalStorage.ts        # Local storage
├── useDebounce.ts            # Debouncing
├── useAsync.ts               # Async operations
├── useMediaQuery.ts          # Responsive design
├── useWallet.ts              # Web3 wallet
├── useSupabase.ts            # Supabase client
└── useToast.ts               # Toast notifications
```

### `/types` - TypeScript Definitions
Type definitions and interfaces:

```
types/
├── user.ts                   # User types
├── auth.ts                   # Authentication types
├── divination.ts             # Divination types
├── payment.ts                # Payment types
├── api.ts                    # API response types
├── database.ts               # Database schema types
├── supabase.ts               # Generated Supabase types
├── ethereum.d.ts             # Web3 types
├── config.ts                 # Configuration types
└── global.d.ts               # Global type declarations
```

### `/contexts` - React Contexts
Global state providers:

```
contexts/
├── LanguageContext.tsx       # Language/i18n
├── SettingsContext.tsx       # User settings
├── PaidUserContext.tsx       # Subscription status
├── FateBookContext.tsx       # Fate book data
└── ThemeContext.tsx          # Theme settings
```

### `/stores` - Zustand Stores
Global state management:

```
stores/
├── userStore.ts              # User state
├── authStore.ts              # Auth state
├── divinationStore.ts        # Divination data
├── settingsStore.ts          # App settings
└── notificationStore.ts      # Notifications
```

### `/data` - Static Data
Constants and static content:

```
data/
├── guandi/                   # Guandi divination data
│   ├── slips.json
│   └── interpretations.json
├── astrology/                # Astrology data
│   ├── elements.json
│   └── stars.json
├── translations/             # i18n translations
│   ├── zh.json
│   ├── en.json
│   └── ja.json
└── constants/                # App constants
    ├── routes.ts
    └── config.ts
```

### `/scripts` - Utility Scripts
Build and maintenance scripts:

```
scripts/
├── deployment/               # Deployment scripts
│   ├── deploy.sh
│   └── env-setup.js
├── database/                 # Database scripts
│   ├── migrate.js
│   └── seed.js
├── build/                    # Build scripts
│   ├── analyze.js
│   └── optimize.js
└── maintenance/              # Maintenance scripts
    ├── cleanup.js
    └── backup.js
```

### `/sql` - Database Files
SQL migrations and queries:

```
sql/
├── migrations/               # Database migrations
│   ├── 001_initial.sql
│   ├── 002_add_users.sql
│   └── ...
├── functions/                # Database functions
│   ├── auth_functions.sql
│   └── credit_functions.sql
├── policies/                 # RLS policies
│   ├── user_policies.sql
│   └── admin_policies.sql
└── seed/                     # Seed data
    └── initial_data.sql
```

### `/contracts` - Smart Contracts
Blockchain smart contracts:

```
contracts/
├── AstroZiPointsSystem.sol   # Points system contract
├── interfaces/               # Contract interfaces
├── libraries/                # Shared libraries
├── deploy/                   # Deployment scripts
└── test/                     # Contract tests
```

### `/deployment` - Deployment Configs
Infrastructure and deployment:

```
deployment/
├── docker/                   # Docker configurations
│   ├── Dockerfile
│   └── docker-compose.yml
├── kubernetes/               # K8s manifests
├── vercel/                   # Vercel settings
└── nginx/                    # Nginx configs
```

### `/public` - Static Assets
Public files served directly:

```
public/
├── images/                   # Image assets
│   ├── logo.png
│   ├── icons/
│   └── backgrounds/
├── fonts/                    # Custom fonts
├── locales/                  # Translation files
├── manifest.json             # PWA manifest
└── robots.txt                # SEO robots file
```

## Configuration Files

### Root Level Configs
```
├── .env.example              # Environment variables template
├── .eslintrc.json            # ESLint configuration
├── .gitignore                # Git ignore rules
├── next.config.mjs           # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
├── pnpm-lock.yaml            # Lock file
├── hardhat.config.js         # Hardhat config
├── jest.config.js            # Jest testing config
├── vercel.json               # Vercel deployment
└── wrangler.toml             # Cloudflare Workers
```

## Special Directories

### `/artifacts` - Build Artifacts
Smart contract compilation outputs:
```
artifacts/
├── contracts/                # Compiled contracts
└── build-info/               # Build metadata
```

### `/test-results` - Test Outputs
Test execution results:
```
test-results/
├── coverage/                 # Code coverage reports
├── junit/                    # JUnit XML reports
└── screenshots/              # E2E test screenshots
```

### `/.bmad-core` - BMAD Framework
Business Model Agile Development framework:
```
.bmad-core/
├── agents/                   # AI agent definitions
├── tasks/                    # Task templates
├── templates/                # Document templates
├── checklists/               # QA checklists
└── workflows/                # Development workflows
```

## File Naming Conventions

### Components
- PascalCase: `ComponentName.tsx`
- Index files: `index.tsx` for barrel exports
- Tests: `ComponentName.test.tsx`

### Utilities
- camelCase: `utilityFunction.ts`
- Tests: `utilityFunction.test.ts`

### API Routes
- kebab-case directories: `api/user-profile/`
- route.ts for handlers

### Types
- PascalCase for interfaces: `UserProfile.ts`
- camelCase for type files: `apiTypes.ts`

## Import Aliases

Configured path aliases in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

Usage:
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils/format';
```

## Environment Structure

### Development
- `.env.local` - Local development variables
- Hot reload enabled
- Debug logging active

### Production
- Environment variables from hosting platform
- Optimized builds
- Error tracking enabled

### Testing
- `.env.test` - Test environment
- Mock services
- Test database

---

*Last Updated: 2024*
*Version: 1.0.0*