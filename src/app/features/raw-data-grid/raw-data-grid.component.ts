import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CollectionsService, CollectionDataResponse } from '../../core/services/collections.service';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, IServerSideGetRowsParams } from 'ag-grid-community';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import 'ag-grid-enterprise';
import { MatSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-raw-data-grid',
  standalone: true,
  imports: [CommonModule, AgGridModule, FormsModule, MatCardModule, MatDividerModule, MatSpinner, MatIcon, MatFormFieldModule, MatSelectModule, MatInputModule],
  template: `
    <div class="raw-data-grid-bg">
      <mat-card class="data-card">
        <div class="card-header">
          <mat-icon class="header-icon">table_view</mat-icon>
          <span class="header-title">{{ selectedCollection | titlecase }} Data</span>
        </div>
        <mat-divider></mat-divider>
        <div class="toolbar">
          <mat-form-field appearance="outline" class="toolbar-field">
            <mat-label>Active Integrations</mat-label>
            <input matInput [value]="activeIntegration" disabled />
          </mat-form-field>
          <mat-form-field appearance="outline" class="toolbar-field">
            <mat-label>Entity</mat-label>
            <mat-select [(ngModel)]="selectedCollection" (selectionChange)="onCollectionChange()">
              <mat-option *ngFor="let col of collections" [value]="col">{{ col }}</mat-option>
            </mat-select>
          </mat-form-field>
          <div class="field-search-group">
            <mat-form-field appearance="outline" class="toolbar-field">
              <mat-label>Processed Entity</mat-label>
              <mat-select [(ngModel)]="selectedField">
                <mat-option *ngFor="let field of allFields" [value]="field">{{ field }}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="toolbar-field">
              <mat-label>Field Search</mat-label>
              <input matInput [(ngModel)]="fieldSearch" placeholder="Search selected field..." />
            </mat-form-field>
            <button mat-stroked-button color="primary" (click)="applyFieldSearch()" [disabled]="!selectedField || !fieldSearch">
              <mat-icon>search</mat-icon>
              Search
            </button>
            <button mat-icon-button color="warn" (click)="clearFieldSearch()" [disabled]="!fieldSearch" matTooltip="Clear Filters">
              <mat-icon>clear</mat-icon>
            </button>
          </div>
          <div class="search-group">
            <mat-form-field appearance="outline" class="toolbar-field">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="search" (input)="onSearch()" placeholder="Search all columns..." />
            </mat-form-field>
          </div>
          <button mat-raised-button color="primary" class="sync-btn" (click)="fetchCollectionData()" [disabled]="isLoading">
            <mat-icon>refresh</mat-icon>
            Sync
          </button>
        </div>
        <div *ngIf="isLoading" class="loading-overlay">
          <mat-spinner></mat-spinner>
          <p>Loading data...</p>
        </div>
        <div *ngIf="errorMsg" class="error-message">
          <mat-icon color="warn">error</mat-icon>
          {{ errorMsg }}
        </div>
        <div *ngIf="!isLoading && !errorMsg && (filteredRowData?.length === 0 && rowData?.length === 0)" class="no-data-message">
          <mat-icon>info</mat-icon>
          No data available for this collection.
        </div>
        <div class="table-wrapper">
          <ag-grid-angular
            class="ag-theme-alpine wide-grid"
            style="min-width: 1200px; height: 70vh;"
            [columnDefs]="columnDefs"
            [rowModelType]="'clientSide'"
            [pagination]="true"
            [paginationPageSize]="10"
            [rowData]="filteredRowData || rowData"
            [quickFilterText]="quickFilterText"
            (gridReady)="onGridReady($event)">
          </ag-grid-angular>
        </div>
        <mat-divider></mat-divider>
        <div class="footer-bar">
          <span class="footer-info">Records: {{ (filteredRowData || rowData)?.length || 0 }}</span>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .raw-data-grid-bg {
      min-height: 100vh;
      width: 100vw;
      background: linear-gradient(135deg, #e3e9f7 0%, #f8fafc 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-top: 32px;
      margin-top: 100px;
    }
    .data-card {
      width: 96vw;
      max-width: 1800px;
      margin: 0 auto 32px auto;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(60, 80, 180, 0.08);
      background: #fff;
      padding: 0 0 12px 0;
      position: relative;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 16px;
      background: linear-gradient(90deg, #3f51b5 0%, #2196f3 100%);
      color: #fff;
      border-radius: 16px 16px 0 0;
      padding: 20px 32px 16px 32px;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(60, 80, 180, 0.06);
    }
    .header-icon {
      font-size: 2.2rem;
      margin-right: 8px;
    }
    .header-title {
      font-size: 1.4rem;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
      background: #f5f7fa;
      border-radius: 8px;
      box-shadow: 0 1px 4px rgba(60, 80, 180, 0.03);
      padding: 16px 24px;
      margin-top: 8px;
    }
    .toolbar-field {
      min-width: 180px;
      max-width: 220px;
      margin-right: 8px;
    }
    .field-search-group {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8f9fa;
      border-radius: 6px;
      padding: 6px 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }
    .field-search-group label {
      margin: 0 4px 0 0;
      font-weight: 500;
      color: #444;
    }
    .field-search-group input, .field-search-group select {
      min-width: 140px;
      height: 36px;
      font-size: 1rem;
      padding: 2px 8px;
      border-radius: 4px;
      border: 1px solid #e0e0e0;
      background: #fff;
    }
    .field-search-group button[mat-stroked-button] {
      height: 36px;
      min-width: 80px;
    }
    .field-search-group button[mat-icon-button] {
      height: 36px;
      width: 36px;
      margin-left: 2px;
    }
    .search-group {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 12px;
    }
    .sync-btn {
      margin-left: 18px;
      min-width: 80px;
      height: 40px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .table-wrapper {
      width: 100%;
      margin: 0 auto;
      // background: #fff;
      // border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
      margin-bottom: 24px;
      overflow-x: auto;
      position: relative;
    }
    .ag-theme-alpine.wide-grid {
      width: 100%;
      min-width: 1200px;
      max-width: 100vw;
      background: #fff;
      border-radius: 8px;
      box-shadow: none;
      margin-bottom: 0;
      font-size: 1.01rem;
    }
    .ag-theme-alpine .ag-row:hover {
      background: #e3f2fd !important;
      transition: background 0.2s;
    }
    .loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.7);
      z-index: 10;
      border-radius: 8px;
    }
    .error-message {
      color: #b00020;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0;
      font-weight: 500;
      background: #fff0f0;
      border: 1px solid #f8bdbd;
      border-radius: 6px;
      padding: 10px 18px;
      box-shadow: 0 1px 4px rgba(255,0,0,0.04);
    }
    .no-data-message {
      color: #666;
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 16px 0;
      font-weight: 500;
      background: #f6f8fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 10px 18px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    }
    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 8px 24px 0 24px;
      color: #3f51b5;
      font-weight: 500;
      font-size: 1.05rem;
      letter-spacing: 0.2px;
    }
  `]
})
export class RawDataGridComponent implements OnInit {
  activeIntegration = 'github';
  collections: string[] = [];
  selectedCollection = '';
  search = '';
  columnDefs: ColDef[] = [];
  pagination = { page: 1, limit: 100, total: 0, totalPages: 0 };
  gridApi!: GridApi;
  gridColumnApi: any;
  sortField = '';
  sortOrder = '';
  filters: any = {};
  dataSource: any;
  rowData: any[] = [];
  debug = {
    collections: null as any,
    collectionData: null as any,
    error: null as any
  };
  isLoading = false;
  errorMsg = '';
  quickFilterText = '';
  selectedField = '';
  fieldSearch = '';
  filteredRowData: any[] = [];

