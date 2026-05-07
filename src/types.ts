export interface PullRequest {
  id: number;
  number: number;
  title: string;
  user: { login: string };
  created_at: string;
  html_url: string;
}

export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  html_url: string;
  // branch is enriched client-side from the /api/commits response header if available
}

export interface Branch {
  name: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  user: { login: string };
  created_at: string;
  html_url: string;
  labels: { name: string; color: string }[];
}

export interface SectionState<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
}

export interface RepoInfo {
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  language: string | null;
  description: string | null;
  default_branch: string;
}
