import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import pc from "picocolors";
import type { BaedalOptions, DownloadResult } from "../types/index.js";
import { checkExistingFiles } from "../utils/check-existing.js";
import { downloadTarball } from "../utils/download.js";
import { extractTarball, getFileListFromTarball } from "../utils/extract.js";
import { parseSource } from "../utils/parser.js";
import { confirmOverwrite } from "../utils/prompt.js";

export const baedal = async (
  source: string,
  destination: string | BaedalOptions = ".",
  options?: BaedalOptions
): Promise<DownloadResult> => {
  const destPath = typeof destination === "string" ? destination : ".";
  const opts = typeof destination === "string" ? options : destination;

  const { owner, provider, repo, subdir } = await parseSource(source, opts?.token);
  const outputPath = resolve(destPath);

  await mkdir(outputPath, { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), "baedal-"));
  const tarballPath = join(tempDir, "archive.tar.gz");

  try {
    await downloadTarball(owner, repo, tarballPath, provider, subdir, opts?.token);

    const needsSubdirExtraction = !!subdir;

    // Get file list from tarball to check for conflicts
    const fileList = await getFileListFromTarball(
      tarballPath,
      needsSubdirExtraction ? subdir : undefined,
      opts?.exclude
    );

    // Check for existing files
    const { toAdd, toOverwrite } = await checkExistingFiles(fileList, outputPath);

    // Handle different modes
    if (toOverwrite.length > 0) {
      if (opts?.noClobber) {
        throw new Error(
          `Operation aborted as per --no-clobber: ${toOverwrite.length} file(s) already exist.`
        );
      }

      if (opts?.skipExisting) {
        // Only extract new files by adding existing files to exclude list
        const excludePatterns = [...(opts?.exclude || []), ...toOverwrite];

        await extractTarball(
          tarballPath,
          outputPath,
          needsSubdirExtraction ? subdir : undefined,
          excludePatterns
        );

        return {
          files: toAdd,
          path: outputPath,
        };
      }

      // Interactive mode (default when not --force)
      if (!opts?.force) {
        console.log(pc.yellow(`\n⚠️  The following files will be overwritten:`));
        toOverwrite.forEach((file) => {
          console.log(pc.yellow(`  - ${file}`));
        });

        if (toAdd.length > 0) {
          console.log(pc.green(`\n📁 ${toAdd.length} new file(s) will be added:`));
          toAdd.forEach((file) => {
            console.log(pc.green(`  + ${file}`));
          });
        }

        const confirmed = await confirmOverwrite();
        if (!confirmed) {
          throw new Error("Operation cancelled by user");
        }
      }
    }

    // Extract files
    const files = await extractTarball(
      tarballPath,
      outputPath,
      needsSubdirExtraction ? subdir : undefined,
      opts?.exclude
    );

    return {
      files,
      path: outputPath,
    };
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
};
