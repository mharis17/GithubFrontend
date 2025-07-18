import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CollectionListResponse {
  data: string[];
}

export interface CollectionDataResponse {
  success: boolean;
  message: string;
  data: {
    fields: string[];
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    fieldTypes?: { [key: string]: string };
  };
}

@Injectable({ providedIn: 'root' })
export class CollectionsService {
  private baseUrl = `${environment.apiUrl}/collections`;

  constructor(private http: HttpClient) {}

  getCollections(): Observable<CollectionListResponse> {
    return this.http.get<CollectionListResponse>(this.baseUrl);
  }

  getCollectionData(
    collection: string,
    params: {
      page?: number;
      limit?: number;
      sortField?: string;
      sortOrder?: string;
      search?: string;
      [key: string]: any;
    } = {}
  ): Observable<CollectionDataResponse> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, value);
      }
    });
    return this.http.get<CollectionDataResponse>(`${this.baseUrl}/${collection}`, { params: httpParams });
  }
} 