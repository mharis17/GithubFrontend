import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  connected: boolean;
  username: string;
  display_name: string | null;
  connected_at: string;
  status: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<AuthUser | null>(null);
  public user$ = this.userSubject.asObservable();
  private authenticatedSubject = new BehaviorSubject<boolean>(false);
  public authenticated$ = this.authenticatedSubject.asObservable();

  constructor(private apiService: ApiService, private router: Router) {
    this.checkAuthStatus();
  }

  /**
   * Call /api/auth/status and update state
   */
  checkAuthStatus(): void {
    this.apiService.get<any>('/auth/status').subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.connected) {
          this.userSubject.next(res.data);
          this.authenticatedSubject.next(true);
        } else {
          this.userSubject.next(null);
          this.authenticatedSubject.next(false);
        }
      },
      error: () => {
        this.userSubject.next(null);
        this.authenticatedSubject.next(false);
      }
    });
  }

  /**
   * Simple check and redirect for login page
   */
  checkAuthStatusAndRedirect(router: Router) {
    this.apiService.get<any>('/auth/status').subscribe(res => {
      if (res.success && res.data && res.data.connected) {
        router.navigate(['/dashboard']);
      }
    });
  }

  /**
   * Initiate GitHub OAuth
   */
  initiateGitHubAuth(): void {
    window.location.href = environment.githubAuthUrl;
  }

  /**
   * Logout and clear state
   */
  logout(): Observable<any> {
    return this.apiService.delete('/auth/remove');
  }

  /**
   * Get current user info
   */
  getCurrentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  /**
   * Is user authenticated?
   */
  isAuthenticated(): boolean {
    return this.authenticatedSubject.value;
  }

  /**
   * Handle OAuth callback (after redirect)
   */
  handleOAuthCallback(): void {
    this.checkAuthStatus();
    // Redirect will be handled in the callback component
  }
} 