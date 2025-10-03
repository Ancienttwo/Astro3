# Phase 7 测试计划：i18n 迁移验证

## 📋 测试概览

### 测试目标
验证 i18n 架构迁移后的功能完整性、性能表现和用户体验。

### 测试范围
- ✅ 语言切换功能（3种语言：zh, en, ja）
- ✅ 路由导航（带语言前缀和无前缀）
- ✅ 翻译内容完整性（所有页面）
- ✅ 命名空间加载（按路由）
- ✅ 性能指标（加载速度、bundle size）
- ✅ 浏览器兼容性（Chrome, Firefox, Safari）
- ✅ SEO 友好性（URL 结构、meta 标签）

### 测试环境
- **本地开发**: `npm run dev`
- **构建测试**: `npm run build && npm run start`
- **浏览器**: Chrome 120+, Firefox 121+, Safari 17+
- **设备**: Desktop, Mobile viewport

## 🎯 测试用例

### 1. 语言切换功能测试

#### 测试用例 1.1: LanguageSelector 组件
**测试步骤**:
1. 访问任意页面 (如 `/`)
2. 点击语言选择器
3. 选择 "English"
4. 验证 URL 变为 `/en/...`
5. 验证页面内容切换为英文
6. 选择 "日本語"
7. 验证 URL 变为 `/ja/...`
8. 验证页面内容切换为日文
9. 选择 "简体中文"
10. 验证 URL 变为 `/...` (无前缀)
11. 验证页面内容切换为中文

**预期结果**:
- ✅ URL 正确更新
- ✅ 内容即时切换
- ✅ 无页面刷新
- ✅ 语言偏好保存到 cookie

**测试脚本**:
```typescript
// Playwright 测试示例
test('Language selector switches correctly', async ({ page }) => {
  await page.goto('/');

  // Switch to English
  await page.click('[data-testid="language-selector"]');
  await page.click('text=English');
  await expect(page).toHaveURL(/\/en\//);
  await expect(page.locator('h1')).toContainText(/Astrology|Fortune/);

  // Switch to Japanese
  await page.click('[data-testid="language-selector"]');
  await page.click('text=日本語');
  await expect(page).toHaveURL(/\/ja\//);

  // Switch back to Chinese
  await page.click('[data-testid="language-selector"]');
  await page.click('text=简体中文');
  await expect(page).toHaveURL(/^(?!\/(?:en|ja)\/).*$/);
});
```

#### 测试用例 1.2: 语言持久化
**测试步骤**:
1. 切换到英文
2. 刷新页面
3. 验证仍为英文
4. 关闭浏览器
5. 重新打开并访问站点
6. 验证语言偏好保持

**预期结果**:
- ✅ Cookie `NEXT_LOCALE=en` 存在
- ✅ 刷新后语言不变
- ✅ 跨会话保持

### 2. 路由导航测试

#### 测试用例 2.1: 直接 URL 访问
**测试 URLs**:
```
✅ / (中文首页)
✅ /en (英文首页)
✅ /ja (日文首页)
✅ /bazi (中文八字)
✅ /en/bazi (英文八字)
✅ /ja/bazi (日文八字)
✅ /ziwei (中文紫微)
✅ /en/ziwei (英文紫微)
✅ /fortune (中文关帝)
✅ /en/fortune (英文关帝)
```

**测试步骤**:
1. 在浏览器直接输入 URL
2. 验证页面正确加载
3. 验证语言正确
4. 验证翻译内容正确

**预期结果**:
- ✅ 所有 URL 可访问
- ✅ 语言检测正确
- ✅ 内容翻译准确

#### 测试用例 2.2: 内部链接导航
**测试步骤**:
1. 从英文首页 `/en` 开始
2. 点击导航菜单 "BaZi Calculator"
3. 验证跳转到 `/en/bazi`
4. 验证语言保持为英文
5. 点击 "Home"
6. 验证跳转到 `/en`

**预期结果**:
- ✅ 导航保持语言上下文
- ✅ URL 前缀一致
- ✅ 无语言切换

### 3. 翻译内容完整性测试

#### 测试用例 3.1: 核心页面翻译
**测试页面**:
1. **首页** (`/`, `/en`, `/ja`)
   - 验证: 标题、副标题、CTA 按钮
   - 命名空间: `common`, `navigation`

