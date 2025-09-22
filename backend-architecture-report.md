# Backend Architecture Report

## Current State Overview

- Backend endpoints are implemented primarily through Next.js App Router handlers under `app/api/*`, where each `route.ts` directly handles authentication, business logic, and Supabase queries (e.g. `app/api/tasks/route.ts`).
- Infrastructure helpers live in `lib/`, including multiple Supabase client wrappers (`lib/supabase.ts`, `lib/supabase-optimized.ts`, `lib/database-pool.ts`), Redis/edge utilities (`lib/edge/*`), and partially adopted service/module scaffolding (`lib/modules/fortune/*`).
- Supabase Edge Functions (`supabase/functions/*`) and SQL scripts (`sql/*`) exist but are loosely integrated with the API layer.
- New `app/api/v2/*` routes act as proxy gateways (edge caching, rate limiting) but still forward to legacy APIs, duplicating routing concerns.
- Frontend `services/*` modules consume these APIs directly, exposing the lack of a stable domain service layer on the backend.

## Key Issues

1. **Tight Coupling in Route Handlers**: Authentication, validation, business rules, and persistence are intertwined within individual `app/api` routes, preventing reuse and testability.
2. **Fragmented Supabase Client Management**: Multiple client configurations with overlapping responsibilities (some using `NEXT_PUBLIC` vars server-side) create security risks and inconsistent behavior.
3. **Unrealized Domain Layer**: `lib/services` and `lib/modules` contain partially defined classes/types but are not used by API routes; logic duplication persists.
4. **Inconsistent Authentication Flows**: Routes mix Supabase sessions, custom JWTs, and Web3 headers without centralized guards or policy enforcement.
5. **Lack of Request Validation & Error Strategy**: Payloads are taken directly from `request.json()` with minimal schema validation; error responses rely on ad-hoc `console` logging.
6. **Duplicated Gateway Layer**: `app/api/v2` proxies add caching/rate limiting but replicate routing and configuration rather than extending a shared service layer.
7. **Observability Gaps**: Monitoring helpers exist (`lib/monitoring`, DB metrics) but are unused; no unified metrics, tracing, or slow query tracking pipeline.
8. **Background Work Execution**: Long-running AI/analysis tasks run inside request handlers instead of queued workers, risking timeouts and resource contention.

## Recommended Target Architecture

- **Layered Structure**: Adopt a Route → Controller → Service → Repository pattern. Keep Next.js routes thin, offloading domain logic to reusable service modules.
- **Unified Supabase Factory**: Create `lib/server/db/client.ts` exporting admin/readonly/anon clients with consistent config; deprecate redundant wrappers (`supabase-optimized`, `database-pool`, inline clients).
- **Domain Modules**: For core domains (tasks, fortune, analysis, auth), establish dedicated folders (e.g., `lib/server/tasks/{service,repository,schema}.ts`) with clear interfaces and tests.
- **Centralized Auth Middleware**: Implement shared guard utilities handling Supabase sessions, custom JWT, and Web3 headers with consistent error handling and role enforcement.
- **Schema Validation Pipeline**: Use Zod/Yup to validate request payloads/query params, standardize error responses and logging.
- **Refined Gateway Strategy**: Either fully integrate proxy functionality into the new service layer or sunset redundant `v2` proxies after migration.
- **Observability & Governance**: Wire existing monitoring utilities to emit structured logs/metrics, add slow-query reporting, and integrate with existing logging stack.
- **Async Processing**: Move heavy operations (AI analysis, report generation) to queues/edge functions, with REST endpoints acting as orchestrators.

## Immediate Opportunities

1. Pilot the layered architecture on a high-traffic route (`app/api/tasks`).
2. Consolidate Supabase client usage and remove deprecated wrappers.
3. Define domain services for task management, fortune slips, and AI analyses with comprehensive tests.

## Supabase Client Migration Status (2025-02)

