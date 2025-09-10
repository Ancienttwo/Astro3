# AstroZi 统一配置架构实现指南

## 概述

这个统一配置架构允许从单一代码库部署多个版本的AstroZi应用：
- **Web3专版** (中英文) - 专注于区块链用户
- **Web2国际版** - 支持多语言的传统版本  
- **统一版本** - 支持Web2和Web3的完整版本

## 核心组件

### 1. 配置系统 (`lib/config/`)

#### `app-config.ts` - 应用核心配置
```typescript
// 使用示例
import { APP_CONFIG, isFeatureEnabled } from '@/lib/config/app-config';

// 检查功能
if (APP_CONFIG.features.chatbot) {
  // 渲染聊天机器人
}

// 检查认证方法
if (APP_CONFIG.auth.web3.enabled) {
  // 显示Web3登录选项
}
```

#### `deployment-config.ts` - 部署环境配置
```typescript
import { DEPLOYMENT_CONFIG, isWeb3Mode } from '@/lib/config/deployment-config';

// 获取当前部署模式
const isWeb3 = isWeb3Mode();

// 获取集成配置
const walletConfig = DEPLOYMENT_CONFIG.integrations.walletConnect;
```

#### `ui-theme-config.ts` - UI主题配置
```typescript
import { UI_THEME, COMPONENT_STYLES } from '@/lib/config/ui-theme-config';

// 使用主题颜色
const primaryColor = UI_THEME.colors.primary;

// 使用组件样式
const buttonStyle = COMPONENT_STYLES.button.primary;
```

#### `feature-flags.ts` - 功能开关管理
```typescript
import { isFeatureEnabled, setUserContext } from '@/lib/config/feature-flags';

// 设置用户上下文
setUserContext({ id: 'user123', role: 'premium' });

// 检查功能开关
if (isFeatureEnabled('tarot-reading')) {
  // 显示塔罗牌功能
}
```

### 2. 主题化组件 (`components/ui/`)

#### 使用主题化按钮
```tsx
import { ThemedButton } from '@/components/ui/themed-button';

<ThemedButton themeVariant="primary">
  立即体验
</ThemedButton>
```

#### 使用主题化卡片
```tsx
import { ThemedCard } from '@/components/ui/themed-card';

<ThemedCard themeVariant="elevated">
  <CardContent>内容</CardContent>
</ThemedCard>
```

### 3. 自适应布局 (`components/layout/`)

#### 基础页面布局
```tsx
import { AdaptiveLayout } from '@/components/layout/adaptive-layout';

export default function MyPage() {
  return (
    <AdaptiveLayout title="页面标题" description="页面描述">
      <div>页面内容</div>
    </AdaptiveLayout>
  );
}
```

#### 自适应导航
```tsx
import { AdaptiveNavigation } from '@/components/navigation/adaptive-navigation';

<AdaptiveNavigation 
  language="zh"
  variant="horizontal"
  user={currentUser}
/>
```

## 部署配置

### 环境变量设置

#### Web3中文版 (web3-cn)
```bash
NEXT_PUBLIC_DEPLOYMENT_TARGET=web3-cn
NEXT_PUBLIC_APP_MODE=web3
NEXT_PUBLIC_SUPPORTED_LANGUAGES=zh,en
NEXT_PUBLIC_DEFAULT_LANGUAGE=zh
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

#### Web3国际版 (web3-intl)
```bash
NEXT_PUBLIC_DEPLOYMENT_TARGET=web3-intl
NEXT_PUBLIC_APP_MODE=web3
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,zh
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

#### Web2全球版 (web2-global)
```bash
NEXT_PUBLIC_DEPLOYMENT_TARGET=web2-global
NEXT_PUBLIC_APP_MODE=web2
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,zh,ja,ko,es,fr
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

#### 统一版本 (unified-main)
```bash
NEXT_PUBLIC_DEPLOYMENT_TARGET=unified-main
NEXT_PUBLIC_APP_MODE=unified
NEXT_PUBLIC_SUPPORTED_LANGUAGES=zh,en
NEXT_PUBLIC_DEFAULT_LANGUAGE=zh
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### 构建和部署

#### 使用部署脚本
```bash
# 构建特定版本
./scripts/deployment-scripts.sh build web3-cn

# 生成环境变量模板
./scripts/deployment-scripts.sh generate-env web3-cn

# 完整部署流程
./scripts/deployment-scripts.sh full-deploy web3-cn
```

