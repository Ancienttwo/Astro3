# AstroZi - 紫微八字AI平台

**AstroZi - AI Life Engineering**

基于Next.js构建的紫微斗数和八字命理AI分析平台。

## 功能特色

- 🔮 **四大AI大师**：用神大师、铁口直断大师、四化分析大师、紫微推理大师
- 🎯 **双系统分析**：紫微斗数 + 八字命理
- 📊 **命盘可视化**：交互式命盘图表
- 💳 **Stripe支付**：安全的在线支付系统
- 👥 **书签分类**：朋友、家人、客户、最爱、其他分类管理
- 🔐 **用户认证**：Supabase Auth + Bearer Token
- 📱 **响应式设计**：支持桌面端和移动端

## 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Supabase
- **数据库**: PostgreSQL (Supabase)
- **认证**: Supabase Auth
- **支付**: Stripe
- **部署**: Vercel

## RAG 文档

- 总览: `docs/RAG/README.md`
- 导入/切片: `docs/RAG/ingestion.md`
- 连接器: `docs/RAG/connectors.md`
- 运维维护: `docs/RAG/maintenance.md`
- API 参考: `docs/RAG/api.md`
- 故障排查: `docs/RAG/troubleshooting.md`

## Stripe支付配置

### 1. 环境变量设置

在 `.env.local` 中添加以下Stripe配置：

```bash
# Stripe 配置
STRIPE_SECRET_KEY=sk_test_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. 产品配置

系统已预配置以下产品和价格：

#### AI报告套餐
- **基础AI报告**: ¥3.3 (1次分析)
- **标准AI报告套餐**: ¥29.9 (10次分析) - 推荐
- **高级AI报告套餐**: ¥133.30 (50次分析)

#### 会员订阅
- **体验会员**: 免费试用
- **月度会员**: ¥66.6/月
- **半年会员**: ¥299.9/半年 - 推荐
- **年度会员**: ¥499.9/年

### 3. Webhook配置

在Stripe Dashboard中配置Webhook端点：

- **端点URL**: `https://your-domain.com/api/stripe-webhook`
- **监听事件**:
  - `checkout.session.completed`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `invoice.payment_succeeded`

### 4. 支付链接配置

系统使用Stripe Payment Links，在 `lib/stripe.ts` 中配置：

```typescript
export const STRIPE_CONFIG = {
  reports: {
    basic: {
      stripeUrl: 'https://buy.stripe.com/your-basic-link',
      // ...
    },
    standard: {
      stripeUrl: 'https://buy.stripe.com/your-standard-link',
      // ...
    },
    premium: {
      stripeUrl: 'https://buy.stripe.com/your-premium-link',
      // ...
    }
  },
  memberships: {
    // ... 会员配置
  }
}
```

### 5. 数据库表结构

确保Supabase中存在以下表：

```sql
-- 用户使用统计
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  paid_reports_purchased INTEGER DEFAULT 0,
  remaining_paid_reports INTEGER DEFAULT 0,
  free_reports_limit INTEGER DEFAULT 0,
  remaining_free_reports INTEGER DEFAULT 0,
  chatbot_limit INTEGER DEFAULT 0,
  remaining_chatbot_usage INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 购买历史
CREATE TABLE purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_type TEXT NOT NULL, -- 'ai_reports' | 'membership'
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'cny',
  payment_method TEXT DEFAULT 'stripe',
  transaction_id TEXT UNIQUE NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户会员信息
CREATE TABLE user_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  membership_type TEXT NOT NULL, -- 'trial' | 'monthly' | 'halfyear' | 'yearly'
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  payment_method TEXT DEFAULT 'stripe',
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 启动项目

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev:simple

# 访问应用
http://localhost:3007
```

## 支付流程

1. **用户选择产品** → 点击购买按钮
2. **跳转Stripe** → 安全支付页面
3. **完成支付** → Stripe发送webhook
4. **自动充值** → 系统自动更新用户额度
5. **立即使用** → 用户可以立即使用购买的服务

## 安全特性

- ✅ **Bearer Token认证** - 所有API使用统一认证
- ✅ **Stripe安全支付** - PCI DSS合规
- ✅ **Webhook验证** - 防止恶意请求
- ✅ **用户权限控制** - 基于角色的访问控制

## 开发团队

如需技术支持或商务合作，请联系开发团队。

## 项目结构

本项目已从monorepo架构拆解为单一项目结构：

```
astro2/
├── app/                 # Next.js App Router
├── components/          # React组件
├── contexts/           # React Context
├── hooks/              # 自定义Hooks
├── lib/                # 工具库和配置
├── public/             # 静态资源
├── styles/             # 样式文件
└── ...
```

## 技术栈

