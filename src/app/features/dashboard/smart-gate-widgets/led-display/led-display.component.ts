import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GateMonitorService } from '../../../../core/services/gate-monitor.service';
import { LEDMessage } from '../../../../core/models/smart-gate.model';

@Component({
    selector: 'app-led-display',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule
    ],
    templateUrl: './led-display.component.html',
    styleUrls: ['./led-display.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LEDDisplayComponent implements OnInit, OnDestroy {
    private gateMonitorService = inject(GateMonitorService);
    private cdr = inject(ChangeDetectorRef);
    private destroy$ = new Subject<void>();

    ledMessage: LEDMessage | null = null;
    newMessage = '';
    isUpdating = false;

    ngOnInit() {
        this.gateMonitorService.ledMessage$
            .pipe(takeUntil(this.destroy$))
            .subscribe(message => {
                this.ledMessage = message;
                this.cdr.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    updateMessage() {
        if (!this.newMessage.trim()) return;

        this.isUpdating = true;
        this.gateMonitorService.updateLEDMessage(this.newMessage)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (message) => {
                    this.ledMessage = message;
                    this.newMessage = '';
                    this.isUpdating = false;
                    this.cdr.markForCheck();
                },
                error: (error) => {
                    console.error('Error updating LED message:', error);
                    this.isUpdating = false;
                    this.cdr.markForCheck();
                }
            });
    }

    clearMessage() {
        this.newMessage = '';
        this.cdr.markForCheck();
    }

    formatTime(timestamp: string): string {
        if (!timestamp) return 'N/A';
        try {
            return new Date(timestamp).toLocaleTimeString();
        } catch (e) {
            return timestamp;
        }
    }

    getCharacterCount(): string {
        const count = this.newMessage.length;
        return `${count}/128`;
    }
}

