import { Command } from "commander";
import { adaptCLIOptions } from "./cli/adapter";
import type { PullCLIOptions } from "./cli/types";
import {
  ConfigError,
  FileSystemError,
  NetworkError,
  ValidationError,
} from "./internal/core/errors/";
import { logger } from "./internal/core/index";
import { baedal } from "./pkg/pull/index";
import { executePush, initPushConfig, loadPushConfig, printInitSuccess } from "./pkg/push/index";
import type { PushInitCLIOptions } from "./pkg/push/types";

const EXIT_CODES = {
  CONFIG_ERROR: 4,
  FILESYSTEM_ERROR: 3,
  NETWORK_ERROR: 2,
  SUCCESS: 0,
  UNKNOWN_ERROR: 99,
  VALIDATION_ERROR: 1,
} as const;

const program = new Command();

const handleError = (error: unknown): never => {
  logger.error("\n✗ Error:", error instanceof Error ? error.message : String(error));

  let exitCode: number = EXIT_CODES.UNKNOWN_ERROR;
  if (error instanceof ConfigError) exitCode = EXIT_CODES.CONFIG_ERROR;
  else if (error instanceof ValidationError) exitCode = EXIT_CODES.VALIDATION_ERROR;
  else if (error instanceof NetworkError) exitCode = EXIT_CODES.NETWORK_ERROR;
  else if (error instanceof FileSystemError) exitCode = EXIT_CODES.FILESYSTEM_ERROR;

  process.exit(exitCode);
};

program.name("baedal");

program
  .command("pull", { isDefault: true })
  .description("Download files/folders from Git repositories")
  .argument("<source>", "Repository source (user/repo or URL)")
  .argument("[destination]", "Destination directory", ".")
  .option("-e, --exclude <patterns...>", "Exclude files matching patterns (can specify multiple)")
  .option(
    "-t, --token <token>",
    "Authentication token for private repositories (GitHub Personal Access Token)"
  )
  .option("-f, --force", "Force overwrite without confirmation")
  .option("-m, --modified-only", "Only update files that exist locally and have changed")
  .option("-n, --no-clobber", "Abort if any file would be overwritten")
  .option("-s, --skip-existing", "Skip existing files, only add new files")
  .action(async (source: string, destination: string, cliOptions: PullCLIOptions) => {
    try {
      const baedalOptions = adaptCLIOptions(cliOptions);

      const result = await baedal(source, destination, baedalOptions);

      logger.success(`\n✓ Downloaded ${result.files.length} file(s) to ${result.path}`);
      if (cliOptions.exclude?.length) {
        logger.log(`Excluded patterns: ${cliOptions.exclude.join(", ")}`);
      }
      if (cliOptions.skipExisting) {
        logger.log(`Skipped existing files`);
      }
    } catch (error) {
      handleError(error);
    }
  });

program
  .command("push <sync-name>")
  .description("Sync files to multiple repositories and create PRs")
  .action(async (syncName: string) => {
    try {
      logger.log(`Loading configuration for '${syncName}'...`);
      const config = loadPushConfig(syncName);

      const result = await executePush(config, syncName);

      if (result.failureCount > 0) {
        process.exit(1);
      }
    } catch (error) {
      handleError(error);
    }
  });

// Push init command: create configuration template
program
  .command("push:init <sync-name>")
  .description("Create a new push configuration file")
  .option("-f, --force", "Overwrite existing configuration file")
  .action(async (syncName: string, options: PushInitCLIOptions) => {
    try {
      const configPath = initPushConfig(syncName, undefined, options.force);
      printInitSuccess(configPath, syncName);
    } catch (error) {
      handleError(error);
    }
  });

export { program };

if (process.env.NODE_ENV !== "test") {
  program.parse();
}
