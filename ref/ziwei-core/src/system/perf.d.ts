/**
 * Cross‑env performance adapter for strict TS builds
 * - Uses globalThis.performance when available
 * - Falls back to Node's perf_hooks
 * - Ultimately falls back to Date.now()
 */
export declare function perfNow(): number;
//# sourceMappingURL=perf.d.ts.map