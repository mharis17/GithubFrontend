import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="callback-container">
      <mat-card class="callback-card">
        <mat-card-content>
          <div class="callback-content">
            <mat-spinner *ngIf="loading"></mat-spinner>
            
            <div *ngIf="!loading">
              <mat-icon class="status-icon" [class.success]="!error" [class.error]="error">
                {{ !error ? 'check_circle' : 'error' }}
              </mat-icon>
              
              <h2>{{ !error ? 'Authentication Successful' : 'Authentication Failed' }}</h2>
              
              <p *ngIf="!error">
                Your GitHub account has been successfully connected. You will be redirected shortly.
              </p>
              
              <p *ngIf="error">
                {{ errorMessage || 'An error occurred during authentication. Please try again.' }}
              </p>
              
              <button mat-raised-button color="primary" (click)="goHome()">
                Go to Home
              </button>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 20px;
    }
    .callback-card { max-width: 400px; width: 100%; }
    .callback-content { text-align: center; padding: 40px 20px; }
    .status-icon { font-size: 64px; margin-bottom: 24px; }
    .status-icon.success { color: #4caf50; }
    .status-icon.error { color: #f44336; }
    h2 { margin: 0 0 16px 0; color: #333; }
    p { margin: 0 0 24px 0; color: #666; line-height: 1.5; }
    mat-spinner { margin: 0 auto 24px auto; }
  `]
})
export class CallbackComponent implements OnInit {
  loading = true;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Always check auth status after callback
    this.authService.checkAuthStatus();
    this.authService.authenticated$.pipe(take(1)).subscribe(isAuth => {
      this.loading = false;
      if (isAuth) {
        this.error = false;
        setTimeout(() => {
          this.router.navigate(['/github-integration']);
        }, 1500);
      } else {
        this.error = true;
        this.errorMessage = 'Authentication failed or not connected.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    });
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
} 