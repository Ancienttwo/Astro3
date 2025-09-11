# 外部连接器（Notion / Google Drive）

本页介绍如何使用 Notion 与 Google Drive 连接器抓取内容后接入中文切片与向量入库。

## Notion 连接器

- 实现：`lib/connectors/notion.ts:1`
- 入口脚本：`scripts/ingest-notion.ts:1`
- 环境：`NOTION_TOKEN`

支持两种来源：
- Database：`--db <databaseId>` 全量分页拉取
- Pages：`--pages <id1,id2>` 指定页面

属性映射与分类：
- `--tagProperty` / `--tagPropertyName`：Notion 中标签字段名（multi_select）
- `--categoryProperty` / `--categoryPropertyName`：分类字段名（select/status/multi_select）
- `--overrideCategory true`：用 Notion 分类覆盖入库 `category`

切片参数：
- `--maxChars`、`--overlapChars`、`--minChars`

示例：
```
# 从 Database 导入并按 Notion 字段映射标签/分类
npx tsx scripts/ingest-notion.ts \
  --category bazi \
  --db <databaseId> \
  --tagProperty Tags \
  --categoryProperty Category \
  --overrideCategory true \
  --maxChars 3000 --overlapChars 150 --minChars 200 \
  --tags 财运,事业
```

## Google Drive 连接器

- 实现：`lib/connectors/drive.ts:1`
- 入口脚本：`scripts/ingest-drive.ts:1`
- 环境：`GDRIVE_SERVICE_ACCOUNT_EMAIL`、`GDRIVE_PRIVATE_KEY`（支持 \n）

来源选择：
- 文件夹：`--folder <folderId>`
- 指定文件：`--files <id1,id2>`

类型支持：
- PDF：二进制下载 → 解析分页 → 清洗 → 切片
- TXT：文本下载 → 清洗 → 切片
- Google Docs：导出 HTML → Turndown 转 Markdown → 切片

切片参数：
- `--maxChars`、`--overlapChars`、`--minChars`、`--removeHeadersFooters`

示例：
```
# 从 Drive 文件夹导入，启用去页眉/页脚
npx tsx scripts/ingest-drive.ts \
  --category ziwei \
  --folder <folderId> \
  --maxChars 3000 --overlapChars 150 --minChars 200 --removeHeadersFooters true \
  --tags 财运
```

## Admin 后台批量入列（推荐）

- 页面：`/knowledge-ingest`
  - Notion：Database/Page IDs + 标签/分类映射 + 切片参数 + 并发/页大小
  - Drive：Folder/File IDs + 切片参数 + 并发
  - 入列后开启 SSE 进度流实时查看

