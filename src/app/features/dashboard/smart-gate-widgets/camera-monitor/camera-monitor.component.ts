import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateMonitorService } from '../../../../core/services/gate-monitor.service';
import { CameraStatus } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-camera-monitor',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule],
    templateUrl: './camera-monitor.component.html',
    styleUrls: ['./camera-monitor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CameraMonitorComponent implements OnInit, OnDestroy {
    private gateMonitorService = inject(GateMonitorService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    cameras: CameraStatus[] = [];
    isRefreshing = false;

    ngOnInit() {
        this.gateMonitorService.cameras$
            .pipe(takeUntil(this.destroy$))
            .subscribe(cameras => {
                this.cameras = cameras;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'ONLINE':
                return '#43a047';
            case 'OFFLINE':
                return '#e53935';
            case 'ERROR':
                return '#fb8c00';
            default:
                return '#757575';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'ONLINE':
                return 'check_circle';
            case 'OFFLINE':
                return 'cancel';
            case 'ERROR':
                return 'warning';
            default:
                return 'help';
        }
    }

    refreshSnapshot(cameraId: string) {
        this.isRefreshing = true;
        this.gateMonitorService.captureSnapshot(cameraId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.isRefreshing = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error capturing snapshot:', error);
                    this.isRefreshing = false;
                    this.cdr.markForCheck();
                }
            });
    }

    formatTime(timestamp: string | undefined): string {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleTimeString();
        } catch (e) {
            return timestamp;
        }
    }

    getPlaceholderImage(): string {
        return 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23eceff1%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%22200%22 y=%22150%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23bdbdbd%22 font-size=%2220%22%3E%3C/text%3E%3C/svg%3E';
    }
}

