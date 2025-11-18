import { join, relative } from "node:path";
import { ConfigError, ValidationError } from "../../internal/errors/index.js";
import { logger } from "../../internal/utils/logger.js";
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
    logger.info(`  [${repoName}] Collecting files from ${sourcePath}...`);
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

    logger.info(`  [${repoName}] Pushing ${files.length} files...`);

    const parts = repoName.split("/");
    const owner = parts[0];
    const repo = parts[1];
    if (!owner || !repo || parts.length !== 2) {
      throw new ValidationError(
        `Invalid repository format: ${repoName}. Expected format: owner/repo`,
        "repoName",
        repoName
      );
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

    logger.success(`  [${repoName}] ✓ PR created: ${pr.url}`);

    return {
      prUrl: pr.url,
      repo: repoName,
      success: true,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    logger.error(`  [${repoName}] ✗ Failed: ${message}`);

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

  logger.log(`\nExecuting push: ${syncName}`);
  logger.log(`Branch: ${branchName}\n`);

  if (!config.token || config.token.trim() === "") {
    throw new ConfigError(
      "GitHub token is required. Specify 'token' in config file.",
      "token",
      undefined
    );
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

  logger.log("\n" + "=".repeat(SUMMARY_SEPARATOR_LENGTH));
  logger.log("Summary");
  logger.log("=".repeat(SUMMARY_SEPARATOR_LENGTH));
  logger.log(`Total: ${results.length} repositories`);
  logger.success(`Success: ${successful.length}`);
  logger.error(`Failed: ${failed.length}`);

  if (successful.length > 0) {
    logger.log("\nSuccessful PRs:");
    for (const result of successful) {
      logger.success(`  ✓ ${result.repo}: ${result.prUrl}`);
    }
  }

  if (failed.length > 0) {
    logger.log("\nFailed repositories:");
    for (const result of failed) {
      logger.error(`  ✗ ${result.repo}: ${result.error}`);
    }
  }

  return {
    failureCount: failed.length,
    results,
    successCount: successful.length,
    totalCount: results.length,
  };
};
