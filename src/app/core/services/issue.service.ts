import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Issue {
  _id: string;
  github_id: number;
  number: number;
  title: string;
  body: string;
  state: string;
  user: {
    login: string;
    avatar_url: string;
  };
  repository_name: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  labels?: string[];
  assignees?: string[];
}

export interface IssueSyncStatus {
  repository_id: string;
  repository_name: string;
  full_name: string;
  has_issues: boolean;
  issue_count: number;
  needs_sync: boolean;
}

export interface IssueResponse {
  success: boolean;
  message: string;
  data: {
    issues: Issue[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SyncStatusResponse {
  success: boolean;
  message: string;
  data: {
    syncStatus: IssueSyncStatus[];
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
export class IssueService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getIssues(page: number = 1, limit: number = 10): Observable<IssueResponse> {
    return this.http.get<IssueResponse>(`${this.apiUrl}/issues?page=${page}&limit=${limit}`);
  }

  getSyncStatus(): Observable<SyncStatusResponse> {
    return this.http.get<SyncStatusResponse>(`${this.apiUrl}/issues/sync-status`);
  }

  syncIssues(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/issues/sync`, {});
  }

  syncIssuesForRepo(repositoryId: string): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/issues/sync/${repositoryId}`, {});
  }
} 