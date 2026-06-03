import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateMonitorService } from '../../../../core/services/gate-monitor.service';
import { BarrierStatus } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-barrier-monitor',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
    templateUrl: './barrier-monitor.component.html',
    styleUrls: ['./barrier-monitor.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BarrierMonitorComponent implements OnInit, OnDestroy {
    private gateMonitorService = inject(GateMonitorService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    barrierStatus: BarrierStatus | null = null;
    isLoading = false;

    ngOnInit() {
        this.gateMonitorService.barrierStatus$
            .pipe(takeUntil(this.destroy$))
            .subscribe(status => {
                this.barrierStatus = status;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getBarrierColor(status: string): string {
        switch (status) {
            case 'OPEN':
            case 'OPENING':
                return '#43a047';
            case 'CLOSED':
            case 'CLOSING':
                return '#e53935';
            default:
                return '#757575';
        }
    }

    getBarrierIcon(status: string): string {
        switch (status) {
            case 'OPEN':
            case 'OPENING':
                return 'arrow_upward';
            case 'CLOSED':
            case 'CLOSING':
                return 'arrow_downward';
            default:
                return 'block';
        }
    }

    openEntryBarrier() {
        this.isLoading = true;
        this.gateMonitorService.openEntryBarrier()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (status) => {
                    this.barrierStatus = status;
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error opening entry barrier:', error);
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    closeEntryBarrier() {
        this.isLoading = true;
        this.gateMonitorService.closeEntryBarrier()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (status) => {
                    this.barrierStatus = status;
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error closing entry barrier:', error);
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    openExitBarrier() {
        this.isLoading = true;
        this.gateMonitorService.openExitBarrier()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (status) => {
                    this.barrierStatus = status;
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error opening exit barrier:', error);
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    closeExitBarrier() {
        this.isLoading = true;
        this.gateMonitorService.closeExitBarrier()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (status) => {
                    this.barrierStatus = status;
                    this.isLoading = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error closing exit barrier:', error);
                    this.isLoading = false;
                    this.cdr.markForCheck();
                }
            });
    }

    isOpening(status: string): boolean {
        return status === 'OPENING' || status === 'CLOSING';
    }
}

