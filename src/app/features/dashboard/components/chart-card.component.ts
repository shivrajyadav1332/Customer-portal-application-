import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, NgChartsModule],
  template: `
    <mat-card class="chart-card">
      <div class="chart-header">
        <div class="chart-title-container">
          <h3 class="chart-title">{{ title }}</h3>
          <p class="chart-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        <mat-icon class="chart-icon" *ngIf="icon">{{ icon }}</mat-icon>
      </div>

      <div class="chart-container">
        <div *ngIf="chartData && chartData.labels && chartData.labels.length > 0" class="chart-placeholder">
          <div class="chart-info">
            <p><strong>{{ title }}</strong></p>
            <p style="font-size: 12px; color: #999;">{{ chartData.labels.length }} data points</p>
          </div>
          <!-- Chart rendering would go here -->
        </div>
        <div *ngIf="!chartData || !chartData.labels" class="empty-chart">
          <p>No data available</p>
        </div>
      </div>

      <div class="chart-footer" *ngIf="footerText">
        <small>{{ footerText }}</small>
      </div>
    </mat-card>
  `,
  styles: [`
    .chart-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      height: 100%;
      display: flex;
      flex-direction: column;

      &:hover {
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        transform: translateY(-4px);
      }
    }

    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e8e8e8;
    }

    .chart-title-container {
      flex: 1;
    }

    .chart-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .chart-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .chart-icon {
      color: #1976d2;
      opacity: 0.7;
    }

    .chart-container {
      flex: 1;
      position: relative;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem 0;
    }

    .chart-canvas {
      max-height: 300px;
    }

    .chart-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e8e8e8;
      color: #999;
      text-align: center;
    }

    @media (max-width: 768px) {
      .chart-card {
        padding: 1rem;
      }

      .chart-container {
        min-height: 250px;
      }

      .chart-canvas {
        max-height: 250px;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartCardComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() chartType: 'line' | 'bar' | 'pie' | 'doughnut' | 'polarArea' = 'line';
  @Input() chartData: ChartConfiguration['data'] = { labels: [], datasets: [] };
  @Input() chartOptions: ChartConfiguration['options'];
  @Input() footerText?: string;

  constructor() {
    this.chartOptions = this.getDefaultOptions();
  }

  private getDefaultOptions(): ChartConfiguration['options'] {
    return {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
              weight: 500 as any
            },
            color: '#666'
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            size: 13,
            weight: 'bold'
          },
          bodyFont: {
            size: 12
          },
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
            // drawBorder: false removed - not supported in Chart.js v4+
          },
          ticks: {
            color: '#999',
            font: {
              size: 11
            }
          }
        },
        x: {
          grid: {
            display: false
            // drawBorder: false removed - not supported in Chart.js v4+
          },
          ticks: {
            color: '#999',
            font: {
              size: 11
            }
          }
        }
      }
    };
  }
}
