import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PullRequest {
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
  merged_at?: string;
}

export interface PullRequestResponse {
  success: boolean;
  message: string;
  data: {
    pullRequests: PullRequest[];
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
export class PullRequestService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPullRequests(page: number = 1, limit: number = 10): Observable<PullRequestResponse> {
    return this.http.get<PullRequestResponse>(`${this.apiUrl}/pull-requests?page=${page}&limit=${limit}`);
  }

  syncPullRequests(): Observable<SyncResponse> {
    return this.http.post<SyncResponse>(`${this.apiUrl}/pull-requests/sync`, {});
  }
} 