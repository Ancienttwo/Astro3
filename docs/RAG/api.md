# API 参考（RAG 相关）

本页列出与 RAG/知识库相关的 API 端点与示例。

## 命理问答

- 非流式：`POST /api/fortune-agent`
- 流式（SSE）：`POST /api/fortune-agent/stream`

请求体（示例）：
```
{
  "query": "我今年的财运如何？",
  "category": "bazi"
}
```

## 统计

- `GET /api/fortune-agent/stats`

## 知识库检索

- `GET /api/knowledge/search?q=关键词&category=bazi&tags=财运,事业&limit=5`

## 知识导入

- 文本：`POST /api/knowledge/import`（admin）
```
{
  "category": "bazi",
  "content": "文本...",
  "metadata": { "source": "bookA.pdf", "tags": ["财运"] }
}
```

- 文件：`POST /api/knowledge/upload`（admin）
  - multipart form-data：`file`（.pdf/.txt）、`category`、`source?`、`metadata?`（JSON 字符串）

## 切片预览（推荐）

- `POST /api/knowledge/preview-chunks`（admin）
  - multipart：`file` + 参数 `maxChars/overlapChars/minChars/removeHeadersFooters`
  - JSON：`{ text, maxChars, overlapChars, minChars, removeHeadersFooters }`

## 维护接口

- 去重：`POST /api/knowledge/dedupe`（admin）
- 重嵌：`POST /api/knowledge/reembed`（admin）
- 删除：`DELETE /api/knowledge/by-source?source=...`（admin）

## 任务队列（批量导入）

- 入列：`POST /api/knowledge/jobs/enqueue`（admin）
```
// Notion 示例
{
  "type": "notion",
  "options": {
    "category": "bazi",
    "databaseId": "...",
    "tagPropertyName": "Tags",
    "categoryPropertyName": "Category",
    "overrideCategoryWithNotion": true,
    "chunkOptions": {"maxChars": 3000, "overlapChars": 150, "minChars": 200}
  }
}
```

```
// Drive 示例
{
  "type": "drive",
  "options": {
    "category": "ziwei",
    "folderId": "...",
    "chunkOptions": {"maxChars": 3000, "overlapChars": 150, "minChars": 200, "removeHeadersFooters": true}
  }
}
```

- 状态：`GET /api/knowledge/jobs/status?id=...`（admin）
- 进度流（SSE）：`GET /api/knowledge/jobs/stream?id=...`（admin）
- 列表：`GET /api/knowledge/jobs/list?state=all|waiting|...&type=all|notion|drive`
- 取消：`DELETE /api/knowledge/jobs/cancel?id=...`（waiting/delayed/paused）