2. **八字页面** (`/bazi`, `/en/bazi`, `/ja/bazi`)
   - 验证: 表单标签、按钮文本、错误提示
   - 命名空间: `bazi`, `form`, `errors`, `common`

3. **紫微页面** (`/ziwei`, `/en/ziwei`, `/ja/ziwei`)
   - 验证: 宫位名称、星曜名称、解读文本
   - 命名空间: `ziwei`, `form`, `errors`, `common`

4. **关帝求签** (`/fortune`, `/en/fortune`, `/ja/fortune`)
   - 验证: 庙宇选择、签文内容、AI 解读提示
   - 命名空间: `astro/fortune`, `common`

5. **用户档案** (`/profile`, `/en/profile`, `/ja/profile`)
   - 验证: 个人信息字段、编辑按钮、验证消息
   - 命名空间: `user/profile`, `form`, `errors`

6. **会员中心** (`/membership`, `/en/membership`, `/ja/membership`)
   - 验证: 会员状态、套餐信息、升级按钮
   - 命名空间: `user/membership`, `common`

**测试方法**:
```bash
# 手动检查清单
□ 所有文本内容翻译正确
□ 无硬编码中文/英文/日文
□ 无 "undefined" 或 translation key
□ 参数化翻译正确显示（如 {{name}}, {{count}}）
□ 日期/数字格式化正确
```

**自动化检查脚本**:
```typescript
// 检查页面是否有未翻译的 key
test('No untranslated keys on BaZi page', async ({ page }) => {
  await page.goto('/en/bazi');

  const content = await page.textContent('body');

  // 不应包含翻译 key（如 "bazi.title"）
  expect(content).not.toMatch(/\b[a-z]+\.[a-zA-Z.]+\b/);

  // 不应包含 "undefined"
  expect(content).not.toContain('undefined');
});
```

#### 测试用例 3.2: 动态内容翻译
**测试步骤**:
1. 在八字页面填写表单
2. 提交计算
3. 验证结果页面翻译正确
4. 切换语言
5. 验证结果重新翻译

**预期结果**:
- ✅ 动态生成的内容正确翻译
- ✅ 切换语言后内容更新

### 4. 命名空间加载测试

#### 测试用例 4.1: 路由匹配
**测试内容**:
验证 `i18n/loader.ts` 中的路由命名空间映射正确加载。

**测试路由与预期命名空间**:
```typescript
const routeTests = [
  {
    route: '/bazi',
    expectedNamespaces: ['common', 'navigation', 'bazi', 'form', 'errors', 'categories']
  },
  {
    route: '/ziwei',
    expectedNamespaces: ['common', 'navigation', 'ziwei', 'form', 'errors', 'categories']
  },
  {
    route: '/fortune',
    expectedNamespaces: ['common', 'navigation', 'astro/fortune', 'categories', 'errors']
  },
  {
    route: '/profile',
    expectedNamespaces: ['common', 'navigation', 'pages', 'form', 'errors', 'user/profile']
  },
  {
    route: '/membership',
    expectedNamespaces: ['common', 'navigation', 'pages', 'errors', 'user/membership']
  }
];
```

**验证方法**:
1. 打开浏览器 DevTools → Network
2. 访问测试路由
3. 检查加载的 JSON 文件
4. 验证只加载必要的命名空间

**预期结果**:
- ✅ 仅加载路由所需的命名空间
- ✅ 无冗余加载
- ✅ 首屏加载速度 < 2s

### 5. 性能测试

#### 测试用例 5.1: Bundle Size 分析
**测试步骤**:
```bash
# 构建生产版本
npm run build

# 分析 bundle
npm run analyze  # 如果有配置

# 或手动检查
ls -lh .next/static/chunks/*.js | sort -h
```

**预期指标**:
- ✅ 翻译相关 bundle < 50KB (gzipped)
- ✅ 首屏 JavaScript < 200KB (gzipped)
- ✅ 每个命名空间 JSON < 10KB

**对比（迁移前后）**:
| 指标 | 迁移前 | 迁移后 | 改善 |
|------|--------|--------|------|
| 初始翻译 bundle | ~150KB | ~20KB | -87% |
| 首屏 JS | ~280KB | ~220KB | -21% |
| 按路由加载 | ❌ | ✅ | N/A |