- **框架**: Next.js 14
- **UI库**: React 18 + Radix UI + Tailwind CSS
- **数据库**: Supabase
- **认证**: Supabase Auth (Bearer Token)
- **支付**: Stripe
- **包管理**: pnpm

## 开发

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev:simple
# 或
pnpm dev
```

服务器将在 http://localhost:3007 启动

### 构建生产版本

```bash
pnpm build
```

### 运行生产版本

```bash
pnpm start
```

## 环境变量

请确保设置以下环境变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## 认证方案

项目使用统一的Bearer Token认证：

### 前端
- 使用 `supabase.auth.getSession()` 获取session
- API调用时在Authorization头添加 `Bearer ${session.access_token}`

### 后端
- API路由通过 `request.headers.get('Authorization')` 获取token
- 使用 `supabaseAdmin.auth.getUser(token)` 验证token

## 主要功能

- 用户认证和授权
- 八字分析
- 紫微斗数分析
- 星座分析
- 会员系统
- 支付系统
- AI分析功能

## 开发说明

- 开发环境配置为宽松模式（跳过ESLint和TypeScript错误）
- 生产环境建议启用严格检查
- 使用pnpm作为包管理器

## 访问地址

Astro2: http://localhost:3007

## 包说明

### @ancienttwo/astro-core

核心算法包，提供：
- 八字排盘和分析
- 紫微斗数排盘
- 五行评分系统
- 十神系统
- 大运/流年计算

### @astro/shared

共享工具包，提供：
- 统一的认证 hooks (支持 Web2/Web3)
- API 常量定义
- 通用类型定义
- 业务逻辑工具函数

### @astro/ui

共享 UI 组件库，提供：
- 八字展示组件
- 紫微斗数盘面组件
- 通用 UI 组件
- Tailwind CSS 工具

## 版本管理

使用 [Changesets](https://github.com/changesets/changesets) 管理版本：

```bash
# 添加变更记录
pnpm changeset

# 更新版本
pnpm version-packages

# 发布包
pnpm release
```

## 部署

### Astro2 (Web2)

```bash
pnpm --filter astro2 build
# 部署到 Vercel/Netlify 等
```

## 开发规范

1. **代码风格**: 使用 Prettier 格式化代码
2. **提交规范**: 遵循 Conventional Commits
3. **类型安全**: 所有包都使用 TypeScript
4. **测试要求**: 核心算法包必须有测试覆盖

## 技术栈

- **Monorepo**: pnpm workspace + Turborepo
- **核心算法**: TypeScript
- **前端框架**: React 18 + Next.js 14
- **样式方案**: Tailwind CSS
- **构建工具**: tsup (包) + Next.js (应用)
- **测试框架**: Jest + React Testing Library

## 许可证

私有项目，版权所有。 

## 迁移策略

### 1. 初始复制
```bash
# 将现有 Astro2 整体复制到 apps/astro2
cp -r ../Astro2/* apps/astro2/
cp -r ../Astro2/.* apps/astro2/ 2>/dev/null || true

# 复制一份到 astro3 作为基础
cp -r apps/astro2/* apps/astro3/
cp -r apps/astro2/.* apps/astro3/ 2>/dev/null || true
```

### 2. 代码组织结构

```
astro-workspace/
├── apps/
│   ├── astro2/
│   │   ├── app/              # Next.js 应用目录
│   │   │   ├── GoogleLogin.tsx
│   │   │   ├── StripePayment.tsx
│   │   │   └── EmailSignup.tsx
│   │   └── lib/              # Astro2 专属逻辑
│   │       ├── supabase.ts
│   │       └── stripe.ts
│   └── astro3/
│       ├── app/              # Next.js 应用目录
│       ├── components/       # Astro3 专属组件
│       │   ├── WalletConnect.tsx
│       │   ├── CryptoPayment.tsx
│       │   └── ENSProfile.tsx
│       └── lib/              # Astro3 专属逻辑
│           ├── web3-provider.ts
│           └── crypto-payment.ts
└── ...配置文件
```

### 3. 共享与不共享的处理原则

#### 共享的内容（放在 packages/）
- **算法逻辑**：八字、紫微斗数计算 → `@ancienttwo/astro-core`
- **通用 UI 组件**：BaziCard、ZiweiChart → `@astro/ui`
- **业务逻辑**：分析类型、会员等级 → `@astro/shared`
- **工具函数**：日期处理、格式化 → `@astro/shared`

#### 不共享的内容（保留在各自 apps/）
- **认证系统**：
  - Astro2: Supabase Auth、Google OAuth
  - Astro3: WalletConnect、MetaMask
- **支付系统**：
  - Astro2: Stripe
  - Astro3: 加密货币支付
- **特定 UI**：
  - Astro2: 邮箱登录表单
  - Astro3: 钱包连接按钮

### 4. 实际迁移步骤

让我帮您开始迁移： 
