# Baedal

> 🚧 **Work in Progress** - This project is under active development.

Simple Git repository downloader CLI tool supporting GitHub and GitLab.

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

# Using GitLab URL
baedal https://gitlab.com/user/repo
```

## Features

- Download from GitHub and GitLab repositories
- Support for specific folders/files
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

// GitLab
await baedal("gitlab:user/repo");
await baedal("gitlab:user/repo", "./output");
await baedal("https://gitlab.com/user/repo/src", "./src");
```

## License

MIT
