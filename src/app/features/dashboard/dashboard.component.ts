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
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface DashboardStats {
  totalOrganizations: number;
  totalRepositories: number;
  totalCommits: number;
  recentActivity: any[];
}

interface Organization {
  _id: string;
  github_id: number;
  login: string;
  name: string;
  description: string;
  avatar_url: string;
  html_url: string;
}

interface Repository {
  _id: string;
  github_id: number;
  name: string;
  full_name: string;
  description: string;
  language: string;
  private: boolean;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
}

interface Commit {
  _id: string;
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  repository_name: string;
  repository_uuid: string;
  branch: string;
  html_url: string;
  repository_id: string;
  organization_id: string;
  integration_id: string;
  created_at_db: string;
  updated_at_db: string;
}

@Component({
  selector: 'app-dashboard',
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
    MatDividerModule
  ],
  template: `
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <button mat-raised-button color="accent" (click)="syncOrganizations()" [disabled]="isSyncing">
          <mat-icon>sync</mat-icon>
          {{ isSyncing ? 'Syncing...' : 'Sync Organizations' }}
        </button>
        <button mat-raised-button color="primary" (click)="syncData()" [disabled]="isSyncing">
          <mat-icon>sync</mat-icon>
          {{ isSyncing ? 'Syncing...' : 'Sync Data' }}
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner></mat-spinner>
        <p>Loading dashboard data...</p>
      </div>

      <!-- Dashboard Content -->
      <div *ngIf="!loading" class="dashboard-content">
        <!-- Stats Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">business</mat-icon>
                <div class="stat-info">
                  <h3>{{ stats.totalOrganizations }}</h3>
                  <p>Organizations</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">folder</mat-icon>
                <div class="stat-info">
                  <h3>{{ stats.totalRepositories }}</h3>
                  <p>Repositories</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-content">
                <mat-icon class="stat-icon">commit</mat-icon>
                <div class="stat-info">
                  <h3>{{ stats.totalCommits }}</h3>
                  <p>Commits</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Activity -->
        <div class="activity-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Recent Activity</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="stats.recentActivity.length === 0" class="no-activity">
                <mat-icon>info</mat-icon>
                <p>No recent activity found. Try syncing your data!</p>
              </div>
              <mat-list *ngIf="stats.recentActivity.length > 0">
                <mat-list-item *ngFor="let activity of stats.recentActivity">
                  <mat-icon matListItemIcon>{{ activity.icon }}</mat-icon>
                  <div matListItemTitle>{{ activity.title }}</div>
                  <div matListItemLine>{{ activity.description }}</div>
                  <div matListItemMeta>{{ activity.time | date:'short' }}</div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Organizations -->
        <div class="organizations-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Your Organizations</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="organizations.length === 0" class="no-data">
                <mat-icon>business</mat-icon>
                <p>No organizations found. Connect your GitHub account to see your organizations.</p>
              </div>
              <div *ngIf="organizations.length > 0" class="organizations-grid">
                <div *ngFor="let org of organizations" class="org-card">
                  <img [src]="org.avatar_url" [alt]="org.name" class="org-avatar">
                  <div class="org-info">
                    <h4>{{ org.name || org.login }}</h4>
                    <p *ngIf="org.description">{{ org.description }}</p>
                    <a [href]="org.html_url" target="_blank" class="org-link">
                      <mat-icon>open_in_new</mat-icon>
                      View on GitHub
                    </a>
                  </div>
                  <button mat-raised-button color="primary" (click)="syncRepositories(org)" [disabled]="isSyncing">
                    <mat-icon>sync</mat-icon>
                    Sync Repos
                  </button>
                  <mat-list *ngIf="orgRepos[org._id] && orgRepos[org._id].length > 0">
                    <mat-list-item *ngFor="let repo of orgRepos[org._id]">
                      <mat-icon matListItemIcon>folder</mat-icon>
                      <div matListItemTitle>{{ repo.name }}</div>
                      <div matListItemLine>{{ repo.description }}</div>
                      <div matListItemMeta>{{ repo.stargazers_count }} Stars, {{ repo.forks_count }} Forks</div>
                      <button mat-raised-button color="primary" (click)="syncCommits(repo)" [disabled]="isSyncing">
                        <mat-icon>sync</mat-icon>
                        Sync Commits
                      </button>
                      <mat-list *ngIf="repoCommits[repo._id] && repoCommits[repo._id].length > 0">
                        <mat-list-item *ngFor="let commit of repoCommits[repo._id]">
                          <mat-icon matListItemIcon>commit</mat-icon>
                          <div matListItemTitle>{{ commit.message }}</div>
                          <div matListItemLine>{{ commit.author.name }} on {{ commit.created_at_db | date:'short' }}</div>
                        </mat-list-item>
                      </mat-list>
                    </mat-list-item>
                  </mat-list>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Repositories -->
        <div class="repositories-section">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Recent Repositories</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="repositories.length === 0" class="no-data">
                <mat-icon>folder</mat-icon>
                <p>No repositories found. Connect your GitHub account to see your repositories.</p>
              </div>
              <div *ngIf="repositories.length > 0" class="repositories-grid">
                <div *ngFor="let repo of repositories" class="repo-card">
                  <div class="repo-header">
                    <h4>{{ repo.name }}</h4>
                    <mat-chip *ngIf="repo.private" color="warn" variant="outlined">Private</mat-chip>
                  </div>
                  <p *ngIf="repo.description" class="repo-description">{{ repo.description }}</p>
                  <div class="repo-meta">
                    <span class="repo-language" *ngIf="repo.language">
                      <mat-icon>code</mat-icon>
                      {{ repo.language }}
                    </span>
                    <span class="repo-stats" *ngIf="repo.stargazers_count !== undefined">
                      <mat-icon>star</mat-icon>
                      {{ repo.stargazers_count }}
                    </span>
                    <span class="repo-stats" *ngIf="repo.forks_count !== undefined">
                      <mat-icon>call_split</mat-icon>
                      {{ repo.forks_count }}
                    </span>
                  </div>
                  <a [href]="repo.html_url" target="_blank" class="repo-link">
                    <mat-icon>open_in_new</mat-icon>
                    View Repository
                  </a>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .dashboard-header h1 {
      margin: 0;
      color: #333;
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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 32px;
      font-weight: bold;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      opacity: 0.9;
    }

    .activity-section,
    .organizations-section,
    .repositories-section {
      margin-bottom: 24px;
    }

    .no-activity,
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-activity mat-icon,
    .no-data mat-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .organizations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .org-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: box-shadow 0.2s;
    }

    .org-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .org-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }

    .org-info h4 {
      margin: 0 0 4px 0;
    }

    .org-info p {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 14px;
    }

    .org-link {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #2196f3;
      text-decoration: none;
      font-size: 14px;
    }

    .repositories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
    }

    .repo-card {
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      transition: box-shadow 0.2s;
    }

    .repo-card:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .repo-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .repo-header h4 {
      margin: 0;
      color: #333;
    }

    .repo-description {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
      line-height: 1.4;
    }

    .repo-meta {
      display: flex;
      gap: 16px;
      margin-bottom: 12px;
    }

    .repo-language,
    .repo-stats {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #666;
    }

    .repo-language mat-icon,
    .repo-stats mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .repo-link {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #2196f3;
      text-decoration: none;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .organizations-grid,
      .repositories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  isSyncing = false;
  stats: DashboardStats = {
    totalOrganizations: 0,
    totalRepositories: 0,
    totalCommits: 0,
    recentActivity: []
  };
  organizations: Organization[] = [];
  repositories: Repository[] = [];
  orgRepos: { [orgId: string]: Repository[] } = {};
  repoCommits: { [repoId: string]: Commit[] } = {};

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load organizations
    this.http.get<any>(`${environment.apiUrl}/organizations?page=1&limit=5`).subscribe({
      next: (response) => {
        if (response.success) {
          this.organizations = response.data.organizations || [];
          this.stats.totalOrganizations = response.data.pagination?.total || 0;
        }
      },
      error: (error) => {
        console.error('Error loading organizations:', error);
      }
    });

    // Load repositories
    this.http.get<any>(`${environment.apiUrl}/repositories?page=1&limit=5`).subscribe({
      next: (response) => {
        if (response.success) {
          this.repositories = response.data || [];
          this.stats.totalRepositories = response.pagination?.total || 0;
        }
      },
      error: (error) => {
        console.error('Error loading repositories:', error);
      }
    });

    // Load commits for stats
    this.http.get<any>(`${environment.apiUrl}/commits?page=1&limit=1`).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.totalCommits = response.pagination?.total || 0;
        }
      },
      error: (error) => {
        console.error('Error loading commits:', error);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  syncData(): void {
    this.isSyncing = true;
    
    // Sync organizations
    this.http.post<any>(`${environment.apiUrl}/organizations/sync`, {}).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Organizations synced successfully', 'Close', {
            duration: 3000
          });
          this.loadDashboardData();
        }
      },
      error: (error) => {
        console.error('Error syncing organizations:', error);
        this.snackBar.open('Failed to sync organizations', 'Close', {
          duration: 5000
        });
      },
      complete: () => {
        this.isSyncing = false;
      }
    });
  }

  syncOrganizations(): void {
    this.isSyncing = true;
    this.http.post<any>(`${environment.apiUrl}/organizations/sync`, {}).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Organizations synced successfully', 'Close', {
            duration: 3000
          });
          this.loadDashboardData();
        }
      },
      error: (error) => {
        console.error('Error syncing organizations:', error);
        this.snackBar.open('Failed to sync organizations', 'Close', {
          duration: 5000
        });
      },
      complete: () => {
        this.isSyncing = false;
      }
    });
  }

  syncRepositories(org: Organization): void {
    this.isSyncing = true;
    this.http.post<any>(`${environment.apiUrl}/repositories/sync`, { organization_id: org._id }).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Repositories synced successfully', 'Close', { duration: 3000 });
          this.fetchRepositoriesForOrg(org);
        }
      },
      error: (error) => {
        console.error('Error syncing repositories:', error);
        this.snackBar.open('Failed to sync repositories', 'Close', { duration: 5000 });
      },
      complete: () => {
        this.isSyncing = false;
      }
    });
  }
  fetchRepositoriesForOrg(org: Organization): void {
    this.http.get<any>(`${environment.apiUrl}/repositories?organization_id=${org._id}&page=1&limit=10`).subscribe({
      next: (response) => {
        if (response.success) {
          this.orgRepos[org._id] = response.data.repositories || response.data || [];
        }
      },
      error: (error) => {
        console.error('Error fetching repositories:', error);
      }
    });
  }
  syncCommits(repo: Repository): void {
    this.isSyncing = true;
    this.http.post<any>(`${environment.apiUrl}/commits/sync/${repo._id}`, {}).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Commits synced successfully', 'Close', { duration: 3000 });
          this.fetchCommitsForRepo(repo);
        }
      },
      error: (error) => {
        console.error('Error syncing commits:', error);
        this.snackBar.open('Failed to sync commits', 'Close', { duration: 5000 });
      },
      complete: () => {
        this.isSyncing = false;
      }
    });
  }
  fetchCommitsForRepo(repo: Repository): void {
    this.http.get<any>(`${environment.apiUrl}/commits?repository_id=${repo._id}&page=1&limit=10`).subscribe({
      next: (response) => {
        if (response.success) {
          this.repoCommits[repo._id] = response.data.commits || [];
        }
      },
      error: (error) => {
        console.error('Error fetching commits:', error);
      }
    });
  }
} 