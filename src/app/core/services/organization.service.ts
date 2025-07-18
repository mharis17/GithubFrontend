import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Organization } from '../models';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private apiService: ApiService) {}

  getOrganizations(page: number = 1, limit: number = 10, search?: string): Observable<any> {
    const params: any = { page, limit };
    if (search) params.search = search;
    
    return this.apiService.get<Organization[]>('/organizations', params);
  }

  getOrganizationById(id: string): Observable<any> {
    return this.apiService.get<Organization>(`/organizations/${id}`);
  }

  getOrganizationByGitHubId(githubId: number): Observable<any> {
    return this.apiService.get<Organization>(`/organizations/github/${githubId}`);
  }

  syncOrganizations(): Observable<any> {
    return this.apiService.post<any>('/organizations/sync', {});
  }
} 