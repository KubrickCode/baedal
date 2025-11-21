set dotenv-load := true

root_dir := justfile_directory()
src_dir := root_dir / "src"

cli *args:
    node dist/cli.js {{ args }}

deps:
    pnpm install

build:
    pnpm build

link:
    pnpm link --global

lint target="all":
    #!/usr/bin/env bash
    set -euox pipefail
    case "{{ target }}" in
      all)
        just lint src
        just lint config
        just lint justfile
        ;;
      src)
        npx prettier --write "{{ src_dir }}/**/*.ts"
        cd "{{ src_dir }}"
        pnpm lint
        ;;
      config)
        npx prettier --write "**/*.{json,yml,yaml,md}"
        ;;
      justfile)
        just --fmt --unstable
        ;;
      *)
        echo "Unknown target: {{ target }}"
        exit 1
        ;;
    esac

release:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "⚠️  WARNING: This will trigger a production release!"
    echo "   - Merge main → release"
    echo "   - Push to origin/release"
    echo "   - Trigger GitHub Actions release workflow"
    echo ""
    read -p "Continue? (type 'yes' to confirm): " confirm
    if [[ "$confirm" != "yes" ]]; then
      echo "❌ Release cancelled."
      exit 1
    fi

    echo "🚀 Starting release process..."
    echo "📦 Merging main to release branch..."
    git checkout release
    git merge main
    git push origin release
    git checkout main
    echo ""
    echo "✅ Release branch updated!"
    echo "🔄 GitHub Actions will now:"
    echo "   1. Analyze commits for version bump"
    echo "   2. Generate release notes"
    echo "   3. Create tag and GitHub release"
    echo "   4. Update CHANGELOG.md"
    echo "   5. Publish to npm"
    echo ""
    echo "📊 Check progress: https://github.com/KubrickCode/baedal/actions"

test *args:
    pnpm test {{ args }}
