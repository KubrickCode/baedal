import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import { ConfigError } from "../../internal/core/errors/";
import { PushConfigSchema, type PushConfig } from ".";

const CONFIG_DIR = ".baedal/push";

export const resolveConfigPath = (syncName: string, baseDir?: string): string => {
  const base = baseDir ?? process.cwd();
  return resolve(base, CONFIG_DIR, `${syncName}.yml`);
};

export const loadPushConfig = (syncName: string, baseDir?: string): PushConfig => {
  const configPath = resolveConfigPath(syncName, baseDir);

  if (!existsSync(configPath)) {
    throw new ConfigError(`Configuration file not found: ${configPath}`);
  }

  const yamlContent = readFileSync(configPath, "utf-8");
  const parsed = yaml.load(yamlContent);

  return PushConfigSchema.parse(parsed);
};
