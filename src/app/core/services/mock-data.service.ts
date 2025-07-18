import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { GitHubIntegration } from '../models/github.interface';
import { ApiResponse } from '../models/api.interface';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private currentIntegrationSubject = new BehaviorSubject<GitHubIntegration | null>(null);
  public currentIntegration$ = this.currentIntegrationSubject.asObservable();

  // Dummy GitHub user data
  private dummyUser = {
    id: 123456,
    login: 'johndoe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
    public_repos: 25,
    followers: 150,
    following: 75,
    created_at: '2020-01-15T10:30:00Z',
    updated_at: '2024-01-15T14:20:00Z'
  };

  // Dummy integration data
  private dummyIntegration: GitHubIntegration = {
    id: 'integration_123',
    userId: this.dummyUser.id,
    user: this.dummyUser,
    accessToken: 'dummy_token_12345',
    scope: 'repo user',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    lastSyncAt: '2024-01-15T14:20:00Z',
    status: 'active',
    organizations: [
      {
        id: 1,
        login: 'acme-corp',
        name: 'ACME Corporation',
        avatar_url: 'https://avatars.githubusercontent.com/u/123456?v=4',
        description: 'Leading technology company',
        public_repos: 15,
        private_repos: 8
      },
      {
        id: 2,
        login: 'open-source-org',
        name: 'Open Source Organization',
        avatar_url: 'https://avatars.githubusercontent.com/u/789012?v=4',
        description: 'Promoting open source software',
        public_repos: 45,
        private_repos: 2
      }
    ],
    repositories: [
      {
        id: 1,
        name: 'awesome-project',
        full_name: 'johndoe/awesome-project',
        description: 'An amazing project that does incredible things',
        private: false,
        fork: false,
        stargazers_count: 125,
        watchers_count: 125,
        language: 'TypeScript',
        updated_at: '2024-01-15T12:00:00Z',
        created_at: '2023-06-15T09:00:00Z',
        pushed_at: '2024-01-15T12:00:00Z',
        owner: this.dummyUser
      },
      {
        id: 2,
        name: 'react-app',
        full_name: 'johndoe/react-app',
        description: 'A modern React application',
        private: false,
        fork: true,
        stargazers_count: 45,
        watchers_count: 45,
        language: 'JavaScript',
        updated_at: '2024-01-14T16:30:00Z',
        created_at: '2023-08-20T11:00:00Z',
        pushed_at: '2024-01-14T16:30:00Z',
        owner: this.dummyUser
      },
      {
        id: 3,
        name: 'private-repo',
        full_name: 'johndoe/private-repo',
        description: 'Private repository for internal use',
        private: true,
        fork: false,
        stargazers_count: 0,
        watchers_count: 0,
        language: 'Python',
        updated_at: '2024-01-13T10:15:00Z',
        created_at: '2023-12-01T14:00:00Z',
        pushed_at: '2024-01-13T10:15:00Z',
        owner: this.dummyUser
      }
    ],
    commits: [
      {
        id: 'commit_1',
        sha: 'abc123def456',
        message: 'feat: Add new feature for user authentication',
        author: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          date: '2024-01-15T12:00:00Z'
        },
        committer: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          date: '2024-01-15T12:00:00Z'
        },
        repository: 'johndoe/awesome-project'
      },
      {
        id: 'commit_2',
        sha: 'def456ghi789',
        message: 'fix: Resolve bug in data processing',
        author: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          date: '2024-01-14T16:30:00Z'
        },
        committer: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          date: '2024-01-14T16:30:00Z'
        },
        repository: 'johndoe/react-app'
      }
    ],
    issues: [
      {
        id: 1,
        number: 15,
        title: 'Add dark mode support',
        body: 'We should add dark mode support to improve user experience',
        state: 'open',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        closed_at: null,
        user: this.dummyUser,
        repository: 'johndoe/awesome-project',
        labels: ['enhancement', 'ui']
      },
      {
        id: 2,
        number: 14,
        title: 'Fix login bug',
        body: 'Users are experiencing issues with the login process',
        state: 'closed',
        created_at: '2024-01-14T09:00:00Z',
        updated_at: '2024-01-15T11:00:00Z',
        closed_at: '2024-01-15T11:00:00Z',
        user: this.dummyUser,
        repository: 'johndoe/awesome-project',
        labels: ['bug', 'high-priority']
      }
    ],
    pullRequests: [
      {
        id: 1,
        number: 25,
        title: 'Implement new API endpoint',
        body: 'This PR adds a new API endpoint for user management',
        state: 'open',
        created_at: '2024-01-15T13:00:00Z',
        updated_at: '2024-01-15T13:00:00Z',
        closed_at: null,
        merged_at: null,
        user: this.dummyUser,
        repository: 'johndoe/awesome-project',
        labels: ['feature', 'api']
      }
    ]
  };

  constructor() {
    // Simulate loading stored integration
    this.loadStoredIntegration();
    
    // If no stored integration, set a default connected one for demo
    if (!this.currentIntegrationSubject.value) {
      setTimeout(() => {
        this.setCurrentIntegration(this.dummyIntegration);
      }, 1000);
    }
  }

  /**
   * Get current integration status
   */
  getIntegrationStatus(): Observable<ApiResponse<GitHubIntegration>> {
    return of({
      success: true,
      data: this.dummyIntegration,
      message: 'Integration status retrieved successfully'
    }).pipe(delay(500)); // Simulate network delay
  }

  /**
   * Initiate GitHub OAuth2 flow (mock)
   */
  initiateGitHubAuth(): void {
    // Simulate OAuth2 flow with a delay
    setTimeout(() => {
      this.setCurrentIntegration(this.dummyIntegration);
    }, 2000);
  }

  /**
   * Handle OAuth2 callback (mock)
   */
  handleCallback(code: string, state: string): Observable<ApiResponse<GitHubIntegration>> {
    return of({
      success: true,
      data: this.dummyIntegration,
      message: 'GitHub integration successful'
    }).pipe(delay(1000));
  }

  /**
   * Remove GitHub integration (mock)
   */
  removeIntegration(): Observable<ApiResponse<void>> {
    return of({
      success: true,
      data: undefined,
      message: 'Integration removed successfully'
    }).pipe(delay(800));
  }

  /**
   * Re-sync GitHub data (mock)
   */
  resyncData(): Observable<ApiResponse<void>> {
    return of({
      success: true,
      data: undefined,
      message: 'Data sync completed successfully'
    }).pipe(delay(2000));
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentIntegrationSubject.value !== null;
  }

  /**
   * Get current integration
   */
  getCurrentIntegration(): GitHubIntegration | null {
    return this.currentIntegrationSubject.value;
  }

  /**
   * Set current integration
   */
  private setCurrentIntegration(integration: GitHubIntegration): void {
    this.currentIntegrationSubject.next(integration);
    localStorage.setItem('github_integration', JSON.stringify(integration));
  }

  /**
   * Clear current integration
   */
  private clearCurrentIntegration(): void {
    this.currentIntegrationSubject.next(null);
    localStorage.removeItem('github_integration');
  }

  /**
   * Load stored integration from localStorage
   */
  private loadStoredIntegration(): void {
    const stored = localStorage.getItem('github_integration');
    if (stored) {
      try {
        const integration = JSON.parse(stored);
        this.currentIntegrationSubject.next(integration);
      } catch (error) {
        console.error('Error parsing stored integration:', error);
        localStorage.removeItem('github_integration');
      }
    }
  }

  /**
   * Get dummy repositories data
   */
  getRepositories(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.dummyIntegration.repositories,
      message: 'Repositories retrieved successfully'
    }).pipe(delay(300));
  }

  /**
   * Get dummy commits data
   */
  getCommits(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.dummyIntegration.commits,
      message: 'Commits retrieved successfully'
    }).pipe(delay(300));
  }

  /**
   * Get dummy issues data
   */
  getIssues(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.dummyIntegration.issues,
      message: 'Issues retrieved successfully'
    }).pipe(delay(300));
  }

  /**
   * Get dummy pull requests data
   */
  getPullRequests(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.dummyIntegration.pullRequests,
      message: 'Pull requests retrieved successfully'
    }).pipe(delay(300));
  }

  /**
   * Get dummy organizations data
   */
  getOrganizations(): Observable<ApiResponse<any[]>> {
    return of({
      success: true,
      data: this.dummyIntegration.organizations,
      message: 'Organizations retrieved successfully'
    }).pipe(delay(300));
  }
} 