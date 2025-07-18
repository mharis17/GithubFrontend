/**
 * API Response interface for all backend responses
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Search parameters for data queries
 */
export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, string>;
}

/**
 * Collection information
 */
export interface CollectionInfo {
  name: string;
  displayName: string;
  description?: string;
  count: number;
  fields: FieldInfo[];
  lastUpdated?: string;
  schema?: Record<string, any>;
}

/**
 * Field information for collections
 */
export interface FieldInfo {
  name: string;
  type: string;
  displayName?: string;
  description?: string;
  required?: boolean;
  unique?: boolean;
  indexed?: boolean;
  options?: string[];
}

/**
 * Data collection with pagination
 */
export interface DataCollection {
  data: any[];
  pagination: PaginationInfo;
  total: number;
  collection: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

 