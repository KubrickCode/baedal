import { extract } from "tar";
import { globby } from "globby";
import { basename, join } from "node:path";
import { copyFile, cp, mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

export const extractTarball = async (
  tarballPath: string,
  destination: string,
  subdir?: string
): Promise<string[]> => {
  if (!subdir) {
    await extract({ cwd: destination, file: tarballPath, strip: 1 });
  } else {
    const tempExtract = await mkdtemp(join(tmpdir(), "baedal-extract-"));

    try {
      await extract({ cwd: tempExtract, file: tarballPath, strip: 1 });

      const sourcePath = join(tempExtract, subdir);
      const sourceStats = await stat(sourcePath);

      if (sourceStats.isFile()) {
        await mkdir(destination, { recursive: true });
        await copyFile(sourcePath, join(destination, basename(subdir)));
      } else {
        await cp(sourcePath, destination, { recursive: true });
      }
    } finally {
      await rm(tempExtract, { force: true, recursive: true });
    }
  }

  const files = await globby("**/*", {
    cwd: destination,
    onlyFiles: true,
    dot: true, // Include hidden files like .gitignore
  });
  return files;
};
