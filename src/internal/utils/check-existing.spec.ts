import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkExistingFiles } from "./check-existing";

describe("checkExistingFiles - Integration Test", () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), "baedal-check-test-"));
  });

  afterEach(async () => {
    await rm(testDir, { force: true, recursive: true });
  });

  it("should identify existing and new files", async () => {
    await writeFile(join(testDir, "existing.ts"), "content");
    await writeFile(join(testDir, "another.ts"), "content");

    const result = await checkExistingFiles(
      ["existing.ts", "another.ts", "new.ts", "new2.ts"],
      testDir
    );

    expect(result.toOverwrite.sort()).toEqual(["another.ts", "existing.ts"]);
    expect(result.toAdd.sort()).toEqual(["new.ts", "new2.ts"]);
  });

  it("should handle all files as new when none exist", async () => {
    const result = await checkExistingFiles(["file1.ts", "file2.ts"], testDir);

    expect(result.toOverwrite).toEqual([]);
    expect(result.toAdd.sort()).toEqual(["file1.ts", "file2.ts"].sort());
  });

  it("should handle nested paths", async () => {
    await mkdir(join(testDir, "src/components"), { recursive: true });
    await writeFile(join(testDir, "src/components/Button.tsx"), "code");

    const result = await checkExistingFiles(
      ["src/components/Button.tsx", "src/components/Input.tsx"],
      testDir
    );

    expect(result.toOverwrite).toEqual(["src/components/Button.tsx"]);
    expect(result.toAdd).toEqual(["src/components/Input.tsx"]);
  });

  it("should handle empty file list", async () => {
    const result = await checkExistingFiles([], testDir);

    expect(result.toOverwrite).toEqual([]);
    expect(result.toAdd).toEqual([]);
  });
});
