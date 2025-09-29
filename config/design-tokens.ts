export const tokens = {
  layout: {
    pageMaxWidth: "var(--page-max-width)",
  },
  spacing: {
    pageInline: "var(--space-page-inline)",
    sectionStack: "var(--space-section-stack)",
    cardPadding: "var(--space-card-padding)",
  },
  radius: {
    section: "var(--radius-section)",
    card: "var(--radius)",
  },
  shadow: {
    soft: "var(--shadow-soft)",
    medium: "var(--shadow-medium)",
  },
  surface: {
    default: "hsl(var(--card))",
    muted: "hsl(var(--muted))",
    overlay: "hsl(var(--popover))",
  },
} as const;

export type DesignTokens = typeof tokens;

export const tokenValue = <T extends keyof DesignTokens>(
  group: T,
  key: keyof DesignTokens[T]
) => tokens[group][key];
