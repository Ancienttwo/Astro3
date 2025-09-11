# 产品需求文档 (PRD) - 命理Agent系统

## 1. 产品概述

### 1.1 产品名称
AstroZi Fortune Agent - 智能命理分析系统

### 1.2 产品定位
基于LangChain和RAG技术的智能命理咨询服务，通过向量数据库检索传统命理知识，结合大语言模型提供专业、准确的命理解答。

### 1.3 目标用户
- 对中国传统命理文化感兴趣的用户
- 寻求人生指导和心理安慰的用户
- 需要快速获得命理解读的用户

## 2. 核心功能

### 2.1 智能问答
- **功能描述**：用户输入命理相关问题，系统基于知识库提供专业解答
- **输入**：自然语言问题
- **输出**：结构化的命理解读结果
- **技术实现**：LangChain + SiliconFlow API + Supabase Vector Store

### 2.2 知识检索 (RAG)
- **功能描述**：从海量命理知识库中检索最相关的内容
- **检索类别**：
  - 八字命理 (bazi)
  - 紫微斗数 (ziwei)
  - 关帝灵签 (guandi)
  - 风水知识 (fengshui)
- **相似度算法**：余弦相似度
- **返回数量**：Top 5 相关文档

### 2.3 多模型支持
- **可用模型**（通过SiliconFlow）：
  - DeepSeek V3.1 (深度推理)
  - Qwen3-235B-Thinking (通用对话，最强推理能力)
  - Qwen3-30B-Thinking (快速对话，平衡性能)
  - Qwen3-Embedding-8B (向量嵌入)
  - Qwen2.5系列 (备选方案)
- **模型切换**：通过环境变量配置

### 2.4 上下文增强
- **功能描述**：基于用户历史和检索结果构建丰富上下文
- **上下文包含**：
  - 相关知识片段
  - 用户查询历史
  - 命理术语解释

## 3. 非功能需求

### 3.1 性能要求
- 响应时间：< 3秒
- 并发支持：100 QPS
- 向量检索：< 500ms
- 模型推理：< 2秒

### 3.2 可靠性
- 系统可用性：99.9%
- 错误处理：优雅降级
- 数据备份：每日自动备份

### 3.3 安全性
- API认证：Bearer Token
- 用户隔离：基于user_id的数据隔离
- 敏感信息：不记录个人隐私信息
- Rate Limiting：防止滥用

### 3.4 可扩展性
- 水平扩展：支持多实例部署
- 知识库扩展：支持增量更新
- 模型扩展：支持新模型接入

## 4. 数据模型

### 4.1 知识库表 (fortune_knowledge)
```sql
- id: UUID
- category: TEXT (分类)
- content: TEXT (内容)
- embedding: VECTOR(1536) (向量)
- metadata: JSONB (元数据)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### 4.2 使用日志表 (agent_usage_logs)
```sql
- id: UUID
- user_id: UUID (用户ID)
- query: TEXT (查询)
- category: TEXT (类别)
- response: TEXT (响应)
- tokens_used: INT (Token用量)
- created_at: TIMESTAMP
```

## 5. API接口

### 5.1 命理问答接口
**POST** `/api/fortune-agent`

**请求参数**：
```json
{
  "query": "我今年的财运如何？",
  "category": "bazi" // 可选：bazi/ziwei/guandi
}
```

**响应格式**：
```json
{
  "success": true,
  "data": {
    "answer": "根据您的八字分析...",
    "sources": [
      {
        "category": "bazi",
        "relevance": 0.95
      }
    ],
    "usage": {
      "tokens": 1500,
      "cost": 0.003
    }
  }
}
```

## 6. 用户体验

### 6.1 交互流程
1. 用户输入命理问题
2. 系统显示加载状态
3. 返回结构化解答
4. 提供相关问题推荐
5. 支持追问和深入探讨

### 6.2 响应质量
- 专业术语解释
- 易于理解的语言
- 积极正面的引导
- 避免绝对化表述

### 6.3 错误处理
- 知识库无相关内容：提供通用指导
- 模型服务异常：切换备用模型
- 超时处理：返回友好提示

## 7. 部署架构

### 7.1 技术栈
- **前端**：Next.js + TypeScript
- **后端**：Next.js API Routes
- **向量数据库**：Supabase pgvector
- **LLM服务**：SiliconFlow API
- **框架**：LangChain.js

### 7.2 环境配置
```env
SILICONFLOW_API_KEY=xxx
SILICONFLOW_BASE_URL=https://api.siliconflow.com/v1
FORTUNE_MODEL=qwen235b # deepseek/qwen235b/qwen30b/qwen72b/qwen32b
EMBEDDING_MODEL=Qwen/Qwen3-Embedding-8B
ENABLE_FORTUNE_AGENT=true
SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
```

## 8. 成功指标

### 8.1 技术指标
- API响应时间 < 3s (P95)
- 向量检索准确率 > 90%
- 系统可用性 > 99.9%

### 8.2 业务指标
- 日活跃用户 (DAU)
- 平均会话长度
- 用户满意度评分
- 问题解决率

## 9. 项目里程碑

### Phase 1 - MVP (第1周)
- ✅ 基础架构搭建
- ✅ SiliconFlow集成
- ✅ 向量数据库配置
- ✅ 基础API实现

### Phase 2 - 知识库建设 (第2周)
- [ ] 八字知识导入
- [ ] 紫微知识导入
- [ ] 关帝灵签导入
- [ ] 知识质量优化

### Phase 3 - 功能增强 (第3-4周)
- [ ] 对话历史管理
- [ ] 个性化推荐
- [ ] 多轮对话支持
- [ ] 用户反馈机制

### Phase 4 - 优化部署 (第5周)
- [ ] 性能优化
- [ ] 缓存策略
- [ ] 监控告警
- [ ] 生产环境部署

## 10. 风险与对策

### 10.1 技术风险
- **风险**：模型响应速度慢
- **对策**：实施缓存策略，使用更快的模型

### 10.2 内容风险
- **风险**：命理解答可能引起争议
- **对策**：添加免责声明，强调娱乐性质

### 10.3 成本风险
- **风险**：API调用成本过高
- **对策**：实施用户配额，优化模型选择

---

*文档版本：v1.0*
*更新日期：2025-01-10*
*负责人：Winston (架构师)*