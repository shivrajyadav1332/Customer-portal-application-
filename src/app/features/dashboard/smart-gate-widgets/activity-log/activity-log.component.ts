import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivityLogService } from '../../../../core/services/activity-log.service';
import { GateActivity } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-activity-log',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatChipsModule],
    templateUrl: './activity-log.component.html',
    styleUrls: ['./activity-log.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivityLogComponent implements OnInit, OnDestroy {
    private activityLogService = inject(ActivityLogService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    recentActivities: GateActivity[] = [];

    ngOnInit() {
        this.activityLogService.recentActivities$
            .pipe(takeUntil(this.destroy$))
            .subscribe(activities => {
                this.recentActivities = activities;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getActivityIcon(activityType: string): string {
        switch (activityType) {
            case 'VEHICLE_ENTERED':
                return 'login';
            case 'ANPR_DETECTED':
                return 'qr_code_scanner';
            case 'BARRIER_OPENED':
                return 'arrow_upward';
            case 'BARRIER_CLOSED':
                return 'arrow_downward';
            case 'WEIGHING_STARTED':
                return 'play_circle_filled';
            case 'WEIGHING_COMPLETED':
                return 'check_circle';
            case 'VEHICLE_EXITED':
                return 'logout';
            case 'ERROR':
                return 'error';
            default:
                return 'info';
        }
    }

    getActivityColor(activityType: string): string {
        switch (activityType) {
            case 'VEHICLE_ENTERED':
                return '#43a047';
            case 'ANPR_DETECTED':
                return '#1976d2';
            case 'BARRIER_OPENED':
                return '#00acc1';
            case 'BARRIER_CLOSED':
                return '#fb8c00';
            case 'WEIGHING_STARTED':
                return '#7c4dff';
            case 'WEIGHING_COMPLETED':
                return '#43a047';
            case 'VEHICLE_EXITED':
                return '#9e9e9e';
            case 'ERROR':
                return '#e53935';
            default:
                return '#757575';
        }
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'SUCCESS':
                return 'status-success';
            case 'FAILED':
                return 'status-danger';
            case 'PENDING':
                return 'status-warning';
            default:
                return 'status-info';
        }
    }

    formatTime(timestamp: string): string {
        if (!timestamp) return 'N/A';
        try {
            const date = new Date(timestamp);
            return date.toLocaleTimeString();
        } catch (e) {
            return timestamp;
        }
    }

    getActivityDescription(activity: GateActivity): string {
        return activity.description || activity.activityType;
    }
}

