import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateMonitorService } from '../../../../core/services/gate-monitor.service';
import { CurrentVehicle } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-current-vehicle',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule],
    templateUrl: './current-vehicle.component.html',
    styleUrls: ['./current-vehicle.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrentVehicleComponent implements OnInit, OnDestroy {
    private gateMonitorService = inject(GateMonitorService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    currentVehicle: CurrentVehicle | null = null;

    ngOnInit() {
        this.gateMonitorService.currentVehicle$
            .pipe(takeUntil(this.destroy$))
            .subscribe(vehicle => {
                this.currentVehicle = vehicle;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'ENTERED':
                return '#43a047';
            case 'INSIDE_PLANT':
                return '#00acc1';
            case 'EXITING':
                return '#fb8c00';
            case 'EXITED':
                return '#9e9e9e';
            default:
                return '#757575';
        }
    }

    getStatusIcon(status: string): string {
        switch (status) {
            case 'ENTERED':
                return 'login';
            case 'INSIDE_PLANT':
                return 'my_location';
            case 'EXITING':
                return 'logout';
            case 'EXITED':
                return 'check_circle';
            default:
                return 'help';
        }
    }

    getStatusText(status: string): string {
        return status.replace(/_/g, ' ');
    }

    formatTime(timestamp: string): string {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleTimeString();
        } catch (e) {
            return timestamp;
        }
    }

    formatWeight(weight: number): string {
        return weight.toLocaleString('en-IN');
    }
}

