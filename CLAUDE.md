# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baedal is a TypeScript-based CLI tool and npm library for downloading files/folders from GitHub repositories. It supports both public and private repositories with authentication tokens, and offers features like file exclusion patterns and subdirectory downloads.

## Development Commands

**Build**

```bash
pnpm build          # Build the project using tsup
```

**Test**

```bash
pnpm test                  # Run Vitest tests
pnpm test -- --coverage    # Run tests with coverage report
```

**Lint**

```bash
pnpm lint           # Run ESLint on src/**/*.ts
```

**Package Preparation**

```bash
pnpm prepublishOnly # Auto-runs pnpm build before publishing
```

## Architecture

**Entry Points**

- `src/cli.ts` - CLI entry point (becomes `baedal` command)
- `src/index.ts` - Library entry point for programmatic use

**Project Structure (NPM Guidelines)**

```
src/
├── cli/              # CLI adapter layer
│   ├── adapter.ts    # CLI options → Library options conversion
│   └── types.ts      # CLI-specific types
├── pkg/              # Public API (publishable modules)
│   ├── pull/         # Pull command (download from GitHub)
│   │   ├── index.ts  # Main pull logic
│   │   ├── github.ts # GitHub API integration
│   │   └── archive.ts # Tarball URL construction
│   └── push/         # Push command (sync to multiple repos)
└── internal/         # Private implementation (not exported)
    ├── core/         # Core abstractions (high reusability)
    │   ├── errors/   # Custom error classes (BaseError, ValidationError, etc.)
    │   ├── types/    # Shared internal types (RepoInfo, Provider, etc.)
    │   └── logger.ts # Logging abstraction (consola wrapper)
    ├── domain/       # Domain logic (business rules)
    │   ├── parser.ts # GitHub source parsing
    │   └── extract.ts # Tarball extraction strategies
    ├── infra/        # Infrastructure layer (external systems)
    │   ├── github-client.ts # GitHub API client (Octokit wrapper)
    │   ├── download.ts # HTTP download (ky + streams)
    │   └── prompt.ts # User interaction (readline wrapper)
    └── utils/        # Pure utility functions
        ├── path-helpers.ts # Path manipulation helpers
        ├── check-existing.ts # File existence checker
        └── file-compare.ts # File hash comparison (SHA-256)
```

**Internal Module Organization Principles**

The `src/internal/` directory follows a **hybrid organizational pattern** with four clear categories:

1. **`core/`** - Foundational abstractions used project-wide
   - Errors, types, and logging that all layers depend on
   - High reusability, minimal dependencies

2. **`domain/`** - Business logic independent of external systems
   - Parse GitHub sources, extract tarballs
   - Domain rules and workflows

3. **`infra/`** - External system integrations
   - GitHub API, HTTP clients, user I/O
   - Wraps third-party libraries for testability

4. **`utils/`** - Stateless pure functions
   - Path manipulation, file checking
   - No side effects, easily composable

**Module Placement Guidelines:**

- Global abstractions (errors, types, logger) → `core/`
- Domain rules and workflows → `domain/`
- External communication → `infra/`
- Pure helper functions → `utils/`

**Pull Flow (src/pkg/pull/index.ts)**

The main `baedal()` function orchestrates:

1. Parse source using `parseSource()` to extract owner, repo, subdir
2. Download tarball from GitHub API to temp directory
3. Check for existing files and handle conflicts via ConflictMode
4. Extract files with optional subdir filtering and exclude patterns
5. Clean up temp files

**Error Handling Standardization**

All errors inherit from `BaseError` with structured error codes:

- `FileSystemError` - File I/O and extraction errors (with path context)
- `NetworkError` - GitHub API and download errors (with URL context)
- `ValidationError` - Input validation and configuration errors
- `ConfigError` - Configuration file errors

**Error Handling Guidelines**:

- **NEVER use generic `Error` class** - ESLint rule enforces this
- Always use appropriate BaseError subclass based on error category
- Import from `src/internal/core/errors/`
- Provide actionable error messages with context

