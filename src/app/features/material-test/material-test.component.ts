import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-material-test',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  template: `
    <div class="material-test-container">
      <h1>Angular Material Test</h1>
      <p>This page verifies that all Angular Material components are working properly.</p>

      <!-- Buttons Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Buttons</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="button-group">
            <button mat-raised-button color="primary" (click)="showMessage('Primary button clicked!')">
              <mat-icon>favorite</mat-icon>
              Primary Button
            </button>
            
            <button mat-raised-button color="accent" (click)="showMessage('Accent button clicked!')">
              <mat-icon>star</mat-icon>
              Accent Button
            </button>
            
            <button mat-raised-button color="warn" (click)="showMessage('Warn button clicked!')">
              <mat-icon>warning</mat-icon>
              Warn Button
            </button>
            
            <button mat-stroked-button (click)="showMessage('Stroked button clicked!')">
              <mat-icon>info</mat-icon>
              Stroked Button
            </button>
            
            <button mat-flat-button color="primary" (click)="showMessage('Flat button clicked!')">
              <mat-icon>check</mat-icon>
              Flat Button
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Icons Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Icons</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="icon-group">
            <mat-icon matTooltip="Home icon">home</mat-icon>
            <mat-icon matTooltip="Settings icon">settings</mat-icon>
            <mat-icon matTooltip="User icon">person</mat-icon>
            <mat-icon matTooltip="Search icon">search</mat-icon>
            <mat-icon matTooltip="Menu icon">menu</mat-icon>
            <mat-icon matTooltip="Close icon">close</mat-icon>
            <mat-icon matTooltip="Add icon">add</mat-icon>
            <mat-icon matTooltip="Edit icon">edit</mat-icon>
            <mat-icon matTooltip="Delete icon">delete</mat-icon>
            <mat-icon matTooltip="Download icon">download</mat-icon>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Chips Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Chips</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="chip-group">
            <mat-chip color="primary" selected>Primary Chip</mat-chip>
            <mat-chip color="accent" selected>Accent Chip</mat-chip>
            <mat-chip color="warn" selected>Warn Chip</mat-chip>
            <mat-chip>Default Chip</mat-chip>
            <mat-chip>
              <mat-icon matChipAvatar>person</mat-icon>
              Avatar Chip
            </mat-chip>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Progress Spinner Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Progress Spinner</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="spinner-group">
            <mat-spinner diameter="40"></mat-spinner>
            <mat-spinner diameter="60" color="accent"></mat-spinner>
            <mat-spinner diameter="80" color="warn"></mat-spinner>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Badge Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Badge</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="badge-group">
            <button mat-icon-button [matBadge]="'8'" matBadgeColor="warn">
              <mat-icon>notifications</mat-icon>
            </button>
            
            <button mat-icon-button [matBadge]="'15'" matBadgeColor="accent">
              <mat-icon>mail</mat-icon>
            </button>
            
            <button mat-icon-button [matBadge]="'99+'">
              <mat-icon>shopping_cart</mat-icon>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Color Palette Test -->
      <mat-card class="test-card">
        <mat-card-header>
          <mat-card-title>Color Palette</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="color-palette">
            <div class="color-item primary">
              <span>Primary</span>
            </div>
            <div class="color-item accent">
              <span>Accent</span>
            </div>
            <div class="color-item warn">
              <span>Warn</span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .material-test-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 8px;
    }

    p {
      text-align: center;
      color: #666;
      margin-bottom: 32px;
    }

    .test-card {
      margin-bottom: 24px;
    }

    .button-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .icon-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    .icon-group mat-icon {
      font-size: 32px;
      color: #666;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .icon-group mat-icon:hover {
      color: #2196f3;
    }

    .chip-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .spinner-group {
      display: flex;
      gap: 24px;
      align-items: center;
    }

    .badge-group {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .color-palette {
      display: flex;
      gap: 16px;
    }

    .color-item {
      flex: 1;
      height: 60px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 500;
    }

    .color-item.primary {
      background-color: #3f51b5;
    }

    .color-item.accent {
      background-color: #ff4081;
    }

    .color-item.warn {
      background-color: #f44336;
    }

    @media (max-width: 768px) {
      .button-group {
        flex-direction: column;
      }
      
      .icon-group {
        justify-content: center;
      }
      
      .color-palette {
        flex-direction: column;
      }
    }
  `]
})
export class MaterialTestComponent {
  constructor(private snackBar: MatSnackBar) {}

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
} 