import { join, relative } from "node:path";
import { partition } from "es-toolkit";
import { isEmpty } from "es-toolkit/compat";
import { ConfigError, logger, ValidationError } from "../../internal/core/index";
import { collectFiles } from "./files";
import { createGitHubClient } from "./github";
import type {
  CategorizedResults,
  ProcessRepositoryOptions,
  PushConfig,
  PushExecutionResult,
  PushResult,
} from "./types";

const BRANCH_PREFIX = "sync";
const SUMMARY_SEPARATOR_LENGTH = 60;

const generateBranchName = (syncName: string): string => {
  const timestamp = Date.now();
  const sanitized = syncName.replace(/[^a-zA-Z0-9-]/g, "-");
  return `${BRANCH_PREFIX}/${sanitized}-${timestamp}`;
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

export const validatePushConfig = (config: PushConfig): void => {
  if (isEmpty(config.token?.trim())) {
    throw new ConfigError(
      "GitHub token is required. Specify 'token' in config file.",
      "token",
      undefined
    );
  }
};

export const prepareRepositories = (
  config: PushConfig,
  branchName: string,
  syncName: string
): ProcessRepositoryOptions[] => {
  return config.syncs.flatMap((sync) =>
    sync.repos.map((repo) => ({
      branchName,
      destPath: sync.dest,
      repoName: repo,
      sourcePath: sync.source,
      syncName,
      token: config.token,
    }))
  );
};

const executeParallelPush = async (repos: ProcessRepositoryOptions[]): Promise<PushResult[]> => {
  const promises = repos.map((repo) => processRepository(repo));
  return await Promise.all(promises);
};

export const categorizeResults = (results: PushResult[]): CategorizedResults => {
  const [successful, failed] = partition(results, (result) => result.success);
  return { failed, successful };
};

const generateSummaryReport = (results: PushResult[], categorized: CategorizedResults): void => {
  const { failed, successful } = categorized;

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
};

export const executePush = async (
  config: PushConfig,
  syncName: string
): Promise<PushExecutionResult> => {
  const branchName = generateBranchName(syncName);

  logger.log(`\nExecuting push: ${syncName}`);
  logger.log(`Branch: ${branchName}\n`);

  validatePushConfig(config);

  const repos = prepareRepositories(config, branchName, syncName);
  const results = await executeParallelPush(repos);
  const categorized = categorizeResults(results);

  generateSummaryReport(results, categorized);

  return {
    failureCount: categorized.failed.length,
    results,
    successCount: categorized.successful.length,
    totalCount: results.length,
  };
};
