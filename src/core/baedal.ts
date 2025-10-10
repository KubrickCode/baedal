import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import type { DownloadResult } from "../types/index.js";
import { parseSource } from "../utils/parser.js";
import { downloadTarball } from "../utils/download.js";
import { extractTarball } from "../utils/extract.js";

export const baedal = async (
  source: string,
  destination = "."
): Promise<DownloadResult> => {
  const { owner, repo, subdir } = parseSource(source);
  const outputPath = resolve(destination);

  await mkdir(outputPath, { recursive: true });

  const tempDir = await mkdtemp(join(tmpdir(), "baedal-"));
  const tarballPath = join(tempDir, "archive.tar.gz");

  try {
    await downloadTarball(owner, repo, tarballPath);
    const files = await extractTarball(tarballPath, outputPath, subdir);

    return {
      files,
      path: outputPath,
    };
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
};
