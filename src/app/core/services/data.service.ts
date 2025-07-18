import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  SearchParams, 
  CollectionInfo, 
  DataCollection 
} from '../models/api.interface';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  constructor(private http: HttpClient) {}

  /**
   * Get available collections
   */
  getCollections(): Observable<ApiResponse<CollectionInfo[]>> {
    return this.http.get<ApiResponse<CollectionInfo[]>>(`${environment.apiUrl}/data/collections`, { 
      withCredentials: true 
    });
  }

  /**
   * Get organizations
   */
  getOrganizations(page: number = 1, limit: number = 10, search: string = ''): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/organizations`, { 
      params,
      withCredentials: true 
    });
  }

  /**
   * Get repositories
   */
  getRepositories(page: number = 1, limit: number = 10, search: string = '', organizationId: string = ''): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) {
      params = params.set('search', search);
    }
    if (organizationId) {
      params = params.set('organization_id', organizationId);
    }

    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/repositories`, { 
      params,
      withCredentials: true 
    });
  }

  /**
   * Get commits
   */
  getCommits(page: number = 1, limit: number = 10, repositoryId: string = '', author: string = ''): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (repositoryId) {
      params = params.set('repository_id', repositoryId);
    }
    if (author) {
      params = params.set('author', author);
    }

    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/commits`, { 
      params,
      withCredentials: true 
    });
  }

  /**
   * Search data in a specific collection
   */
  searchData(
    collection: string, 
    params: SearchParams = {}
  ): Observable<ApiResponse<DataCollection>> {
    let httpParams = new HttpParams();
    
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params.sortOrder) {
      httpParams = httpParams.set('sortOrder', params.sortOrder);
    }
    if (params.filters) {
      Object.keys(params.filters).forEach(key => {
        httpParams = httpParams.set(`filter[${key}]`, params.filters![key]);
      });
    }

    return this.http.get<ApiResponse<DataCollection>>(
      `${environment.apiUrl}/data/search/${collection}`,
      { 
        params: httpParams,
        withCredentials: true 
      }
    );
  }

  /**
   * Get data by ID from a collection
   */
  getDataById(collection: string, id: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/data/${collection}/${id}`, { 
      withCredentials: true 
    });
  }

  /**
   * Create new data in a collection
   */
  createData(collection: string, data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/data/${collection}`, data, { 
      withCredentials: true 
    });
  }

  /**
   * Update data in a collection
   */
  updateData(collection: string, id: string, data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${environment.apiUrl}/data/${collection}/${id}`, data, { 
      withCredentials: true 
    });
  }

  /**
   * Delete data from a collection
   */
  deleteData(collection: string, id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/data/${collection}/${id}`, { 
      withCredentials: true 
    });
  }

  /**
   * Get collection schema/fields
   */
  getCollectionSchema(collection: string): Observable<ApiResponse<CollectionInfo>> {
    return this.http.get<ApiResponse<CollectionInfo>>(`${environment.apiUrl}/data/collections/${collection}`, { 
      withCredentials: true 
    });
  }

  /**
   * Export data from a collection
   */
  exportData(
    collection: string, 
    format: 'csv' | 'json' | 'excel' = 'json',
    params?: SearchParams
  ): Observable<Blob> {
    let httpParams = new HttpParams().set('format', format);
    
    if (params) {
      if (params.search) {
        httpParams = httpParams.set('search', params.search);
      }
      if (params.filters) {
        Object.keys(params.filters).forEach(key => {
          httpParams = httpParams.set(`filter[${key}]`, params.filters![key]);
        });
      }
    }

    return this.http.get(`${environment.apiUrl}/data/export/${collection}`, {
      params: httpParams,
      responseType: 'blob',
      withCredentials: true
    });
  }

  /**
   * Get data statistics for a collection
   */
  getCollectionStats(collection: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${environment.apiUrl}/data/stats/${collection}`, { 
      withCredentials: true 
    });
  }

  /**
   * Get global search results across all collections
   */
  globalSearch(query: string, params: SearchParams = {}): Observable<ApiResponse<any[]>> {
    let httpParams = new HttpParams().set('q', query);
    
    if (params.page) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params.limit) {
      httpParams = httpParams.set('limit', params.limit.toString());
    }

    return this.http.get<ApiResponse<any[]>>(`${environment.apiUrl}/data/global-search`, {
      params: httpParams,
      withCredentials: true
    });
  }

  /**
   * Sync organizations from GitHub
   */
  syncOrganizations(): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/organizations/sync`, {}, { 
      withCredentials: true 
    });
  }

  /**
   * Sync repositories from GitHub
   */
  syncRepositories(organizationId: string = ''): Observable<ApiResponse<any>> {
    const params = organizationId ? new HttpParams().set('organization_id', organizationId) : new HttpParams();
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/repositories/sync`, {}, { 
      params,
      withCredentials: true 
    });
  }

  /**
   * Sync commits from GitHub
   */
  syncCommits(repositoryId: string, since: string = '', until: string = ''): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (since) params = params.set('since', since);
    if (until) params = params.set('until', until);
    
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/commits/sync/${repositoryId}`, {}, { 
      params,
      withCredentials: true 
    });
  }
} 