import {
    Component,
    inject,
    OnInit,
    OnDestroy,
    CUSTOM_ELEMENTS_SCHEMA,
    ChangeDetectionStrategy,
    ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { UserInfo } from '../../core/models/auth.model';
import {
    DashboardData,
    VehicleActivity,
    Transaction,
    DashboardNotification,
    EnhancedDashboardData
} from '../../core/models/dashboard.model';
import { SummaryCardsComponent } from './components/summary-cards.component';
import { ActivityTableComponent } from './components/activity-table.component';

@Component({
    selector: 'app-dashboard-enhanced',
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
        MatProgressSpinnerModule,
        MatChipsModule,
        MatMenuModule,
        MatTooltipModule,
        NgChartsModule,
        SummaryCardsComponent,
        ActivityTableComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './dashboard-enhanced-simple.component.html',
    styleUrls: ['./dashboard-enterprise.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(10px)' }),
                animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ])
        ])
    ]
})
export class DashboardEnhancedComponent implements OnInit, OnDestroy {
    private dashboardService = inject(DashboardService);
    private authService = inject(AuthService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    // Data
    dashboardData: EnhancedDashboardData | null = null;
    currentUser: UserInfo | null = null;
    currentDate = new Date();
    isLoading = true;
    error: string | null = null;
    isDarkMode = false;

    // KPI Cards
    kpiCards: any[] = []; // SummaryCard type

    // Chart Data & Options
    vehicleTrendData: ChartConfiguration['data'] = { labels: [], datasets: [] };
    weightTrendData: ChartConfiguration['data'] = { labels: [], datasets: [] };
    vehicleStatusData: ChartConfiguration['data'] = { labels: [], datasets: [] };
    monthlyStatsData: ChartConfiguration['data'] = { labels: [], datasets: [] };

    chartOptions: ChartConfiguration['options'] = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12, weight: '500' as any },
                    color: '#666'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: { size: 13, weight: 'bold' as any },
                bodyFont: { size: 12 },
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(0, 0, 0, 0.05)' }, // drawBorder removed - not supported
                ticks: { color: '#999', font: { size: 11 } }
            },
            x: {
                grid: { display: false },  // drawBorder removed - not supported
                ticks: { color: '#999', font: { size: 11 } }
            }
        }
    };

    // Table columns
    activityColumns = ['vehicleNo', 'driverName', 'entryTime', 'exitTime', 'status', 'netWeight', 'actions'];
    transactionColumns = ['transactionId', 'vehicleNumber', 'transactionDate', 'status', 'netWeight', 'actions'];

    get transactionsForDisplay(): any[] {
        if (!this.dashboardData?.transactions) return [];
        return this.dashboardData.transactions.map(t => ({
            vehicleNo: t.vehicleNumber,
            driverName: t.vehicleNumber, // Fixed from t.status which doesn't exist
            entryTime: t.transactionDate,
            exitTime: '',
            status: '', // Fixed from t.status which doesn't exist
            netWeight: t.netWeight,
            transactionDate: t.transactionDate, // Fixed from t.transactionId which doesn't exist
            vehicleNumber: t.vehicleNumber
        }));
    }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.loadDashboardData();
        this.detectDarkMode();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private loadDashboardData(): void {
        this.isLoading = true;
        this.error = null;
        this.cdr.markForCheck();

        this.dashboardService.getDashboardData()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.dashboardData = data;
                    this.initializeKpiCards();
                    this.initializeCharts();
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Failed to load dashboard data:', error);
                    this.error = 'Failed to load dashboard data. Please try again later.';
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    private initializeKpiCards(): void {
        if (!this.dashboardData?.summary) return;

        const { summary } = this.dashboardData;

        this.kpiCards = [
            {
                title: 'Total Vehicles',
                value: summary.totalVehicles,
                icon: 'directions_car',
                color: 'primary',
                unit: 'vehicles',
                trend: 12
            },
            {
                title: 'Vehicle Entries',
                value: summary.vehicleEntries,
                icon: 'login',
                color: 'success',
                unit: 'entries',
                trend: 8
            },
            {
                title: 'Vehicle Exits',
                value: summary.vehicleExits,
                icon: 'logout',
                color: 'secondary',
                unit: 'exits',
                trend: -5
            },
            {
                title: 'Pending Approvals',
                value: summary.pendingApprovals,
                icon: 'pending_actions',
                color: 'warning',
                unit: 'pending',
                trend: 3
            },
            {
                title: 'Total Weight',
                value: (summary.totalWeight / 1000).toFixed(1),
                icon: 'scale',
                color: 'danger',
                unit: 'MT',
                trend: 15
            },
            {
                title: "Today's Weight",
                value: (summary.todayWeight / 1000).toFixed(2),
                icon: 'monitor_weight',
                color: 'primary',
                unit: 'MT',
                trend: 6
            }
        ];
    }

    private initializeCharts(): void {
        if (!this.dashboardData) return;

        // Vehicle Trend Chart
        this.vehicleTrendData = {
            labels: this.dashboardData.vehicleTrend.labels,
            datasets: this.dashboardData.vehicleTrend.datasets.map(ds => ({
                ...ds,
                borderWidth: 3,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2
            }))
        };

        // Weight Trend Chart
        this.weightTrendData = {
            labels: this.dashboardData.weightTrend.labels,
            datasets: [{
                label: this.dashboardData.weightTrend.datasets[0]?.label || 'Weight (KG)',
                data: this.dashboardData.weightTrend.datasets[0]?.data || [],
                backgroundColor: 'rgba(67, 160, 71, 0.3)',
                borderColor: '#43a047',
                borderWidth: 2,
                type: 'bar'
            }]
        };

        // Vehicle Status Distribution
        this.vehicleStatusData = {
            labels: this.dashboardData.vehicleStatus.labels,
            datasets: [{
                data: this.dashboardData.vehicleStatus.data,
                backgroundColor: this.dashboardData.vehicleStatus.colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        };

        // Monthly Statistics
        this.monthlyStatsData = {
            labels: this.dashboardData.monthlyStatistics.map(m => m.month),
            datasets: [
                {
                    label: 'Entries',
                    data: this.dashboardData.monthlyStatistics.map(m => m.entries),
                    backgroundColor: 'rgba(25, 118, 210, 0.7)',
                    borderColor: '#1976d2',
                    borderWidth: 1
                },
                {
                    label: 'Exits',
                    data: this.dashboardData.monthlyStatistics.map(m => m.exits),
                    backgroundColor: 'rgba(0, 172, 193, 0.7)',
                    borderColor: '#00acc1',
                    borderWidth: 1
                }
            ]
        };
    }

    getNotificationIcon(type: string): string {
        const iconMap: { [key: string]: string } = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return iconMap[type] || 'notifications';
    }

    getTimeAgo(date: Date): string {
        const now = new Date();
        const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    }

    private detectDarkMode(): void {
        this.isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    reload(): void {
        this.loadDashboardData();
    }
}
