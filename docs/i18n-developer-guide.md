# i18n 开发者指南

## 📖 概览

AstroZi 项目使用 **next-intl** 作为国际化解决方案，支持 3 种语言：简体中文 (zh)、英文 (en) 和日语 (ja)。

### 核心特性
- ✅ **路由级语言切换**：`/bazi` (中文), `/en/bazi` (英文), `/ja/bazi` (日语)
- ✅ **按需加载**：根据路由自动加载所需的翻译命名空间
- ✅ **TypeScript 类型安全**：所有翻译键都有类型提示
- ✅ **模块化命名空间**：翻译按功能模块组织，易于维护
- ✅ **中间件自动处理**：语言检测、重定向、Cookie 管理

---

## 🚀 快速开始

### 1. 在组件中使用翻译

#### 客户端组件
```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('submit')}</button>
    </div>
  );
}
```

#### 服务端组件
```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
    </div>
  );
}
```

### 2. 获取当前语言

#### 客户端
```typescript
'use client';

import { useLocale } from 'next-intl';

export default function MyComponent() {
  const locale = useLocale(); // 'zh' | 'en' | 'ja'

  return <div>Current language: {locale}</div>;
}
```

#### 服务端
```typescript
import { getLocale } from 'next-intl/server';

export default async function MyPage() {
  const locale = await getLocale();

  return <div>Current language: {locale}</div>;
}
```

### 3. 语言切换

```typescript
'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLanguage = (newLocale: 'zh' | 'en' | 'ja') => {
    let newPathname = pathname;

    // Remove current locale prefix (if not zh)
    if (currentLocale !== 'zh') {
      newPathname = pathname.replace(`/${currentLocale}`, '');
    }

    // Add new locale prefix (if not zh)
    if (newLocale !== 'zh') {
      newPathname = `/${newLocale}${newPathname || '/'}`;
    } else {
      newPathname = newPathname || '/';
    }

    router.push(newPathname);
  };

  return (
    <select value={currentLocale} onChange={(e) => switchLanguage(e.target.value as any)}>
      <option value="zh">简体中文</option>
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  );
}
```

---

## 📁 命名空间结构

### 可用命名空间

#### 核心命名空间
| 命名空间 | 用途 | 示例键 |
|---------|------|--------|
| `common` | 通用 UI 元素 | `loading`, `submit`, `cancel`, `save` |
| `navigation` | 导航菜单 | `home`, `bazi`, `ziwei`, `fortune` |
| `errors` | 错误消息 | `required`, `invalid`, `serverError` |
| `form` | 表单字段 | `name`, `email`, `birthDate`, `gender` |

#### 功能命名空间
| 命名空间 | 用途 | 页面路由 |
|---------|------|---------|
| `bazi` | 八字计算器 | `/bazi` |
| `ziwei` | 紫微斗数 | `/ziwei` |
| `astro/fortune` | 关帝求签 | `/fortune`, `/guandi` |
| `astro/karmaPalace` | 紫微宿世因缘 | `/ziwei/karma` |
| `charts` | 命盘管理 | `/charts` |
| `settings` | 设置页面 | `/settings` |
| `wiki` | 知识库 | `/wiki` |
| `pages` | 页面标题/副标题 | 所有页面 |
| `instructions` | 用户指引 | 所有功能页面 |

#### 用户功能命名空间
| 命名空间 | 用途 | 页面路由 |
|---------|------|---------|
| `user/profile` | 用户档案 | `/profile`, `/myprofile` |
| `user/membership` | 会员中心 | `/membership` |
| `user/subscription` | 订阅服务 | `/subscription` |
| `user/preferences` | 个人偏好 | `/preferences` |

#### Web3 命名空间
| 命名空间 | 用途 | 页面路由 |
|---------|------|---------|
| `web3/auth` | Web3 认证 | Web3 登录页面 |
| `web3/dashboard` | Web3 仪表板 | Web3 主页 |
| `web3/tasks` | Web3 任务 | Web3 任务页面 |
| `web3/layout` | Web3 布局 | Web3 所有页面 |