- **Completed**
  - Created unified factory `lib/server/db/client.ts` exposing `getSupabase{Anon,Admin,Readonly}Client` helpers.
  - Migrated high-traffic routes to the new admin client: `app/api/tasks/route.ts`, `app/api/tasks/complete/route.ts`, `app/api/analysis-stream/[taskId]/route.ts`, `app/api/analysis-tasks/*`, `app/api/async-analysis/*`, `app/api/analysis-guard/route.ts`, `app/api/ai-analyses/[id]/route.ts`, `app/api/bazi-analysis/route.ts`, `app/api/en-bazi-analysis/route.ts`, `app/api/ziwei-analysis/route.ts`, `app/api/stripe-webhook/route.ts`.
  - Converted points and balance endpoints to the factory (`app/api/points/{web2,web3,my-rank,leaderboard,shop}`, `app/api/user-balance/route.ts`, `app/api/consume-report-unified/route.ts`) and updated multilingual fortune routes (`app/api/fortune/test-multilingual`, `app/api/fortune/multilingual`, `app/api/fortune/v2/random`, `app/api/fortune/v2/slips/...`).
  - Migrated translations suite, notifications, chat history, important events, profile update, mutual-aid tools, AI fortune endpoints, airdrop flows, WeChat integrations, paid reports, cleanup utilities, and conversations (`app/api/translations/**`, `app/api/notifications/route.ts`, `app/api/chat-history/route.ts`, `app/api/important-events/route.ts`, `app/api/update-profile/route.ts`, `app/api/mutual-aid/**`, `app/api/fortune/**`, `app/api/airdrop/**`, `app/api/wechat/**`, `app/api/paid-reports/route.ts`, `app/api/clear-*`, `app/api/admin/points/export/route.ts`, `app/api/conversations/route.ts`) onto the unified clients.
- **In progress**
-  - Decide per-route client variant (admin vs readonly) based on RLS requirements and write semantics.
- **Pending follow-up**
  - Deprecate legacy wrappers (`lib/supabase.ts`, `lib/supabase-optimized.ts`, `lib/database-pool.ts`) once call-sites are migrated.
  - Introduce lint rule or codemod guard preventing new imports from `@/lib/supabase` under `app/api`.
  - Add regression tests or smoke scripts covering migrated endpoints (TypeScript build currently exceeds local memory; capture mitigation plan before enabling CI gate).
- **Documentation alignment**
  - Updated `docs/architecture/tech-stack.md` and `docs/architecture/source-tree.md` to describe the new server-side Supabase factory and refreshed `lib/` layout.

### Post-migration clean-up priorities
- **Legacy wrappers**: plan removal/refactor of `lib/supabase.ts`, `lib/supabase-optimized.ts`, and `lib/database-pool.ts` once dependent modules are reworked.
- **Client usage audit**: review new admin/readonly clients per domain and tighten usage (e.g., points with transactional guards, fortune read paths using readonly helper).
- **Service extraction**: identify top domains (points, fortune, mutual-aid) for service/repository layering now that client access is centralized.

### Legacy wrapper usage assessment (2025-09-22)
- **Server/client hybrid modules still importing `@/lib/supabase`**: `lib/unified-auth.ts`, `lib/auth.ts`, `lib/api-client.ts`, `lib/i18n/enhanced-language-manager.ts`. *Action*: split client/server responsibilities or wrap new helpers so server paths avoid direct `@/lib/supabase` usage.
- **Browser-facing helpers/components**: hooks and UI modules under `components/` and `hooks/` legitimately use `@/lib/supabase` for client auth/session management. *Action*: keep `lib/supabase.ts` as browser client factory but document it as client-only, removing `supabaseAdmin` export once server refactors land.
- **`lib/supabase/server.ts`**: reworked to delegate to `lib/server/db` helpers (anon/admin). Evaluate whether any consumers remain before deprecating.
- **`lib/database-pool.ts` & `lib/supabase-optimized.ts`**: no longer referenced by API routes; evaluate whether any remaining usage justifies retaining them or migrate metrics/pooling logic into the new factory before deletion.
- **Documentation/Code hygiene**: after refactors, add lint rule or codemod to block new `@/lib/supabase` imports in server directories and update developer docs accordingly.

### Verification & tooling strategy (2025-09-22)
- **TypeScript stability**: update package scripts/CI to run `NODE_OPTIONS="--max-old-space-size=4096" pnpm exec tsc --noEmit` so the compiler no longer OOMs; add README note for local devs.
- **API smoke tests**: create a lightweight script (e.g. `pnpm smoke:api`) hitting critical endpoints (`/api/tasks`, `/api/points/*`, `/api/fortune/*`, `/api/async-analysis`) with mock tokens to ensure unified client wiring stays healthy.
- **Lint guard**: configure ESLint (or custom lint rule) to forbid `@/lib/supabase` imports under `app/api/**` and `lib/server/**`, steering developers toward `lib/server/db` helpers.
- **Automated diff check**: optional pre-commit hook/codemod to rewrite accidental `@/lib/supabase` imports during refactors.
- **Monitoring hooks**: instrument new clients to emit basic metrics/logs (success/error counters, latency) feeding into existing monitoring backlog before legacy wrappers are removed.

## Sprint Tracking (2025-09-22)

