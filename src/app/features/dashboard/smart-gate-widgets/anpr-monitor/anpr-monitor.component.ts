import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ANPRService } from '../../../../core/services/anpr.service';
import { ANPRDetection } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-anpr-monitor',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatListModule, MatMenuModule],
    templateUrl: './anpr-monitor.component.html',
    styleUrls: ['./anpr-monitor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ANPRMonitorComponent implements OnInit, OnDestroy {
    private anprService = inject(ANPRService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    latestDetection: ANPRDetection | null = null;
    detectionHistory: ANPRDetection[] = [];
    showHistory = false;

    ngOnInit() {
        this.anprService.latestDetection$
            .pipe(takeUntil(this.destroy$))
            .subscribe(detection => {
                this.latestDetection = detection;
                this.cdr.markForCheck();
            });

        this.anprService.detectionHistory$
            .pipe(takeUntil(this.destroy$))
            .subscribe(history => {
                this.detectionHistory = history;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getStatusBadgeClass(status: string): string {
        switch (status) {
            case 'DETECTED':
                return 'status-info';
            case 'RECOGNIZED':
                return 'status-success';
            case 'FAILED':
                return 'status-danger';
            default:
                return 'status-info';
        }
    }

    getLocationBadgeClass(location: string): string {
        return location === 'ENTRY' ? 'location-entry' : 'location-exit';
    }

    formatTime(timestamp: string): string {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleTimeString();
        } catch (e) {
            return timestamp;
        }
    }

    getConfidencePercentage(confidence: number): number {
        return Math.round(confidence * 100);
    }

    toggleHistory() {
        this.showHistory = !this.showHistory;
        this.cdr.markForCheck();
    }
}

