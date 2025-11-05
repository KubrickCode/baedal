import { join, relative } from "node:path";
import picocolors from "picocolors";
import { collectFiles } from "./files.js";
import { createGitHubClient } from "./github.js";
import type { PushConfig, PushExecutionResult, PushResult } from "./types.js";

const BRANCH_PREFIX = "sync";
const SUMMARY_SEPARATOR_LENGTH = 60;

const generateBranchName = (syncName: string): string => {
  const timestamp = Date.now();
  const sanitized = syncName.replace(/[^a-zA-Z0-9-]/g, "-");
  return `${BRANCH_PREFIX}/${sanitized}-${timestamp}`;
};

type ProcessRepositoryOptions = {
  branchName: string;
  destPath: string;
  repoName: string;
  sourcePath: string;
  syncName: string;
  token: string;
};

const processRepository = async (options: ProcessRepositoryOptions): Promise<PushResult> => {
  const { branchName, destPath, repoName, sourcePath, syncName, token } = options;
  try {
    console.log(picocolors.cyan(`  [${repoName}] Collecting files from ${sourcePath}...`));
    let files = await collectFiles(sourcePath);

    if (files.length === 0) {
      return {
        error: "No files to commit",
        repo: repoName,
        success: false,
      };
    }

    if (destPath !== sourcePath) {
      files = files.map((file) => {
        const relativePath = relative(sourcePath, file.path);
        return {
          ...file,
          path: join(destPath, relativePath).replace(/\\/g, "/"),
        };
      });
    }

    console.log(picocolors.cyan(`  [${repoName}] Pushing ${files.length} files...`));

    const parts = repoName.split("/");
    const owner = parts[0];
    const repo = parts[1];
    if (!owner || !repo || parts.length !== 2) {
      throw new Error(`Invalid repository format: ${repoName}. Expected format: owner/repo`);
    }

    const client = createGitHubClient(token);
    const prTitle = `chore: sync files from ${syncName}`;
    const prBody = `Automated file sync via baedal push\n\nSync: ${syncName}`;
    const pr = await client.pushFilesAndCreatePR({
      branchName,
      files,
      owner,
      prBody,
      prTitle,
      repo,
    });

    console.log(picocolors.green(`  [${repoName}] ✓ PR created: ${pr.url}`));

    return {
      prUrl: pr.url,
      repo: repoName,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.log(picocolors.red(`  [${repoName}] ✗ Failed: ${message}`));

    return {
      error: message,
      repo: repoName,
      success: false,
    };
  }
};

export const executePush = async (
  config: PushConfig,
  syncName: string
): Promise<PushExecutionResult> => {
  const branchName = generateBranchName(syncName);

  console.log(picocolors.bold(`\nExecuting push: ${syncName}`));
  console.log(picocolors.dim(`Branch: ${branchName}\n`));

  if (!config.token) {
    throw new Error("GitHub token is required. Specify 'token' in config file.");
  }

  const promises = config.syncs.flatMap((sync) =>
    sync.repos.map((repo) =>
      processRepository({
        branchName,
        destPath: sync.dest,
        repoName: repo,
        sourcePath: sync.source,
        syncName,
        token: config.token,
      })
    )
  );

  const results = await Promise.all(promises);

  const successful: PushResult[] = [];
  const failed: PushResult[] = [];

  for (const result of results) {
    if (result.success) {
      successful.push(result);
    } else {
      failed.push(result);
    }
  }

  console.log(picocolors.bold("\n" + "=".repeat(SUMMARY_SEPARATOR_LENGTH)));
  console.log(picocolors.bold("Summary"));
  console.log("=".repeat(SUMMARY_SEPARATOR_LENGTH));
  console.log(`Total: ${results.length} repositories`);
  console.log(picocolors.green(`Success: ${successful.length}`));
  console.log(picocolors.red(`Failed: ${failed.length}`));

  if (successful.length > 0) {
    console.log(picocolors.bold("\nSuccessful PRs:"));
    for (const result of successful) {
      console.log(picocolors.green(`  ✓ ${result.repo}: ${result.prUrl}`));
    }
  }

  if (failed.length > 0) {
    console.log(picocolors.bold("\nFailed repositories:"));
    for (const result of failed) {
      console.log(picocolors.red(`  ✗ ${result.repo}: ${result.error}`));
    }
  }

  return {
    failureCount: failed.length,
    results,
    successCount: successful.length,
    totalCount: results.length,
  };
};