  // Map of essential fields per collection
  essentialFieldsMap: { [key: string]: string[] } = {
    issues: ['github_id', 'number', 'title', 'state', 'created_at', 'updated_at', 'html_url', 'user.login', 'assignee.login'],
    commits: ['sha', 'message', 'author.name', 'author.email', 'repository_name', 'branch', 'created_at_db', 'html_url'],
    repositories: ['github_id', 'name', 'full_name', 'private', 'language', 'stargazers_count', 'forks_count', 'created_at', 'updated_at', 'html_url'],
    pull_requests: ['github_id', 'number', 'title', 'state', 'created_at', 'updated_at', 'html_url', 'user.login'],
    organizations: ['github_id', 'login', 'name', 'description', 'html_url', 'created_at', 'updated_at'],
    users: ['github_id', 'login', 'name', 'email', 'created_at', 'updated_at', 'html_url'],
    // fallback for other collections
    default: ['_id', 'name', 'created_at', 'updated_at', 'html_url']
  };

  constructor(private collectionsService: CollectionsService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.collectionsService.getCollections().subscribe({
      next: (res) => {
        console.log('Collections API response:', res);
        this.debug.collections = res;
        this.collections = res.data;
        if (this.collections && this.collections.length) {
          this.selectedCollection = this.collections[0];
          this.fetchCollectionData();
        }
      },
      error: (err) => {
        console.error('Error fetching collections:', err);
        this.debug.error = err;
      }
    });
  }

