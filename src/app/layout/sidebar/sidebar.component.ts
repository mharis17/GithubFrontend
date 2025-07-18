import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    RouterModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav #drawer class="sidenav" fixedInViewport
          [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
          [mode]="(isHandset$ | async) ? 'over' : 'side'"
          [opened]="(isHandset$ | async) === false">
        <mat-toolbar>Menu</mat-toolbar>
        <mat-nav-list>
          <a mat-list-item routerLink="/home" routerLinkActive="active">
            <mat-icon matListItemIcon>home</mat-icon>
            <span matListItemTitle>Home</span>
          </a>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/github-integration" routerLinkActive="active">
            <mat-icon matListItemIcon>integration_instructions</mat-icon>
            <span matListItemTitle>GitHub Integration</span>
          </a>
          <a mat-list-item routerLink="/data-viewer" routerLinkActive="active">
            <mat-icon matListItemIcon>table_view</mat-icon>
            <span matListItemTitle>Data Viewer</span>
          </a>
          <a mat-list-item routerLink="/material-test" routerLinkActive="active">
            <mat-icon matListItemIcon>palette</mat-icon>
            <span matListItemTitle>Material Test</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="sidenav-content">
        <div class="content-wrapper">
          <ng-content></ng-content>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
      margin-top: 64px; /* Height of the header */
    }
    
    .sidenav {
      width: 250px;
    }
    
    .sidenav-content {
      padding: 20px;
    }
    
    .content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .active {
      background-color: rgba(0, 0, 0, 0.1);
    }
    
    mat-toolbar {
      position: relative;
      z-index: 1;
    }
  `]
})
export class SidebarComponent {
  @Input() isHandset$: any = false;
} 