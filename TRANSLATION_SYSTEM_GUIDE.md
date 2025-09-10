# 翻译管理系统使用指南

## 🎯 系统概述

这是一个完整的翻译管理系统，支持多语言翻译管理、专业术语管理、版本控制、批量导入导出等功能。特别适合处理大量专有名词的国际化项目。

## 🏗️ 系统架构

### 数据库结构
- **translations**: 翻译条目主表
- **translation_categories**: 翻译分类表
- **translation_history**: 版本历史记录
- **translation_comments**: 协作评论
- **translation_stats**: 统计信息

### API接口
- `/api/translations` - 翻译CRUD操作
- `/api/translations/categories` - 分类管理
- `/api/translations/stats` - 统计信息
- `/api/translations/import` - 批量导入
- `/api/translations/export` - 批量导出
- `/api/translations/sync` - 自动同步
- `/api/translations/backup` - 备份管理

### 前端界面
- `/admin/translations` - 翻译管理后台

## 🚀 快速开始

### 1. 数据库初始化

```bash
# 在Supabase SQL编辑器中执行
psql -f database-translation-system.sql
```

### 2. 访问管理后台

访问 `/admin/translations` 开始管理翻译内容。

### 3. 基本操作流程

1. **添加翻译条目**: 点击"新增翻译"按钮
2. **编辑翻译**: 点击条目旁的编辑按钮
3. **批量导入**: 使用"导入"功能批量添加翻译
4. **同步字典**: 将已批准的翻译同步到代码

## 📋 核心功能

### 翻译状态管理
- **pending**: 待翻译
- **translated**: 已翻译
- **reviewed**: 已审核
- **approved**: 已批准（可同步到代码）

### 专业术语支持
- 支持标记专业术语
- 术语独立管理
- 保持术语一致性

### 分类系统
预设分类包括：
- auth - 认证系统
- profile - 个人资料
- membership - 会员系统
- bazi - 八字系统
- ziwei - 紫微斗数
- terminology - 专业术语
- 等等...

### 优先级管理
- 1-5级优先级
- 高优先级翻译优先处理

## 🔄 工作流程

### 标准翻译流程
1. **创建翻译条目** (状态: pending)
2. **完成翻译** (状态: translated)
3. **审核翻译** (状态: reviewed)
4. **批准发布** (状态: approved)
5. **同步到代码** (自动更新字典文件)

### 批量导入流程
1. 准备JSON格式数据
2. 选择导入模式：
   - **skip**: 跳过已存在
   - **update**: 更新已存在
   - **replace**: 替换已存在
3. 执行导入
4. 检查导入结果

## 📤 导入导出

### 导入格式示例
```json
[
  {
    "key": "title",
    "category_name": "profile",
    "chinese_text": "个人资料",
    "english_text": "Profile",
    "context": "页面标题",
    "notes": "用户个人信息页面的标题",
    "is_terminology": false,
    "priority": 3
  },
  {
    "key": "minggong",
    "category_name": "terminology",
    "chinese_text": "命宫",
    "english_text": "Life Palace",
    "context": "紫微斗数专业术语",
    "is_terminology": true,
    "priority": 5
  }
]
```

### 导出格式
支持导出为JSON或CSV格式，包含完整的翻译信息。

## 🔄 自动同步

### 同步机制
系统支持将已批准的翻译自动同步到代码中的字典文件：

```typescript
// 自动生成的字典文件
export const dictionaries = {
  zh: {
    profile: {
      title: "个人资料",
      // ...
    }
  },
  en: {
    profile: {
      title: "Profile",
      // ...
    }
  }
};
```

### 同步API
```bash
# 执行同步
POST /api/translations/sync

# 获取同步状态
GET /api/translations/sync
```

## 💾 备份系统

### 创建备份
```bash
POST /api/translations/backup
Content-Type: application/json

{
  "description": "发布前备份"
}
```

### 恢复备份
```bash
PUT /api/translations/backup
Content-Type: application/json

{
  "version": "v1703123456789"
}
```

### 备份管理
- 自动版本命名
- 完整数据备份
- 快速恢复功能
- 备份历史记录

## 📊 统计监控

### 总体统计
- 总翻译条目数
- 各状态分布
- 完成百分比

### 分类统计
- 每个分类的翻译进度
- 术语vs普通翻译统计
- 优先级分布

## 🔐 权限管理

### 管理员权限
- 访问所有翻译
- 创建/编辑/删除翻译
- 导入导出操作
- 同步和备份操作

### 用户权限
- 查看已批准的翻译
- 添加评论建议

## 🛠️ 高级功能

### 版本控制
- 自动记录所有变更
- 完整的历史追踪
- 变更对比功能

### 协作功能
- 翻译评论系统
- 状态流转记录
- 多人协作支持

### 搜索过滤
- 全文搜索支持
- 多维度筛选
- 分页浏览

## 🔧 开发集成

### 在代码中使用翻译
```typescript
import { useI18n } from '@/lib/i18n/useI18n';

function MyComponent() {
  const t = useI18n('en'); // 或 'zh'
  
  return (
    <div>
      <h1>{t.profile.title}</h1>
      <p>{t.profile.description}</p>
    </div>
  );
}
```

### 自动同步集成
翻译更新后，可以通过Webhook或定时任务自动触发同步：

```typescript
// 在翻译更新后触发同步
await fetch('/api/translations/sync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 📝 最佳实践

### 翻译键命名
- 使用小写字母和下划线
- 保持命名语义化
- 分类明确

### 专业术语管理
- 统一术语翻译
- 保持专业术语的一致性
- 术语优先级设为5

### 工作流程
1. 先完成高优先级翻译
2. 定期审核翻译质量
3. 批量批准后统一同步
4. 重要更新前创建备份

## 🚨 注意事项

1. **数据安全**: 重要更新前请创建备份
2. **同步时机**: 建议在低峰期进行同步操作
3. **权限控制**: 确保只有管理员能执行关键操作
4. **版本管理**: 保留重要版本的备份文件

## 📞 技术支持

如有问题，请检查：
1. 数据库连接是否正常
2. 权限配置是否正确
3. API路由是否正确注册
4. 文件写入权限是否充足

---

**系统版本**: v1.0  
**最后更新**: 2024-01-20  
**维护者**: AI助手 