### Sprint 1 · 基础架构重构
- ✅ **Task 1.1.1** – Created unified Supabase factory (`lib/server/db/client.ts`).
- ✅ **Task 1.1.2** – Re-routed server codepaths to the factory (core API routes + points/fortune modules).
- ✅ **Task 1.1.5** – Migrated priority API routes (`tasks`, `analysis`, `points`, `fortune`, `user-balance`, `consume-report`, mutual-aid, airdrop, WeChat, admin exports, cleanup utilities) to new clients.
- ⏳ **Task 1.1.3 / 1.1.4** – Legacy wrappers (`lib/supabase-optimized.ts`, `lib/database-pool.ts`) still referenced; scheduled for removal after remaining routes migrate.
- ⏳ **Task 1.2.x** – Layered architecture scaffolding pending (controller/service/repository foundations not yet started).

---

# AstroZi 后端架构优化 Sprint 方案

## 概览
基于架构报告的分析，我们制定了一个分阶段的优化方案，将复杂的重构工作分解为可管理的Sprint任务，确保在不影响现有功能的前提下逐步改善代码质量和可维护性。

## Sprint 1: 基础架构重构 (2周)
**目标**: 建立清晰的分层架构和统一的Supabase客户端管理

### 核心任务
1. **统一Supabase客户端管理**
   - 创建 `lib/server/db/client.ts` 作为统一工厂
   - 整合现有的多个客户端包装器
   - 移除冗余的 `supabase-optimized.ts` 和 `database-pool.ts`
   - 配置管理员/只读/匿名客户端

2. **建立分层架构基础**
   - 创建 `lib/server/` 目录结构
   - 实现 Controller → Service → Repository 模式
   - 定义标准接口和类型定义

3. **试点高流量路由重构**
   - 选择 `app/api/tasks/route.ts` 作为重构试点
   - 应用新的分层架构模式
   - 验证性能和可维护性改进

### 详细任务分解

#### 1.1 Supabase客户端统一 (5天)
- **任务1.1.1**: 创建 `lib/server/db/client.ts` 统一工厂 (1天)
- **任务1.1.2**: 迁移 `lib/supabase.ts` 中的配置 (1天)
- **任务1.1.3**: 替换 `lib/supabase-optimized.ts` 使用 (1天)
- **任务1.1.4**: 移除 `lib/database-pool.ts` 并迁移功能 (1天)
- **任务1.1.5**: 更新所有API路由使用新客户端 (1天)

#### 1.2 分层架构基础 (3天)
- **任务1.2.1**: 创建 `lib/server/` 目录结构和类型定义 (1天)
- **任务1.2.2**: 实现基础Controller/Service/Repository接口 (1天)
- **任务1.2.3**: 创建错误处理和响应工具类 (1天)

#### 1.3 Tasks API重构试点 (2天)
- **任务1.3.1**: 重构 `app/api/tasks/route.ts` 使用新架构 (1天)
- **任务1.3.2**: 性能测试和功能验证 (1天)

## Sprint 2: 认证系统标准化 (1.5周)
**目标**: 建立统一的认证中间件和权限管理

### 核心任务
1. **中央化认证中间件**
   - 创建统一的认证守卫工具
   - 处理Supabase会话、自定义JWT和Web3头信息
   - 实现一致的错误处理和角色权限执行

2. **认证流程优化**
   - 标准化Web3钱包认证流程
   - 整合Privy和WalletConnect认证
   - 改进认证错误处理和用户体验

### 详细任务分解

#### 2.1 认证中间件开发 (4天)
- **任务2.1.1**: 设计认证守卫接口 (0.5天)
- **任务2.1.2**: 实现Supabase会话处理 (1天)
- **任务2.1.3**: 集成Web3钱包认证 (1.5天)
- **任务2.1.4**: 添加角色权限验证 (1天)

#### 2.2 认证流程优化 (3天)
- **任务2.2.1**: 优化Privy认证集成 (1天)
- **任务2.2.2**: 改进WalletConnect流程 (1天)
- **任务2.2.3**: 统一认证错误处理 (1天)

## Sprint 3: 数据验证与错误处理 (1周)
**目标**: 实现标准化的请求验证和错误处理管道

### 核心任务
1. **Schema验证管道**
   - 引入Zod进行请求载荷验证
   - 标准化查询参数验证
   - 统一错误响应格式

2. **错误处理标准化**
   - 替换临时console日志记录
   - 实现结构化日志系统
   - 建立错误追踪和监控

### 详细任务分解

#### 3.1 Schema验证系统 (3天)
- **任务3.1.1**: 配置Zod验证库 (0.5天)
- **任务3.1.2**: 为主要API创建schema定义 (1.5天)
- **任务3.1.3**: 实现验证中间件 (1天)

#### 3.2 错误处理标准化 (2天)
- **任务3.2.1**: 设计结构化日志格式 (0.5天)
- **任务3.2.2**: 实现错误追踪系统 (1天)
- **任务3.2.3**: 替换现有console日志 (0.5天)

