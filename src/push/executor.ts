import picocolors from "picocolors";
import { collectFiles } from "./files.js";
import { createGitHubClient } from "./github.js";
import type { PushConfig, PushExecutionResult, PushResult } from "./types.js";

const BRANCH_PREFIX = "sync";

const generateBranchName = (syncName: string): string => {
  const timestamp = Date.now();
  const sanitized = syncName.replace(/[^a-zA-Z0-9-]/g, "-");
  return `${BRANCH_PREFIX}/${sanitized}-${timestamp}`;
};

const processRepository = async (
  repoName: string,
  sourcePath: string,
  destPath: string,
  branchName: string,
  token: string,
  syncName: string
): Promise<PushResult> => {
  try {
    console.log(picocolors.cyan(`  [${repoName}] Collecting files from ${sourcePath}...`));
    const files = await collectFiles(sourcePath);

    if (files.length === 0) {
      return {
        error: "No files to commit",
        repo: repoName,
        success: false,
      };
    }

    if (destPath !== sourcePath) {
      files.forEach((file) => {
        file.path = file.path.replace(sourcePath, destPath);
      });
    }

    console.log(picocolors.cyan(`  [${repoName}] Pushing ${files.length} files...`));

    const [owner, repo] = repoName.split("/");
    if (!owner || !repo) {
      throw new Error(`Invalid repository format: ${repoName}. Expected format: owner/repo`);
    }

    const client = createGitHubClient(token);
    const prTitle = `chore: sync files from ${syncName}`;
    const prBody = `Automated file sync via baedal push\n\nSync: ${syncName}`;
    const pr = await client.pushFilesAndCreatePR(owner, repo, branchName, files, prTitle, prBody);

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

  const results: PushResult[] = [];

  for (const sync of config.syncs) {
    for (const repo of sync.repos) {
      const result = await processRepository(
        repo,
        sync.source,
        sync.dest,
        branchName,
        config.token,
        syncName
      );

      results.push(result);
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log(picocolors.bold("\n" + "=".repeat(60)));
  console.log(picocolors.bold("Summary"));
  console.log("=".repeat(60));
  console.log(`Total: ${results.length} repositories`);
  console.log(picocolors.green(`Success: ${successCount}`));
  console.log(picocolors.red(`Failed: ${failureCount}`));

  if (successCount > 0) {
    console.log(picocolors.bold("\nSuccessful PRs:"));
    results
      .filter((r) => r.success)
      .forEach((r) => {
        console.log(picocolors.green(`  ✓ ${r.repo}: ${r.prUrl}`));
      });
  }

  if (failureCount > 0) {
    console.log(picocolors.bold("\nFailed repositories:"));
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(picocolors.red(`  ✗ ${r.repo}: ${r.error}`));
      });
  }

  return {
    failureCount,
    results,
    successCount,
    totalCount: results.length,
  };
};
