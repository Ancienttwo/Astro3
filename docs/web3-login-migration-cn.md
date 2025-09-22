# Web3 登录统一化实施方案（中文版）

## 1. 背景与目标
- 现状：项目同时保留 Supabase 邮箱/社交登录与 Web3 钱包登录，中文/日文站点主要使用 Web2 流程，英文站点以 Web3 为主。
- 新策略：统一采用 Web3 登录（WalletConnect + Privy），所有语言版本共享同一套身份体系和 UI 入口。
- 目标：
  - 在所有 locale 中使用相同的 Web3-only 登录体验。
  - 清理历史 Web2 代码路径，降低维护成本与安全面。
  - 确保 Supabase、RLS、积分系统等后端能力与新的身份标识保持一致。

## 2. 现有系统盘点
- 前端路由
  - `/auth-select` 及对应的 `app/en/*`, `app/ja/*` 提供 Web2/Web3 混合选择页面。
  - `/privy-auth`、`/wallet-auth` 分别处理 Privy Web2 与 WalletConnect Web3 登录。
- 核心组件
  - `components/AuthMethodSelector.tsx`、`components/auth/AuthOptions.tsx` 展示双轨选项。
  - `components/WalletConnectAuth.tsx` 承担 Web3 签名、Supabase Session、RLS 验证。
  - `components/auth/LoginButton.tsx` 使用 PrivyContext 同时支持社交登录与绑定钱包。
- 上下文与配置
  - `contexts/PrivyContext.tsx` 初始化 Privy + 钱包连接。
  - `lib/config/app-config.ts`、`lib/config/deployment-config.ts`、`lib/config/feature-flags.ts` 仍保留 web2/web3/unified 差异化配置。
  - `supabase-session-manager` 与 `lib/auth.ts` 内包含大量 Web2 fallback (`signInWithPassword`、自定义邮箱、web2 缓存键)。
- 后端接口
  - `app/api/auth/privy/route.ts` 创建/更新 Supabase 用户时标记 `auth_type: 'web2'`。
  - `app/api/points/web2/*`、`app/api/daily-checkin/*`、SQL 中 `user_points_web2`、`checkin_records_web2` 等与传统用户挂钩。

## 3. 统一方案概述
1. **登录入口统一化**：移除 Web2 分支，只保留单一路径（建议 `/login`）加载 WalletConnect + Privy Web3 流程，并提供多语言文案与引导。
2. **配置与特性开关重构**：
   - 将 `APP_CONFIG` 默认模式设为 Web3，支持 `zh`/`ja`/`en` 等多语言。
   - 关闭 `auth.web2.enabled`，更新 feature flag 与导航过滤逻辑。
3. **身份标识与 Session 调整**：
   - Privy 登录成功后统一写入 `auth_type: 'web3'`，迁移历史数据。
   - 精简 `supabase-session-manager`，移除密码型 session fallback，仅保留标准 session 设置与恢复。
4. **数据结构迁移**：
   - 将 Web2 专属表/流程合并或下线，必要时迁移数据至 Web3 版本（如积分、签到）。
   - 清理本地存储中的 Web2 键值（`custom_email_session` 等）。
5. **UI 与文案本地化**：
   - 更新登录页面、导航提示、帮助中心等中文/日文内容，指导用户使用 Web3 登录。
   - 提供 Failover 文案（无钱包、Privy 嵌入钱包等情况）。

## 4. 实施步骤
1. **配置层更新**
   - 修改 `lib/config/app-config.ts` Web3 模板，添加 `zh`、`ja` 支持；将 `auth.web2.enabled` 设为 `false`。
   - 调整 `lib/config/deployment-config.ts` 与 `package.json` 中 `dev:web2`/`build:web2` 等脚本。
2. **路由与组件重构**
   - 用新的 `/login` 替代 `/auth-select`、`/privy-auth`、`/wallet-auth`，在 `app/[locale]/login` 中通过动态加载 `WalletConnectAuth`。
   - 删除或重定向旧路由到 `/login`，并在 `WalletConnectAuth` 内支持多语言文案与可配置跳转。
3. **Session & Auth 逻辑优化**
   - 在 `app/api/auth/privy/route.ts` 中写入 `auth_type: 'web3'`；添加数据迁移脚本更新现有用户。
   - 精简 `supabase-session-manager`、`lib/auth.ts` 中的 Web2 分支，统一退出逻辑与本地缓存键。
   - 确保 `resolveAuth`、RLS Helper 等读取 `auth_type: 'web3'` 正常。