#### 测试用例 5.2: 加载性能
**测试工具**: Lighthouse / WebPageTest

**测试页面**: `/`, `/en/bazi`, `/ja/ziwei`

**预期指标**:
- ✅ FCP (First Contentful Paint) < 1.5s
- ✅ LCP (Largest Contentful Paint) < 2.5s
- ✅ TTI (Time to Interactive) < 3.0s
- ✅ Lighthouse Performance Score > 90

**测试命令**:
```bash
# 使用 Lighthouse CLI
npx lighthouse http://localhost:3000 --view
npx lighthouse http://localhost:3000/en/bazi --view
npx lighthouse http://localhost:3000/ja/ziwei --view
```

### 6. 浏览器兼容性测试

#### 测试用例 6.1: 跨浏览器功能测试
**测试浏览器**:
- ✅ Chrome 120+ (Windows, macOS)
- ✅ Firefox 121+ (Windows, macOS)
- ✅ Safari 17+ (macOS, iOS)
- ✅ Edge 120+

**测试内容**:
1. 语言切换功能
2. 路由导航
3. Cookie 持久化
4. 翻译内容显示

**预期结果**:
- ✅ 所有浏览器功能一致
- ✅ 无控制台错误
- ✅ UI 渲染正常

#### 测试用例 6.2: 移动端测试
**测试设备**:
- ✅ iPhone 12/13/14 (iOS Safari)
- ✅ Android Chrome (Pixel, Samsung)

**测试内容**:
1. 响应式语言选择器
2. 触摸交互
3. 移动端性能

### 7. SEO 测试

#### 测试用例 7.1: URL 结构
**验证内容**:
```
✅ / (中文，无前缀)
✅ /en (英文)
✅ /ja (日文)
✅ /bazi (中文八字)
✅ /en/bazi (英文八字)
✅ /ja/bazi (日文八字)
```

**预期结果**:
- ✅ URL 简洁、语义化
- ✅ 中文默认无前缀
- ✅ 英文/日文有前缀
- ✅ 无重复内容

#### 测试用例 7.2: Meta 标签
**验证内容**:
```html
<!-- 中文页面 -->
<html lang="zh">
<meta name="description" content="中文描述">

<!-- 英文页面 -->
<html lang="en">
<meta name="description" content="English description">

<!-- 日文页面 -->
<html lang="ja">
<meta name="description" content="日本語の説明">
```

**验证工具**:
```bash
# 检查 meta 标签
curl -s http://localhost:3000 | grep -E '<html|<meta'
curl -s http://localhost:3000/en | grep -E '<html|<meta'
curl -s http://localhost:3000/ja | grep -E '<html|<meta'
```

#### 测试用例 7.3: Alternate Links
**验证内容**:
```html
<link rel="alternate" hreflang="zh" href="https://example.com/" />
<link rel="alternate" hreflang="en" href="https://example.com/en" />
<link rel="alternate" hreflang="ja" href="https://example.com/ja" />
<link rel="alternate" hreflang="x-default" href="https://example.com/" />
```

**预期结果**:
- ✅ 每个页面有所有语言版本的 alternate links
- ✅ x-default 指向中文版本

## 📊 测试执行

### 手动测试检查清单

#### 基础功能 (30分钟)
- [ ] 语言选择器在所有页面工作
- [ ] 3种语言都能切换
- [ ] URL 正确更新（zh 无前缀，en/ja 有前缀）
- [ ] 刷新页面语言保持
- [ ] Cookie 正确设置

#### 核心页面 (30分钟)
- [ ] 首页 (`/`, `/en`, `/ja`)
- [ ] 八字页面 (`/bazi`, `/en/bazi`, `/ja/bazi`)
- [ ] 紫微页面 (`/ziwei`, `/en/ziwei`, `/ja/ziwei`)
- [ ] 关帝求签 (`/fortune`, `/en/fortune`, `/ja/fortune`)
- [ ] 用户档案 (`/profile`, `/en/profile`, `/ja/profile`)
- [ ] 会员中心 (`/membership`, `/en/membership`)

#### 翻译质量 (20分钟)
- [ ] 无硬编码文本
- [ ] 无 "undefined" 或翻译 key 显示
- [ ] 参数化翻译正确（{{name}}, {{count}}）
- [ ] 日期格式化正确
- [ ] 数字格式化正确（中文逗号分隔 vs 英文逗号）