Example:

```typescript
// Bad - generic Error (linter will reject)
throw new Error("Download failed");

// Good - specific error with context
throw new NetworkError("Failed to download tarball", "DOWNLOAD_FAILED", {
  url: tarballUrl,
});
```

**Recent Improvements**:

- All error throwing unified to BaseError hierarchy (download.ts, files.ts)
- Logging standardized with `logger` utility (removed direct console usage)
- Provider type utilized for extensibility (archive.ts supports provider-based branching)
- CLI input validation enhanced (validateExcludePatterns in adapter.ts)
- Extract logic simplified with strategy pattern (extractDirectly/extractViaTemp)
- ESLint rule enforces BaseError usage (no-restricted-syntax)
- Code quality enhanced with es-toolkit utilities (partition, compact, isEmpty)
- Modified-only conflict mode added (SHA-256 hash-based file comparison for selective updates)

**Utility Functions**

**MANDATORY**: Use es-toolkit for array/object/string utilities

- Array operations: Use `partition`, `compact`, `chunk`, `uniq` instead of manual loops
- Null checks: Use `isEmpty` (from `es-toolkit/compat`) instead of `!value` or `value?.length === 0`
- Type-safe: es-toolkit provides better TypeScript inference

Example:

```typescript
// Bad - manual array filtering and null checks
const valid = items.filter((x) => x && x.length > 0);
if (!value || value.length === 0) return;

// Good - es-toolkit utilities
import { compact } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
const valid = compact(items);
if (isEmpty(value)) return;
```

Rationale:

- Consistent patterns across codebase
- Better null safety (handles edge cases like `null`, `undefined`, `""`, `0`, `false`)
- Industry-standard library (battle-tested)
- Tree-shakeable (only used functions bundled)

See: https://es-toolkit.slash.page

**Conflict Resolution**

Uses discriminated union type `ConflictMode` to enforce mutually exclusive options:

- `{ mode: "force" }` - Overwrite without confirmation
- `{ mode: "interactive" }` - Ask user (default)
- `{ mode: "modified-only" }` - Update only modified files (ignore new files, SHA-256 hash comparison)
- `{ mode: "no-clobber" }` - Abort on conflicts
- `{ mode: "skip-existing" }` - Skip existing files (add new files only)

## Build Configuration

**tsup.config.ts**

- Dual entry points (CLI + library)
- ESM-only output format (aligns with package.json `"type": "module"`)
- Node 18+ target
- Shebang automatically added to CLI entry
- External dependencies not bundled

## Key Dependencies

**Runtime**

- `commander` - CLI argument parsing
- `@octokit/rest` - GitHub API client
- `ky` - HTTP client for tarball downloads
- `tar` - Tarball extraction
- `micromatch` - Glob pattern matching for exclude option
- `globby` - File system globbing
- `picocolors` - Terminal colors

**Development**

- `vitest` - Testing framework (fast, ESM-native)

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

## Testing Strategy

**Test Infrastructure**

- Vitest with native TypeScript/ESM support
- Globals enabled (`describe`, `it`, `expect` available without import)
- V8 coverage provider

**Test Patterns**

- Pure functions: Direct unit tests (e.g., `parser.spec.ts`)
- External dependencies: Mock with `vi.mock` (e.g., File System, GitHub API)
- Integration tests: Full flow validation with mocked I/O

**Coverage Goals**

- Overall coverage target: ≥60%
- Critical paths: Pull flow, Push flow, Error handling

## Release Management

**Automated Release Process**

- **Version Determination**: Automatically calculated from commit types
  - `feat` → minor version bump
  - `fix`, `ifix`, `perf`, `docs`, `style`, `refactor`, `test`, `ci`, `chore` → patch version bump
- **Release Notes**: Auto-generated with two-tier structure (주요 기능/유지보수)
- **Workflow**: push to `release` branch → GitHub Actions → automatic tag/release/CHANGELOG generation
- **Commit Format**: Must follow Conventional Commits (enforced by commitlint)
