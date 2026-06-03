import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateMonitorService } from '../../../../core/services/gate-monitor.service';
import { GateSignal } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-signal-monitor',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
    templateUrl: './signal-monitor.component.html',
    styleUrls: ['./signal-monitor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalMonitorComponent implements OnInit, OnDestroy {
    private gateMonitorService = inject(GateMonitorService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    gateSignal: GateSignal | null = null;

    ngOnInit() {
        this.gateMonitorService.gateSignal$
            .pipe(takeUntil(this.destroy$))
            .subscribe(signal => {
                this.gateSignal = signal;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getSignalColor(signal: string): string {
        switch (signal) {
            case 'RED':
                return '#e53935';
            case 'GREEN':
                return '#43a047';
            case 'YELLOW':
                return '#fb8c00';
            default:
                return '#757575';
        }
    }

    getSignalClass(signal: string): string {
        return `signal-${signal.toLowerCase()}`;
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

