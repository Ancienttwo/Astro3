# Chart Algorithm Migration Guide

迁移目标：在纯 React Web 项目中复用现有八字/紫微排盘算法，同时保留可选的 Supabase 持久化能力。

## 1. 依赖拆分

在目标项目中安装以下 NPM 包：

```bash
npm install @astroall/bazi-core @astroall/ziwei-core tyme4ts zod
```

这些库提供八字、紫微命盘核心计算，以及时间处理与入参校验。

## 2. 输入/输出类型

参考 `apps/server/src/services/chart-service.ts` 中的定义，抽取前端可复用的类型：

```ts
export interface ChartBirthInput {
  year: number
  month: number
  day: number
  hour: number
  minute?: number
  gender: 'male' | 'female'
  isLunar?: boolean
  isLeapMonth?: boolean
  location?: { lat: number; lon: number }
  timezone?: string
}

export interface ChartResult<TChart> {
  chart: TChart
  hash: string
  chartId?: string | null
  cached?: boolean
}
```

若需严格校验，可将 `apps/server/src/routes/chart.ts` 中的 `birthSchema` 迁移至 `zod` 校验函数。

## 3. 算法工具模块

在目标项目创建 `src/lib/chartAlgorithms.ts`，复制并改写以下逻辑：

### 3.1 八字

源代码位置：`apps/server/src/services/chart-service.ts:95-116`

```ts
import { ChartUtils } from '@astroall/bazi-core'

export async function calculateBaziChart(input: ChartBirthInput): Promise<ChartResult<any>> {
  const chart = await ChartUtils.calculateFullChart({
    year: input.year,
    month: input.month,
    day: input.day,
    hour: input.hour,
    minute: input.minute ?? 0,
    gender: input.gender,
    isLunar: input.isLunar ?? false
  })
  return { chart, hash: computeBaziHash(input) }
}
```

### 3.2 紫微

源代码位置：`apps/server/src/services/chart-service.ts:122-154`

```ts
import { generateCompleteZiWeiChart, createBaZiParams } from '@astroall/ziwei-core'
import { SolarTime } from 'tyme4ts'

export async function calculateZiweiChart(input: ChartBirthInput): Promise<ChartResult<any>> {
  const solarTime = SolarTime.fromYmdHms(
    input.year,
    input.month,
    input.day,
    input.hour,
    input.minute ?? 0,
    0
  )
  const params = createBaZiParams(solarTime, input.gender === 'male' ? 0 : 1)
  if (typeof input.isLeapMonth === 'boolean') params.isLeapMonth = input.isLeapMonth

  const chart = await generateCompleteZiWeiChart(params)
  return { chart, hash: computeZiweiHash(input) }
}
```

### 3.3 Hash 与工具

源代码位置：`apps/server/src/services/chart-service.ts:168-210`

```ts
function computeBaziHash(input: ChartBirthInput): string {
  return [
    input.year,
    input.month,
    input.day,
    input.hour,
    input.minute ?? 0,
    input.gender,
    input.isLunar ?? false
  ].join('-')
}

function computeZiweiHash(input: ChartBirthInput): string {
  return [
    input.year,
    input.month,
    input.day,
    input.hour,
    input.minute ?? 0,
    input.gender,
    input.isLunar ?? false,
    input.isLeapMonth ?? false
  ].join('-')
}
```

可视需求迁移 `mergeTags` 等辅助函数。

## 4. 可选：Supabase 持久化

若需要保存命盘，建议在后端调用 Supabase 管理接口（参考 `apps/server/src/repos/charts.ts`），避免在前端暴露 Service Role Key。关键函数：`createChart`、`getChartByUserAndName`、`updateChartPartial`。

## 5. 事件/缓存剥离

原 `ChartService` 与 ServiceRegistry 集成领域事件及 Redis 缓存：
- `emitChartGenerated`（`chart-service.ts:252`）可省略。
- 缓存相关依赖于 `storage-cache-layer`，在前端可交由 React Query/SWR 或 LocalStorage 处理。

## 6. React 组件集成

1. 构建收集 `ChartBirthInput` 的表单。
2. 调用 `calculateBaziChart` / `calculateZiweiChart` 获取结果。
3. 将 `chart` 数据按新 UI 规约渲染；如需持久化，调用后端接口。

## 7. 参考索引

- 算法实现：`apps/server/src/services/chart-service.ts`
- 路由用例：`apps/server/src/routes/chart.ts`
- 数据持久化：`apps/server/src/repos/charts.ts`
- 事件发布：`apps/server/src/events/domain-event-publisher.ts`

按照上述步骤，可在纯 React Web 项目中复用八字/紫微排盘算法，同时保有灵活的 UI 与扩展能力。
