import { extract } from "tar";
import { globby } from "globby";
import { basename, join } from "node:path";
import { copyFile, cp, mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import micromatch from "micromatch";

export const extractTarball = async (
  tarballPath: string,
  destination: string,
  subdir?: string,
  exclude?: string[]
): Promise<string[]> => {
  const shouldExclude =
    exclude && exclude.length > 0
      ? (path: string) => micromatch.isMatch(path, exclude)
      : null;

  const extractOptions = {
    cwd: destination,
    file: tarballPath,
    strip: 1,
    ...(shouldExclude
      ? {
          filter: (path: string) => {
            // Strip the first path segment since tar strip:1 is applied
            const strippedPath = path.split("/").slice(1).join("/");
            return !shouldExclude(strippedPath);
          },
        }
      : {}),
  };

  if (!subdir) {
    await extract(extractOptions);
  } else {
    const tempExtract = await mkdtemp(join(tmpdir(), "baedal-extract-"));

    try {
      await extract({
        ...extractOptions,
        cwd: tempExtract,
      });

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
