# 紫微斗数核心算法库迁移指南 - ZiWei Core Migration Guide

## 📋 概述 Overview

本文档提供 `@astroall/ziwei-core` 算法库的完整迁移指南，包含所有源文件结构、依赖关系、集成要点和注意事项。

**库版本**: 1.0.0  
**算法名称**: 紫微斗数 (Purple Star Astrology)  
**核心功能**: 完整的紫微斗数排盘算法、星曜计算、宫位关系、四化飞星

---

## 📁 完整源文件树 Complete Source Tree

```
packages/ziwei-core/
├── package.json                        # 包配置文件
├── tsup.config.ts                      # 构建配置
├── tsconfig.json                       # TypeScript配置
├── README.md                           # 项目说明
├── LICENSE                             # MIT许可证
│
├── src/                                # 源代码目录
│   ├── index.ts                        # 主入口（转发到public-api）
│   ├── public-api.ts                   # 公共API入口（推荐使用）
│   ├── index-new.ts                    # 新版API入口（备选）
│   │
│   ├── types/                          # 🔴 核心类型定义
│   │   ├── core.ts                     # 核心数据结构
│   │   ├── algorithms.ts               # 算法接口定义
│   │   ├── chart-render-types.ts       # 图表渲染类型
│   │   └── hook-format-types.ts        # Hook格式类型
│   │
│   ├── constants/                      # 🔴 常量定义（算法核心数据）
│   │   ├── index.ts                    # 常量汇总导出
│   │   ├── basic-elements.ts           # 基础元素（天干地支、宫位名称）
│   │   ├── five-elements-bureau.ts     # 五行局定义
│   │   ├── star-systems.ts             # 星曜系统（紫微星系、天府星系）
│   │   ├── star-brightness.ts          # 星曜亮度表
│   │   ├── master-stars.ts             # 命主身主、四化飞星
│   │   └── ziwei-constants.ts          # 紫微常量汇总
│   │
│   ├── calculations/                   # 🔴 核心算法实现
│   │   ├── index.ts                    # 算法导出
│   │   ├── palace-calculator.ts        # 宫位计算器
│   │   ├── star-calculator.ts          # 星曜计算器
│   │   ├── sihua-calculator.ts         # 四化计算器
│   │   ├── bureau-calculations.ts      # 五行局计算
│   │   ├── brightness-calculations.ts  # 亮度计算
│   │   ├── period-calculations.ts      # 大运计算
│   │   ├── masters.ts                  # 命主身主计算
│   │   ├── auxiliary-stars.ts          # 辅星计算
│   │   ├── malefic-stars.ts           # 凶星计算
│   │   ├── star-placements.ts         # 星曜安置算法
│   │   ├── transformations.ts         # 四化转换
│   │   ├── palace-calculations.ts     # 宫位推算
│   │   └── data-conversion.ts         # 数据转换工具
│   │
│   ├── chart-generator/                # 🔴 图表生成器（主要入口）
│   │   ├── index.ts                    # 导出generateCompleteZiWeiChart
│   │   ├── types.ts                    # 生成器类型
│   │   ├── palace-builder.ts          # 宫位构建器
│   │   └── helpers.ts                 # 辅助函数
│   │
│   ├── chart-generator.ts             # 🔴 统一图表生成器（推荐使用）
│   ├── calculations.ts                # 计算模块汇总
│   ├── calculations.d.ts              # 计算类型定义
│   ├── constants.ts                   # 常量汇总
│   ├── constants.d.ts                 # 常量类型
│   │
│   ├── facade/                        # 🟡 门面模式接口
│   │   ├── ziwei-facade.ts           # 紫微门面（简化接口）
│   │   └── ZiWeiAlgorithmFacade.ts   # 算法门面类
│   │
│   ├── api/                           # 🟡 API层（多种调用方式）
│   │   ├── chart-render-api.ts       # 图表渲染API
│   │   ├── hook-ziwei-api.ts         # React Hook API
│   │   └── integrated-chart-api.ts   # 集成图表API
│   │
│   ├── converters/                    # 🟡 格式转换器
│   │   └── hook-format-converter.ts  # Hook格式转换
│   │
│   ├── hooks/                         # 🟢 React Hooks（可选）
│   │   ├── useZiWeiCalculator.ts     # 计算器Hook
│   │   ├── useZiWeiChart.ts          # 图表Hook
│   │   ├── useZiWeiPalaces.ts        # 宫位Hook
│   │   ├── useZiWeiStars.ts          # 星曜Hook
│   │   └── useZiWeiStore.ts          # 状态管理Hook
│   │
│   ├── migration/                     # 🟢 迁移适配器
│   │   ├── index.ts                   # 迁移导出
│   │   ├── migration-bridge.ts        # 迁移桥接
│   │   ├── migration-utils.ts         # 迁移工具
│   │   └── ziwei-migration-adapter.ts # 紫微迁移适配器
│   │
│   ├── registry/                      # 🟢 算法注册表
│   │   ├── index.ts                   # 注册表导出
│   │   └── AlgorithmRegistry.ts       # 算法注册中心
│   │
│   ├── sihua/                         # 🟡 四化飞星模块
│   │   └── sihua-marker.ts           # 四化标记器
│   │
│   ├── system/                        # 🟢 系统层
│   │   └── ZiweiCalculatorSingleton.ts # 单例计算器
│   │
│   ├── lunar-utils.ts                 # 🔴 农历工具（核心依赖）
│   ├── time-calculations.ts           # 🔴 时间计算（核心依赖）
│   ├── palace-relationships.ts        # 🔴 宫位关系（核心依赖）
│   ├── bazi-utils.ts                  # 🟡 八字工具（辅助）
│   ├── api-format-converter.ts        # 🟡 API格式转换
│   └── complete-chart-types.ts        # 🟡 完整图表类型
│
├── dist/                               # 构建输出目录
│   └── [构建生成的文件]
│
├── examples/                           # 使用示例
│   ├── basic-usage.ts                 # 基础用法
│   ├── test-ziwei.ts                  # 测试示例
│   └── test-ziwei-male-1988.ts        # 具体案例
│
├── scripts/                            # 脚本工具
│   └── generate-sample.ts             # 生成示例
│
├── __tests__/                          # 测试文件
│   ├── setup.ts                       # 测试配置
│   ├── calculations.test.ts          # 计算测试
│   ├── palace-relationships.test.ts  # 宫位关系测试
│   ├── star-calculator.test.ts       # 星曜计算测试
│   ├── time-calculations.test.ts     # 时间计算测试
│   ├── ziwei-facade.test.ts         # 门面测试
│   ├── chart-render-api.test.ts     # API测试
│   ├── hook-format.test.ts          # Hook格式测试
│   ├── cache/                        # 缓存测试
│   ├── e2e/                          # 端到端测试
│   ├── performance/                  # 性能测试
│   └── utils/                        # 测试工具
│
└── types/                             # 额外类型定义
    ├── enhanced-types.ts              # 增强类型
    ├── enhanced-types.d.ts            # 类型声明
    └── tyme4ts.d.ts                   # tyme4ts类型补充
```