### 命名空间按需加载

命名空间根据路由自动加载，配置在 `i18n/loader.ts`：

```typescript
const ROUTE_NAMESPACE_MAP = [
  {
    pattern: /^\/(bazi|zh\/bazi|en\/bazi|ja\/bazi)/,
    namespaces: ['common', 'navigation', 'bazi', 'form', 'errors', 'categories']
  },
  {
    pattern: /^\/(ziwei|zh\/ziwei|en\/ziwei|ja\/ziwei)/,
    namespaces: ['common', 'navigation', 'ziwei', 'form', 'errors', 'categories']
  },
  // ... 更多路由映射
];
```

**优势**：
- ✅ 减少初始 bundle 大小（仅加载需要的命名空间）
- ✅ 提升首屏加载速度
- ✅ 自动化管理，无需手动导入

---

## 🔧 常见任务

### 添加新翻译

#### 1. 选择合适的命名空间

- **通用文本** → `common.json`
- **导航相关** → `navigation.json`
- **错误消息** → `errors.json`
- **表单字段** → `form.json`
- **特定功能** → 创建新命名空间

#### 2. 编辑 JSON 文件

```bash
# 添加到现有命名空间
i18n/messages/zh/common.json
i18n/messages/en/common.json
i18n/messages/ja/common.json
```

```json
// i18n/messages/zh/common.json
{
  "welcome": "欢迎",
  "submit": "提交",
  "newKey": "新的翻译"  // 添加这行
}
```

```json
// i18n/messages/en/common.json
{
  "welcome": "Welcome",
  "submit": "Submit",
  "newKey": "New Translation"  // 添加这行
}
```

```json
// i18n/messages/ja/common.json
{
  "welcome": "ようこそ",
  "submit": "送信",
  "newKey": "新しい翻訳"  // 添加这行
}
```

#### 3. 在组件中使用

```typescript
const t = useTranslations('common');
console.log(t('newKey')); // "新的翻译" / "New Translation" / "新しい翻訳"
```

### 创建新命名空间

#### 1. 创建 JSON 文件

```bash
# 创建 3 个语言版本
touch i18n/messages/zh/myFeature.json
touch i18n/messages/en/myFeature.json
touch i18n/messages/ja/myFeature.json
```

#### 2. 添加翻译内容

```json
// i18n/messages/zh/myFeature.json
{
  "title": "我的功能",
  "description": "这是一个新功能"
}
```

```json
// i18n/messages/en/myFeature.json
{
  "title": "My Feature",
  "description": "This is a new feature"
}
```

```json
// i18n/messages/ja/myFeature.json
{
  "title": "私の機能",
  "description": "これは新しい機能です"
}
```

#### 3. 注册命名空间

编辑 `i18n/messages/index.ts`：

```typescript
// 1. 导入所有语言版本
import myFeatureZh from './zh/myFeature.json';
import myFeatureEn from './en/myFeature.json';
import myFeatureJa from './ja/myFeature.json';

// 2. 添加到 NAMESPACES 数组
export const NAMESPACES = [
  // ... 现有命名空间
  'myFeature'
] as const;

// 3. 更新 Messages 类型
export type Messages = {
  // ... 现有类型
  'myFeature': typeof myFeatureEn;
};

// 4. 添加到 MESSAGE_LOADERS
export const MESSAGE_LOADERS: NamespaceLoaders = {
  zh: {
    // ... 现有 loaders
    'myFeature': () => import('./zh/myFeature.json').then((m) => m.default),
  },
  en: {
    // ... 现有 loaders
    'myFeature': () => import('./en/myFeature.json').then((m) => m.default),
  },
  ja: {
    // ... 现有 loaders
    'myFeature': () => import('./ja/myFeature.json').then((m) => m.default),
  },
};
```