4. **数据与后端清理**
   - 评估 `user_points_web2` 等表的去留，若保留需合并为通用表；若废弃则迁移或存档历史数据后下线相关 API。
   - 更新 `components/navigation/adaptive-navigation.tsx` 等对 Web2 特性的判断，避免 UI 空洞。
5. **多语言文案**
   - 在 `lib/i18n/auth-translations.ts`、`lib/i18n/dictionaries.ts` 中提供 Web3 登录说明（中文、日文、英文）。
   - 更新帮助中心、常见问题等内容，删除邮箱注册/密码重置说明，加入钱包连接、Privy 嵌入钱包流程指引。
6. **验证与回归**
   - 扩展 `tests/e2e/auth.spec.ts`、`tests/e2e/api.spec.ts` 验证统一流程；模拟不同语言环境。
   - 通过 Supabase 日志/监控确认新 `auth_type` 生效；重点关注 RLS、积分/通知同步。

## 5. 风险与缓解
- **历史账号兼容**：
  - 风险：旧 Web2 用户无钱包资料，迁移后无法登录。
  - 缓解：提前导出 Web2 用户名单，制定手动升级或发送通知策略；必要时提供单次迁移工具（绑定钱包或申请客服迁移）。
- **Privy 依赖**：
  - 风险：Privy 服务不可用导致无法登录。
  - 缓解：保留只需钱包签名的离线登录兜底，并在 UI 提示用户稍后重试。
- **RLS/权限回归**：
  - 风险：`auth_type` 修改后权限判断异常。
  - 缓解：上线前在 Staging 使用真实数据回归，执行 `resolveAuth` 与关键 API 调用测试。

## 6. 回归测试清单
- 登录成功路径（桌面 + 移动端，中文/英文/日文）。
- Privy 社交登录 + 嵌入钱包绑定流程。
- 钱包连接失败/拒绝签名时的提示与重试。
- Session 恢复（刷新页面、重启浏览器）。
- 注销后所有本地存储清理、导航状态刷新。
- 受限 API（互助、积分、通知等）在新 `auth_type` 下的访问权限。

## 7. 时间线建议
| 阶段 | 内容 | 预计耗时 |
| ---- | ---- | -------- |
| 需求确认 | 文案、路由、配置方案定稿 | 1-2 天 |
| 开发实现 | 配置/路由重构、API 调整、数据脚本 | 4-6 天 |
| 测试与回归 | 自动化 + 手动多语言回归 | 3-4 天 |
| 上线与监控 | 分阶段上线，监控登录成功率 | 1-2 天 |

## 8. 后续工作
- 为老用户准备钱包引导、客服 FAQ。
- 建立登录监控指标（成功率、错误分类、地区分布）。
- 定期评估 Privy、WalletConnect SDK 更新，保持安全补丁。


## 9. 迁移 Sprint 计划与任务分解

### 9.1 Sprint 概览
- **Sprint 长度**：10 个工作日（两周），建议与产品版本同步。
- **Sprint 目标**：完成 Web3 登录统一化的核心交付（配置切换、路由重构、用户数据迁移与验证）并通过回归测试，准备上线观测。
- **关键里程碑**：
  1. **第 1 周结束**：前后端重构与配置切换完成，测试环境可用。
  2. **第 2 周中段**：数据迁移与自动化测试通过，准备上线评审。
  3. **Sprint 末尾**：上线生产并启动监控。

### 9.2 Sprint 时间轴
| 时间 | 里程碑 | 说明 |
| ---- | ---- | ---- |
| W1-D1~D2 | 需求确认 & 方案定稿 | 落实文案、路由、配置策略，更新任务分配 |
| W1-D3~D5 | 前端/配置开发 | 完成 `/login` 新入口、配置开关、Web2 入口清理 |
| W2-D1~D2 | 后端 & 数据迁移 | 更新 Privy API、`auth_type` 迁移脚本、数据库表清理方案 |
| W2-D3 | 集成测试 & 文案校对 | 多语言验证、新流测试用例、帮助中心更新 |
| W2-D4 | 上线准备 | 回滚方案确认、监控指标配置、评审 |
| W2-D5 | 发布 & 监控 | 分阶段发布、指标观测、问题响应 |

