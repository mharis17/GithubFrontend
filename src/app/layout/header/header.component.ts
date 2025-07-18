import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

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
      <button mat-icon-button routerLink="/dashboard" matTooltip="Dashboard">
        <mat-icon>dashboard</mat-icon>
      </button>
      <button mat-icon-button routerLink="/github-integration" matTooltip="GitHub Integration">
        <mat-icon>integration_instructions</mat-icon>
      </button>
      <button mat-icon-button routerLink="/data-viewer" matTooltip="Data Viewer">
        <mat-icon>table_view</mat-icon>
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
  `]
})
export class HeaderComponent {} 