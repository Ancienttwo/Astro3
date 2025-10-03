# Dashboard Unification and Web3 Integration PRD

**Version**: 1.0
**Date**: 2025-10-03
**Author**: PM Agent (John)
**Project**: AstroZi International Dashboard Redesign

---

## Executive Summary

This PRD defines the requirements for unifying AstroZi's dashboard experience by consolidating scattered Web3 features into a single adaptive interface. The redesigned dashboard will showcase Web3 capabilities as progressive enhancement, targeting international users with a professional, desktop-first design inspired by modern SaaS platforms like Supabase.

**Key Objectives**:
- Consolidate 5+ separate Web3 routes into unified dashboard experience
- Increase wallet connection rate by 40% through clear value proposition
- Achieve <30 seconds to first meaningful interaction
- Deliver professional, data-focused UI with brand colors (Purple #3D0B5B + Yellow #FBCB0A)
- Support desktop-first layout (1280px+) with mobile responsive fallback

---

## 1. Project Analysis and Context

### 1.1 Existing Project Overview

#### Analysis Source
**IDE-based comprehensive analysis** - Project codebase thoroughly examined

#### Current Project State

**AstroZi** is a Chinese astrology platform (BaZi/Ziwei) with hybrid authentication (Privy unified auth supporting both email/social and wallet login).

**Current Architecture Reality**:
- **Frontend**: Next.js 14+ App Router, TypeScript, Tailwind CSS
- **Authentication**: **Privy unified provider** (supports email, Google, Twitter, Discord, GitHub, Apple, Wallet - all via single SDK)
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Deployment**: Vercel + Cloudflare CDN
- **I18n**: Route-based namespace loading (`i18n/loader.ts`) supporting en/ja/zh

**Dashboard Architecture Truth**:
- **Single Dashboard**: `/app/dashboard/page.tsx` - educational content only
- **No Web2/Web3 Split**: All users see identical dashboard
- **Web3 Conditional Rendering**: Auth context provides `isWalletConnected` boolean for conditional UI
- **Marketing Pages**: Language-specific landing pages (`/app/page.tsx`, `/app/en/page.tsx`) promote Web3 as upgrade

**Git Status Evidence**:
- ✅ I18n migration phases 4-6 completed (legacy `lib/i18n/*` deleted)
- ✅ New modular namespaces added (`user/membership`, `user/preferences`, `user/subscription`)
- ⚠️ `web3/*` namespaces exist but unused in current dashboard
- 🚧 Multiple auth routes modified (`app/api/auth/privy/route.ts`, `app/api/auth/login/route.ts`)

---

### 1.2 Available Documentation Analysis

**Document-project has NOT been run** - conducting fresh analysis.

#### Available Documentation
- ✅ **Tech Stack Documentation**: Partial (referenced in CLAUDE.md)
- ✅ **Source Tree/Architecture**: Partial (Next.js app router structure visible)
- ✅ **Coding Standards**: Defined (200-line limit, TypeScript enforcement, security guidelines)
- ❌ **API Documentation**: Not systematically documented
- ❌ **External API Documentation**: Not centralized
- ❌ **UX/UI Guidelines**: Not formally documented
- ❌ **Technical Debt Documentation**: Mentioned but not systematically tracked

**Recommendation**: While we can proceed with this PRD, running `document-project` afterward would create valuable maintenance documentation.

---

### 1.3 Enhancement Scope Definition

#### Enhancement Type
- ✅ **UI/UX Consolidation** (Primary issue: unclear Web3 value prop)
- ✅ **Feature Integration** (Web3 features exist in isolation, not integrated into main user flow)
- ✅ **I18n Optimization** (Clean up unused zh-CN, leverage new modular i18n)

#### Enhancement Description

**Redesign Dashboard to showcase Web3 features as progressive enhancement** rather than separate experience:

**Current State** (PROBLEM):
- Dashboard = static educational content (calendar, encyclopedia)
- Web3 features (daily check-in, points, tasks, leaderboard) exist as **separate routes** (`/web3-rewards`, `/web3-profile`, `/leaderboard`, `/tasks`)
- Users don't understand connection between "learning astrology" and "connecting wallet"
- Landing pages promote Web3 but dashboard doesn't deliver on promise

**Desired State** (SOLUTION):
- Dashboard becomes **personalized hub** showing:
  - **Non-wallet users**: Educational content + clear CTAs for "Connect wallet to unlock daily rewards"
  - **Wallet users**: Personalized astrology insights + Web3 features (check-in status, points balance, active tasks) inline
- Consolidate scattered Web3 routes into unified dashboard experience
- International i18n focus (en/ja/zh-TW)

#### Impact Assessment
- ✅ **Moderate-to-Significant Impact**
  - Dashboard redesign (significant)
  - Route consolidation (Web3 pages → dashboard sections)
  - Component refactoring (conditional rendering logic)
  - I18n namespace cleanup

---

### 1.4 Goals and Background Context

#### Goals
- **Consolidate user experience**: Reduce 5+ separate Web3 routes (`/web3-rewards`, `/web3-profile`, `/leaderboard`, `/tasks`, `/web3-dashboard`) into unified `/dashboard` with conditional sections
- **Increase wallet connection rate**: From current baseline to +40% within 30 days (clear value prop in dashboard)
- **Improve first-session engagement**: Achieve <30 seconds to first meaningful interaction (calendar/reading vs current static page)
- **Optimize i18n bundle**: Remove zh-CN overhead for international build, reduce i18n bundle by ~25%
- **Simplify codebase**: Eliminate 4-5 redundant route files, consolidate into dashboard sections
- **Clarify Web3 value**: Make daily rewards, points, tasks visible to non-wallet users with upgrade CTAs

#### Background Context
AstroZi currently suffers from architectural fragmentation stemming from incremental addition of Web3 features atop an existing Web2 foundation. International users encounter unclear value propositions, and the development team maintains effectively scattered features with duplicated logic.

With Web3 representing a core differentiator for international markets (>50% usage per user feedback) and a clear separation of user bases (international Web vs domestic Native), this is the optimal moment to rationalize the architecture. The recent i18n migration to a modern structure provides a clean foundation for this unification effort.

**User Insight**: Core value proposition is "了解、学习和尝试东方命理" (understand, learn, and try Eastern metaphysics). Dashboard should prioritize learning journey over transactional features.

---

### 1.5 Change Log

| Change | Date | Version | Description | Author |
|--------|------|---------|-------------|--------|
| Initial PRD | 2025-10-03 | v1.0 | Dashboard unification requirements | PM Agent (John) |

---

## 2. Requirements

### 2.1 Functional Requirements

**FR1**: Dashboard shall display **adaptive content sections** based on user authentication state:
- **Non-authenticated users**: Educational content (calendar, comparisons, encyclopedia) + prominent "Sign in to unlock features" CTAs
- **Email-only authenticated users**: Personalized greeting + saved charts access + "Connect wallet to unlock daily rewards" upgrade CTA
- **Wallet-connected users**: Full personalized hub with Web3 features (check-in status, points balance, active tasks, leaderboard rank) inline

**FR2**: Dashboard shall **consolidate existing Web3 routes** into unified sections:
- Absorb `/web3-rewards` → "Daily Rewards" dashboard card
- Absorb `/web3-profile` → User profile widget in dashboard header
- Absorb `/leaderboard` → "Leaderboard" collapsible section
- Absorb `/tasks` → "Active Tasks" dashboard section
- Maintain separate full-page routes for power users (e.g., `/tasks` for task management UI)

**FR3**: Dashboard shall display **real-time Web3 status indicators** for wallet users:
- Current points balance (pulled from Supabase)
- Daily check-in streak and status (checked in today: ✓ or CTA button)
- Active tasks count with completion progress
- Current leaderboard rank (top 10%, top 50%, etc.)

**FR4**: Dashboard shall implement **progressive disclosure** for Web3 features:
- Show placeholders/teasers to non-wallet users (e.g., "🔒 Connect wallet to see your rank")
- Animate unlock when user connects wallet (smooth transition from locked to active state)
- Provide contextual tooltips explaining Web3 benefits

**FR5**: Dashboard shall maintain **existing educational content** but reorganize:
- Collapsible sections (default expanded for new users, collapsed for returning users)
- Perpetual calendar (万年历) remains primary feature for all users
- Five Elements encyclopedia and Ziwei comparisons remain accessible

**FR6**: Dashboard shall integrate **language-specific routing**:
- Support `/en/dashboard`, `/ja/dashboard`, `/dashboard` (default zh)
- Load appropriate i18n namespaces: `common`, `navigation`, `pages`, `web3/dashboard`, `user/profile`
- Remove zh-CN fallback logic (international build only)

**FR7**: Dashboard shall provide **quick actions** prominently:
- "Create Chart" (Bazi/Ziwei) - primary CTA for new users
- "View My Charts" - for returning users with saved charts
- "Daily Check-in" - for wallet users (pulsing animation if not checked in today)
- "Explore Wiki" - secondary educational CTA

### 2.2 Non-Functional Requirements

**NFR1**: Dashboard shall **load critical content within 2 seconds** on 3G connections:
- Implement skeleton loading for Web3 data
- Cache static educational content (calendar data, encyclopedia)
- Lazy-load collapsible sections below fold

**NFR2**: Dashboard shall **maintain responsive design** across devices:
- Desktop-first layout (1280px+ optimized with 3-column layout)
- Tablet optimization (2-column grid for sections)
- Mobile functional (single column with bottom navigation)

**NFR3**: Dashboard shall **minimize client-side JavaScript bundle**:
- Code-split Web3 components (load only when `isWalletConnected === true`)
- Remove unused i18n namespaces (eliminate zh-CN for international build)
- Target <200KB initial bundle for dashboard route

**NFR4**: Dashboard shall **handle authentication state transitions gracefully**:
- No flash of unauthenticated content (FOUC) when user refreshes
- Smooth animation when wallet connects (avoid layout shift)
- Preserve scroll position when authentication state changes

**NFR5**: Dashboard shall **comply with existing security patterns**:
- Use Supabase RLS for all user data queries
- Validate wallet signatures for Web3 operations
- Never expose API keys or JWT tokens in client-side code

**NFR6**: Dashboard shall **support light mode as default**:
- Light mode primary design (white cards, gray backgrounds)
- Dark mode toggle available in sidebar footer
- Maintain brand colors: Purple (#3D0B5B) + Yellow (#FBCB0A)

### 2.3 Compatibility Requirements

**CR1: Authentication System Compatibility**
- Dashboard must work with existing PrivyAuthProvider without modifications
- Must respect `useAuth()` hook interface: `{ user, isAuthenticated, isWalletConnected, walletAddress, login, logout }`
- Must handle all Privy login methods (wallet, google, twitter, discord, github, apple) identically

**CR2: Existing Component Library Compatibility**
- Must use existing UI components from `@/components/ui/*` (card, button, alert, etc.)
- Must maintain existing layout patterns where applicable
- Must preserve existing icon system (lucide-react)

**CR3: I18n System Compatibility**
- Must use existing `i18n/loader.ts` namespace loading system
- Must support route-based locale detection (`/en/dashboard`, `/ja/dashboard`)
- Must maintain `useTranslations()` hook pattern from existing pages

**CR4: Data Schema Compatibility**
- Must work with existing Supabase `users` table schema (no breaking changes)
- Must respect existing points/credits/tasks table structure
- Must use existing API routes: `/api/auth/privy`, `/api/users/*`, `/api/web3/*`

**CR5: Routing Compatibility**
- Dashboard must remain at `/dashboard` (root) and `/[locale]/dashboard` (localized)
- Must not break existing direct navigation to `/charts`, `/bazi`, `/ziwei`, `/wiki`
- Web3 routes (`/web3-rewards`, `/tasks`, etc.) should redirect to `/dashboard` with section anchors (e.g., `/dashboard#rewards`)

---

## 3. User Interface Enhancement Goals

### 3.1 Integration with Existing UI

#### Design System - Brand Colors & Typography

**Color Palette** (Light Mode Primary):

```typescript
// Brand Colors (from CLAUDE.md)
--brand-primary: #3D0B5B;      // Deep Purple (主色调)
--brand-accent: #FBCB0A;       // Starlight Yellow (强调色)

// Light Mode Base (Supabase-inspired)
--background: #FFFFFF;          // Pure white main bg
--surface: #F8F9FA;            // Light gray for cards
--border: #E5E7EB;             // Soft gray borders
--text-primary: #1F2937;       // Near-black text
--text-secondary: #6B7280;     // Gray secondary text

// Five Elements (for data visualization)
--element-wood: #4CAF50;       // 木 - Green
--element-fire: #F44336;       // 火 - Red
--element-earth: #FF9800;      // 土 - Orange
--element-metal: #9E9E9E;      // 金 - Gray
--element-water: #2196F3;      // 水 - Blue

// UI States
--success: #4CAF50;            // Green (check-ins, success)
--warning: #FF9800;            // Orange (alerts)
--error: #F44336;              // Red (errors)
--info: #2196F3;               // Blue (informational)
```

**Typography** (Professional SaaS):
```css
--font-sans: 'Inter', -apple-system, system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

/* Hierarchy */
.heading-1: 600 32px/40px;     /* Page titles */
.heading-2: 600 24px/32px;     /* Section headers */
.heading-3: 600 18px/28px;     /* Card titles */
.body: 400 14px/20px;          /* Body text */
.caption: 400 12px/16px;       /* Labels, metadata */
```

**Component Patterns** (ShadCN + Brand Colors):
```tsx
// Card Component
<div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">

// Primary Button (Brand Accent)
<button className="bg-brand-accent hover:bg-yellow-500 text-brand-primary font-bold">

// Active Navigation (Brand Primary)
<a className="bg-purple-50 text-brand-primary">
```

---

### 3.2 Modified/New Screens and Views

#### Desktop Layout Structure (1280px+)

```
┌────────────────────────────────────────────────────────────┐
│ Top Header Bar (60px fixed)                                │
│ [Logo] [Search] ────────────────── [Wallet] [Profile] [⚙️] │
├────────┬───────────────────────────────────────────────────┤
│        │ Main Content Area                                 │
│ Side   │ ┌─────────────────────────────────────────────┐  │
│ Nav    │ │ Dashboard Header                            │  │
│ (64px  │ │ Hello, [Username] 👋                        │  │
│ or     │ │ [Quick Actions: Create Chart | View Charts] │  │
│ 240px) │ └─────────────────────────────────────────────┘  │
│        │                                                    │
│ 🏠     │ ┌────────────┬────────────┬────────────┬────────┐│
│ 📊     │ │ Points     │ Streak     │ Rank       │ Tasks  ││
│ 📚     │ │ 1,250 🪙   │ 7 days 🔥 │ #142 🏆   │ 3/12   ││
│ ✓      │ │ [Check In] │            │            │        ││
│ 🏆     │ └────────────┴────────────┴────────────┴────────┘│
│        │                                                    │
│ ────   │ ┌──────────────────────────────────────────┐    │
│ 🎁     │ │ 📋 Active Tasks (3/12)                   │    │
│ 🪙     │ │ • Complete BaZi reading ████░░ 80%       │    │
│ 💳     │ │ • Share on Twitter ░░░░░░ 0%             │    │
│        │ │ • Refer 3 friends ██░░░░ 33%             │    │
│ ────   │ │                      [View All Tasks →]   │    │
│ ⚙️     │ └──────────────────────────────────────────┘    │
│        │                                                    │
│        │ ┌──────────────────────────────────────────┐    │
│        │ │ 🏆 Leaderboard Top 5                     │    │
│        │ │ 1. alice.eth ──────────── 15,420 pts    │    │
│        │ │ 2. 0x5678...efgh ──────── 12,890 pts    │    │
│        │ │ 3. bob.eth ────────────── 10,230 pts    │    │
│        │ │ ...                                       │    │
│        │ │ 142. You ──────────────── 1,250 pts     │    │
│        │ └──────────────────────────────────────────┘    │
│        │                                                    │
│        │ [Collapsible: 📅 Perpetual Calendar]             │
│        │ [Collapsible: 🍃 Five Elements Encyclopedia]     │
└────────┴────────────────────────────────────────────────────┘
```

#### Collapsible Sidebar

**Two States**:
- **Collapsed (Default)**: 64px width - Logo icon + navigation icons only
- **Expanded**: 240px width - Full logo + icons + labels

**Features**:
- Click chevron button (←/→) to toggle state
- Hover tooltips show labels when collapsed
- Active item highlighted with purple background
- Badge shows notification count (e.g., Tasks: "3")
- Mobile: Becomes Sheet drawer (slide from left)
- State persists in localStorage

---

### 3.3 Component Specifications

#### 3.3.1 Collapsible Sidebar Component

```tsx
// components/dashboard/sidebar.tsx
interface SidebarProps {
  defaultCollapsed?: boolean;
}

// Features:
- Logo: Brand gradient (purple → yellow) in collapsed, full logo when expanded
- Navigation sections: Main (Home, Charts, Wiki, Tasks, Leaderboard)
- Web3 section: Rewards, Points History, Wallet Settings
- Toggle button: Chevron (absolute positioned at sidebar edge)
- Mobile: Use ShadCN Sheet component for drawer
- State: useState + localStorage persistence
```

#### 3.3.2 Metric Cards (4-column grid)

```tsx
// components/dashboard/web3-status-cards.tsx
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  chart?: React.ReactNode;  // Mini bar chart (7 days data)
  action?: React.ReactNode; // Check-in button
  color: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

// Four cards: Points, Streak, Rank, Tasks
// Each displays: icon, title, value, mini chart, optional action button
// Uses Five Elements colors for chart bars
// Responsive: 4-col (desktop) → 2-col (tablet) → 1-col (mobile)
```

#### 3.3.3 Tasks Preview Component

```tsx
// components/dashboard/tasks-preview.tsx
interface TasksPreviewProps {
  tasks: ActiveTask[];
  maxDisplay?: number; // default: 3
}

// Features:
- Card header with "View All →" link
- Task rows: title, progress bar, percentage, reward points
- Progress bar colors rotate through Five Elements
- Hover state: Row highlights
- Empty state: Friendly message
- Loading state: 3 skeleton rows
```

#### 3.3.4 Leaderboard Preview Component

```tsx
// components/dashboard/leaderboard-preview.tsx
interface LeaderboardPreviewProps {
  topUsers: LeaderboardUser[];
  currentUser: { rank: number; points: number } | null;
}

// Features:
- Shows top 5 users with medals (🥇🥈🥉)
- Current user row highlighted (purple/green background)
- Wallet addresses truncated: 0x1234...abcd
- Table format: Rank | Username | Points
- Refreshes every 5 minutes (cached)
```

---

### 3.4 Responsive Behavior

#### Breakpoints
```typescript
desktop:   1280px+       (default design, 4-col metrics, sidebar expanded option)
laptop:    1024-1279px   (4-col metrics, sidebar collapsed default)
tablet:    768-1023px    (2-col metrics, sidebar → hamburger)
mobile:    < 768px       (1-col stack, bottom navigation)
```

#### Mobile Adaptations (< 768px)

```
┌─────────────────────────────────┐
│ [☰] AstroZi     [🔔] [⚙️]      │ Top bar
├─────────────────────────────────┤
│ Dashboard                        │
│                                  │
│ ┌─────────────┬─────────────┐  │ 2-col grid
│ │ Points      │ Streak      │  │
│ │ 1,250       │ 7d [✓]     │  │
│ └─────────────┴─────────────┘  │
│                                  │
│ ┌─────────────┬─────────────┐  │
│ │ Rank        │ Tasks       │  │
│ │ #142        │ 3/12        │  │
│ └─────────────┴─────────────┘  │
├─────────────────────────────────┤
│ Active Tasks (collapsed)        │ Accordions
│ Leaderboard (collapsed)         │
├─────────────────────────────────┤
│ [🏠] [📊] [✓] [🏆] [⚙️]       │ Bottom nav
└─────────────────────────────────┘
```

**Mobile Optimizations**:
- Sidebar → Off-canvas drawer (Sheet component)
- Bottom navigation bar (sticky)
- Reduced padding: `p-3` instead of `p-4`
- Touch targets ≥44px (WCAG AAA)
- Swipe gestures supported

---

### 3.5 UI Consistency Requirements

#### Visual Consistency

**Card Design**:
```tsx
className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
```

**Button Hierarchy**:
```tsx
// Primary CTA (Check-in)
className="bg-brand-accent text-brand-primary font-bold"

// Secondary Action
className="bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"

// Active State (Sidebar nav)
className="bg-purple-50 text-brand-primary"
```

**Spacing System**:
- Card padding: `p-6` (desktop), `p-4` (mobile)
- Section gaps: `space-y-6` (desktop), `space-y-4` (mobile)
- Grid gaps: `gap-4` (consistent)

#### Animation Standards

```css
/* Sidebar expand/collapse */
transition: width 300ms ease-in-out;

/* Card hover */
transition: box-shadow 150ms ease-in-out;

/* Button press */
transition: all 100ms ease;
transform: scale(0.98) on active;

/* Progress bar */
transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Check-in Success Animation**:
- Confetti burst (lightweight library or CSS)
- Count-up animation for points/streak
- Green checkmark icon transition

---

## 4. Technical Constraints and Integration Requirements

### 4.1 Existing Technology Stack

#### Core Stack (Verified)

**Languages & Frameworks**:
- Next.js: 14.2.x (App Router)
- React: 18.3.x
- TypeScript: 5.x (strict mode)
- Node.js: 18.x+ (LTS)

**Styling**:
- Tailwind CSS: 3.4.x
- ShadCN UI: Latest
- Lucide React: Icon system

**Backend & Database**:
- Supabase PostgreSQL: 15.x
- Row Level Security (RLS) enforced
- Privy SDK: 0.x (unified auth)
- Wallet support: MetaMask, WalletConnect, Coinbase Wallet

**Deployment**:
- Platform: Vercel (serverless)
- CDN: Cloudflare (China acceleration)
- Network: BSC (Binance Smart Chain) - Chain ID 56

---

### 4.2 Integration Approach

#### 4.2.1 Database Integration

**Existing Tables** (DO NOT MODIFY SCHEMA):

```sql
-- users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  wallet_address TEXT UNIQUE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User stats (Web3 features)
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  points INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_check_in_date DATE,
  total_tasks_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks and user task completion
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  reward_points INTEGER DEFAULT 0,
  task_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  task_id UUID REFERENCES tasks(id),
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- Leaderboard (materialized view for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT
  u.id,
  u.username,
  u.wallet_address,
  us.points,
  ROW_NUMBER() OVER (ORDER BY us.points DESC) as rank
FROM users u
JOIN user_stats us ON u.id = us.user_id
WHERE us.points > 0
ORDER BY us.points DESC;
```

**Query Strategy**:
```typescript
// Parallel queries for performance
const [statsResult, tasksResult, rankResult] = await Promise.all([
  supabase.from('user_stats').select('*').eq('user_id', userId).single(),
  supabase.from('user_tasks').select('*, task:tasks(*)').eq('user_id', userId).limit(3),
  supabase.rpc('get_user_rank', { user_id: userId })
]);
```

#### 4.2.2 API Integration

**Existing API Routes** (DO NOT MODIFY):
```typescript
POST /api/auth/privy          // Privy token verification
POST /api/auth/login          // Email/password login
POST /api/web3/check-in       // Daily check-in
GET  /api/web3/leaderboard    // Leaderboard data
POST /api/web3/tasks/complete // Complete task
```

**New API Routes Required**:
```typescript
// Dashboard aggregation endpoint
GET /api/dashboard/data?userId={id}
  Returns: { stats, tasks, rank, recentCharts }
  Purpose: Reduce client-side query waterfall

// Mini chart data
GET /api/dashboard/charts/points?userId={id}&days=7
  Returns: Array of daily point values
  Purpose: Metric card mini charts
```

#### 4.2.3 Frontend Integration

**Component Organization**:
```
app/dashboard/
├── page.tsx                    // Main dashboard
├── layout.tsx                  // Dashboard layout
└── loading.tsx                 // Loading skeleton

components/dashboard/
├── sidebar.tsx                 // Collapsible sidebar
├── web3-status-cards.tsx       // 4-col metrics
├── tasks-preview.tsx           // Tasks list
├── leaderboard-preview.tsx     // Leaderboard
├── metric-card.tsx             // Reusable card
├── mini-bar-chart.tsx          // Chart visualization
└── empty-states.tsx            // Non-auth states

lib/hooks/
├── use-dashboard-data.ts       // SWR data hook
├── use-check-in.ts             // Check-in mutation
└── use-sidebar-state.ts        // Sidebar state
```

**State Management** (SWR):
```typescript
import useSWR from 'swr';

export function useDashboardData(userId: string | null) {
  const { data, error, mutate } = useSWR(
    userId ? `/api/dashboard/data?userId=${userId}` : null,
    fetcher,
    {
      refreshInterval: 60000,  // 1 minute
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return { dashboard: data, isLoading: !error && !data, isError: error, refresh: mutate };
}
```

---

### 4.3 Code Organization and Standards

#### File Structure Standards

**Component File Template**:
```typescript
'use client'; // Only if interactive

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  color?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
}

export function MetricCard({ icon, title, value, color = 'metal' }: MetricCardProps) {
  // Implementation
}
```

**File Size Constraints** (CRITICAL from CLAUDE.md):
- Maximum 200 lines per file
- Split into sub-components if exceeds limit
- Extract utility functions to separate files

**Naming Conventions**:
- Components: PascalCase (`DashboardSidebar`)
- Functions: camelCase (`fetchDashboardData`)
- Files: kebab-case (`dashboard-sidebar.tsx`)
- CSS: Tailwind utility classes with `cn()` helper

**TypeScript Standards**:
```typescript
// NEVER use 'any' type (forbidden)
// Always provide explicit types
export interface DashboardData {
  stats: UserStats;
  tasks: ActiveTask[];
  rank: LeaderboardRank;
}
```

---

### 4.4 Deployment and Operations

#### Build Configuration

```javascript
// next.config.js (existing - minimal changes)
module.exports = {
  images: {
    domains: ['fbtumedqykpgichytumn.supabase.co'],
  },
  i18n: {
    locales: ['en', 'ja', 'zh'],
    defaultLocale: 'en',
  },
};
```

**Environment Variables**:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fbtumedqykpgichytumn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_PRIVY_APP_ID=...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

#### Monitoring and Logging

```typescript
// Error tracking
export function logDashboardError(error: Error, context: any) {
  console.error('[Dashboard Error]', {
    message: error.message,
    context,
    timestamp: new Date().toISOString(),
  });
}

// Performance tracking
export function trackDashboardLoad(duration: number) {
  performance.mark('dashboard-loaded');
  console.log('[Perf] Dashboard load:', duration, 'ms');
}
```

#### Configuration Management

```typescript
// lib/config.ts
export const DASHBOARD_CONFIG = {
  enableWeb3Features: true,
  enableMiniCharts: true,
  enableRealtimeUpdates: false, // Phase 2

  leaderboardCacheDuration: 5 * 60 * 1000,
  dashboardRefreshInterval: 60 * 1000,

  sidebarDefaultCollapsed: true,
  tasksPreviewLimit: 3,
  leaderboardPreviewLimit: 5,
};
```

---

### 4.5 Risk Assessment and Mitigation

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
| **Database Query Performance** | Medium | High | 1. Materialized views for leaderboard<br>2. Indexed queries<br>3. Result caching (5 min) |
| **API Response Time** | Medium | Medium | 1. Aggregation API (single call)<br>2. Parallel query execution<br>3. CDN caching |
| **Component Bundle Size** | Medium | Low | 1. Code-split Web3 components<br>2. Lazy load below-fold<br>3. Dynamic imports |
| **Wallet Connection Stability** | Medium | High | 1. Retry logic<br>2. localStorage fallback<br>3. Clear error messages |
| **Schema Changes** | Low | High | 1. Type-safe queries<br>2. Zero-downtime migrations<br>3. Feature flags |

**Deployment Risk Mitigation**:
- Blue-green deployment strategy
- Gradual rollout: 5% → 25% → 50% → 100%
- Feature flags for quick rollback
- Staging environment testing

---

## 5. Epic and Story Structure

### 5.1 Epic Approach

**Epic Structure Decision**: Single comprehensive epic with sequential story delivery

**Rationale**:
- Unified dashboard consolidation (single cohesive feature)
- Clear story dependencies (auth → data → UI → polish)
- Better progress tracking and risk management
- Brownfield enhancement requires careful integration testing

---

### 5.2 Epic: Dashboard Unification and Web3 Integration

**Epic Goal**: Transform the static educational dashboard into a personalized, adaptive hub that showcases Web3 features as progressive enhancement, increasing wallet connection rates by 40% and improving first-session engagement to <30 seconds.

**Epic Duration**: 4-5 weeks (10 stories)

**Integration Requirements**:
- Maintain existing authentication flow (Privy + Supabase)
- Preserve current educational content (calendar, encyclopedia)
- Support all existing i18n locales (en/ja/zh-TW)
- No breaking changes to existing routes

---

### 5.3 Story Breakdown

#### **Story 1.1: Foundation - Collapsible Sidebar Component**

**As a** user,
**I want** a collapsible sidebar navigation,
**so that** I can maximize content viewing area while maintaining easy access to all features.

**Acceptance Criteria**:
1. Sidebar defaults to collapsed state (64px width, icons only)
2. Click chevron button toggles between collapsed (64px) and expanded (240px)
3. Transition animation is smooth (300ms ease-in-out)
4. Logo displays appropriately in both states (icon only vs full logo + text)
5. Active nav item shows purple highlight (`bg-purple-50 text-brand-primary`)
6. Badge displays notification count (e.g., Tasks: "3")
7. Mobile view: Sidebar becomes Sheet drawer (slide from left)
8. Sidebar state persists in localStorage
9. All nav items have keyboard accessibility (Tab navigation)
10. Hover tooltips show labels in collapsed state

**Integration Verification**:
- IV1: Existing header navigation still renders correctly
- IV2: Navigation links route to correct pages (no broken links)
- IV3: Mobile responsive behavior works on iPhone/Android
- IV4: Brand colors (#3D0B5B, #FBCB0A) applied correctly

---

#### **Story 1.2: Data Layer - Dashboard API Aggregation**

**As a** dashboard page,
**I want** a single API endpoint to fetch all required data,
**so that** initial load time is minimized and user experience is fast.

**Acceptance Criteria**:
1. New API route: `GET /api/dashboard/data?userId={id}`
2. Returns aggregated data: `{ stats, tasks, rank, recentCharts }`
3. Executes database queries in parallel (Promise.all)
4. Response time <300ms for typical user data
5. Handles missing user gracefully (returns null/defaults)
6. Includes proper error handling with status codes
7. Respects existing RLS policies (no data leaks)
8. Caches leaderboard data for 5 minutes (materialized view)
9. Returns mini chart data (last 7 days points/streak)
10. Works with existing Privy auth headers

**Integration Verification**:
- IV1: Existing `/api/web3/*` routes still function independently
- IV2: Supabase connection pool not exhausted
- IV3: API responds correctly for users with/without wallet
- IV4: TypeScript types match frontend expectations

---

#### **Story 1.3: UI Foundation - Metric Cards Grid**

**As a** wallet-connected user,
**I want** to see my Web3 stats at a glance,
**so that** I understand my progress and engagement level.

**Acceptance Criteria**:
1. 4-column grid layout on desktop (responsive to 2-col on tablet, 1-col mobile)
2. Four metric cards: Points, Streak, Rank, Tasks
3. Each card displays: icon, title, main value, subtitle, mini bar chart
4. Points card shows current balance + today's gain
5. Streak card includes "Check In" button (enabled if not checked in today)
6. Rank card shows rank number + percentile (e.g., "Top 15%")
7. Tasks card shows completion ratio (e.g., "3/12 Active")
8. Mini bar charts use last 7 days data (Five Elements colors)
9. Loading state: Skeleton placeholders while fetching
10. Error state: Friendly message with retry button

**Integration Verification**:
- IV1: Cards render correctly with real Supabase data
- IV2: Responsive layout works on all breakpoints
- IV3: Five Elements colors applied (wood/fire/earth/metal/water)
- IV4: Check-in button calls existing `/api/web3/check-in` endpoint

---

#### **Story 1.4: Tasks Preview Section**

**As a** user,
**I want** to see my active tasks on the dashboard,
**so that** I know what actions I can take to earn points.

**Acceptance Criteria**:
1. Card displays "Active Tasks" header with "View All →" link
2. Shows up to 3 active tasks (highest reward first)
3. Each task row displays: title, progress bar, percentage, reward points
4. Progress bar uses appropriate element color (rotating five elements)
5. Clicking "View All" navigates to `/tasks` page
6. Clicking task row navigates to task detail (if applicable)
7. Empty state: "No active tasks. Check back tomorrow!" message
8. Loading state: 3 skeleton rows
9. Hover state: Row highlights with `bg-gray-50`
10. Mobile: Task rows stack properly, text truncates with ellipsis

**Integration Verification**:
- IV1: Task data loads from existing `user_tasks` table
- IV2: Progress values match actual completion status
- IV3: Reward points display matches task configuration
- IV4: Navigation to `/tasks` preserves existing task management UI

---

#### **Story 1.5: Leaderboard Preview Section**

**As a** competitive user,
**I want** to see where I rank compared to others,
**so that** I'm motivated to increase my engagement.

**Acceptance Criteria**:
1. Card displays "Leaderboard" header
2. Shows top 5 users with medals (🥇🥈🥉 for top 3)
3. Displays: rank, username/address, points (formatted with commas)
4. Current user row is highlighted (`bg-green-50` or `bg-purple-50`)
5. Wallet addresses truncated: `0x1234...abcd`
6. If user has username, display instead of address
7. User's rank shown even if not in top 5 (e.g., "142. You - 1,250 pts")
8. Clicking "View Full Leaderboard" navigates to `/leaderboard`
9. Loading state: 5 skeleton rows
10. Refreshes every 5 minutes automatically

**Integration Verification**:
- IV1: Leaderboard data loads from materialized view
- IV2: Rank calculation is accurate
- IV3: Current user identification works via Privy context
- IV4: Query executes in <100ms

---

#### **Story 1.6: Adaptive Content States (Anonymous/Email/Wallet)**

**As a** product owner,
**I want** the dashboard to show appropriate content based on user authentication state,
**so that** we maximize conversion at each tier (sign-up → wallet connection).

**Acceptance Criteria**:
1. **Anonymous users** see: Hero CTA, perpetual calendar, educational content, Web3 teaser (locked)
2. **Email users** see: Welcome message, saved charts, Web3 upgrade CTA, educational content
3. **Wallet users** see: Web3 status cards, tasks, leaderboard, quick actions, collapsible educational content
4. State detection uses `useAuth()` hook: `{ isAuthenticated, isWalletConnected }`
5. Transitions between states are smooth (no flash of wrong content)
6. CTAs use brand colors: `bg-brand-accent` with `text-brand-primary`
7. Web3 teaser shows locked icons with "Connect wallet to unlock" message
8. Educational sections collapse by default for wallet users
9. All states are mobile responsive
10. Loading state shows appropriate skeleton for detected state

**Integration Verification**:
- IV1: Authentication state correctly detected from PrivyContext
- IV2: No server-side data fetches for anonymous users
- IV3: CTAs navigate to correct auth flows
- IV4: State transitions preserve scroll position

---

#### **Story 1.7: Check-in Flow with Optimistic Updates**

**As a** wallet user,
**I want** to check in daily and see immediate feedback,
**so that** I feel rewarded and motivated to return tomorrow.

**Acceptance Criteria**:
1. Check-in button displays prominently in Streak metric card
2. Button states: "Check In Now +10pts" (enabled) or "✓ Checked In" (disabled)
3. Clicking button triggers optimistic UI update (streak +1, points +10)
4. Success animation: Confetti burst + green checkmark
5. Toast notification: "Checked in! +10 points. Come back tomorrow!"
6. Button becomes disabled with green checkmark icon
7. If API fails, UI rolls back and shows error toast
8. Streak calculation respects time zones (user's local date)
9. Consecutive day logic: If missed yesterday, streak resets to 1
10. Analytics event fired: `dashboard_checkin_completed`

**Integration Verification**:
- IV1: Check-in API uses existing `/api/web3/check-in` endpoint
- IV2: Database updates correctly: `last_check_in_date`, `streak_days`, `points`
- IV3: Optimistic update matches backend response
- IV4: Network failures don't corrupt local state

---

#### **Story 1.8: I18n Integration (en/ja/zh-TW)**

**As an** international user,
**I want** the dashboard in my preferred language,
**so that** I can understand features and engage comfortably.

**Acceptance Criteria**:
1. Dashboard supports 3 locales: English (en), Japanese (ja), Traditional Chinese (zh-TW)
2. All static text uses i18n keys: `t('dashboard.welcome')`, etc.
3. Number formatting respects locale: `1,250` with proper separators
4. Date formatting respects locale: "Jan 15" vs "1月15日"
5. Navigation labels translate correctly in sidebar
6. Metric card titles, tooltips, and CTAs translated
7. Task titles remain in original language (user-generated content)
8. Empty state messages translated
9. Error messages translated
10. Route-based locale detection: `/dashboard`, `/ja/dashboard`, `/zh/dashboard`

**Integration Verification**:
- IV1: New namespace `dashboard` added to `i18n/loader.ts`
- IV2: Translation files created for all locales
- IV3: Existing i18n system functions without breaking
- IV4: Language switcher updates dashboard text correctly

---

#### **Story 1.9: Performance Optimization and Loading States**

**As a** user,
**I want** the dashboard to load quickly,
**so that** I don't wait and can immediately engage with content.

**Acceptance Criteria**:
1. Initial dashboard load: <2s on 3G connection (target: <1.5s)
2. Skeleton loading states for all async data sections
3. Above-fold content renders within 800ms (LCP)
4. Code-split Web3 components (only load for wallet users)
5. Educational content lazy-loaded below fold
6. Mini chart images optimized (<5KB each)
7. API response cached client-side (5 min leaderboard, 1 min stats)
8. Prefetch dashboard data on auth state change
9. No layout shift during data load (CLS <0.1)
10. Bundle size: Dashboard route <200KB (gzipped)

**Integration Verification**:
- IV1: Lighthouse score: Performance >90, Accessibility >95
- IV2: Real User Monitoring: P75 load time <2s
- IV3: No console errors or warnings in production
- IV4: Network tab shows efficient API calls

---

#### **Story 1.10: Mobile Responsive and Polish**

**As a** mobile user,
**I want** the dashboard to work seamlessly on my phone,
**so that** I can check in and engage while on the go.

**Acceptance Criteria**:
1. Sidebar collapses to hamburger menu + bottom navigation on mobile (<768px)
2. Metric cards stack 2x2 grid on mobile (not 4-col)
3. All touch targets ≥44px (WCAG 2.1 AAA)
4. Swipe gestures: Swipe right opens sidebar drawer
5. Bottom nav shows: Home, Charts, Tasks, Leaderboard, Settings icons
6. Active bottom nav icon highlighted with brand color
7. Modal/drawer components use proper mobile UX (sheet from bottom)
8. Text remains legible (min 14px font size)
9. No horizontal scroll on any screen size (320px - 428px tested)
10. Check-in button easily tappable (full-width on mobile)

**Integration Verification**:
- IV1: Tested on iOS Safari (iPhone 12+)
- IV2: Tested on Android Chrome (Samsung, Pixel)
- IV3: Tablet layouts work correctly (iPad, Android tablets)
- IV4: Landscape orientation handled gracefully

---

### 5.4 Story Sequencing and Dependencies

```
Story Dependency Graph:

1.1 (Sidebar) ──────┐
                    ├──> 1.6 (Adaptive States) ──┐
1.2 (API) ──────────┤                             ├──> 1.7 (Check-in)
                    ├──> 1.3 (Metric Cards) ──────┤
1.8 (I18n) ─────────┤                             ├──> 1.9 (Performance)
                    ├──> 1.4 (Tasks) ─────────────┤
                    └──> 1.5 (Leaderboard) ───────┘
                                                   └──> 1.10 (Mobile)

Parallel Development Opportunities:
- Stories 1.1, 1.2, 1.8 can start simultaneously (independent)
- Stories 1.3, 1.4, 1.5 can start after 1.2 completes (data layer ready)
- Story 1.6 needs 1.1, 1.3, 1.4, 1.5 complete (integrates all UI)
- Stories 1.7, 1.9, 1.10 are polish/optimization (after core features)
```

**Recommended Sprint Planning** (2-week sprints):

- **Sprint 1**: Foundation (Stories 1.1, 1.2, 1.8)
- **Sprint 2**: Core UI (Stories 1.3, 1.4, 1.5, 1.6)
- **Sprint 3**: Polish & Optimization (Stories 1.7, 1.9, 1.10)

---

### 5.5 Definition of Done (Epic Level)

The epic is considered complete when:

✅ All 10 stories pass acceptance criteria
✅ Integration verification tests pass for each story
✅ Dashboard loads in <2s on 3G connection
✅ Wallet connection rate increases by ≥30% (target: 40%)
✅ First-session engagement <30s to first interaction
✅ Zero critical bugs in production
✅ Mobile responsive on iOS and Android
✅ All three locales (en/ja/zh-TW) fully translated
✅ Code review completed by senior developer
✅ Documentation updated (README, component docs)

---

## Appendix

### A. Success Metrics

**Primary Metrics**:
- Wallet connection rate: Baseline → +40% (30 days post-launch)
- First meaningful interaction: <30 seconds
- Dashboard load time: <2 seconds (P75)
- Daily active users (DAU): +25% increase

**Secondary Metrics**:
- Daily check-in rate: >60% of wallet users
- Task completion rate: >40% of active tasks
- Page views per session: +30% increase
- Mobile engagement: >50% of total dashboard visits

### B. Rollout Plan

**Phase 1** (Week 1): Internal testing
- Deploy to staging environment
- QA testing on all devices
- Performance benchmarking

**Phase 2** (Week 2): Beta release
- Enable for 5% of users (feature flag)
- Monitor error rates and performance
- Gather user feedback

**Phase 3** (Week 3-4): Gradual rollout
- 5% → 25% → 50% → 100%
- A/B testing: New dashboard vs old
- Measure success metrics

**Phase 4** (Week 5): Full release
- 100% rollout
- Deprecate old Web3 routes
- Update documentation

### C. Rollback Plan

**Triggers**:
- Error rate >5%
- Load time >5s (P95)
- User complaints >10% of sessions
- Critical bug discovered

**Rollback Process**:
1. Disable feature flag (revert to old dashboard)
2. Investigate root cause
3. Deploy hotfix to staging
4. Re-test and gradual re-rollout

---

**End of PRD**

*This document defines the complete requirements for Dashboard Unification and Web3 Integration. For implementation details, refer to individual story descriptions and technical specifications.*
