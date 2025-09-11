# 知识导入与中文切片（Ingestion）

本页描述 PDF/TXT 的中文高质量解析、清洗、切片与入库流程，以及使用后台页面/脚本/API 的方式。

## 流程概览

PDF/TXT/外部源 → 解析为文本 → 清洗（去页眉脚/断行合并）→ 中文分段/句子四级切片 → 嵌入（1536 维，Qwen3-Embedding-8B）→ `fortune_knowledge`

对应实现：
- 解析：`lib/services/pdf-parser.ts:1`
- 清洗与切片：`lib/services/chinese-chunker.ts:1`
- 入库：`lib/services/knowledge-service.ts:1`

## 切片参数（可调）

- `maxChars`：默认 2800（≈700 tokens）
- `overlapChars`：默认 120（上下文重叠）
- `minChars`：默认 200（避免过短片段）
- PDF 额外：`removeHeadersFooters`（默认 true，跨页频次剔除）

后台 `/knowledge-ingest` 的“切片参数”可调；脚本与连接器也可传入 `chunkOptions` 覆盖。

## 后台导入

- 上传（PDF/TXT）：`POST /api/knowledge/upload`（admin）
- 文本导入：`POST /api/knowledge/import`（admin）
- 切片预览：`POST /api/knowledge/preview-chunks`（支持 multipart 文件或 JSON 文本），返回切片数量、每片长度/预估 tokens、预览内容
- 检索验证：`GET /api/knowledge/search?q=关键词&category=bazi&tags=财运,事业&limit=5`

## 脚本导入

- 从本地文件批量导入（示例脚本）：`scripts/import-fortune-knowledge.ts:1`
- 从连接器导入：见 `docs/RAG/connectors.md`

## 元数据规范（建议）

- `metadata` 建议包含：
  - `source`：来源标识（文件名/URL/文档ID）
  - `filetype`：pdf|txt|md等
  - `chunk_index`：片段序号
  - `checksum`：内容校验哈希（用于去重）
  - 可选：`tags`、`title`、页码范围、原始系统字段（notion_page_id/drive_file_id 等）

入库表：`fortune_knowledge(embedding vector(1536), category, content, metadata)`。