### 9.3 Sprint Backlog（按工作流划分）

#### 配置与基础设施
- **CFG-01**：调整 `lib/config/app-config.ts`，确保 Web3 模式支持 `zh/en/ja`，关闭 `auth.web2.enabled`。
- **CFG-02**：更新 `lib/config/deployment-config.ts`、`package.json` 及 CI 流程，移除 Web2 构建脚本。
- **CFG-03**：同步修改 feature flag 默认值，确认导航/组件不会引用 Web2 标志。

#### 前端与路由
- **FE-01**：在 `app/[locale]/login` 建立统一登录路由，动态加载 `WalletConnectAuth`。
- **FE-02**：删除 `/auth-select`、`/privy-auth`、`/wallet-auth` 等旧页面并做 301/应用内重定向。
- **FE-03**：重构 `WalletConnectAuth`，增加多语言文案、跳转配置、错误提示本地化。
- **FE-04**：清理 `components/auth/AuthOptions.tsx`、`AuthMethodSelector.tsx` 等双轨组件及引用。
- **FE-05**：更新导航/帮助中心/FAQ 文案（中文、英文、日文），指导 Web3 登录流程。

#### 后端与身份体系
- **BE-01**：修改 `app/api/auth/privy/route.ts`，将新用户 `auth_type` 统一为 `web3`。
- **BE-02**：编写数据迁移脚本（Supabase SQL/脚本）将已有 Privy 用户 `auth_type` 批量调整为 `web3`。
- **BE-03**：评估并合并/废弃 `user_points_web2` 等 Web2 专属表与 API；根据决定执行迁移或下线。
- **BE-04**：精简 `supabase-session-manager` 与 `lib/auth.ts`，移除 `signInWithPassword` 等 Web2 逻辑。
- **BE-05**：确认 RLS Policy & `resolveAuth` 在新 `auth_type` 下的行为，必要时更新策略。

#### 数据与本地存储
- **DATA-01**：清理前端 `localStorage` 使用的 Web2 键（`custom_email_session` 等），统一为 Web3 键。
- **DATA-02**：制作迁移监控脚本，统计迁移前后用户登录成功率与错误类型。
- **DATA-03**：为旧 Web2 用户提供钱包绑定引导或人工迁移流程（文档/工单模板）。

#### 测试与质量保障
- **QA-01**：扩展 `tests/e2e/auth.spec.ts`、`api.spec.ts`，覆盖多语言登录、Privy 嵌入钱包、错误场景。
- **QA-02**：编写手动回归用例，覆盖导航、积分/互助 API、通知同步等关键模块。
- **QA-03**：组织测试环境的用户验收（中文/英文/日文各一轮），收集反馈。

#### 发布与监控
- **OPS-01**：制定回滚方案（保留旧路由代码分支 + 数据回滚脚本）。
- **OPS-02**：接入登录成功率、错误日志、Privy/WC SDK 状态监控（Grafana/Datadog 等）。
- **OPS-03**：准备客服 FAQ、公告、旧用户迁移沟通邮件。

### 9.4 任务依赖关系
- `CFG-01` 完成后，`FE-01/FE-02/FE-03` 方可在统一配置下实现。
- `BE-01`、`BE-04` 依赖前端接口定义稳定，建议在 FE 初版完成后并行推进。
- `BE-02`、`DATA-01` 需在 QA 回归前完成，以便测试真实场景。
- `QA-*` 任务以 FE/BE 主线完成度为准，建议在 W2-D1 进入联合测试阶段。
- `OPS-*` 任务需在 W2-D4 完成上线评审前准备就绪。

### 9.5 工作分配建议
| 角色 | 建议任务范围 |
| ---- | ---- |
| 架构/Dev Lead | CFG-01/02/03、BE-01/04/05、OPS-01 |
| 前端工程师 | FE-01~FE-05、DATA-01 |
| 后端工程师 | BE-02/03、DATA-02、OPS-02 |
| QA 工程师 | QA-01~QA-03、联动数据验证 |
| 产品/运营 | DATA-03、OPS-03、文案审核 |


### 9.6 子任务拆解明细
> 说明：以下子任务默认以 0.5~1 天粒度拆分，可根据团队人力进一步细化或合并。