#### 性能检查 (10分钟)
- [ ] 首屏加载 < 2s
- [ ] 语言切换即时响应
- [ ] 无明显的 bundle 体积增加
- [ ] Chrome DevTools Network 检查命名空间按需加载

### 自动化测试脚本

#### 创建测试文件
```bash
# 创建 Playwright 测试目录
mkdir -p tests/i18n

# 创建测试文件
touch tests/i18n/language-switching.spec.ts
touch tests/i18n/routing.spec.ts
touch tests/i18n/translations.spec.ts
```

#### 测试框架配置
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
});
```

#### 示例测试套件
```typescript
// tests/i18n/language-switching.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
  test('switches from Chinese to English', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=English');
    await expect(page).toHaveURL(/\/en/);
  });

  test('switches from English to Japanese', async ({ page }) => {
    await page.goto('/en');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=日本語');
    await expect(page).toHaveURL(/\/ja/);
  });

  test('persists language after refresh', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="language-selector"]');
    await page.click('text=English');
    await page.reload();
    await expect(page).toHaveURL(/\/en/);
  });
});
```

## ✅ 测试验收标准

### 功能验收
- ✅ 所有语言切换测试通过
- ✅ 所有路由导航测试通过
- ✅ 所有核心页面翻译完整
- ✅ 无控制台错误
- ✅ 无 404 错误

### 性能验收
- ✅ Lighthouse Performance Score > 90
- ✅ FCP < 1.5s
- ✅ LCP < 2.5s
- ✅ Bundle size 减少 > 50%

### 兼容性验收
- ✅ Chrome/Firefox/Safari 功能一致
- ✅ 移动端体验良好
- ✅ 无浏览器特定问题

### SEO 验收
- ✅ 所有页面有正确的 lang 属性
- ✅ Meta 描述多语言化
- ✅ Alternate links 配置正确
- ✅ URL 结构 SEO 友好

## 🐛 已知问题记录

### 问题模板
```markdown
**问题 ID**: ISSUE-001
**严重性**: High / Medium / Low
**页面/功能**: /en/bazi
**描述**: 英文八字页面缺少某个翻译
**复现步骤**:
1. 访问 /en/bazi
2. 填写表单
3. 查看结果

**预期行为**: 显示英文翻译
**实际行为**: 显示 "bazi.result.title"
**截图**: [附截图]
**修复状态**: [ ] 待修复 / [ ] 修复中 / [ ] 已修复
```

## 📈 测试报告模板

### 测试执行总结
```markdown
# i18n 迁移测试报告

**执行日期**: 2025-10-03
**执行人**: [Name]
**测试环境**: Local Development / Staging / Production

## 测试结果概览
- **总测试用例**: 25
- **通过**: 23
- **失败**: 2
- **跳过**: 0
- **通过率**: 92%

## 功能测试
| 功能模块 | 测试用例数 | 通过 | 失败 | 通过率 |
|---------|-----------|------|------|--------|
| 语言切换 | 5 | 5 | 0 | 100% |
| 路由导航 | 6 | 6 | 0 | 100% |
| 翻译完整性 | 8 | 6 | 2 | 75% |
| 命名空间加载 | 3 | 3 | 0 | 100% |
| 性能指标 | 3 | 3 | 0 | 100% |

## 失败用例详情
1. **ISSUE-001**: /en/bazi 页面缺少某个翻译
2. **ISSUE-002**: /ja/ziwei 页面参数化翻译错误

## 性能指标
- **FCP**: 1.2s (✅ < 1.5s)
- **LCP**: 2.1s (✅ < 2.5s)
- **TTI**: 2.8s (✅ < 3.0s)
- **Bundle Size**: -85% (✅ 达标)

## 浏览器兼容性
- Chrome 120: ✅ 通过
- Firefox 121: ✅ 通过
- Safari 17: ✅ 通过
- Edge 120: ✅ 通过

## 建议与后续
1. 修复失败的 2 个测试用例
2. 添加更多边缘情况测试
3. 持续监控生产环境性能
```

---

**Phase 7 测试计划创建完成**
**预计测试时间**: 1-2 小时
**下一步**: 执行测试并记录结果
