# @astroall/ziwei-core
# 紫微斗数核心算法库

A comprehensive ZiWei DouShu (Purple Star Astrology) calculation library with clean architecture, React hooks, and UI adapters.

## Features

- 🎯 **Complete Algorithm Implementation**: Full ZiWei star positioning, four transformations (四化), and palace calculations
- ⚡ **High Performance**: Built-in caching and batch processing capabilities
- 🔧 **Clean Architecture**: Separated calculation logic, facade pattern, and UI layer
- ⚛️ **React Ready**: Custom hooks and UI adapters for easy integration
- 📦 **State Management**: Zustand store for global state
- 🔄 **Migration Support**: Compatibility layer for legacy code
- 🧪 **Well Tested**: Comprehensive test coverage
- 📝 **TypeScript**: Full type definitions

## Installation

```bash
npm install @astroall/ziwei-core zustand immer
```

## Quick Start

### Recommended Integration (One-Click, Strict & Stable)

For absolute accuracy and a stable rendering pipeline, prefer the Integrated API as the single entry point. It produces both Hook-format data and platform-optimized render data in one call.

```ts
import { generateIntegratedChart } from '@astroall/ziwei-core/api/integrated-chart-api';

const { hookChart, webRenderData, nativeRenderData } = await generateIntegratedChart({
  year: 1989,
  month: 1,
  day: 2,
  hour: 19,
  gender: 'female',
  isLunar: false,
});

// webRenderData/nativeRenderData → feed directly to your UI renderer
```

If your app expects an existing `ChartData` shape, use the view-transform adapter to get UI-ready data in one step:

```ts
import { generateZiweiUiChartData } from '@astroai/view-transforms';

const chartData = await generateZiweiUiChartData({
  year: 1989, month: 1, day: 2, hour: 19, gender: 'female', isLunar: false
}, { platform: 'web' });

// chartData → pass to your current Ziwei UI components
```

Accuracy policy in Integrated API:
- Minor Limit (小限): start at the triad-store opposite palace of the birth-year branch; age uses Chinese reckoning (出生即1岁); male moves clockwise, female counter‑clockwise; covers ages 1..120 without fallbacks.
- Brightness (亮度): strictly from `STAR_BRIGHTNESS_TABLE` (庙/旺/得/利/平/不/陷); missing or invalid inputs throw errors rather than silently defaulting.

Generate and inspect an example output:

```bash
npx tsx packages/ziwei-core/scripts/generate-integrated.ts
# writes: logs/ziwei-19890102-1930-female.integrated.json
```

## Source Tree (Core Modules)

The core is fully modular. The most important directories and files:

```
packages/ziwei-core/src
├─ api/
│  ├─ hook-ziwei-api.ts            # Hook-format calculator (returns ZiWeiHookChart)
│  ├─ integrated-chart-api.ts      # Unified entry → Hook + Web/Native render data
│  └─ chart-render-api.ts          # Turns Hook into platform render data
├─ converters/
│  └─ hook-format-converter.ts     # CompleteChart → Hook format conversion
├─ chart-generator/
│  ├─ helpers.ts                   # DouJun, stem mapping, brightness helpers
│  ├─ palace-builder.ts            # Builds per‑palace aggregates for generator
│  └─ types.ts                     # Chart generator types
├─ calculations/
│  ├─ data-conversion.ts           # tyme4ts → BaZiParams (统一参数入口)
│  ├─ palace-calculations.ts       # 命宫/身宫/来因宫等
│  ├─ star-placements.ts           # 主星/辅星/煞星/桃花安星
│  ├─ transformations.ts           # 生年四化/飞宫四化/自化
│  ├─ masters.ts                   # 命主/身主
│  ├─ brightness-calculations.ts   # 星曜亮度（庙/旺/得/利/平/不/陷）
│  ├─ period-calculations.ts       # 大运/小限/流年
│  └─ index.ts                     # 计算模块统一导出
├─ constants/
│  ├─ basic-elements.ts            # 天干/地支/宫名
│  ├─ five-elements-bureau.ts      # 五行局映射（年干+命宫地支）
│  ├─ star-systems.ts              # 主/辅/煞/桃花位置表与偏移
│  ├─ star-brightness.ts           # 亮度表/等级映射
│  └─ master-stars.ts              # 命主/身主映射
├─ system/
│  └─ ZiweiCalculatorSingleton.ts  # 统一计算入口（缓存/参数标准化）
├─ time-calculations.ts            # 年龄/起运方向/时序工具
├─ chart-generator.ts              # 组合生成（BaZiParams → 完整命盘）
├─ complete-chart-types.ts         # 完整命盘类型定义（API）
└─ types/
   └─ hook-format-types.ts         # Hook 输入/输出类型与常量
```

## Data Flow (Unified Pipeline)

End‑to‑end flow used by the app (recommended for all consumers):

