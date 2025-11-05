import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import picocolors from "picocolors";
import { resolveConfigPath } from "./config.js";

const generateTemplate = (syncName: string): string => {
  return `# Baedal Push Configuration: ${syncName}
# Generated on ${new Date().toISOString()}

token: ghp_your_token_here

syncs:
  - source: .claude/skills
    dest: .claude/skills
    repos:
      - owner/repo1
      - owner/repo2
`;
};

export const initPushConfig = (syncName: string, baseDir?: string, force = false): string => {
  const configPath = resolveConfigPath(syncName, baseDir);

  if (existsSync(configPath) && !force) {
    throw new Error(`Configuration file already exists: ${configPath}\nUse --force to overwrite.`);
  }

  const dir = dirname(configPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const template = generateTemplate(syncName);
  writeFileSync(configPath, template, "utf-8");

  return configPath;
};

export const printInitSuccess = (configPath: string, syncName: string): void => {
  console.log(picocolors.green("\n✓ Configuration file created!"));
  console.log(picocolors.dim(`  ${configPath}\n`));

  console.log(picocolors.bold("Next steps:"));
  console.log(`  1. Edit the configuration file`);
  console.log(`  2. Set your GitHub token in the config`);
  console.log(`  3. Execute: ${picocolors.cyan(`baedal push ${syncName}`)}\n`);
};
