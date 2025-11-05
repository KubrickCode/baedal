import { Octokit } from "@octokit/rest";
import { GIT_FILE_MODES, type CollectedFile } from "./types.js";

const DEFAULT_BRANCH = "main";

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: "baedal-push/1.0",
    });
  }

  async createBranch(options: {
    baseSha: string;
    branchName: string;
    owner: string;
    repo: string;
  }): Promise<void> {
    const { baseSha, branchName, owner, repo } = options;
    const ref = `refs/heads/${branchName}`;
    await this.octokit.git.createRef({ owner, ref, repo, sha: baseSha });
  }

  async createCommit(options: {
    message: string;
    owner: string;
    parentSha: string;
    repo: string;
    treeSha: string;
  }): Promise<string> {
    const { message, owner, parentSha, repo, treeSha } = options;
    const { data } = await this.octokit.git.createCommit({
      message,
      owner,
      parents: [parentSha],
      repo,
      tree: treeSha,
    });

    return data.sha;
  }

  async createPullRequest(options: {
    base: string;
    body?: string;
    head: string;
    owner: string;
    repo: string;
    title: string;
  }): Promise<{ number: number; url: string }> {
    const { data } = await this.octokit.pulls.create(options);

    return {
      number: data.number,
      url: data.html_url,
    };
  }

  async createTree(options: {
    baseSha: string;
    files: CollectedFile[];
    owner: string;
    repo: string;
  }): Promise<string> {
    const { baseSha, files, owner, repo } = options;
    const tree = files.map((file) => ({
      content: file.content,
      mode: file.mode ?? GIT_FILE_MODES.NORMAL,
      path: file.path,
      type: "blob" as const,
    }));

    const { data } = await this.octokit.git.createTree({
      base_tree: baseSha,
      owner,
      repo,
      tree,
    });

    return data.sha;
  }

  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    const { data } = await this.octokit.repos.get({ owner, repo });
    return data.default_branch || DEFAULT_BRANCH;
  }

  async getLatestCommitSha(owner: string, repo: string, branch: string): Promise<string> {
    const { data } = await this.octokit.repos.getBranch({ branch, owner, repo });
    return data.commit.sha;
  }

  async pushFilesAndCreatePR(options: {
    baseBranch?: string;
    branchName: string;
    files: CollectedFile[];
    owner: string;
    prBody?: string;
    prTitle: string;
    repo: string;
  }): Promise<{ number: number; url: string }> {
    const { baseBranch, branchName, files, owner, prBody, prTitle, repo } = options;
    const defaultBranch = await this.getDefaultBranch(owner, repo);
    const base = baseBranch || defaultBranch;

    const baseCommitSha = await this.getLatestCommitSha(owner, repo, base);

    await this.createBranch({ baseSha: baseCommitSha, branchName, owner, repo });

    const treeSha = await this.createTree({ baseSha: baseCommitSha, files, owner, repo });

    const commitSha = await this.createCommit({
      message: prTitle,
      owner,
      parentSha: baseCommitSha,
      repo,
      treeSha,
    });

    await this.updateBranchRef({ branch: branchName, commitSha, owner, repo });

    return await this.createPullRequest({
      base,
      ...(prBody && { body: prBody }),
      head: branchName,
      owner,
      repo,
      title: prTitle,
    });
  }

  async updateBranchRef(options: {
    branch: string;
    commitSha: string;
    owner: string;
    repo: string;
  }): Promise<void> {
    const { branch, commitSha, owner, repo } = options;
    const ref = `heads/${branch}`;
    await this.octokit.git.updateRef({
      force: false,
      owner,
      ref,
      repo,
      sha: commitSha,
    });
  }
}

export const createGitHubClient = (token: string): GitHubClient => {
  if (!token || token.trim() === "") {
    throw new Error("GitHub token is required");
  }

  return new GitHubClient(token);
};
