# 数据库连接与读写分离

- 入口：`lib/database-pool.ts`、`lib/supabase-optimized.ts`
- 目标：读写分离 + 只读副本优先，降低主库压力

## 环境变量

- 主库（写）：
  - `SUPABASE_URL`（可选，未设置则使用 `NEXT_PUBLIC_SUPABASE_URL`）
  - `SUPABASE_SERVICE_ROLE_KEY`
- 只读副本（读）：
  - `SUPABASE_REPLICA_URL`（如未设置则回退主库）
  - `SUPABASE_REPLICA_KEY`（如未设置则回退 `SUPABASE_SERVICE_ROLE_KEY`）
- 池参数（可选）：
  - `DB_POOL_MAX`、`DB_POOL_MIN`、`DB_ACQUIRE_TIMEOUT`、`DB_IDLE_TIMEOUT`、`DB_REAP_INTERVAL`

## 使用建议

- 读密集接口优先使用：
  - `supabaseReadonly`（`lib/supabase-optimized.ts`）
  - 或 `DatabaseRouter.executeRead()`（`lib/database-pool.ts`）
- 写/强一致读使用：
  - `supabaseAdmin` 或 `DatabaseRouter.executeWrite()`
- 示例（已接入）：
  - `app/api/fortune/random/route.ts` → `supabaseReadonly`
  - `app/api/fortune/existing/slips/[slip_number]/route.ts` → `supabaseReadonly`

## 监控

- `DatabaseMonitor`（`lib/database-pool.ts`）与 `DatabaseMetrics`（`lib/supabase-optimized.ts`）
  - 记录平均查询耗时、慢查询告警、错误率

## 注意

- Supabase JS 通过 HTTP 调用 PostgREST/服务端函数，连接池由 Supabase 与平台管理。
- 读写分离依赖你提供只读副本 URL/Key；未配置时会自动回退主库。
