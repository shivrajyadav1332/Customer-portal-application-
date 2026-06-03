import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LiveMonitoringService, SystemHealth, GateEvent } from '../../core/services/live-monitoring.service';

@Component({
  selector: 'app-live-monitoring',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, MatBadgeModule],
  templateUrl: './live-monitoring.component.html',
  styleUrls: ['./live-monitoring.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LiveMonitoringComponent implements OnInit, OnDestroy {
  private liveMonitoringService = inject(LiveMonitoringService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  systemHealth: SystemHealth | null = null;
  recentEvents: GateEvent[] = [];
  isLoading = true;

  displayedColumns = ['eventType', 'vehicleNumber', 'timestamp', 'gateNumber', 'anprStatus'];

  ngOnInit(): void {
    this.loadSystemHealth();
    this.loadRecentEvents();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSystemHealth(): void {
    this.liveMonitoringService.getSystemHealth()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.systemHealth = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading system health:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadRecentEvents(): void {
    this.liveMonitoringService.getRecentGateEvents(10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.recentEvents = data;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading events:', err)
      });
  }

  getStatusColor(status: boolean): string {
    return status ? 'success' : 'error';
  }

  getStatusLabel(status: boolean): string {
    return status ? 'Online' : 'Offline';
  }
}
