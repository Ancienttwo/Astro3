# 国际化快速参考指南

## 🚀 快速开始

### 在组件中添加日语支持

```typescript
'use client'
import { useJapaneseTranslation } from '@/hooks/useJapaneseTranslation'

export function MyComponent() {
  const { jt, isJapanese } = useJapaneseTranslation()
  
  return (
    <div className={isJapanese ? 'font-noto-sans-jp' : ''}>
      <h1>{jt('pages.home.title')}</h1>
      <p>{jt('pages.home.description')}</p>
    </div>
  )
}
```

### 添加新翻译

1. **UI翻译** → `lib/i18n/japanese-ui-translations.ts`
2. **文化翻译** → `lib/i18n/japanese-cultural-adaptations.ts`
3. **认证翻译** → `lib/auth.ts` 中的 `authTranslations`

### 创建日语页面

```typescript
// app/ja/new-page/page.tsx
import { ExistingPageComponent } from '@/app/new-page/page'

export default function JapaneseNewPage() {
  return <ExistingPageComponent />
}
```

## 📚 翻译函数对照

| 函数 | 用途 | 示例 |
|------|------|------|
| `jt()` | 日语优先翻译 | `jt('pages.home.title')` |
| `ct()` | 文化敏感翻译 | `ct('politeExpressions.welcome')` |
| `pageT()` | 页面专用翻译 | `pageT('home', 'title')` |
| `formT()` | 表单翻译 | `formT('buttons.save')` |
| `statusT()` | 状态翻译 | `statusT('loading')` |
| `actionT()` | 操作翻译 | `actionT('confirm')` |

## 🎨 常用CSS类

| 类名 | 用途 |
|------|------|
| `.font-noto-sans-jp` | 日语字体 |
| `.leading-japanese` | 日语行间距 |
| `.tracking-japanese` | 日语字间距 |
| `.text-justify-japanese` | 日语文本对齐 |
| `.heading-japanese-1` | 日语一级标题 |
| `.text-size-japanese-base` | 日语基础字体大小 |

## 🔧 路由结构

```
/ (中文默认)
├── auth/
├── bazi/
└── settings/

/ja/ (日语)
├── auth/
├── bazi/
└── settings/

/en/ (英语)
├── auth/
├── bazi/
└── settings/
```

## 🧪 测试命令

```bash
# 浏览器控制台运行
window.japaneseI18nTester.runAllTests()
```

## 🔄 语言切换代码

```typescript
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter, usePathname } from 'next/navigation'

function switchToJapanese() {
  const { setLanguage } = useLanguage()
  const router = useRouter()
  
  setLanguage('ja')
  router.push('/ja/')
}
```

## ⚡ 性能指标

- 字体加载: < 100ms
- 翻译查找: < 5ms
- 语言切换: < 200ms
- 路由导航: < 300ms

## 🆘 常见问题

### Q: 翻译不显示怎么办？
A: 检查翻译键是否存在，使用 `jt('key', 'fallback')` 提供回退文本

### Q: 日语字体不加载？
A: 确保添加了 `font-noto-sans-jp` 类名

### Q: 路由404错误？
A: 确保在 `app/ja/` 目录下创建了对应页面文件

### Q: 语言切换不生效？
A: 检查 `LanguageProvider` 是否正确包装了应用

## 📞 获取帮助

- 查看完整文档: `INTL/Japanese-i18n-Implementation-Guide.md`
- 测试清单: `tests/japanese-functionality-checklist.md`
- 文化验证: `tests/japanese-cultural-validation.md`