import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { VehicleActivity, Transaction } from '../../../core/models/dashboard.model';

@Component({
    selector: 'app-activity-table',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule,
        MatChipsModule,
        MatMenuModule,
        MatTooltipModule
    ],
    template: `
    <mat-card class="activity-card">
      <div class="card-header">
        <div>
          <h3 class="card-title">{{ title }}</h3>
          <p class="card-subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-actions">
          <button mat-icon-button [matMenuTriggerFor]="menu" matTooltip="More options">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item>
              <mat-icon>download</mat-icon>
              <span>Export CSV</span>
            </button>
            <button mat-menu-item>
              <mat-icon>print</mat-icon>
              <span>Print</span>
            </button>
            <button mat-menu-item>
              <mat-icon>refresh</mat-icon>
              <span>Refresh</span>
            </button>
          </mat-menu>
        </div>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="displayData" class="activity-table">
          <!-- Vehicle No Column -->
          <ng-container matColumnDef="vehicleNo">
            <th mat-header-cell *matHeaderCellDef>Vehicle No</th>
            <td mat-cell *matCellDef="let row" class="cell-vehicle">
              <strong>{{ row.vehicleNo }}</strong>
            </td>
          </ng-container>

          <!-- Driver Name Column -->
          <ng-container matColumnDef="driverName">
            <th mat-header-cell *matHeaderCellDef>Driver Name</th>
            <td mat-cell *matCellDef="let row">{{ row.driverName }}</td>
          </ng-container>

          <!-- Entry Time Column -->
          <ng-container matColumnDef="entryTime">
            <th mat-header-cell *matHeaderCellDef>Entry Time</th>
            <td mat-cell *matCellDef="let row" class="cell-time">
              <mat-icon class="icon-small">schedule</mat-icon>
              {{ row.entryTime }}
            </td>
          </ng-container>

          <!-- Exit Time Column -->
          <ng-container matColumnDef="exitTime">
            <th mat-header-cell *matHeaderCellDef>Exit Time</th>
            <td mat-cell *matCellDef="let row" class="cell-time">
              <span *ngIf="row.exitTime">
                <mat-icon class="icon-small">schedule</mat-icon>
                {{ row.exitTime }}
              </span>
              <span *ngIf="!row.exitTime" class="pending">In Progress</span>
            </td>
          </ng-container>

          <!-- Status Column -->
          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let row">
              <mat-chip [ngClass]="'status-' + row.status.toLowerCase()">
                {{ row.status }}
              </mat-chip>
            </td>
          </ng-container>

          <!-- Net Weight Column -->
          <ng-container matColumnDef="netWeight">
            <th mat-header-cell *matHeaderCellDef>Net Weight</th>
            <td mat-cell *matCellDef="let row">
              <strong *ngIf="row.netWeight">{{ row.netWeight }}</strong>
              <span *ngIf="!row.netWeight" class="pending">—</span>
            </td>
          </ng-container>

          <!-- Actions Column -->
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let row">
              <button mat-icon-button matTooltip="View Details">
                <mat-icon>visibility</mat-icon>
              </button>
              <button mat-icon-button matTooltip="Edit">
                <mat-icon>edit</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns;"></tr>
        </table>
      </div>

      <mat-paginator
        [pageSizeOptions]="[5, 10, 25]"
        [pageSize]="5"
        showFirstLastButtons
      ></mat-paginator>
    </mat-card>
  `,
    styles: [`
    .activity-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 12px;
      border: 1px solid #e0e0e0;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e8e8e8;
      background: linear-gradient(135deg, #fafbfc 0%, #ffffff 100%);
    }

    .card-title {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }

    .card-subtitle {
      margin: 0.25rem 0 0 0;
      font-size: 12px;
      color: #999;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .activity-table {
      width: 100%;
      border-collapse: collapse;

      th {
        background-color: #f5f5f5;
        font-weight: 600;
        font-size: 12px;
        color: #666;
        padding: 12px 16px;
        text-align: left;
        border-bottom: 2px solid #e0e0e0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        padding: 12px 16px;
        border-bottom: 1px solid #f0f0f0;
        font-size: 13px;
        color: #333;
      }

      tbody tr {
        transition: background-color 0.2s ease;

        &:hover {
          background-color: #f9f9f9;
        }
      }
    }

    .cell-vehicle {
      color: #1976d2;
      font-weight: 600;
    }

    .cell-time {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .icon-small {
      font-size: 14px;
      width: 14px;
      height: 14px;
      opacity: 0.6;
    }

    .pending {
      color: #999;
      font-style: italic;
    }

    mat-chip {
      font-size: 11px;
      padding: 4px 12px;
      font-weight: 600;

      &.status-completed {
        background-color: rgba(67, 160, 71, 0.15) !important;
        color: #43a047 !important;
      }

      &.status-in\ progress {
        background-color: rgba(25, 118, 210, 0.15) !important;
        color: #1976d2 !important;
      }

      &.status-pending {
        background-color: rgba(251, 140, 0, 0.15) !important;
        color: #fb8c00 !important;
      }

      &.status-cancelled {
        background-color: rgba(229, 57, 53, 0.15) !important;
        color: #e53935 !important;
      }

      &.status-success {
        background-color: rgba(67, 160, 71, 0.15) !important;
        color: #43a047 !important;
      }

      &.status-failed {
        background-color: rgba(229, 57, 53, 0.15) !important;
        color: #e53935 !important;
      }
    }

    ::ng-deep .mat-paginator {
      background-color: #f5f5f5;
      border-top: 1px solid #e0e0e0;
    }

    @media (max-width: 768px) {
      .table-container {
        font-size: 12px;
      }

      .card-header {
        padding: 1rem;
      }

      th, td {
        padding: 8px !important;
      }
    }
  `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityTableComponent {
    @Input() title = 'Recent Vehicle Activity';
    @Input() subtitle = 'Latest vehicle entries and exits';
    @Input() data: VehicleActivity[] = [];
    @Input() columns = ['vehicleNo', 'driverName', 'entryTime', 'exitTime', 'status', 'netWeight', 'actions'];

    get displayData(): VehicleActivity[] {
        return this.data;
    }
}
