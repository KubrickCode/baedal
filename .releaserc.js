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
          transform(commit) {
            const highlightTypes = ["feat", "fix", "perf"];

            const modifiedCommit = { ...commit };

            if (highlightTypes.includes(commit.type)) {
              modifiedCommit.category = "🎯 Highlights";
            } else {
              modifiedCommit.category = "🔧 Maintenance";
            }

            return modifiedCommit;
          },
          groupBy: "category",
          commitGroupsSort(a, b) {
            const priority = {
              "🎯 Highlights": 1,
              "🔧 Maintenance": 2,
            };
            return (priority[a.title] || 999) - (priority[b.title] || 999);
          },
          commitsSort: ["scope", "subject"],
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
