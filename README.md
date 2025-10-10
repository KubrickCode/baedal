# Baedal

> 🚧 **Work in Progress** - This project is under active development.

Simple GitHub repository downloader CLI tool.

## Installation

```bash
yarn global add baedal
```

## Usage

```bash
# Download entire repository
baedal user/repo

# Download to specific directory
baedal user/repo ./output

# Download specific folder or file
baedal user/repo/src/components ./components
```

## Features

- Download from GitHub repositories
- Support for specific folders/files
- Automatic branch detection (main/master)
- Zero configuration

## Library Usage

```typescript
import { baedal } from "baedal";

await baedal("user/repo");
await baedal("user/repo", "./output");
await baedal("user/repo/src", "./src");
```

## License

MIT
