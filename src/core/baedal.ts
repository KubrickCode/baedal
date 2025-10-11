import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { BaedalOptions, DownloadResult } from "../types/index.js";
import { parseSource } from "../utils/parser.js";
import { downloadTarball } from "../utils/download.js";
import { extractTarball } from "../utils/extract.js";

export const baedal = async (
  source: string,
  destination: string | BaedalOptions = ".",
  options?: BaedalOptions
): Promise<DownloadResult> => {
  const destPath = typeof destination === "string" ? destination : ".";
  const opts = typeof destination === "string" ? options : destination;

  const { owner, repo, subdir, provider } = await parseSource(
    source,
    opts?.token
  );
  const outputPath = resolve(destPath);

  await mkdir(outputPath, { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), "baedal-"));
  const tarballPath = join(tempDir, "archive.tar.gz");

  try {
    await downloadTarball(
      owner,
      repo,
      tarballPath,
      provider,
      subdir,
      opts?.token
    );

    // For GitLab with subdir, the path parameter already filters at server side,
    // so we don't need to filter again during extraction
    const needsSubdirExtraction = subdir && provider !== "gitlab";
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
