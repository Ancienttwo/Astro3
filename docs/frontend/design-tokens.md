# ShadCN Design Tokens Overview

The English horoscope pages now expose a small token layer so Tailwind + ShadCN components stay visually aligned while we continue refactors.

## Token CSS Variables (defined in `styles/globals.css`)
- `--page-max-width` — main content width cap (defaults to 1120px).
- `--space-page-inline` — horizontal padding used on page wrappers.
- `--space-section-stack` — vertical spacing between stacked page sections.
- `--space-card-padding` — internal padding for cards/feature blocks.
- `--radius-section` — larger radius for hero/section shells.
- `--shadow-soft` / `--shadow-medium` — reusable elevation presets.

These variables scale at `640px` and `1024px` breakpoints so mobile-first spacing stays tight while desktop spacing breathes.

## Tailwind Utilities
We surfaced helper classes via `tailwind.config.ts` so the variables can be consumed without inline styles:

- `max-w-page`, `px-page-inline`, `gap-section-stack`, `p-card-padding`
- `rounded-section`, `shadow-soft`, `shadow-medium`

Example page shell (see `app/en/bazi/page.tsx:643` and `app/en/ziwei/page.tsx:1040`):

```tsx
<div className="mx-auto flex w-full max-w-page flex-col gap-section-stack px-page-inline pb-0 md:pb-4">
  {/* sections */}
</div>
```

Example ShadCN card usage:

```tsx
<Card className="rounded-section border border-slate-200 bg-gradient-to-br from-white to-blue-50 p-card-padding shadow-soft">
  <CardHeader className="p-0 pb-4">
    <CardTitle className="text-lg">Birth Information</CardTitle>
  </CardHeader>
  <CardContent className="p-0">
    {/* form fields */}
  </CardContent>
</Card>
```

## Rollout Guidelines
1. Favor ShadCN primitives (`Card`, `Tabs`, `Dialog`, etc.) and apply the token utility classes for spacing, radius, and shadows.
2. When building new sections, start with `max-w-page` container and `gap-section-stack` to match the English pages.
3. For bespoke components, import the tokens directly (`config/design-tokens.ts`) only if dynamic runtime values are required (e.g., canvas sizing). Prefer Tailwind utilities for static layout.
4. Update legacy gradient blocks incrementally by wrapping them with ShadCN `Card` or `Section` shells, reusing `p-card-padding` and `shadow-soft` to avoid inconsistent padding.
5. Keep documentation in-sync—note any new tokens or utility keys in this file and update tests or Storybook stories to reflect spacing changes.

Following this approach keeps Tailwind ergonomics while aligning with ShadCN defaults, making future redesign passes faster.
