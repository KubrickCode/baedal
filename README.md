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
baedal user/repo

# Download to specific directory
baedal user/repo ./output

# Download specific folder or file
baedal user/repo/src/components ./components

# Exclude specific files or patterns
baedal user/repo --exclude "*.test.ts"
baedal user/repo --exclude "*.md" ".gitignore"
baedal user/repo ./output --exclude "test/**" "docs/**"

# File conflict handling
baedal user/repo --force                # Force overwrite without confirmation
baedal user/repo --skip-existing        # Skip existing files, only add new files
baedal user/repo --no-clobber          # Abort if any file would be overwritten

# Explicit GitHub prefix
baedal github:user/repo

# Using GitHub URL
baedal https://github.com/user/repo
```

## Private Repository Authentication

Baedal supports downloading from private repositories using GitHub authentication tokens.

### Using CLI Flag

```bash
baedal user/private-repo --token YOUR_GITHUB_TOKEN
```

### Using Environment Variables

```bash
# GitHub token
export GITHUB_TOKEN=your_github_token
# or generic token
export BAEDAL_TOKEN=your_token

# Then use baedal normally
baedal user/private-repo
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

// File conflict handling
await baedal("user/repo", "./output", {
  force: true, // Force overwrite without confirmation
});
await baedal("user/repo", "./output", {
  skipExisting: true, // Skip existing files, only add new files
});
await baedal("user/repo", "./output", {
  noClobber: true, // Abort if any file would be overwritten
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

## License

MIT
