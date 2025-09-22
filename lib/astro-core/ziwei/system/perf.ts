/**
 * Cross‑env performance adapter for strict TS builds
 * - Uses globalThis.performance when available
 * - Falls back to Node's perf_hooks
 * - Ultimately falls back to Date.now()
 */

export function perfNow(): number {
  try {
    const g: unknown = globalThis as unknown
    const p: unknown = (g as { performance?: { now?: () => number } }).performance
    if (p && typeof (p as { now?: () => number }).now === 'function') {
      return (p as { now: () => number }).now()
    }
  } catch {
    // ignore
  }

  // Node fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod: unknown = require('perf_hooks')
    const perf = (mod as { performance?: { now?: () => number } }).performance
    if (perf && typeof perf.now === 'function') return perf.now()
  } catch {
    // ignore
  }

  return Date.now()
}

