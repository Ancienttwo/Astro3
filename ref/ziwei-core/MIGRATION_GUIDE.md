# ZiWei Core Migration Guide
# 紫微斗数核心库迁移指南

## Overview

This guide explains how to migrate from the old `ziwei-old.tsx` implementation to the new `@astroall/ziwei-core` architecture.

## Architecture Changes

### Old Architecture
```
ziwei-old.tsx (91-252 lines)
├── Algorithm calculations (mixed with UI)
├── Direct state manipulation
└── Tightly coupled components
```

### New Architecture
```
@astroall/ziwei-core
├── calculations/          # Pure calculation logic
│   ├── star-calculator    # Star positioning
│   ├── sihua-calculator   # Four transformations
│   └── palace-calculator  # Palace calculations
├── facade/               # Unified API
├── hooks/                # React integration
├── adapters/             # UI components
└── migration/            # Compatibility layer
```

## Migration Steps

### Step 1: Install Dependencies

```bash
npm install zustand immer
```

### Step 2: Update Imports

**Old:**
```typescript
import { calculateZiweiChart } from './ziwei-old';
```

**New:**
```typescript
import { ZiWeiFacade } from '@astroall/ziwei-core';
// Or use compatibility layer
import { calculateZiweiChartCompat } from '@astroall/ziwei-core/migration';
```

### Step 3: Use New API

#### Option A: Direct Migration to New API

**Old:**
```typescript
const chart = calculateZiweiChart({
  year: 2024,
  month: 10,
  day: 15,
  hour: 10,
  gender: 'male'
});
```

**New:**
```typescript
const facade = new ZiWeiFacade();
const chart = await facade.calculateCompleteChart({
  year: 2024,
  month: 10,
  day: 15,
  hour: 10,
  minute: 0,
  gender: 'male',
  isLunar: false
});
```

#### Option B: Use Compatibility Layer

```typescript
import { calculateZiweiChartCompat } from '@astroall/ziwei-core/migration';

// Works exactly like old API
const chart = await calculateZiweiChartCompat({
  year: 2024,
  month: 10,
  day: 15,
  hour: 10,
  gender: 'male'
});
```

### Step 4: Use React Hooks

**Old (Direct calculation in component):**
```tsx
const MyComponent = () => {
  const [chart, setChart] = useState(null);
  
  useEffect(() => {
    const result = calculateZiweiChart(input);
    setChart(result);
  }, [input]);
  
  return <div>{/* render chart */}</div>;
};
```

**New (Using hooks):**
```tsx
import { useZiWeiChart } from '@astroall/ziwei-core';

const MyComponent = () => {
  const { chart, isLoading, error } = useZiWeiChart({
    birthInfo: {
      year: 2024,
      month: 10,
      day: 15,
      hour: 10,
      minute: 0,
      gender: 'male',
      isLunar: false
    }
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{/* render chart */}</div>;
};
```

### Step 5: Use UI Adapters

**Old (Manual rendering):**
```tsx
<div className="palace">
  <div>{palace.palaceName}</div>
  {palace.stars.map(star => (
    <div key={star.name}>{star.name}</div>
  ))}
</div>
```

**New (Using adapters):**
```tsx
import { SimplePalace, PalaceGrid } from '@astroall/ziwei-core';

// Single palace
<SimplePalace 
  chart={chart} 
  palaceName="命宫"
  onClick={() => console.log('Clicked')}
/>

// Full grid
<PalaceGrid 
  chart={chart}
  onPalaceClick={(palace) => console.log('Clicked', palace)}
/>
```

## API Comparison

### Input Format

| Field | Old API | New API | Notes |
|-------|---------|---------|-------|
| year | ✓ | ✓ | Same |
| month | ✓ | ✓ | Same |
| day | ✓ | ✓ | Same |
| hour | ✓ | ✓ | Same |
| minute | Optional | ✓ | Now explicit |
| gender | 'male'/'female' | 'male'/'female' | Same |
| isLunar | Optional | ✓ | Now explicit |
| isLeapMonth | Optional | Optional | Same |

### Output Format

