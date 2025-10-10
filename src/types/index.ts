export type DownloadResult = {
  files: string[];
  path: string;
};

export type RepoInfo = {
  owner: string;
  repo: string;
  subdir?: string;
};
