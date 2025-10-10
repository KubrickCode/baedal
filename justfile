cli *args:
  node dist/cli.js {{args}}


deps:
  yarn install

build:
  yarn build

link:
  yarn link
