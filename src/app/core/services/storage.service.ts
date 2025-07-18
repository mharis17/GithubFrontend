import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'github_integration_app_';

  /**
   * Set item in localStorage
   */
  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  /**
   * Get item from localStorage
   */
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  /**
   * Clear all app data from localStorage
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Check if item exists in localStorage
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(this.PREFIX + key) !== null;
  }

  /**
   * Get all keys with app prefix
   */
  getKeys(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.PREFIX))
      .map(key => key.replace(this.PREFIX, ''));
  }

  /**
   * Set user preferences
   */
  setUserPreferences(preferences: any): void {
    this.setItem('user_preferences', preferences);
  }

  /**
   * Get user preferences
   */
  getUserPreferences(): any {
    return this.getItem('user_preferences') || {};
  }

  /**
   * Set data viewer settings
   */
  setDataViewerSettings(settings: any): void {
    this.setItem('data_viewer_settings', settings);
  }

  /**
   * Get data viewer settings
   */
  getDataViewerSettings(): any {
    return this.getItem('data_viewer_settings') || {
      pageSize: 25,
      defaultSort: 'created_at',
      defaultSortOrder: 'desc',
      showFilters: true,
      showSearch: true
    };
  }

  /**
   * Set dashboard settings
   */
  setDashboardSettings(settings: any): void {
    this.setItem('dashboard_settings', settings);
  }

  /**
   * Get dashboard settings
   */
  getDashboardSettings(): any {
    return this.getItem('dashboard_settings') || {
      showIntegrationOverview: true,
      showDataOverview: true,
      refreshInterval: 30000
    };
  }

  /**
   * Set recent searches
   */
  setRecentSearches(searches: string[]): void {
    this.setItem('recent_searches', searches.slice(0, 10)); // Keep only last 10
  }

  /**
   * Get recent searches
   */
  getRecentSearches(): string[] {
    return this.getItem('recent_searches') || [];
  }

  /**
   * Add search to recent searches
   */
  addRecentSearch(search: string): void {
    const searches = this.getRecentSearches();
    const filtered = searches.filter(s => s !== search);
    filtered.unshift(search);
    this.setRecentSearches(filtered);
  }

  /**
   * Set collection preferences
   */
  setCollectionPreferences(collection: string, preferences: any): void {
    const allPreferences = this.getItem<Record<string, any>>('collection_preferences') || {};
    allPreferences[collection] = preferences;
    this.setItem('collection_preferences', allPreferences);
  }

  /**
   * Get collection preferences
   */
  getCollectionPreferences(collection: string): any {
    const allPreferences = this.getItem<Record<string, any>>('collection_preferences') || {};
    return allPreferences[collection] || {};
  }

  /**
   * Set grid column configuration
   */
  setGridColumns(collection: string, columns: any[]): void {
    const allColumns = this.getItem<Record<string, any[]>>('grid_columns') || {};
    allColumns[collection] = columns;
    this.setItem('grid_columns', allColumns);
  }

  /**
   * Get grid column configuration
   */
  getGridColumns(collection: string): any[] {
    const allColumns = this.getItem<Record<string, any[]>>('grid_columns') || {};
    return allColumns[collection] || [];
  }
} 