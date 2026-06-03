import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HeaderComponent } from '../../layouts/header/header.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { KPICardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface KPI {
    totalVehicles: number;
    vehiclesInside: number;
    vehiclesExitedToday: number;
    pendingVehicles: number;
    totalWeight: number;
    avgWeight: number;
}

@Component({
    selector: 'app-dashboard-modern',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatGridListModule,
        MatIconModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        NgChartsModule,
        HeaderComponent,
        SidebarComponent,
        KPICardComponent
    ],
    templateUrl: './dashboard-modern.component.html',
    styleUrls: ['./dashboard-modern.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardModernComponent implements OnInit, OnDestroy {
    isLoading = true;
    private destroy$ = new Subject<void>();

    kpi: KPI = {
        totalVehicles: 245,
        vehiclesInside: 13,
        vehiclesExitedToday: 76,
        pendingVehicles: 18,
        totalWeight: 250000,
        avgWeight: 2808.99
    };

    // Chart configurations
    entryExitChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12 },
                    padding: 16
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 4
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            }
        }
    };

    entryExitChartData: ChartConfiguration<'line'>['data'] = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Vehicle Entries',
                data: [45, 52, 48, 61, 55, 67, 59],
                borderColor: '#2f4fb5',
                backgroundColor: 'rgba(47, 79, 181, 0.08)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#2f4fb5',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            },
            {
                label: 'Vehicle Exits',
                data: [38, 45, 42, 55, 48, 60, 52],
                borderColor: '#4caf50',
                backgroundColor: 'rgba(76, 175, 80, 0.08)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#4caf50',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }
        ]
    };

    weightTrendChartData: ChartConfiguration<'line'>['data'] = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Daily Weight (KG)',
                data: [245000, 248000, 242000, 265000, 258000, 270000, 252000],
                borderColor: '#ff9800',
                backgroundColor: 'rgba(255, 152, 0, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#ff9800',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }
        ]
    };

    weightTrendChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: { size: 12 },
                    padding: 16
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 4,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += context.parsed.y.toLocaleString() + ' KG';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                ticks: { font: { size: 11 } },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            }
        }
    };

    constructor(
        private dashboardService: DashboardService,
        private authService: AuthService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadDashboardData(): void {
        // Simulate data loading
        setTimeout(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
        }, 800);
    }
}