#### 手动构建
```bash
# Web3中文版
NEXT_PUBLIC_DEPLOYMENT_TARGET=web3-cn npm run build

# Web2全球版
NEXT_PUBLIC_DEPLOYMENT_TARGET=web2-global npm run build
```

## 功能差异化

### 不同版本的功能矩阵

| 功能 | Web3专版 | Web2国际版 | 统一版本 |
|------|----------|------------|----------|
| Web3钱包登录 | ✅ | ❌ | ✅ |
| 邮箱/社交登录 | ❌ | ✅ | ✅ |
| 八字分析 | ✅ | ✅ | ✅ |
| 紫微斗数 | ✅ | ✅ | ✅ |
| 塔罗牌占卜 | ❌ | ✅ | ❌ |
| 多语言支持 | 中英 | 全语言 | 中英 |
| 订阅付费 | 代币 | 法币 | 两者 |

### 条件渲染示例

```tsx
import { isFeatureEnabled } from '@/lib/config/feature-flags';
import { APP_CONFIG } from '@/lib/config/app-config';

function MyComponent() {
  return (
    <div>
      {/* 仅Web3版本显示 */}
      {APP_CONFIG.auth.web3.enabled && (
        <WalletConnectButton />
      )}
      
      {/* 仅Web2版本显示 */}
      {isFeatureEnabled('tarot-reading') && (
        <TarotReadingCard />
      )}
      
      {/* 根据语言显示不同内容 */}
      {APP_CONFIG.defaultLanguage === 'zh' ? (
        <ChineseContent />
      ) : (
        <EnglishContent />
      )}
    </div>
  );
}
```

## 聊天机器人适配

### 多语言Master配置

现有的 `config/chatbot.ts` 已支持多语言：

```typescript
import { getMastersForLanguage } from '@/config/chatbot';

// 获取中文版Master
const zhMasters = getMastersForLanguage('zh');

// 获取英文版Master  
const enMasters = getMastersForLanguage('en');
```

### 聊天组件更新

`ChatHeader` 组件已支持语言参数：

```tsx
<ChatHeader
  currentMaster={currentMaster}
  language="en"  // 或 "zh"
  // ... 其他props
/>
```

## 性能优化

### 配置缓存
配置系统在构建时生成，运行时不会产生额外开销。

### 代码分割
不同模式的特定代码可以通过动态导入实现按需加载：

```tsx
// 仅在Web3模式下加载钱包组件
const WalletComponent = lazy(() => 
  APP_CONFIG.auth.web3.enabled 
    ? import('@/components/WalletConnectAuth')
    : Promise.resolve({ default: () => null })
);
```

### 功能开关性能
功能开关检查基于静态配置，性能影响微乎其微。

## 监控和调试

### 开发环境调试
在开发环境下，页面右下角会显示配置调试信息：
- 当前部署模式
- UI主题
- 启用的功能
- 认证方法

### 生产环境监控
```typescript
// 添加配置监控
if (typeof window !== 'undefined' && window.gtag) {
  window.gtag('config', GA_ID, {
    custom_map: {
      deployment_target: DEPLOYMENT_CONFIG.target,
      app_mode: APP_CONFIG.mode
    }
  });
}
```

## 维护指南

### 添加新功能
1. 在 `feature-flags.ts` 中定义功能开关
2. 在相应的配置文件中添加配置项
3. 使用 `isFeatureEnabled()` 进行条件渲染
4. 更新文档和类型定义

### 添加新部署目标
1. 在 `deployment-config.ts` 中添加新的模板
2. 更新部署脚本支持新目标
3. 配置相应的环境变量
4. 测试所有功能正常工作

### 更新UI主题
1. 在 `ui-theme-config.ts` 中修改主题配置
2. 更新组件样式映射
3. 测试所有页面的视觉效果
4. 确保响应式设计正常

## 最佳实践

### 配置使用
- 优先使用配置常量而非硬编码值
- 在组件顶层进行配置检查，避免深度嵌套
- 使用TypeScript类型保证配置安全

### 组件开发
- 新组件优先使用主题化版本
- 保持组件的配置无关性，通过props传递差异
- 使用功能开关控制条件渲染

### 测试策略
- 为每种部署模式编写测试用例
- 使用快照测试确保UI一致性
- 模拟不同配置进行单元测试

这个统一架构提供了强大的灵活性，同时保持了代码的可维护性。通过配置驱动的方式，可以轻松支持不同的市场需求和用户群体。