#### CFG（配置）
- **CFG-01**
  1. 梳理当前 `supportedLanguages` 使用场景（导航、i18n、语言切换）。
  2. 修改 `lib/config/app-config.ts` Web3 模板，添加 `zh/ja` 并关闭 `auth.web2.enabled`。
  3. 自测配置加载（运行 `pnpm dev:web3`），确认导航与语言切换正常。
- **CFG-02**
  1. 搜索并删除 `dev:web2`、`build:web2`、`deploy:web2` 等脚本引用。
  2. 更新 CI/CD 配置与文档，确认仅保留 Web3 构建流程。
  3. 在测试分支跑一次 CI，验证脚本无缺失依赖。
- **CFG-03**
  1. 审查 `feature-flags.ts`、`adaptive-navigation` 等对 `web2` 标志的引用。
  2. 调整默认值并确保 UI 不再渲染 Web2 专属导航。
  3. 与前端确认无遗漏的条件渲染或灰度逻辑。

#### FE（前端）
- **FE-01**
  1. 在 `app/[locale]/login` 新建页面骨架，导入动态组件。
  2. 为 `WalletConnectAuth` 注入 locale、回跳路径等参数。
  3. 进行移动端/桌面端布局检查。
- **FE-02**
  1. 移除旧路由文件，并在 Next.js 层加入 `redirect`。
  2. 搜索项目内对旧路径的引用，统一调整为 `/login`。
  3. 本地验证 404/redirect 行为。
- **FE-03**
  1. 抽取 `WalletConnectAuth` 文案到 i18n 字典，补充 zh/ja 翻译。
  2. 引入统一的错误码与提示组件。
  3. 接入跳转配置（如登录成功后的 locale home 地址）。
- **FE-04**
  1. 清理 `AuthMethodSelector`、`AuthOptions` 等组件文件。
  2. 检查引用链（`MainLayout`、`Providers` 等）并移除导入。
  3. 回归编译，确保无未使用导出错误。
- **FE-05**
  1. 更新登录页面、导航、帮助中心 Markdown 文案。
  2. 与产品/运营确认翻译。
  3. 执行一轮内容校对（含链接有效性）。

#### BE（后端）
- **BE-01**
  1. 修改 `app/api/auth/privy/route.ts` 中 `auth_type` 写入逻辑。
  2. 增加单元测试/模拟请求，验证返回的 session 信息。
  3. 在 Staging 环境验证 Privy 登录后用户标签是否正确。
- **BE-02**
  1. 编写 SQL 或脚本批量更新 `auth_type`。
  2. 创建备份/导出脚本（以防回滚需要）。
  3. 运行迁移并记录影响行数，更新迁移日志。
- **BE-03**
  1. 清点 Web2 专属表/函数/Edge Function。
  2. 与业务确认保留/合并策略。
  3. 执行迁移或归档，并更新文档。
- **BE-04**
  1. 删除 `signInWithPassword` 相关分支与 localStorage 逻辑。
  2. 调整 `restoreWeb3Session` 流程，确保兼容 Privy + 钱包。
  3. 补充单元测试或调整现有测试基线。
- **BE-05**
  1. 检查 RLS Policy 对 `auth_type` 的判断条件。
  2. 运行关键 API（互助、积分、通知）进行权限验证。
  3. 根据结果调整策略或更新文档说明。

#### DATA（数据与本地存储）
- **DATA-01**
  1. 搜索所有 `localStorage` 键名，列出 Web2 相关项。
  2. 更新前端退出/清理逻辑，仅保留 Web3 键。
  3. 验证旧数据迁移（模拟已有用户登录）。
- **DATA-02**
  1. 定义观测指标（登录成功率、错误类型、用户数）。
  2. 编写脚本或 Dashboard，从 Supabase 日志/监控获取数据。
  3. 建立对比报表，供上线监控使用。
- **DATA-03**
  1. 整理旧 Web2 用户名单与联系方式。
  2. 制作钱包绑定指南（图文/视频）。
  3. 设计客服工单模板与 FAQ。

#### QA（测试）
- **QA-01**
  1. 新增/更新 E2E 测试用例，覆盖三种语言与异常流程。
  2. 配置测试账号（含 Privy 社交账号、模拟钱包）。
  3. 在 CI 中运行测试并跟踪结果。
