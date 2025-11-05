import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import yaml from "js-yaml";
import type { PushConfig } from "./types.js";

const CONFIG_DIR = ".baedal/push";

export const resolveConfigPath = (syncName: string, baseDir?: string): string => {
  const base = baseDir ?? process.cwd();
  return resolve(base, CONFIG_DIR, `${syncName}.yml`);
};

export const loadPushConfig = (syncName: string, baseDir?: string): PushConfig => {
  const configPath = resolveConfigPath(syncName, baseDir);

  if (!existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const yamlContent = readFileSync(configPath, "utf-8");
  const parsed = yaml.load(yamlContent);

  if (!parsed || typeof parsed !== "object") {
    throw new Error(`Invalid configuration format in ${configPath}`);
  }

  return parsed as PushConfig;
};
