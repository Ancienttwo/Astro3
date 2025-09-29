原项目地址 ~/downloads/AstroCN_Production

整理后的 BossAI 构成如下，便于移植到新的 React 项目。

  核心算法与引擎

  - lib/bossai/core/bazi-parser.ts:1 八字解析器：校验出生输入、转换农历、计算四柱/十神/五行并给出置信度。
  - lib/bossai/core/pattern-engine.ts:1 命理模式识别：比劫/财才/食伤/官杀/印枭格局判断，检测天干地支合冲
  与特殊组合。
  - lib/bossai/core/scoring-engine.ts:1 六维评分引擎：根据十神矩阵和五行调节计算能力、忠诚度、成长潜力与
  风险评估。
  - lib/bossai/optimized-engine.ts:1 精细季节矩阵十神算法：季节权重、藏干层级和参数化权重加速能力分布
  计算。
  - lib/bossai/quadrant-analysis-engine.ts:1 团队象限分析：将六维能力映射为稳定可靠性/内卷指数四象限并给
  出策略与风险。
  - lib/bossai/rules/rule-engine.ts:1 + lib/bossai/rules/rule-loader.ts:1 + lib/bossai/rules/condition-
  evaluator.ts:1 + lib/bossai/rules/action-executor.ts:1 JSON 规则系统：规则验证、条件求值、动作执行、决
  策追踪与缓存。

  数据转换与缓存

  - lib/bossai/types.ts:1 全量类型定义：输入、八字结构、评分、原型、建议、规则、追踪等接口集合。
  - lib/bossai/analysis-data-converter.ts:1 数据适配器：将综合分析结果转为 BossAIReport/TalentProfile（含
  建议与原型）。
  - lib/bossai/analysis-cache.ts:1 三级缓存体系：哈希生成、LRU 缓存、Supabase 持久化与命中统计。
  - lib/bossai/bazi-data-helpers.ts:1 八字辅助函数：提供地支藏干、结构转换等工具。
  - lib/bossai/boss-type-config.ts:1 老板类型配置：BossType 枚举对应的样式、特质与策略。

  前端 UI 组件

  - 档案与输入：components/bossai/BossProfileForm.tsx:1, components/bossai/BossProfileFormDynamic.tsx:1,
  components/bossai/BossProfileFormSafe.tsx:1, components/bossai/BossProfileFormSimple.tsx:1, components/
  bossai/NewAssessmentForm.tsx:1, components/bossai/talent-selector.tsx:1, components/bossai/
  ProfileList.tsx:1.
  - 报告与原型展示：components/bossai/ProfileReport.tsx:1, components/bossai/archetype-display.tsx:1,
  components/bossai/AnimalPrototypeCard.tsx:1, components/bossai/BossProfileCardSimple.tsx:1, components/
  bossai/CompactQuickActions.tsx:1, components/bossai/BossCardShowcaseSafe.tsx:1, components/bossai/
  BossCardShowcaseWrapper.tsx:1, components/bossai/BossCardShowcase.tsx.backup:1.
  - 能力与象限可视化：components/bossai/ability-radar-chart.tsx:1, components/bossai/six-
  ability-bar-chart.tsx:1, components/bossai/six-ability-radar-chart.tsx:1, components/bossai/
  DualViewCapabilityChart.tsx:1, components/bossai/SixDimensionCapabilityChart.tsx:1, components/
  bossai/BaziChartCard.tsx:1, components/bossai/ShenshaVisualizer.tsx:1, components/bossai/
  QuadrantAnalysisChart.tsx:1, components/bossai/QuadrantAnalysisChartMobile.tsx:1, components/bossai/
  GrowthTrendChart.tsx:1.
  - 团队与销售模块：components/bossai/TeamQuadrantAnalysis.tsx:1, components/bossai/
  TeamOptimizationDashboard.tsx:1, components/bossai/TeamOptimizationDashboardSafe.tsx:1, components/
  bossai/EmployeeMatchingResults.tsx:1, components/bossai/EmployeeMatchingResultsSafe.tsx:1, components/
  bossai/SalesTalentCard.tsx:1, components/bossai/SalesTalentEvaluator.tsx:1, components/bossai/
  SalesTalentRanking.tsx:1, components/bossai/SalesTalentRankingMobile.tsx:1, components/bossai/
  SalesTalentRankingResponsive.tsx:1, components/bossai/HistoryComparison.tsx.backup:1.
  - 财富与运势：components/bossai/WealthIndexCard.tsx:1, components/bossai/WealthDetailsModal.tsx:1,
  components/bossai/wealth/WealthLevelIndicator.tsx:1, components/bossai/wealth/
  WealthScoreProgress.tsx:1, components/bossai/wealth/WealthFactorsBreakdown.tsx:1, components/bossai/
  wealth/WealthRecommendations.tsx:1.
  - 统计与辅助：components/bossai/stats-dashboard.tsx:1, components/bossai/ability-radar-chart.tsx:1（可
  切换雷达/柱状视图），components/bossai/CompactQuickActions.tsx:1.

  页面路由与交互

  - app/bossai/page.tsx:1 主控制台：档案入口、快速操作、提醒、排行榜挂载。
  - app/bossai/report/new/page.tsx:1 与 app/bossai/report/[id]/page.tsx:1 报告生成与详情页。
  - app/bossai/match/new/page.tsx:1 / [id]/page.tsx:1 岗位匹配创建及结果页面。
  - app/bossai/team/page.tsx:1 团队分析入口。
  - app/bossai/boss-profile/page.tsx:1 老板档案独立展示，app/bossai/boss-profile/error.tsx:1 错误兜底。

  API 功能

  - 报告/分析：app/api/bossai/report/route.ts:1, app/api/bossai/analyze/route.ts:1, app/api/bossai/
  generate-comprehensive-analysis/route.ts:1.
  - 档案与团队：app/api/bossai/profile/route.ts:1, app/api/bossai/team/route.ts:1, app/api/bossai/team-
  members/route.ts:1, app/api/bossai/boss-profiles/route.ts:1.
  - 匹配与建议：app/api/bossai/match/route.ts:1, app/api/bossai/suggestions/route.ts:1, app/api/bossai/
  suggestions/pending/route.ts:1.
  - 销售模块：app/api/bossai/sales-evaluation/route.ts:1, app/api/bossai/sales-evaluation-cache/
  route.ts:1.
  - 配置与统计：app/api/bossai/config/route.ts:1, app/api/bossai/stats/route.ts:1, app/api/bossai/
  exchange-reports/route.ts:1.

  状态与逻辑层

  - stores/bossai-store.ts:1 Zustand store：档案、分析、团队统计、缓存控制及一系列异步操作。
  - hooks/useSalesTalentRanking.ts:1 销售排行榜数据 hook：缓存、重试、评估整合。
  - components/DirectCreditsPurchase.tsx:1 与 components/PaymentGuideDialog.tsx:1 BossAI 付费与兑换入口。
  - app/api/bossai/team-members/route.ts:1 + services 中的匹配/评估引擎（如 lib/bazi/sales-evaluation-
  engine 等）支撑前端组件。

  数据库与迁移

  - supabase/migrations/20250812010000_create_bossai_cache_tables.sql:1 定义 bossai_analysis_cache、
  bossai_cache_stats 等缓存表和清理函数，支撑缓存命中统计。
  - 相关表：bossai_reports, bossai_employee_profiles, bossai_analysis_snapshots 等在 API 中被读写。
  - BossAI/ 目录下多份设计文档（UI, 规则, 能力矩阵）为迁移时的业务背景参考。

  移植提示

  1. 先抽离 lib/bossai 与 stores/hooks，确保算法、类型、状态管理在新项目中编译通过，再按 API 依赖补齐
  Supabase 或以 Mock 替换。
  2. 前端分批迁移：先挂载 components/bossai 中无副作用的展示组件，再集成表单/动态加载部分，最后接入 API
  与支付逻辑。
