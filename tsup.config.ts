import { defineConfig } from "tsup";

export default defineConfig({
  // Entry points - CLI and library entry
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },

  // Output formats - ESM only (aligned with package.json type: "module")
  format: ["esm"],

  // TypeScript declarations
  dts: true,

  // Source maps for debugging
  sourcemap: true,

  // Clean dist directory before build
  clean: true,

  // Split chunks for better code splitting
  splitting: true,

  // Minify for production
  minify: false, // Keep readable for now, enable in production

  // Shims for Node.js globals
  shims: true,

  // Target environment
  target: "node18",

  // External dependencies (don't bundle)
  external: ["commander", "globby", "ky", "micromatch", "picocolors", "tar"],

  // Tree shaking
  treeshake: true,

  // Platform
  platform: "node",

  // Keep ESM compatibility
  esbuildOptions(options) {
    options.platform = "node";
  },

  // Add shebang for CLI entry
  banner: ({ format }) => {
    if (format === "esm") {
      return {
        js: "#!/usr/bin/env node",
      };
    }
    return {};
  },
});
