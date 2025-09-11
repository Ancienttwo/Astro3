# TypeScript Strict Mode Migration Strategy

## Overview
This document outlines the strategy for migrating AstroZi codebase to TypeScript strict mode.

## Current Status
- **TypeScript Version**: 5.8.3
- **Strict Mode**: ✅ Enabled (tsconfig.json updated)
- **Expected Errors**: 200+ files need updates

## Migration Phases

### Phase 1: Critical Path Files (Week 1)
Priority files that affect core functionality:

1. **Authentication & Security**
   - `/app/api/auth/**/*.ts`
   - `/lib/services/wallet-signature-verifier.ts`
   - `/lib/services/web3-user-manager.ts`

2. **Core Business Logic**
   - `/lib/services/ai-interpretation-service.ts`
   - `/lib/services/credit-manager.ts`
   - `/app/api/bazi-analysis/route.ts`
   - `/app/api/fortune/**/*.ts`

3. **Database & Models**
   - `/lib/services/database.ts`
   - `/types/supabase.ts`
   - All type definition files

### Phase 2: API Routes (Week 1-2)
- Fix all `/app/api/**/*.ts` files
- Ensure proper request/response typing
- Add error handling types

### Phase 3: Components (Week 2)
- Start with shared components
- Move to page-specific components
- Update context providers

### Phase 4: Utilities & Helpers (Week 2)
- `/lib/utils/**/*.ts`
- `/hooks/**/*.ts`
- Testing utilities

## Common TypeScript Strict Mode Issues & Solutions

### 1. Implicit Any Types
```typescript
// ❌ Before
function calculate(data) {
  return data.value * 2;
}

// ✅ After
function calculate(data: { value: number }): number {
  return data.value * 2;
}
```

### 2. Null/Undefined Checks
```typescript
// ❌ Before
const user = await getUser();
console.log(user.name);

// ✅ After
const user = await getUser();
if (user) {
  console.log(user.name);
}
// OR use optional chaining
console.log(user?.name);
```

### 3. Type Assertions
```typescript
// ❌ Avoid 'as any'
const data = response as any;

// ✅ Use proper types or unknown
const data = response as UserData;
// OR
const data = response as unknown as UserData;
```

### 4. Function Parameters
```typescript
// ❌ Before
function process(callback) {
  callback();
}

// ✅ After
function process(callback: () => void): void {
  callback();
}
```

## Type Definition Guidelines

### API Response Types
```typescript
// Standard API response wrapper
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usage
type UserResponse = ApiResponse<User>;
```

### Database Types
```typescript
// Use generated Supabase types
import { Database } from '@/types/supabase';

type User = Database['public']['Tables']['users']['Row'];
type InsertUser = Database['public']['Tables']['users']['Insert'];
type UpdateUser = Database['public']['Tables']['users']['Update'];
```

### Component Props
```typescript
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent) => void;
}
```

## Tooling Setup

### VSCode Settings
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### ESLint Configuration
```javascript
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/strict"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## Migration Commands

```bash
# Check TypeScript errors
npm run typecheck

# Fix auto-fixable issues
npm run lint:fix

# Generate Supabase types
npm run db:generate-types

# Run type coverage report
npx type-coverage
```

## Success Metrics

1. **Zero TypeScript Errors**: `npm run typecheck` passes
2. **Type Coverage**: > 95% type coverage
3. **No Any Types**: Eliminate all `any` types except justified cases
4. **Runtime Safety**: Reduced runtime errors by 50%

## Resources

- [TypeScript Strict Mode Docs](https://www.typescriptlang.org/tsconfig#strict)
- [Next.js TypeScript Guide](https://nextjs.org/docs/basic-features/typescript)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)

## Migration Checklist

- [x] Enable strict mode in tsconfig.json
- [ ] Fix authentication services
- [ ] Fix API routes
- [ ] Fix React components
- [ ] Fix utility functions
- [ ] Add missing type definitions
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Deploy to staging

## Notes

- Keep `skipLibCheck: true` to avoid third-party library type issues
- Use `// @ts-expect-error` sparingly with justification comments
- Document complex type definitions
- Consider using type guards for runtime validation

---

*Last Updated: 2025-01-10*
*Migration Lead: Architecture Team*