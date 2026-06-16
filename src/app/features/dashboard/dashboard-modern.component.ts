import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, Observable } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { KPICardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ActivityTableComponent } from './components/activity-table.component';
import { DashboardService, LiveTruckStatus } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { SignalRService, ScadaApiService } from '../../core/services';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { VehicleActivity } from '../../core/models/dashboard.model';

@Component({
    selector: 'app-dashboard-modern',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NgChartsModule,
        KPICardComponent,
        ActivityTableComponent
    ],
    templateUrl: './dashboard-modern.component.html',
    styleUrls: ['./dashboard-modern.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardModernComponent implements OnInit, OnDestroy {
    isLoading = true;
    private destroy$ = new Subject<void>();

    kpi = {
        totalVehicles: 0,
        vehiclesInside: 0,
        vehiclesExitedToday: 0,
        pendingVehicles: 0,
        todaysTotalWeight: 0
    };

    liveStatus: LiveTruckStatus = {
        currentTruck: '—',
        currentWeight: 0,
        entryBarrier: 'CLOSED',
        exitBarrier: 'CLOSED',
        vehicleStatus: 'Idle'
    };

    // Real-Time SCADA Journey State
    journey = {
        step: 0, // 0 = Idle, 1 = Vehicle Detected, 2 = ANPR Verified, 3 = Entry Barrier Opened, 4 = Truck On Weighbridge, 5 = Weight Captured, 6 = Exit Barrier Opened, 7 = Truck Exited
        truckNumber: '—',
        arrivalTime: null as Date | null,
        anprStatus: 'Pending',
        entryBarrierStatus: 'CLOSED',
        entrySignal: 'RED',
        currentLocation: '—',
        workflowStatus: 'Idle',
        grossWeight: 0,
        weightTimestamp: null as Date | null,
        weightCaptureStatus: 'Pending',
        currentAnnouncement: 'No Announcement Active',
        lastAnnouncementTime: null as Date | null,
        exitBarrierStatus: 'CLOSED',
        exitSignal: 'RED',
        exitTime: null as Date | null,
        journeyCompleted: false
    };

    timelineSteps = [
        { label: 'Vehicle Detected', icon: 'sensors', stepNum: 1 },
        { label: 'ANPR Verified', icon: 'photo_camera', stepNum: 2 },
        { label: 'Entry Barrier Opened', icon: 'door_sliding', stepNum: 3 },
        { label: 'Truck On Weighbridge', icon: 'scale', stepNum: 4 },
        { label: 'Weight Captured', icon: 'monitor_weight', stepNum: 5 },
        { label: 'Exit Barrier Opened', icon: 'door_sliding', stepNum: 6 },
        { label: 'Truck Exited', icon: 'output', stepNum: 7 }
    ];

    simPlate = 'YCC-8742';
    simWeight = 28667;
    isSimulating = false;

    recentActivities: VehicleActivity[] = [];
    activityTableData: any[] = [];

    entryExitChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
    };

    entryExitChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: []
    };

    weightTrendChartData: ChartConfiguration<'line'>['data'] = {
        labels: [],
        datasets: []
    };

    weightTrendChartOptions: ChartConfiguration<'line'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } }
    };

    statusPieData: ChartConfiguration<'pie'>['data'] = {
        labels: ['Inside', 'Exited', 'Pending'],
        datasets: [{ data: [0, 0, 0], backgroundColor: ['#2f4fb5', '#4caf50', '#ff9800'] }]
    };

    statusPieOptions: ChartConfiguration<'pie'>['options'] = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
    };

    constructor(
        private dashboardService: DashboardService,
        private authService: AuthService,
        private signalRService: SignalRService,
        private scadaApiService: ScadaApiService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.loadDashboardData();
        
        // Start SignalR Hub connection
        this.signalRService.startConnection()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => console.log('SignalR connection active on modern dashboard'),
                error: (err) => console.error('SignalR failed on modern dashboard', err)
            });

        // Listen for real-time SCADA journey updates
        this.signalRService.journey$
            .pipe(takeUntil(this.destroy$))
            .subscribe((update) => {
                if (update) {
                    this.handleJourneyEvent(update.eventName, update.payload);
                }
            });

        // Pull initial live status
        this.dashboardService.getLiveStatus()
            .pipe(takeUntil(this.destroy$))
            .subscribe((status) => {
                this.liveStatus = status;
                // Sync to journey if no active journey is currently running
                if (this.journey.step === 0 && status.currentTruck && status.currentTruck !== '—') {
                    this.journey.truckNumber = status.currentTruck;
                    this.journey.grossWeight = status.currentWeight;
                    this.journey.entryBarrierStatus = status.entryBarrier;
                    this.journey.exitBarrierStatus = status.exitBarrier;
                    this.journey.workflowStatus = status.vehicleStatus;
                }
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    get customerName(): string {
        return this.authService.getCurrentUser()?.customerName || 'Customer';
    }

    get todayWeightTons(): string {
        return (this.kpi.todaysTotalWeight / 1000).toFixed(1);
    }

    handleJourneyEvent(eventName: string, payload: any): void {
        console.log('Dashboard processing SCADA event:', eventName, payload);
        const timestamp = new Date();

        switch (eventName) {
            case 'VehicleDetected':
                this.journey.step = 1;
                this.journey.truckNumber = payload?.plate || payload?.plateNumber || payload?.PlateNumber || this.journey.truckNumber;
                this.journey.arrivalTime = payload?.time ? new Date(payload.time) : timestamp;
                this.journey.workflowStatus = 'Vehicle Detected';
                this.journey.currentLocation = 'Entry Gate';
                this.journey.journeyCompleted = false;
                this.journey.exitTime = null;
                
                // Reset subsequent metrics for the new truck journey
                this.journey.anprStatus = 'Pending';
                this.journey.entryBarrierStatus = 'CLOSED';
                this.journey.entrySignal = 'RED';
                this.journey.grossWeight = 0;
                this.journey.weightTimestamp = null;
                this.journey.weightCaptureStatus = 'Pending';
                this.journey.exitBarrierStatus = 'CLOSED';
                this.journey.exitSignal = 'RED';
                break;

            case 'ANPRScanned':
                if (this.journey.step < 2) this.journey.step = 2;
                this.journey.truckNumber = payload?.plate || payload?.plateNumber || payload?.PlateNumber || this.journey.truckNumber;
                this.journey.anprStatus = 'ANPR Verification Completed';
                this.journey.workflowStatus = 'ANPR Verification Completed';
                break;

            case 'EntryBarrierOpened':
                if (this.journey.step < 3) this.journey.step = 3;
                this.journey.entryBarrierStatus = 'Open';
                this.journey.entrySignal = 'Green';
                this.journey.workflowStatus = 'Vehicle Authorized';
                break;

            case 'TruckEnteredWeighbridge':
                if (this.journey.step < 4) this.journey.step = 4;
                this.journey.currentLocation = 'Weighbridge';
                this.journey.workflowStatus = 'Truck On Weighbridge';
                this.journey.entryBarrierStatus = 'CLOSED';
                this.journey.entrySignal = 'RED';
                break;

            case 'WeightCaptured':
                if (this.journey.step < 5) this.journey.step = 5;
                this.journey.grossWeight = payload?.weight || payload?.grossWeight || 28667;
                this.journey.weightTimestamp = payload?.timestamp ? new Date(payload.timestamp) : timestamp;
                this.journey.weightCaptureStatus = 'Captured';
                this.journey.workflowStatus = 'Weight Captured';
                break;

            case 'ExitBarrierOpened':
                if (this.journey.step < 6) this.journey.step = 6;
                this.journey.exitBarrierStatus = 'Open';
                this.journey.exitSignal = 'Green';
                this.journey.workflowStatus = 'Exit Approved';
                this.journey.currentLocation = 'Exit Gate';
                break;

            case 'TruckExited':
            case 'ProcessCompleted':
                if (this.journey.step < 7) this.journey.step = 7;
                this.journey.workflowStatus = 'Journey Completed';
                this.journey.exitTime = payload?.exitTime ? new Date(payload.exitTime) : timestamp;
                this.journey.journeyCompleted = true;
                this.journey.exitBarrierStatus = 'CLOSED';
                this.journey.exitSignal = 'RED';
                this.journey.currentLocation = 'Plant Exit';
                break;

            case 'AudioAnnouncement':
                this.journey.currentAnnouncement = payload?.announcement || 'No Announcement';
                this.journey.lastAnnouncementTime = payload?.timestamp ? new Date(payload.timestamp) : timestamp;
                break;
        }

        // Propagate updates to legacy liveStatus to support any existing widget mappings
        this.liveStatus.currentTruck = this.journey.truckNumber;
        this.liveStatus.currentWeight = this.journey.grossWeight;
        this.liveStatus.entryBarrier = this.journey.entryBarrierStatus.toUpperCase();
        this.liveStatus.exitBarrier = this.journey.exitBarrierStatus.toUpperCase();
        this.liveStatus.vehicleStatus = this.journey.workflowStatus;

        this.cdr.markForCheck();
    }

    // Trigger full simulated truck journey using the custom API endpoints
    simulateVehicleJourney(): void {
        if (this.isSimulating) return;
        this.isSimulating = true;
        const plate = this.simPlate || 'YCC-8742';
        const weight = this.simWeight || 28667;

        console.log('Simulating SCADA API vehicle journey for plate:', plate);

        // Step 1: Vehicle Detected API Call
        this.scadaApiService.postVehicleArrival(plate).pipe(
            switchMap(() => {
                this.handleJourneyEvent('VehicleDetected', { plate });
                
                // Step 2: ANPR verification occurs immediately
                this.handleJourneyEvent('ANPRScanned', { plate });
                
                // Step 3: Entry Signal & Barrier update
                return this.scadaApiService.postBarrierEntryStatus('Open');
            }),
            switchMap(() => {
                this.handleJourneyEvent('EntryBarrierOpened', {});
                
                // Driving delay
                return new Observable<void>(obs => {
                    setTimeout(() => {
                        obs.next();
                        obs.complete();
                    }, 2000);
                });
            }),
            switchMap(() => {
                // Step 4: Weighbridge entry
                return this.scadaApiService.postWeighbridgeEntry(plate);
            }),
            switchMap(() => {
                this.handleJourneyEvent('TruckEnteredWeighbridge', {});
                
                // Step 6 (Pre-Weighing announcement)
                return this.scadaApiService.postAudioAnnouncement('Weighing in progress. Stay on weighbridge.');
            }),
            switchMap((annResp: any) => {
                this.handleJourneyEvent('AudioAnnouncement', annResp);
                
                // Weight calculation delay
                return new Observable<void>(obs => {
                    setTimeout(() => {
                        obs.next();
                        obs.complete();
                    }, 2000);
                });
            }),
            switchMap(() => {
                // Step 5: Weighbridge capture weight
                return this.scadaApiService.postWeighbridgeCaptureWeight(weight, plate);
            }),
            switchMap(() => {
                this.handleJourneyEvent('WeightCaptured', { weight });
                
                // Post-weighing announcement
                return this.scadaApiService.postAudioAnnouncement(`Weight captured: ${weight} KG. Please proceed to exit.`);
            }),
            switchMap((annResp: any) => {
                this.handleJourneyEvent('AudioAnnouncement', annResp);
                
                // Step 7: Exit barrier open
                return this.scadaApiService.postBarrierExitStatus('Open');
            }),
            switchMap(() => {
                this.handleJourneyEvent('ExitBarrierOpened', {});
                
                // Driving off scale delay
                return new Observable<void>(obs => {
                    setTimeout(() => {
                        obs.next();
                        obs.complete();
                    }, 2000);
                });
            }),
            switchMap(() => {
                // Step 8: Vehicle exit completed
                return this.scadaApiService.postVehicleExit(plate);
            })
        ).subscribe({
            next: () => {
                this.handleJourneyEvent('TruckExited', {});
                this.isSimulating = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('SCADA Simulation failed', err);
                this.isSimulating = false;
                this.cdr.markForCheck();
            }
        });
    }

    private loadDashboardData(): void {
        this.dashboardService.getDashboardData()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (data) => {
                    this.kpi = {
                        totalVehicles: data.summary.totalVehicles,
                        vehiclesInside: data.vehicleStatus?.data?.[0] ?? 0,
                        vehiclesExitedToday: data.vehicleStatus?.data?.[1] ?? data.summary.vehicleExits,
                        pendingVehicles: data.vehicleStatus?.data?.[2] ?? data.summary.pendingApprovals,
                        todaysTotalWeight: data.summary.todayWeight
                    };

                    if (data.vehicleStatus) {
                        this.statusPieData = {
                            labels: data.vehicleStatus.labels,
                            datasets: [{
                                data: data.vehicleStatus.data,
                                backgroundColor: data.vehicleStatus.colors
                            }]
                        };
                    }

                    if (data.vehicleTrend) {
                        this.entryExitChartData = data.vehicleTrend as ChartConfiguration<'line'>['data'];
                    }
                    if (data.weightTrend) {
                        this.weightTrendChartData = data.weightTrend as ChartConfiguration<'line'>['data'];
                    }

                    this.recentActivities = data.recentActivities;
                    this.activityTableData = data.recentActivities.map((a) => ({
                        ...a,
                        vehicleNo: a.vehicleNumber,
                        entryTime: this.formatTime(a.entryTime),
                        exitTime: a.exitTime ? this.formatTime(a.exitTime) : undefined,
                        netWeight: a.netWeight ? `${a.netWeight} KG` : '—'
                    }));

                    const live = (data as any).liveStatus;
                    if (live) {
                        this.liveStatus = live;
                    }

                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    private formatTime(value: Date | string): string {
        const date = new Date(value);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}
