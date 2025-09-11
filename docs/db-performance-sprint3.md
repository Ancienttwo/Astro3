# Sprint 3 数据库优化

- 文件：`sql/sprint3-performance.sql`
- 内容：
  - 复合索引：`user_charts`、`web3_auth_sessions`、`analysis_tasks`、`chat_*`、`user_profiles`、`user_usage`、`temple_systems`、`fortune_slips` 等
  - 物化视图：
    - `mv_fortune_slips_active(temple_code, slip_number, slip_id)`（活跃签文快速查找）
    - `mv_analysis_tasks_user_counts(user_id, status, cnt)`（用户任务状态统计）

## 执行方式

- 在 Supabase SQL Editor 或本地 psql 执行：

```
\i sql/sprint3-performance.sql;
```

- 刷新物化视图（并发刷新）：

```
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_fortune_slips_active;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_analysis_tasks_user_counts;
```

## 注意事项
- 脚本内对每个表使用了 `DO $$` 判断存在再建索引，重复执行安全。
- `CREATE INDEX CONCURRENTLY` 不能在事务中执行，脚本采用 `DO $$` + `EXECUTE` 以避免事务冲突。
- 生产环境建议在负载低峰期刷新物化视图。

## 关联查询优化点
- `save-yongshen` 使用 `user_charts` 的多列等值筛选，已加覆盖复合索引。
- Web3 鉴权 `web3_auth_sessions` 使用 `(wallet_address, nonce)` 和 `expires_at`，已加索引。
- `temple_systems` 与 `fortune_slips` 常按 `temple_code/slip_number` 查找，增加复合索引与活跃 MV。
- `analysis_tasks` 列表/筛选按 `(user_id, status, task_type, created_at)`，已加索引。

