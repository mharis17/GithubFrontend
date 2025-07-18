import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Repository } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  constructor(private apiService: ApiService) {}

  getRepositories(page: number = 1, limit: number = 10, search?: string, organizationId?: string): Observable<any> {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (organizationId) params.organizationId = organizationId;
    
    return this.apiService.get<Repository[]>('/repositories', params);
  }

  getRepositoryById(id: string): Observable<any> {
    return this.apiService.get<Repository>(`/repositories/${id}`);
  }

  getRepositoryByGitHubId(githubId: number): Observable<any> {
    return this.apiService.get<Repository>(`/repositories/github/${githubId}`);
  }

  getRepositoryStats(id: string): Observable<any> {
    return this.apiService.get<any>(`/repositories/${id}/stats`);
  }

  syncRepositories(): Observable<any> {
    return this.apiService.post<any>('/repositories/sync', {});
  }
} 