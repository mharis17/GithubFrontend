import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions, GridReadyEvent } from 'ag-grid-community';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { DataService } from '../../core/services/data.service';
import { StorageService } from '../../core/services/storage.service';
import { CollectionInfo, SearchParams, DataCollection } from '../../core/models/api.interface';

@Component({
  selector: 'app-data-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSnackBarModule,
    AgGridModule
  ],
  template: `
    <div class="data-viewer-container">
      <!-- Header -->
      <div class="header-section">
        <h1>Raw Data</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary">
            <mat-icon>grid_on</mat-icon>
            New Grid
          </button>
          <button mat-raised-button color="primary">
            <mat-icon>search</mat-icon>
            New Global Search Grid
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="filter-bar">
        <div class="filter-controls">
          <div class="filter-group">
            <label>Active Integrations:</label>
            <mat-select [(ngModel)]="selectedIntegration" (selectionChange)="onIntegrationChange()">
              <mat-option value="github">GitHub</mat-option>
            </mat-select>
          </div>
          
          <div class="filter-group">
            <label>Entity:</label>
            <mat-select [(ngModel)]="selectedEntity" (selectionChange)="onEntityChange()">
              <mat-option *ngFor="let entity of entities" [value]="entity.value">
                {{ entity.label }}
              </mat-option>
            </mat-select>
          </div>
          
          <div class="filter-group">
            <label>Processed Entity:</label>
            <mat-select [(ngModel)]="selectedCollection" (selectionChange)="onCollectionChange()">
              <mat-option *ngFor="let collection of collections" [value]="collection.name">
                {{ collection.name }}
              </mat-option>
            </mat-select>
          </div>
          
          <div class="filter-group search-group">
            <label>Search:</label>
            <mat-form-field appearance="outline">
              <input matInput 
                     [(ngModel)]="searchTerm" 
                     (ngModelChange)="onSearchChange($event)"
                     placeholder="Search across all fields...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>
        </div>
        
        <div class="filter-actions">
          <button mat-raised-button color="warn" (click)="deleteGrid()">
            <mat-icon>delete</mat-icon>
            Delete Grid
          </button>
        </div>
      </div>

      <!-- Data Grid -->
      <div class="grid-container" *ngIf="selectedCollection">
        <div class="ag-grid-wrapper">
          <ag-grid-angular
            [rowData]="currentData"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [pagination]="true"
            [paginationPageSize]="pageSize"
            [paginationPageSizeSelector]="true"
            theme="legacy"
            class="ag-theme-material"
            (gridReady)="onGridReady($event)">
          </ag-grid-angular>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="footer-actions" *ngIf="selectedCollection">
        <div class="footer-left">
          <span class="selection-info">Rows Selected {{ selectedRows }}</span>
          <button mat-raised-button color="primary">
            Select Tickets that have Time Tracked Against them
          </button>
          <button mat-raised-button color="primary">
            Deselect Tickets that have Time Tracked Against them
          </button>
        </div>
        
        <div class="footer-right">
          <button mat-raised-button color="primary">
            Include Entity Column in Time Rec
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="isLoading">
        <mat-spinner></mat-spinner>
        <p>Loading data...</p>
      </div>

      <!-- No Collection Selected -->
      <div class="no-data-container" *ngIf="!selectedCollection && collections.length > 0">
        <mat-icon>table_chart</mat-icon>
        <h3>Select a Collection</h3>
        <p>Choose a collection from the dropdown above to view its data.</p>
      </div>

      <!-- No Collections Available -->
      <div class="no-data-container" *ngIf="collections.length === 0 && !isLoading">
        <mat-icon>data_usage</mat-icon>
        <h3>No Data Available</h3>
        <p>No collections are available. Please ensure your GitHub integration is connected and data has been synced.</p>
      </div>
    </div>
  `,
  styles: [`
    .data-viewer-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
      background-color: #f5f5f5;
      min-height: 100vh;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .header-section h1 {
      margin: 0;
      color: #333;
      font-size: 2rem;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .filter-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .filter-controls {
      display: flex;
      gap: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .filter-group label {
      font-weight: 500;
      color: #333;
      font-size: 0.9rem;
    }

    .search-group {
      min-width: 300px;
    }

    mat-select {
      min-width: 150px;
    }

    mat-form-field {
      min-width: 250px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
    }

    .grid-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
      overflow: hidden;
    }

    .ag-grid-wrapper {
      height: 600px;
      width: 100%;
    }

    .footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 20px;
    }

    .footer-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .selection-info {
      color: #666;
      font-size: 0.9rem;
    }

    .footer-right {
      display: flex;
      gap: 12px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      gap: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .loading-container p {
      color: #666;
      margin: 0;
    }

    .no-data-container {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .no-data-container mat-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data-container h3 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .no-data-container p {
      margin: 0;
      color: #666;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    /* AG Grid Customization */
    :host ::ng-deep .ag-theme-material {
      --ag-header-height: 50px;
      --ag-header-foreground-color: #333;
      --ag-header-background-color: #f8f9fa;
      --ag-header-cell-hover-background-color: #e9ecef;
      --ag-row-hover-color: #f8f9fa;
      --ag-selected-row-background-color: #e3f2fd;
      --ag-font-size: 14px;
      --ag-font-family: 'Roboto', sans-serif;
    }

    :host ::ng-deep .ag-header-cell {
      border-right: 1px solid #dee2e6;
    }

    :host ::ng-deep .ag-cell {
      border-right: 1px solid #f1f3f4;
      padding: 8px 12px;
    }

    @media (max-width: 768px) {
      .header-section {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
      }

      .filter-bar {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .filter-controls {
        flex-direction: column;
        gap: 12px;
      }

      .footer-actions {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .footer-left {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `]
})
export class DataViewerComponent implements OnInit, OnDestroy {
  collections: CollectionInfo[] = [];
  selectedCollection = '';
  selectedIntegration = 'github';
  selectedEntity = '';
  searchTerm = '';
  currentData: any[] = [];
  totalRecords = 0;
  currentPage = 0;
  pageSize = 100;
  isLoading = false;
  selectedRows = 0;

  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    maxWidth: 300,
    flex: 1
  };

  gridOptions: GridOptions = {
    rowSelection: 'multiple',
    suppressRowClickSelection: true,
    pagination: true,
    paginationPageSize: 100,
    paginationPageSizeSelector: true,
    animateRows: true,
    enableCellTextSelection: true,
    suppressMovableColumns: false,
    suppressMenuHide: false
  };

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Available entities for the Entity dropdown
  entities = [
    { value: 'organizations', label: 'Organizations' },
    { value: 'repositories', label: 'Repositories' },
    { value: 'commits', label: 'Commits' },
    { value: 'issues', label: 'Issues' },
    { value: 'pull-requests', label: 'Pull Requests' },
    { value: 'users', label: 'Users' }
  ];

  constructor(
    private dataService: DataService,
    private storageService: StorageService,
    private snackBar: MatSnackBar
  ) {
    // Setup search debouncing
    this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(term => {
        this.performSearch(term);
      });
  }

  ngOnInit(): void {
    this.loadSettings();
    this.loadCollections();
    
    // Auto-select first collection if none selected
    setTimeout(() => {
      if (this.collections.length > 0 && !this.selectedCollection) {
        this.selectedCollection = this.collections[0].name;
        this.loadData();
      }
    }, 600);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onIntegrationChange(): void {
    // Reset selections when integration changes
    this.selectedEntity = '';
    this.selectedCollection = '';
    this.loadCollections();
  }

  onEntityChange(): void {
    // Filter collections based on selected entity
    this.selectedCollection = '';
    this.loadCollections();
  }

  onCollectionChange(): void {
    if (this.selectedCollection) {
      this.loadData();
      this.saveSettings();
    }
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadData();
  }

  onGridReady(params: GridReadyEvent): void {
    // Grid is ready
    console.log('AG Grid is ready');
  }

  refreshData(): void {
    this.loadData();
  }

  deleteGrid(): void {
    // Implementation for deleting the current grid configuration
    this.snackBar.open('Grid configuration deleted', 'Close', { duration: 3000 });
  }

  private loadCollections(): void {
    this.isLoading = true;
    
    // Load real collections from backend
    this.dataService.getCollections().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Filter collections based on selected entity
          if (this.selectedEntity) {
            this.collections = response.data.filter(c => 
              c.name.includes(this.selectedEntity.replace('-', '_'))
            );
          } else {
            this.collections = response.data;
          }
        } else {
          console.error('Failed to load collections:', response.message);
          this.snackBar.open('Failed to load collections', 'Close', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading collections:', error);
        this.snackBar.open('Error loading collections', 'Close', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  private loadData(): void {
    if (!this.selectedCollection) return;

    this.isLoading = true;
    
    // Load real data from backend based on collection type
    let dataObservable;
    
    switch (this.selectedCollection) {
      case 'organizations':
        dataObservable = this.dataService.getOrganizations(1, this.pageSize, this.searchTerm);
        break;
      case 'repositories':
        dataObservable = this.dataService.getRepositories(1, this.pageSize, this.searchTerm);
        break;
      case 'commits':
        dataObservable = this.dataService.getCommits(1, this.pageSize);
        break;
      default:
        // Use generic search for other collections
        dataObservable = this.dataService.searchData(this.selectedCollection, {
          page: 1,
          limit: this.pageSize,
          search: this.searchTerm
        });
    }
    
    dataObservable.subscribe({
      next: (response) => {
        if (response.success && response.data) {
          if (response.data.data) {
            // Handle DataCollection format
            this.currentData = response.data.data;
            this.totalRecords = response.data.total || response.data.data.length;
          } else if (Array.isArray(response.data)) {
            // Handle array format
            this.currentData = response.data;
            this.totalRecords = response.data.length;
          } else {
            // Handle other formats
            this.currentData = [response.data];
            this.totalRecords = 1;
          }
          
          // Generate column definitions dynamically
          this.generateColumnDefs();
          
          console.log(`Loaded ${this.currentData.length} records for collection: ${this.selectedCollection}`);
        } else {
          console.error('Failed to load data:', response.message);
          this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
          this.currentData = [];
          this.totalRecords = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
        this.currentData = [];
        this.totalRecords = 0;
        this.columnDefs = [];
        this.isLoading = false;
      }
    });
  }

  private generateMockData(collectionName: string): any[] {
    const data: any[] = [];
    
    switch (collectionName) {
      case 'commits':
        for (let i = 1; i <= 100; i++) {
          data.push({
            id: i,
            hash: this.generateRandomHash(),
            branch: i % 3 === 0 ? 'main' : i % 3 === 1 ? 'develop' : 'feature/new-feature',
            message: this.generateCommitMessage(),
            date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            repository_name: i % 2 === 0 ? 'Angular' : 'React-App',
            repository_uuid: 905671088 + i,
            author_uuid: 17563226 + i,
            author_name: i % 2 === 0 ? 'alan-agius4' : 'john-doe',
            pullrequest: i % 5 === 0 ? `PR-${i}` : '',
            url: `https://github.com/sredio-organization/Angular/commit/${this.generateRandomHash()}`,
            checksum: this.generateRandomHash(),
            files_changed: Math.floor(Math.random() * 10) + 1,
            additions: Math.floor(Math.random() * 100) + 10,
            deletions: Math.floor(Math.random() * 50) + 1,
            status: i % 4 === 0 ? 'success' : i % 4 === 1 ? 'pending' : 'failed'
          });
        }
        break;
        
      case 'organizations':
        for (let i = 1; i <= 20; i++) {
          data.push({
            id: i,
            login: `org-${i}`,
            name: `${['Tech', 'Innovation', 'Digital', 'Future', 'Global'][i % 5]} ${['Corp', 'Solutions', 'Systems', 'Labs', 'Group'][i % 5]}`,
            avatar_url: `https://avatars.githubusercontent.com/u/${100000 + i}?v=4`,
            description: `${['Leading', 'Innovative', 'Cutting-edge', 'Advanced', 'Modern'][i % 5]} ${['technology', 'software', 'digital', 'AI/ML', 'cloud'][i % 5]} company focused on ${['web development', 'mobile apps', 'data science', 'blockchain', 'IoT'][i % 5]}.`,
            public_repos: Math.floor(Math.random() * 100) + 10,
            private_repos: Math.floor(Math.random() * 50) + 5,
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            location: ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Paris', 'Sydney', 'Toronto'][i % 8],
            company: `${['Tech', 'Innovation', 'Digital'][i % 3]} ${['Corp', 'Inc', 'Ltd'][i % 3]}`,
            blog: i % 3 === 0 ? `https://org${i}.com` : null,
            email: i % 4 === 0 ? `contact@org${i}.com` : null,
            twitter_username: i % 5 === 0 ? `org${i}_official` : null,
            type: 'Organization',
            site_admin: i % 10 === 0,
            members_count: Math.floor(Math.random() * 500) + 50,
            plan: ['free', 'pro', 'enterprise'][i % 3]
          });
        }
        break;
        
      case 'repositories':
        for (let i = 1; i <= 100; i++) {
          data.push({
            id: i,
            name: `repo-${i}`,
            full_name: `org/repo-${i}`,
            description: `Repository ${i} description - A comprehensive project for ${['web development', 'mobile apps', 'data analysis', 'machine learning'][i % 4]}`,
            private: i % 3 === 0,
            fork: i % 4 === 0,
            language: ['TypeScript', 'JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust'][i % 7],
            stargazers_count: Math.floor(Math.random() * 1000),
            watchers_count: Math.floor(Math.random() * 500),
            forks_count: Math.floor(Math.random() * 200),
            open_issues_count: Math.floor(Math.random() * 50),
            size: Math.floor(Math.random() * 10000) + 1000,
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            pushed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            default_branch: 'main',
            topics: this.generateTopics(),
            license: ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause'][i % 4]
          });
        }
        break;
        
      case 'issues':
        for (let i = 1; i <= 100; i++) {
          data.push({
            id: i,
            number: i,
            title: `Issue ${i}: ${this.generateIssueTitle()}`,
            body: `This is the detailed description for issue ${i}. It includes information about the problem, expected behavior, and steps to reproduce. This issue affects the ${['frontend', 'backend', 'database', 'API'][i % 4]} component of the application.`,
            state: i % 3 === 0 ? 'closed' : 'open',
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            closed_at: i % 3 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
            user: {
              login: `user-${i}`,
              avatar_url: `https://avatars.githubusercontent.com/u/${1000 + i}?v=4`
            },
            labels: this.generateLabels(),
            repository: `org/repo-${i % 10 + 1}`,
            assignee: i % 4 === 0 ? `assignee-${i}` : null,
            milestone: i % 5 === 0 ? `milestone-${i}` : null,
            comments_count: Math.floor(Math.random() * 20),
            reactions_count: Math.floor(Math.random() * 10),
            locked: i % 10 === 0,
            draft: false
          });
        }
        break;
        
      case 'pull_requests':
        for (let i = 1; i <= 100; i++) {
          data.push({
            id: i,
            number: i,
            title: `Pull Request ${i}: ${this.generatePRTitle()}`,
            body: `This is the detailed description for PR ${i}. It includes information about the changes made, testing performed, and any breaking changes. This PR addresses the requirements from issue #${i}.`,
            state: i % 4 === 0 ? 'closed' : 'open',
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            closed_at: i % 4 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
            merged_at: i % 4 === 0 && i % 2 === 0 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : null,
            user: {
              login: `user-${i}`,
              avatar_url: `https://avatars.githubusercontent.com/u/${2000 + i}?v=4`
            },
            labels: this.generateLabels(),
            repository: `org/repo-${i % 10 + 1}`,
            head: {
              ref: `feature/pr-${i}`,
              sha: this.generateRandomHash()
            },
            base: {
              ref: 'main',
              sha: this.generateRandomHash()
            },
            assignee: i % 4 === 0 ? `assignee-${i}` : null,
            requested_reviewers: i % 3 === 0 ? [`reviewer-${i}`, `reviewer-${i + 1}`] : [],
            comments_count: Math.floor(Math.random() * 15),
            review_comments_count: Math.floor(Math.random() * 10),
            commits_count: Math.floor(Math.random() * 20) + 1,
            additions: Math.floor(Math.random() * 500) + 50,
            deletions: Math.floor(Math.random() * 200) + 10,
            changed_files: Math.floor(Math.random() * 15) + 1,
            draft: i % 8 === 0,
            mergeable: i % 3 === 0 ? 'mergeable' : i % 3 === 1 ? 'conflicting' : 'unknown'
          });
        }
        break;
        
      case 'users':
        for (let i = 1; i <= 100; i++) {
          data.push({
            id: i,
            login: `user-${i}`,
            name: `User ${i}`,
            email: `user${i}@example.com`,
            avatar_url: `https://avatars.githubusercontent.com/u/${3000 + i}?v=4`,
            public_repos: Math.floor(Math.random() * 50),
            followers: Math.floor(Math.random() * 200),
            following: Math.floor(Math.random() * 100),
            created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            location: ['New York', 'San Francisco', 'London', 'Tokyo', 'Berlin', 'Paris', 'Sydney', 'Toronto'][i % 8],
            company: i % 3 === 0 ? ['Tech Corp', 'Startup Inc', 'Big Company', 'Freelance'][i % 4] : null,
            bio: i % 2 === 0 ? `Passionate developer working on ${['web applications', 'mobile apps', 'AI/ML', 'blockchain', 'cloud infrastructure'][i % 5]}. Love open source and contributing to the community.` : null,
            blog: i % 4 === 0 ? `https://blog.user${i}.com` : null,
            twitter_username: i % 5 === 0 ? `user${i}_dev` : null,
            hireable: i % 3 === 0,
            type: i % 10 === 0 ? 'Organization' : 'User',
            site_admin: i % 20 === 0
          });
        }
        break;
    }
    
    return data;
  }

  private generateColumnDefs(): void {
    if (this.currentData.length === 0) {
      this.columnDefs = [];
      return;
    }

    try {
      const sampleData = this.currentData[0];
      this.columnDefs = Object.keys(sampleData).map(key => ({
        field: key,
        headerName: this.formatHeaderName(key),
        width: this.getColumnWidth(key),
        filter: true,
        sortable: true,
        resizable: true,
        minWidth: 100,
        maxWidth: 300,
        flex: 1
      }));
      
      console.log(`Generated ${this.columnDefs.length} columns`);
    } catch (error) {
      console.error('Error generating column definitions:', error);
      this.columnDefs = [];
    }
  }

  private formatHeaderName(key: string): string {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getColumnWidth(key: string): number {
    const widthMap: { [key: string]: number } = {
      id: 80,
      hash: 200,
      message: 400,
      title: 300,
      url: 350,
      created_at: 150,
      updated_at: 150,
      avatar_url: 120,
      login: 120,
      name: 150,
      email: 200
    };
    return widthMap[key] || 150;
  }



  private performSearch(term: string): void {
    // Implement search functionality
    console.log('Searching for:', term);
    // In a real implementation, this would call the API with search parameters
  }

  private generateRandomHash(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private generateCommitMessage(): string {
    const messages = [
      'fix(angular-devkit/build-angular): exit dev-server when CTRL+C is pressed',
      'feat: add new authentication system',
      'docs: update README with new installation instructions',
      'style: format code according to style guide',
      'refactor: improve performance of data processing',
      'test: add unit tests for user service',
      'chore: update dependencies to latest versions',
      'perf: optimize database queries',
      'ci: add automated testing pipeline',
      'build: configure webpack for production'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private generateIssueTitle(): string {
    const titles = [
      'Add dark mode support',
      'Fix login bug',
      'Improve performance',
      'Update documentation',
      'Add new feature',
      'Resolve memory leak',
      'Enhance user interface',
      'Fix security vulnerability',
      'Optimize database queries',
      'Add unit tests'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generatePRTitle(): string {
    const titles = [
      'Implement new API endpoint',
      'Add user authentication',
      'Fix responsive design issues',
      'Update dependencies',
      'Add error handling',
      'Improve code coverage',
      'Refactor component structure',
      'Add internationalization support',
      'Optimize bundle size',
      'Add accessibility features'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generateLabels(): string[] {
    const allLabels = ['bug', 'enhancement', 'feature', 'documentation', 'help wanted', 'good first issue', 'priority: high', 'priority: low', 'ui', 'api', 'backend', 'frontend'];
    const numLabels = Math.floor(Math.random() * 4) + 1;
    const labels: string[] = [];
    for (let i = 0; i < numLabels; i++) {
      const label = allLabels[Math.floor(Math.random() * allLabels.length)];
      if (!labels.includes(label)) {
        labels.push(label);
      }
    }
    return labels;
  }

  private generateTopics(): string[] {
    const allTopics = ['javascript', 'typescript', 'angular', 'react', 'vue', 'nodejs', 'python', 'machine-learning', 'web-development', 'mobile', 'api', 'database', 'cloud', 'devops', 'testing'];
    const numTopics = Math.floor(Math.random() * 5) + 1;
    const topics: string[] = [];
    for (let i = 0; i < numTopics; i++) {
      const topic = allTopics[Math.floor(Math.random() * allTopics.length)];
      if (!topics.includes(topic)) {
        topics.push(topic);
      }
    }
    return topics;
  }

  private loadSettings(): void {
    const settings = this.storageService.getItem<any>('dataViewerSettings');
    if (settings) {
      this.selectedCollection = settings.selectedCollection || '';
      this.selectedIntegration = settings.selectedIntegration || 'github';
      this.selectedEntity = settings.selectedEntity || '';
      this.pageSize = settings.pageSize || 100;
    }
  }

  private saveSettings(): void {
    const settings = {
      selectedCollection: this.selectedCollection,
      selectedIntegration: this.selectedIntegration,
      selectedEntity: this.selectedEntity,
      pageSize: this.pageSize
    };
    this.storageService.setItem('dataViewerSettings', settings);
  }
} 