---

## 🔗 依赖关系 Dependencies

### 运行时依赖 Runtime Dependencies
```json
{
  "dependencies": {
    "tyme4ts": "^1.3.4"  // 唯一的外部依赖：农历计算库
  }
}
```

### 开发依赖 Dev Dependencies  
```json
{
  "devDependencies": {
    "@types/jest": "^29.5.0",
    "@types/node": "^20.0.0",
    "jest": "^29.5.0",
    "rimraf": "^5.0.0",
    "ts-jest": "^29.1.0",
    "tsx": "^4.0.0",
    "typescript": "^5.0.0",
    "tsup": "latest"  // 构建工具
  }
}
```

---

## 🎯 核心文件说明 Core Files Description

### 必须迁移的核心文件（红色标记 🔴）

1. **类型系统** `src/types/`
   - `core.ts` - 定义所有基础数据结构
   - `algorithms.ts` - 算法接口规范

2. **常量数据** `src/constants/`
   - 包含所有紫微斗数的查表数据
   - 星曜位置、亮度、五行局等核心数据
   - **这些是算法的数据基础，必须完整迁移**

3. **核心算法** `src/calculations/`
   - 所有计算逻辑的实现
   - 宫位、星曜、四化等算法
   - **算法的核心，必须保持完整性**

4. **主生成器** `src/chart-generator.ts`
   - 统一的图表生成入口
   - 调用所有子算法完成排盘

