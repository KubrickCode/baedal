import { Octokit } from "@octokit/rest";
import type { CollectedFile } from "./types.js";

const DEFAULT_BRANCH = "main";
const DEFAULT_COMMIT_MESSAGE = "chore: sync files via baedal";

export class GitHubClient {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({
      auth: token,
      userAgent: "baedal-push/1.0",
    });
  }

  async createBranch(owner: string, repo: string, branchName: string, baseSha: string): Promise<void> {
    const ref = `refs/heads/${branchName}`;
    await this.octokit.git.createRef({ owner, ref, repo, sha: baseSha });
  }

  async createCommit(owner: string, repo: string, message: string, treeSha: string, parentSha: string): Promise<string> {
    const { data } = await this.octokit.git.createCommit({
      message,
      owner,
      parents: [parentSha],
      repo,
      tree: treeSha,
    });

    return data.sha;
  }

  async createPullRequest(
    owner: string,
    repo: string,
    title: string,
    head: string,
    base: string,
    body?: string
  ): Promise<{ number: number; url: string }> {
    const requestBody: { base: string; body?: string; head: string; owner: string; repo: string; title: string } = {
      base,
      head,
      owner,
      repo,
      title,
    };

    if (body) {
      requestBody.body = body;
    }

    const { data } = await this.octokit.pulls.create(requestBody);

    return {
      number: data.number,
      url: data.html_url,
    };
  }

  async createTree(owner: string, repo: string, baseSha: string, files: CollectedFile[]): Promise<string> {
    const tree = files.map((file) => ({
      content: file.content,
      mode: "100644" as const,
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

  async pushFilesAndCreatePR(
    owner: string,
    repo: string,
    branchName: string,
    files: CollectedFile[],
    prTitle: string,
    prBody?: string,
    baseBranch?: string
  ): Promise<{ number: number; url: string }> {
    const defaultBranch = await this.getDefaultBranch(owner, repo);
    const base = baseBranch || defaultBranch;

    const baseCommitSha = await this.getLatestCommitSha(owner, repo, base);

    await this.createBranch(owner, repo, branchName, baseCommitSha);

    const treeSha = await this.createTree(owner, repo, baseCommitSha, files);

    const commitMessage = prTitle || DEFAULT_COMMIT_MESSAGE;
    const commitSha = await this.createCommit(owner, repo, commitMessage, treeSha, baseCommitSha);

    await this.updateBranchRef(owner, repo, branchName, commitSha);

    return await this.createPullRequest(owner, repo, prTitle, branchName, base, prBody);
  }

  async updateBranchRef(owner: string, repo: string, branch: string, commitSha: string): Promise<void> {
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
