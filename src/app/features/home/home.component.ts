import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <h1>GitHub Integration App</h1>
        <p class="hero-subtitle">
          Connect your GitHub account and explore your repositories, commits, and issues with powerful data visualization tools.
        </p>
        
        <div class="cta-buttons">
          <button mat-raised-button color="primary" size="large" routerLink="/github-integration">
            <mat-icon>link</mat-icon>
            Get Started
          </button>
          
          <button mat-stroked-button size="large" routerLink="/data-viewer" *ngIf="authService.isAuthenticated()">
            <mat-icon>table_chart</mat-icon>
            View Data
          </button>
        </div>
      </div>

      <div class="features-section">
        <h2>Features</h2>
        <div class="features-grid">
          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>integration_instructions</mat-icon>
              <mat-card-title>GitHub Integration</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Seamlessly connect your GitHub account using OAuth2 authentication. Sync repositories, organizations, and user data.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>table_chart</mat-icon>
              <mat-card-title>Data Viewer</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Explore your GitHub data with an advanced data grid. Filter, sort, and search across all collections with real-time updates.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>dashboard</mat-icon>
              <mat-card-title>Dashboard</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Get insights into your GitHub activity with comprehensive dashboards and analytics.</p>
            </mat-card-content>
          </mat-card>

          <mat-card class="feature-card">
            <mat-card-header>
              <mat-icon mat-card-avatar>sync</mat-icon>
              <mat-card-title>Real-time Sync</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Keep your data up-to-date with automatic synchronization and manual refresh capabilities.</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <div class="status-section" *ngIf="authService.isAuthenticated()">
        <h2>Integration Status</h2>
        <mat-card class="status-card">
          <mat-card-content>
            <div class="status-content">
              <mat-icon class="status-icon connected">check_circle</mat-icon>
              <div class="status-text">
                <h3>Connected to GitHub</h3>
                <p>Your GitHub account is connected and data is being synced.</p>
                <button mat-button color="primary" routerLink="/github-integration">
                  Go to Dashboard
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .hero-section {
      text-align: center;
      padding: 60px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 12px;
      margin-bottom: 60px;
    }

    .hero-section h1 {
      font-size: 3rem;
      margin: 0 0 20px 0;
      font-weight: 300;
    }

    .hero-subtitle {
      font-size: 1.2rem;
      margin: 0 0 40px 0;
      opacity: 0.9;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-buttons {
      display: flex;
      gap: 16px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .features-section {
      margin-bottom: 60px;
    }

    .features-section h2 {
      text-align: center;
      font-size: 2.5rem;
      margin-bottom: 40px;
      color: #333;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .feature-card {
      height: 100%;
      transition: transform 0.2s ease-in-out;
    }

    .feature-card:hover {
      transform: translateY(-4px);
    }

    .status-section {
      margin-bottom: 40px;
    }

    .status-section h2 {
      text-align: center;
      font-size: 2rem;
      margin-bottom: 24px;
      color: #333;
    }

    .status-card {
      max-width: 500px;
      margin: 0 auto;
    }

    .status-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .status-icon {
      font-size: 48px;
    }

    .status-icon.connected {
      color: #4caf50;
    }

    .status-text h3 {
      margin: 0 0 8px 0;
      color: #4caf50;
    }

    .status-text p {
      margin: 0 0 16px 0;
      color: #666;
    }

    @media (max-width: 768px) {
      .hero-section h1 {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .cta-buttons {
        flex-direction: column;
        align-items: center;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  constructor(public authService: AuthService) {}
} 