1. Input (`HookCalculationInput`: year, month, day, hour, gender, isLunar …)
2. `generateIntegratedChart(input)`
   - `generateZiWeiHookChart(input)`
     - `convertHookInputToStandard` → normalize input
     - `ZiweiCalculatorSingleton.calculateComplete(standardInput)`
       - tyme4ts → `createBaZiParams`
       - `calculateFiveElementsBureauDetail`（年干 + 命宫地支）
       - 主/辅/煞/桃花安星（`star-placements`）
       - 生年四化/自化（`transformations`）
       - 大运/小限/流年（`period-calculations`）
       - Assemble CompleteChart
     - `convertZiWeiChartToHook(CompleteChart)` → ZiWeiHookChart
   - `generateBothPlatformRenderData({ hookChart })` → Web/Native render data
3. (Optional) `@astroai/view-transforms` → `toZiweiUIFromIntegrated` → UI `ChartData`

This is the same route used by `apps/mobile/app/(tabs)/ziwei.tsx` via
`@astroai/view-transforms/src/ziwei/generateUiFromIntegrated.ts`.

## Hook Contract (Key Shapes)

- Input: `HookCalculationInput` — { year, month, day, hour, gender, isLunar, isLeapMonth? }
- Output: `ZiWeiHookChart`
  - `birthInfo`: 公历/农历/年干支/时支索引
  - `命宫` / `身宫` / `来因宫` / `五行局` / `八字大运`（统一字符串）
  - 12 branches: `子..亥` → 每宫包含：
    - `palaceName` / `stem` / `branchIndex`
    - `mainStars&sihuaStars` / `auxiliaryStars&sihuaStars` / `minorStars`
    - `majorPeriod`（period/startAge/endAge/startYear/endYear）
    - `fleetingYears` / `minorPeriod`

四化标记在 Hook 星曜 `type` 数组中支持：
- 生年：`A|B|C|D` 或 `iA|iB|iC|iD`
- 自化：`xA|xB|xC|xD`

## Correctness & Policies

- 五行局: 由“年干 + 命宫地支”查表；生成器内部同时保留中文名（如“火六局”）与 code（`fire_6`）。
- 斗君: 正月起寅，顺至生月；再从生月起子时，顺至生时（`chart-generator/helpers.ts`）。
- 小限: 起点由生年地支三合库对宫决定；男顺、女逆；覆盖 1..120 岁（`period-calculations.ts`）。
- 亮度: 严格来自 `STAR_BRIGHTNESS_TABLE` → 7 等级（庙/旺/得/利/平/不/陷）。
- 错误策略: 输入缺失/越界一律抛错（不做静默兜底）。

## Local Preview (Same Path as App)

We provide a simple preview script at repo root that calls the integrated API:

```bash
node scripts/preview-ziwei-integrated.mjs
# Prints Hook JSON and a minimal render summary
```

Programmatic preview in Node:

```ts
import { generateIntegratedChart } from '@astroall/ziwei-core/api/integrated-chart-api'

const result = await generateIntegratedChart({
  year: 2013, month: 11, day: 1, hour: 19, gender: 'female', isLunar: false
}, { platform: 'web' })

console.log(result.hookChart.命宫, result.hookChart.五行局)
```

### Basic Usage (Facade & Hooks)

You can still leverage the Facade and React Hooks for advanced flows. The Integrated API remains the recommended single entry for rendering.

### Migration Tips (Hook → One-Click)

- Previous: Generate Hook → convert via `toZiweiUIChartData(hook)`.
- Now: Call `generateZiweiUiChartData(input, { platform })` to get UI `ChartData` directly.
- Benefits: strict correctness for Minor Limit and Brightness, unified caching, fewer intermediate transforms.
- Fallback: `toZiweiUIChartData` remains available but is not recommended for new code.

```typescript
import { ZiWeiFacade } from '@astroall/ziwei-core';

const facade = new ZiWeiFacade();

const chart = await facade.calculateCompleteChart({
  year: 2024,
  month: 10,
  day: 15,
  hour: 10,
  minute: 30,
  gender: 'male',
  isLunar: false
});

console.log(chart.lifeMaster); // 命主
console.log(chart.bodyMaster); // 身主
```

### Using React Hooks

```tsx
import { useZiWeiChart } from '@astroall/ziwei-core';

function MyComponent() {
  const { chart, isLoading, error, calculate } = useZiWeiChart({
    birthInfo: {
      year: 2024,
      month: 10,
      day: 15,
      hour: 10,
      minute: 30,
      gender: 'male',
      isLunar: false
    },
    autoCalculate: true
  });

  if (isLoading) return <div>计算中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!chart) return <div>请输入出生信息</div>;

  return (
    <div>
      <h2>命盘信息</h2>
      <p>命主: {chart.lifeMaster}</p>
      <p>身主: {chart.bodyMaster}</p>
      <p>五行局: {chart.fiveElementsBureau.name}</p>
    </div>
  );
}
```
