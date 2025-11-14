export default {
  "src/**/*.ts": () => "just lint src",
  "**/*.{json,yml,yaml,md}": () => "just lint config",
  justfile: () => "just lint justfile",
};
