/**
 * Cross‑env performance adapter for strict TS builds
 * - Uses globalThis.performance when available
 * - Falls back to Node's perf_hooks
 * - Ultimately falls back to Date.now()
 */
export function perfNow() {
    try {
        const g = globalThis;
        const p = g.performance;
        if (p && typeof p.now === 'function') {
            return p.now();
        }
    }
    catch {
        // ignore
    }
    // Node fallback
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const mod = require('perf_hooks');
        const perf = mod.performance;
        if (perf && typeof perf.now === 'function')
            return perf.now();
    }
    catch {
        // ignore
    }
    return Date.now();
}
//# sourceMappingURL=perf.js.map