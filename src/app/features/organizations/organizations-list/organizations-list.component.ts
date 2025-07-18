import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { OrganizationService } from '../../../core/services/organization.service';

interface Organization {
  _id: string;
  github_id: number;
  login: string;
  name: string;
  description: string;
  avatar_url: string;
  html_url: string;
  public_repos?: number;
  private_repos?: number;
  created_at: string;
  updated_at: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Component({
  selector: 'app-organizations-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="organizations-container">
      <!-- Header -->
      <div class="organizations-header">
        <h1>Organizations</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search organizations</mat-label>
            <input matInput [(ngModel)]="searchTerm" (input)="onSearchChange()" placeholder="Search by name or description...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="syncOrganizations()" [disabled]="isSyncing">
            <mat-icon>sync</mat-icon>
            {{ isSyncing ? 'Syncing...' : 'Sync Organizations' }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading organizations...</p>
      </div>

      <!-- Content -->
      <div *ngIf="!loading" class="organizations-content">
        <!-- No Data State -->
        <div *ngIf="organizations.length === 0" class="no-data">
          <mat-icon>business</mat-icon>
          <h3>No Organizations Found</h3>
          <p *ngIf="searchTerm">
            No organizations match your search criteria. Try a different search term.
          </p>
          <p *ngIf="!searchTerm">
            No organizations found. Connect your GitHub account and sync organizations to get started.
          </p>
          <button mat-raised-button color="primary" (click)="syncOrganizations()" [disabled]="isSyncing">
            <mat-icon>sync</mat-icon>
            Sync Organizations
          </button>
        </div>

        <!-- Organizations Grid -->
        <div *ngIf="organizations.length > 0" class="organizations-grid">
          <mat-card *ngFor="let org of organizations" class="organization-card">
            <mat-card-content>
              <div class="org-header">
                <img [src]="org.avatar_url" [alt]="org.name || org.login" class="org-avatar">
                <div class="org-info">
                  <h3>{{ org.name || org.login }}</h3>
                  <p class="org-login">@{{ org.login }}</p>
                  <p *ngIf="org.description" class="org-description">{{ org.description }}</p>
                </div>
              </div>
              
              <div class="org-stats" *ngIf="org.public_repos !== undefined || org.private_repos !== undefined">
                <mat-chip *ngIf="org.public_repos !== undefined" color="primary" variant="outlined">
                  <mat-icon>folder</mat-icon>
                  {{ org.public_repos }} public repos
                </mat-chip>
                <mat-chip *ngIf="org.private_repos !== undefined" color="warn" variant="outlined">
                  <mat-icon>lock</mat-icon>
                  {{ org.private_repos }} private repos
                </mat-chip>
              </div>

              <div class="org-actions">
                <a [href]="org.html_url" target="_blank" class="org-link">
                  <mat-icon>open_in_new</mat-icon>
                  View on GitHub
                </a>
                <button mat-button color="primary" (click)="viewRepositories(org)">
                  <mat-icon>folder</mat-icon>
                  View Repositories
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Pagination -->
        <mat-paginator
          *ngIf="organizations.length > 0"
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageIndex]="currentPage"
          [pageSizeOptions]="[5, 10, 25, 50]"
          (page)="onPageChange($event)"
          showFirstLastButtons
          aria-label="Select page of organizations">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .organizations-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .organizations-header {
      margin-bottom: 24px;
    }

    .organizations-header h1 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .header-actions {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .search-field {
      min-width: 300px;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 60px 20px;
      text-align: center;
    }

    .no-data mat-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .no-data h3 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .no-data p {
      margin: 0 0 24px 0;
      color: #666;
      max-width: 400px;
    }

    .organizations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .organization-card {
      transition: box-shadow 0.2s;
    }

    .organization-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .org-header {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .org-avatar {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .org-info h3 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 18px;
    }

    .org-login {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .org-description {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .org-stats {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .org-actions {
      display: flex;
      gap: 12px;
      justify-content: space-between;
      align-items: center;
    }

    .org-link {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #2196f3;
      text-decoration: none;
      font-size: 14px;
    }

    .org-link:hover {
      text-decoration: underline;
    }

    mat-paginator {
      margin-top: 24px;
    }

    @media (max-width: 768px) {
      .organizations-container {
        padding: 16px;
      }

      .header-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        min-width: auto;
      }

      .organizations-grid {
        grid-template-columns: 1fr;
      }

      .org-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }
    }
  `]
})
export class OrganizationsListComponent implements OnInit {
  organizations: Organization[] = [];
  loading = true;
  isSyncing = false;
  searchTerm = '';
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private organizationService: OrganizationService
  ) {}

  ngOnInit(): void {
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.loading = true;
    const params: any = {
      page: this.currentPage + 1,
      limit: this.pageSize
    };

    if (this.searchTerm.trim()) {
      params.search = this.searchTerm.trim();
    }

    this.http.get<ApiResponse<Organization[]>>(`${environment.apiUrl}/organizations`, { params }).subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations = response.data || [];
          this.totalItems = response.pagination?.total || 0;
        } else {
          this.snackBar.open(response.message || 'Failed to load organizations', 'Close', {
            duration: 5000
          });
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
        this.snackBar.open('Failed to load organizations', 'Close', {
          duration: 5000
        });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onSearchChange(): void {
    // Debounce search
    clearTimeout((this as any).searchTimeout);
    (this as any).searchTimeout = setTimeout(() => {
      this.currentPage = 0;
      this.loadOrganizations();
    }, 300);
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOrganizations();
  }

  syncOrganizations(): void {
    this.isSyncing = true;
    
    this.organizationService.syncOrganizations().subscribe({
      next: (res) => {
        this.isSyncing = false;
        if (res.success) {
          this.snackBar.open(res.message, 'Close', { duration: 3000 });
          // Optionally refresh the list here
          // this.loadOrganizations();
        } else {
          this.snackBar.open(res.message || 'Sync failed', 'Close', { duration: 4000 });
        }
      },
      error: (err) => {
        this.isSyncing = false;
        this.snackBar.open('Error syncing organizations', 'Close', { duration: 4000 });
      }
    });
  }

  viewRepositories(org: Organization): void {
    // Navigate to repositories page with organization filter
    // This would be implemented when we add routing
    console.log('View repositories for organization:', org.login);
  }
}
