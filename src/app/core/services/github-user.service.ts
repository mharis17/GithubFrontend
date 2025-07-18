import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GitHubUser {
  _id: string;
  github_id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
  html_url: string;
  bio: string;
  location: string;
  company: string;
  blog: string;
  twitter_username: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubUserResponse {
  success: boolean;
  message: string;
  data: {
    githubUsers: GitHubUser[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SyncResponse {
  success: boolean;
  message: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class GitHubUserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getGitHubUsers(page: number = 1, limit: number = 10): Observable<GitHubUserResponse> {
    return this.http.get<GitHubUserResponse>(`${this.apiUrl}/github-users?page=${page}&limit=${limit}`);
  }

  syncGitHubUsers(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/github-users/sync`, {});
  }
} 