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

## Features

- Download from GitHub, GitLab, and Bitbucket repositories
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

// GitLab
await baedal("gitlab:user/repo");
await baedal("gitlab:user/repo", "./output");
await baedal("https://gitlab.com/user/repo/src", "./src");

// Bitbucket
await baedal("bitbucket:user/repo");
await baedal("bitbucket:user/repo", "./output");
await baedal("https://bitbucket.org/user/repo/src", "./src");
```

## License

MIT