## Sprint 4: 域服务模块化 (2周)
**目标**: 为核心业务域建立专用服务模块

### 核心任务
1. **任务管理域服务**
   - 创建 `lib/server/tasks/` 模块
   - 实现任务服务、仓储和模式定义
   - 添加全面的单元测试

2. **算命系统域服务**
   - 创建 `lib/server/fortune/` 模块
   - 重构关帝灵签系统
   - 优化八字和紫微斗数计算逻辑

3. **AI分析域服务**
   - 创建 `lib/server/analysis/` 模块
   - 分离AI分析逻辑
   - 为异步处理做准备

### 详细任务分解

#### 4.1 任务管理域 (5天)
- **任务4.1.1**: 创建任务服务接口和类型 (1天)
- **任务4.1.2**: 实现任务仓储层 (1.5天)
- **任务4.1.3**: 开发任务业务逻辑服务 (1.5天)
- **任务4.1.4**: 添加单元测试覆盖 (1天)

#### 4.2 算命系统域 (4天)
- **任务4.2.1**: 重构关帝灵签逻辑 (1.5天)
- **任务4.2.2**: 优化八字计算服务 (1.5天)
- **任务4.2.3**: 改进紫微斗数算法 (1天)

#### 4.3 AI分析域 (1天)
- **任务4.3.1**: 分离AI分析逻辑到独立服务 (1天)

## Sprint 5: 异步处理与性能优化 (1.5周)
**目标**: 将重型操作迁移到队列处理，改善性能

### 核心任务
1. **异步处理架构**
   - 将AI分析任务移至队列/边缘函数
   - 实现任务状态跟踪
   - REST端点作为编排器

2. **性能监控集成**
   - 整合现有监控工具
   - 实现慢查询报告
   - 结构化日志和指标输出

### 详细任务分解

#### 5.1 异步处理架构 (4天)
- **任务5.1.1**: 设计队列处理架构 (1天)
- **任务5.1.2**: 实现AI任务队列 (1.5天)
- **任务5.1.3**: 添加任务状态跟踪 (1天)
- **任务5.1.4**: 更新API端点为编排器模式 (0.5天)

#### 5.2 监控系统集成 (3天)
- **任务5.2.1**: 集成现有监控工具 (1天)
- **任务5.2.2**: 实现慢查询报告 (1天)
- **任务5.2.3**: 配置结构化指标输出 (1天)

## Sprint 6: 网关策略优化 (1周)
**目标**: 优化或移除冗余的v2代理层

### 核心任务
1. **网关层决策**
   - 评估 `app/api/v2/*` 代理的价值
   - 将有用功能集成到服务层
   - 移除冗余路由

2. **缓存和限流集成**
   - 将边缘缓存功能集成到新架构
   - 统一限流策略
   - 优化响应时间

### 详细任务分解

#### 6.1 网关策略评估 (2天)
- **任务6.1.1**: 分析v2代理价值和使用情况 (1天)
- **任务6.1.2**: 制定迁移或移除计划 (1天)

#### 6.2 性能优化实施 (3天)
- **任务6.2.1**: 集成边缘缓存到新架构 (1天)
- **任务6.2.2**: 统一限流策略实现 (1天)
- **任务6.2.3**: 性能基准测试和优化 (1天)

## 风险评估与缓解策略

### 高风险项目
1. **Supabase客户端迁移**: 可能影响所有API功能
   - 缓解：分阶段迁移，保持向后兼容
   - 回滚策略：维护原有客户端作为备用

2. **认证系统重构**: 可能影响用户登录
   - 缓解：在测试环境充分验证
   - 回滚策略：快速切回原认证流程

### 中风险项目
1. **异步处理迁移**: 可能导致AI功能暂时不可用
   - 缓解：实现优雅降级机制
   - 监控：密切关注队列处理性能

## 成功指标

### 技术指标
- API响应时间改善 20%+
- 代码重复度降低 40%+
- 测试覆盖率达到 80%+
- 错误处理一致性 100%

### 开发效率指标
- 新功能开发时间减少 30%
- Bug修复时间减少 50%
- 代码审查通过率提升 25%

## 实施建议

### 团队协作
- 每个Sprint开始前进行详细的技术设计评审
- 建立代码审查检查清单，确保新架构标准的执行
- 定期进行架构决策记录(ADR)更新

### 测试策略
- 每个Sprint结束时进行全面的回归测试
- 实施渐进式部署，先在测试环境验证
- 建立性能基准，监控每次改动的影响

### 文档维护
- 更新API文档以反映新的架构模式
- 创建开发者指南，说明新的代码组织规范
- 维护架构决策文档，记录重要的设计选择
