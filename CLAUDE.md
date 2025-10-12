# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Baedal is a TypeScript-based CLI tool and npm library for downloading files/folders from Git repositories (GitHub, GitLab, and Bitbucket). It's similar to degit but with multi-provider support and additional features like file exclusion patterns and interactive overwrite confirmation.

## Build and Development Commands

```bash
# Build the project (uses tsup)
yarn build

# The project uses tsup for bundling, which:
# - Compiles TypeScript to ESM format only
# - Generates two entry points: cli.js and index.js
# - Adds shebang (#!/usr/bin/env node) to cli.js
# - Splits chunks and tree-shakes for optimization
```

## Architecture Overview

### Dual Entry Points

The project has two distinct entry points built from the same codebase:

1. **CLI Entry** (`src/cli.ts` → `dist/cli.js`): Command-line interface using Commander.js
2. **Library Entry** (`src/index.ts` → `dist/index.js`): Programmatic API that exports `baedal()` function

### Core Architecture

The codebase follows a provider pattern to support multiple Git hosting platforms:

```
src/
├── cli.ts                 # CLI entry point
├── index.ts              # Library entry point
├── core/
│   ├── baedal.ts         # Main orchestration logic
│   └── providers/        # Provider-specific implementations
│       ├── detector.ts   # Detects provider from source string
│       ├── archive.ts    # Unified archive URL generation and branch detection
│       ├── github.ts     # GitHub-specific API interactions
│       ├── gitlab.ts     # GitLab-specific API interactions (includes project path validation)
│       └── bitbucket.ts  # Bitbucket-specific API interactions
├── utils/
│   ├── parser.ts         # Parses source input (user/repo, URLs, prefixes)
│   ├── download.ts       # Downloads tarball archives
│   ├── extract.ts        # Extracts and filters tarball contents
│   ├── check-existing.ts # Checks for file conflicts
│   ├── prompt.ts         # Interactive CLI prompts
│   └── auth.ts           # Authentication header generation
└── types/
    ├── providers.ts      # Provider types and constants (API URLs, archive URLs)
    └── index.ts          # Shared types (BaedalOptions, DownloadResult, RepoInfo)
```

### Key Architectural Patterns

**Provider Abstraction**: Each Git provider (GitHub/GitLab/Bitbucket) has its own module in `src/core/providers/` that implements provider-specific API calls. The `archive.ts` module provides a unified interface via `getDefaultBranch()` and `getArchiveUrl()` that delegates to the appropriate provider.

**GitLab Project Path Validation**: GitLab supports nested project paths (e.g., `group/subgroup/project`). The `validateGitLabProject()` function in `src/core/providers/gitlab.ts` attempts to find the longest valid project path by making API calls, trying progressively shorter paths until a valid project is found (max 5 attempts).

**Subdir Handling**: GitLab has special handling where subdirectories are filtered server-side using a `?path=` query parameter, reducing download size. Other providers filter during extraction.

**File Conflict Resolution**: The `baedal.ts` orchestrator implements three modes for handling existing files:

- `--force`: Overwrite without asking
- `--skip-existing`: Skip existing files, only add new ones
- `--no-clobber`: Abort if any file would be overwritten
- Default: Interactive prompt showing files to overwrite/add

**Authentication**: Token-based auth supports both CLI flags (`--token`) and environment variables. The CLI resolves tokens in this order:

1. `--token` flag
2. `BAEDAL_TOKEN` (generic)
3. Provider-specific env vars (`GITHUB_TOKEN`, `GITLAB_TOKEN`, `BITBUCKET_TOKEN`)

### Data Flow

1. **Input Parsing** (`parser.ts`): Normalizes various input formats (prefix, URL, plain user/repo) into a standardized `RepoInfo` object containing `{owner, repo, subdir?, provider}`
2. **Branch Detection** (`archive.ts`): Calls provider-specific API to get default branch
3. **Download** (`download.ts`): Constructs archive URL and downloads tarball to temp directory
4. **Conflict Check** (`check-existing.ts`): Compares tarball contents against destination to identify overwrites
5. **User Confirmation** (`prompt.ts`): Shows interactive prompt if conflicts found (unless `--force` or other mode)
6. **Extraction** (`extract.ts`): Extracts tarball with filtering by subdir and exclude patterns

## TypeScript Configuration

The project uses strict TypeScript with additional safety:

- `strict: true`
- `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`
- `noUncheckedIndexedAccess: true` (requires null checks on array/object access)
- `exactOptionalPropertyTypes: true` (optional properties cannot be `undefined` explicitly)
- ESM-only (`"type": "module"` in package.json)
- Node.js 18+ required

## Testing the CLI Locally

```bash
# After building, test the CLI using the built artifact
node dist/cli.js user/repo

# Or install globally for testing
yarn global add file:$(pwd)
baedal user/repo
```

## Important Implementation Notes

- **ESM Only**: Everything uses ES modules. Import statements must include `.js` extension even for `.ts` files (TypeScript + ESM requirement)
- **No Tests**: The project currently has no test suite (tsconfig excludes `**/*.test.ts` and `**/*.spec.ts`)
- **Tarball Cleanup**: Always uses try/finally to clean up temp directories even on errors
- **Provider Detection**: Order matters - checks for explicit prefixes (`gitlab:`, `bitbucket:`) and URLs before defaulting to GitHub