#### 4. 添加路由映射（可选）

如果这个命名空间只在特定路由使用，编辑 `i18n/loader.ts`：

```typescript
const ROUTE_NAMESPACE_MAP = [
  // ... 现有映射
  {
    pattern: /^\/my-feature(?:\/|$)/,
    namespaces: ['common', 'navigation', 'myFeature']
  }
];
```

#### 5. 使用新命名空间

```typescript
'use client';

import { useTranslations } from 'next-intl';

export default function MyFeature() {
  const t = useTranslations('myFeature');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 参数化翻译

#### 简单参数
```json
{
  "greeting": "Hello, {name}!",
  "itemCount": "You have {count} items"
}
```

```typescript
const t = useTranslations('common');

t('greeting', { name: 'Alice' }); // "Hello, Alice!"
t('itemCount', { count: 5 }); // "You have 5 items"
```

#### 复数形式
```json
{
  "itemCount": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```

```typescript
t('itemCount', { count: 0 }); // "No items"
t('itemCount', { count: 1 }); // "One item"
t('itemCount', { count: 5 }); // "5 items"
```

#### 日期格式化
```typescript
import { useFormatter } from 'next-intl';

const format = useFormatter();

// 日期
format.dateTime(new Date(), {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

// 数字
format.number(1234567.89, {
  style: 'currency',
  currency: 'CNY'
});
```

### 嵌套翻译键

#### JSON 结构
```json
{
  "user": {
    "profile": {
      "title": "User Profile",
      "edit": "Edit Profile"
    },
    "settings": {
      "title": "Settings"
    }
  }
}
```

#### 使用方式 1：直接访问
```typescript
const t = useTranslations('common');

t('user.profile.title'); // "User Profile"
t('user.profile.edit'); // "Edit Profile"
```

#### 使用方式 2：命名空间嵌套
```typescript
const t = useTranslations('common.user.profile');

t('title'); // "User Profile"
t('edit'); // "Edit Profile"
```

---

## 🎯 最佳实践

### 1. 命名空间组织

#### ✅ 好的做法
```
i18n/messages/
├── zh/
│   ├── common.json          # 通用 UI
│   ├── navigation.json      # 导航
│   ├── bazi.json           # 八字功能
│   └── user/               # 用户相关
│       ├── profile.json
│       └── membership.json
```

#### ❌ 避免
```
i18n/messages/
├── zh/
│   └── everything.json     # 所有翻译在一个文件（难以维护）
```

### 2. 翻译键命名

#### ✅ 好的命名
```json
{
  "button.submit": "Submit",
  "button.cancel": "Cancel",
  "error.required": "This field is required",
  "error.invalid": "Invalid input"
}
```

#### ❌ 避免
```json
{
  "btn1": "Submit",           // 不清晰
  "err": "Error",             // 太简短
  "thisIsAVeryLongKeyNameThatIsHardToRemember": "Text"  // 太长
}
```

### 3. 保持键名对称

#### ✅ 好的做法
```json
// zh/common.json
{
  "welcome": "欢迎",
  "submit": "提交"
}

// en/common.json
{
  "welcome": "Welcome",
  "submit": "Submit"
}

// ja/common.json
{
  "welcome": "ようこそ",
  "submit": "送信"
}
```

#### ❌ 避免
```json
// zh/common.json
{
  "欢迎": "欢迎",            // 使用中文作为键名
  "submit": "提交"
}

// en/common.json
{
  "welcome": "Welcome",
  "submitButton": "Submit"  // 键名不一致
}
```

### 4. 使用 TypeScript 类型

```typescript
// ✅ 类型安全
import { useTranslations } from 'next-intl';

const t = useTranslations('common');
t('submit'); // ✅ 自动补全和类型检查

// ❌ 失去类型安全
const t = useTranslations('common' as any);
t('nonExistentKey'); // ❌ 不会报错，运行时才发现
```

### 5. 避免硬编码文本

#### ❌ 硬编码（不推荐）
```typescript
export default function MyComponent() {
  return (
    <div>
      <h1>欢迎</h1>
      <button>提交</button>
    </div>
  );
}
```

#### ✅ 使用翻译
```typescript
export default function MyComponent() {
  const t = useTranslations('common');

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('submit')}</button>
    </div>
  );
}
```

### 6. 命名空间粒度

#### ✅ 合适的粒度
```json
// bazi.json (八字功能专用)
{
  "title": "BaZi Calculator",
  "calculate": "Calculate",
  "result": "Result"
}
```

#### ❌ 粒度过细
```json
// bazi-title.json
{ "title": "BaZi Calculator" }

// bazi-buttons.json
{ "calculate": "Calculate" }

// bazi-results.json
{ "result": "Result" }
```

---

## 🔍 调试技巧

### 检查当前语言

```typescript
'use client';

import { useLocale } from 'next-intl';

export default function DebugLocale() {
  const locale = useLocale();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded">
      Current Locale: {locale}
    </div>
  );
}
```

### 检查已加载的命名空间

```typescript
'use client';