- **QA-02**
  1. 制定手动回归清单，明确步骤与预期结果。
  2. 执行回归并记录工单。
  3. 跟进缺陷修复，安排复测。
- **QA-03**
  1. 组织试用用户名单（各语言）。
  2. 协调产品/运营进行 UAT。
  3. 收集反馈并纳入改进计划。

#### OPS（发布与监控）
- **OPS-01**
  1. 整理回滚策略：代码分支、数据库回滚脚本。
  2. 评审回滚步骤与触发条件。
  3. 编写上线 Runbook 并分享给相关团队。
- **OPS-02**
  1. 配置监控告警（Privy/WC SDK、登录 API）。
  2. 验证告警触发条件与通知渠道。
  3. 编写监控看板使用说明。
- **OPS-03**
  1. 起草公告/邮件内容，多语言审校。
  2. 制定推送节奏与渠道（站内信、邮件、社群）。
  3. 联动客服准备常见问题解答。

### 9.7 进度追踪
| 日期 | 子任务 | 状态 | 验证要点 | 备注 |
| ---- | ------ | ---- | -------- | ---- |
| 2025-09-19 | CFG-01-1 梳理 `supportedLanguages` 使用场景 | ✅ | `rg "supportedLanguages"` 检查前端组件、配置、API 依赖 | 覆盖 LanguageSelector、app-config、feature flag、Fortune API 等引用 |
| 2025-09-19 | CFG-01-2 调整 Web3 模板支持 zh/en/ja | ✅ | `rg "supportedLanguages: ['zh', 'en', 'ja']" lib/config/app-config.ts` & diff 校验 | 同步开启导航语言切换、默认语言设为 zh |
| 2025-09-19 | CFG-01-3 配置加载自测 | ⚠️ | `NODE_OPTIONS=--max-old-space-size=8192 pnpm exec tsc -p tsconfig.json --noEmit`（现有 TS 错误阻塞） | 统一构建仍受历史 TS 报错影响，需后续专门清理 |
| 2025-09-19 | CFG-02-1 搜索并移除 Web2 专属脚本 | ✅ | `rg "dev:web2"/"build:web2"/"deploy:web2"` + diff | 已删除 package.json 中 Web2 构建/部署脚本 |
| 2025-09-19 | CFG-02-2 更新文档与构建示例 | ✅ | `rg "build:web2" scripts/migration-plan.md` & 更新代码块 | 文档现仅保留 Web3/Unified 构建与部署脚本示例 |
| 2025-09-19 | CFG-02-3 运行构建验证 | ⚠️ | `NODE_OPTIONS=--max-old-space-size=8192 NEXT_PUBLIC_DEPLOYMENT_TARGET=web3 NEXT_PUBLIC_APP_MODE=web3 pnpm build` | 构建被既有 Webpack/TS 报错阻塞（钱包认证、数据库池重复定义），待后续统一修复 |
| 2025-09-19 | CFG-03-1 Feature Flag 调整 | ✅ | `rg "web2-auth" lib/config/feature-flags.ts` 确认默认禁用 | `web2-auth` 现固定为 false，标注 Web3 统一版本默认停用 |
| 2025-09-19 | CFG-03-2 导航/组件验证 | ✅ | `rg "web2Only" components/navigation/adaptive-navigation.tsx` 确认仅在 Web2 启用时渲染 | Web2 专属导航项在 `APP_CONFIG.auth.web2.enabled` 为 false 时自动隐藏 |
| 2025-09-19 | FE-01-1 建立 locale 登录页面骨架 | ✅ | `ls app/login app/en/login app/ja/login` 确认新建 Web3 登录入口 | 新增统一登录路由，接入 Web3 登录页面组件 |
| 2025-09-19 | FE-01-2 注入 WalletConnectAuth 参数配置 | ✅ | `rg "redirectPath" components/WalletConnectAuth.tsx` 检查 locale/跳转/variant 支持 | 组件现支持 locale、跳转路径与嵌入模式，适配统一登录页 |
| 2025-09-22 | FE-01-3 登录页面布局检查 | ⚠️ | `NEXT_WEBPACK_LOAD_CHUNK_TIMEOUT=120000 NODE_OPTIONS=--max-old-space-size=8192 pnpm dev:web3` + `curl 127.0.0.1:3007/{,en/,ja/}login` | 首次编译 `/login` 需 ~30k s（14242 modules），客户端仍因 Supabase/Redis 健康检查未配置而挂起；需在有有效后端配置的环境中实机确认响应式 |
| 2025-09-19 | FE-02-1 旧路由改为统一重定向 | ✅ | `rg "redirect\('/.*login'\)" app/auth-select app/en/auth-select app/ja/auth-select app/privy-auth app/en/privy-auth app/wallet-auth app/en/wallet-auth` | 旧 `auth-select/privy-auth/wallet-auth` 页面现转向对应 locale 的 `/login` |
| 2025-09-19 | FE-02-2 更新内部引用指向 `/login` | ✅ | `rg "/wallet-auth" -n` 确认代码引用已替换 | 仅保留文档说明与兼容注释，功能入口统一为 `/login` |
| 2025-09-22 | FE-02-3 重定向与导航验证 | ⚠️ | `NEXT_WEBPACK_LOAD_CHUNK_TIMEOUT=120000 pnpm dev:web3` 预热 `auth-select/privy-auth/wallet-auth` + `curl` 静态 chunk | 登录页 chunk `/_next/static/chunks/_app-pages-browser_components_WalletConnectAuth_tsx.js` 已 200；HTML 请求仍被 Supabase/Redis 检查阻塞，等待真实后端环境验证 30x/导航 |
| 2025-09-19 | FE-03-1 WalletConnectAuth 文案本地化 | ✅ | `rg "copy\.tagline" components/WalletConnectAuth.tsx` | 多语言 copy（zh/en/ja）覆盖状态提示、按钮与辅助信息 |
| 2025-09-19 | FE-03-2 错误码与提示统一 | ✅ | `rg "WalletIntegrationErrorCode" -n` & `rg "errors.byCode" components/WalletConnectAuth.tsx` | 统一错误码映射 + UI Alert 显示 code/message，组件返回规范化错误 |
| 2025-09-19 | FE-03-3 登录成功跳转配置 | ✅ | `rg "redirectPath" -n components/auth/Web3LoginPage.tsx app/en/auth/AuthPageClient.tsx` | 依据 locale 注入 redirect/disconnect 路径，统一回到对应首页/登录 |
| 2025-09-19 | FE-04-1 移除双轨登录组件文件 | ✅ | `rg "AuthMethodSelector" -n` & `rg "AuthOptions" -n` | 已删除 AuthMethodSelector/AuthOptions/LoginGuidanceModal，代码库仅保留历史文档引用 |
| 2025-09-19 | FE-04-2 清理导出与注释引用 | ✅ | `rg "AuthMethodSelector" components/index.ts` & diff | 移除组件聚合导出，并清理旧 modal 注释引用 |
| 2025-09-19 | FE-04-3 编译/构建验证 | ⚠️ | `pnpm exec tsc -p tsconfig.json --noEmit` | 仍受既有 TS 报错阻塞，待全局修复后回归 |
| 2025-09-19 | FE-05-1 多语言登录文案更新 | ✅ | `rg "Web3 Login" lib/i18n/auth-translations.ts lib/i18n/dictionaries.ts` | zh/en/ja 登录文案统一指向 WalletConnect + Privy，并标注邮箱登录停用 |
| 2025-09-19 | FE-05-2 帮助中心内容同步 | ✅ | `rg "Privy" app/help-center/page.tsx` | 帮助中心快速开始/FAQ 改为指导钱包登录与 Privy 使用，保留旧邮箱迁移说明 |
| 2025-09-19 | FE-05-3 营销与会员页面提示 | ✅ | `rg "Legacy" app/page.tsx app/membership/page.tsx` | 公共 CTA、会员档案显示 Web3 登录标签，旧邮箱标记为 Legacy |
| 2025-09-19 | BE-01-1 Privy API 统一 auth_type | ✅ | `rg "auth_type" app/api/auth/privy/route.ts` & Supabase metadata 检查 | Privy 登录创建/更新均写入 `auth_type: 'web3'`，钱包地址统一小写 |
| 2025-09-19 | BE-02-1 Legacy Privy 用户迁移脚本 | ✅ | `pnpm scripts:migrate-privy-auth-type` | 新增脚本统一历史 Privy 账户 `auth_type=web3` 并同步 Supabase Auth metadata |
