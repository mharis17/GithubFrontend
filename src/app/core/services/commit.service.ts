import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Commit } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CommitService {
  constructor(private apiService: ApiService) {}

  getCommits(page: number = 1, limit: number = 10, repositoryId?: string, author?: string): Observable<any> {
    const params: any = { page, limit };
    if (repositoryId) params.repositoryId = repositoryId;
    if (author) params.author = author;
    
    return this.apiService.get<Commit[]>('/commits', params);
  }

  getCommitById(id: string): Observable<any> {
    return this.apiService.get<Commit>(`/commits/${id}`);
  }

  getCommitBySha(sha: string): Observable<any> {
    return this.apiService.get<Commit>(`/commits/sha/${sha}`);
  }

  getCommitStats(repositoryId: string): Observable<any> {
    return this.apiService.get<any>(`/commits/stats/${repositoryId}`);
  }

  syncCommits(repositoryId: string): Observable<any> {
    return this.apiService.post<any>(`/commits/sync/${repositoryId}`, {});
  }
} 