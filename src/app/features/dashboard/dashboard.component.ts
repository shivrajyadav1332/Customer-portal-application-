import { Component, inject, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { GateMonitorService } from '../../core/services/gate-monitor.service';
import { ANPRService } from '../../core/services/anpr.service';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { DashboardData, DashboardKPI } from '../../core/models/dashboard.model';
import { ChartConfiguration } from 'chart.js';

// Smart Gate Widgets
import { SignalMonitorComponent } from './smart-gate-widgets/signal-monitor/signal-monitor.component';
import { BarrierMonitorComponent } from './smart-gate-widgets/barrier-monitor/barrier-monitor.component';
import { ANPRMonitorComponent } from './smart-gate-widgets/anpr-monitor/anpr-monitor.component';
import { CameraMonitorComponent } from './smart-gate-widgets/camera-monitor/camera-monitor.component';
import { WeighbridgeMonitorComponent } from './smart-gate-widgets/weighbridge-monitor/weighbridge-monitor.component';
import { CurrentVehicleComponent } from './smart-gate-widgets/current-vehicle/current-vehicle.component';
import { LEDDisplayComponent } from './smart-gate-widgets/led-display/led-display.component';
import { ActivityLogComponent } from './smart-gate-widgets/activity-log/activity-log.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    // Smart Gate Widgets
    SignalMonitorComponent,
    BarrierMonitorComponent,
    ANPRMonitorComponent,
    CameraMonitorComponent,
    WeighbridgeMonitorComponent,
    CurrentVehicleComponent,
    LEDDisplayComponent,
    ActivityLogComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit, OnDestroy {
  private dashboardService = inject(DashboardService);
  private authService = inject(AuthService);
  private gateMonitorService = inject(GateMonitorService);
  private anprService = inject(ANPRService);
  private activityLogService = inject(ActivityLogService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  dashboardData: DashboardData | null = null;
  kpi: DashboardKPI | null = null;
  isLoading = true;

  // Charts
  entryExitChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };
  entryExitChartData: any;

  weightTrendChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true
  };
  weightTrendChartData: any;

  statusDistributionChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: true
  };
  statusDistributionChartData: any;
  monthlyStatsChartData: any;

  // Tables
  recentActivityColumns = ['vehicleNumber', 'driverName', 'entryTime', 'exitTime', 'status', 'weight'];
  weighbridgeColumns = ['vehicleNumber', 'grossWeight', 'tareWeight', 'netWeight', 'ticketNumber', 'date'];

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loadDashboardData(user.customerId);
    }

    // Start real-time monitoring for smart gate
    this.gateMonitorService.startRealTimeMonitoring();
    this.anprService.startMonitoring();
    this.activityLogService.startMonitoring();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(customerId: string): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (enhancedData) => {
          // Convert EnhancedDashboardData to DashboardData format
          const data: DashboardData = {
            kpi: {
              totalVehicles: enhancedData.summary.totalVehicles,
              vehiclesInside: enhancedData.summary.vehicleEntries - enhancedData.summary.vehicleExits,
              vehiclesExitedToday: enhancedData.summary.vehicleExits,
              pendingVehicles: enhancedData.summary.pendingApprovals,
              todaysTotalWeight: enhancedData.summary.todayWeight,
              averageVehicleWeight: enhancedData.summary.todayWeight / Math.max(enhancedData.summary.vehicleEntries, 1)
            },
            entryExitTrend: [],
            weightTrend: [],
            statusDistribution: [],
            monthlyStats: [],
            recentActivities: enhancedData.recentActivities.map(activity => ({
              id: activity.id,
              vehicleNumber: activity.vehicleNumber,
              driverName: activity.driverName,
              entryTime: new Date(activity.entryTime),
              exitTime: activity.exitTime ? new Date(activity.exitTime) : undefined,
              status: activity.status,
              netWeight: activity.netWeight
            })),
            weighbridgeTransactions: enhancedData.transactions.map(trans => ({
              id: trans.id,
              vehicleNumber: trans.vehicleNumber,
              grossWeight: trans.grossWeight,
              tareWeight: trans.tareWeight,
              netWeight: trans.netWeight,
              ticketNumber: trans.ticketNumber,
              transactionDate: new Date(trans.transactionDate)
            }))
          };

          this.dashboardData = data;
          this.kpi = data.kpi;
          this.initializeCharts(data);
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load dashboard data:', error);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  private initializeCharts(data: DashboardData): void {
    // Entry vs Exit Trend
    this.entryExitChartData = {
      labels: data.entryExitTrend.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Entries',
          data: data.entryExitTrend.map(d => d.entries),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          fill: true
        },
        {
          label: 'Exits',
          data: data.entryExitTrend.map(d => d.exits),
          borderColor: '#FF6B6B',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          fill: true
        }
      ]
    };

    // Weight Trend
    this.weightTrendChartData = {
      labels: data.weightTrend.map(d => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Total Weight (kg)',
          data: data.weightTrend.map(d => d.totalWeight),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true
        }
      ]
    };

    // Status Distribution
    this.statusDistributionChartData = {
      labels: data.statusDistribution.map(d => d.status),
      datasets: [
        {
          data: data.statusDistribution.map(d => d.count),
          backgroundColor: [
            '#FF6B6B',
            '#FFA726',
            '#FDD835',
            '#81C784',
            '#64B5F6',
            '#BA68C8'
          ]
        }
      ]
    };

    // Monthly Statistics
    if (data.monthlyStats && data.monthlyStats.length > 0) {
      const monthlyData = data.monthlyStats.slice(0, 12);
      this.monthlyStatsChartData = {
        labels: monthlyData.map(d => d.month),
        datasets: [
          {
            label: 'Total Vehicles',
            data: monthlyData.map(d => d.totalVehicles || 0),
            backgroundColor: '#1976d2'
          }
        ]
      };
    }
  }

  refreshDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.loadDashboardData(user.customerId);
    }
  }

  onPageChange(event: PageEvent): void {
    // Handle pagination
  }
}
