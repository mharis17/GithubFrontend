import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./features/auth/callback.component').then(m => m.CallbackComponent)
  },
  {
    path: 'github-integration',
    loadComponent: () => import('./features/github-integration/github-integration.component').then(m => m.GitHubIntegrationComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'data-viewer',
    loadComponent: () => import('./features/data-viewer/data-viewer.component').then(m => m.DataViewerComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'material-test',
    loadComponent: () => import('./features/material-test/material-test.component').then(m => m.MaterialTestComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
