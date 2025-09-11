# Coding Standards

## Overview
This document defines the coding standards and best practices for the AstroZi project. All contributors must adhere to these guidelines to maintain code quality and consistency.

## Technology Stack Requirements
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript (strict mode disabled for gradual migration)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand for global state, React Context for feature state
- **Authentication**: Supabase Auth + Web3 wallet integration

## File Organization

### Maximum File Length
- **Hard limit**: 200 lines per JavaScript/TypeScript file
- Files exceeding this limit must be split into smaller modules
- Group related functionality into separate utility files

### Directory Structure
```
/app           - Next.js app router pages and API routes
/components    - React components organized by feature
/lib           - Utility functions, services, and configurations  
/hooks         - Custom React hooks
/types         - TypeScript type definitions
/contexts      - React Context providers
/stores        - Zustand store definitions
```

## TypeScript Guidelines

### Type Safety
- Use TypeScript for all new code
- Gradually migrate existing JavaScript files
- Define interfaces for all component props
- Use type imports: `import type { ... } from ...`

### Type Definition Examples
```typescript
// Component props
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
}

// API responses
interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}
```

## React & Next.js Standards

### Component Structure
```typescript
// Use functional components with TypeScript
export function ComponentName({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState();
  const { data } = useQuery();
  
  // Event handlers
  const handleClick = () => {};
  
  // Render logic
  return <div>...</div>;
}
```

### Server vs Client Components
- Default to Server Components for better performance
- Use `'use client'` directive only when needed:
  - Interactive elements (onClick, onChange)
  - Browser APIs (localStorage, window)
  - React hooks (useState, useEffect)
  - Third-party client libraries

### Data Fetching
```typescript
// Server Component (preferred)
async function Page() {
  const data = await fetchData();
  return <Component data={data} />;
}

// Client Component (when necessary)
'use client';
function Component() {
  const { data, error } = useSWR('/api/data', fetcher);
  // ...
}
```

## API Development

### Route Handlers
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Validate input
    // Process request
    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
```

### Error Handling
- Always use try-catch blocks in async functions
- Return consistent error response format
- Log errors for debugging (avoid exposing sensitive data)

## Database & Supabase

### Query Patterns
```typescript
// Use typed Supabase client
import { createClient } from '@/lib/supabase/client';

// Consistent error handling
const { data, error } = await supabase
  .from('table')
  .select('*')
  .eq('column', value);

if (error) {
  console.error('Database error:', error);
  throw new Error('Failed to fetch data');
}
```

### Row Level Security (RLS)
- Always implement RLS policies for production tables
- Test policies thoroughly before deployment
- Use service role key only for admin operations

## Styling Guidelines

### Tailwind CSS
- Use Tailwind utility classes for styling
- Avoid inline styles except for dynamic values
- Group related utilities with comments for clarity

### Component Styling
```tsx
// Good: Using cn() helper for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  'base-styles',
  isActive && 'active-styles',
  size === 'large' && 'large-styles'
)} />

// Avoid: Complex inline conditionals
<div className={`${isActive ? 'active' : ''} ${size === 'large' ? 'text-lg' : 'text-sm'}`} />
```

## Testing Standards

### Test Coverage Requirements
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for critical user flows

### Test File Naming
- Unit tests: `filename.test.ts`
- Integration tests: `filename.integration.test.ts`
- E2E tests: `feature.spec.ts`

## Security Best Practices

### Environment Variables
- Never commit `.env` files
- Use `.env.local` for local development
- Validate all environment variables at startup
- Prefix public variables with `NEXT_PUBLIC_`

### Input Validation
```typescript
// Always validate and sanitize user input
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(120),
});

const validatedData = schema.parse(requestBody);
```

### Authentication & Authorization
- Verify user authentication on every protected route
- Implement proper session management
- Use HTTPS in production
- Sanitize all user inputs

## Performance Guidelines

### Code Splitting
- Use dynamic imports for large components
- Lazy load non-critical features
- Optimize bundle size with tree shaking

### Image Optimization
```tsx
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
/>
```

### Caching Strategy
- Implement appropriate cache headers
- Use ISR for static content
- Cache expensive computations

## Git Workflow

### Commit Messages
```
type(scope): subject

body (optional)

footer (optional)
```

Types: feat, fix, docs, style, refactor, test, chore

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`
- Hotfix: `hotfix/description`

## Code Review Checklist

Before submitting PR:
- [ ] Code follows file size limits (< 200 lines)
- [ ] TypeScript types are properly defined
- [ ] No sensitive data in code
- [ ] Tests pass locally
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run typecheck`)

## Monitoring & Logging

### Logging Guidelines
```typescript
// Use structured logging
console.log({
  level: 'info',
  message: 'User action',
  userId: user.id,
  action: 'login',
  timestamp: new Date().toISOString(),
});

// Avoid logging sensitive data
// Never log: passwords, tokens, personal information
```

## Accessibility Standards

### WCAG Compliance
- Ensure ARIA labels for interactive elements
- Maintain proper heading hierarchy
- Provide alt text for images
- Support keyboard navigation

## Internationalization

### Language Support
```typescript
// Use translation keys
import { useTranslation } from '@/hooks/useTranslation';

function Component() {
  const t = useTranslation();
  return <h1>{t('welcome.title')}</h1>;
}
```

## Build & Deployment

### Pre-deployment Checklist
1. Run `npm run quality:check` (typecheck + lint)
2. Run `npm run test:ci` (all tests)
3. Review bundle size with `npm run analyze`
4. Test all environment configurations
5. Verify database migrations

### Performance Targets
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Bundle size < 250KB (initial)

## Maintenance

### Dependency Updates
- Review and update dependencies monthly
- Test thoroughly after major updates
- Keep security patches up to date

### Documentation
- Update README for new features
- Document API changes
- Maintain this coding standards document

---

*Last Updated: 2024*
*Version: 1.0.0*