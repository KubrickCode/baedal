const mainTemplate = `{{#if noteGroups}}
{{#each noteGroups}}

### {{title}}

{{#each notes}}
* {{text}}
{{/each}}
{{/each}}
{{/if}}

{{#if commitGroups}}
{{~#each commitGroups}}

{{~#if @first}}
## 🎯 Highlights

{{/if}}
{{~#if (equal @index 3)}}
## 🔧 Maintenance

{{/if}}
### {{title}}

{{#each commits}}
* {{#if scope}}**{{scope}}:** {{/if}}{{subject}}{{#if hash}} ([{{hash}}]({{../../../repositoryUrl}}/commit/{{hash}})){{/if}}
{{/each}}
{{/each}}
{{/if}}`;

export default {
  branches: ["release"],
  repositoryUrl: "https://github.com/KubrickCode/baedal.git",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { type: "feat", release: "minor" },
          { type: "fix", release: "patch" },
          { type: "perf", release: "patch" },
          { type: "ifix", release: "patch" },
          { type: "docs", release: "patch" },
          { type: "style", release: "patch" },
          { type: "refactor", release: "patch" },
          { type: "test", release: "patch" },
          { type: "ci", release: "patch" },
          { type: "chore", release: "patch" },
        ],
      },
    ],
    [
      "@semantic-release/release-notes-generator",
      {
        preset: "conventionalcommits",
        presetConfig: {
          types: [
            { type: "feat", section: "✨ Features", hidden: false },
            { type: "fix", section: "🐛 Bug Fixes", hidden: false },
            { type: "perf", section: "⚡ Performance", hidden: false },
            { type: "ifix", section: "🔧 Internal Fixes", hidden: false },
            { type: "docs", section: "📚 Documentation", hidden: false },
            { type: "style", section: "💄 Styles", hidden: false },
            { type: "refactor", section: "♻️ Refactoring", hidden: false },
            { type: "test", section: "✅ Tests", hidden: false },
            { type: "ci", section: "🔧 CI/CD", hidden: false },
            { type: "chore", section: "🔨 Chore", hidden: false },
          ],
        },
        writerOpts: {
          groupBy: "type",
          commitGroupsSort(a, b) {
            const highlightTypes = ["✨ Features", "🐛 Bug Fixes", "⚡ Performance"];
            const aIsHighlight = highlightTypes.includes(a.title);
            const bIsHighlight = highlightTypes.includes(b.title);

            if (aIsHighlight && !bIsHighlight) return -1;
            if (!aIsHighlight && bIsHighlight) return 1;

            const typeOrder = [
              "✨ Features",
              "🐛 Bug Fixes",
              "⚡ Performance",
              "🔧 Internal Fixes",
              "📚 Documentation",
              "💄 Styles",
              "♻️ Refactoring",
              "✅ Tests",
              "🔧 CI/CD",
              "🔨 Chore",
            ];
            return typeOrder.indexOf(a.title) - typeOrder.indexOf(b.title);
          },
          commitsSort: ["scope", "subject"],
          mainTemplate,
        },
      },
    ],
    [
      "@semantic-release/changelog",
      {
        changelogFile: "CHANGELOG.md",
      },
    ],
    "@semantic-release/npm",
    [
      "@semantic-release/exec",
      {
        prepareCmd: "just lint config",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "CHANGELOG.md"],
        message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: [],
      },
    ],
  ],
};
