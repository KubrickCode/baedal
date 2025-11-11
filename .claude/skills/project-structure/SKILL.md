---
name: project-structure
description: |
  Project folder structure design guide. Define standard directory structures for various project types including monorepo,  NPM packages
  TRIGGER: Project structure design, folder structure questions, directory organization, project creation
---

# Project Structure Guide

## Monorepo

```
project-root/
├── src/                         # All services/apps
├── infra/                       # Shared infrastructure
├── docs/                        # Documentation
├── .devcontainer/               # Dev Container configuration
├── .github/                     # Workflows, templates
├── .vscode/                     # VSCode settings
├── .claude/                     # Claude settings
├── .gemini/                     # Gemini settings
├── package.json                 # Root package.json. For releases, version management
├── go.work                      # Go workspace (when using Go)
├── justfile                     # Just task runner
├── .gitignore
├── .prettierrc
├── .prettierignore
└── README.md
```

## NPM

```
project-root/
├── cli/                        # CLI execution entry point
├── internal/                   # Private packages
├── pkg/                        # Public packages
├── configs/                    # Configuration files
├── scripts/                    # Utility scripts
├── tests/                      # Integration tests
├── docs/                       # Documentation
├── dist/                       # Build artifacts
├── package.json
├── tsconfig.json
└── README.md
```
