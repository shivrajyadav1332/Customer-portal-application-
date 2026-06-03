import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface SummaryCard {
    title: string;
    value: number | string;
    icon: string;
    color: string;
    trend?: number;
    unit?: string;
    bgColor?: string;
}

@Component({
    selector: 'app-summary-cards',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
    template: `
    <div class="summary-cards-container">
      <mat-card
        class="summary-card"
        [ngClass]="'card-' + card.color"
        *ngFor="let card of cards"
      >
        <div class="card-content">
          <div class="card-header">
            <div class="icon-container" [style.background-color]="getCardBackgroundColor(card.color)">
              <mat-icon class="card-icon" [style.color]="getCardIconColor(card.color)">
                {{ card.icon }}
              </mat-icon>
            </div>
            <div class="trend-badge" *ngIf="card.trend" [ngClass]="card.trend >= 0 ? 'positive' : 'negative'">
              <mat-icon>{{ card.trend >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              <span>{{ card.trend >= 0 ? '+' : '' }}{{ card.trend }}%</span>
            </div>
          </div>

          <div class="card-body">
            <h3 class="card-title">{{ card.title }}</h3>
            <div class="card-value">
              <span class="value">{{ card.value }}</span>
              <span class="unit" *ngIf="card.unit">{{ card.unit }}</span>
            </div>
          </div>
        </div>

        <mat-progress-bar
          class="card-progress"
          mode="determinate"
          [value]="calculateProgress(card.trend)"
        ></mat-progress-bar>
      </mat-card>
    </div>
  `,
    styles: [`
    .summary-cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .summary-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 0;
      height: 100%;

      &:hover {
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
      }

      &.card-primary {
        border-left: 4px solid #1976d2;
      }

      &.card-secondary {
        border-left: 4px solid #00acc1;
      }

      &.card-success {
        border-left: 4px solid #43a047;
      }

      &.card-warning {
        border-left: 4px solid #fb8c00;
      }

      &.card-danger {
        border-left: 4px solid #e53935;
      }
    }

    .card-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.1);
      }
    }

    .card-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .trend-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;

      &.positive {
        background-color: rgba(67, 160, 71, 0.1);
        color: #43a047;
      }

      &.negative {
        background-color: rgba(229, 57, 53, 0.1);
        color: #e53935;
      }

      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }

    .card-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .card-title {
      margin: 0;
      font-size: 13px;
      font-weight: 500;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }

    .card-value {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .value {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      line-height: 1;
    }

    .unit {
      font-size: 13px;
      color: #999;
      font-weight: 500;
    }

    .card-progress {
      height: 3px;
    }

    @media (max-width: 768px) {
      .summary-cards-container {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
      }

      .card-content {
        padding: 1rem;
      }

      .value {
        font-size: 24px;
      }
    }

    @media (max-width: 480px) {
      .summary-cards-container {
        grid-template-columns: 1fr;
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryCardsComponent {
    @Input() cards: SummaryCard[] = [];

    getCardBackgroundColor(color: string): string {
        const colorMap: { [key: string]: string } = {
            primary: 'rgba(25, 118, 210, 0.1)',
            secondary: 'rgba(0, 172, 193, 0.1)',
            success: 'rgba(67, 160, 71, 0.1)',
            warning: 'rgba(251, 140, 0, 0.1)',
            danger: 'rgba(229, 57, 53, 0.1)'
        };
        return colorMap[color] || colorMap['primary'];
    }

    getCardIconColor(color: string): string {
        const colorMap: { [key: string]: string } = {
            primary: '#1976d2',
            secondary: '#00acc1',
            success: '#43a047',
            warning: '#fb8c00',
            danger: '#e53935'
        };
        return colorMap[color] || colorMap['primary'];
    }

    calculateProgress(trend?: number): number {
        if (!trend) return 50;
        return Math.min(Math.max(50 + trend, 0), 100);
    }
}
