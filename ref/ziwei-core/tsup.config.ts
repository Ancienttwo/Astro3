import { defineConfig } from 'tsup';

export default defineConfig({
  // Build the clean public API as package root entry
  entry: { index: 'src/public-api.ts' },
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false, // Disable code splitting to bundle tyme4ts
  sourcemap: true,
  clean: false,
  minify: false,
  shims: true,
  treeshake: true,
  target: 'es2020',
  outDir: 'dist',
  // Force bundle tyme4ts - no external dependencies
  external: [],
  noExternal: ['tyme4ts'], // Explicitly bundle tyme4ts
  bundle: true, // Ensure bundling is enabled
  esbuildOptions(options) {
    options.platform = 'node';
  },
  onSuccess: 'echo "✨ Build completed successfully!"',
});
