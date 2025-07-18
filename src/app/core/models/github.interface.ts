export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  email: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubOrganization {
  id: number;
  login: string;
  avatar_url: string;
  name: string;
  description: string;
  public_repos: number;
  private_repos: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  fork: boolean;
  language: string;
  stargazers_count: number;
  watchers_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: GitHubUser;
}

export interface GitHubCommit {
  id: string;
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
  repository: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  user: GitHubUser;
  repository: string;
  labels: string[];
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  user: GitHubUser;
  repository: string;
  labels: string[];
}

export interface GitHubIntegration {
  id: string;
  userId: number;
  accessToken: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  user: GitHubUser;
  organizations: GitHubOrganization[];
  repositories: GitHubRepository[];
  commits: GitHubCommit[];
  issues: GitHubIssue[];
  pullRequests: GitHubPullRequest[];
  scope: string;
  createdAt: string;
  updatedAt: string;
  lastSyncAt?: string;
  status: 'active' | 'expired' | 'revoked';
} 