import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { FileSystemError } from "../../internal/core/errors/";
import { logger } from "../../internal/core/index";
import { resolveConfigPath } from "./config";

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
    throw new FileSystemError(
      `Configuration file already exists: ${configPath}
To overwrite: baedal push:init ${syncName} --force
To edit:      open ${configPath}`
    );
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
  logger.success("\n✓ Configuration file created!");
  logger.log(`  ${configPath}\n`);

  logger.log("Next steps:");
  logger.log(`  1. Edit the configuration file`);
  logger.log(`  2. Set your GitHub token in the config`);
  logger.log(`  3. Execute: baedal push ${syncName}\n`);
};
