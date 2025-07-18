import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule
  ],
  template: `
    <mat-toolbar color="primary">
      <span class="app-title">GitHub Integration App</span>
      <span class="spacer"></span>
      <button mat-icon-button routerLink="/github-integration" matTooltip="Dashboard">
        <mat-icon>dashboard</mat-icon>
      </button>
      <button mat-icon-button routerLink="/github-integration" matTooltip="GitHub Integration">
        <mat-icon>integration_instructions</mat-icon>
      </button>
      <button mat-icon-button routerLink="/raw-data" matTooltip="Data Viewer">
        <mat-icon>table_view</mat-icon>
      </button>
      <button mat-raised-button color="warn" class="disconnect-btn" (click)="disconnectIntegration()">
        <mat-icon>logout</mat-icon>
        Disconnect
      </button>
    </mat-toolbar>
  `,
  styles: [`
    .app-title {
      font-size: 1.2rem;
      font-weight: 500;
    }
    
    .spacer {
      flex: 1 1 auto;
    }
    
    mat-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    .disconnect-btn {
      margin-left: 16px;
      min-width: 100px;
      height: 40px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
  `]
})
export class HeaderComponent {
  constructor(private http: HttpClient, private snackBar: MatSnackBar) {}

  disconnectIntegration() {
    if (!confirm('Are you sure you want to disconnect your GitHub integration? This will log you out.')) return;
    this.http.delete(`${environment.backendUrl}/api/integrations/remove`).subscribe({
      next: () => {
        this.snackBar.open('Disconnected from GitHub. Logging out...', 'Close', { duration: 3000 });
        setTimeout(() => window.location.href = '/login', 1500);
      },
      error: (err) => {
        this.snackBar.open('Failed to disconnect. Please try again.', 'Close', { duration: 4000 });
        console.error('Disconnect error:', err);
      }
    });
  }
} 