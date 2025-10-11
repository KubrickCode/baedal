import { Command } from "commander";
import pc from "picocolors";
import { baedal } from "./core/baedal.js";
import type { BaedalOptions } from "./types/index.js";

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
  .action(async (source: string, destination: string, options: BaedalOptions) => {
    try {
      const result = await baedal(source, destination, options);
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
  });

program.parse();