5. **工具函数**
   - `lunar-utils.ts` - 农历转换
   - `time-calculations.ts` - 时辰计算
   - `palace-relationships.ts` - 宫位关系

### 可选迁移的辅助文件（黄色/绿色标记 🟡🟢）

- **API层**: 提供不同的调用方式
- **Hooks**: React集成（如不用React可忽略）
- **迁移适配器**: 版本兼容性支持
- **测试文件**: 验证算法正确性

---

## 📦 迁移步骤 Migration Steps

### 1. 准备阶段 Preparation

```bash
# 创建目标项目结构
mkdir -p your-project/libs/ziwei-core
cd your-project/libs/ziwei-core

# 复制package.json并修改
cp path/to/ziwei-core/package.json ./
# 修改name字段为你的项目命名空间
```

### 2. 核心文件迁移 Core Files Migration

```bash
# 复制源代码（保持目录结构）
cp -r path/to/ziwei-core/src ./

# 复制配置文件
cp path/to/ziwei-core/tsconfig.json ./
cp path/to/ziwei-core/tsup.config.ts ./
```

### 3. 安装依赖 Install Dependencies

```bash
# 安装运行时依赖
npm install tyme4ts@^1.3.4

# 安装开发依赖（如需要）
npm install -D typescript tsup @types/node
```

### 4. 构建配置 Build Configuration

```typescript
// tsup.config.ts
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: { index: 'src/public-api.ts' },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  target: 'es2020',
  external: ['tyme4ts'],  // 重要：标记外部依赖
});
```

### 5. 构建库 Build Library

```bash
# 构建
npm run build

# 验证构建输出
ls -la dist/
```

---

## 🔧 集成指南 Integration Guide

### 基础用法 Basic Usage

```typescript
import { 
  generateCompleteZiWeiChart,
  type IZiWeiInput,
  type IZiWeiCompleteChart 
} from '@your-project/ziwei-core';

// 准备输入数据
const input: IZiWeiInput = {
  year: 1990,
  month: 10,
  day: 15,
  hour: 14,      // 24小时制
  minute: 30,
  gender: '男',   // 男/女
  isLeapMonth: false,
  timeZone: 8    // 时区
};

// 生成紫微斗数命盘
const chart: IZiWeiCompleteChart = generateCompleteZiWeiChart(input);

// 使用结果
console.log('命宫:', chart.palaces[0]);  // 第一宫为命宫
console.log('紫微星位置:', chart.stars.find(s => s.name === '紫微'));
```

### React集成 React Integration

```typescript
// 如果使用React Hooks
import { useZiWeiChart } from '@your-project/ziwei-core/hooks';

function MyComponent() {
  const { chart, loading, error } = useZiWeiChart({
    year: 1990,
    month: 10,
    day: 15,
    hour: 14,
    minute: 30,
    gender: '男'
  });

  if (loading) return <div>计算中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  
  return <div>{/* 渲染chart */}</div>;
}
```

### 高级用法 Advanced Usage

```typescript
// 使用单独的计算器
import { 
  PalaceCalculator,
  StarCalculator,
  SihuaCalculator 
} from '@your-project/ziwei-core/calculations';

// 分步计算
const palaceCalc = new PalaceCalculator();
const palaces = palaceCalc.calculate(input);

const starCalc = new StarCalculator();
const stars = starCalc.calculate(input, palaces);

const sihuaCalc = new SihuaCalculator();
const sihua = sihuaCalc.calculate(input, palaces);
```

---

## ⚠️ 重要注意事项 Important Notes

### 1. 算法完整性 Algorithm Integrity
- **绝对不能简化或省略任何算法步骤**
- 所有查表数据必须完整保留
- 计算顺序不能改变（宫位→星曜→四化）

### 2. 数据准确性 Data Accuracy
- 常量数据来自传统紫微斗数古籍
- 星曜位置表经过多次验证
- 不要修改constants目录下的任何数值

### 3. 时间处理 Time Handling
- 使用tyme4ts处理农历转换
- 时辰边界处理要特别注意（23:00-01:00为子时）
- 闰月处理需要isLeapMonth参数

### 4. 性别差异 Gender Differences
- 大运起始方向因性别而异
- 某些星曜解释因性别不同

### 5. 编码规范 Coding Standards
- 所有中文注释保留（算法说明）
- 类型定义必须严格（no any）
- 保持原有的错误处理机制

