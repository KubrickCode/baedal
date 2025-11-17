import { Command } from "commander";
import pc from "picocolors";
import { baedal } from "./core/baedal.js";
import { executePush, initPushConfig, loadPushConfig, printInitSuccess } from "./push/index.js";
import type { PushInitCLIOptions } from "./push/types.js";
import type { BaedalOptions } from "./types/index.js";

const program = new Command();

const handleError = (error: unknown): never => {
  console.error(pc.red("\n✗ Error:"), error instanceof Error ? error.message : String(error));
  process.exit(1);
};

program.name("baedal");

// TODO: default -> pull
program
  .command("download", { isDefault: true })
  .description("Download files/folders from Git repositories")
  .argument("<source>", "Repository source (user/repo or URL)")
  .argument("[destination]", "Destination directory", ".")
  .option("-e, --exclude <patterns...>", "Exclude files matching patterns (can specify multiple)")
  .option(
    "-t, --token <token>",
    "Authentication token for private repositories (GitHub Personal Access Token)"
  )
  .option("-f, --force", "Force overwrite without confirmation")
  .option("-s, --skip-existing", "Skip existing files, only add new files")
  .option("-n, --no-clobber", "Abort if any file would be overwritten")
  .action(async (source: string, destination: string, options: BaedalOptions) => {
    try {
      // Validate conflicting options
      const conflictingOptions = [options.force, options.skipExisting, options.noClobber].filter(
        Boolean
      );

      if (conflictingOptions.length > 1) {
        throw new Error("Cannot use --force, --skip-existing, and --no-clobber together");
      }

      // Resolve token
      const token = options.token ?? process.env.GITHUB_TOKEN ?? process.env.BAEDAL_TOKEN;

      const baedalOptions: BaedalOptions = {
        ...options,
        ...(token && { token }),
      };

      const result = await baedal(source, destination, baedalOptions);

      console.log(pc.green(`\n✓ Downloaded ${result.files.length} file(s) to ${result.path}`));
      if (options.exclude?.length) {
        console.log(pc.gray(`Excluded patterns: ${options.exclude.join(", ")}`));
      }
      if (options.skipExisting) {
        console.log(pc.gray(`Skipped existing files`));
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
      console.log(pc.dim(`Loading configuration for '${syncName}'...`));
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

program.parse();
