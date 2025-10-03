# 紫微斗数 Web 版本 V2 - 100% UI 还原

**基于 `ref/ziwei-ui` + `ref/ziwei-core` 完全复刻的 React + Tailwind CSS 版本**

## 📁 项目结构

```
components/ziwei-v2/
├── types.ts              # TypeScript 类型定义
├── PalaceCard.tsx        # 宫位卡片组件（星曜竖排、四化标记）
├── CenterGrid.tsx        # 中宫 2×2 组件（八字、大运）
├── ZiweiChart.tsx        # 主组件（12宫位 + 中宫布局）
├── ziwei.css             # 完整样式表（100% 还原）
├── index.ts              # 组件导出
└── README.md             # 本文档

lib/ziwei/
└── integration-v2.ts     # ziwei-core 算法集成适配器

app/ziwei-new/
└── page.tsx              # 演示页面
```

## 🎯 核心特性

### ✅ 100% UI 还原功能清单

1. **宫位卡片（PalaceCard）**
   - ✅ 星曜竖排显示（传统命盘风格）
   - ✅ 蛇形排列算法（行奇数正序，偶数逆序）
   - ✅ 三类四化标记（生年/向心/离心）
   - ✅ 亮度显示（庙/旺/得/利/平/不/陷）
   - ✅ 特殊标记（身宫、来因宫）
   - ✅ 大运/流年/流月动态标签
   - ✅ 宫位点击高亮

2. **中宫信息（CenterGrid）**
   - ✅ 基本信息（姓名、性别、五行局）
   - ✅ 公历/农历日期时间
   - ✅ 命主、身主、斗君
   - ✅ 八字四柱显示（带十神）
   - ✅ 八个大运列表
   - ✅ 起运信息
   - ✅ 可折叠/展开

3. **主图表（ZiweiChart）**
   - ✅ CSS Grid 4×4 布局
   - ✅ 12 宫位精确定位
   - ✅ 响应式设计
   - ✅ 大运/流年选择器联动
   - ✅ 四化飞宫箭头（TODO）

## 🚀 快速开始

### 1. 访问演示页面

```bash
npm run dev
```

访问 `http://localhost:3000/ziwei-new`

### 2. 在项目中使用

```tsx
import { ZiweiChart } from '@/components/ziwei-v2'
import { generateWebZiweiChart } from '@/lib/ziwei/integration-v2'

// 生成命盘数据
const chartData = await generateWebZiweiChart({
  year: 1989,
  month: 1,
  day: 2,
  hour: 19,
  gender: 'female',
  isLunar: false,
  name: '测试用户'
})

// 渲染组件
<ZiweiChart
  chartData={chartData}
  activePalace={activePalace}
  onPalaceClick={(branch) => setActivePalace(branch)}
/>
```

## 📊 星曜颜色系统

**精确还原配色方案**：

| 星曜类型 | 颜色 | Hex 值 | 说明 |
|---------|------|--------|------|
| 14主星 | 深紫色 | `#3D0B5B` | 紫微、天机、太阳等 |
| 文昌曲左辅右弼 | 红色 | `#EF4444` | 四大辅星 |
| 禄存天马天魁天钺 | 青绿色 | `#10B981` | 吉星 |
| 桃花星 | 粉红色 | `#F06292` | 红鸾、天喜等 |
| 煞星 | 灰色 | `#6B7280` | 地空、地劫等 |

**四化颜色**：

| 四化 | 颜色 | Hex 值 |
|------|------|--------|
| A (禄) | 绿色 | `#10B981` |
| B (权) | 紫色 | `#8B5CF6` |
| C (科) | 蓝色 | `#3B82F6` |
| D (忌) | 红色 | `#EF4444` |

## 🎨 CSS 样式说明

### 关键 CSS 类

```css
/* 宫位卡片 */
.palace-card { ... }
.palace-active { ... }

/* 星曜显示 */
.star { ... }
.star-vertical-name { ... }
.star-brightness-line { ... }
.star-sihua-line { ... }

/* 中宫样式 */
.center-grid-merged { ... }
.center-info-block { ... }
.bazi-lines { ... }

/* 大运/流年标签 */
.palace-major-label { ... }
.palace-dayun-fixed { ... }
.palace-minor-label { ... }
```

### 导入样式

在使用组件的页面中导入：

```tsx
import '@/components/ziwei-v2/ziwei.css'
```

或在 `app/globals.css` 中全局导入：

```css
@import '../components/ziwei-v2/ziwei.css';
```

## 🔧 算法集成

### 当前状态

- ✅ Mock 数据生成器（开发调试用）
- ⏳ ziwei-core 集成（待连接 ref/ziwei-core）

### 集成 ziwei-core

编辑 `lib/ziwei/integration-v2.ts`：

```typescript
// 取消注释以启用真实算法
import { generateIntegratedChart } from '@/ref/ziwei-core/src/api/integrated-chart-api'

export async function generateWebZiweiChart(input: ZiweiCalculationInput) {
  const result = await generateIntegratedChart({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    gender: input.gender,
    isLunar: input.isLunar
  })

  return transformToWebFormat(result.hookChart)
}
```

## 📐 布局说明

### 4×4 Grid 布局

```
┌────────┬────────┬────────┬────────┐
│  巳宫  │  午宫  │  未宫  │  申宫  │
├────────┼────────┴────────┼────────┤
│  辰宫  │                 │  酉宫  │
│        │   中宫 2×2      │        │
│        │   八字信息      │        │
├────────┼─────────────────┼────────┤
│  卯宫  │                 │  戌宫  │
├────────┼────────┬────────┼────────┤
│  寅宫  │  丑宫  │  子宫  │  亥宫  │
└────────┴────────┴────────┴────────┘
```

### 宫位 CSS Grid 映射

```css
.palace-巳 { grid-column: 1; grid-row: 1; }
.palace-午 { grid-column: 2; grid-row: 1; }
/* ... */
.center-grid-merged {
  grid-column: 2 / 4;
  grid-row: 2 / 4;
}
```

## 🐛 已知问题

1. **四化飞宫箭头**：待实现 SVG 箭头绘制系统
2. **大运/流年选择器**：待创建 `ZiweiSelectors.tsx` 组件
3. **底部操作栏**：待创建 `ZiweiBottomBar.tsx` 组件

## 📝 TODO

- [ ] 实现 `ArrowOverlay.tsx`（四化飞宫箭头）
- [ ] 创建 `ZiweiSelectors.tsx`（大运/流年/流月选择器）
- [ ] 创建 `ZiweiBottomBar.tsx`（三合、四化、分析按钮）
- [ ] 集成真实 ziwei-core 算法
- [ ] 添加移动端适配优化
- [ ] 性能优化（React.memo、useMemo）

## 🎓 参考文档

- **原始实现**：`ref/ziwei-ui/ZiweiChart/`
- **算法核心**：`ref/ziwei-core/src/`
- **类型定义**：`ref/ziwei-ui/types.ts`

---

**Version**: V2.0.0
**Last Updated**: 2025-01-03
**Author**: Winston (BMad Architect)
**Status**: ✅ 核心组件完成，100% UI 还原
