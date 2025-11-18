# Baedal

Simple GitHub repository downloader CLI tool.

## Requirements

- Node.js >= 18.0.0

## Installation

```bash
npm install -g baedal
# or
pnpm add -g baedal
```

## Usage

```bash
# Download entire repository
baedal pull user/repo

# Download to specific directory
baedal pull user/repo ./output

# Download specific folder or file
baedal pull user/repo/src/components ./components

# Exclude specific files or patterns
baedal pull user/repo --exclude "*.test.ts"
baedal pull user/repo --exclude "*.md" ".gitignore"
baedal pull user/repo ./output --exclude "test/**" "docs/**"

# File conflict handling
baedal pull user/repo --force                # Force overwrite without confirmation
baedal pull user/repo --skip-existing        # Skip existing files, only add new files
baedal pull user/repo --no-clobber          # Abort if any file would be overwritten

# Explicit GitHub prefix
baedal pull github:user/repo

# Using GitHub URL
baedal pull https://github.com/user/repo

# Note: 'pull' is the default command, so 'baedal user/repo' also works
baedal user/repo
```

## Private Repository Authentication

Baedal supports downloading from private repositories using GitHub authentication tokens.

### Using CLI Flag

```bash
baedal pull user/private-repo --token YOUR_GITHUB_TOKEN
```

### Using Environment Variables

```bash
# GitHub token
export GITHUB_TOKEN=your_github_token
# or generic token
export BAEDAL_TOKEN=your_token

# Then use baedal normally
baedal pull user/private-repo
```

### Token Generation

Create a GitHub Personal Access Token at Settings > Developer settings > Personal access tokens

- Required scope: `repo` (for private repositories)

## Features

- Download from GitHub repositories
- Support for private repositories with authentication tokens
- Support for specific folders/files
- Exclude specific files or patterns using glob patterns
- File conflict handling modes (force, skip-existing, no-clobber)
- Automatic branch detection (main/master)
- Multiple input formats (prefix, URL, or simple user/repo)
- Zero configuration

## Library Usage

```typescript
import { baedal } from "baedal";

// Basic usage
await baedal("user/repo");
await baedal("user/repo", "./output");
await baedal("user/repo/src", "./src");

// With exclude option
await baedal("user/repo", "./output", {
  exclude: ["*.test.ts", "*.md", "test/**"],
});

// Exclude without specifying destination (uses current directory)
await baedal("user/repo", {
  exclude: ["*.test.ts", "docs/**"],
});

// File conflict handling (using ConflictMode)
await baedal("user/repo", "./output", {
  conflictMode: { mode: "force" }, // Force overwrite without confirmation
});
await baedal("user/repo", "./output", {
  conflictMode: { mode: "skip-existing" }, // Skip existing files, only add new files
});
await baedal("user/repo", "./output", {
  conflictMode: { mode: "no-clobber" }, // Abort if any file would be overwritten
});

// Legacy conflict handling (still supported)
await baedal("user/repo", "./output", {
  force: true, // Deprecated: use conflictMode instead
});

// Private repository with token
await baedal("user/private-repo", "./output", {
  token: process.env.GITHUB_TOKEN,
});

// Using GitHub URL
await baedal("https://github.com/user/repo");
await baedal("https://github.com/user/repo/src", "./src");
```

## Contributing

This project started as a small personal project with a development environment highly tailored to the owner. Given the low probability of external contributors, the current setup is unlikely to change.

If you'd like to contribute, please contact kubrickcode@gmail.com and we'll adapt the environment to accommodate contributions.

### Development Guidelines

- **Commit Format**: Follow [Conventional Commits](https://www.conventionalcommits.org/) specification
- **Additional Info**: See [CLAUDE.md](./CLAUDE.md) for detailed development guidelines

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Run tests in watch mode
pnpm test -- --watch
```

## License

MIT
