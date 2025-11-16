# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**CRITICAL**

- Always update CLAUDE.md and README.md When changing a feature that requires major work or essential changes to the content of the document. Ignore minor changes.
- Never create branches or make commits autonomously - always ask the user to do it manually
- Avoid unfounded assumptions - verify critical details
  - Don't guess file paths - use Glob/Grep to find them
  - Don't guess API contracts or function signatures - read the actual code
  - Reasonable inference based on patterns is OK
  - When truly uncertain about important decisions, ask the user

**IMPORTANT**

- If Claude repeats the same mistake, add an explicit ban to CLAUDE.md
  - Leveraging the Failure-Driven Documentation Pattern
- Proactively leverage frontmatter-based auto-triggering for skills and agents
  - Use .claude/skills/ for general principles (coding standards, work methodologies, ...)
  - Use .claude/agents/ for specialized expert domains (architecture, optimization, ...)
- Always gather context before starting work
  - Read related files first (don't work blind)
  - Check existing patterns in codebase
  - Review project conventions (naming, structure, etc.)
  - Reference .claude/skills/work-execution-principles for detailed guidance
- Always assess issue size and scope accurately - avoid over-engineering simple tasks
  - Apply to both implementation and documentation
  - Verbose documentation causes review burden for humans
- Respect workspace tooling conventions
  - Always use workspace's package manager (detect from lock files: pnpm-lock.yaml → pnpm, yarn.lock → yarn, package-lock.json → npm)
  - Prefer just commands when task exists in justfile or adding recurring tasks
  - Direct command execution acceptable for one-off operations

## Project Overview

Baedal is a TypeScript-based CLI tool and npm library for downloading files/folders from Git repositories (GitHub, GitLab, Bitbucket). It supports both public and private repositories with authentication tokens, and offers features like file exclusion patterns and subdirectory downloads.

## Development Commands

**Build**

```bash
pnpm build          # Build the project using tsup
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

## Release Management

**Automated Release Process**

- **Version Determination**: Automatically calculated from commit types
  - `feat` → minor version bump
  - `fix`, `ifix`, `perf`, `docs`, `style`, `refactor`, `test`, `ci`, `chore` → patch version bump
- **Release Notes**: Auto-generated with two-tier structure (주요 기능/유지보수)
- **Workflow**: push to `release` branch → GitHub Actions → automatic tag/release/CHANGELOG generation
- **Commit Format**: Must follow Conventional Commits (enforced by commitlint)
