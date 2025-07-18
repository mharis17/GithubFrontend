import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { OrganizationService } from '../../core/services/organization.service';
import { RepositoryService } from '../../core/services/repository.service';
import { CommitService } from '../../core/services/commit.service';
import { PullRequestService, PullRequest } from '../../core/services/pull-request.service';
import { IssueService, Issue, IssueSyncStatus } from '../../core/services/issue.service';
import { GitHubUserService, GitHubUser } from '../../core/services/github-user.service';

interface Organization {
  _id: string;
  github_id: number;
  login: string;
  name: string;
  description: string;
  avatar_url: string;
  html_url: string;
  created_at: string;
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
  created_at_db: string;
}

interface IntegrationStats {
  organizations: {
    total: number;
    recent: Organization[];
  };
  repositories: {
    total: number;
    recent: Repository[];
  };
  commits: {
    total: number;
    recent: Commit[];
  };
  pullRequests: {
    total: number;
    recent: PullRequest[];
  };
  issues: {
    total: number;
    recent: Issue[];
    syncStatus: IssueSyncStatus[];
  };
  githubUsers: {
    total: number;
    recent: GitHubUser[];
  };
  integration: {
    status: string;
    connectedAt: string;
    username: string;
  };
}

@Component({
  selector: 'app-github-integration',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatChipsModule,
    MatDividerModule,
    MatListModule,
    MatBadgeModule
  ],
  template: `
    <div class="integration-container">
      <!-- Header -->
      <div class="page-header">
        <h1>
          <mat-icon>dashboard</mat-icon>
          GitHub Integration Overview
        </h1>
        <p>Monitor your GitHub data and manage your integration</p>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="60"></mat-spinner>
        <p>Loading your GitHub data...</p>
      </div>

      <!-- Not Connected State -->
      <div *ngIf="!loading && !user" class="not-connected-state">
        <mat-card class="connect-card">
          <mat-card-content>
            <div class="connect-content">
              <mat-icon class="connect-icon">link_off</mat-icon>
              <h2>Connect Your GitHub Account</h2>
              <p>Connect your GitHub account to start tracking your repositories, organizations, and commits.</p>
              
              <div class="features-grid">
                <div class="feature-item">
                  <mat-icon>business</mat-icon>
                  <h4>Organizations</h4>
                  <p>Track your GitHub organizations</p>
                </div>
                <div class="feature-item">
                  <mat-icon>folder</mat-icon>
                  <h4>Repositories</h4>
                  <p>Monitor your repositories</p>
                </div>
                <div class="feature-item">
                  <mat-icon>commit</mat-icon>
                  <h4>Commits</h4>
                  <p>View commit history</p>
                </div>
              </div>

              <button mat-raised-button color="primary" class="connect-button" (click)="connectGitHub()">
                <mat-icon>link</mat-icon>
                Connect with GitHub
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Connected State with Statistics -->
      <div *ngIf="!loading && user" class="connected-state">
        <!-- Integration Status Card -->
        <mat-card class="status-card">
          <mat-card-content>
            <div class="status-content">
              <div class="status-info">
                <mat-icon class="status-icon connected">check_circle</mat-icon>
                <div>
                  <h2>Connected to GitHub</h2>
                  <p>{{ user.username }} • Connected since {{ user.connected_at | date:'mediumDate' }}</p>
                  <mat-chip color="success" variant="outlined">{{ user.status }}</mat-chip>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Statistics Cards -->
        <div class="stats-grid">
          <mat-card class="stat-card organizations">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>business</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.organizations.total }}</h3>
                  <p>Organizations</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card repositories">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>folder</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.repositories.total }}</h3>
                  <p>Repositories</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card commits">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>commit</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.commits.total }}</h3>
                  <p>Commits</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card integration">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>integration_instructions</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ user.status | titlecase }}</h3>
                  <p>Integration</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card pull-requests">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>merge</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.pullRequests.total }}</h3>
                  <p>Pull Requests</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card issues">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>bug_report</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.issues.total }}</h3>
                  <p>Issues</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card users">
            <mat-card-content>
              <div class="stat-content">
                <div class="stat-icon">
                  <mat-icon>people</mat-icon>
                </div>
                <div class="stat-info">
                  <h3>{{ stats.githubUsers.total }}</h3>
                  <p>GitHub Users</p>
                </div>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Sync Actions -->
        <mat-card class="sync-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>sync</mat-icon>
              Data Synchronization
            </mat-card-title>
            <mat-card-subtitle>Keep your data up-to-date</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
                          <div class="sync-buttons">
                <button mat-raised-button color="primary" (click)="syncOrganizations()" [disabled]="syncing">
                  <mat-icon>sync</mat-icon>
                  {{ syncing ? 'Syncing...' : 'Sync Organizations' }}
                </button>
                
                <button mat-raised-button color="primary" (click)="syncRepositories()" [disabled]="syncing">
                  <mat-icon>sync</mat-icon>
                  {{ syncing ? 'Syncing...' : 'Sync Repositories' }}
                </button>
                
                <button mat-raised-button color="primary" (click)="syncCommits()" [disabled]="syncing">
                  <mat-icon>sync</mat-icon>
                  {{ syncing ? 'Syncing...' : 'Sync Commits' }}
                </button>

                <button mat-raised-button color="primary" (click)="syncPullRequests()" [disabled]="syncing">
                  <mat-icon>sync</mat-icon>
                  {{ syncing ? 'Syncing...' : 'Sync Pull Requests' }}
                </button>

                <button mat-raised-button color="primary" (click)="syncIssues()" [disabled]="syncing">
                  <mat-icon>sync</mat-icon>
                  {{ syncing ? 'Syncing...' : 'Sync Issues' }}
                </button>

                <button mat-raised-button color="primary" (click)="syncGitHubUsers()" [disabled]="syncing">
                  <mat-icon>sync</mat-icon>
                  {{ syncing ? 'Syncing...' : 'Sync GitHub Users' }}
                </button>
              </div>
          </mat-card-content>
        </mat-card>

        <!-- Recent Data Sections -->
        <div class="data-sections">
          <!-- Recent Organizations -->
          <mat-card class="data-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>business</mat-icon>
                Recent Organizations
              </mat-card-title>
              <mat-card-subtitle>{{ stats.organizations.total }} total organizations</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="stats.organizations.recent.length === 0" class="no-data">
                <mat-icon>info</mat-icon>
                <p>No organizations found. Try syncing your data!</p>
              </div>
              <mat-list *ngIf="stats.organizations.recent.length > 0">
                <mat-list-item *ngFor="let org of stats.organizations.recent">
                  <img matListItemAvatar [src]="org.avatar_url" [alt]="org.name" class="org-avatar">
                  <div matListItemTitle>{{ org.name || org.login }}</div>
                  <div matListItemLine>{{ org.description || 'No description' }}</div>
                  <div matListItemMeta>
                    <a [href]="org.html_url" target="_blank" mat-icon-button>
                      <mat-icon>open_in_new</mat-icon>
                    </a>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Recent Repositories -->
          <mat-card class="data-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>folder</mat-icon>
                Recent Repositories
              </mat-card-title>
              <mat-card-subtitle>{{ stats.repositories.total }} total repositories</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="stats.repositories.recent.length === 0" class="no-data">
                <mat-icon>info</mat-icon>
                <p>No repositories found. Try syncing your data!</p>
              </div>
              <mat-list *ngIf="stats.repositories.recent.length > 0">
                <mat-list-item *ngFor="let repo of stats.repositories.recent">
                  <mat-icon matListItemIcon>folder</mat-icon>
                  <div matListItemTitle>{{ repo.name }}</div>
                  <div matListItemLine>{{ repo.description || 'No description' }}</div>
                  <div matListItemMeta>
                    <mat-chip *ngIf="repo.private" color="warn" variant="outlined" size="small">Private</mat-chip>
                    <a [href]="repo.html_url" target="_blank" mat-icon-button>
                      <mat-icon>open_in_new</mat-icon>
                    </a>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Recent Commits -->
          <mat-card class="data-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>commit</mat-icon>
                Recent Commits
              </mat-card-title>
              <mat-card-subtitle>{{ stats.commits.total }} total commits</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="stats.commits.recent.length === 0" class="no-data">
                <mat-icon>info</mat-icon>
                <p>No commits found. Try syncing your data!</p>
              </div>
              <mat-list *ngIf="stats.commits.recent.length > 0">
                <mat-list-item *ngFor="let commit of stats.commits.recent">
                  <mat-icon matListItemIcon>commit</mat-icon>
                  <div matListItemTitle>{{ commit.message }}</div>
                  <div matListItemLine>
                    {{ commit.author.name }} • {{ commit.repository_name }} • {{ commit.created_at_db | date:'short' }}
                  </div>
                  <div matListItemMeta>
                    <mat-chip size="small" variant="outlined">{{ commit.sha | slice:0:7 }}</mat-chip>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Recent Pull Requests -->
          <mat-card class="data-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>merge</mat-icon>
                Recent Pull Requests
              </mat-card-title>
              <mat-card-subtitle>{{ stats.pullRequests.total }} total pull requests</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="stats.pullRequests.recent.length === 0" class="no-data">
                <mat-icon>info</mat-icon>
                <p>No pull requests found. Try syncing your data!</p>
              </div>
              <mat-list *ngIf="stats.pullRequests.recent.length > 0">
                <mat-list-item *ngFor="let pr of stats.pullRequests.recent">
                  <img matListItemAvatar [src]="pr.user.avatar_url" [alt]="pr.user.login" class="user-avatar">
                  <div matListItemTitle>{{ pr.title }}</div>
                  <div matListItemLine>
                    #{{ pr.number }} • {{ pr.user.login }} • {{ pr.repository_name }} • {{ pr.state }}
                  </div>
                  <div matListItemMeta>
                    <mat-chip [color]="pr.state === 'open' ? 'primary' : pr.state === 'closed' ? 'warn' : 'accent'" 
                             variant="outlined" size="small">{{ pr.state }}</mat-chip>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>

          <!-- Recent Issues -->
          <mat-card class="data-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>bug_report</mat-icon>
                Recent Issues
              </mat-card-title>
              <mat-card-subtitle>{{ stats.issues.total }} total issues</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="stats.issues.recent.length === 0" class="no-data">
                <mat-icon>info</mat-icon>
                <p>No issues found. Try syncing your data!</p>
              </div>
              <mat-list *ngIf="stats.issues.recent.length > 0">
                <mat-list-item *ngFor="let issue of stats.issues.recent">
                  <img matListItemAvatar [src]="issue.user.avatar_url" [alt]="issue.user.login" class="user-avatar">
                  <div matListItemTitle>{{ issue.title }}</div>
                  <div matListItemLine>
                    #{{ issue.number }} • {{ issue.user.login }} • {{ issue.repository_name }} • {{ issue.state }}
                  </div>
                  <div matListItemMeta>
                    <mat-chip [color]="issue.state === 'open' ? 'primary' : 'warn'" 
                             variant="outlined" size="small">{{ issue.state }}</mat-chip>
                  </div>
                </mat-list-item>
              </mat-list>

              <!-- Sync Status Section -->
              <div *ngIf="stats.issues.syncStatus.length > 0" class="sync-status-section">
                <mat-divider></mat-divider>
                <div class="sync-status-header">
                  <h4>Repository Sync Status</h4>
                  <p>{{ getRepositoriesNeedingSync() }} repositories need syncing</p>
                </div>
                <div class="sync-status-grid">
                  <div *ngFor="let status of stats.issues.syncStatus" 
                       class="sync-status-item"
                       [class.needs-sync]="status.needs_sync"
                       [class.synced]="!status.needs_sync">
                    <div class="status-info">
                      <div class="repo-name">{{ status.repository_name }}</div>
                      <div class="repo-full-name">{{ status.full_name }}</div>
                      <div class="issue-count">
                        <mat-icon>bug_report</mat-icon>
                        {{ status.issue_count }} issues
                      </div>
                    </div>
                    <div class="status-indicator">
                      <button *ngIf="status.needs_sync" mat-stroked-button color="primary" [disabled]="syncingRepoId === status.repository_id" (click)="syncIssuesForRepo(status.repository_id)">
                        <mat-icon *ngIf="syncingRepoId !== status.repository_id">sync</mat-icon>
                        <mat-spinner *ngIf="syncingRepoId === status.repository_id" diameter="20" strokeWidth="3"></mat-spinner>
                        {{ syncingRepoId === status.repository_id ? 'Syncing...' : 'Sync Issues' }}
                      </button>
                      <mat-chip *ngIf="!status.needs_sync" color="success" variant="outlined" size="small">
                        <mat-icon>check_circle</mat-icon>
                        Synced
                      </mat-chip>
                    </div>
                  </div>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Recent GitHub Users -->
          <mat-card class="data-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>people</mat-icon>
                Recent GitHub Users
              </mat-card-title>
              <mat-card-subtitle>{{ stats.githubUsers.total }} total users</mat-card-subtitle>
            </mat-card-header>
            <mat-card-content>
              <div *ngIf="stats.githubUsers.recent.length === 0" class="no-data">
                <mat-icon>info</mat-icon>
                <p>No GitHub users found. Try syncing your data!</p>
              </div>
              <mat-list *ngIf="stats.githubUsers.recent.length > 0">
                <mat-list-item *ngFor="let user of stats.githubUsers.recent">
                  <img matListItemAvatar [src]="user.avatar_url" [alt]="user.login" class="user-avatar">
                  <div matListItemTitle>{{ user.name || user.login }}</div>
                  <div matListItemLine>
                    {{ '@' + user.login }} • {{ user.public_repos }} repos • {{ user.followers }} followers
                  </div>
                  <div matListItemMeta>
                    <a [href]="user.html_url" target="_blank" mat-icon-button>
                      <mat-icon>open_in_new</mat-icon>
                    </a>
                  </div>
                </mat-list-item>
              </mat-list>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Management Panel -->
        <mat-expansion-panel class="management-panel">
          <mat-expansion-panel-header>
            <mat-panel-title>
              <mat-icon>settings</mat-icon>
              Integration Management
            </mat-panel-title>
            <mat-panel-description>
              Advanced integration options
            </mat-panel-description>
          </mat-expansion-panel-header>

          <div class="management-options">
            <div class="option-group">
              <h4>Integration Actions</h4>
              <p>Manage your GitHub connection</p>
              
              <div class="action-buttons">
                <button mat-raised-button color="warn" (click)="removeIntegration()" [disabled]="removing">
                  <mat-icon>delete</mat-icon>
                  {{ removing ? 'Removing...' : 'Remove Integration' }}
                </button>
                
                <button mat-raised-button color="accent" (click)="resyncIntegration()" [disabled]="syncing">
                  <mat-icon>refresh</mat-icon>
                  {{ syncing ? 'Re-syncing...' : 'Re-sync All Data' }}
                </button>
              </div>
            </div>
          </div>
        </mat-expansion-panel>
      </div>
    </div>
  `,
  styles: [`
    .integration-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .page-header h1 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      margin: 0 0 8px 0;
      color: #333;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .page-header p {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }

    .loading-container p {
      margin-top: 16px;
      color: #666;
      font-size: 1.1rem;
    }

    .not-connected-state {
      max-width: 600px;
      margin: 0 auto;
    }

    .connect-card {
      text-align: center;
      padding: 40px 20px;
    }

    .connect-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .connect-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .connect-content h2 {
      margin: 0 0 16px 0;
      color: #333;
    }

    .connect-content p {
      margin: 0 0 32px 0;
      color: #666;
      max-width: 400px;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
      width: 100%;
    }

    .feature-item {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      border: 1px solid #e9ecef;
    }

    .feature-item mat-icon {
      font-size: 32px;
      color: #2196f3;
      margin-bottom: 8px;
    }

    .feature-item h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .feature-item p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .connect-button {
      font-size: 16px;
      padding: 12px 24px;
    }

    .connected-state {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .status-card {
      background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
      color: white;
    }

    .status-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .status-info {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-icon {
      font-size: 48px;
    }

    .status-info h2 {
      margin: 0 0 4px 0;
      font-size: 1.8rem;
    }

    .status-info p {
      margin: 0 0 8px 0;
      opacity: 0.9;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .stat-card {
      transition: transform 0.2s ease-in-out;
    }

    .stat-card:hover {
      transform: translateY(-4px);
    }

    .stat-card.organizations {
      background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
      color: white;
    }

    .stat-card.repositories {
      background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
      color: white;
    }

    .stat-card.commits {
      background: linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%);
      color: white;
    }

    .stat-card.integration {
      background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
      color: white;
    }

    .stat-card.pull-requests {
      background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%);
      color: white;
    }

    .stat-card.issues {
      background: linear-gradient(135deg, #ff5722 0%, #d84315 100%);
      color: white;
    }

    .stat-card.users {
      background: linear-gradient(135deg, #673ab7 0%, #512da8 100%);
      color: white;
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: bold;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    .sync-card {
      margin-bottom: 24px;
    }

    .sync-card mat-card-header {
      margin-bottom: 16px;
    }

    .sync-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .sync-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .data-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
    }

    .data-card {
      height: fit-content;
    }

    .data-card mat-card-header {
      margin-bottom: 16px;
    }

    .data-card mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 20px;
      color: #666;
    }

    .no-data mat-icon {
      font-size: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .org-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
    }

    .sync-status-section {
      margin-top: 20px;
    }

    .sync-status-header {
      margin: 16px 0;
    }

    .sync-status-header h4 {
      margin: 0 0 8px 0;
      color: #333;
      font-size: 1.1rem;
    }

    .sync-status-header p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .sync-status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 12px;
    }

    .sync-status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #e0e0e0;
      background: #fafafa;
      transition: all 0.2s ease;
    }

    .sync-status-item.needs-sync {
      border-color: #ff9800;
      background: #fff3e0;
    }

    .sync-status-item.synced {
      border-color: #4caf50;
      background: #e8f5e8;
    }

    .status-info {
      flex: 1;
    }

    .repo-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .repo-full-name {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 4px;
    }

    .issue-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: #666;
    }

    .issue-count mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .status-indicator {
      margin-left: 12px;
    }

    .management-panel {
      margin-top: 24px;
    }

    .management-options {
      padding: 16px 0;
    }

    .option-group h4 {
      margin: 0 0 8px 0;
      color: #333;
    }

    .option-group p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 768px) {
      .integration-container {
        padding: 10px;
      }

      .page-header h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      }

      .data-sections {
        grid-template-columns: 1fr;
      }

      .sync-buttons, .action-buttons {
        flex-direction: column;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class GitHubIntegrationComponent implements OnInit {
  loading = true;
  syncing = false;
  removing = false;
  user: AuthUser | null = null;
  syncingRepoId: string | null = null;
  stats: IntegrationStats = {
    organizations: { total: 0, recent: [] },
    repositories: { total: 0, recent: [] },
    commits: { total: 0, recent: [] },
    pullRequests: { total: 0, recent: [] },
    issues: { total: 0, recent: [], syncStatus: [] },
    githubUsers: { total: 0, recent: [] },
    integration: { status: '', connectedAt: '', username: '' }
  };

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private repositoryService: RepositoryService,
    private commitService: CommitService,
    private pullRequestService: PullRequestService,
    private issueService: IssueService,
    private githubUserService: GitHubUserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkIntegrationStatus();
  }

  checkIntegrationStatus(): void {
    this.loading = true;
    this.authService.user$.subscribe(user => {
      this.user = user;
      if (user) {
        this.loadAllStatistics();
      } else {
        this.loading = false;
      }
    });
  }

  loadAllStatistics(): void {
    this.loading = true;
    
    // Load organizations
    this.organizationService.getOrganizations(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.organizations.total = response.data.pagination?.total || 0;
          this.stats.organizations.recent = response.data.organizations || [];
        }
      },
      error: (error) => console.error('Error loading organizations:', error)
    });

    // Load repositories
    this.repositoryService.getRepositories(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.repositories.total = response.data.pagination?.total || 0;
          this.stats.repositories.recent = response.data.repositories || [];
        }
      },
      error: (error) => console.error('Error loading repositories:', error)
    });

    // Load commits
    this.commitService.getCommits(1, 10).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.commits.total = response.data.pagination?.total || 0;
          this.stats.commits.recent = response.data.commits || [];
        }
      },
      error: (error) => console.error('Error loading commits:', error)
    });

    // Load pull requests
    this.pullRequestService.getPullRequests(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.pullRequests.total = response.data.pagination?.total || 0;
          this.stats.pullRequests.recent = response.data.pullRequests || [];
        }
      },
      error: (error) => console.error('Error loading pull requests:', error)
    });

    // Load issues
    this.issueService.getIssues(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.issues.total = response.data.pagination?.total || 0;
          this.stats.issues.recent = response.data.issues || [];
        }
      },
      error: (error) => console.error('Error loading issues:', error)
    });

    // Load issues sync status
    this.issueService.getSyncStatus().subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.issues.syncStatus = response.data.syncStatus || [];
        }
      },
      error: (error) => console.error('Error loading issues sync status:', error)
    });

    // Load GitHub users
    this.githubUserService.getGitHubUsers(1, 5).subscribe({
      next: (response) => {
        if (response.success) {
          this.stats.githubUsers.total = response.data.pagination?.total || 0;
          this.stats.githubUsers.recent = response.data.githubUsers || [];
        }
      },
      error: (error) => console.error('Error loading GitHub users:', error),
      complete: () => {
        this.loading = false;
      }
    });
  }

  connectGitHub(): void {
    this.authService.initiateGitHubAuth();
  }

  syncOrganizations(): void {
    this.syncing = true;
    this.organizationService.syncOrganizations().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Organizations synced successfully', 'Close', { duration: 3000 });
          this.loadAllStatistics();
        } else {
          this.snackBar.open(response.message || 'Failed to sync organizations', 'Close', { duration: 4000 });
        }
      },
      error: (error) => {
        console.error('Error syncing organizations:', error);
        this.snackBar.open('Error syncing organizations', 'Close', { duration: 4000 });
      },
      complete: () => {
        this.syncing = false;
      }
    });
  }

  syncRepositories(): void {
    this.syncing = true;
    this.repositoryService.syncRepositories().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Repositories synced successfully', 'Close', { duration: 3000 });
          this.loadAllStatistics();
        } else {
          this.snackBar.open(response.message || 'Failed to sync repositories', 'Close', { duration: 4000 });
        }
      },
      error: (error) => {
        console.error('Error syncing repositories:', error);
        this.snackBar.open('Error syncing repositories', 'Close', { duration: 4000 });
      },
      complete: () => {
        this.syncing = false;
      }
    });
  }

  syncCommits(): void {
    this.syncing = true;
    // Note: This would need to be implemented based on your API structure
    this.snackBar.open('Commits sync functionality to be implemented', 'Close', { duration: 3000 });
    this.syncing = false;
  }

  syncPullRequests(): void {
    this.syncing = true;
    this.pullRequestService.syncPullRequests().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Pull requests synced successfully', 'Close', { duration: 3000 });
          this.loadAllStatistics();
        } else {
          this.snackBar.open(response.message || 'Failed to sync pull requests', 'Close', { duration: 4000 });
        }
      },
      error: (error) => {
        console.error('Error syncing pull requests:', error);
        this.snackBar.open('Error syncing pull requests', 'Close', { duration: 4000 });
      },
      complete: () => {
        this.syncing = false;
      }
    });
  }

  syncIssues(): void {
    this.syncing = true;
    this.issueService.syncIssues().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Issues synced successfully', 'Close', { duration: 3000 });
          // Refresh both issues and sync status
          this.loadAllStatistics();
        } else {
          this.snackBar.open(response.message || 'Failed to sync issues', 'Close', { duration: 4000 });
        }
      },
      error: (error) => {
        console.error('Error syncing issues:', error);
        this.snackBar.open('Error syncing issues', 'Close', { duration: 4000 });
      },
      complete: () => {
        this.syncing = false;
      }
    });
  }

  syncGitHubUsers(): void {
    this.syncing = true;
    this.githubUserService.syncGitHubUsers().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('GitHub users synced successfully', 'Close', { duration: 3000 });
          this.loadAllStatistics();
        } else {
          this.snackBar.open(response.message || 'Failed to sync GitHub users', 'Close', { duration: 4000 });
        }
      },
      error: (error) => {
        console.error('Error syncing GitHub users:', error);
        this.snackBar.open('Error syncing GitHub users', 'Close', { duration: 4000 });
      },
      complete: () => {
        this.syncing = false;
      }
    });
  }

  getRepositoriesNeedingSync(): number {
    return this.stats.issues.syncStatus?.filter(s => s.needs_sync).length || 0;
  }

  removeIntegration(): void {
    this.removing = true;
    this.authService.logout().subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Integration removed successfully', 'Close', { duration: 3000 });
          this.user = null;
        } else {
          this.snackBar.open(response.message || 'Failed to remove integration', 'Close', { duration: 4000 });
        }
      },
      error: (error) => {
        console.error('Error removing integration:', error);
        this.snackBar.open('Error removing integration', 'Close', { duration: 4000 });
      },
      complete: () => {
        this.removing = false;
      }
    });
  }

  resyncIntegration(): void {
    this.syncing = true;
    // Re-sync all data
    this.organizationService.syncOrganizations().subscribe({
      next: (orgResponse) => {
        if (orgResponse.success) {
          this.repositoryService.syncRepositories().subscribe({
            next: (repoResponse) => {
              if (repoResponse.success) {
                this.snackBar.open('Integration re-synced successfully', 'Close', { duration: 3000 });
                this.loadAllStatistics();
              } else {
                this.snackBar.open('Failed to sync repositories', 'Close', { duration: 4000 });
              }
            },
            error: (error) => {
              console.error('Error syncing repositories:', error);
              this.snackBar.open('Error syncing repositories', 'Close', { duration: 4000 });
            },
            complete: () => {
              this.syncing = false;
            }
          });
        } else {
          this.snackBar.open('Failed to sync organizations', 'Close', { duration: 4000 });
          this.syncing = false;
        }
      },
      error: (error) => {
        console.error('Error syncing organizations:', error);
        this.snackBar.open('Error syncing organizations', 'Close', { duration: 4000 });
        this.syncing = false;
      }
    });
  }

  syncIssuesForRepo(repositoryId: string): void {
    this.syncingRepoId = repositoryId;
    this.issueService.syncIssuesForRepo(repositoryId).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Issues synced for repository!', 'Close', { duration: 3000 });
          this.loadAllStatistics();
        } else {
          this.snackBar.open(response.message || 'Failed to sync issues for repository', 'Close', { duration: 4000 });
        }
      },
      error: (error) => {
        console.error('Error syncing issues for repository:', error);
        this.snackBar.open('Error syncing issues for repository', 'Close', { duration: 4000 });
      },
      complete: () => {
        this.syncingRepoId = null;
      }
    });
  }
} 