  onCollectionChange() {
    console.log('Entity changed:', this.selectedCollection);
    this.pagination.page = 1;
    this.fetchCollectionData();
  }

  onSearch() {
    this.pagination.page = 1;
    this.quickFilterText = this.search;
  }

  // Remove filtering on input for field search
  // Add methods for search and clear
  applyFieldSearch() {
    if (!this.selectedField || !this.fieldSearch) {
      this.filteredRowData = this.rowData;
      return;
    }
    const searchTerm = this.fieldSearch.toLowerCase();
    this.filteredRowData = this.rowData.filter(row => {
      const value = this.getFieldValue(row, this.selectedField);
      return value && value.toString().toLowerCase().includes(searchTerm);
    });
  }

  clearFieldSearch() {
    this.fieldSearch = '';
    this.filteredRowData = this.rowData;
  }

  getFieldValue(row: any, field: string): any {
    // Support dot notation for nested fields
    return field.split('.').reduce((acc, part) => acc && acc[part], row);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    console.log('Grid ready, fetching data for:', this.selectedCollection);
    this.fetchCollectionData();
  }

  // Remove setupDataSource and all server-side row model logic

  fetchCollectionData() {
    if (!this.selectedCollection) {
      console.warn('No collection selected.');
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    console.log('Fetching all data for collection:', this.selectedCollection);
    this.collectionsService.getCollectionData(this.selectedCollection, {}).subscribe({
      next: (res) => {
        console.log('Collection data response:', res);
        this.debug.collectionData = res;
        if (res.data && Array.isArray(res.data.fields) && Array.isArray(res.data.data)) {
          const fieldsToShow = res.data.fields;
          const friendlyHeader = (key: string) => key.replace(/_/g, ' ').replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          this.columnDefs = fieldsToShow.map((field: string) => {
            let colDef: ColDef = {
              headerName: friendlyHeader(field),
              field: field,
              filter: true,
              sortable: true,
              resizable: true,
              flex: 1,
              tooltipField: field,
              valueFormatter: (params: any) => {
                if (typeof params.value === 'object' && params.value !== null) {
                  if (params.value.name && params.value.email) {
                    return `${params.value.name} <${params.value.email}>`;
                  }
                  return JSON.stringify(params.value);
                }
                if (typeof params.value === 'string' && /T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(params.value)) {
                  return new Date(params.value).toLocaleString();
                }
                return params.value;
              },
              cellRenderer: undefined
            };
            if (field === 'html_url') {
              colDef.cellRenderer = (params: any) => {
                if (!params.value) return '';
                return `<a href="${params.value}" target="_blank" rel="noopener noreferrer">🔗 Link</a>`;
              };
              colDef.getQuickFilterText = (params: any) => params.value || '';
            }
            if (["author", "user", "assignee"].includes(field)) {
              colDef.getQuickFilterText = (params: any) => {
                if (params.value && typeof params.value === 'object') {
                  return Object.values(params.value).join(' ');
                }
                return params.value || '';
              };
            }
            if (["sha", "message", "author.name", "title", "name"].includes(field)) {
              colDef.pinned = 'left';
            }
            return colDef;
          });
          this.rowData = res.data.data;
          // Set default selected field to the first field
          this.selectedField = fieldsToShow[0] || '';
          this.filteredRowData = this.rowData; // Initialize filteredRowData with all data
        } else {
          this.columnDefs = [];
          this.rowData = [];
          this.selectedField = '';
          this.filteredRowData = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching collection data:', err);
        this.debug.error = err;
        this.errorMsg = 'Failed to load data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  get allFields(): string[] {
    return this.columnDefs.map(c => c.field as string);
  }

  disconnectIntegration() {
    if (!confirm('Are you sure you want to disconnect your GitHub integration? This will log you out.')) return;
    // The original code had HttpClient and MatSnackBar here, but they were removed from imports.
    // Assuming the intent was to remove the actual HTTP call and snackbar,
    // but the component still needs to handle the user interaction.
    // For now, we'll just show a placeholder message.
    alert('Disconnecting integration is not yet implemented.');
    // In a real scenario, you would make an HTTP call to your backend to remove the integration.
    // this.http.delete('/api/integrations/remove').subscribe({
    //   next: () => {
    //     this.snackBar.open('Disconnected from GitHub. Logging out...', 'Close', { duration: 3000 });
    //     setTimeout(() => window.location.href = '/login', 1500);
    //   },
    //   error: (err) => {
    //     this.snackBar.open('Failed to disconnect. Please try again.', 'Close', { duration: 4000 });
    //     console.error('Disconnect error:', err);
    //   }
    // });
  }
} 