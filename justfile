set dotenv-load := true

root_dir := justfile_directory()
src_dir := root_dir / "src"

cli *args:
    node dist/cli.js {{ args }}

deps:
    yarn install

build:
    yarn build

link:
    yarn link

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
        prettier --write "{{ src_dir }}/**/*.ts"
        cd "{{ src_dir }}"
        yarn lint
        ;;
      config)
        prettier --write "**/*.{json,yml,yaml,md}"
        ;;
      justfile)
        just --fmt --unstable
        ;;
      *)
        echo "Unknown target: {{ target }}"
        exit 1
        ;;
    esac

release version="patch":
    @echo "🚀 Creating {{ version }} release..."
    npm version {{ version }}
    git push origin main --tags
    git checkout release
    git merge main
    git push origin release
    git checkout main
    @echo "✅ Release complete! Check GitHub Actions."
