import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateMonitorService } from '../../../../core/services/gate-monitor.service';
import { WeighbridgeData } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-weighbridge-monitor',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule],
    templateUrl: './weighbridge-monitor.component.html',
    styleUrls: ['./weighbridge-monitor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WeighbridgeMonitorComponent implements OnInit, OnDestroy {
    private gateMonitorService = inject(GateMonitorService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    weighbridge: WeighbridgeData | null = null;

    // Maximum weight for progress bar (in KG)
    maxWeight = 100000; // 100 tons

    ngOnInit() {
        this.gateMonitorService.weighbridge$
            .pipe(takeUntil(this.destroy$))
            .subscribe(data => {
                this.weighbridge = data;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'IDLE':
                return '#757575';
            case 'WEIGHING':
                return '#fb8c00';
            case 'READY':
                return '#43a047';
            default:
                return '#757575';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'IDLE':
                return 'pause_circle_filled';
            case 'WEIGHING':
                return 'autorenew';
            case 'READY':
                return 'check_circle';
            default:
                return 'help';
        }
    }

    getProgressPercentage(): number {
        if (!this.weighbridge) return 0;
        return Math.min((this.weighbridge.currentWeight / this.maxWeight) * 100, 100);
    }

    getProgressColor(): string {
        const percentage = this.getProgressPercentage();
        if (percentage < 50) return '#43a047'; // Green
        if (percentage < 80) return '#fb8c00'; // Orange
        return '#e53935'; // Red
    }

    formatWeight(weight: number): string {
        return weight.toLocaleString('en-IN');
    }

    formatTime(timestamp: string): string {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleTimeString();
        } catch (e) {
            return timestamp;
        }
    }
}

