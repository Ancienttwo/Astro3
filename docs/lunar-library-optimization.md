# 农历库优化方案

## 1. 立即行动：移除未使用的库

```bash
# 移除未使用的 lunar-javascript
pnpm remove lunar-javascript
```

## 2. 升级到最新版本

```bash
# 检查最新版本
npm view lunar-typescript version

# 升级到最新版
pnpm add lunar-typescript@latest
```

## 3. 统一导入路径

建议创建一个中央导出文件：

```typescript
// lib/lunar/index.ts
export { Solar, Lunar, EightChar, SolarWeek, SolarMonth } from 'lunar-typescript';
export type { LunarYear, LunarMonth, LunarDay } from 'lunar-typescript';

// 自定义工具函数
export const getLunarDate = (date: Date) => {
  const solar = Solar.fromDate(date);
  return solar.getLunar();
};

export const getBaziInfo = (date: Date, hour: number) => {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return lunar.getEightChar();
};
```

## 4. 性能优化

### 缓存策略
```typescript
// lib/lunar/cache.ts
const lunarCache = new Map<string, any>();

export const getCachedLunar = (dateKey: string) => {
  if (!lunarCache.has(dateKey)) {
    const [year, month, day] = dateKey.split('-').map(Number);
    const solar = Solar.fromYmd(year, month, day);
    lunarCache.set(dateKey, solar.getLunar());
  }
  return lunarCache.get(dateKey);
};
```

### 懒加载
```typescript
// 仅在需要时动态导入
const loadLunarModule = async () => {
  const { Solar } = await import('lunar-typescript');
  return Solar;
};
```

## 5. 功能增强

### 节假日支持
```typescript
// lib/lunar/holidays.ts
import { Solar } from 'lunar-typescript';

export const isHoliday = (date: Date): boolean => {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  // 检查农历节日
  const lunarFestivals = lunar.getFestivals();
  if (lunarFestivals.length > 0) return true;
  
  // 检查公历节日
  const solarFestivals = solar.getFestivals();
  if (solarFestivals.length > 0) return true;
  
  return false;
};
```

### 宜忌查询优化
```typescript
// lib/lunar/yiji.ts
export const getYiJi = (date: Date) => {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  
  return {
    yi: lunar.getDayYi(),     // 宜
    ji: lunar.getDayJi(),     // 忌
    shenWei: lunar.getDayPositionTai(), // 神位
    chongSha: lunar.getDayChongDesc(),  // 冲煞
  };
};
```

## 6. 类型定义增强

```typescript
// types/lunar.d.ts
import { Lunar, Solar, EightChar } from 'lunar-typescript';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  yearShengXiao: string;
  festivals: string[];
  jieQi?: string;
}

export interface BaziInfo {
  year: string;
  month: string;
  day: string;
  hour: string;
  yearHideGan: string[];
  monthHideGan: string[];
  dayHideGan: string[];
  hourHideGan: string[];
}
```

## 7. 测试覆盖

```typescript
// __tests__/lunar.test.ts
import { Solar } from 'lunar-typescript';

describe('Lunar Calculations', () => {
  it('should convert solar to lunar correctly', () => {
    const solar = Solar.fromYmd(2024, 1, 1);
    const lunar = solar.getLunar();
    
    expect(lunar.getYear()).toBe(2023);
    expect(lunar.getMonth()).toBe(11);
    expect(lunar.getDay()).toBe(20);
  });
  
  it('should calculate BaZi correctly', () => {
    const solar = Solar.fromYmdHms(1990, 5, 15, 10, 0, 0);
    const lunar = solar.getLunar();
    const bazi = lunar.getEightChar();
    
    expect(bazi.getYear()).toBe('庚午');
    // ... more assertions
  });
});
```

## 8. 迁移检查清单

- [ ] 移除 lunar-javascript 依赖
- [ ] 升级 lunar-typescript 到最新版
- [ ] 创建中央导出文件
- [ ] 实现缓存机制
- [ ] 添加类型定义
- [ ] 编写单元测试
- [ ] 更新所有导入路径
- [ ] 性能测试

## 常见问题

### Q: lunar-typescript 和 lunar-javascript 的区别？
A: 主要是类型支持。lunar-typescript 提供完整的 TypeScript 类型定义，更适合 TS 项目。

### Q: 是否需要同时安装两个版本？
A: 不需要。TypeScript 项目只需要 lunar-typescript。

### Q: 如何处理时区问题？
A: lunar-typescript 默认使用系统时区。如需指定时区，可以：
```typescript
const solar = Solar.fromYmdHms(2024, 1, 1, 0, 0, 0);
// 时区偏移处理
```

### Q: 性能如何优化？
A: 
1. 使用缓存避免重复计算
2. 懒加载减少初始包大小
3. 批量计算时复用实例

## 参考资源

- [lunar-typescript 官方文档](https://github.com/6tail/lunar-typescript)
- [API 文档](https://6tail.cn/calendar/api.html)
- [在线演示](https://6tail.cn/calendar/lunar.html)

---

*最后更新: 2025-01-10*