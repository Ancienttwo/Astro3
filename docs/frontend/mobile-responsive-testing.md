# Mobile Responsive Testing Checklist

Use this checklist when validating the English BaZi (`/en/bazi`) and ZiWei (`/en/ziwei`) experiences on handheld breakpoints.

## Baseline Setup
- Launch the Next.js app locally (`pnpm dev`) and open the page in Chrome.
- Toggle DevTools device toolbar and test at 375×812 (iPhone 13), 414×896 (iPhone XR), and 430×932 (iPhone 15 Pro Max).
- Clear cached data between test passes to force fresh chart calculations.

## /en/bazi Specific Checks
- Ensure the top hero, form, and daily checklist wrap vertically without horizontal scrolling.
- Scroll through luck cycles, fleeting years, and months to confirm the horizontal scrollers keep padding inside the viewport and buttons remain tappable.
- Verify the focal element blocks stack and remain legible (beneficial/harmful cards, manual selector buttons).
- Trigger the “BaZi Knowledge”, “Modify Hour”, and “Stem-Branch Relations” dialogs and ensure close buttons remain accessible on smaller widths.

## /en/ziwei Specific Checks
- Confirm the hero header stacks beneath 430px so action buttons do not overlap text.
- Inspect the chart panel: luck selectors, informational sidebar, and toggles should wrap without overflow.
- Expand the education accordions (Birth Year Four Transformations, ZiWei vs BaZi modal, Destiny Arrow analysis) to ensure icons/text align and remain readable.
- Navigate between ten-year and annual selectors to ensure touch targets have sufficient spacing.

## Interaction & Accessibility
- Validate focus rings and hover states on ShadCN buttons/selectors for both light/dark themes.
- Confirm scroll positions reset appropriately when switching tabs or toggling sections.
- Perform quick voiceover/reader check (⌘F5 on macOS) to ensure headings and buttons announce clearly.

## Regression Sweep
- Resize progressively from 320px → 768px to spot awkward transitions.
- Repeat key flows with charts loaded from a `chartId` query param to ensure fetched states follow the same responsive layout.
- Smoke-test CTA buttons (Calculate BaZi, Adjust Birth Time) to ensure no layout shift occurs while loading spinners render.
