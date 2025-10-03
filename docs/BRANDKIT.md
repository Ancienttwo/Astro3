# Astrozi 品牌工具箱 (Brandkit) 使用指南

## 概述

Astrozi 品牌工具箱提供了完整的视觉识别系统，确保在所有平台和媒介上呈现统一、专业且富有吸引力的品牌形象。

## 文件结构

```
/styles/brandkit.css           # 核心 CSS 变量和样式
/components/brandkit/           # React 组件库
├── BrandButton.tsx            # 品牌按钮组件
├── BrandCard.tsx              # 品牌卡片组件
├── BrandLogo.tsx              # 品牌 Logo 组件
├── BrandTypography.tsx        # 品牌排版组件
└── index.ts                   # 组件导出
/app/brandkit-demo/page.tsx    # 演示页面
```

## 快速开始

### 1. 导入组件

```typescript
// 导入单个组件
import { BrandButton, BrandCard, BrandLogo } from '@/components/brandkit';

// 或导入所有组件
import Brand from '@/components/brandkit';
```

### 2. 使用组件

```tsx
function MyComponent() {
  return (
    <BrandCard title="示例卡片">
      <BrandLogo size={64} showText />
      <BrandButton variant="primary">
        点击按钮
      </BrandButton>
    </BrandCard>
  );
}
```

### 3. 使用 CSS 变量

```css
.my-element {
  color: var(--primary-text-color);
  background: var(--accent-color);
  border-radius: var(--border-radius-card);
  font-family: var(--font-family-mixed);
}
```

## 色彩系统

### 亮色模式
- `--bg-color`: #FFFFFF (背景色)
- `--primary-text-color`: #3D0B5B (主文本色)
- `--secondary-text-color`: #333333 (副文本色)
- `--accent-color`: #FBCB0A (强调色)
- `--card-bg`: rgba(255,255,255,0.95) (卡片背景)
- `--logo-color`: #420868 (Logo 颜色)

### 暗色模式
- `--bg-color`: #1A2242 (背景色)
- `--primary-text-color`: #FBCB0A (主文本色)
- `--secondary-text-color`: #E0E0E0 (副文本色)
- `--accent-color`: #FBCB0A (强调色)
- `--card-bg`: rgba(0,0,0,0.2) (卡片背景)
- `--logo-color`: #FBCB0A (Logo 颜色)

## 字体系统

### 字体族
- 英文/UI: `Rajdhani`
- 中文: `Noto Sans SC`
- 混合: `Rajdhani, Noto Sans SC`

### 字体大小
- H1: 3.5rem (56px)
- H2: 2.5rem (40px)
- H3: 1.5rem (24px)
- 副标题: 1.5rem (24px)
- 正文: 1rem (16px)

### 字重
- 常规: 400
- 加粗: 700

## 组件 API

### BrandButton

```tsx
interface BrandButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  // 继承所有 HTML button 属性
}
```

### BrandCard

```tsx
interface BrandCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}
```

### BrandLogo

```tsx
interface BrandLogoProps {
  size?: number;              // Logo 大小
  className?: string;
  showText?: boolean;         // 是否显示品牌名称
  variant?: 'light' | 'dark' | 'auto';
}
```

### 排版组件

```tsx
// 标题组件
<BrandH1>一级标题</BrandH1>
<BrandH2>二级标题</BrandH2>
<BrandH3>三级标题</BrandH3>

// 文本组件
<BrandSubtitle>副标题文本</BrandSubtitle>
<BrandParagraph>段落文本</BrandParagraph>
<BrandAccentText>强调文本</BrandAccentText>
```

## CSS 类工具

### 按钮类
```css
.btn-brand          /* 品牌按钮基础样式 */
```

### 卡片类
```css
.card-brand         /* 品牌卡片基础样式 */
```

### 文本类
```css
.text-accent        /* 强调色文本 */
.text-primary       /* 主色文本 */
.text-secondary     /* 副色文本 */
```

### 背景类
```css
.bg-brand           /* 品牌背景色 */
.bg-brand-gradient  /* 品牌渐变背景 */
```

### 特效类
```css
.glow-accent        /* 强调色发光效果 */
.border-accent      /* 强调色边框 */
```

## 响应式设计

品牌工具箱内置响应式支持：

```css
/* 平板设备 */
@media (max-width: 768px) {
  --font-size-h1: 2.5rem;
  --font-size-h2: 2rem;
}

/* 手机设备 */
@media (max-width: 480px) {
  --font-size-h1: 2rem;
  --font-size-h2: 1.75rem;
}
```

## 可访问性

- 所有组件支持键盘导航
- 提供适当的焦点样式
- 支持 `prefers-reduced-motion`
- 遵循 WCAG 2.1 AA 标准

## 暗色模式支持

品牌工具箱自动支持暗色模式：

```tsx
// 自动适应系统主题
<BrandButton variant="primary">按钮</BrandButton>

// 强制暗色主题
<div className="dark">
  <BrandCard>暗色卡片</BrandCard>
</div>
```

## 最佳实践

### 1. 组件组合
```tsx
// ✅ 推荐：使用品牌组件组合
<BrandCard>
  <BrandLogo size={48} />
  <BrandH3>功能标题</BrandH3>
  <BrandParagraph>功能描述</BrandParagraph>
  <BrandButton variant="primary">操作按钮</BrandButton>
</BrandCard>
```

### 2. 颜色使用
```tsx
// ✅ 推荐：使用 CSS 变量
style={{ color: 'var(--accent-color)' }}

// ❌ 避免：硬编码颜色值
style={{ color: '#FBCB0A' }}
```

### 3. 字体应用
```tsx
// ✅ 推荐：使用品牌排版组件
<BrandH2>页面标题</BrandH2>

// ✅ 或使用 CSS 变量
<h2 style={{ fontFamily: 'var(--font-family-en)' }}>标题</h2>
```

## 自定义扩展

### 创建自定义品牌组件

```tsx
import { cn } from '@/lib/utils';

const CustomBrandComponent = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        'bg-[var(--card-bg)]',
        'border-[var(--accent-color)]',
        'text-[var(--primary-text-color)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

### 扩展 CSS 变量

```css
/* 在 brandkit.css 中添加 */
:root {
  --custom-brand-color: #your-color;
  --custom-brand-size: 1.2rem;
}

.dark {
  --custom-brand-color: #your-dark-color;
}
```

## 演示页面

访问 `/brandkit-demo` 查看所有品牌组件的实际效果和使用示例。

## 更新日志

### v1.0.0 (2025-01-19)
- ✅ 完整的品牌工具箱实现
- ✅ CSS 变量系统
- ✅ React 组件库
- ✅ 暗色模式支持
- ✅ 响应式设计
- ✅ 可访问性优化

## 支持

如有问题或建议，请通过以下方式联系：
- GitHub Issues
- 开发团队内部沟通渠道

---

*Astrozi 品牌工具箱 - 统一、专业、现代的品牌视觉系统*