import { useMessages } from 'next-intl';

export default function DebugMessages() {
  const messages = useMessages();

  return (
    <div>
      <h3>Loaded Namespaces:</h3>
      <pre>{JSON.stringify(Object.keys(messages), null, 2)}</pre>
    </div>
  );
}
```

### 查找缺失的翻译

```bash
# 检查是否有 undefined 或翻译键显示在页面上
# 打开浏览器控制台，运行：
document.body.innerText.match(/\b[a-z]+\.[a-zA-Z.]+\b/g)
```

### 验证翻译键对称性

```bash
# 检查中英日翻译键是否一致
cd i18n/messages

# 获取 zh/common.json 的键
jq -r 'keys[]' zh/common.json | sort > /tmp/zh-keys.txt

# 获取 en/common.json 的键
jq -r 'keys[]' en/common.json | sort > /tmp/en-keys.txt

# 对比
diff /tmp/zh-keys.txt /tmp/en-keys.txt
```

---

## 🚨 常见问题

### 1. 翻译显示为键名

**问题**:
```
页面显示: "common.welcome" 而不是 "欢迎"
```

**原因**:
- 翻译键不存在
- 命名空间未加载
- 路由映射配置错误

**解决方案**:
1. 检查 JSON 文件中是否有该键
2. 检查 `i18n/loader.ts` 中的路由映射
3. 检查 `i18n/messages/index.ts` 中的命名空间注册

### 2. 语言切换不生效

**问题**:
```
点击语言切换按钮，URL 变化但内容不变
```

**原因**:
- Cookie 未正确设置
- 中间件配置错误
- 路由刷新问题

**解决方案**:
```typescript
// 确保使用 router.push 而不是 window.location.href
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push(newPathname); // ✅
// window.location.href = newPathname; // ❌
```

### 3. TypeScript 类型错误

**问题**:
```
Type 'string' is not assignable to type '"zh" | "en" | "ja"'
```

**解决方案**:
```typescript
// 使用类型断言
const locale = useLocale() as 'zh' | 'en' | 'ja';

// 或定义类型
type SupportedLanguage = 'zh' | 'en' | 'ja';
const locale = useLocale() as SupportedLanguage;
```

### 4. 刷新后语言丢失

**问题**:
```
用户切换到英文，刷新页面后回到中文
```

**原因**:
- Cookie 未持久化
- 中间件优先级问题

**解决方案**:
检查 `middleware.ts` 中的配置：
```typescript
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
```

### 5. 嵌套命名空间不工作

**问题**:
```typescript
useTranslations('user.profile'); // 返回 undefined
```

**解决方案**:
```typescript
// 方式 1: 使用点号访问
const t = useTranslations('user');
t('profile.title');

