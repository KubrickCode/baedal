# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**CRITICAL**

- Always follow the .claude/WORK_RULES.md document when working.
- Always update CLAUDE.md and README.md when completing large-scale tasks. Ignore minor changes.

## Project Overview

Baedal is a TypeScript-based CLI tool and npm library for downloading files/folders from Git repositories (GitHub, GitLab, Bitbucket). It supports both public and private repositories with authentication tokens, and offers features like file exclusion patterns and subdirectory downloads.

## Development Commands

**Build**
```bash
yarn build          # Build the project using tsup
```

**Lint**
```bash
yarn lint           # Run ESLint on src/**/*.ts
```

**Package Preparation**
```bash
yarn prepublishOnly # Auto-runs yarn build before publishing
```

## Architecture

**Entry Points**
- `src/cli.ts` - CLI entry point (becomes `baedal` command)
- `src/index.ts` - Library entry point for programmatic use

**Core Flow (src/core/baedal.ts)**
The main `baedal()` function orchestrates:
1. Parse source using `parseSource()` to extract provider, owner, repo, subdir
2. Detect provider (GitHub/GitLab/Bitbucket) via `detectProvider()`
3. Download tarball from provider API to temp directory
4. Check for existing files and handle conflicts (force/skip/interactive modes)
5. Extract files with optional subdir filtering and exclude patterns
6. Clean up temp files

**Provider Architecture (src/core/providers/)**
- `detector.ts` - Detects git provider from source string/URL
- `github.ts`, `gitlab.ts`, `bitbucket.ts` - Provider-specific API implementations
- `archive.ts` - Handles tarball URL construction and branch detection

**Utilities (src/utils/)**
- `parser.ts` - Parses various input formats (user/repo, gitlab:user/repo, URLs)
- `auth.ts` - Manages authentication tokens from CLI flags or environment variables
- `download.ts` - Downloads tarballs using ky HTTP client
- `extract.ts` - Extracts tarball contents with filtering support
- `check-existing.ts` - Checks for file conflicts before extraction
- `prompt.ts` - Interactive prompts for user confirmation

**Key Design Pattern**
GitLab's API supports server-side subdir filtering via `path` parameter, so subdirectory extraction is handled differently for GitLab vs GitHub/Bitbucket (see `needsSubdirExtraction` logic in baedal.ts:43).

## Build Configuration

**tsup.config.ts**
- Dual entry points (CLI + library)
- ESM-only output format (aligns with package.json `"type": "module"`)
- Node 18+ target
- Shebang automatically added to CLI entry
- External dependencies not bundled

## Key Dependencies

- `commander` - CLI argument parsing
- `ky` - HTTP client for API requests
- `tar` - Tarball extraction
- `micromatch` - Glob pattern matching for exclude option
- `globby` - File system globbing
- `picocolors` - Terminal colors

## TypeScript & Linting

**ESLint Configuration (eslint.config.js)**
- Uses flat config format with typescript-eslint
- Enforces `type` over `interface` (@typescript-eslint/consistent-type-definitions)
- Import ordering with alphabetical sorting
- Perfectionist plugin for sorting classes, objects, and types
- Allows `any` type (@typescript-eslint/no-explicit-any: off)

**Project Constraints**
- Node.js >= 18.0.0
- ESM modules only (no CommonJS)
- All imports must use `.js` extension (TypeScript ESM requirement)