| Field | Old API | New API | Access Method |
|-------|---------|---------|---------------|
| Birth Info | `chart.birthInfo` | `chart.birthInfo` | Same |
| Life Palace | `chart.命宫` | `chart.lifePalaceIndex` | Index-based |
| Body Palace | `chart.身宫` | `chart.bodyPalaceIndex` | Index-based |
| Five Elements | `chart.五行局` | `chart.fiveElementsBureau` | Object |
| Palaces | `chart.palacesByBranch` | `chart.palaces` | Map |
| Masters | `chart.命主/身主` | `chart.lifeMaster/bodyMaster` | Direct |

## Features Comparison

| Feature | Old | New | Benefits |
|---------|-----|-----|----------|
| **Caching** | ❌ | ✅ | Improved performance |
| **Type Safety** | Partial | Full | Better IDE support |
| **React Hooks** | ❌ | ✅ | Easier integration |
| **State Management** | Manual | Zustand | Global state |
| **UI Components** | ❌ | ✅ | Ready-to-use adapters |
| **Testing** | Limited | Comprehensive | Better reliability |
| **Self Transformations** | ✅ | ✅ | Enhanced algorithm |
| **Batch Calculation** | ❌ | ✅ | Multiple charts |

## Performance Improvements

### Caching Strategy
```typescript
// Automatic caching
const facade = new ZiWeiFacade();
const chart1 = await facade.calculateCompleteChart(birthInfo, {}, 'cache-key');
const chart2 = facade.getCachedResult('cache-key'); // Instant retrieval
```

### Batch Processing
```typescript
const charts = await facade.batchCalculate([
  birthInfo1,
  birthInfo2,
  birthInfo3
]);
```

## Common Migration Patterns

### Pattern 1: Direct State Usage
```typescript
// Old
const palace = chart.palacesByBranch['子'];

// New
const palace = chart.palaces.get('命宫');
// Or by index
const palaceByIndex = Array.from(chart.palaces.values())[0];
```

### Pattern 2: Star Finding
```typescript
// Old
let targetStar = null;
Object.values(chart.palacesByBranch).forEach(palace => {
  const star = palace.mainStars.find(s => s.name === '紫微');
  if (star) targetStar = star;
});

// New (using hooks)
import { useZiWeiStar } from '@astroall/ziwei-core';
const { primaryLocation, brightness } = useZiWeiStar(chart, '紫微');
```

### Pattern 3: Sihua Analysis
```typescript
// Old
const sihua = palace.sihuaStars;

// New
const sihua = palace.sihua;
const selfTransformations = palace.selfTransformations;
```

## Troubleshooting

### Issue: "Cannot find module"
**Solution:** Ensure all imports use the correct path:
```typescript
import { ... } from '@astroall/ziwei-core';
```

### Issue: "Chart is undefined"
**Solution:** The new API is async, use await or hooks:
```typescript
const chart = await facade.calculateCompleteChart(birthInfo);
// Or
const { chart } = useZiWeiChart({ birthInfo });
```

### Issue: "Palace not found"
**Solution:** Palace names changed from "仆役" to "交友":
```typescript
// Old
const palace = chart.palacesByBranch['仆役'];

// New
const palace = chart.palaces.get('交友');
```

## Best Practices

1. **Use Hooks for React Components**
   - Simplifies state management
   - Handles loading and error states
   - Automatic re-rendering

2. **Leverage TypeScript**
   - Full type definitions included
   - Better IDE autocomplete
   - Catch errors at compile time

3. **Use Caching**
   - Pass cache keys for repeated calculations
   - Clear cache when needed
   - Monitor cache statistics

4. **Adopt UI Adapters**
   - Consistent UI rendering
   - Responsive design built-in
   - Customizable styles

## Support

For questions or issues:
- Check the test files for usage examples
- Review type definitions for API details
- Use the migration utilities for validation

## Version Compatibility

| Version | Status | Support |
|---------|--------|---------|
| ziwei-old.tsx | Deprecated | Use migration bridge |
| @astroall/ziwei-core v1.0 | Current | Full support |

## Next Steps

1. Start with the compatibility layer for quick migration
2. Gradually adopt new features (hooks, adapters)
3. Remove dependency on old code
4. Optimize with caching and batch processing