import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { FileSystemError, logger, ValidationError } from "../../internal/core/index";
import { extractTarball, getFileListFromTarball, parseSource } from "../../internal/domain/index";
import { confirmOverwrite, downloadStream } from "../../internal/infra/index";
import { checkExistingFiles, parseWithZod } from "../../internal/utils/index";
import { getArchiveUrl, getDefaultBranch } from "./archive";
import type { BaedalOptions, PullResult } from "./types";
import { BaedalOptionsSchema } from "./types";

export { getArchiveUrl, getDefaultBranch } from "./archive";
export { getGitHubDefaultBranch } from "./github";
export type * from "./types";

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

  if (!source || source.trim() === "") {
    throw new ValidationError(
      "Source cannot be empty.\nTry: user/repo\nOr:  github:user/repo\nOr:  https://github.com/user/repo"
    );
  }

  if (!destPath || destPath.trim() === "") {
    throw new ValidationError("Destination cannot be empty. Try: . or ./my-folder");
  }

  if (opts) {
    parseWithZod(BaedalOptionsSchema, opts, "options");
  }

  const { owner, provider, repo, subdir } = await parseSource(source);
  const outputPath = resolve(destPath);

  await mkdir(outputPath, { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), "baedal-"));
  const tarballPath = join(tempDir, "archive.tar.gz");

  try {
    const branch = await getDefaultBranch(owner, repo, provider, opts?.token);
    const url = getArchiveUrl({
      branch,
      owner,
      provider,
      repo,
      ...(subdir && { subdir }),
    });
    await downloadStream(url, tarballPath, opts?.token);

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
