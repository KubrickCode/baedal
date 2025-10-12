import { Command } from "commander";
import pc from "picocolors";
import { baedal } from "./core/baedal.js";
import { detectProvider } from "./core/providers/detector.js";
import type { BaedalOptions } from "./types/index.js";

const program = new Command();

program
  .name("baedal")
  .description("Download files/folders from Git repositories")
  .argument("<source>", "Repository source (user/repo or URL)")
  .argument("[destination]", "Destination directory", ".")
  .option(
    "-e, --exclude <patterns...>",
    "Exclude files matching patterns (can specify multiple)",
  )
  .option(
    "-t, --token <token>",
    "Authentication token for private repositories (GitHub: Personal Access Token, GitLab: Private Token, Bitbucket: App Password)",
  )
  .option("-f, --force", "Force overwrite without confirmation")
  .option("-s, --skip-existing", "Skip existing files, only add new files")
  .option("-n, --no-clobber", "Abort if any file would be overwritten")
  .action(
    async (source: string, destination: string, options: BaedalOptions) => {
      try {
        // Validate conflicting options
        const conflictingOptions = [
          options.force,
          options.skipExisting,
          options.noClobber,
        ].filter(Boolean);

        if (conflictingOptions.length > 1) {
          throw new Error(
            "Cannot use --force, --skip-existing, and --no-clobber together",
          );
        }

        // Resolve token based on provider
        let token = options.token || process.env.BAEDAL_TOKEN;
        if (!token) {
          const provider = detectProvider(source);
          switch (provider) {
            case "gitlab":
              token = process.env.GITLAB_TOKEN;
              break;
            case "bitbucket":
              token = process.env.BITBUCKET_TOKEN;
              break;
            default:
              token = process.env.GITHUB_TOKEN;
              break;
          }
        }

        const baedalOptions: BaedalOptions = {
          ...options,
          ...(token && { token }),
        };

        const result = await baedal(source, destination, baedalOptions);

        console.log(
          pc.green(
            `\n✓ Downloaded ${result.files.length} file(s) to ${result.path}`,
          ),
        );
        if (options.exclude && options.exclude.length > 0) {
          console.log(
            pc.gray(`Excluded patterns: ${options.exclude.join(", ")}`),
          );
        }
        if (options.skipExisting) {
          console.log(pc.gray(`Skipped existing files`));
        }
      } catch (error) {
        console.error(
          pc.red("\n✗ Error:"),
          error instanceof Error ? error.message : String(error),
        );
        process.exit(1);
      }
    },
  );

program.parse();
