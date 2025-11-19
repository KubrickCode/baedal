import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { FileSystemError, ValidationError } from "../../internal/errors/index.js";
import type { BaedalOptions, PullResult } from "../../internal/types/index.js";
import { checkExistingFiles } from "../../internal/utils/check-existing.js";
import { downloadTarball } from "../../internal/utils/download.js";
import { extractTarball, getFileListFromTarball } from "../../internal/utils/extract.js";
import { logger } from "../../internal/utils/logger.js";
import { parseSource } from "../../internal/utils/parser.js";
import { confirmOverwrite } from "../../internal/utils/prompt.js";

const DEFAULT_CONFLICT_MODE = "interactive";

type HandleSkipExistingModeParams = {
  excludePatterns: string[];
  outputPath: string;
  subdir: string | undefined;
  tarballPath: string;
  toAdd: string[];
  toOverwrite: string[];
};

type HandleInteractiveModeParams = {
  toAdd: string[];
  toOverwrite: string[];
};

export const baedal = async (
  source: string,
  destination: string | BaedalOptions = ".",
  options?: BaedalOptions
): Promise<PullResult> => {
  const destPath = typeof destination === "string" ? destination : ".";
  const opts = typeof destination === "string" ? options : destination;

  const { owner, provider, repo, subdir } = await parseSource(source);
  const outputPath = resolve(destPath);

  await mkdir(outputPath, { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), "baedal-"));
  const tarballPath = join(tempDir, "archive.tar.gz");

  try {
    await downloadTarball(owner, repo, tarballPath, provider, subdir, opts?.token);

    const needsSubdirExtraction = !!subdir;

    const fileList = await getFileListFromTarball(
      tarballPath,
      needsSubdirExtraction ? subdir : undefined,
      opts?.exclude
    );

    const { toAdd, toOverwrite } = await checkExistingFiles(fileList, outputPath);

    const resolvedMode = opts?.conflictMode?.mode ?? DEFAULT_CONFLICT_MODE;

    if (resolvedMode === "no-clobber" && toOverwrite.length > 0) {
      handleNoClobberMode(toOverwrite);
    }

    if (resolvedMode === "skip-existing" && toOverwrite.length > 0) {
      return await handleSkipExistingMode({
        excludePatterns: opts?.exclude ?? [],
        outputPath,
        subdir: needsSubdirExtraction ? subdir : undefined,
        tarballPath,
        toAdd,
        toOverwrite,
      });
    }

    if (resolvedMode === "interactive" && toOverwrite.length > 0) {
      await handleInteractiveMode({ toAdd, toOverwrite });
    }

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

const handleNoClobberMode = (toOverwrite: string[]): void => {
  throw new FileSystemError(
    `Operation aborted as per --no-clobber: ${toOverwrite.length} file(s) already exist.`
  );
};

const handleSkipExistingMode = async (
  params: HandleSkipExistingModeParams
): Promise<PullResult> => {
  const { excludePatterns, outputPath, subdir, tarballPath, toAdd, toOverwrite } = params;
  const mergedExcludePatterns = [...excludePatterns, ...toOverwrite];

  await extractTarball(tarballPath, outputPath, subdir, mergedExcludePatterns);

  return {
    files: toAdd,
    path: outputPath,
  };
};

const handleInteractiveMode = async (params: HandleInteractiveModeParams): Promise<void> => {
  const { toAdd, toOverwrite } = params;

  logger.warn(`\n⚠️  The following files will be overwritten:`);
  toOverwrite.forEach((file) => {
    logger.warn(`  - ${file}`);
  });

  if (toAdd.length > 0) {
    logger.success(`\n📁 ${toAdd.length} new file(s) will be added:`);
    toAdd.forEach((file) => {
      logger.success(`  + ${file}`);
    });
  }

  const confirmed = await confirmOverwrite();
  if (!confirmed) {
    throw new ValidationError("Operation cancelled by user");
  }
};
