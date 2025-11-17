import { Command } from "commander";
import pc from "picocolors";
import { adaptCLIOptions } from "./cli/adapter.js";
import type { DownloadCLIOptions } from "./cli/types.js";
import { baedal } from "./core/baedal.js";
import { executePush, initPushConfig, loadPushConfig, printInitSuccess } from "./push/index.js";
import type { PushInitCLIOptions } from "./push/types.js";

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
  .action(async (source: string, destination: string, cliOptions: DownloadCLIOptions) => {
    try {
      const baedalOptions = adaptCLIOptions(cliOptions);

      const result = await baedal(source, destination, baedalOptions);

      console.log(pc.green(`\n✓ Downloaded ${result.files.length} file(s) to ${result.path}`));
      if (cliOptions.exclude?.length) {
        console.log(pc.gray(`Excluded patterns: ${cliOptions.exclude.join(", ")}`));
      }
      if (cliOptions.skipExisting) {
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
