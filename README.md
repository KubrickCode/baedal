# Baedal

> 🚧 **Work in Progress** - This project is under active development.

Simple Git repository downloader CLI tool supporting GitHub, GitLab, and Bitbucket.

## Installation

```bash
yarn global add baedal
```

## Usage

### GitHub

```bash
# Download entire repository (defaults to GitHub)
baedal user/repo

# Download to specific directory
baedal user/repo ./output

# Download specific folder or file
baedal user/repo/src/components ./components

# Exclude specific files or patterns
baedal user/repo --exclude "*.test.ts"
baedal user/repo --exclude "*.md" ".gitignore"
baedal user/repo ./output --exclude "test/**" "docs/**"

# Explicit GitHub prefix
baedal github:user/repo

# Using GitHub URL
baedal https://github.com/user/repo
```

### GitLab

```bash
# Download from GitLab using prefix
baedal gitlab:user/repo

# Download to specific directory
baedal gitlab:user/repo ./output

# Download specific folder or file
baedal gitlab:user/repo/src/components ./components

# Exclude specific files or patterns
baedal gitlab:user/repo --exclude "*.test.ts"
baedal gitlab:user/repo --exclude "*.test.ts" "*.md"

# Using GitLab URL
baedal https://gitlab.com/user/repo
```

### Bitbucket

```bash
# Download from Bitbucket using prefix
baedal bitbucket:user/repo

# Download to specific directory
baedal bitbucket:user/repo ./output

# Download specific folder or file
baedal bitbucket:user/repo/src/components ./components

# Exclude specific files or patterns
baedal bitbucket:user/repo --exclude "*.test.ts"
baedal bitbucket:user/repo --exclude "*.test.ts" "*.md"

# Using Bitbucket URL
baedal https://bitbucket.org/user/repo
```

## Private Repository Authentication

Baedal supports downloading from private repositories using authentication tokens.

### Using CLI Flag

```bash
# GitHub (Personal Access Token)
baedal user/private-repo --token YOUR_GITHUB_TOKEN

# GitLab (Private Token)
baedal gitlab:user/private-repo --token YOUR_GITLAB_TOKEN

# Bitbucket (App Password)
baedal bitbucket:user/private-repo --token YOUR_BITBUCKET_TOKEN
```

### Using Environment Variables

Set one of the following environment variables:

```bash
# Generic token (works for all providers)
export BAEDAL_TOKEN=your_token

# Provider-specific tokens
export GITHUB_TOKEN=your_github_token
export GITLAB_TOKEN=your_gitlab_token
export BITBUCKET_TOKEN=your_bitbucket_token

# Then use baedal normally
baedal user/private-repo
```

### Token Generation

- **GitHub**: Create a Personal Access Token at Settings > Developer settings > Personal access tokens
  - Required scope: `repo` (for private repositories)
- **GitLab**: Create a Private Token at User Settings > Access Tokens
  - Required scope: `read_repository`
- **Bitbucket**: Create an App Password at Personal settings > App passwords
  - Required permission: `Repositories: Read`

## Features

- Download from GitHub, GitLab, and Bitbucket repositories
- Support for private repositories with authentication tokens
- Support for specific folders/files
- Exclude specific files or patterns using glob patterns
- Automatic branch detection (main/master)
- Multiple input formats (prefix, URL, or simple user/repo)
- Zero configuration

## Library Usage

```typescript
import { baedal } from "baedal";

// GitHub (default)
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

// Private repository with token
await baedal("user/private-repo", "./output", {
  token: process.env.GITHUB_TOKEN,
});

// GitLab
await baedal("gitlab:user/repo");
await baedal("gitlab:user/repo", "./output");
await baedal("https://gitlab.com/user/repo/src", "./src");

// GitLab private repository
await baedal("gitlab:user/private-repo", "./output", {
  token: process.env.GITLAB_TOKEN,
});

// Bitbucket
await baedal("bitbucket:user/repo");
await baedal("bitbucket:user/repo", "./output");
await baedal("https://bitbucket.org/user/repo/src", "./src");

// Bitbucket private repository
await baedal("bitbucket:user/private-repo", "./output", {
  token: process.env.BITBUCKET_TOKEN,
});
```

## License

MIT
