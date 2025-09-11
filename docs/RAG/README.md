# AstroZi RAG 系统文档（总览）

本目录汇总命理 Agent（RAG 检索增强生成）在本项目中的架构、配置、使用与运维实践。适用于研发、运营与部署团队快速上手与日常维护。

## 目录
- [架构与能力](#架构与能力)
- [快速开始](#快速开始)
- [环境变量](#环境变量)
- [核心端点](#核心端点)
- [知识导入与后台](#知识导入与后台)
- [连接器（Notion/Drive）](#连接器notiondrive)
- [运维与维护](#运维与维护)
- [常见问题](#常见问题)

---

## 架构与能力

- 框架：Next.js 14+（App Router），TypeScript
- 检索：Supabase pgvector（向量维度 1536）
- 嵌入：Qwen/Qwen3-Embedding-8B（通过 SiliconFlow API）
- 推理：Qwen/DeepSeek 系列（通过 SiliconFlow API，可切换）
- RAG：LangChain.js 组装（RAG 检索 → Prompt 合成 → LLM 推理）
- UI：提供 admin 入口 `/knowledge-ingest`（预览切片 / 导入 / 检索验证 / 去重 / 重嵌 / 删除 / 批量任务入列与进度流）
- 批量任务：BullMQ（Redis）+ SSE 进度流 + Worker 脚本

详情参考：`docs/fortune-agent-development.md`

---

## 快速开始

1) 配置环境变量（示例参考 `.env.example`）
- 基础：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`
- AI：`SILICONFLOW_API_KEY`、`SILICONFLOW_BASE_URL`（可选）
- RAG：`ENABLE_FORTUNE_AGENT=true`、`FORTUNE_MODEL`、`EMBEDDING_MODEL`
- 队列：`REDIS_URL`
- 连接器（可选）：`NOTION_TOKEN`、`GDRIVE_SERVICE_ACCOUNT_EMAIL`、`GDRIVE_PRIVATE_KEY`

2) 执行数据库迁移
- 参见：`supabase/migrations/20250110_fortune_agent.sql:1`

3) 启动应用与 Worker
- 前端/API：`pnpm dev`
- Worker：`pnpm tsx scripts/knowledge-worker.ts`

4) 访问后台入口
- 管理页面：`/knowledge-ingest`（admin-only）

---

## 环境变量

核心环境变量（更多请看 `.env.example` 与 `docs/fortune-agent-development.md`）：

- Supabase
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- SiliconFlow（必填）
  - `SILICONFLOW_API_KEY`
  - `SILICONFLOW_BASE_URL`（默认 `https://api.siliconflow.com/v1`）
- RAG 开关与模型
  - `ENABLE_FORTUNE_AGENT=true`
  - `FORTUNE_MODEL`（`deepseek` / `qwen235b` / `qwen30b` / `qwen72b` / `qwen32b`）
  - `EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B`
- 队列
  - `REDIS_URL`（BullMQ）
- 连接器
  - Notion：`NOTION_TOKEN`（可选 `NOTION_DATABASE_ID`）
  - Google Drive：`GDRIVE_SERVICE_ACCOUNT_EMAIL`、`GDRIVE_PRIVATE_KEY`、（可选）`GDRIVE_IMPERSONATE_SUBJECT`

---

## 核心端点

- 问答（非流式）：`POST /api/fortune-agent`
- 问答（流式 SSE）：`POST /api/fortune-agent/stream`
- 统计：`GET /api/fortune-agent/stats`
- 知识搜索：`GET /api/knowledge/search?q=...&category=...&tags=...&limit=...`
- 知识导入（文本）：`POST /api/knowledge/import`（admin）
- 知识上传（PDF/TXT）：`POST /api/knowledge/upload`（admin）
- 切片预览（PDF/TXT/文本）：`POST /api/knowledge/preview-chunks`（admin）
- 维护（去重/重嵌/删除）：见 `docs/RAG/maintenance.md`
- 任务队列（入列/状态/流/列表/取消）：见 `docs/RAG/maintenance.md`

更多参数示例：见 `docs/RAG/api.md`

---

## 知识导入与后台

- 后台入口：`/knowledge-ingest`（admin-only）
  - 预览切片：可设置 `maxChars/overlapChars/minChars`，PDF 可选择去页眉/页脚
  - 导入：上传 PDF/TXT 或粘贴文本入库
  - 检索验证：输入关键词 + 标签，查看 Top‑k 片段与相似度
  - 维护工具：按 source 去重/删除、按 source/category/全量重嵌
  - 任务：Notion/Drive 入列批量导入，SSE 实时进度流与历史列表

导入策略与中文切割细节：见 `docs/RAG/ingestion.md`

---

## 连接器（Notion/Drive）

- Notion：Database 或 Page 拉取 → 文本渲染 → 中文切片 → 嵌入 → 入库
  - 支持属性映射：`tagPropertyName`、`categoryPropertyName`、`overrideCategoryWithNotion`
- Google Drive：PDF/TXT/Docs
  - PDF：二进制 → 解析分页 → 清洗 → 切片
  - TXT：文本 → 清洗 → 切片
  - Docs：导出 HTML → Turndown 转 Markdown → 切片

脚本使用：见 `docs/RAG/connectors.md`

---

## 运维与维护

- 去重 / 重嵌 / 删除 / 导出 / 重导：见 `docs/RAG/maintenance.md`
- 队列 Worker 与 SSE 进度流：见 `docs/RAG/maintenance.md`

---

## 常见问题

见 `docs/fortune-agent-development.md` 的“故障排查”章节，或 `docs/RAG/troubleshooting.md` 补充条目。