// 方式 2: 创建独立命名空间文件
// i18n/messages/zh/user/profile.json
const t = useTranslations('user/profile');
t('title');
```

---

## 📚 参考资源

### 官方文档
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization)

### 项目文件
- `i18n/messages/index.ts` - 命名空间注册
- `i18n/loader.ts` - 路由映射配置
- `i18n/request.ts` - next-intl 配置
- `middleware.ts` - 语言中间件

### 迁移文档
- `docs/i18n-migration-plan.md` - 迁移计划
- `docs/i18n-migration-progress.md` - 迁移进度
- `docs/phase{1-7}-complete-summary.md` - 各阶段总结

---

## 💡 提示与技巧

### 快速添加翻译的脚本

创建 `scripts/add-translation.sh`：
```bash
#!/bin/bash

NAMESPACE=$1
KEY=$2
ZH_TEXT=$3
EN_TEXT=$4
JA_TEXT=$5

# 添加到中文
jq --arg key "$KEY" --arg value "$ZH_TEXT" '.[$key] = $value' \
  i18n/messages/zh/$NAMESPACE.json > tmp.json && \
  mv tmp.json i18n/messages/zh/$NAMESPACE.json

# 添加到英文
jq --arg key "$KEY" --arg value "$EN_TEXT" '.[$key] = $value' \
  i18n/messages/en/$NAMESPACE.json > tmp.json && \
  mv tmp.json i18n/messages/en/$NAMESPACE.json

# 添加到日文
jq --arg key "$KEY" --arg value "$JA_TEXT" '.[$key] = $value' \
  i18n/messages/ja/$NAMESPACE.json > tmp.json && \
  mv tmp.json i18n/messages/ja/$NAMESPACE.json

echo "✅ Added '$KEY' to $NAMESPACE namespace"
```

使用方法：
```bash
chmod +x scripts/add-translation.sh
./scripts/add-translation.sh common newKey "新键" "New Key" "新しいキー"
```

### 翻译完整性检查脚本

创建 `scripts/check-translations.sh`：
```bash
#!/bin/bash

echo "Checking translation key symmetry..."

for namespace in common navigation errors form bazi ziwei; do
  echo "Checking $namespace..."

  zh_keys=$(jq -r 'keys[]' i18n/messages/zh/$namespace.json 2>/dev/null | sort)
  en_keys=$(jq -r 'keys[]' i18n/messages/en/$namespace.json 2>/dev/null | sort)
  ja_keys=$(jq -r 'keys[]' i18n/messages/ja/$namespace.json 2>/dev/null | sort)

  if [ "$zh_keys" != "$en_keys" ] || [ "$zh_keys" != "$ja_keys" ]; then
    echo "⚠️  Keys mismatch in $namespace"
  else
    echo "✅ $namespace OK"
  fi
done
```

### VS Code 代码片段

创建 `.vscode/i18n.code-snippets`：
```json
{
  "Use Translations Hook": {
    "prefix": "ut",
    "body": [
      "const t = useTranslations('${1:common}');",
      "$0"
    ],
    "description": "Import and use translations hook"
  },
  "Get Locale Hook": {
    "prefix": "ul",
    "body": [
      "const locale = useLocale();",
      "$0"
    ],
    "description": "Get current locale"
  }
}
```

---

## 🎓 学习路径

### 初学者
1. ✅ 阅读"快速开始"部分
2. ✅ 在现有页面添加一个简单翻译
3. ✅ 理解命名空间概念
4. ✅ 练习语言切换功能

### 中级开发者
1. ✅ 创建新命名空间
2. ✅ 配置路由映射
3. ✅ 使用参数化翻译
4. ✅ 理解按需加载机制

### 高级开发者
1. ✅ 自定义中间件行为
2. ✅ 优化 bundle size
3. ✅ 实现复杂的翻译逻辑
4. ✅ 贡献 i18n 工具和脚本

---

**文档版本**: v1.0.0
**最后更新**: 2025-10-03
**维护者**: AstroZi Development Team
