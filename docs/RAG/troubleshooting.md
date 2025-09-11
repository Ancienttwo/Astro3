# 故障排查（RAG）

以下为常见问题与处理建议。更多详尽说明：`docs/fortune-agent-development.md`。

## 向量维度不匹配
- 错误：`Vector dimension mismatch. Expected 1536, got ...`
- 原因：混用了不同维度的 embedding 模型
- 处理：确保 `EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B`，全量重嵌（`/api/knowledge/reembed` 或 `reembed-*.ts`）

## SiliconFlow 超时/限流
- 现象：请求超时/429
- 处理：增大超时时间、加入限速与并发控制；必要时降低 `concurrency` 或上游 QPS

## PDF 页眉/页脚干扰
- 现象：切片内含“第N页/共M页”等噪声
- 处理：在后台/脚本开启 `removeHeadersFooters=true`，或调高阈值并重导；不佳的 PDF 可先用 `pdftotext` 预处理

## 任务不执行
- 现象：入列成功但没有进度
- 处理：确认已运行 Worker：`pnpm tsx scripts/knowledge-worker.ts`，并检查 `REDIS_URL`

## 权限错误
- 现象：调用 API 返回 403
- 处理：确保 admin 登录态；或确认服务端脚本使用 `SUPABASE_SERVICE_ROLE_KEY`

## 检索质量不佳
- 建议：
  - 调整切片参数（减小/增大 `maxChars`、增加 `overlapChars`）
  - 优化清洗（去页眉脚、断行合并）
  - 检索验证 Top‑k，检查是否召回正确语料