---

## 🧪 测试验证 Testing & Validation

### 运行测试 Run Tests

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- calculations.test.ts

# 查看覆盖率
npm run test:coverage
```

### 关键测试用例 Key Test Cases

1. **基础排盘测试**
   - 1990年10月15日 14:30 男性
   - 验证紫微在午宫、天府在寅宫

2. **闰月测试**
   - 农历闰月的处理
   - 验证宫位不变

3. **边界测试**
   - 子时（23:00-01:00）
   - 年份交界

4. **性能测试**
   - 1000次排盘 < 1秒
   - 内存使用 < 50MB

---

## 📊 性能优化 Performance Optimization

### 缓存策略 Caching Strategy
```typescript
// 库内已实现LRU缓存
const cache = new Map();
const MAX_CACHE_SIZE = 100;

function getCachedChart(input: IZiWeiInput) {
  const key = JSON.stringify(input);
  if (cache.has(key)) {
    return cache.get(key);
  }
  
  const chart = generateCompleteZiWeiChart(input);
  
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  
  cache.set(key, chart);
  return chart;
}
```

### 批量计算 Batch Calculation
```typescript
// 批量生成多个命盘
async function batchGenerate(inputs: IZiWeiInput[]) {
  const results = await Promise.all(
    inputs.map(input => 
      Promise.resolve(generateCompleteZiWeiChart(input))
    )
  );
  return results;
}
```

---

## 🔄 版本兼容性 Version Compatibility

### Node.js版本
- 最低要求: Node.js >= 16.0.0
- 推荐版本: Node.js >= 18.0.0

### TypeScript版本
- 最低要求: TypeScript >= 5.0.0
- 目标: ES2020

### 浏览器支持
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+）
- 需要polyfill的旧浏览器

---

## 📚 API文档 API Documentation

### 主要导出 Main Exports

```typescript
// 类型导出
export type {
  IZiWeiInput,           // 输入参数
  IZiWeiCompleteChart,   // 完整命盘
  IPalace,               // 宫位
  IStar,                 // 星曜
  ISihua,                // 四化
  IMajorPeriod,          // 大运
  IMinorPeriod,          // 小限
};

// 函数导出
export {
  generateCompleteZiWeiChart,  // 主函数
  calculateDouJun,             // 斗君计算
  PalaceCalculator,           // 宫位计算器
  StarCalculator,             // 星曜计算器
  SihuaCalculator,           // 四化计算器
};

// 常量导出
export {
  STEMS,                     // 天干
  BRANCHES,                  // 地支
  PALACE_NAMES,             // 宫位名称
  MAIN_STARS,               // 主星列表
  AUXILIARY_STARS,          // 辅星列表
};
```

---

## 🆘 常见问题 FAQ

### Q1: tyme4ts依赖找不到？
A: 确保npm install tyme4ts@^1.3.4，这是唯一的外部依赖。

### Q2: 构建失败？
A: 检查tsconfig.json的target是否为ES2020或更高。

### Q3: 计算结果不准确？
A: 
1. 检查输入时间是否正确（特别是时区）
2. 确认性别参数（影响大运）
3. 验证闰月标记

### Q4: 如何验证迁移成功？
A: 运行测试套件，特别是e2e测试，确保所有测试通过。

### Q5: 可以移除哪些文件？
A: 
- 可移除: examples/, __tests__/, scripts/
- 不可移除: src/types/, src/constants/, src/calculations/

---

## 📝 迁移检查清单 Migration Checklist

- [ ] 复制所有源文件（保持目录结构）
- [ ] 安装tyme4ts依赖
- [ ] 配置TypeScript（tsconfig.json）
- [ ] 配置构建工具（tsup.config.ts）
- [ ] 运行构建验证
- [ ] 运行测试验证
- [ ] 测试基础用例
- [ ] 性能测试
- [ ] 集成到目标项目
- [ ] 更新项目文档

---

## 📞 支持与帮助 Support

如有问题，请检查：
1. 所有核心文件是否完整迁移
2. tyme4ts依赖是否正确安装
3. TypeScript配置是否正确
4. 查看测试用例了解正确用法

---

*本文档最后更新: 2025-01-10*
*文档版本: 1.0.0*
*适用于: @astroall/ziwei-core v1.0.0*