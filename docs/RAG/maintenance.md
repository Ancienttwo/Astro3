# 运维与维护（去重 / 重嵌 / 删除 / 导出 / 重导 / 队列）

本页汇总知识库维护操作与批量任务的使用。

## 去重

- 按 `source` 去重：`POST /api/knowledge/dedupe`（admin）
- 逻辑：基于 `metadata.checksum` 精确去重，同步补写缺失校验和
- 实现：`lib/services/knowledge-maintenance.ts:1`

示例：
```
curl -X POST /api/knowledge/dedupe \
  -H 'Content-Type: application/json' \
  -d '{"source":"bookA.pdf"}'
```

## 重嵌（Re-embed）

- 选择器：按 `source` / `category` / 全量
- 接口：`POST /api/knowledge/reembed`（admin）
- 实现：`lib/services/knowledge-maintenance.ts:1`

示例：
```
curl -X POST /api/knowledge/reembed \
  -H 'Content-Type: application/json' \
  -d '{"category":"bazi"}'
```

## 删除（按 source）

- 接口：`DELETE /api/knowledge/by-source?source=...`（admin）

## 导出 / 重导

- 导出 JSON：`scripts/export-knowledge.ts:1`
- 导出 Markdown：`scripts/export-knowledge-markdown.ts:1`
- 重导 JSON：`scripts/reimport-knowledge.ts:1`（支持 `--replace` 先删旧）

示例：
```
# 导出某个 source
npx tsx scripts/export-knowledge.ts --source bookA.pdf

# 重导并替换同源旧数据
npx tsx scripts/reimport-knowledge.ts --file exports/knowledge-source-bookA-pdf.json --replace
```

## 队列与进度（BullMQ + SSE）

- Worker：`pnpm tsx scripts/knowledge-worker.ts`（需要 `REDIS_URL`）
- 入列：`POST /api/knowledge/jobs/enqueue`（admin）
- 状态：`GET /api/knowledge/jobs/status?id=...`（admin）
- 进度流（SSE）：`GET /api/knowledge/jobs/stream?id=...`（admin）
- 列表：`GET /api/knowledge/jobs/list?state=all|waiting|...&type=all|notion|drive`
- 取消：`DELETE /api/knowledge/jobs/cancel?id=...`（waiting/delayed/paused 可取消）

后台页面 `/knowledge-ingest` 已集成入列、进度流、历史列表与取消能力。

