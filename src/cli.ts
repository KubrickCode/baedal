import { Command } from "commander";
import pc from "picocolors";
import { baedal } from "./core/baedal.js";
import type { BaedalOptions } from "./types/index.js";
import { detectProvider } from "./core/providers/detector.js";

const program = new Command();

program
  .name("baedal")
  .description("Download files/folders from Git repositories")
  .argument("<source>", "Repository source (user/repo or URL)")
  .argument("[destination]", "Destination directory", ".")
  .option(
    "-e, --exclude <patterns...>",
    "Exclude files matching patterns (can specify multiple)"
  )
  .option(
    "-t, --token <token>",
    "Authentication token for private repositories (GitHub: Personal Access Token, GitLab: Private Token, Bitbucket: App Password)"
  )
  .action(
    async (source: string, destination: string, options: BaedalOptions) => {
      try {
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

        const result = await baedal(source, destination, {
          ...options,
          ...(token && { token }),
        });

        console.log(
          pc.green(`Downloaded ${result.files.length} files to ${result.path}`)
        );
        if (options.exclude && options.exclude.length > 0) {
          console.log(
            pc.gray(`Excluded patterns: ${options.exclude.join(", ")}`)
          );
        }
      } catch (error) {
        console.error(
          pc.red("Error:"),
          error instanceof Error ? error.message : String(error)
        );
        process.exit(1);
      }
    }
  );

program.parse();
