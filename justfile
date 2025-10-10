cli *args:
  node dist/cli.js {{args}}


deps:
  yarn install

build:
  yarn build

link:
  yarn link

release version="patch":
    @echo "🚀 Creating {{version}} release..."
    npm version {{version}}
    git push origin main --tags
    git checkout release
    git merge main
    git push origin release
    git checkout main
    @echo "✅ Release complete! Check GitHub Actions."
