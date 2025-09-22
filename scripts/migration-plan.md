# 统一配置架构迁移计划

## 概述
将现有的AstroZi应用迁移到统一的配置化架构，支持Web3专版、Web2国际版和统一版的灵活部署。

## 迁移阶段

### 阶段一：配置系统集成 (1-2天)

#### 1.1 环境变量配置
- [ ] 更新 `.env.example` 文件，添加新的配置变量
- [ ] 创建不同部署目标的环境变量模板
- [ ] 配置Vercel/部署平台的环境变量

```bash
# 需要添加的环境变量
NEXT_PUBLIC_DEPLOYMENT_TARGET=unified-main
NEXT_PUBLIC_APP_MODE=unified
NEXT_PUBLIC_SUPPORTED_LANGUAGES=zh,en
NEXT_PUBLIC_DEFAULT_LANGUAGE=zh
```

#### 1.2 配置文件导入
- [ ] 在 `app/layout.tsx` 中导入配置系统
- [ ] 更新全局CSS变量注入
- [ ] 初始化功能开关管理器

#### 1.3 类型定义更新
- [ ] 更新现有类型定义以支持新配置
- [ ] 确保类型安全性

### 阶段二：组件迁移 (2-3天)

#### 2.1 核心UI组件替换
- [ ] 迁移 `Button` 组件到 `ThemedButton`
- [ ] 迁移 `Card` 组件到 `ThemedCard` 
- [ ] 迁移 `Input` 组件到 `ThemedInput`
- [ ] 更新表单组件使用主题化输入

#### 2.2 布局组件迁移
- [ ] 将现有布局包装到 `AdaptiveLayout`
- [ ] 更新导航组件使用 `AdaptiveNavigation`
- [ ] 统一页面结构和SEO配置

#### 2.3 聊天机器人组件适配
- [ ] 更新 `ChatHeader` 组件使用配置化多语言
- [ ] 修改 `useChatManager` 支持配置驱动的Master选择
- [ ] 适配不同模式的UI风格

### 阶段三：页面级迁移 (3-4天)

#### 3.1 主要页面迁移
```typescript
// 需要迁移的页面列表
const PAGES_TO_MIGRATE = [
  'app/home/page.tsx',
  'app/en/home/page.tsx', 
  'app/chatbot/page.tsx',
  'app/en/chatbot/page.tsx',
  'app/create-chart/page.tsx',
  'app/en/create-chart/page.tsx',
  'app/membership/page.tsx',
  'app/en/membership/page.tsx',
  'app/profile/page.tsx',
  'app/en/profile/page.tsx'
];
```

#### 3.2 认证系统集成
- [ ] 更新认证组件支持配置化Web2/Web3
- [ ] 修改 `WalletConnectAuth` 根据配置启用/禁用
- [ ] 统一用户上下文管理

#### 3.3 功能模块适配
- [ ] 分析报告页面根据配置显示不同功能
- [ ] 订阅系统根据部署模式调整
- [ ] 推荐系统配置化启用

### 阶段四：API和后端适配 (2-3天)

#### 4.1 API路由更新
- [ ] 更新认证相关API支持配置模式
- [ ] 修改使用统计API支持不同计费模式
- [ ] 适配聊天API的多语言和模式差异

#### 4.2 数据库和RLS策略
- [ ] 确保现有RLS策略兼容新配置
- [ ] 更新用户表结构支持多模式
- [ ] 适配订阅和积分系统

### 阶段五：部署配置 (1-2天)

#### 5.1 构建脚本更新
```json
{
  "scripts": {
    "build:web3": "NEXT_PUBLIC_DEPLOYMENT_TARGET=web3 NEXT_PUBLIC_APP_MODE=web3 NEXT_PUBLIC_DEFAULT_LANGUAGE=en pnpm build",
    "build:unified": "NEXT_PUBLIC_DEPLOYMENT_TARGET=unified NEXT_PUBLIC_APP_MODE=unified NEXT_PUBLIC_DEFAULT_LANGUAGE=zh pnpm build",
    "deploy:web3": "./scripts/deployment-scripts.sh full-deploy web3",
    "deploy:unified": "./scripts/deployment-scripts.sh full-deploy unified"
  }
}
```

#### 5.2 部署管道配置
- [ ] 配置不同分支对应不同部署目标
- [ ] 设置环境变量管理
- [ ] 配置域名和SSL证书

### 阶段六：测试和验证 (2-3天)

#### 6.1 功能测试
- [ ] 测试所有配置模式的基本功能
- [ ] 验证UI主题正确切换
- [ ] 确认功能开关正常工作

#### 6.2 兼容性测试
- [ ] 测试现有用户数据兼容性
- [ ] 验证不同语言版本功能
- [ ] 确认移动端适配正常

#### 6.3 性能测试
- [ ] 检查配置系统性能影响
- [ ] 优化包大小和加载速度
- [ ] 验证缓存策略有效性

## 风险评估和缓解

### 高风险项目
1. **用户认证兼容性** - 现有用户可能受到认证系统变更影响
   - 缓解：保持向后兼容，逐步迁移
   
2. **数据库结构变更** - 可能需要修改现有表结构
   - 缓解：使用数据库迁移脚本，确保零停机时间
   
3. **UI破坏性变更** - 主题系统可能导致视觉不一致
   - 缓解：保持现有样式作为fallback

### 中风险项目
1. **配置复杂度** - 过多配置选项可能导致维护困难
   - 缓解：详细的文档和类型安全
   
2. **性能影响** - 运行时配置检查可能影响性能
   - 缓解：适当的缓存和优化

## 回滚计划

每个阶段都需要准备回滚方案：

1. **代码层面**：使用feature flag控制新功能启用
2. **数据库层面**：保持向后兼容的schema变更
3. **部署层面**：保持原有部署方式作为备选

## 成功指标

- [ ] 所有现有功能在新架构下正常工作
- [ ] 可以成功部署不同模式的版本
- [ ] 用户体验无明显降级
- [ ] 代码维护性和可读性提升
- [ ] 支持快速添加新的部署模式

## 迁移检查清单

### 开发环境准备
- [ ] 本地环境配置新的环境变量
- [ ] IDE类型检查正常
- [ ] 开发服务器启动无错误

### 组件迁移检查
- [ ] 所有页面渲染正常
- [ ] 主题切换生效
- [ ] 响应式布局正常
- [ ] 交互功能正常

### 功能验证检查
- [ ] 用户认证流程完整
- [ ] API调用正常
- [ ] 数据存储和检索正常
- [ ] 错误处理有效

### 部署验证检查
- [ ] 构建过程成功
- [ ] 环境变量正确加载
- [ ] 静态资源正常
- [ ] 监控和日志正常

## 时间线

**总预计时间：10-15个工作日**

- 阶段一：第1-2天
- 阶段二：第3-5天  
- 阶段三：第6-9天
- 阶段四：第10-12天
- 阶段五：第13天
- 阶段六：第14-15天

每个阶段完成后需要进行代码审查和基本测试验证。
